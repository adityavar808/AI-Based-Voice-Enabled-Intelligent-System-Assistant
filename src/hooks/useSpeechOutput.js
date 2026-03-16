import { useCallback, useRef, useEffect } from "react";

/**
 * useSpeechOutput
 * Handles Text-to-Speech for Zenix responses using the Web Speech API.
 * Returns a `speak(text, onEnd)` function and a `cancelSpeech()` function.
 */
export function useSpeechOutput({ onSpeakStart, onSpeakEnd } = {}) {
  const utteranceRef = useRef(null);
  const isSpeakingRef = useRef(false);

  // Cancel any ongoing speech
  const cancelSpeech = useCallback(() => {
    if (typeof window === "undefined") return;
    window.speechSynthesis?.cancel();
    isSpeakingRef.current = false;
    utteranceRef.current = null;
  }, []);

  // Speak a given text string
  const speak = useCallback(
    (text, onEnd) => {
      if (typeof window === "undefined") return;
      if (!window.speechSynthesis) {
        console.warn("Web Speech API (TTS) not supported in this browser.");
        if (onEnd) onEnd();
        return;
      }

      // Cancel any in-progress speech first
      cancelSpeech();

      const utterance = new SpeechSynthesisUtterance(text);
      utteranceRef.current = utterance;

      // Voice configuration — pick a natural English voice if available
      const voices = window.speechSynthesis.getVoices();
      const preferred = voices.find(
        (v) =>
          v.lang.startsWith("en") &&
          (v.name.toLowerCase().includes("google") ||
            v.name.toLowerCase().includes("natural") ||
            v.name.toLowerCase().includes("samantha") ||
            v.name.toLowerCase().includes("daniel"))
      );
      if (preferred) utterance.voice = preferred;

      utterance.lang = "en-US";
      utterance.rate = 0.90; // Slightly slower than default — more "AI assistant" feel
      utterance.pitch = 0.7; // Slightly lower pitch for Zenix's character
      utterance.volume = 1.0;

      utterance.onstart = () => {
        isSpeakingRef.current = true;
        if (onSpeakStart) onSpeakStart();
      };

      utterance.onend = () => {
        isSpeakingRef.current = false;
        utteranceRef.current = null;
        if (onSpeakEnd) onSpeakEnd();
        if (onEnd) onEnd();
      };

      utterance.onerror = (event) => {
        // "interrupted" fires when we cancel deliberately — not a real error
        if (event.error === "interrupted" || event.error === "canceled") return;
        console.warn("TTS error:", event.error);
        isSpeakingRef.current = false;
        utteranceRef.current = null;
        if (onSpeakEnd) onSpeakEnd();
        if (onEnd) onEnd();
      };

      // Chrome bug: voices may not be loaded yet on first call
      // Small delay ensures voices are ready
      setTimeout(() => {
        window.speechSynthesis.speak(utterance);
      }, 50);
    },
    [cancelSpeech, onSpeakStart, onSpeakEnd],
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cancelSpeech();
    };
  }, [cancelSpeech]);

  return { speak, cancelSpeech, isSpeakingRef };
}

import { useCallback, useEffect, useRef } from "react";

const SETTINGS_STORAGE_KEY = "zenix-settings";
const VOICE_KEYWORDS = {
  male: [
    "male",
    "man",
    "david",
    "daniel",
    "alex",
    "aaron",
    "fred",
    "mark",
    "guy",
    "james",
  ],
  female: [
    "female",
    "woman",
    "samantha",
    "zira",
    "aria",
    "ava",
    "eva",
    "victoria",
    "karen",
    "serena",
    "susan",
  ],
};

function getStoredVoiceProfile() {
  if (typeof window === "undefined") return "auto";

  try {
    const savedSettings = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (!savedSettings) return "auto";

    const parsed = JSON.parse(savedSettings);
    return parsed?.voice?.profile || "auto";
  } catch {
    return "auto";
  }
}

function scoreVoice(voice, preferredProfile) {
  const name = voice.name.toLowerCase();
  let score = 0;

  if (voice.lang?.toLowerCase().startsWith("en")) score += 4;
  if (voice.default) score += 2;

  if (
    name.includes("google") ||
    name.includes("natural") ||
    name.includes("neural") ||
    name.includes("enhanced")
  ) {
    score += 2;
  }

  if (preferredProfile !== "auto") {
    if (
      VOICE_KEYWORDS[preferredProfile].some((keyword) => name.includes(keyword))
    ) {
      score += 8;
    }

    const oppositeProfile = preferredProfile === "male" ? "female" : "male";
    if (
      VOICE_KEYWORDS[oppositeProfile].some((keyword) => name.includes(keyword))
    ) {
      score -= 3;
    }
  }

  return score;
}

function getPreferredVoice(voices, preferredProfile) {
  if (!voices.length) return null;

  const rankedVoices = [...voices].sort(
    (a, b) => scoreVoice(b, preferredProfile) - scoreVoice(a, preferredProfile)
  );

  return rankedVoices[0] || null;
}

function getVoiceTuning(preferredProfile) {
  switch (preferredProfile) {
    case "male":
      return { rate: 0.9, pitch: 0.75 };
    case "female":
      return { rate: 0.95, pitch: 1.05 };
    default:
      return { rate: 0.9, pitch: 0.9 };
  }
}

/**
 * useSpeechOutput
 * Handles Text-to-Speech for Zenix responses using the Web Speech API.
 * Returns a `speak(text, onEnd)` function and a `cancelSpeech()` function.
 */
export function useSpeechOutput({ onSpeakStart, onSpeakEnd } = {}) {
  const utteranceRef = useRef(null);
  const isSpeakingRef = useRef(false);

  const cancelSpeech = useCallback(() => {
    if (typeof window === "undefined") return;
    window.speechSynthesis?.cancel();
    isSpeakingRef.current = false;
    utteranceRef.current = null;
  }, []);

  const speak = useCallback(
    (text, onEnd) => {
      if (typeof window === "undefined") return;
      if (!window.speechSynthesis) {
        console.warn("Web Speech API (TTS) not supported in this browser.");
        if (onEnd) onEnd();
        return;
      }

      cancelSpeech();

      const utterance = new SpeechSynthesisUtterance(text);
      const preferredProfile = getStoredVoiceProfile();
      const { rate, pitch } = getVoiceTuning(preferredProfile);

      utteranceRef.current = utterance;
      utterance.lang = "en-US";
      utterance.rate = rate;
      utterance.pitch = pitch;
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
        if (event.error === "interrupted" || event.error === "canceled") return;
        console.warn("TTS error:", event.error);
        isSpeakingRef.current = false;
        utteranceRef.current = null;
        if (onSpeakEnd) onSpeakEnd();
        if (onEnd) onEnd();
      };

      const startSpeech = () => {
        if (utteranceRef.current !== utterance) return;

        const preferredVoice = getPreferredVoice(
          window.speechSynthesis.getVoices(),
          preferredProfile
        );

        if (preferredVoice) {
          utterance.voice = preferredVoice;
          utterance.lang = preferredVoice.lang || "en-US";
        }

        window.speechSynthesis.speak(utterance);
      };

      const voices = window.speechSynthesis.getVoices();
      if (!voices.length) {
        let hasStarted = false;

        const safeStart = () => {
          if (hasStarted) return;
          hasStarted = true;
          startSpeech();
        };

        const handleVoicesChanged = () => {
          window.speechSynthesis.removeEventListener?.(
            "voiceschanged",
            handleVoicesChanged
          );
          safeStart();
        };

        window.speechSynthesis.addEventListener?.(
          "voiceschanged",
          handleVoicesChanged
        );

        setTimeout(() => {
          window.speechSynthesis.removeEventListener?.(
            "voiceschanged",
            handleVoicesChanged
          );
          safeStart();
        }, 150);

        return;
      }

      setTimeout(startSpeech, 50);
    },
    [cancelSpeech, onSpeakEnd, onSpeakStart]
  );

  useEffect(() => {
    return () => {
      cancelSpeech();
    };
  }, [cancelSpeech]);

  return { speak, cancelSpeech, isSpeakingRef };
}

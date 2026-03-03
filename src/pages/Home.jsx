import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import CinematicBoot from "../components/CinematicBoot";
import StartScreen from "../components/StartScreen";
import ConversationBox from "../components/ConversationBox";

const BOOT_DURATION_MS = 6500;

const Home = ({
  start,
  setStart,
  openSettings,
  isOrbReady,
  setIsOrbReady,
}) => {
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [audioError, setAudioError] = useState(null);
  const [audioLevel, setAudioLevel] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const audioRef = useRef(null);
  const [bootComplete, setBootComplete] = useState(false);
  const [conversationStatus, setConversationStatus] = useState("idle");
  const recognitionRef = useRef(null);   // holds the SpeechRecognition instance
  const isPlayingRef   = useRef(false);  // true while Zenix audio is playing

  // ─── Speech Recognition setup ──────────────────────────────────────────────
  const startListening = useCallback(() => {
    // Don't start mic if Zenix is currently speaking — this is the echo fix
    if (isPlayingRef.current) return;

    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;

    // Stop any existing instance cleanly first
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch (_) {}
      recognitionRef.current = null;
    }

    const recognition = new SR();
    recognition.lang            = "en-US";
    recognition.continuous      = false;   // single utterance per session
    recognition.interimResults  = true;    // stream words as they come in
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      // Double-check: if audio started while we were initialising, abort
      if (isPlayingRef.current) {
        recognition.abort();
        return;
      }
      setConversationStatus("listening");
    };

    recognition.onresult = (event) => {
      // If Zenix started speaking mid-recognition, abort and ignore result
      if (isPlayingRef.current) {
        recognition.abort();
        return;
      }

      const transcript = Array.from(event.results)
        .map((r) => r[0].transcript)
        .join("");

      const isFinal = event.results[event.results.length - 1].isFinal;

      if (isFinal && transcript.trim()) {
        setConversationStatus("thinking");
        // TODO: pass `transcript` to your AI backend here
        // For now, simulate a response after a short delay
        setTimeout(() => {
          if (!isPlayingRef.current) {
            setConversationStatus("responding");
            setTimeout(() => {
              if (!isPlayingRef.current) {
                setConversationStatus("listening");
                startListening(); // re-start mic after response
              }
            }, 3000);
          }
        }, 1500);
      }
    };

    recognition.onerror = (event) => {
      // Ignore aborted errors (we abort intentionally when audio plays)
      if (event.error === "aborted" || event.error === "no-speech") return;
      console.warn("🎤 Speech recognition error:", event.error);
    };

    recognition.onend = () => {
      // Auto-restart listening if Zenix is not speaking and we're still active
      if (!isPlayingRef.current && bootComplete && start) {
        // Small gap before restarting to avoid rapid-fire restarts
        setTimeout(() => {
          if (!isPlayingRef.current) startListening();
        }, 300);
      }
    };

    recognitionRef.current = recognition;
    try {
      recognition.start();
    } catch (err) {
      console.warn("🎤 Could not start recognition:", err);
    }
  }, [bootComplete, start]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try { recognitionRef.current.abort(); } catch (_) {}
      recognitionRef.current = null;
    }
  }, []);

  // ─── Helper: play audio with mic-mute guard ─────────────────────────────────
  const playAudioSafely = useCallback((onEnded) => {
    if (!audioRef.current) return;

    // 1. Stop mic BEFORE playing audio — prevents echo entirely
    stopListening();
    isPlayingRef.current = true;
    setIsSpeaking(true);
    setConversationStatus("responding");

    audioRef.current.play()
      .then(() => {
        audioRef.current.onended = () => {
          isPlayingRef.current = false;
          setIsSpeaking(false);
          setConversationStatus("listening");
          // 2. Re-start mic only AFTER audio fully ends
          if (onEnded) onEnded();
          setTimeout(() => startListening(), 400); // small buffer before mic opens
        };
      })
      .catch((err) => {
        console.error("❌ Audio error:", err);
        setAudioError("Click anywhere to enable audio");
        isPlayingRef.current = false;
        setIsSpeaking(false);
        setConversationStatus("listening");
        setTimeout(() => startListening(), 400);
      });
  }, [stopListening, startListening]);

  // ─── Boot sequence ──────────────────────────────────────────────────────────
useEffect(() => {
  if (!start) {
    setIsOrbReady(false);
    return;
  }

  const timers = [];

  const t = (fn, ms) => {
    const id = setTimeout(fn, ms);
    timers.push(id);
  };

  // Boot complete → start listening
  t(() => {
    setBootComplete(true);
    setConversationStatus("listening");
    startListening();
  }, BOOT_DURATION_MS);

  // Play intro audio safely
  t(() => {
    if (audioEnabled) {
      playAudioSafely();
    }
  }, BOOT_DURATION_MS + 300);

  return () => {
    timers.forEach(clearTimeout);
    stopListening();
  };
}, [start, audioEnabled, startListening, playAudioSafely, stopListening, setIsOrbReady]);
  
  // ─── Cleanup on exit ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!start) {
      stopListening();
      isPlayingRef.current = false;
      setBootComplete(false);
      setConversationStatus("idle");
      setIsSpeaking(false);
    }
  }, [start, stopListening]);

  return (
    <div className="w-full h-full relative">
      <audio ref={audioRef} src="/zenix_voice.mp3" preload="auto" />

      {/* Settings Button */}
      <button
        onClick={isOrbReady ? openSettings : undefined}
        disabled={!isOrbReady}
        className={`absolute top-6 right-6 z-50 text-xs px-4 py-2 rounded-md transition-all ${
          isOrbReady
            ? "bg-blue-500/20 text-blue-400 shadow-[0_0_10px_#3b82f6] hover:bg-blue-500/30"
            : "bg-white/10 text-white/40 cursor-not-allowed"
        }`}
      >
        Settings
      </button>

      <AnimatePresence mode="wait">
        {!start ? (
          <StartScreen setStart={setStart} audioError={audioError} />
        ) : (
          <motion.div
            key="boot"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              width: "100%",
              height: "100vh",
              background: "#000",
              overflow: "hidden",
              display: "flex",
              flexDirection: bootComplete ? "row" : "column",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <CinematicBoot
              isSpeaking={isSpeaking}
              audioLevel={audioLevel}
              audioRef={audioRef}
              setIsOrbReady={setIsOrbReady}
            />
            {/* ── Left: Orb ── */}
            <motion.div
              animate={
                bootComplete
                  ? { flex: "0 0 55%", width: "55%" }
                  : { flex: "1 1 100%", width: "100%" }
              }
              transition={{ type: "spring", stiffness: 50, damping: 18 }}
              style={{
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                overflow: "hidden",
                position: "relative",
              }}
            >
              <CinematicBoot
                isSpeaking={isSpeaking}
                audioLevel={audioLevel}
                audioRef={audioRef}
              />
            </motion.div>

            {/* ── Right: ConversationBox ── */}
            <AnimatePresence>
              {bootComplete && (
                <motion.div
                  key="conv-box"
                  initial={{ x: 120, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: 120, opacity: 0 }}
                  transition={{
                    type: "spring",
                    stiffness: 80,
                    damping: 18,
                    opacity: { duration: 0.3 },
                  }}
                  style={{
                    flex: "0 0 45%",
                    width: "45%",
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "24px 24px 24px 8px",
                    boxSizing: "border-box",
                  }}
                >
                  <ConversationBox
                    status={conversationStatus}
                    setStatus={setConversationStatus}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Home;

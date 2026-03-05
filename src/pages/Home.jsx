import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import CinematicBoot from "../components/CinematicBoot";
import StartScreen from "../components/StartScreen";
import ConversationBox from "../components/ConversationBox";
import HistoryBox from "../components/HistoryBox";

const BOOT_DURATION_MS = 6500;

const Home = ({ start, setStart, openSettings, isOrbReady, setIsOrbReady }) => {
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [audioError, setAudioError] = useState(null);
  const [audioLevel, setAudioLevel] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [bootComplete, setBootComplete] = useState(false);
  const [conversationStatus, setConversationStatus] = useState("idle");

  const audioRef = useRef(null);
  const recognitionRef = useRef(null);
  const isPlayingRef = useRef(false);

  const startListening = useCallback(() => {
    if (isPlayingRef.current) return;
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (_) {}
      recognitionRef.current = null;
    }
    const recognition = new SR();
    recognition.lang = "en-US";
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;
    recognition.onstart = () => {
      if (isPlayingRef.current) {
        recognition.abort();
        return;
      }
      setConversationStatus("listening");
    };
    recognition.onresult = (event) => {
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
        setTimeout(() => {
          if (!isPlayingRef.current) {
            setConversationStatus("responding");
            setTimeout(() => {
              if (!isPlayingRef.current) {
                setConversationStatus("listening");
                startListening();
              }
            }, 3000);
          }
        }, 1500);
      }
    };
    recognition.onerror = (event) => {
      if (event.error === "aborted" || event.error === "no-speech") return;
      console.warn("Speech recognition error:", event.error);
    };
    recognition.onend = () => {
      if (!isPlayingRef.current && bootComplete && start) {
        setTimeout(() => {
          if (!isPlayingRef.current) startListening();
        }, 300);
      }
    };
    recognitionRef.current = recognition;
    try {
      recognition.start();
    } catch (err) {
      console.warn("Could not start recognition:", err);
    }
  }, [bootComplete, start]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch (_) {}
      recognitionRef.current = null;
    }
  }, []);

  const playAudioSafely = useCallback(
    (onEnded) => {
      if (!audioRef.current) return;
      stopListening();
      isPlayingRef.current = true;
      setIsSpeaking(true);
      setConversationStatus("responding");
      audioRef.current
        .play()
        .then(() => {
          audioRef.current.onended = () => {
            isPlayingRef.current = false;
            setIsSpeaking(false);
            setConversationStatus("listening");
            if (onEnded) onEnded();
            setTimeout(() => startListening(), 400);
          };
        })
        .catch((err) => {
          console.error("Audio error:", err);
          setAudioError("Click anywhere to enable audio");
          isPlayingRef.current = false;
          setIsSpeaking(false);
          setConversationStatus("listening");
          setTimeout(() => startListening(), 400);
        });
    },
    [stopListening, startListening],
  );

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
    t(() => {
      setBootComplete(true);
      setConversationStatus("listening");
      setIsOrbReady(true);
      startListening();
    }, BOOT_DURATION_MS);
    t(() => {
      if (audioEnabled) playAudioSafely();
    }, BOOT_DURATION_MS + 300);
    return () => {
      timers.forEach(clearTimeout);
      stopListening();
    };
  }, [
    start,
    audioEnabled,
    startListening,
    playAudioSafely,
    stopListening,
    setIsOrbReady,
  ]);

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
    <div
      style={{
        width: "100%",
        height: "100vh",
        background: "#000",
        position: "relative",
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <audio ref={audioRef} src="/zenix_voice.mp3" preload="auto" />
      {/* TOP RIGHT CONTROLS */}
      <div
        style={{
          position: "absolute",
          top: "9px",
          right: "18px",
          zIndex: 100,
          display: "flex",
          alignItems: "center",
          gap: "14px",
        }}
      >
        {/* USER BUTTON */}
        <button
          style={{
            width: "38px",
            height: "38px",
            borderRadius: "50%",
            border: "1px solid rgba(96,165,250,0.25)",
            background: "rgba(10,20,35,0.4)",
            backdropFilter: "blur(12px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            boxShadow: "0 0 12px rgba(59,130,246,0.35)",
            transition: "all 0.25s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = "0 0 22px rgba(59,130,246,0.6)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = "0 0 12px rgba(59,130,246,0.35)";
          }}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#60a5fa"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ filter: "drop-shadow(0 0 6px #3b82f6)" }}
          >
            <path d="M20 21a8 8 0 0 0-16 0" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        </button>

        {/* SETTINGS BUTTON */}
        <button
          onClick={isOrbReady ? openSettings : undefined}
          disabled={!isOrbReady}
          style={{
            width: "38px",
            height: "38px",
            borderRadius: "50%",
            border: "1px solid rgba(96,165,250,0.25)",
            background: "rgba(10,20,35,0.4)",
            backdropFilter: "blur(12px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: isOrbReady ? "pointer" : "not-allowed",
            boxShadow: isOrbReady ? "0 0 12px rgba(59,130,246,0.35)" : "none",
            transition: "all 0.25s ease",
            opacity: isOrbReady ? 1 : 0.4,
          }}
          onMouseEnter={(e) => {
            if (!isOrbReady) return;
            e.currentTarget.style.boxShadow = "0 0 22px rgba(59,130,246,0.6)";
          }}
          onMouseLeave={(e) => {
            if (!isOrbReady) return;
            e.currentTarget.style.boxShadow = "0 0 12px rgba(59,130,246,0.35)";
          }}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#60a5fa"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ filter: "drop-shadow(0 0 6px #3b82f6)" }}
          >
            <circle cx="12" cy="12" r="3" />
            <path
              d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 
               2 0 1 1-2.83 2.83l-.06-.06a1.65 
               1.65 0 0 0-1.82-.33 1.65 
               1.65 0 0 0-1 1.51V21a2 
               2 0 1 1-4 0v-.09a1.65 
               1.65 0 0 0-1-1.51 1.65 
               1.65 0 0 0-1.82.33l-.06.06a2 
               2 0 1 1-2.83-2.83l.06-.06a1.65 
               1.65 0 0 0 .33-1.82 1.65 
               1.65 0 0 0-1.51-1H3a2 
               2 0 1 1 0-4h.09a1.65 
               1.65 0 0 0 1.51-1 1.65 
               1.65 0 0 0-.33-1.82l-.06-.06a2 
               2 0 1 1 2.83-2.83l.06.06a1.65 
               1.65 0 0 0 1.82.33h0A1.65 
               1.65 0 0 0 9 3.09V3a2 
               2 0 1 1 4 0v.09a1.65 
               1.65 0 0 0 1 1.51 1.65 
               1.65 0 0 0 1.82-.33l.06-.06a2 
               2 0 1 1 2.83 2.83l-.06.06a1.65 
               1.65 0 0 0-.33 1.82v0A1.65 
               1.65 0 0 0 20.91 11H21a2 
               2 0 1 1 0 4h-.09a1.65 
               1.65 0 0 0-1.51 1z"
            />
          </svg>
        </button>
      </div>

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
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "0 40px",
              boxSizing: "border-box",
            }}
          >
            {/* LEFT PANEL */}
            <AnimatePresence>
              {bootComplete && (
                <motion.div
                  initial={{ x: -80, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -80, opacity: 0 }}
                  transition={{ duration: 0.5 }}
                  style={{
                    width: "300px",
                    height: "85vh",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                  }}
                >
                  <HistoryBox />
                </motion.div>
              )}
            </AnimatePresence>

            {/* CENTER ORB */}
            <div
              style={{
                flex: 1,
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <CinematicBoot
                isSpeaking={isSpeaking}
                audioLevel={audioLevel}
                audioRef={audioRef}
              />
            </div>

            {/* RIGHT PANEL */}
            <AnimatePresence>
              {bootComplete && (
                <motion.div
                  initial={{ x: 80, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: 80, opacity: 0 }}
                  transition={{ duration: 0.5 }}
                  style={{
                    width: "370px",
                    height: "85vh",
                    display: "flex",
                    flexDirection: "column",
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

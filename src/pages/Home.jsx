import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import CinematicBoot from "../components/CinematicBoot";
import StartScreen from "../components/StartScreen";
import ConversationBox from "../components/ConversationBox";
import HistoryBox from "../components/HistoryBox";

const MotionDiv = motion.div;
const BOOT_DURATION_MS = 6500;

const Home = ({ start, setStart, openSettings, isOrbReady, setIsOrbReady }) => {
  const audioEnabled = true;
  const audioLevel = 0;

  const [audioError, setAudioError] = useState(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [bootComplete, setBootComplete] = useState(false);
  const [conversationStatus, setConversationStatus] = useState("idle");

  const audioRef = useRef(null);
  const recognitionRef = useRef(null);
  const isPlayingRef = useRef(false);
  const bootCompleteRef = useRef(false);
  const startRef = useRef(start);
  const suppressRestartRef = useRef(false);
  const timersRef = useRef([]);
  const startListeningRef = useRef(() => {});

  useEffect(() => {
    bootCompleteRef.current = bootComplete;
  }, [bootComplete]);

  useEffect(() => {
    startRef.current = start;
  }, [start]);

  const clearTimers = useCallback(() => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  }, []);

  const schedule = useCallback((fn, delay) => {
    const timerId = setTimeout(() => {
      timersRef.current = timersRef.current.filter((id) => id !== timerId);
      fn();
    }, delay);

    timersRef.current.push(timerId);
    return timerId;
  }, []);

  const stopListening = useCallback(() => {
    const recognition = recognitionRef.current;

    if (!recognition) return;

    recognition.onstart = null;
    recognition.onresult = null;
    recognition.onerror = null;
    recognition.onend = null;

    try {
      recognition.abort();
    } catch (error) {
      console.warn("Could not abort recognition:", error);
    }

    recognitionRef.current = null;
  }, []);

  const queueListeningRestart = useCallback(
    (delay = 300) => {
      schedule(() => {
        if (!isPlayingRef.current && bootCompleteRef.current && startRef.current) {
          startListeningRef.current();
        }
      }, delay);
    },
    [schedule],
  );

  const startListening = useCallback(() => {
    if (isPlayingRef.current || typeof window === "undefined") return;

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) return;

    stopListening();

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;

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
        .map((result) => result[0].transcript)
        .join("")
        .trim();
      const isFinal = event.results[event.results.length - 1]?.isFinal;

      if (!isFinal || !transcript) return;

      clearTimers();
      suppressRestartRef.current = true;
      setConversationStatus("thinking");

      schedule(() => {
        if (isPlayingRef.current || !startRef.current) return;

        setConversationStatus("responding");

        schedule(() => {
          if (isPlayingRef.current || !startRef.current) return;

          suppressRestartRef.current = false;
          setConversationStatus("listening");
          queueListeningRestart(0);
        }, 3000);
      }, 1500);
    };

    recognition.onerror = (event) => {
      if (event.error === "aborted" || event.error === "no-speech") return;
      console.warn("Speech recognition error:", event.error);
    };

    recognition.onend = () => {
      if (recognitionRef.current === recognition) {
        recognitionRef.current = null;
      }

      if (
        !suppressRestartRef.current &&
        !isPlayingRef.current &&
        bootCompleteRef.current &&
        startRef.current
      ) {
        queueListeningRestart(300);
      }
    };

    try {
      recognition.start();
    } catch (error) {
      console.warn("Could not start recognition:", error);
    }
  }, [clearTimers, queueListeningRestart, schedule, stopListening]);

  useEffect(() => {
    startListeningRef.current = startListening;
  }, [startListening]);

  const playAudioSafely = useCallback(
    (onEnded) => {
      if (!audioRef.current) return;

      clearTimers();
      suppressRestartRef.current = true;
      stopListening();
      isPlayingRef.current = true;
      setIsSpeaking(true);
      setConversationStatus("responding");
      setAudioError(null);

      audioRef.current
        .play()
        .then(() => {
          audioRef.current.onended = () => {
            isPlayingRef.current = false;
            suppressRestartRef.current = false;
            setIsSpeaking(false);
            setConversationStatus("listening");

            if (onEnded) {
              onEnded();
            }

            queueListeningRestart(400);
          };
        })
        .catch((error) => {
          console.error("Audio error:", error);
          setAudioError("Click anywhere to enable audio");
          isPlayingRef.current = false;
          suppressRestartRef.current = false;
          setIsSpeaking(false);
          setConversationStatus("listening");
          queueListeningRestart(400);
        });
    },
    [clearTimers, queueListeningRestart, stopListening],
  );

  useEffect(() => {
    if (!start) {
      setIsOrbReady(false);
      return;
    }

    const audioElement = audioRef.current;

    clearTimers();

    schedule(() => {
      setBootComplete(true);
      setConversationStatus("listening");
      setIsOrbReady(true);
      startListeningRef.current();
    }, BOOT_DURATION_MS);

    schedule(() => {
      if (audioEnabled) {
        playAudioSafely();
      }
    }, BOOT_DURATION_MS + 300);

    return () => {
      clearTimers();
      stopListening();

      if (audioElement) {
        audioElement.onended = null;
      }
    };
  }, [audioEnabled, clearTimers, playAudioSafely, start, stopListening, setIsOrbReady, schedule]);

  useEffect(() => {
    if (start) return;

    const audioElement = audioRef.current;

    clearTimers();
    stopListening();
    suppressRestartRef.current = false;
    isPlayingRef.current = false;

    const resetTimer = setTimeout(() => {
      setBootComplete(false);
      setConversationStatus("idle");
      setIsSpeaking(false);

      if (audioElement) {
        audioElement.onended = null;
      }
    }, 0);

    return () => clearTimeout(resetTimer);
  }, [clearTimers, start, stopListening]);

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

      <div
        style={{
          position: "absolute",
          top: "18px",
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 100,
          display: "flex",
          alignItems: "center",
          gap: "14px",
        }}
      >
        {bootComplete && (
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
            onMouseEnter={(event) => {
              if (!isOrbReady) return;
              event.currentTarget.style.boxShadow = "0 0 22px rgba(59,130,246,0.6)";
            }}
            onMouseLeave={(event) => {
              if (!isOrbReady) return;
              event.currentTarget.style.boxShadow = "0 0 12px rgba(59,130,246,0.35)";
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
        )}
      </div>

      <AnimatePresence mode="wait">
        {!start ? (
          <StartScreen setStart={setStart} audioError={audioError} />
        ) : (
          <MotionDiv
            key="boot"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "stretch",
              justifyContent: "space-between",
              padding: "0 40px",
              boxSizing: "border-box",
            }}
          >
            <AnimatePresence>
              {bootComplete && (
                <MotionDiv
                  initial={{ x: -80, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -80, opacity: 0 }}
                  transition={{ duration: 0.5 }}
                  style={{
                    width: "300px",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                  }}
                >
                  <HistoryBox />
                </MotionDiv>
              )}
            </AnimatePresence>

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

            <AnimatePresence>
              {bootComplete && (
                <MotionDiv
                  initial={{ x: 80, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: 80, opacity: 0 }}
                  transition={{ duration: 0.5 }}
                  style={{
                    width: "370px",
                    height: "95%",
                    paddingTop: "25px",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <ConversationBox
                    status={conversationStatus}
                    setStatus={setConversationStatus}
                  />
                </MotionDiv>
              )}
            </AnimatePresence>
          </MotionDiv>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Home;

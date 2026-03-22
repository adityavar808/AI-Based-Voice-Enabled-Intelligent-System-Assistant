import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import CinematicBoot from "../components/CinematicBoot";
import StartScreen from "../components/StartScreen";
import ConversationBox from "../components/ConversationBox";
import HistoryBox from "../components/HistoryBox";
import { useSpeechOutput } from "../hooks/useSpeechOutput";
import { nanoid } from "nanoid";

const MotionDiv = motion.div;
const BOOT_DURATION_MS = 6500;

function getChatEndpoint() {
  const base = import.meta.env.VITE_API_URL?.trim();
  if (!base) return "/api/chat";
  try {
    return new URL("/api/chat", base).toString();
  } catch {
    return "/api/chat";
  }
}

function now() {
  return new Date().toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
}

const Home = ({ start, setStart, openSettings, isOrbReady, setIsOrbReady }) => {
  const audioEnabled = true;
  const audioLevel = 0;

  const [audioError, setAudioError] = useState(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [bootComplete, setBootComplete] = useState(false);
  const [showConversation, setShowConversation] = useState(false);
  const [conversationStatus, setConversationStatus] = useState("idle");
  const [conversationEntries, setConversationEntries] = useState([]);

  const audioRef = useRef(null);
  const recognitionRef = useRef(null);
  const isPlayingRef = useRef(false);
  const isTtsActiveRef = useRef(false);
  const bootCompleteRef = useRef(false);
  const startRef = useRef(start);
  const suppressRestartRef = useRef(false);
  const timersRef = useRef([]);
  const startListeningRef = useRef(() => {});
  const chatEndpoint = getChatEndpoint();

  const conversationEntriesRef = useRef([]);
  const isFetchingRef = useRef(false);
  const hasFinalResultRef = useRef(false);

  useEffect(() => {
    conversationEntriesRef.current = conversationEntries;
  }, [conversationEntries]);

  // ── TTS hook ──────────────────────────────────────────────────────────────
  const { speak, cancelSpeech } = useSpeechOutput({
    onSpeakStart: () => {
      stopListening(); // 🔥 stop mic immediately
      isTtsActiveRef.current = true;
      setIsSpeaking(true);
      setConversationStatus("responding");
    },
    onSpeakEnd: () => {
      isTtsActiveRef.current = false;
      setIsSpeaking(false);
      if (bootCompleteRef.current && startRef.current) {
        setConversationStatus("listening");
        setTimeout(() => {
          startListeningRef.current();
        }, 400);
      }
    },
  });

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
    const id = setTimeout(() => {
      timersRef.current = timersRef.current.filter((t) => t !== id);
      fn();
    }, delay);
    timersRef.current.push(id);
    return id;
  }, []);

  // Hard-stop recognition — detaches ALL handlers before abort
  // so onend can never fire and trigger an unwanted restart
  const stopListening = useCallback(() => {
    const r = recognitionRef.current;
    if (!r) return;
    try {
      if (r.stop) {
        r.stop();
      } else {
        r.abort();
      }
    } catch {}
    recognitionRef.current = null;
  }, []);

  const queueListeningRestart = useCallback(
    (delay = 300) => {
      schedule(() => {
        if (
          !isPlayingRef.current &&
          !isTtsActiveRef.current &&
          !isFetchingRef.current &&
          bootCompleteRef.current &&
          startRef.current
        ) {
          startListeningRef.current();
        }
      }, delay);
    },
    [schedule],
  );

  // ── Backend call — mutex guarded ──────────────────────────────────────────
  const sendToBackend = useCallback(
    async (message) => {
      if (isFetchingRef.current) return;
      isFetchingRef.current = true;

      try {
        const history = conversationEntriesRef.current
          .filter((e) => !e.interim)
          .map((e) => ({
            role: e.type === "user" ? "user" : "assistant",
            content: e.text,
          }));

        const res = await fetch(chatEndpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message, history }),
        });

        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        const reply = data.reply;

        setConversationEntries((prev) => [
          ...prev,
          {
            id: nanoid(),
            type: "assistant",
            text: reply,
            time: now(),
          },
        ]);

        suppressRestartRef.current = true;
        speak(reply, () => {
          suppressRestartRef.current = false;
          isFetchingRef.current = false;
        });
      } catch {
        const fallback = "Backend unavailable. Please start the API server.";

        setConversationEntries((prev) => [
          ...prev,
          {
            id: nanoid(),
            type: "assistant",
            text: fallback,
            time: now(),
          },
        ]);
        suppressRestartRef.current = true;
        speak(fallback, () => {
          suppressRestartRef.current = false;
          isFetchingRef.current = false;
        });
      }
    },
    [chatEndpoint, speak],
  );

  // ── STT (free browser mode using Web Speech API) ─────────────────────────
  const startListening = useCallback(() => {
    if (isPlayingRef.current || isTtsActiveRef.current) return;
    if (recognitionRef.current) return;
    if (typeof window === "undefined") return;

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setAudioError("Speech Recognition not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;

    recognition.lang = "en-US";
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    let interimEntry = null;
    let silenceTimer = null;
    let latestTranscript = "";
    let committed = false;

    hasFinalResultRef.current = false;

    const killAndCommit = () => {
      if (hasFinalResultRef.current) return;
      hasFinalResultRef.current = true;

      if (committed) return;
      committed = true;

      if (silenceTimer) {
        clearTimeout(silenceTimer);
        silenceTimer = null;
      }

      recognition.onend = null;
      recognition.onresult = null;
      recognition.onerror = null;

      try {
        recognition.abort();
      } catch {}

      recognitionRef.current = null;

      if (!latestTranscript) return;

      clearTimers();
      suppressRestartRef.current = true;

      setConversationEntries((prev) => {
        const committedAt = now();
        let replacedInterim = false;

        const nextEntries = prev.reduce((acc, entry) => {
          if (entry.type === "user" && entry.interim) {
            if (!replacedInterim) {
              replacedInterim = true;
              acc.push({
                ...entry,
                text: latestTranscript,
                time: committedAt,
                interim: false,
              });
            }
            return acc;
          }

          acc.push(entry);
          return acc;
        }, []);

        if (replacedInterim) {
          return nextEntries;
        }

        const lastEntry = nextEntries[nextEntries.length - 1];
        if (
          lastEntry?.type === "user" &&
          !lastEntry.interim &&
          lastEntry.text === latestTranscript
        ) {
          return nextEntries;
        }

        return [
          ...nextEntries,
          {
            id: nanoid(),
            type: "user",
            text: latestTranscript,
            time: committedAt,
          },
        ];
      });

      interimEntry = null;
      setConversationStatus("thinking");
      sendToBackend(latestTranscript);
    };

    recognition.onresult = (event) => {
      if (isPlayingRef.current || isTtsActiveRef.current) return;

      let fullTranscript = "";
      for (let i = 0; i < event.results.length; i++) {
        fullTranscript += event.results[i][0].transcript;
      }
      fullTranscript = fullTranscript.trim();

      const lastResult = event.results[event.results.length - 1];
      const isFinal = lastResult?.isFinal;

      if (!fullTranscript) return;

      latestTranscript = fullTranscript;

      setConversationEntries((prev) => {
        const existingInterim =
          prev.find((entry) => entry.type === "user" && entry.interim) ||
          interimEntry;

        if (existingInterim) {
          interimEntry = existingInterim;
          return prev.map((e) =>
            e.id === existingInterim.id ? { ...e, text: fullTranscript } : e,
          );
        }

        const entry = {
          id: nanoid(),
          type: "user",
          text: fullTranscript,
          time: now(),
          interim: true,
        };

        interimEntry = entry;
        return [...prev, entry];
      });

      if (isFinal) {
        if (silenceTimer) clearTimeout(silenceTimer);
        silenceTimer = setTimeout(killAndCommit, 800);
      }
    };

    recognition.onerror = (event) => {
      if (silenceTimer) {
        clearTimeout(silenceTimer);
        silenceTimer = null;
      }
      if (event.error === "aborted" || event.error === "no-speech") return;
      console.warn("STT error:", event.error);
    };

    recognition.onend = () => {
      if (recognitionRef.current === recognition) recognitionRef.current = null;
      if (silenceTimer) return;

      if (interimEntry && !committed) {
        setConversationEntries((prev) =>
          prev.filter((e) => e.id !== interimEntry.id),
        );
        interimEntry = null;
      }

      if (
        !committed &&
        !suppressRestartRef.current &&
        !isPlayingRef.current &&
        !isTtsActiveRef.current &&
        bootCompleteRef.current &&
        startRef.current
      ) {
        queueListeningRestart(300);
      }
    };

    try {
      recognition.start();
    } catch (e) {
      console.warn("Could not start recognition:", e);
    }
  }, [clearTimers, queueListeningRestart, sendToBackend, stopListening]);

  useEffect(() => {
    startListeningRef.current = startListening;
  }, [startListening]);

  // ── Intro audio ───────────────────────────────────────────────────────────
  const playAudioSafely = useCallback(
    (onEnded) => {
      if (!audioRef.current) return;
      clearTimers();
      suppressRestartRef.current = true;
      stopListening();
      cancelSpeech();
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
            setShowConversation(true);
            if (onEnded) onEnded();
            queueListeningRestart(400);
          };
        })
        .catch((err) => {
          console.error("Audio error:", err);
          setAudioError("Click anywhere to enable audio");
          isPlayingRef.current = false;
          suppressRestartRef.current = false;
          setIsSpeaking(false);
          setConversationStatus("listening");
          setShowConversation(true);
          queueListeningRestart(400);
        });
    },
    [cancelSpeech, clearTimers, queueListeningRestart, stopListening],
  );

  // ── Boot sequence ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!start) {
      setIsOrbReady(false);
      return;
    }
    const el = audioRef.current;
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
      } else {
        setShowConversation(true);
      }
    }, BOOT_DURATION_MS + 300);

    return () => {
      clearTimers();
      stopListening();
      cancelSpeech();
      if (el) el.onended = null;
    };
  }, [
    audioEnabled,
    cancelSpeech,
    clearTimers,
    playAudioSafely,
    schedule,
    setIsOrbReady,
    start,
    stopListening,
  ]);

  // ── Reset on exit ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (start) return;
    const el = audioRef.current;
    clearTimers();
    stopListening();
    cancelSpeech();
    suppressRestartRef.current = false;
    isPlayingRef.current = false;
    isTtsActiveRef.current = false;
    isFetchingRef.current = false;
    hasFinalResultRef.current = false;

    const t = setTimeout(() => {
      setBootComplete(false);
      setShowConversation(false);
      setConversationStatus("idle");
      setConversationEntries([]);
      setIsSpeaking(false);
      if (el) el.onended = null;
    }, 0);
    return () => clearTimeout(t);
  }, [cancelSpeech, clearTimers, start, stopListening]);

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
            onMouseEnter={(e) => {
              if (!isOrbReady) return;
              e.currentTarget.style.boxShadow = "0 0 22px rgba(59,130,246,0.6)";
            }}
            onMouseLeave={(e) => {
              if (!isOrbReady) return;
              e.currentTarget.style.boxShadow =
                "0 0 12px rgba(59,130,246,0.35)";
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
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33h0A1.65 1.65 0 0 0 9 3.09V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v0A1.65 1.65 0 0 0 20.91 11H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
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
                setIsOrbReady={setIsOrbReady}
              />
            </div>

            <AnimatePresence>
              {showConversation && (
                <MotionDiv
                  initial={{
                    x: 120,
                    opacity: 0,
                    scale: 0.92,
                    filter: "blur(18px) brightness(2.5)",
                  }}
                  animate={{
                    x: 0,
                    opacity: 1,
                    scale: 1,
                    filter: "blur(0px) brightness(1)",
                  }}
                  exit={{
                    x: 120,
                    opacity: 0,
                    scale: 0.92,
                    filter: "blur(12px) brightness(0)",
                  }}
                  transition={{
                    duration: 0.9,
                    ease: [0.16, 1, 0.3, 1],
                    opacity: { duration: 0.6 },
                    filter: { duration: 0.7 },
                    scale: { duration: 0.7 },
                  }}
                  style={{
                    width: "370px",
                    height: "95%",
                    paddingTop: "25px",
                    display: "flex",
                    flexDirection: "column",
                    position: "relative",
                  }}
                >
                  <MotionDiv
                    initial={{ opacity: 1, top: "0%" }}
                    animate={{ opacity: 0, top: "100%" }}
                    transition={{ duration: 0.7, ease: "easeIn", delay: 0.1 }}
                    style={{
                      position: "absolute",
                      left: 0,
                      width: "100%",
                      height: "60px",
                      background:
                        "linear-gradient(180deg, transparent 0%, rgba(96,165,250,0.35) 50%, transparent 100%)",
                      pointerEvents: "none",
                      zIndex: 10,
                      borderRadius: "16px",
                    }}
                  />
                  <MotionDiv
                    initial={{ opacity: 0.9 }}
                    animate={{ opacity: 0 }}
                    transition={{ duration: 0.8, delay: 0.1 }}
                    style={{
                      position: "absolute",
                      inset: 0,
                      borderRadius: "16px",
                      boxShadow:
                        "0 0 40px 8px rgba(96,165,250,0.5), inset 0 0 30px rgba(96,165,250,0.15)",
                      pointerEvents: "none",
                      zIndex: 10,
                    }}
                  />
                  <ConversationBox
                    status={conversationStatus}
                    setStatus={setConversationStatus}
                    entries={conversationEntries}
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

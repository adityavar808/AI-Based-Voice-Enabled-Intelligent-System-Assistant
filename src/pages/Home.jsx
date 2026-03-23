import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import CinematicBoot from "../components/CinematicBoot";
import StartScreen from "../components/StartScreen";
import ConversationBox from "../components/ConversationBox";
import HistoryBox from "../components/HistoryBox";
import { useSpeechOutput } from "../hooks/useSpeechOutput";
import { nanoid } from "nanoid";
import { getConversationHistory, sendMessage } from "../api/chat";

const MotionDiv = motion.div;
const BOOT_DURATION_MS = 6500;

function now() {
  return new Date().toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
}

function getViewport() {
  if (typeof window === "undefined") {
    return { width: 1440, height: 900 };
  }

  return { width: window.innerWidth, height: window.innerHeight };
}

function buildHistoryGroups(persistedHistory, conversationEntries, authUser) {
  const fromPersisted = (persistedHistory || [])
    .filter((entry) => entry.role === "user")
    .map((entry, index) => ({
      id: `persisted-${index}`,
      text: entry.content,
    }));

  const fromCurrentSession = (conversationEntries || [])
    .filter((entry) => entry.type === "user" && !entry.interim)
    .map((entry) => ({
      id: entry.id,
      text: entry.text,
    }));

  const deduped = [];
  const seen = new Set();

  [...fromCurrentSession, ...fromPersisted].forEach((item) => {
    const key = item.text.trim().toLowerCase();
    if (!key || seen.has(key)) return;
    seen.add(key);
    deduped.push(item);
  });

  if (deduped.length === 0) {
    return authUser
      ? [
          {
            date: "Account",
            items: [{ id: "empty-auth", text: "No stored prompts yet" }],
          },
        ]
      : [
          {
            date: "Guest Mode",
            items: [{ id: "guest-empty", text: "Sign in to persist history" }],
          },
        ];
  }

  return [
    {
      date: authUser ? "Account Memory" : "Session Memory",
      items: deduped.slice(0, 8),
    },
  ];
}

const Home = ({
  start,
  setStart,
  openSettings,
  isOrbReady,
  setIsOrbReady,
  authStatus,
  authUser,
  authToken,
  onLogin,
  onRegister,
  onLogout,
}) => {
  const audioEnabled = true;
  const audioLevel = 0;

  const [audioError, setAudioError] = useState(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [bootComplete, setBootComplete] = useState(false);
  const [showConversation, setShowConversation] = useState(false);
  const [conversationStatus, setConversationStatus] = useState("idle");
  const [conversationEntries, setConversationEntries] = useState([]);
  const [persistedHistory, setPersistedHistory] = useState([]);
  const [viewport, setViewport] = useState(getViewport);
  const [showHistoryPanel, setShowHistoryPanel] = useState(false);

  const audioRef = useRef(null);
  const recognitionRef = useRef(null);
  const isPlayingRef = useRef(false);
  const isTtsActiveRef = useRef(false);
  const bootCompleteRef = useRef(false);
  const startRef = useRef(start);
  const suppressRestartRef = useRef(false);
  const timersRef = useRef([]);
  const startListeningRef = useRef(() => {});

  const conversationEntriesRef = useRef([]);
  const authTokenRef = useRef(authToken);
  const isFetchingRef = useRef(false);
  const hasFinalResultRef = useRef(false);
  const isCompact = viewport.width < 1180;
  const isMobile = viewport.width < 768;
  const historyGroups = buildHistoryGroups(
    persistedHistory,
    conversationEntries,
    authUser,
  );

  useEffect(() => {
    authTokenRef.current = authToken;
  }, [authToken]);

  useEffect(() => {
    const handleResize = () => setViewport(getViewport());

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    conversationEntriesRef.current = conversationEntries;
  }, [conversationEntries]);

  useEffect(() => {
    const syncHistory = async () => {
      if (!authToken) {
        setPersistedHistory([]);
        return;
      }

      try {
        const data = await getConversationHistory({ token: authToken });
        setPersistedHistory(data.items || []);
      } catch (error) {
        if (error.status === 401) {
          onLogout();
        }
        setPersistedHistory([]);
      }
    };

    void syncHistory();
  }, [authToken, onLogout]);

  const { speak, cancelSpeech } = useSpeechOutput({
    onSpeakStart: () => {
      stopListening();
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
      timersRef.current = timersRef.current.filter((timer) => timer !== id);
      fn();
    }, delay);
    timersRef.current.push(id);
    return id;
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
      console.warn("Speech recognition abort failed:", error);
    }
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

  const sendToBackend = useCallback(
    async (message) => {
      if (isFetchingRef.current) return;
      isFetchingRef.current = true;

      try {
        const history = conversationEntriesRef.current
          .filter((entry) => !entry.interim)
          .map((entry) => ({
            role: entry.type === "user" ? "user" : "assistant",
            content: entry.text,
          }));

        const data = await sendMessage(message, {
          history,
          token: authTokenRef.current,
        });
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

        if (authTokenRef.current) {
          setPersistedHistory((prev) => [
            ...prev,
            { role: "user", content: message },
            { role: "assistant", content: reply },
          ]);
        }

        suppressRestartRef.current = true;
        speak(reply, () => {
          suppressRestartRef.current = false;
          isFetchingRef.current = false;
        });
      } catch (error) {
        if (error.status === 401) {
          onLogout();
        }

        const fallback =
          error.status === 401
            ? "Your session expired. Please log in again."
            : "Backend unavailable. Please start the API server.";

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
    [onLogout, speak],
  );

  const startListening = useCallback(() => {
    if (isPlayingRef.current || isTtsActiveRef.current) return;
    if (recognitionRef.current) return;
    if (typeof window === "undefined") return;

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

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
      } catch (error) {
        console.warn("Speech recognition commit abort failed:", error);
      }
      recognitionRef.current = null;

      if (!latestTranscript) return;

      clearTimers();
      suppressRestartRef.current = true;

      setConversationEntries((prev) => {
        const committedAt = now();
        let replacedInterim = false;

        const nextEntries = prev.reduce((accumulator, entry) => {
          if (entry.type === "user" && entry.interim) {
            if (!replacedInterim) {
              replacedInterim = true;
              accumulator.push({
                ...entry,
                text: latestTranscript,
                time: committedAt,
                interim: false,
              });
            }
            return accumulator;
          }

          accumulator.push(entry);
          return accumulator;
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
      void sendToBackend(latestTranscript);
    };

    recognition.onstart = () => {
      if (isPlayingRef.current || isTtsActiveRef.current) {
        recognition.abort();
        return;
      }
      setConversationStatus("listening");
    };

    recognition.onresult = (event) => {
      if (isPlayingRef.current || isTtsActiveRef.current) {
        return;
      }

      let fullTranscript = "";
      for (let index = 0; index < event.results.length; index += 1) {
        fullTranscript += event.results[index][0].transcript;
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
          return prev.map((entry) =>
            entry.id === existingInterim.id
              ? { ...entry, text: fullTranscript }
              : entry,
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
          prev.filter((entry) => entry.id !== interimEntry.id),
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
    } catch (error) {
      console.warn("Could not start recognition:", error);
    }
  }, [clearTimers, queueListeningRestart, sendToBackend]);

  useEffect(() => {
    startListeningRef.current = startListening;
  }, [startListening]);

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
        .catch((error) => {
          console.error("Audio error:", error);
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
      } else {
        setShowConversation(true);
      }
    }, BOOT_DURATION_MS + 300);

    return () => {
      clearTimers();
      stopListening();
      cancelSpeech();
      if (audioElement) audioElement.onended = null;
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

  useEffect(() => {
    if (start) return;
    const audioElement = audioRef.current;
    clearTimers();
    stopListening();
    cancelSpeech();
    suppressRestartRef.current = false;
    isPlayingRef.current = false;
    isTtsActiveRef.current = false;
    isFetchingRef.current = false;
    hasFinalResultRef.current = false;

    const timeoutId = setTimeout(() => {
      setBootComplete(false);
      setShowConversation(false);
      setConversationStatus("idle");
      setConversationEntries([]);
      setIsSpeaking(false);
      setShowHistoryPanel(false);
      if (audioElement) audioElement.onended = null;
    }, 0);

    return () => clearTimeout(timeoutId);
  }, [cancelSpeech, clearTimers, start, stopListening]);

  const controlButtonStyle = {
    width: isMobile ? "42px" : "38px",
    height: isMobile ? "42px" : "38px",
    borderRadius: "999px",
    border: "1px solid rgba(96,165,250,0.25)",
    background: "rgba(10,20,35,0.4)",
    backdropFilter: "blur(12px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    boxShadow: "0 0 12px rgba(59,130,246,0.35)",
    transition: "all 0.25s ease",
  };

  return (
    <div
      style={{
        width: "100%",
        height: "100dvh",
        background: "#000",
        position: "relative",
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <audio ref={audioRef} src="/zenix_voice.mp3" preload="auto" />

      {audioError && (
        <div
          style={{
            position: "absolute",
            bottom: isMobile ? "12px" : "18px",
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 110,
            padding: "10px 14px",
            borderRadius: "999px",
            background: "rgba(127,29,29,0.72)",
            border: "1px solid rgba(248,113,113,0.28)",
            color: "#fecaca",
            fontSize: "11px",
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            backdropFilter: "blur(14px)",
          }}
        >
          {audioError}
        </div>
      )}

      {bootComplete && (
        <div
          style={{
            position: "absolute",
            top: isMobile ? "12px" : "18px",
            left: isMobile ? "12px" : "18px",
            zIndex: 100,
            display: "flex",
            alignItems: "center",
            gap: "10px",
            flexWrap: "wrap",
          }}
        >
          <div
            style={{
              padding: isMobile ? "10px 12px" : "9px 14px",
              borderRadius: "999px",
              border: "1px solid rgba(148,163,184,0.16)",
              background: "rgba(7,12,22,0.58)",
              backdropFilter: "blur(14px)",
              color: authUser ? "#cffafe" : "#cbd5e1",
              fontSize: "11px",
              letterSpacing: "0.18em",
              textTransform: "uppercase",
            }}
          >
            {authUser
              ? `Linked ${authUser.name || authUser.email}`
              : "Guest session"}
          </div>

          {authUser && (
            <button
              onClick={onLogout}
              style={{
                ...controlButtonStyle,
                width: "auto",
                padding: "0 14px",
                color: "#cbd5e1",
                fontSize: "11px",
                letterSpacing: "0.18em",
                textTransform: "uppercase",
              }}
            >
              Logout
            </button>
          )}
        </div>
      )}

      <div
        style={{
          position: "absolute",
          top: isMobile ? "12px" : "18px",
          left: isCompact ? "auto" : "50%",
          right: isCompact ? (isMobile ? "12px" : "18px") : "auto",
          transform: isCompact ? "none" : "translateX(-50%)",
          zIndex: 100,
          display: "flex",
          alignItems: "center",
          gap: "10px",
        }}
      >
        {bootComplete && (
          <>
            {isCompact && (
              <button
                onClick={() => setShowHistoryPanel((prev) => !prev)}
                style={controlButtonStyle}
                aria-label="Toggle history panel"
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
                  <path d="M3 6h18" />
                  <path d="M3 12h18" />
                  <path d="M3 18h12" />
                </svg>
              </button>
            )}

            <button
              onClick={isOrbReady ? openSettings : undefined}
              disabled={!isOrbReady}
              style={{
                ...controlButtonStyle,
                cursor: isOrbReady ? "pointer" : "not-allowed",
                boxShadow: isOrbReady ? controlButtonStyle.boxShadow : "none",
                opacity: isOrbReady ? 1 : 0.4,
              }}
              onMouseEnter={(event) => {
                if (!isOrbReady) return;
                event.currentTarget.style.boxShadow =
                  "0 0 22px rgba(59,130,246,0.6)";
              }}
              onMouseLeave={(event) => {
                if (!isOrbReady) return;
                event.currentTarget.style.boxShadow =
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
          </>
        )}
      </div>

      <AnimatePresence mode="wait">
        {!start ? (
          <StartScreen
            setStart={setStart}
            authStatus={authStatus}
            authUser={authUser}
            onLogin={onLogin}
            onRegister={onRegister}
            onLogout={onLogout}
          />
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
              alignItems: isCompact ? "center" : "stretch",
              justifyContent: isCompact ? "center" : "space-between",
              padding: isCompact
                ? `${isMobile ? 70 : 82}px ${isMobile ? 14 : 24}px ${isMobile ? 14 : 24}px`
                : "0 40px",
              boxSizing: "border-box",
              position: "relative",
            }}
          >
            <AnimatePresence>
              {bootComplete && !isCompact && (
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
                  <HistoryBox groups={historyGroups} />
                </MotionDiv>
              )}
            </AnimatePresence>

            <div
              style={{
                flex: 1,
                width: "100%",
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
                compact={isCompact}
              />
            </div>

            <AnimatePresence>
              {bootComplete && isCompact && showHistoryPanel && (
                <MotionDiv
                  initial={{ opacity: 0, y: -12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.24 }}
                  style={{
                    position: "absolute",
                    top: isMobile ? "62px" : "74px",
                    left: isMobile ? "14px" : "24px",
                    right: isMobile ? "14px" : "24px",
                    zIndex: 50,
                  }}
                >
                  <HistoryBox compact groups={historyGroups} />
                </MotionDiv>
              )}
            </AnimatePresence>

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
                    width: isCompact
                      ? `min(${Math.max(viewport.width - (isMobile ? 28 : 48), 280)}px, 420px)`
                      : "370px",
                    height: isCompact ? (isMobile ? "44%" : "56%") : "95%",
                    paddingTop: isCompact ? 0 : "25px",
                    display: "flex",
                    flexDirection: "column",
                    position: isCompact ? "absolute" : "relative",
                    right: isCompact ? (isMobile ? "14px" : "24px") : undefined,
                    bottom: isCompact
                      ? authUser
                        ? (isMobile ? "14px" : "24px")
                        : (isMobile ? "14px" : "24px")
                      : undefined,
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

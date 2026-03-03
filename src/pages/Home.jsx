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
  const [audioError, setAudioError]     = useState(null);
  const [audioLevel, setAudioLevel]     = useState(0);
  const [isSpeaking, setIsSpeaking]     = useState(false);
  const [bootComplete, setBootComplete] = useState(false);
  const [conversationStatus, setConversationStatus] = useState("idle");

  const audioRef       = useRef(null);
  const recognitionRef = useRef(null);
  const isPlayingRef   = useRef(false);

  const startListening = useCallback(() => {
    if (isPlayingRef.current) return;
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch (_) {}
      recognitionRef.current = null;
    }
    const recognition = new SR();
    recognition.lang            = "en-US";
    recognition.continuous      = false;
    recognition.interimResults  = true;
    recognition.maxAlternatives = 1;
    recognition.onstart = () => {
      if (isPlayingRef.current) { recognition.abort(); return; }
      setConversationStatus("listening");
    };
    recognition.onresult = (event) => {
      if (isPlayingRef.current) { recognition.abort(); return; }
      const transcript = Array.from(event.results).map((r) => r[0].transcript).join("");
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
        setTimeout(() => { if (!isPlayingRef.current) startListening(); }, 300);
      }
    };
    recognitionRef.current = recognition;
    try { recognition.start(); } catch (err) { console.warn("Could not start recognition:", err); }
  }, [bootComplete, start]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try { recognitionRef.current.abort(); } catch (_) {}
      recognitionRef.current = null;
    }
  }, []);

  const playAudioSafely = useCallback((onEnded) => {
    if (!audioRef.current) return;
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
  }, [stopListening, startListening]);

  useEffect(() => {
    if (!start) { setIsOrbReady(false); return; }
    const timers = [];
    const t = (fn, ms) => { const id = setTimeout(fn, ms); timers.push(id); };
    t(() => {
      setBootComplete(true);
      setConversationStatus("listening");
      startListening();
    }, BOOT_DURATION_MS);
    t(() => { if (audioEnabled) playAudioSafely(); }, BOOT_DURATION_MS + 300);
    return () => { timers.forEach(clearTimeout); stopListening(); };
  }, [start, audioEnabled, startListening, playAudioSafely, stopListening, setIsOrbReady]);

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
    <div style={{ width: "100%", height: "100vh", overflow: "hidden", background: "#000", position: "relative" }}>
      <audio ref={audioRef} src="/zenix_voice.mp3" preload="auto" />

      {/* Settings button — absolutely placed, never affects layout */}
      <button
        onClick={isOrbReady ? openSettings : undefined}
        disabled={!isOrbReady}
        style={{ position: "absolute", top: "20px", right: "20px", zIndex: 100 }}
        className={`text-xs px-4 py-2 rounded-md transition-all ${
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
            style={{ position: "relative", width: "100%", height: "100vh", overflow: "hidden" }}
          >
            {/* Orb: fullscreen during boot, shrinks to left after boot completes */}
            <motion.div
              animate={bootComplete ? { width: "calc(100% - 320px)" } : { width: "100%" }}
              transition={{ type: "spring", stiffness: 50, damping: 18 }}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden",
              }}
            >
              <CinematicBoot
                isSpeaking={isSpeaking}
                audioLevel={audioLevel}
                audioRef={audioRef}
              />
            </motion.div>

            {/* ConversationBox: 370px panel fixed to right edge, slides in after boot */}
            <AnimatePresence>
              {bootComplete && (
                <motion.div
                  key="conv-box"
                  initial={{ x: 370, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: 370, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 80, damping: 18, opacity: { duration: 0.3 } }}
                  style={{
                    position: "absolute",
                    top: 0,
                    right: 0,
                    width: "370px",
                    height: "100vh",
                    padding: "72px 12px 20px 8px",
                    boxSizing: "border-box",
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

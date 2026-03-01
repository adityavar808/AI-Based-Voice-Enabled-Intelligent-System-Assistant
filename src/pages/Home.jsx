import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import CinematicBoot from "../components/CinematicBoot";
import StartScreen from "../components/StartScreen";
import ConversationBox from "../components/ConversationBox";

const BOOT_DURATION_MS = 6500;

// Conversation box has: header(44) + accentLine(1) + transcript(200) + footer(44) + demoBar(44) = ~340px
// Add padding: 20px bottom = 360px total for conversation box
// Orb gets: 100vh - 360px, min 260px so it never gets too small
const CONV_BOX_HEIGHT = 360;
const ORB_MIN_HEIGHT  = 260;

const Home = ({ start, setStart }) => {
  const [audioEnabled] = useState(true);
  const [audioError, setAudioError]       = useState(null);
  const [audioLevel]                       = useState(0);
  const [isSpeaking, setIsSpeaking]       = useState(false);
  const [bootComplete, setBootComplete]   = useState(false);
  const [viewH, setViewH]                 = useState(window.innerHeight);

  // "idle" | "listening" | "thinking" | "responding"
  const [conversationStatus, setConversationStatus] = useState("idle");

  const audioRef = useRef(null);

  // Keep viewport height in sync (handles mobile resize / keyboard pop)
  useEffect(() => {
    const onResize = () => setViewH(window.innerHeight);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    if (!start) return;

    const timers = [];
    const t = (fn, ms) => { const id = setTimeout(fn, ms); timers.push(id); };

    t(() => { setBootComplete(true); setConversationStatus("listening"); }, BOOT_DURATION_MS);

    t(() => {
      if (audioEnabled && audioRef.current) {
        setIsSpeaking(true);
        setConversationStatus("responding");
        audioRef.current.play()
          .then(() => {
            audioRef.current.onended = () => {
              setIsSpeaking(false);
              setConversationStatus("listening");
            };
          })
          .catch((err) => {
            console.error("❌ Audio error:", err);
            setAudioError("Click anywhere to enable audio");
            setIsSpeaking(false);
            setConversationStatus("listening");
          });
      }
    }, BOOT_DURATION_MS + 300);

    // Demo state cycle
    const C = BOOT_DURATION_MS + 5000;
    t(() => setConversationStatus("thinking"),   C);
    t(() => setConversationStatus("listening"),  C + 2500);
    t(() => setConversationStatus("responding"), C + 4000);
    t(() => setConversationStatus("listening"),  C + 7000);
    t(() => setConversationStatus("idle"),       C + 9000);
    t(() => setConversationStatus("listening"),  C + 11000);

    return () => timers.forEach(clearTimeout);
  }, [start, audioEnabled]);

  useEffect(() => {
    if (!start) {
      setBootComplete(false);
      setConversationStatus("idle");
      setIsSpeaking(false);
    }
  }, [start]);

  // Calculated heights
  const orbHeight = bootComplete
    ? Math.max(ORB_MIN_HEIGHT, viewH - CONV_BOX_HEIGHT)
    : viewH;

  return (
    <>
      <audio ref={audioRef} src="/zenix_voice.mp3" preload="auto" />

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
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              background: "#000",
              overflow: "hidden",        // page never scrolls
            }}
          >
            {/* ── Orb: pixel-exact height, clips nothing ── */}
            <motion.div
              animate={{ height: orbHeight }}
              transition={{ type: "spring", stiffness: 50, damping: 18 }}
              style={{
                width: "100%",
                flexShrink: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                // Clip only horizontal bleed, never top/bottom
                overflow: "hidden",
                position: "relative",
              }}
            >
              {/* Extra padding wrapper so glow never hits the edge */}
              <div style={{
                width: "100%",
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: bootComplete ? "16px 0 0" : "0",
              }}>
                <CinematicBoot
                  isSpeaking={isSpeaking}
                  audioLevel={audioLevel}
                  audioRef={audioRef}
                />
              </div>
            </motion.div>

            {/* ── ConversationBox: fixed height, slides up ── */}
            <AnimatePresence>
              {bootComplete && (
                <motion.div
                  key="conv-box"
                  initial={{ y: 120, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 120, opacity: 0 }}
                  transition={{
                    type: "spring",
                    stiffness: 85,
                    damping: 17,
                    opacity: { duration: 0.25 },
                  }}
                  style={{
                    width: "100%",
                    maxWidth: "780px",
                    height: `${CONV_BOX_HEIGHT}px`,
                    flexShrink: 0,
                    padding: "0 20px 20px",
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
    </>
  );
};

export default Home;

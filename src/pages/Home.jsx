import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import CinematicBoot from "../components/CinematicBoot";
import StartScreen from "../components/StartScreen";

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

  useEffect(() => {
    if (!start) {
      setIsOrbReady(false);
      return;
    }

    const timer = setTimeout(() => {
      if (audioEnabled && audioRef.current) {
        setIsSpeaking(true);
        audioRef.current.play().catch(() => {
          setAudioError("Click anywhere to enable audio");
          setIsSpeaking(false);
        });
      }
    }, 6500);

    return () => clearTimeout(timer);
  }, [start, audioEnabled, setIsOrbReady]);

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
            className="w-full h-full"
          >
            <CinematicBoot
              isSpeaking={isSpeaking}
              audioLevel={audioLevel}
              audioRef={audioRef}
              setIsOrbReady={setIsOrbReady}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Home;
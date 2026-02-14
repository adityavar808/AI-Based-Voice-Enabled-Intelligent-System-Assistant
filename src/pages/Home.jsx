import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import CinematicBoot from "../components/CinematicBoot";
import StartScreen from "../components/StartScreen";

const Home = ({ start, setStart }) => {
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [audioError, setAudioError] = useState(null);
  const [audioLevel, setAudioLevel] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const audioRef = useRef(null);

  useEffect(() => {
    if (!start) return;

    // Boot sequence: 1s init + 5s booting = 6s total
    // Start audio 0.5s after orb appears for smooth experience
    const timer = setTimeout(() => {
      if (audioEnabled && audioRef.current) {
        console.log('🎵 Attempting to play audio...');
        setIsSpeaking(true);

        audioRef.current
          .play()
          .then(() => {
            console.log('✅ Audio playing successfully');
            console.log('Audio duration:', audioRef.current.duration);
            console.log('Audio paused?', audioRef.current.paused);
            
            audioRef.current.onended = () => {
              console.log('Audio ended');
              setIsSpeaking(false);
            };
          })
          .catch((error) => {
            console.error('❌ Audio play error:', error);
            setAudioError("Click anywhere to enable audio");
            setIsSpeaking(false);
          });
      }
    }, 6500); // Boot (6s) + small delay (0.5s)

    return () => clearTimeout(timer);
  }, [start, audioEnabled]);

  return (
    <>
      <audio ref={audioRef} src="/zenix_voice.mp3" preload="auto" />

      <AnimatePresence mode="wait">
        {!start ? (
          <StartScreen
            setStart={setStart}
            audioError={audioError}
          />
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
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Home;
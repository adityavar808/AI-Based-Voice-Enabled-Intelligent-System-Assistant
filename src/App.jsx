import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import CinematicBoot from "./components/CinematicBoot";

function App() {
  const [start, setStart] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [audioError, setAudioError] = useState(null);
  const audioRef = useRef(null);

  // FIX: Safe window dimension handling
  const [windowDimensions, setWindowDimensions] = useState({
    width: typeof window !== "undefined" ? window.innerWidth : 1920,
    height: typeof window !== "undefined" ? window.innerHeight : 1080,
  });

  // FIX: Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setWindowDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // FIX: Better audio error handling
  useEffect(() => {
    if (!start) return;

    const timer = setTimeout(() => {
      if (audioEnabled && audioRef.current) {
        audioRef.current.play().catch((err) => {
          console.log("Audio autoplay blocked:", err);
          setAudioError("Click anywhere to enable audio");
        });
      }
    }, 5000);

    return () => clearTimeout(timer);
  }, [start, audioEnabled]);

  const handleStart = () => {
    setStart(true);
    // FIX: Try to play audio on user interaction
    if (audioError && audioRef.current) {
      audioRef.current.play().catch(console.error);
      setAudioError(null);
    }
  };

  return (
    <div className="w-screen h-screen bg-black overflow-hidden">
      <audio ref={audioRef} src="/zenix_voice.mp3" preload="auto" />

      {/* FIX: Audio error notification */}
      <AnimatePresence>
        {audioError && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-8 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-full bg-yellow-500/20 border border-yellow-500/40 backdrop-blur-sm"
          >
            <p className="text-yellow-400 text-sm">{audioError}</p>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {!start && (
          <motion.div
            key="start-screen"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{
              opacity: 0,
              scale: 1.1,
              filter: "blur(10px)",
            }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
            onClick={handleStart}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                handleStart();
              }
            }}
            tabIndex={0}
            role="button"
            aria-label="Click to initialize ZENIX"
            className="w-full h-full flex flex-col items-center justify-center cursor-pointer relative overflow-hidden"
          >
            {/* Animated Background Grid */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 bg-[linear-gradient(rgba(0,247,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,247,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px]"
            />

            {/* Animated Grid Lines */}
            <motion.div
              animate={{
                backgroundPosition: ["0% 0%", "100% 100%"],
              }}
              transition={{
                duration: 20,
                repeat: Infinity,
                ease: "linear",
              }}
              className="absolute inset-0 bg-[linear-gradient(rgba(0,247,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(0,247,255,0.01)_1px,transparent_1px)] bg-[size:60px_60px]"
            />

            {/* Center Glow - Multi-layer */}
            <motion.div
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.15, 0.35, 0.15],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute w-[80vw] sm:w-[500px] h-[80vw] sm:h-[500px] rounded-full bg-cyan-400/20 blur-3xl"
            />

            <motion.div
              animate={{
                scale: [1.2, 1, 1.2],
                opacity: [0.1, 0.25, 0.1],
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.5,
              }}
              className="absolute w-[90vw] sm:w-[600px] h-[90vw] sm:h-[600px] rounded-full bg-blue-400/15 blur-3xl"
            />

            {/* FIX: Reduced particles from 15 to 8 for better performance */}
            {/* FIX: Use safe window dimensions */}
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                initial={{
                  x: Math.random() * windowDimensions.width,
                  y: Math.random() * windowDimensions.height,
                  scale: 0,
                  opacity: 0,
                }}
                animate={{
                  y: [null, -100, Math.random() * windowDimensions.height],
                  x: [null, null, Math.random() * windowDimensions.width],
                  scale: [0, 1, 0],
                  opacity: [0, 0.6, 0],
                }}
                transition={{
                  duration: Math.random() * 5 + 3,
                  repeat: Infinity,
                  delay: Math.random() * 3,
                  ease: "easeInOut",
                }}
                className="absolute w-1 h-1 bg-cyan-400 rounded-full"
              />
            ))}

            {/* Logo/Icon Container */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{
                type: "spring",
                stiffness: 150,
                damping: 15,
                delay: 0.2,
              }}
              className="relative mb-10"
            >
              {/* Outer Ring Glow */}
              <motion.div
                animate={{
                  scale: [1, 1.15, 1],
                  opacity: [0.3, 0.6, 0.3],
                }}
                transition={{
                  duration: 2.5,
                  repeat: Infinity,
                }}
                className="absolute -inset-6 rounded-full bg-cyan-400/20 blur-2xl"
              />

              {/* Main Logo Reactor Core */}
              <div
                className="relative w-24 h-24 sm:w-32 sm:h-32 rounded-full 
                flex items-center justify-center 
                bg-[radial-gradient(circle_at_30%_30%,_#00f7ff_0%,_#0096c7_40%,_#001f2f_80%)]
                shadow-[0_0_100px_rgba(0,247,255,0.6)]"
              >
                {/* Inner Electric Pulse */}
                <motion.div
                  animate={{
                    scale: [1, 1.25, 1],
                    opacity: [0.4, 0.9, 0.4],
                  }}
                  transition={{
                    duration: 1.8,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="absolute w-16 h-16 sm:w-20 sm:h-20 rounded-full 
               bg-cyan-400/30 blur-xl"
                />

                {/* Electric Arc Ring */}
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 rounded-full border border-cyan-400/40"
                  style={{
                    background:
                      "conic-gradient(from 0deg, transparent 0%, rgba(0,247,255,0.6) 20%, transparent 40%)",
                  }}
                />

                {/* Lightning Icon */}
                <motion.div
                  animate={{
                    scale: [1, 1.08, 1],
                    textShadow: [
                      "0 0 10px #00f7ff",
                      "0 0 30px #00f7ff",
                      "0 0 10px #00f7ff",
                    ],
                  }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="relative z-10 text-cyan-100"
                >
                  <svg
                    width="60"
                    height="60"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-10 h-10 sm:w-14 sm:h-14"
                  >
                    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                  </svg>
                </motion.div>

                {/* Expanding Energy Rings */}
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    initial={{ scale: 1, opacity: 0.6 }}
                    animate={{
                      scale: 2.2,
                      opacity: 0,
                    }}
                    transition={{
                      duration: 2.5,
                      repeat: Infinity,
                      delay: i * 0.7,
                      ease: "easeOut",
                    }}
                    className="absolute inset-0 rounded-full border border-cyan-400"
                  />
                ))}
              </div>

              {/* Rotating Ring */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                className="absolute -inset-5 rounded-full border-2 border-dashed border-cyan-400/30"
              />

              {/* Counter Rotating Ring */}
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                className="absolute -inset-6 rounded-full border border-dotted border-blue-400/20"
              />

              {/* Orbital Dots */}
              {[0, 120, 240].map((angle, i) => (
                <motion.div
                  key={angle}
                  animate={{ rotate: 360 }}
                  transition={{
                    duration: 8,
                    repeat: Infinity,
                    ease: "linear",
                    delay: i * 0.3,
                  }}
                  className="absolute inset-0"
                >
                  <div
                    className="absolute w-2 h-2 bg-cyan-400 rounded-full shadow-[0_0_10px_#00f7ff]"
                    style={{
                      top: "50%",
                      left: "50%",
                      transform: `translate(-50%, -50%) rotate(${angle}deg) translateY(-60px)`,
                    }}
                  />
                </motion.div>
              ))}
            </motion.div>

            {/* Title Section */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.9 }}
              className="relative text-center mb-12"
            >
              {/* Background Glow Behind Title */}
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.2, 0.4, 0.2],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="absolute -inset-10 bg-cyan-400/20 blur-3xl rounded-full"
              />

              <motion.h1
                animate={{
                  textShadow: [
                    "0 0 20px #00f7ff, 0 0 40px #00f7ff",
                    "0 0 40px #00f7ff, 0 0 70px #0096c7",
                    "0 0 20px #00f7ff, 0 0 40px #00f7ff",
                  ],
                }}
                transition={{ duration: 3, repeat: Infinity }}
                className="relative text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-[0.4em] text-cyan-400"
              >
                ZENIX
                {/* Dual Glitch Layers */}
                <motion.span
                  animate={{
                    x: [-3, 3, -3],
                    opacity: [0, 0.5, 0],
                  }}
                  transition={{
                    duration: 0.15,
                    repeat: Infinity,
                    repeatDelay: 5,
                  }}
                  className="absolute inset-0 text-cyan-300"
                  style={{ clipPath: "polygon(0 0, 100% 0, 100% 45%, 0 45%)" }}
                  aria-hidden="true"
                >
                  ZENIX
                </motion.span>
                <motion.span
                  animate={{
                    x: [3, -3, 3],
                    opacity: [0, 0.4, 0],
                  }}
                  transition={{
                    duration: 0.15,
                    repeat: Infinity,
                    repeatDelay: 5,
                    delay: 0.08,
                  }}
                  className="absolute inset-0 text-blue-300"
                  style={{
                    clipPath: "polygon(0 55%, 100% 55%, 100% 100%, 0 100%)",
                  }}
                  aria-hidden="true"
                >
                  ZENIX
                </motion.span>
              </motion.h1>

              {/* Subtitle Block */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 }}
                className="mt-6 space-y-3"
              >
                <p className="text-cyan-400/80 text-base tracking-[0.25em] font-light uppercase">
                  Voice AI Assistant
                </p>

                {/* Animated Divider */}
                <motion.div
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: 1.3, duration: 1 }}
                  className="relative mx-auto h-[2px] w-40 sm:w-56 bg-gradient-to-r from-transparent via-cyan-400 to-transparent origin-center"
                >
                  <motion.div
                    animate={{ x: ["-100%", "200%"] }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
                  />
                </motion.div>

                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.6 }}
                  className="text-cyan-400/40 text-xs tracking-[0.4em]"
                >
                  POWERED BY ADVANCED AI
                </motion.p>
              </motion.div>
            </motion.div>

            {/* Click Prompt */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.6 }}
              className="absolute bottom-16 sm:bottom-24 flex flex-col items-center gap-4"
            >
              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{
                  duration: 1.8,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-4 sm:px-6 py-2 sm:py-3 rounded-full bg-cyan-400/10 border border-cyan-400/30 backdrop-blur-sm"
              >
                <span className="text-cyan-400/90 text-sm sm:text-base tracking-[0.2em] font-medium">
                  CLICK TO INITIALIZE
                </span>
              </motion.div>

              {/* Animated Arrow */}
              <motion.div
                animate={{
                  y: [0, 12, 0],
                  opacity: [0.4, 1, 0.4],
                }}
                transition={{
                  duration: 1.8,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <svg
                  width="28"
                  height="28"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-cyan-400"
                  role="img"
                  aria-label="Down arrow"
                >
                  <title>Scroll down</title>
                  <polyline points="7 13 12 18 17 13" />
                  <polyline points="7 6 12 11 17 6" />
                </svg>
              </motion.div>
            </motion.div>

            {/* Corner Accents - Enhanced */}
            {[
              { top: "1rem", left: "1rem", rotate: 0 },
              { top: "1rem", right: "1rem", rotate: 90 },
              { bottom: "1rem", left: "1rem", rotate: -90 },
              { bottom: "1rem", right: "1rem", rotate: 180 },
            ].map((pos, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 0.4, scale: 1 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                className="absolute w-12 sm:w-20 h-12 sm:h-20"
                style={pos}
                aria-hidden="true"
              >
                <svg viewBox="0 0 80 80" className="text-cyan-400/30">
                  <path
                    d="M 0 20 L 0 0 L 20 0"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                  <path
                    d="M 0 10 L 10 10 L 10 0"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1"
                    opacity="0.5"
                  />
                  <circle cx="4" cy="4" r="2" fill="currentColor" />
                  <circle
                    cx="16"
                    cy="4"
                    r="1"
                    fill="currentColor"
                    opacity="0.6"
                  />
                  <circle
                    cx="4"
                    cy="16"
                    r="1"
                    fill="currentColor"
                    opacity="0.6"
                  />
                </svg>
              </motion.div>
            ))}

            {/* Advanced Scanline Effect */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              {/* Soft Ambient Glow */}
              <motion.div
                animate={{ y: ["-120%", "120%"] }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  ease: "linear",
                  repeatDelay: 1,
                }}
                className="absolute left-0 right-0 h-24 bg-gradient-to-b 
               from-transparent 
               via-cyan-400/10 
               to-transparent 
               blur-2xl"
              />

              {/* Main Sharp Scanline */}
              <motion.div
                animate={{ y: ["-100%", "100%"] }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "linear",
                  repeatDelay: 1,
                }}
                className="absolute left-0 right-0 h-[2px] 
               bg-gradient-to-r 
               from-transparent 
               via-cyan-400 
               to-transparent 
               shadow-[0_0_20px_#00f7ff]"
              />

              {/* Secondary Thin Line */}
              <motion.div
                animate={{ y: ["-100%", "100%"] }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "linear",
                  repeatDelay: 1,
                  delay: 0.15,
                }}
                className="absolute left-0 right-0 h-[1px] 
               bg-cyan-300/40"
              />
            </div>

            {/* Hover Effect Layer */}
            <motion.div
              whileHover={{ scale: 1.01 }}
              className="absolute inset-0 bg-cyan-400/0 hover:bg-cyan-400/5 transition-colors duration-500 pointer-events-none"
              aria-hidden="true"
            />
          </motion.div>
        )}

        {start && (
          <motion.div
            key="boot-screen"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="w-full h-full"
          >
            <CinematicBoot />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;

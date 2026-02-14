import { useEffect, useState } from "react";
import { motion } from "framer-motion";

const StartScreen = ({ setStart }) => {
  const [windowDimensions, setWindowDimensions] = useState({
    width: typeof window !== "undefined" ? window.innerWidth : 1920,
    height: typeof window !== "undefined" ? window.innerHeight : 1080,
  });

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

  const handleStart = () => {
    setStart(true);
  };

  return (
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
      className="w-full h-full flex flex-col items-center justify-start pt-[18vh] cursor-pointer relative overflow-hidden"
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

      {/* Center Glow */}
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

      {/* Particles */}
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

      {/* Reactor Core */}
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
        <motion.div
          animate={{
            scale: [1, 1.15, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{ duration: 2.5, repeat: Infinity }}
          className="absolute -inset-6 rounded-full bg-cyan-400/20 blur-2xl"
        />

        <div
          className="relative w-24 h-24 sm:w-32 sm:h-32 rounded-full 
          flex items-center justify-center 
          bg-[radial-gradient(circle_at_30%_30%,_#00f7ff_0%,_#0096c7_40%,_#001f2f_80%)]
          shadow-[0_0_100px_rgba(0,247,255,0.6)]"
        >
          <motion.div
            animate={{
              scale: [1, 1.25, 1],
              opacity: [0.4, 0.9, 0.4],
            }}
            transition={{ duration: 1.8, repeat: Infinity }}
            className="absolute w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-cyan-400/30 blur-xl"
          />

          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 rounded-full border border-cyan-400/40"
            style={{
              background:
                "conic-gradient(from 0deg, transparent 0%, rgba(0,247,255,0.6) 20%, transparent 40%)",
            }}
          />

          {/* Glass Reflection */}
          <div className="absolute top-3 left-5 w-8 h-4 bg-white/20 rounded-full blur-sm rotate-[-20deg]" />

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

        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          className="absolute -inset-5 rounded-full border-2 border-dashed border-cyan-400/30"
        />

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

      {/* Title */}
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
        {/* Upper Glitch */}
        <motion.span
          animate={{ x: [-3, 3, -3], opacity: [0, 0.5, 0] }}
          transition={{ duration: 0.15, repeat: Infinity, repeatDelay: 5 }}
          className="absolute inset-0 text-cyan-300"
          style={{ clipPath: "polygon(0 0, 100% 0, 100% 45%, 0 45%)" }}
        >
          ZENIX
        </motion.span>
        {/* Lower Glitch */}
        <motion.span
          animate={{ x: [3, -3, 3], opacity: [0, 0.4, 0] }}
          transition={{
            duration: 0.15,
            repeat: Infinity,
            repeatDelay: 5,
            delay: 0.08,
          }}
          className="absolute inset-0 text-blue-300"
          style={{ clipPath: "polygon(0 55%, 100% 55%, 100% 100%, 0 100%)" }}
        >
          ZENIX
        </motion.span>
      </motion.h1>

      {/* Click Prompt */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.6 }}
        className="absolute bottom-16 sm:bottom-24"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 1.8, repeat: Infinity }}
          className="px-4 sm:px-6 py-2 sm:py-3 rounded-full bg-cyan-400/10 border border-cyan-400/30 backdrop-blur-sm"
        >
          <span className="text-cyan-400/90 text-sm sm:text-base tracking-[0.2em] font-medium">
            CLICK TO INITIALIZE
          </span>
          {/* Scanline Effect */}
          <motion.div
            animate={{ y: ["-100%", "100%"] }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "linear",
            }}
            className="absolute left-0 right-0 h-[2px] 
  bg-gradient-to-r 
  from-transparent 
  via-cyan-400 
  to-transparent 
  shadow-[0_0_20px_#00f7ff]"
          />
        </motion.div>
      </motion.div>
      {/* Scanline Effect */}
      <motion.div
        animate={{ y: ["-100%", "100%"] }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "linear",
        }}
        className="absolute top-0 left-0 right-0 h-[2px] 
bg-gradient-to-r 
from-transparent 
via-cyan-400 
to-transparent 
shadow-[0_0_20px_#00f7ff]"
      />
    </motion.div>
  );
};

export default StartScreen;

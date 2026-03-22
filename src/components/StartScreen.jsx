import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import AuthPanel from "./AuthPanel";

const MotionDiv = motion.div;
const MotionH1 = motion.h1;
const MotionSpan = motion.span;

function getViewportSize() {
  if (typeof window === "undefined") {
    return { width: 1920, height: 1080 };
  }

  return {
    width: window.innerWidth,
    height: window.innerHeight,
  };
}

function buildFloatingParticles({ width, height }) {
  return Array.from({ length: 8 }, (_, index) => ({
    id: index,
    startX: Math.random() * width,
    startY: Math.random() * height,
    endX: Math.random() * width,
    endY: Math.random() * height,
    duration: Math.random() * 5 + 3,
    delay: Math.random() * 3,
  }));
}

const StartScreen = ({
  setStart,
  authStatus,
  authUser,
  onLogin,
  onRegister,
  onLogout,
}) => {
  const [backgroundParticles, setBackgroundParticles] = useState(() =>
    buildFloatingParticles(getViewportSize()),
  );

  useEffect(() => {
    const handleResize = () => {
      setBackgroundParticles(buildFloatingParticles(getViewportSize()));
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleStart = () => {
    setStart(true);
  };

  return (
    <MotionDiv
      key="start-screen"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{
        opacity: 0,
        scale: 1.1,
        filter: "blur(10px)",
      }}
      transition={{ duration: 0.6, ease: "easeInOut" }}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          handleStart();
        }
      }}
      tabIndex={0}
      role="region"
      aria-label="ZENIX initialization screen"
      className="relative flex h-full w-full flex-col items-center justify-start overflow-x-hidden overflow-y-auto px-3 pb-8 pt-[7vh] sm:px-6 sm:pb-10 sm:pt-[10vh] lg:pt-[14vh]"
    >
      <MotionDiv
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="absolute inset-0 bg-[linear-gradient(rgba(0,247,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,247,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px]"
      />

      <MotionDiv
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

      <MotionDiv
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.15, 0.35, 0.15],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute h-[80vw] w-[80vw] rounded-full bg-cyan-400/20 blur-3xl sm:h-[500px] sm:w-[500px]"
      />

      <MotionDiv
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
        className="absolute h-[90vw] w-[90vw] rounded-full bg-blue-400/15 blur-3xl sm:h-[600px] sm:w-[600px]"
      />

      {backgroundParticles.map((particle) => (
        <MotionDiv
          key={particle.id}
          initial={{
            x: particle.startX,
            y: particle.startY,
            scale: 0,
            opacity: 0,
          }}
          animate={{
            x: [particle.startX, particle.startX, particle.endX],
            y: [particle.startY, -100, particle.endY],
            scale: [0, 1, 0],
            opacity: [0, 0.6, 0],
          }}
          transition={{
            duration: particle.duration,
            repeat: Infinity,
            delay: particle.delay,
            ease: "easeInOut",
          }}
          className="absolute h-1 w-1 rounded-full bg-cyan-400"
        />
      ))}

      <MotionDiv
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{
          type: "spring",
          stiffness: 150,
          damping: 15,
          delay: 0.2,
        }}
        className="relative mb-6 sm:mb-8"
      >
        <MotionDiv
          animate={{
            scale: [1, 1.15, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{ duration: 2.5, repeat: Infinity }}
          className="absolute -inset-6 rounded-full bg-cyan-400/20 blur-2xl"
        />

        <div
          className="relative flex h-24 w-24 items-center justify-center rounded-full 
          bg-[radial-gradient(circle_at_30%_30%,_#00f7ff_0%,_#0096c7_40%,_#001f2f_80%)]
          shadow-[0_0_100px_rgba(0,247,255,0.6)] sm:h-32 sm:w-32"
        >
          <MotionDiv
            animate={{
              scale: [1, 1.25, 1],
              opacity: [0.4, 0.9, 0.4],
            }}
            transition={{ duration: 1.8, repeat: Infinity }}
            className="absolute h-16 w-16 rounded-full bg-cyan-400/30 blur-xl sm:h-20 sm:w-20"
          />

          <MotionDiv
            animate={{ rotate: 360 }}
            transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 rounded-full border border-cyan-400/40"
            style={{
              background:
                "conic-gradient(from 0deg, transparent 0%, rgba(0,247,255,0.6) 20%, transparent 40%)",
            }}
          />

          <div className="absolute left-5 top-3 h-4 w-8 rotate-[-20deg] rounded-full bg-white/20 blur-sm" />

          <MotionDiv
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
              className="h-10 w-10 sm:h-14 sm:w-14"
            >
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
            </svg>
          </MotionDiv>

          {[0, 1, 2].map((index) => (
            <MotionDiv
              key={index}
              initial={{ scale: 1, opacity: 0.6 }}
              animate={{
                scale: 2.2,
                opacity: 0,
              }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                delay: index * 0.7,
                ease: "easeOut",
              }}
              className="absolute inset-0 rounded-full border border-cyan-400"
            />
          ))}
        </div>

        <MotionDiv
          animate={{ rotate: 360 }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          className="absolute -inset-5 rounded-full border-2 border-dashed border-cyan-400/30"
        />

        <MotionDiv
          animate={{ rotate: -360 }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute -inset-6 rounded-full border border-dotted border-blue-400/20"
        />

        {[0, 120, 240].map((angle, index) => (
          <MotionDiv
            key={angle}
            animate={{ rotate: 360 }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "linear",
              delay: index * 0.3,
            }}
            className="absolute inset-0"
          >
            <div
              className="absolute h-2 w-2 rounded-full bg-cyan-400 shadow-[0_0_10px_#00f7ff]"
              style={{
                top: "50%",
                left: "50%",
                transform: `translate(-50%, -50%) rotate(${angle}deg) translateY(-60px)`,
              }}
            />
          </MotionDiv>
        ))}
      </MotionDiv>

      <MotionH1
        animate={{
          textShadow: [
            "0 0 20px #00f7ff, 0 0 40px #00f7ff",
            "0 0 40px #00f7ff, 0 0 70px #0096c7",
            "0 0 20px #00f7ff, 0 0 40px #00f7ff",
          ],
        }}
        transition={{ duration: 3, repeat: Infinity }}
        className="relative text-center text-[clamp(2.7rem,10vw,5.2rem)] font-extrabold tracking-[0.18em] text-cyan-400 sm:tracking-[0.28em]"
      >
        ZENIX
        <MotionSpan
          animate={{ x: [-3, 3, -3], opacity: [0, 0.5, 0] }}
          transition={{ duration: 0.15, repeat: Infinity, repeatDelay: 5 }}
          className="absolute inset-0 text-cyan-300"
          style={{ clipPath: "polygon(0 0, 100% 0, 100% 45%, 0 45%)" }}
        >
          ZENIX
        </MotionSpan>
        <MotionSpan
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
        </MotionSpan>
      </MotionH1>

      <MotionDiv
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.55 }}
        className="relative z-20 mt-3 text-center sm:mt-4"
      >
        <p className="text-xs uppercase tracking-[0.24em] text-cyan-300/65 sm:text-sm sm:tracking-[0.34em]">
          Voice Enabled Intelligent System Assistant
        </p>
        <p className="mt-3 max-w-2xl px-2 text-sm leading-6 text-slate-300/75 sm:leading-7">
          Authenticate to unlock persistent chat memory, or continue in guest
          mode for a local session.
        </p>
      </MotionDiv>

      <AuthPanel
        authStatus={authStatus}
        authUser={authUser}
        onLogin={onLogin}
        onRegister={onRegister}
        onLogout={onLogout}
        onStart={handleStart}
      />

      <MotionDiv
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4 }}
        className="pointer-events-none relative z-20 mt-4 px-3 pb-2 text-center text-[11px] uppercase tracking-[0.14em] text-cyan-400/45 sm:mt-5 sm:text-xs sm:tracking-[0.22em]"
      >
        {authStatus === "loading"
          ? "Synchronizing session..."
          : authUser
            ? `Authenticated as ${authUser.email}`
            : "Guest mode keeps chat only for this browser session"}
      </MotionDiv>

      <MotionDiv
        animate={{ y: ["-100%", "100%"] }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "linear",
        }}
        className="absolute left-0 right-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_20px_#00f7ff]"
      />
    </MotionDiv>
  );
};

export default StartScreen;

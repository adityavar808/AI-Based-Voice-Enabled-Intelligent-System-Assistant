import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import SystemLogs from "./SystemLogs";
import OrbCore from "./OrbCore";

const MotionDiv = motion.div;

function CinematicBoot({
  isSpeaking,
  audioLevel,
  audioRef,
  setIsOrbReady,
  compact = false,
}) {
  const [bootPhase, setBootPhase] = useState("initializing");

  useEffect(() => {
    const timer1 = setTimeout(() => setBootPhase("booting"), 1000);
    const timer2 = setTimeout(() => setBootPhase("ready"), 6000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  // 🔥 Notify when Orb becomes active
  useEffect(() => {
    if (bootPhase === "ready" && setIsOrbReady) {
      setIsOrbReady(true);
    }
  }, [bootPhase, setIsOrbReady]);

  if (bootPhase === "initializing" || bootPhase === "booting") {
    return (
      <div className="relative h-[100dvh] w-full overflow-hidden bg-black text-cyan-400">
        {/* Background Glow */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,#001f2f_0%,#000000_70%)]" />

        {/* Subtle Moving Glow */}
        <MotionDiv
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute inset-0 bg-[radial-gradient(circle_at_40%_50%,rgba(0,247,255,0.25),transparent_60%)] blur-3xl"
        />

        {/* Grid Overlay */}
        <div
          className="absolute inset-0 
          bg-[linear-gradient(rgba(0,247,255,0.03)_1px,transparent_1px),
          linear-gradient(90deg,rgba(0,247,255,0.03)_1px,transparent_1px)]
          bg-[size:40px_40px] opacity-20"
        />

        {/* Main Layout */}
        <div
          className={`relative flex h-full w-full ${
            compact
              ? "flex-col justify-center gap-6 px-4 py-24"
              : "items-center justify-center gap-16 px-10"
          }`}
        >
          <MotionDiv
            initial={{ opacity: 0, x: -100 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1, duration: 1 }}
            className={compact ? "w-full max-w-xl" : "w-[40%] max-w-2xl"}
          >
            <SystemLogs />
          </MotionDiv>

          <MotionDiv
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1.2, duration: 1 }}
            className={`relative bg-[#020611]/80 backdrop-blur-xl border border-cyan-500/30 shadow-[0_0_30px_rgba(0,229,255,0.1)] p-1 overflow-hidden ${
              compact ? "w-full max-w-xl" : "w-[30%]"
            }`}
          >
            {/* Corner Brackets */}
            <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-cyan-400" />
            <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-cyan-400" />
            <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-cyan-400" />
            <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-cyan-400" />

            <div className="bg-black/60 p-5 space-y-5 relative z-10">
              {/* Header */}
              <div className="flex justify-between items-center border-b border-cyan-500/20 pb-2">
                <p className="text-xs tracking-[0.35em] text-cyan-400 uppercase">
                  System Monitor
                </p>
                <span className="text-[10px] text-emerald-400 animate-pulse tracking-widest">
                  LIVE
                </span>
              </div>

              {/* CPU */}
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] text-cyan-500/70 tracking-widest">
                  <span>CPU_USAGE</span>
                  <span className="text-white font-bold">42%</span>
                </div>
                <div className="relative h-1 bg-cyan-950/40 border border-cyan-500/20 overflow-hidden">
                  <div className="h-full bg-cyan-400 w-[42%] shadow-[0_0_10px_rgba(0,229,255,0.6)]" />
                </div>
                <p className="text-[9px] text-cyan-400/60 tracking-widest">
                  CORE LOAD STABLE
                </p>
              </div>

              {/* Memory */}
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] text-cyan-500/70 tracking-widest">
                  <span>MEMORY</span>
                  <span className="text-white font-bold">6.7GB</span>
                </div>
                <div className="relative h-1 bg-cyan-950/40 border border-cyan-500/20 overflow-hidden">
                  <div className="h-full bg-indigo-400 w-[65%] shadow-[0_0_10px_rgba(99,102,241,0.6)]" />
                </div>
                <p className="text-[9px] text-cyan-400/60 tracking-widest">
                  HEAP STABILIZED
                </p>
              </div>

              {/* Network */}
              <div className="flex justify-between items-center text-[10px] text-cyan-500/70 border-t border-cyan-500/20 pt-3 tracking-widest">
                <span>NETWORK</span>
                <span className="text-emerald-400 font-bold animate-pulse">
                  SECURE
                </span>
              </div>
            </div>
          </MotionDiv>
        </div>

        <MotionDiv
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
          className={`absolute left-1/2 -translate-x-1/2 text-sm tracking-widest text-cyan-400/60 font-mono ${
            compact ? "bottom-6" : "bottom-10"
          }`}
        >
          ZENIX AI BOOTING...
        </MotionDiv>
      </div>
    );
  }

  // 🔥 Orb Phase
  return (
    <AnimatePresence mode="wait">
      <MotionDiv
        key="orb"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.8 }}
        className="w-full h-full bg-black flex items-center justify-center"
      >
        <OrbCore
          isSpeaking={isSpeaking}
          audioLevel={audioLevel}
          audioRef={audioRef}
        />
      </MotionDiv>
    </AnimatePresence>
  );
}

export default CinematicBoot;

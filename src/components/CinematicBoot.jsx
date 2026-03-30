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
            className={`relative rounded-2xl p-5 bg-[#021423]/70 border border-cyan-500/40 backdrop-blur-2xl shadow-[0_0_50px_rgba(0,255,255,0.25)] ${
              compact ? "w-full max-w-xl" : "w-[30%]"
            }`}
          >
            <div className="absolute inset-0 pointer-events-none rounded-2xl bg-[radial-gradient(circle_at_20%_20%,rgba(0,255,255,0.35),transparent_40%)] mix-blend-screen" />
            <div className="absolute inset-0 pointer-events-none rounded-2xl border border-cyan-300/20 backdrop-blur-sm" />
            <div className="absolute top-3 left-3 flex items-center gap-2 text-[10px] tracking-wider uppercase text-cyan-300">
              <span className="h-2 w-2 rounded-full bg-emerald-400/90 animate-pulse shadow-[0_0_8px_rgba(0,255,170,0.75)]" />
              LIVE
            </div>
            <div className="absolute top-3 right-3 h-2 w-2 rounded-full border border-cyan-400 animate-[pulse_1.2s_ease-in-out_infinite]" />

            <h2 className="relative z-10 text-xl font-bold tracking-wider mb-5 text-cyan-200 border-b border-cyan-400/25 pb-3">
              SYSTEM MONITOR
            </h2>

            <div className="space-y-4 text-sm font-mono text-cyan-100 relative z-10">
              <div className="rounded-md border border-cyan-500/30 bg-[#06172d]/70 p-3 shadow-[0_0_15px_rgba(0,255,255,0.2)]">
                <div className="flex justify-between items-center text-xs uppercase tracking-widest text-cyan-300">
                  <span>CPU Usage</span>
                  <span className="font-bold text-cyan-50">42%</span>
                </div>
                <div className="mt-2 h-2 bg-cyan-500/15 rounded-full overflow-hidden">
                  <MotionDiv
                    initial={{ width: 0 }}
                    animate={{ width: "42%" }}
                    transition={{ duration: 1.5 }}
                    className="h-full bg-gradient-to-r from-cyan-300 to-cyan-500"
                  />
                </div>
                <p className="mt-2 text-[10px] text-cyan-300/70">Core load smooth, no anomalies</p>
              </div>

              <div className="rounded-md border border-cyan-500/30 bg-[#06172d]/70 p-3 shadow-[0_0_15px_rgba(0,155,255,0.2)]">
                <div className="flex justify-between items-center text-xs uppercase tracking-widest text-cyan-300">
                  <span>Memory</span>
                  <span className="font-bold text-cyan-50">6.7GB</span>
                </div>
                <div className="mt-2 h-2 bg-cyan-500/15 rounded-full overflow-hidden">
                  <MotionDiv
                    initial={{ width: 0 }}
                    animate={{ width: "68%" }}
                    transition={{ duration: 1.5 }}
                    className="h-full bg-gradient-to-r from-blue-300 to-blue-500"
                  />
                </div>
                <p className="mt-2 text-[10px] text-cyan-300/70">Memory heap stabilized</p>
              </div>

              <div className="rounded-md border border-cyan-500/30 bg-[#06172d]/70 p-3 flex justify-between items-center text-xs uppercase tracking-widest text-cyan-300 shadow-[0_0_15px_rgba(0,200,120,0.2)]">
                <span>Network</span>
                <span className="font-bold text-emerald-300">SECURE</span>
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

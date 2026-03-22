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
            className={`rounded-2xl p-6 
              bg-gradient-to-br from-slate-900/60 to-slate-800/30
              border border-cyan-400/30 
              backdrop-blur-xl 
              shadow-[0_0_40px_rgba(0,247,255,0.15)] ${
                compact ? "w-full max-w-xl" : "w-[30%]"
              }`}
          >
            <h2 className="text-lg font-semibold tracking-wider mb-6 text-cyan-400">
              SYSTEM MONITOR
            </h2>

            <div className="space-y-4 text-sm font-mono">
              <div>
                <div className="flex justify-between">
                  <span>CPU Usage</span>
                  <span>42%</span>
                </div>
                <div className="h-2 bg-slate-800 rounded-full overflow-hidden mt-1">
                  <MotionDiv
                    initial={{ width: 0 }}
                    animate={{ width: "42%" }}
                    transition={{ duration: 1.5 }}
                    className="h-full bg-cyan-400"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between">
                  <span>Memory</span>
                  <span>6.7GB</span>
                </div>
                <div className="h-2 bg-slate-800 rounded-full overflow-hidden mt-1">
                  <MotionDiv
                    initial={{ width: 0 }}
                    animate={{ width: "68%" }}
                    transition={{ duration: 1.5 }}
                    className="h-full bg-blue-400"
                  />
                </div>
              </div>

              <div className="flex justify-between pt-4 border-t border-cyan-400/20">
                <span>Network</span>
                <span className="text-emerald-400">SECURE</span>
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

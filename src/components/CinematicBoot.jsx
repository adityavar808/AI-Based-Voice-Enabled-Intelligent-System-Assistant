import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import SystemLogs from "./SystemLogs";
import OrbCore from "./OrbCore";
import { AnimatePresence } from "framer-motion";

function CinematicBoot() {
  const [bootPhase, setBootPhase] = useState("initializing");

  useEffect(() => {
    const timer1 = setTimeout(() => setBootPhase("booting"), 1000);
    const timer2 = setTimeout(() => setBootPhase("ready"), 6000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  if (bootPhase === "initializing" || bootPhase === "booting") {
    return (
      <div className="relative w-full h-screen bg-black overflow-hidden text-cyan-400">
        {/* Background Glow */}
        <div
          className="absolute inset-0 
          bg-[radial-gradient(circle_at_center,#001f2f_0%,#000000_70%)]"
        />

        {/* Subtle Moving Glow */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute inset-0 
            bg-[radial-gradient(circle_at_40%_50%,rgba(0,247,255,0.25),transparent_60%)]
            blur-3xl"
        />

        {/* Grid Overlay */}
        <div
          className="absolute inset-0 
          bg-[linear-gradient(rgba(0,247,255,0.03)_1px,transparent_1px),
          linear-gradient(90deg,rgba(0,247,255,0.03)_1px,transparent_1px)]
          bg-[size:40px_40px] opacity-20"
        />

        {/* Main Layout */}
        <div className="relative w-full h-full flex items-center justify-center gap-16 px-10">
          {/* LEFT PANEL — SYSTEM LOGS */}
          <motion.div
            initial={{ opacity: 0, x: -100 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1, duration: 1 }}
            className="w-[40%] max-w-2xl"
          >
            <SystemLogs />
          </motion.div>

          {/* RIGHT PANEL — SYSTEM MONITOR */}
          <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1.2, duration: 1 }}
            className="w-[30%] rounded-2xl p-6 
              bg-gradient-to-br from-slate-900/60 to-slate-800/30
              border border-cyan-400/30 
              backdrop-blur-xl 
              shadow-[0_0_40px_rgba(0,247,255,0.15)]"
          >
            <h2 className="text-lg font-semibold tracking-wider mb-6 text-cyan-400">
              SYSTEM MONITOR
            </h2>

            {/* CPU */}
            <div className="space-y-4 text-sm font-mono">
              <div>
                <div className="flex justify-between">
                  <span>CPU Usage</span>
                  <span>42%</span>
                </div>
                <div className="h-2 bg-slate-800 rounded-full overflow-hidden mt-1">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: "42%" }}
                    transition={{ duration: 1.5 }}
                    className="h-full bg-cyan-400"
                  />
                </div>
              </div>

              {/* Memory */}
              <div>
                <div className="flex justify-between">
                  <span>Memory</span>
                  <span>6.7GB</span>
                </div>
                <div className="h-2 bg-slate-800 rounded-full overflow-hidden mt-1">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: "68%" }}
                    transition={{ duration: 1.5 }}
                    className="h-full bg-blue-400"
                  />
                </div>
              </div>

              {/* Network */}
              <div className="flex justify-between pt-4 border-t border-cyan-400/20">
                <span>Network</span>
                <span className="text-emerald-400">SECURE</span>
              </div>
            </div>

            {/* Animated Bars */}
            <div className="flex gap-1 items-end h-16 mt-8">
              {[...Array(12)].map((_, i) => (
                <motion.div
                  key={i}
                  animate={{
                    height: ["30%", "100%", "40%", "80%", "50%"],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: i * 0.1,
                  }}
                  className="flex-1 bg-gradient-to-t from-cyan-400/60 to-blue-400 rounded-sm"
                />
              ))}
            </div>
          </motion.div>
        </div>

        {/* Bottom Boot Status */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 
            text-sm tracking-widest text-cyan-400/60 font-mono"
        >
          ZENIX AI BOOTING...
        </motion.div>
      </div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key="orb"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.8 }}
        className="w-full h-full bg-black flex items-center justify-center"
      >
        <OrbCore />
      </motion.div>
    </AnimatePresence>
  );
}

export default CinematicBoot;

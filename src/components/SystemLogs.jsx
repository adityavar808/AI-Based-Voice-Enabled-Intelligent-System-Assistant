import { motion } from "framer-motion";
import { useState, useEffect } from "react";

const initialLogs = [
  { text: "Initializing neural framework", status: "loading" },
  { text: "Loading core systems", status: "loading" },
  { text: "Synchronizing quantum matrix", status: "loading" },
  { text: "Establishing secure connections", status: "loading" },
  { text: "Calibrating voice recognition", status: "loading" },
  { text: "Activating AI consciousness", status: "loading" },
];

function SystemLogs() {
  const [logs, setLogs] = useState(initialLogs);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timers = logs.map((_, index) =>
      setTimeout(
        () => {
          setLogs((prev) =>
            prev.map((log, i) =>
              i === index ? { ...log, status: "complete" } : log,
            ),
          );
          setProgress(((index + 1) / logs.length) * 100);
        },
        1500 + index * 600,
      ),
    );

    return () => timers.forEach((timer) => clearTimeout(timer));
  }, [logs.length]); // ✅ Add logs.length as dependency

  const StatusIcon = ({ status }) => {
    if (status === "loading") {
      return (
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-4 h-4"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
          </svg>
        </motion.div>
      );
    }

    // ✅ Return checkmark for complete status
    return (
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 200 }}
        className="w-4 h-4 text-emerald-400"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </motion.div>
    );
  };
  return (
    <div className="w-full max-w-lg">
      {/* Progress Bar */}
      <motion.div
        initial={{ opacity: 0, scaleX: 0 }}
        animate={{ opacity: 1, scaleX: 1 }}
        transition={{ delay: 1, duration: 0.8 }}
        className="mb-8 relative"
      >
        <div className="h-1.5 bg-slate-800/50 rounded-full overflow-hidden backdrop-blur-sm border border-cyan-400/20">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5 }}
            className="h-full bg-gradient-to-r from-cyan-400 via-blue-400 to-cyan-400 relative"
          >
            {/* Shimmer Effect */}
            <motion.div
              animate={{ x: ["-100%", "200%"] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
            />
          </motion.div>
        </div>

        {/* Progress Percentage */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute -top-6 right-0 text-xs text-cyan-400/80 font-mono"
        >
          {Math.round(progress)}%
        </motion.div>
      </motion.div>

      {/* Logs Container */}
      <div
        className="space-y-3 relative rounded-2xl p-6 
bg-gradient-to-br from-slate-900/60 to-slate-800/30
border border-cyan-400/30 
backdrop-blur-xl 
shadow-[0_0_40px_rgba(0,247,255,0.15)]"
      >
        <motion.div
          animate={{ y: ["-100%", "100%"] }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute inset-0 
    bg-gradient-to-b 
    from-transparent 
    via-cyan-400/10 
    to-transparent 
    pointer-events-none"
        />

        {logs.map((log, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1.3 + index * 0.4 }}
            className="flex items-center gap-3 group"
          >
            {/* Status Icon */}
            <div
              className={`
              flex-shrink-0 
              ${log.status === "loading" ? "text-cyan-400/60" : "text-emerald-400"}
            `}
            >
              <StatusIcon status={log.status} />
            </div>

            {/* Log Text */}
            <div className="flex-1 flex items-center gap-2">
              <motion.span
                className={`
                  text-sm tracking-wide font-mono
                  ${log.status === "loading" ? "text-cyan-400/70" : "text-cyan-400/90"}
                `}
              >
                {log.text}
              </motion.span>

              {/* Loading Dots */}
              {log.status === "loading" && (
                <div className="flex gap-1">
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      animate={{
                        opacity: [0.3, 1, 0.3],
                        scale: [0.8, 1.2, 0.8],
                      }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                        delay: i * 0.2,
                      }}
                      className="w-1 h-1 bg-cyan-400 rounded-full"
                    />
                  ))}
                </div>
              )}

              {/* Complete Checkmark */}
              {log.status === "complete" && (
                <motion.span
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: "spring", stiffness: 200 }}
                  className="text-xs text-emerald-400 font-semibold"
                >
                  ✓ OK
                </motion.span>
              )}
            </div>

            {/* Timestamp */}
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5 + index * 0.4 }}
              className="text-xs text-cyan-400/40 font-mono"
            >
              {`00:0${index}`}
            </motion.span>
          </motion.div>
        ))}

        {/* Final Success Message */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{
            opacity: progress === 100 ? 1 : 0,
            y: progress === 100 ? 0 : 10,
          }}
          transition={{ delay: 5 }}
          className="mt-6 pt-4 border-t border-cyan-400/20"
        ></motion.div>
      </div>

      {/* System Info Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 4 }}
        className="mt-6 flex items-center justify-between text-xs text-cyan-400/40 px-2"
      >
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 bg-cyan-400/50 rounded-full" />
          <span>ZENIX AI CORE</span>
        </div>
        <div className="flex items-center gap-2">
          <span>BUILD 2025.02</span>
          <div className="w-1.5 h-1.5 bg-cyan-400/50 rounded-full" />
        </div>
      </motion.div>

      {/* Animated Corner Brackets */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        {[
          { top: 0, left: 0 },
          { top: 0, right: 0 },
          { bottom: 0, left: 0 },
          { bottom: 0, right: 0 },
        ].map((pos, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 0.3, scale: 1 }}
            transition={{ delay: 0.5 + i * 0.1 }}
            className="absolute w-8 h-8"
            style={pos}
          >
            <svg viewBox="0 0 32 32" className="text-cyan-400">
              <path
                d={
                  i === 0
                    ? "M 0 8 L 0 0 L 8 0"
                    : i === 1
                      ? "M 24 0 L 32 0 L 32 8"
                      : i === 2
                        ? "M 0 24 L 0 32 L 8 32"
                        : "M 24 32 L 32 32 L 32 24"
                }
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              />
            </svg>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export default SystemLogs;

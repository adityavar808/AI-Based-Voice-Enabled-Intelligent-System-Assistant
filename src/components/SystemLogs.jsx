import { motion } from "framer-motion";
import { useEffect, useState } from "react";

const MotionDiv = motion.div;
const MotionSpan = motion.span;

const initialLogs = [
  { text: "Initializing neural framework", status: "loading" },
  { text: "Loading core systems", status: "loading" },
  { text: "Synchronizing quantum matrix", status: "loading" },
  { text: "Establishing secure connections", status: "loading" },
  { text: "Calibrating voice recognition", status: "loading" },
  { text: "Activating AI consciousness", status: "loading" },
];

function StatusIcon({ status }) {
  if (status === "loading") {
    return (
      <MotionDiv
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        className="h-4 w-4"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M21 12a9 9 0 1 1-6.219-8.56" />
        </svg>
      </MotionDiv>
    );
  }

  return (
    <MotionDiv
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: "spring", stiffness: 200 }}
      className="h-4 w-4 text-emerald-400"
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <polyline points="20 6 9 17 4 12" />
      </svg>
    </MotionDiv>
  );
}

function SystemLogs() {
  const [logs, setLogs] = useState(initialLogs);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const totalLogs = initialLogs.length;
    const timers = initialLogs.map((_, index) =>
      setTimeout(() => {
        setLogs((prev) =>
          prev.map((log, i) =>
            i === index ? { ...log, status: "complete" } : log,
          ),
        );
        setProgress(((index + 1) / totalLogs) * 100);
      }, 1500 + index * 600),
    );

    return () => timers.forEach((timer) => clearTimeout(timer));
  }, []);

  return (
    <div className="w-full max-w-lg">
      <MotionDiv
        initial={{ opacity: 0, scaleX: 0 }}
        animate={{ opacity: 1, scaleX: 1 }}
        transition={{ delay: 1, duration: 0.8 }}
        className="relative mb-8"
      >
        <div className="h-1.5 overflow-hidden rounded-full border border-cyan-400/20 bg-slate-800/50 backdrop-blur-sm">
          <MotionDiv
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5 }}
            className="relative h-full bg-gradient-to-r from-cyan-400 via-blue-400 to-cyan-400"
          >
            <MotionDiv
              animate={{ x: ["-100%", "200%"] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
            />
          </MotionDiv>
        </div>

        <MotionDiv
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute -top-6 right-0 font-mono text-xs text-cyan-400/80"
        >
          {Math.round(progress)}%
        </MotionDiv>
      </MotionDiv>

      <div
        className="relative space-y-3 rounded-2xl border border-cyan-400/30 
bg-gradient-to-br from-slate-900/60 to-slate-800/30 p-6 
backdrop-blur-xl shadow-[0_0_40px_rgba(0,247,255,0.15)]"
      >
        <MotionDiv
          animate={{ y: ["-100%", "100%"] }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "linear",
          }}
          className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-cyan-400/10 to-transparent"
        />

        {logs.map((log, index) => (
          <MotionDiv
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1.3 + index * 0.4 }}
            className="group flex items-center gap-3"
          >
            <div
              className={`
                flex-shrink-0
                ${log.status === "loading" ? "text-cyan-400/60" : "text-emerald-400"}
              `}
            >
              <StatusIcon status={log.status} />
            </div>

            <div className="flex flex-1 items-center gap-2">
              <MotionSpan
                className={`
                  font-mono text-sm tracking-wide
                  ${log.status === "loading" ? "text-cyan-400/70" : "text-cyan-400/90"}
                `}
              >
                {log.text}
              </MotionSpan>

              {log.status === "loading" && (
                <div className="flex gap-1">
                  {[0, 1, 2].map((dotIndex) => (
                    <MotionDiv
                      key={dotIndex}
                      animate={{
                        opacity: [0.3, 1, 0.3],
                        scale: [0.8, 1.2, 0.8],
                      }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                        delay: dotIndex * 0.2,
                      }}
                      className="h-1 w-1 rounded-full bg-cyan-400"
                    />
                  ))}
                </div>
              )}

              {log.status === "complete" && (
                <MotionSpan
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: "spring", stiffness: 200 }}
                  className="text-xs font-semibold text-emerald-400"
                >
                  OK
                </MotionSpan>
              )}
            </div>

            <MotionSpan
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5 + index * 0.4 }}
              className="font-mono text-xs text-cyan-400/40"
            >
              {`00:0${index}`}
            </MotionSpan>
          </MotionDiv>
        ))}

        <MotionDiv
          initial={{ opacity: 0, y: 10 }}
          animate={{
            opacity: progress === 100 ? 1 : 0,
            y: progress === 100 ? 0 : 10,
          }}
          transition={{ delay: 5 }}
          className="mt-6 border-t border-cyan-400/20 pt-4"
        />
      </div>

      <MotionDiv
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 4 }}
        className="mt-6 flex items-center justify-between px-2 text-xs text-cyan-400/40"
      >
        <div className="flex items-center gap-2">
          <div className="h-1.5 w-1.5 rounded-full bg-cyan-400/50" />
          <span>ZENIX AI CORE</span>
        </div>
        <div className="flex items-center gap-2">
          <span>BUILD 2025.02</span>
          <div className="h-1.5 w-1.5 rounded-full bg-cyan-400/50" />
        </div>
      </MotionDiv>

      <div className="pointer-events-none absolute left-0 top-0 h-full w-full">
        {[
          { top: 0, left: 0 },
          { top: 0, right: 0 },
          { bottom: 0, left: 0 },
          { bottom: 0, right: 0 },
        ].map((position, index) => (
          <MotionDiv
            key={index}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 0.3, scale: 1 }}
            transition={{ delay: 0.5 + index * 0.1 }}
            className="absolute h-8 w-8"
            style={position}
          >
            <svg viewBox="0 0 32 32" className="text-cyan-400">
              <path
                d={
                  index === 0
                    ? "M 0 8 L 0 0 L 8 0"
                    : index === 1
                      ? "M 24 0 L 32 0 L 32 8"
                      : index === 2
                        ? "M 0 24 L 0 32 L 8 32"
                        : "M 24 32 L 32 32 L 32 24"
                }
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              />
            </svg>
          </MotionDiv>
        ))}
      </div>
    </div>
  );
}

export default SystemLogs;

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

function OrbCore() {
  const [phase, setPhase] = useState("idle");
  // idle | listening | processing | responding

  const startInteraction = () => {
    if (phase !== "idle") return;

    setPhase("listening");

    setTimeout(() => {
      setPhase("processing");

      setTimeout(() => {
        setPhase("responding");

        setTimeout(() => {
          setPhase("idle");
        }, 4000);
      }, 2000);
    }, 2000);
  };

  return (
    <motion.div
  animate={
    phase === "listening"
      ? { x: [-2, 2, -2] }
      : { x: 0 }
  }
  transition={{
    duration: 0.1,
    repeat: phase === "listening" ? Infinity : 0,
  }}
  className="relative flex items-center justify-center"
>

      {/* Outer Glow Pulse - Triple Layer */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{
          scale: [1, 1.4, 1],
          opacity: [0.2, 0.4, 0.2],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute w-[500px] h-[500px] rounded-full bg-cyan-400/10 blur-3xl"
      />

      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{
          scale: [1.1, 1.5, 1.1],
          opacity: [0.15, 0.3, 0.15],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 0.5,
        }}
        className="absolute w-[550px] h-[550px] rounded-full bg-blue-400/10 blur-3xl"
      />

      {/* Outer Expanding Ring with Glow */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1.2, opacity: 0.6 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
        className="absolute w-[400px] h-[400px] border-2 border-cyan-400/60 rounded-full shadow-[0_0_20px_rgba(0,247,255,0.3)]"
      />

      {/* Secondary Pulse Ring */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{
          scale: [0.9, 1.15, 0.9],
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{
          duration: 2.5,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 0.3,
        }}
        className="absolute w-[370px] h-[370px] border-2 border-cyan-400/40 rounded-full shadow-[0_0_15px_rgba(0,247,255,0.2)]"
      />

      {/* Tertiary Pulse Ring */}
      <motion.div
        initial={{ scale: 0.7, opacity: 0 }}
        animate={{
          scale: [0.85, 1.1, 0.85],
          opacity: [0.2, 0.5, 0.2],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 0.6,
        }}
        className="absolute w-[340px] h-[340px] border border-cyan-400/30 rounded-full"
      />

      {/* Main Core with Enhanced Gradient */}
      <motion.div
        onClick={startInteraction}
        initial={{ scale: 0 }}
        animate={{
          scale: 1,
          boxShadow:
            phase === "listening"
              ? "0 0 120px #00f7ff, inset 0 0 60px rgba(0,247,255,0.4)"
              : phase === "processing"
                ? "0 0 150px #0096c7, inset 0 0 80px rgba(0,150,255,0.5)"
                : phase === "responding"
                  ? "0 0 180px #00eaff, inset 0 0 100px rgba(0,247,255,0.6)"
                  : undefined,
        }}
        transition={{ duration: 1.2 }}
        className="relative w-[280px] h-[280px] rounded-full cursor-pointer
bg-[radial-gradient(circle_at_30%_30%,_#00f7ff_0%,_#0096c7_30%,_#001f2f_70%)]
shadow-[0_0_80px_#00f7ff,_inset_0_0_40px_rgba(0,247,255,0.3)]"
      >
        {/* Inner Shimmer - Multi-layer */}
        <motion.div
          animate={{
            scale: [1, 1.15, 1],
            opacity: [0.4, 0.7, 0.4],
          }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute inset-10 rounded-full bg-cyan-400/30 blur-2xl"
        />

        <motion.div
          animate={{
            scale: [1.1, 1.3, 1.1],
            opacity: [0.2, 0.5, 0.2],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.5,
          }}
          className="absolute inset-16 rounded-full bg-blue-400/20 blur-xl"
        />

        {/* Core Energy Center */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.6, 1, 0.6],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-cyan-400/80 blur-md"
        />

        {/* Core Particles - Radial Burst */}
        {[...Array(12)].map((_, i) => {
          const angle = (i * 30 * Math.PI) / 180;
          const distance1 = 60;
          const distance2 = 110;

          return (
            <motion.div
              key={i}
              initial={{ scale: 0, opacity: 0 }}
              animate={{
                scale: [0, 1.2, 0],
                opacity: [0, 1, 0],
                x: [
                  0,
                  Math.cos(angle) * distance1,
                  Math.cos(angle) * distance2,
                ],
                y: [
                  0,
                  Math.sin(angle) * distance1,
                  Math.sin(angle) * distance2,
                ],
              }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                delay: i * 0.15,
                ease: "easeOut",
              }}
              className="absolute top-1/2 left-1/2 w-2 h-2 bg-cyan-400 rounded-full shadow-[0_0_8px_#00f7ff]"
              style={{ marginLeft: "-4px", marginTop: "-4px" }}
            />
          );
        })}

        {/* Floating Light Specs */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={`spec-${i}`}
            initial={{
              x: Math.random() * 200 - 100,
              y: Math.random() * 200 - 100,
              opacity: 0,
            }}
            animate={{
              x: Math.random() * 200 - 100,
              y: Math.random() * 200 - 100,
              opacity: [0, 0.8, 0],
              scale: [0, 1, 0],
            }}
            transition={{
              duration: Math.random() * 3 + 2,
              repeat: Infinity,
              delay: i * 0.5,
              ease: "easeInOut",
            }}
            className="absolute top-1/2 left-1/2 w-1 h-1 bg-cyan-300 rounded-full"
          />
        ))}
      </motion.div>

      {/* Rotating Ring 1 - Fast with Multiple Orbital Dots */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, rotate: 360 }}
        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        className="absolute w-[340px] h-[340px] border-2 border-cyan-400/50 rounded-full shadow-[0_0_10px_rgba(0,247,255,0.2)]"
      >
        {/* Primary Orbital Dot */}
        <motion.div
          className="absolute top-0 left-1/2 w-3 h-3 bg-cyan-400 rounded-full -translate-x-1/2 shadow-[0_0_10px_#00f7ff]"
          animate={{
            boxShadow: [
              "0 0 10px #00f7ff",
              "0 0 25px #00f7ff",
              "0 0 10px #00f7ff",
            ],
            scale: [1, 1.3, 1],
          }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />

        {/* Secondary Orbital Dot */}
        <motion.div
          className="absolute bottom-0 left-1/2 w-2 h-2 bg-blue-400 rounded-full -translate-x-1/2 shadow-[0_0_8px_#0096c7]"
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.6, 1, 0.6],
          }}
          transition={{ duration: 1.2, repeat: Infinity }}
        />

        {/* Trail Effect */}
        <motion.div className="absolute top-0 left-1/2 w-1 h-20 bg-gradient-to-b from-cyan-400/60 to-transparent -translate-x-1/2 blur-sm" />
      </motion.div>

      {/* Rotating Ring 2 - Medium Speed Counter-clockwise */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.8, rotate: -360 }}
        transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
        className="absolute w-[310px] h-[310px] border border-dashed border-cyan-400/40 rounded-full"
      >
        {/* Orbital Dot */}
        <motion.div
          className="absolute top-1/2 right-0 w-2.5 h-2.5 bg-cyan-400/80 rounded-full -translate-y-1/2 shadow-[0_0_8px_#00f7ff]"
          animate={{
            scale: [1, 1.4, 1],
            opacity: [0.7, 1, 0.7],
          }}
          transition={{ duration: 1.8, repeat: Infinity }}
        />
      </motion.div>

      {/* Rotating Ring 3 - Slow with Dotted Pattern */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.6, rotate: 360 }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="absolute w-[380px] h-[380px] border border-dotted border-cyan-400/30 rounded-full"
      >
        {/* Corner Accent Dots */}
        {[0, 90, 180, 270].map((angle, i) => (
          <motion.div
            key={angle}
            className="absolute w-1.5 h-1.5 bg-cyan-400/60 rounded-full"
            style={{
              top: "50%",
              left: "50%",
              transform: `translate(-50%, -50%) rotate(${angle}deg) translateY(-190px)`,
            }}
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.4, 1, 0.4],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: i * 0.3,
            }}
          />
        ))}
      </motion.div>

      {/* Scan Line Effect - Vertical */}
      <motion.div
        initial={{ y: -150, opacity: 0 }}
        animate={{
          y: 150,
          opacity: [0, 0.9, 0.9, 0],
        }}
        transition={{
          duration: 2.5,
          repeat: Infinity,
          repeatDelay: 3,
          ease: "easeInOut",
        }}
        className="absolute w-[280px] h-[4px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent blur-[2px] shadow-[0_0_15px_#00f7ff]"
      />

      {/* Scan Line Effect - Horizontal */}
      <motion.div
        initial={{ x: -150, opacity: 0 }}
        animate={{
          x: 150,
          opacity: [0, 0.7, 0.7, 0],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          repeatDelay: 4,
          ease: "easeInOut",
          delay: 1,
        }}
        className="absolute w-[4px] h-[280px] bg-gradient-to-b from-transparent via-cyan-400/70 to-transparent blur-[2px]"
      />

      {/* Energy Bars - Audio Visualizer Style */}
      <div className="absolute bottom-[-70px] flex gap-2">
        {[...Array(7)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ scaleY: 0 }}
            animate={{
              scaleY:
                phase === "listening"
                  ? [0.2, 1.4, 0.2]
                  : phase === "processing"
                    ? [0.5, 1.8, 0.5]
                    : phase === "responding"
                      ? [0.3, 1.2, 0.3]
                      : [0.2, 0.6, 0.2],
              opacity: [0.4, 1, 0.4],
            }}
            transition={{
              duration: 1.2,
              repeat: Infinity,
              delay: i * 0.12,
              ease: "easeInOut",
            }}
            className="w-1.5 bg-gradient-to-t from-cyan-400 to-blue-400 rounded-full origin-bottom shadow-[0_0_10px_rgba(0,247,255,0.5)]"
            style={{
              height: `${20 + Math.random() * 15}px`,
            }}
          />
        ))}
      </div>

      {/* ZENIX Text with Advanced Glitch Effect */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 3, duration: 1.2, type: "spring" }}
        className="absolute text-3xl font-bold tracking-[10px] select-none"
      >
        <motion.span
          animate={{
            textShadow: [
              "0 0 20px #00f7ff, 0 0 30px #00f7ff, 0 0 40px #00f7ff",
              "0 0 30px #00f7ff, 0 0 50px #00f7ff, 0 0 60px #0096c7",
              "0 0 20px #00f7ff, 0 0 30px #00f7ff, 0 0 40px #00f7ff",
            ],
          }}
          transition={{ duration: 2.5, repeat: Infinity }}
          className="relative"
        >
          <motion.span
            animate={{
              textShadow: [
                "0 0 20px #00f7ff",
                "0 0 40px #00f7ff",
                "0 0 20px #00f7ff",
              ],
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            {phase === "idle" && "ZENIX"}
            {phase === "listening" && "LISTENING"}
            {phase === "processing" && "PROCESSING"}
            {phase === "responding" && "75°F • SUNNY"}
          </motion.span>

          {/* Glitch Layers */}
          <motion.span
            animate={{
              x: [-2, 2, -2],
              opacity: [0, 0.5, 0],
            }}
            transition={{
              duration: 0.2,
              repeat: Infinity,
              repeatDelay: 3,
            }}
            className="absolute inset-0 text-cyan-300"
            style={{ clipPath: "polygon(0 0, 100% 0, 100% 45%, 0 45%)" }}
          >
            ZENIX
          </motion.span>
          <motion.span
            animate={{
              x: [2, -2, 2],
              opacity: [0, 0.5, 0],
            }}
            transition={{
              duration: 0.2,
              repeat: Infinity,
              repeatDelay: 3,
              delay: 0.1,
            }}
            className="absolute inset-0 text-blue-300"
            style={{ clipPath: "polygon(0 55%, 100% 55%, 100% 100%, 0 100%)" }}
          >
            ZENIX
          </motion.span>
        </motion.span>

        {/* Underline Effect */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 4, duration: 0.8 }}
          className="absolute -bottom-2 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent origin-center"
        />
      </motion.div>

      {/* Status Indicator - Enhanced */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 4.2 }}
        className="absolute -bottom-16 flex items-center gap-3 px-4 py-2 rounded-full bg-slate-900/50 border border-cyan-400/30 backdrop-blur-sm"
      >
        <motion.div
          animate={{
            scale: [1, 1.4, 1],
            opacity: [0.6, 1, 0.6],
          }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="w-2.5 h-2.5 bg-cyan-400 rounded-full shadow-[0_0_10px_#00f7ff]"
        />
        <span className="text-xs text-cyan-400/80 tracking-wider font-medium uppercase">
          System Online
        </span>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-3 h-3"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="text-cyan-400/60"
          >
            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
          </svg>
        </motion.div>
      </motion.div>

      {/* Corner Frame Accents */}
      {[
        { top: "-100px", left: "-100px", rotate: 0 },
        { top: "-100px", right: "-100px", rotate: 90 },
        { bottom: "-100px", left: "-100px", rotate: -90 },
        { bottom: "-100px", right: "-100px", rotate: 180 },
      ].map((pos, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 0.3, scale: 1 }}
          transition={{ delay: 1 + i * 0.1 }}
          className="absolute w-20 h-20"
          style={pos}
        >
          <svg viewBox="0 0 100 100" className="text-cyan-400/40">
            <path
              d="M 0 20 L 0 0 L 20 0"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            />
            <circle cx="5" cy="5" r="2" fill="currentColor" />
          </svg>
        </motion.div>
      ))}
    </motion.div>
  );
}

export default OrbCore;

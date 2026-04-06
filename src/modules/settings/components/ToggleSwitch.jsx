import { motion } from "framer-motion";

const MotionDiv = motion.div;

export default function ToggleSwitch({ checked, onChange }) {
  return (
    <div
      onClick={onChange}
      className="relative flex items-center cursor-pointer select-none"
      style={{ width: 48, height: 22 }}
    >
      {/* Track */}
      <div
        className="w-full h-full transition-all duration-300"
        style={{
          background: checked
            ? "rgba(0,247,255,0.12)"
            : "rgba(255,255,255,0.04)",
          border: checked
            ? "1px solid rgba(0,247,255,0.5)"
            : "1px solid rgba(255,255,255,0.1)",
          boxShadow: checked ? "0 0 8px rgba(0,247,255,0.3), inset 0 0 6px rgba(0,247,255,0.1)" : "none",
        }}
      />

      {/* Thumb */}
      <MotionDiv
        layout
        animate={{ x: checked ? 26 : 2 }}
        transition={{ type: "spring", stiffness: 500, damping: 35 }}
        className="absolute top-1"
        style={{
          width: 14,
          height: 14,
          background: checked ? "#00f7ff" : "rgba(255,255,255,0.2)",
          boxShadow: checked ? "0 0 8px #00f7ff, 0 0 16px rgba(0,247,255,0.4)" : "none",
        }}
      />

      {/* ON/OFF label */}
      <span
        className="absolute right-0 -bottom-4 font-mono text-xs"
        style={{ color: checked ? "rgba(0,247,255,0.5)" : "rgba(255,255,255,0.2)", fontSize: 9, letterSpacing: "0.08em" }}
      >
        {checked ? "ACTV" : "OFF_"}
      </span>
    </div>
  );
}

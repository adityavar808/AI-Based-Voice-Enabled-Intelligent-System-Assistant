import { motion } from "framer-motion";

export default function ToggleSwitch({ checked, onChange }) {
  return (
    <div
      onClick={onChange}
      className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-all duration-300 ${
        checked
          ? "bg-blue-500 shadow-[0_0_10px_#3b82f6]"
          : "bg-white/10"
      }`}
    >
      <motion.div
        layout
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        className={`w-4 h-4 rounded-full ${
          checked ? "bg-white" : "bg-white/50"
        }`}
      />
    </div>
  );
}
import { motion } from "framer-motion";

export default function ToggleSwitch({ checked, onChange }) {
  return (
    <div
      onClick={onChange}
      className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition ${
        checked ? "bg-green-500" : "bg-white/20"
      }`}
    >
      <motion.div
        layout
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        className="w-4 h-4 bg-white rounded-full"
        style={{
          transform: checked ? "translateX(20px)" : "translateX(0px)",
        }}
      />
    </div>
  );
}
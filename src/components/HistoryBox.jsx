import { useState } from "react";
import { motion } from "framer-motion";

const HistoryBox = () => {
  const [history] = useState([
    {
      date: "Today",
      items: [
        { id: 1, text: "Turn on lights" },
        { id: 2, text: "What's the weather today?" },
        { id: 3, text: "Open YouTube" },
      ],
    },
    {
      date: "Yesterday",
      items: [
        { id: 4, text: "Play music" },
        { id: 5, text: "Set reminder for meeting" },
        { id: 6, text: "Tell me latest tech news" },
      ],
    },
  ]);

  return (
    <div
      style={{
        width: "300px",
        height: "calc(100vh - 120px)",
        borderRadius: "16px",
        background: "rgba(12,18,28,0.55)",
        backdropFilter: "blur(14px)",
        border: "1px solid rgba(255,255,255,0.06)",
        boxShadow:
          "0 20px 60px rgba(0,0,0,0.6), inset 0 0 20px rgba(255,255,255,0.03)",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "16px 18px",
          borderBottom: "1px solid rgba(255,255,255,0.05)",
          fontSize: "12px",
          letterSpacing: "0.18em",
          color: "#94a3b8",
          fontWeight: "500",
        }}
      >
        HISTORY
      </div>

      {/* Scroll Area */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "14px",
        }}
      >
        {history.map((group, index) => (
          <div key={index} style={{ marginBottom: "20px" }}>
            <div
              style={{
                fontSize: "10px",
                color: "#64748b",
                letterSpacing: "0.18em",
                marginBottom: "8px",
              }}
            >
              {group.date.toUpperCase()}
            </div>

            {group.items.map((item) => (
              <motion.div
                key={item.id}
                whileHover={{ scale: 1.03 }}
                transition={{ duration: 0.15 }}
                style={{
                  padding: "10px 12px",
                  borderRadius: "10px",
                  marginBottom: "8px",
                  background: "rgba(255,255,255,0.02)",
                  border: "1px solid rgba(255,255,255,0.05)",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  cursor: "pointer",
                  fontSize: "12px",
                  color: "#e2e8f0",
                  transition: "all 0.25s ease",
                }}
              >
                <div
                  style={{
                    width: "6px",
                    height: "6px",
                    borderRadius: "50%",
                    background: "#22c55e",
                    boxShadow: "0 0 6px #22c55e",
                  }}
                />

                {item.text}
              </motion.div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default HistoryBox;
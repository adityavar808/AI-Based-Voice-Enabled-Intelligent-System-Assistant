import { motion } from "framer-motion";

const MotionDiv = motion.div;

const FALLBACK_HISTORY = [
  {
    date: "System",
    items: [
      { id: "sample-1", text: "Turn on lights" },
      { id: "sample-2", text: "What's the weather today?" },
      { id: "sample-3", text: "Open YouTube" },
    ],
  },
];

const HistoryBox = ({ compact = false, groups = FALLBACK_HISTORY }) => {
  const history = groups.length > 0 ? groups : FALLBACK_HISTORY;

  return (
    <div
      style={{
        width: compact ? "min(100%, 420px)" : "300px",
        height: compact ? "min(60dvh, 520px)" : "calc(100dvh - 120px)",
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

      <div
        style={{
          padding: "12px 14px 0",
          fontSize: "11px",
          color: "#64748b",
          letterSpacing: "0.08em",
        }}
      >
        Recent prompts linked to this session
      </div>

      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "14px",
        }}
      >
        {history.map((group, index) => (
          <div key={`${group.date}-${index}`} style={{ marginBottom: "20px" }}>
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
              <MotionDiv
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
                    flexShrink: 0,
                  }}
                />

                <span style={{ lineHeight: 1.5 }}>{item.text}</span>
              </MotionDiv>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default HistoryBox;
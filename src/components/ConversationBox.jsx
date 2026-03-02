import { useState, useEffect, useRef, useCallback } from "react";

// ─── Status Config ─────────────────────────────────────────────────────────────
const STATUS_CFG = {
  idle: {
    label: "IDLE",
    color: "#64748b",
    glow: "rgba(100,116,139,0.25)",
    accent: "#1e293b",
    pulse: false,
  },
  listening: {
    label: "LISTENING",
    color: "#22c55e",
    glow: "rgba(34,197,94,0.4)",
    accent: "#052e16",
    pulse: true,
  },
  thinking: {
    label: "PROCESSING",
    color: "#f59e0b",
    glow: "rgba(245,158,11,0.4)",
    accent: "#1c1107",
    pulse: false,
  },
  responding: {
    label: "RESPONDING",
    color: "#3b82f6",
    glow: "rgba(59,130,246,0.4)",
    accent: "#0c1a3a",
    pulse: false,
  },
};

// ─── Demo Conversation ─────────────────────────────────────────────────────────
const DEMO = [
  {
    userText: "Hey Zenix, what's the current weather in Tokyo?",
    assistantText:
      "Connecting to live weather feed… Tokyo is currently 17°C with overcast skies. Wind is coming from the northeast at 14 km/h. Humidity is sitting at 71%. No precipitation expected for the next 4 hours, but there's a 40% chance of light rain this evening.",
  },
  {
    userText: "Set a reminder for my 3 PM standup meeting.",
    assistantText:
      "Done. Reminder set for 15:00 — \"Standup Meeting\". I'll notify you 5 minutes before with a voice alert. Should I also add a calendar block and send a Slack status update?",
  },
  {
    userText: "Play some focus music.",
    assistantText:
      "Sure. Queuing lo-fi focus playlist — \"Deep Work Vol. 3\". Estimated duration: 47 minutes. I'll keep notifications on silent until the session ends unless you say otherwise.",
  },
];

// ─── useStreamText Hook ────────────────────────────────────────────────────────
function useStreamText({ text, active, speed = 18 }) {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    clearInterval(intervalRef.current);
    if (!active || !text) {
      setDisplayed("");
      setDone(false);
      return;
    }
    setDisplayed("");
    setDone(false);
    let i = 0;
    intervalRef.current = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) {
        clearInterval(intervalRef.current);
        setDone(true);
      }
    }, speed);
    return () => clearInterval(intervalRef.current);
  }, [text, active, speed]);

  return { displayed, done };
}

// ─── useUserSpeechStream Hook ──────────────────────────────────────────────────
// Simulates real-time user speech appearing word-by-word
function useUserSpeechStream({ text, active, speed = 90 }) {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    clearInterval(intervalRef.current);
    if (!active || !text) {
      setDisplayed("");
      setDone(false);
      return;
    }
    setDisplayed("");
    setDone(false);
    const words = text.split(" ");
    let i = 0;
    intervalRef.current = setInterval(() => {
      i++;
      setDisplayed(words.slice(0, i).join(" "));
      if (i >= words.length) {
        clearInterval(intervalRef.current);
        setDone(true);
      }
    }, speed);
    return () => clearInterval(intervalRef.current);
  }, [text, active, speed]);

  return { displayed, done };
}

// ─── TranscriptEntry ───────────────────────────────────────────────────────────
function TranscriptEntry({ entry, isLatest, globalStatus }) {
  const isUser = entry.type === "user";

  // User entries stream word-by-word while listening
  const {
    displayed: userDisplayed,
    done: userDone,
  } = useUserSpeechStream({
    text: entry.text,
    active: isUser && isLatest && globalStatus === "listening",
    speed: 85,
  });

  // Assistant entries stream char-by-char while responding
  const {
    displayed: assistantDisplayed,
    done: assistantDone,
  } = useStreamText({
    text: entry.text,
    active: !isUser && isLatest && globalStatus === "responding",
    speed: 16,
  });

  const isUserStreaming  = isUser && isLatest && globalStatus === "listening" && !userDone;
  const isAssistStreaming = !isUser && isLatest && globalStatus === "responding" && !assistantDone;

  const displayedText = isUser
    ? (isUserStreaming ? userDisplayed : entry.text)
    : (isAssistStreaming ? assistantDisplayed : entry.text);

  const showCursor = isAssistStreaming;

  return (
    <div style={styles.entry}>
      {/* ── Speaker label row ── */}
      <div style={styles.labelRow}>
        <div style={styles.labelLeft}>
          <span
            style={{
              ...styles.speakerDot,
              background: isUser ? "#a78bfa" : "#60a5fa",
              boxShadow: `0 0 6px ${isUser ? "rgba(167,139,250,0.6)" : "rgba(96,165,250,0.6)"}`,
            }}
          />
          <span style={{ ...styles.speakerName, color: isUser ? "#a78bfa" : "#60a5fa" }}>
            {isUser ? "YOU" : "ZENIX"}
          </span>
          {isUserStreaming && (
            <span style={styles.liveBadge}>● LIVE</span>
          )}
        </div>
        <span style={styles.timestamp}>{entry.time}</span>
      </div>

      {/* ── Left border accent + text ── */}
      <div
        style={{
          ...styles.textBlock,
          borderLeftColor: isUser ? "rgba(167,139,250,0.25)" : "rgba(96,165,250,0.25)",
        }}
      >
        <span style={{ ...styles.textContent, color: isUser ? "#ede9fe" : "#dbeafe" }}>
          {displayedText}
          {showCursor && (
            <span className="zenix-cursor" style={styles.cursor} />
          )}
        </span>
      </div>
    </div>
  );
}

// ─── StatusBar ────────────────────────────────────────────────────────────────
function StatusBar({ status }) {
  const cfg = STATUS_CFG[status] || STATUS_CFG.idle;

  return (
    <div style={{ ...styles.statusBar, borderBottomColor: `${cfg.color}22` }}>
      {/* Left: logo */}
      <div style={styles.statusLeft}>
        <span style={styles.hexIcon}>⬡</span>
        <span style={styles.logoText}>ZENIX</span>
        <span style={styles.versionPill}>v2.4.1</span>
      </div>

      {/* Right: state indicator */}
      <div style={styles.statusRight}>
        {/* Thinking: spinning arc */}
        {status === "thinking" && (
          <span className="zenix-spin" style={styles.spinArc} />
        )}

        {/* Listening: ripple rings */}
        {status === "listening" && (
          <>
            <span className="zenix-ripple" style={{ ...styles.ripple, animationDelay: "0s" }} />
            <span className="zenix-ripple" style={{ ...styles.ripple, animationDelay: "0.5s" }} />
          </>
        )}

        {/* Core dot */}
        <span
          className={cfg.pulse ? "zenix-pulse" : ""}
          style={{
            ...styles.statusDot,
            background: cfg.color,
            boxShadow: `0 0 10px ${cfg.glow}, 0 0 20px ${cfg.glow}`,
          }}
        />

        <span style={{ ...styles.statusLabel, color: cfg.color }}>
          {cfg.label}
        </span>
      </div>
    </div>
  );
}

// ─── AccentLine ───────────────────────────────────────────────────────────────
function AccentLine({ status }) {
  const cfg = STATUS_CFG[status] || STATUS_CFG.idle;
  return (
    <div style={styles.accentLineWrap}>
      <div
        className="zenix-accent-line"
        style={{
          ...styles.accentLine,
          background: `linear-gradient(90deg, transparent 0%, ${cfg.color} 30%, ${cfg.color} 70%, transparent 100%)`,
          boxShadow: `0 0 12px ${cfg.glow}`,
        }}
      />
    </div>
  );
}

// ─── ThinkingIndicator ────────────────────────────────────────────────────────
function ThinkingIndicator() {
  return (
    <div style={styles.thinkRow}>
      <div style={styles.labelRow}>
        <div style={styles.labelLeft}>
          <span
            style={{
              ...styles.speakerDot,
              background: "#60a5fa",
              boxShadow: "0 0 6px rgba(96,165,250,0.6)",
            }}
          />
          <span style={{ ...styles.speakerName, color: "#60a5fa" }}>ZENIX</span>
        </div>
      </div>
      <div style={styles.thinkDotRow}>
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="zenix-think"
            style={{ ...styles.thinkDot, animationDelay: `${i * 0.2}s` }}
          />
        ))}
      </div>
    </div>
  );
}

// ─── WaveformFooter ───────────────────────────────────────────────────────────
function WaveformFooter({ status, entryCount }) {
  const cfg = STATUS_CFG[status] || STATUS_CFG.idle;
  const active = status === "listening" || status === "responding";
  const bars = [3, 5, 8, 6, 10, 7, 4, 9, 6, 4, 7, 5, 3];

  return (
    <div style={styles.footer}>
      <div style={styles.footerLeft}>
        <span style={styles.footerChip}>
          TRANSCRIPT <span style={{ color: "#e2e8f0" }}>{entryCount}</span>
        </span>
        <span style={{ ...styles.footerChip, color: cfg.color, transition: "color 0.4s" }}>
          {cfg.label}
        </span>
      </div>

      {/* Animated waveform */}
      <div style={styles.waveform}>
        {bars.map((h, i) => (
          <div
            key={i}
            className={active ? "zenix-bar" : ""}
            style={{
              ...styles.waveBar,
              height: `${h}px`,
              background: cfg.color,
              opacity: active ? 0.7 : 0.15,
              animationDelay: `${i * 0.07}s`,
              transition: "opacity 0.4s, background 0.4s",
            }}
          />
        ))}
      </div>
    </div>
  );
}

// ─── Main ConversationBox ──────────────────────────────────────────────────────
export default function ConversationBox({
  status: externalStatus,
  setStatus: setExternalStatus,
  entries: externalEntries,
}) {
  const [internalStatus, setInternalStatus] = useState("idle");
  const [internalEntries, setInternalEntries] = useState([]);
  const [demoRunning, setDemoRunning] = useState(false);
  const scrollRef = useRef(null);
  const timers = useRef([]);

  // Use external props if provided (wired to Home), else internal demo state
  const status  = externalStatus  !== undefined ? externalStatus  : internalStatus;
  const entries = externalEntries !== undefined ? externalEntries : internalEntries;
  const setStatus = setExternalStatus || setInternalStatus;

  // Auto-scroll
  useEffect(() => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [entries, status]);

  const clearTimers = () => { timers.current.forEach(clearTimeout); timers.current = []; };
  const t = useCallback((fn, ms) => {
    const id = setTimeout(fn, ms);
    timers.current.push(id);
  }, []);

  // ── Demo runner ──
  const runDemo = useCallback(() => {
    if (demoRunning || externalEntries !== undefined) return;
    clearTimers();
    setInternalEntries([]);
    setInternalStatus("idle");
    setDemoRunning(true);

    let cursor = 500; // ms offset

    DEMO.forEach((exchange, idx) => {
      const userWords = exchange.userText.split(" ").length;
      const userStreamDuration = userWords * 88 + 400;
      const assistantCharDuration = exchange.assistantText.length * 16 + 600;

      // → LISTENING + add user entry
      t(() => {
        setStatus("listening");
        setInternalEntries((prev) => [
          ...prev,
          { type: "user", text: exchange.userText, time: now() },
        ]);
      }, cursor);
      cursor += userStreamDuration;

      // → THINKING
      t(() => setStatus("thinking"), cursor);
      cursor += 1800;

      // → RESPONDING + add assistant entry
      t(() => {
        setStatus("responding");
        setInternalEntries((prev) => [
          ...prev,
          { type: "assistant", text: exchange.assistantText, time: now() },
        ]);
      }, cursor);
      cursor += assistantCharDuration;

      // → LISTENING (pause between exchanges)
      t(() => setStatus("listening"), cursor);
      cursor += idx < DEMO.length - 1 ? 1200 : 1000;
    });

    // → IDLE at end
    t(() => { setStatus("idle"); setDemoRunning(false); }, cursor);
  }, [demoRunning, externalEntries, setStatus, t]);

  const resetDemo = () => {
    clearTimers();
    setInternalEntries([]);
    setInternalStatus("idle");
    setDemoRunning(false);
  };

  const cfg = STATUS_CFG[status] || STATUS_CFG.idle;

  return (
    <div style={styles.wrapper}>
      {/* ── Global CSS animations ── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:ital,wght@0,300;0,400;0,500;1,300&family=Outfit:wght@400;600;700&display=swap');

        @keyframes zenix-pulse {
          0%,100% { transform: scale(1);   opacity: 1;   }
          50%      { transform: scale(1.4); opacity: 0.6; }
        }
        @keyframes zenix-ripple {
          0%   { transform: scale(1);   opacity: 0.6; }
          100% { transform: scale(2.8); opacity: 0;   }
        }
        @keyframes zenix-spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes zenix-blink {
          0%,100% { opacity: 1; }
          50%     { opacity: 0; }
        }
        @keyframes zenix-fadeup {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0);   }
        }
        @keyframes zenix-think {
          0%,80%,100% { transform: scaleY(0.4); opacity: 0.25; }
          40%         { transform: scaleY(1);   opacity: 1;    }
        }
        @keyframes zenix-bar {
          0%,100% { transform: scaleY(0.4); }
          50%     { transform: scaleY(1);   }
        }
        @keyframes zenix-glow-pulse {
          0%,100% { opacity: 0.6; }
          50%     { opacity: 1;   }
        }

        .zenix-pulse  { animation: zenix-pulse  1.5s ease-in-out infinite; }
        .zenix-ripple { animation: zenix-ripple 1.8s ease-out infinite; }
        .zenix-spin   { animation: zenix-spin   1s linear infinite; }
        .zenix-cursor { animation: zenix-blink  0.85s step-start infinite; }
        .zenix-entry  { animation: zenix-fadeup 0.35s cubic-bezier(0.22,1,0.36,1) forwards; }
        .zenix-think  { animation: zenix-think  1.3s ease-in-out infinite; }
        .zenix-bar    { animation: zenix-bar    0.7s ease-in-out infinite alternate; }

        .zenix-scroll::-webkit-scrollbar       { width: 4px; }
        .zenix-scroll::-webkit-scrollbar-track { background: transparent; }
        .zenix-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 2px; }
        .zenix-scroll::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.15); }
      `}</style>

      {/* ── Status Bar ── */}
      <StatusBar status={status} />

      {/* ── Accent Line ── */}
      <AccentLine status={status} />

      {/* ── Transcript ── */}
      <div ref={scrollRef} className="zenix-scroll" style={styles.transcript}>

        {/* Empty state */}
        {entries.length === 0 && status !== "thinking" && (
          <div style={styles.emptyState}>
            <div style={{ ...styles.emptyOrb, boxShadow: `0 0 30px ${cfg.glow}` }}>
              <span style={{ ...styles.emptyOrbText, color: cfg.color }}>◈</span>
            </div>
            <p style={styles.emptyTitle}>AWAITING VOICE INPUT</p>
            <p style={styles.emptySubtitle}>
              {status === "listening"
                ? "🎙 Microphone active — speak now"
                : status === "idle"
                ? "System ready. Start demo or speak."
                : "Initializing…"}
            </p>
          </div>
        )}

        {/* Entries */}
        {entries.map((entry, i) => (
          <div key={i} className="zenix-entry">
            <TranscriptEntry
              entry={entry}
              isLatest={i === entries.length - 1}
              globalStatus={status}
            />
          </div>
        ))}

        {/* Thinking indicator inline */}
        {status === "thinking" && (
          <div className="zenix-entry">
            <ThinkingIndicator />
          </div>
        )}
      </div>

      {/* ── Footer ── */}
      <WaveformFooter status={status} entryCount={entries.length} />

      {/* ── Demo Controls (only shown when no external entries wired) ── */}
      {externalEntries === undefined && (
        <div style={styles.demoBar}>
          <span style={styles.demoLabel}>DEMO MODE</span>
          <div style={styles.demoButtons}>
            <button
              onClick={resetDemo}
              style={styles.btnGhost}
              onMouseEnter={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.25)")}
              onMouseLeave={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.1)")}
            >
              RESET
            </button>
            <button
              onClick={runDemo}
              disabled={demoRunning}
              style={{ ...styles.btnPrimary, opacity: demoRunning ? 0.45 : 1 }}
              onMouseEnter={(e) => { if (!demoRunning) e.target.style.opacity = "0.85"; }}
              onMouseLeave={(e) => { if (!demoRunning) e.target.style.opacity = "1"; }}
            >
              {demoRunning ? "● RUNNING" : "▶ RUN DEMO"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function now() {
  return new Date().toLocaleTimeString("en-US", {
    hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false,
  });
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = {
  wrapper: {
    width: "100%",
    background: "linear-gradient(160deg, #0b0f18 0%, #080c12 60%, #06090e 100%)",
    border: "1px solid rgba(255,255,255,0.07)",
    borderRadius: "16px",
    boxShadow: [
      "0 32px 80px rgba(0,0,0,0.7)",
      "0 0 0 1px rgba(255,255,255,0.04) inset",
      "inset 0 1px 0 rgba(255,255,255,0.06)",
    ].join(", "),
    overflow: "hidden",
    fontFamily: "'IBM Plex Mono', monospace",
    display: "flex",
    flexDirection: "column",
  },

  // Status bar
  statusBar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "12px 22px",
    background: "rgba(255,255,255,0.018)",
    borderBottom: "1px solid",
    transition: "border-bottom-color 0.5s",
  },
  statusLeft: { display: "flex", alignItems: "center", gap: "10px" },
  hexIcon: { fontSize: "16px", color: "#60a5fa", lineHeight: 1 },
  logoText: {
    fontFamily: "'Outfit', sans-serif",
    fontWeight: 700,
    fontSize: "14px",
    color: "#f1f5f9",
    letterSpacing: "0.18em",
  },
  versionPill: {
    fontSize: "9px",
    color: "#475569",
    letterSpacing: "0.12em",
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.07)",
    padding: "2px 8px",
    borderRadius: "20px",
  },
  statusRight: {
    display: "flex",
    alignItems: "center",
    gap: "9px",
    position: "relative",
  },
  statusDot: {
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    flexShrink: 0,
    transition: "background 0.4s, box-shadow 0.4s",
    position: "relative",
    zIndex: 2,
  },
  statusLabel: {
    fontSize: "10px",
    fontWeight: 500,
    letterSpacing: "0.2em",
    transition: "color 0.4s",
  },
  spinArc: {
    position: "absolute",
    right: "26px",
    width: "18px",
    height: "18px",
    border: "1.5px solid #f59e0b",
    borderTopColor: "transparent",
    borderRadius: "50%",
    zIndex: 1,
  },
  ripple: {
    position: "absolute",
    right: "2px",
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    background: "transparent",
    border: "1.5px solid #22c55e",
    zIndex: 0,
  },

  // Accent line
  accentLineWrap: { height: "1px", position: "relative", overflow: "visible" },
  accentLine: {
    height: "1px",
    width: "100%",
    transition: "background 0.5s, box-shadow 0.5s",
  },

  // Transcript
  transcript: {
    minHeight: "160px",
    maxHeight: "calc(100vh - 260px)",
    overflowY: "auto",
    padding: "14px 22px 10px",
    display: "flex",
    flexDirection: "column",
    gap: "2px",
  },

  // Empty state
  emptyState: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "14px",
    padding: "20px 0",
    textAlign: "center",
  },
  emptyOrb: {
    width: "52px",
    height: "52px",
    borderRadius: "50%",
    border: "1px solid rgba(255,255,255,0.07)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "box-shadow 0.5s",
  },
  emptyOrbText: {
    fontSize: "22px",
    lineHeight: 1,
    transition: "color 0.5s",
  },
  emptyTitle: {
    fontSize: "10px",
    letterSpacing: "0.28em",
    color: "rgba(255,255,255,0.2)",
    margin: 0,
    fontWeight: 500,
  },
  emptySubtitle: {
    fontSize: "11px",
    color: "rgba(255,255,255,0.1)",
    margin: 0,
    letterSpacing: "0.04em",
    fontStyle: "italic",
  },

  // Entry
  entry: {
    display: "flex",
    flexDirection: "column",
    gap: "7px",
    paddingBottom: "12px",
  },
  labelRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  labelLeft: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  speakerDot: {
    width: "6px",
    height: "6px",
    borderRadius: "50%",
    flexShrink: 0,
    transition: "box-shadow 0.3s",
  },
  speakerName: {
    fontSize: "10px",
    fontWeight: 500,
    letterSpacing: "0.22em",
  },
  liveBadge: {
    fontSize: "9px",
    color: "#22c55e",
    letterSpacing: "0.1em",
    opacity: 0.8,
    animation: "zenix-glow-pulse 1s ease-in-out infinite",
  },
  timestamp: {
    fontSize: "9px",
    color: "rgba(255,255,255,0.12)",
    letterSpacing: "0.06em",
    fontVariantNumeric: "tabular-nums",
  },
  textBlock: {
    borderLeft: "2px solid",
    paddingLeft: "14px",
    paddingTop: "2px",
    transition: "border-left-color 0.3s",
  },
  textContent: {
    fontSize: "13.5px",
    lineHeight: "1.85",
    fontWeight: 300,
    letterSpacing: "0.025em",
    wordBreak: "break-word",
  },
  cursor: {
    display: "inline-block",
    width: "2px",
    height: "15px",
    background: "#60a5fa",
    marginLeft: "2px",
    verticalAlign: "middle",
    borderRadius: "1px",
    boxShadow: "0 0 6px rgba(96,165,250,0.8)",
  },

  // Thinking
  thinkRow: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    paddingBottom: "12px",
  },
  thinkDotRow: {
    paddingLeft: "14px",
    display: "flex",
    gap: "5px",
    alignItems: "center",
    height: "22px",
  },
  thinkDot: {
    width: "6px",
    height: "18px",
    borderRadius: "3px",
    background: "#3b82f6",
    display: "inline-block",
    transformOrigin: "bottom",
  },

  // Footer
  footer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "12px 22px",
    borderTop: "1px solid rgba(255,255,255,0.05)",
    background: "rgba(0,0,0,0.2)",
  },
  footerLeft: { display: "flex", gap: "16px", alignItems: "center" },
  footerChip: {
    fontSize: "9px",
    color: "#475569",
    letterSpacing: "0.15em",
    fontWeight: 500,
    transition: "color 0.4s",
  },
  waveform: {
    display: "flex",
    gap: "2px",
    alignItems: "center",
    height: "20px",
  },
  waveBar: {
    width: "3px",
    borderRadius: "2px",
    transformOrigin: "center",
  },

  // Demo bar
  demoBar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "10px 22px",
    borderTop: "1px solid rgba(255,255,255,0.04)",
    background: "rgba(0,0,0,0.3)",
  },
  demoLabel: {
    fontSize: "9px",
    color: "#334155",
    letterSpacing: "0.2em",
    fontWeight: 500,
  },
  demoButtons: { display: "flex", gap: "8px" },
  btnGhost: {
    background: "transparent",
    border: "1px solid rgba(255,255,255,0.1)",
    color: "#64748b",
    fontSize: "9px",
    letterSpacing: "0.15em",
    padding: "7px 14px",
    borderRadius: "6px",
    cursor: "pointer",
    fontFamily: "'IBM Plex Mono', monospace",
    transition: "border-color 0.2s",
    outline: "none",
  },
  btnPrimary: {
    background: "linear-gradient(135deg, #1e3a8a 0%, #1d4ed8 100%)",
    border: "1px solid rgba(96,165,250,0.2)",
    color: "#bfdbfe",
    fontSize: "9px",
    letterSpacing: "0.15em",
    padding: "7px 16px",
    borderRadius: "6px",
    cursor: "pointer",
    fontFamily: "'IBM Plex Mono', monospace",
    boxShadow: "0 4px 14px rgba(29,78,216,0.3)",
    outline: "none",
    transition: "opacity 0.2s",
  },
};

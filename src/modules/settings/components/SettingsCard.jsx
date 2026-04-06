export default function SettingsCard({ title, description, children }) {
  return (
    <div
      className="relative mb-5 p-5"
      style={{
        background: "rgba(0, 15, 20, 0.7)",
        border: "1px solid rgba(0, 247, 255, 0.12)",
      }}
    >
      {/* Corner brackets */}
      <span className="absolute top-0 left-0 w-3 h-3 border-t border-l border-cyan-400/60" />
      <span className="absolute top-0 right-0 w-3 h-3 border-t border-r border-cyan-400/60" />
      <span className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-cyan-400/60" />
      <span className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-cyan-400/60" />

      {/* Top accent line */}
      <div
        className="absolute top-0 left-0 right-0 h-px"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgba(0,247,255,0.35), transparent)",
        }}
      />

      {/* Title */}
      {title && (
        <div className="mb-3">
          <p
            className="text-xs font-mono font-bold tracking-widest uppercase mb-0.5"
            style={{ color: "#00f7ff" }}
          >
            // {title}
          </p>
          {description && (
            <p
              className="text-xs font-mono"
              style={{ color: "rgba(0,247,255,0.35)" }}
            >
              {description}
            </p>
          )}
        </div>
      )}

      {/* Divider */}
      {title && (
        <div
          className="mb-4 h-px"
          style={{ background: "rgba(0,247,255,0.08)" }}
        />
      )}

      <div>{children}</div>
    </div>
  );
}

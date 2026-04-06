const tabs = [
  { id: "ai-model",     label: "AI_MODEL",       code: "01" },
  { id: "security",     label: "SECURITY",        code: "02" },
  { id: "memory",       label: "MEMORY",          code: "03" },
  { id: "integrations", label: "INTEGRATIONS",    code: "04" },
  { id: "voice",        label: "VOICE",           code: "05" },
  { id: "appearance",   label: "APPEARANCE",      code: "06" },
  { id: "developer",    label: "DEVELOPER_LABS",  code: "07" },
];

export default function SettingsSidebar({ activeTab, setActiveTab }) {
  return (
    <div
      className="relative w-full border-b lg:h-full lg:w-64 lg:flex-shrink-0 lg:border-b-0 lg:border-r"
      style={{
        background: "rgba(0, 8, 12, 0.85)",
        borderColor: "rgba(0,247,255,0.1)",
      }}
    >
      {/* Header */}
      <div
        className="hidden lg:block px-5 pt-5 pb-4"
        style={{ borderBottom: "1px solid rgba(0,247,255,0.08)" }}
      >
        <p
          className="font-mono text-xs tracking-widest uppercase mb-1"
          style={{ color: "rgba(0,247,255,0.4)" }}
        >
          SYS.CONFIG
        </p>
        <p
          className="font-mono text-lg font-bold tracking-wider"
          style={{ color: "#00f7ff", textShadow: "0 0 12px rgba(0,247,255,0.6)" }}
        >
          ZENIX
        </p>
        <p
          className="font-mono text-xs mt-0.5"
          style={{ color: "rgba(0,247,255,0.3)" }}
        >
          SETTINGS_PANEL_v9.0
        </p>
      </div>

      {/* Nav */}
      <div className="flex gap-1 overflow-x-auto p-3 lg:flex-col lg:gap-0.5 lg:overflow-visible lg:p-4">
        {tabs.map((tab) => {
          const active = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="relative flex items-center gap-3 px-3 py-2.5 text-left whitespace-nowrap transition-all duration-150 w-full"
              style={{
                background: active
                  ? "rgba(0,247,255,0.07)"
                  : "transparent",
                border: active
                  ? "1px solid rgba(0,247,255,0.2)"
                  : "1px solid transparent",
                outline: "none",
              }}
            >
              {/* Active left bar */}
              {active && (
                <span
                  className="absolute left-0 top-1 bottom-1 w-0.5"
                  style={{
                    background: "#00f7ff",
                    boxShadow: "0 0 8px #00f7ff",
                  }}
                />
              )}

              <span
                className="font-mono text-xs hidden lg:block"
                style={{
                  color: active ? "rgba(0,247,255,0.5)" : "rgba(0,247,255,0.2)",
                }}
              >
                [{tab.code}]
              </span>

              <span
                className="font-mono text-xs font-semibold tracking-wider"
                style={{
                  color: active ? "#00f7ff" : "rgba(0,247,255,0.35)",
                  textShadow: active ? "0 0 8px rgba(0,247,255,0.5)" : "none",
                }}
              >
                {tab.label}
              </span>

              {active && (
                <span
                  className="ml-auto font-mono text-xs hidden lg:block"
                  style={{ color: "rgba(0,247,255,0.4)" }}
                >
                  {">>"}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Footer */}
      <div
        className="hidden lg:block absolute bottom-0 left-0 right-0 px-5 py-4"
        style={{ borderTop: "1px solid rgba(0,247,255,0.08)" }}
      >
        <div className="flex items-center gap-2">
          <span
            className="w-1.5 h-1.5 rounded-full"
            style={{
              background: "#00f7ff",
              boxShadow: "0 0 6px #00f7ff",
              animation: "pulse 2s infinite",
            }}
          />
          <span
            className="font-mono text-xs"
            style={{ color: "rgba(0,247,255,0.4)" }}
          >
            SECURE.NODE.ACTV
          </span>
        </div>
      </div>
    </div>
  );
}

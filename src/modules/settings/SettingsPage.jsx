import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import SettingsSidebar from "./components/SettingsSidebar";

import AIModelTab from "./tabs/AIModelTab";
import SecurityTab from "./tabs/SecurityTab";
import MemoryTab from "./tabs/MemoryTab";
import IntegrationsTab from "./tabs/IntegrationsTab";
import VoiceTab from "./tabs/VoiceTab";
import AppearanceTab from "./tabs/AppearanceTab";
import DeveloperTab from "./tabs/DeveloperTab";

const MotionDiv = motion.div;

export default function SettingsPage({ onClose }) {
  const [activeTab, setActiveTab] = useState("ai-model");

  const defaultSettings = useMemo(
    () => ({
      ai: { model: "zenix-core", temperature: 0.7 },
      security: { micAccess: true },
      memory: { enabled: true },
      integrations: { enabled: false, googleDrive: false, slack: false },
      voice: { sensitivity: 50, profile: "auto" },
      appearance: { darkMode: true },
      developer: { debug: false },
    }),
    []
  );

  const [settings, setSettings] = useState(() => {
    try {
      const saved = localStorage.getItem("zenix-settings");
      if (!saved) return defaultSettings;
      const parsed = JSON.parse(saved);
      return {
        ...defaultSettings,
        ...parsed,
        integrations: { ...defaultSettings.integrations, ...(parsed.integrations || {}) },
        voice: { ...defaultSettings.voice, ...(parsed.voice || {}) },
      };
    } catch {
      return defaultSettings;
    }
  });

  const [savedSettings, setSavedSettings] = useState(settings);
  const [isSaving, setIsSaving] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [logLines, setLogLines] = useState([
    "> SETTINGS_PANEL.INIT [OK]",
    "> CONFIG_LOAD [OK]",
  ]);

  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const isDirty = JSON.stringify(settings) !== JSON.stringify(savedSettings);

  const handleSave = async () => {
    setIsSaving(true);
    setLogLines((l) => [...l, "> WRITING_CONFIG..."]);
    await new Promise((r) => setTimeout(r, 800));
    localStorage.setItem("zenix-settings", JSON.stringify(settings));
    setSavedSettings(settings);
    setIsSaving(false);
    setShowToast(true);
    setLogLines((l) => [...l, "> SYNC_COMPLETE [OK]"]);
    setTimeout(() => setShowToast(false), 2500);
  };

  const handleCancel = () => {
    setSettings(savedSettings);
    setLogLines((l) => [...l, "> CHANGES_REVERTED"]);
  };

  const resetToDefault = () => {
    setSettings(defaultSettings);
    setLogLines((l) => [...l, "> FACTORY_RESET [OK]"]);
  };

  const tabProps = { settings, setSettings, resetToDefault };

  const renderActiveTab = () => {
    switch (activeTab) {
      case "ai-model":      return <AIModelTab {...tabProps} />;
      case "security":      return <SecurityTab {...tabProps} />;
      case "memory":        return <MemoryTab {...tabProps} />;
      case "integrations":  return <IntegrationsTab {...tabProps} />;
      case "voice":         return <VoiceTab {...tabProps} />;
      case "appearance":    return <AppearanceTab {...tabProps} />;
      case "developer":     return <DeveloperTab {...tabProps} />;
      default:              return <AIModelTab {...tabProps} />;
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "rgba(0,5,8,0.88)", backdropFilter: "blur(8px)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* Ambient glow */}
      <div
        className="pointer-events-none absolute"
        style={{
          width: 600,
          height: 600,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(0,247,255,0.035) 0%, transparent 70%)",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
        }}
      />

      {/* Panel */}
      <div
        className="relative flex h-[92vh] w-[96%] max-w-6xl flex-col overflow-hidden lg:h-[82%] lg:flex-row"
        style={{
          background: "rgba(0, 10, 15, 0.95)",
          border: "1px solid rgba(0,247,255,0.18)",
          boxShadow:
            "0 0 60px rgba(0,247,255,0.1), 0 0 0 1px rgba(0,247,255,0.04), inset 0 1px 0 rgba(0,247,255,0.08)",
        }}
      >
        {/* Corner brackets on panel */}
        <span className="absolute top-0 left-0 w-5 h-5 border-t-2 border-l-2 z-10" style={{ borderColor: "rgba(0,247,255,0.5)" }} />
        <span className="absolute top-0 right-0 w-5 h-5 border-t-2 border-r-2 z-10" style={{ borderColor: "rgba(0,247,255,0.5)" }} />
        <span className="absolute bottom-0 left-0 w-5 h-5 border-b-2 border-l-2 z-10" style={{ borderColor: "rgba(0,247,255,0.5)" }} />
        <span className="absolute bottom-0 right-0 w-5 h-5 border-b-2 border-r-2 z-10" style={{ borderColor: "rgba(0,247,255,0.5)" }} />

        {/* Sidebar */}
        <SettingsSidebar activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* Main */}
        <div className="flex min-h-0 flex-1 flex-col">

          {/* Header */}
          <div
            className="flex h-14 flex-shrink-0 items-center justify-between px-6"
            style={{ borderBottom: "1px solid rgba(0,247,255,0.1)" }}
          >
            <div className="flex items-center gap-4">
              <div
                className="w-1.5 h-1.5 rounded-full"
                style={{ background: "#00f7ff", boxShadow: "0 0 6px #00f7ff" }}
              />
              <span
                className="font-mono text-sm font-bold tracking-widest uppercase"
                style={{ color: "#00f7ff", textShadow: "0 0 10px rgba(0,247,255,0.5)" }}
              >
                SYS.CONFIG // {activeTab.replace("-", "_").toUpperCase()}
              </span>
            </div>

            <button
              onClick={onClose}
              className="font-mono text-xs tracking-widest transition-all duration-150 px-3 py-1.5"
              style={{
                color: "rgba(0,247,255,0.5)",
                border: "1px solid rgba(0,247,255,0.15)",
                background: "transparent",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "#00f7ff";
                e.currentTarget.style.borderColor = "rgba(0,247,255,0.4)";
                e.currentTarget.style.boxShadow = "0 0 8px rgba(0,247,255,0.2)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "rgba(0,247,255,0.5)";
                e.currentTarget.style.borderColor = "rgba(0,247,255,0.15)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              [ESC] CLOSE
            </button>
          </div>

          {/* Tab content */}
          <div
            className="flex-1 overflow-y-auto p-5 lg:p-7"
            style={{
              backgroundImage:
                "repeating-linear-gradient(0deg, transparent, transparent 28px, rgba(0,247,255,0.013) 28px, rgba(0,247,255,0.013) 29px)",
            }}
          >
            {renderActiveTab()}
          </div>

          {/* Save bar */}
          <AnimatePresence>
            {isDirty && (
              <MotionDiv
                initial={{ y: 60 }}
                animate={{ y: 0 }}
                exit={{ y: 60 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col gap-3 px-6 py-4 sm:flex-row sm:items-center sm:justify-between"
                style={{
                  borderTop: "1px solid rgba(0,247,255,0.15)",
                  background: "rgba(0,247,255,0.03)",
                }}
              >
                <span className="font-mono text-xs" style={{ color: "rgba(0,247,255,0.5)" }}>
                  {">"} UNSAVED_CHANGES_DETECTED —
                </span>

                <div className="flex gap-3">
                  <button
                    onClick={handleCancel}
                    className="font-mono text-xs px-4 py-2 transition-all"
                    style={{
                      color: "rgba(0,247,255,0.4)",
                      border: "1px solid rgba(0,247,255,0.12)",
                      background: "transparent",
                    }}
                  >
                    REVERT
                  </button>

                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="font-mono text-xs px-5 py-2 font-bold tracking-widest transition-all"
                    style={{
                      background: isSaving
                        ? "rgba(0,247,255,0.1)"
                        : "rgba(0,247,255,0.15)",
                      border: "1px solid rgba(0,247,255,0.5)",
                      color: "#00f7ff",
                      boxShadow: isSaving ? "none" : "0 0 12px rgba(0,247,255,0.25)",
                    }}
                  >
                    {isSaving ? "WRITING..." : "SAVE_CONFIG"}
                  </button>
                </div>
              </MotionDiv>
            )}
          </AnimatePresence>

        </div>
      </div>

      {/* Toast */}
      <AnimatePresence>
        {showToast && (
          <MotionDiv
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed top-5 right-5 font-mono text-xs px-4 py-2.5"
            style={{
              background: "rgba(0,10,15,0.95)",
              border: "1px solid rgba(0,247,255,0.4)",
              color: "#00f7ff",
              boxShadow: "0 0 20px rgba(0,247,255,0.2)",
              letterSpacing: "0.06em",
            }}
          >
            {">"} CONFIG_WRITE_SUCCESS [OK]
          </MotionDiv>
        )}
      </AnimatePresence>

      <style>{`
        ::-webkit-scrollbar { width: 3px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(0,247,255,0.2); }
        @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.3; } }
      `}</style>
    </div>
  );
}

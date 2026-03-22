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
      integrations: {
        enabled: false,
        googleDrive: false,
        slack: false,
      },
      voice: { sensitivity: 50 },
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
        integrations: {
          ...defaultSettings.integrations,
          ...(parsed.integrations || {}),
        },
      };
    } catch {
      return defaultSettings;
    }
  });

  const [savedSettings, setSavedSettings] = useState(settings);
  const [isSaving, setIsSaving] = useState(false);
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const isDirty =
    JSON.stringify(settings) !== JSON.stringify(savedSettings);

  const handleSave = async () => {
    setIsSaving(true);

    await new Promise((resolve) => setTimeout(resolve, 800));

    localStorage.setItem("zenix-settings", JSON.stringify(settings));
    setSavedSettings(settings);

    setIsSaving(false);
    setShowToast(true);

    setTimeout(() => setShowToast(false), 2500);
  };

  const handleCancel = () => {
    setSettings(savedSettings);
  };

  const resetToDefault = () => {
    setSettings(defaultSettings);
  };

  const renderActiveTab = () => {
    const props = {
      settings,
      setSettings,
      resetToDefault,
    };

    switch (activeTab) {
      case "ai-model":
        return <AIModelTab {...props} />;
      case "security":
        return <SecurityTab {...props} />;
      case "memory":
        return <MemoryTab {...props} />;
      case "integrations":
        return <IntegrationsTab {...props} />;
      case "voice":
        return <VoiceTab {...props} />;
      case "appearance":
        return <AppearanceTab {...props} />;
      case "developer":
        return <DeveloperTab {...props} />;
      default:
        return <AIModelTab {...props} />;
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md"
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >

      {/* Popup Panel */}
      <div className="relative flex h-[92vh] w-[96%] max-w-6xl flex-col overflow-hidden rounded-2xl border border-cyan-400/30 bg-black/80 shadow-[0_0_40px_rgba(0,247,255,0.25)] lg:h-[80%] lg:flex-row">

        {/* Sidebar */}
        <SettingsSidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />

        {/* Content */}
        <div className="flex min-h-0 flex-1 flex-col">

          {/* Header */}
          <div className="flex h-16 items-center justify-between border-b border-cyan-400/20 px-4 sm:px-6 lg:px-8">
            <h1 className="text-lg font-semibold text-cyan-400">
              ZENIX Settings
            </h1>

            <button
              onClick={onClose}
              className="text-sm text-cyan-400 hover:text-cyan-300 transition"
            >
              Close
            </button>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
            {renderActiveTab()}
          </div>

          {/* Save Bar (inside popup now) */}
          <AnimatePresence>
            {isDirty && (
              <MotionDiv
                initial={{ y: 80 }}
                animate={{ y: 0 }}
                exit={{ y: 80 }}
                transition={{ duration: 0.25 }}
                className="flex flex-col gap-3 border-t border-cyan-400/20 bg-black/70 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8"
              >
                <span className="text-sm text-white/70">
                  You have unsaved changes
                </span>

                <div className="flex gap-4">
                  <button
                    onClick={handleCancel}
                    className="text-sm text-white/60 hover:text-white"
                  >
                    Cancel
                  </button>

                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="bg-cyan-500 text-black px-4 py-2 rounded-md text-sm flex items-center gap-2 shadow-[0_0_10px_#22d3ee] hover:bg-cyan-400 transition"
                  >
                    {isSaving ? "Saving..." : "Save Changes"}
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
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed right-4 top-4 rounded-md bg-cyan-400 px-4 py-2 text-sm text-black shadow-lg sm:right-6 sm:top-6"
          >
            Settings saved successfully
          </MotionDiv>
        )}
      </AnimatePresence>

    </div>
  );
}

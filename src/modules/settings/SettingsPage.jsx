import { useState, useMemo } from "react";
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md">

      {/* Popup Panel */}
      <div className="w-[90%] max-w-6xl h-[80%] flex bg-black/80 border border-cyan-400/30 rounded-2xl shadow-[0_0_40px_rgba(0,247,255,0.25)] overflow-hidden relative">

        {/* Sidebar */}
        <SettingsSidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />

        {/* Content */}
        <div className="flex-1 flex flex-col">

          {/* Header */}
          <div className="h-16 flex items-center justify-between px-8 border-b border-cyan-400/20">
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
          <div className="flex-1 overflow-y-auto p-8">
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
                className="border-t border-cyan-400/20 px-8 py-4 flex justify-between items-center bg-black/70"
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
            className="fixed top-6 right-6 bg-cyan-400 text-black px-4 py-2 rounded-md text-sm shadow-lg"
          >
            Settings saved successfully
          </MotionDiv>
        )}
      </AnimatePresence>

    </div>
  );
}

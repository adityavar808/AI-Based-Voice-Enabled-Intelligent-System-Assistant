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

export default function SettingsPage({ onClose }) {
  const [activeTab, setActiveTab] = useState("ai-model");

  // ✅ Default Settings Structure
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

  // ✅ Save Handler
  const handleSave = async () => {
    setIsSaving(true);

    await new Promise((resolve) => setTimeout(resolve, 800));

    localStorage.setItem("zenix-settings", JSON.stringify(settings));
    setSavedSettings(settings);

    setIsSaving(false);
    setShowToast(true);

    setTimeout(() => setShowToast(false), 2500);
  };

  // ✅ Cancel Handler
  const handleCancel = () => {
    setSettings(savedSettings);
  };

  // ✅ Reset to Default (used by Security Danger Zone)
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
    <div className="w-full h-screen flex bg-black text-white relative">
      {/* Sidebar */}
      <SettingsSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Content */}
      <div className="flex-1 flex flex-col">
        <div className="h-16 flex items-center justify-between px-8 border-b border-white/10">
          <h1 className="text-lg font-semibold">Jarvis Settings</h1>

          <button
            onClick={onClose}
            className="text-sm text-white/60 hover:text-white transition"
          >
            Close
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8">
          {renderActiveTab()}
        </div>
      </div>

      {/* 🔥 Sticky Save Bar */}
      <AnimatePresence>
        {isDirty && (
          <motion.div
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            exit={{ y: 100 }}
            transition={{ duration: 0.3 }}
            className="fixed bottom-0 left-0 w-full bg-black border-t border-white/10 px-8 py-4 flex justify-between items-center"
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
                className="bg-blue-500 text-white px-4 py-2 rounded-md text-sm flex items-center gap-2 shadow-[0_0_10px_#3b82f6] hover:bg-blue-600 transition"
              >
                {isSaving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 🔔 Toast */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed top-6 right-6 bg-white text-black px-4 py-2 rounded-md text-sm shadow-lg"
          >
            Settings saved successfully
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
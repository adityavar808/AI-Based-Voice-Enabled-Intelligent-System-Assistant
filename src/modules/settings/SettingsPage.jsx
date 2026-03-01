import { useState } from "react";
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

  // 🔥 Centralized Settings State
  const [settings, setSettings] = useState({
    ai: {
      model: "zenix-core",
      temperature: 0.7,
    },
    security: {
      micAccess: true,
    },
    memory: {
      enabled: true,
    },
    voice: {
      sensitivity: 50,
    },
    appearance: {
      darkMode: true,
    },
    developer: {
      debug: false,
    },
  });

  const renderActiveTab = () => {
    switch (activeTab) {
      case "ai-model":
        return (
          <AIModelTab
            settings={settings}
            setSettings={setSettings}
          />
        );

      case "security":
        return (
          <SecurityTab
            settings={settings}
            setSettings={setSettings}
          />
        );

      case "memory":
        return (
          <MemoryTab
            settings={settings}
            setSettings={setSettings}
          />
        );

      case "integrations":
        return (
          <IntegrationsTab
            settings={settings}
            setSettings={setSettings}
          />
        );

      case "voice":
        return (
          <VoiceTab
            settings={settings}
            setSettings={setSettings}
          />
        );

      case "appearance":
        return (
          <AppearanceTab
            settings={settings}
            setSettings={setSettings}
          />
        );

      case "developer":
        return (
          <DeveloperTab
            settings={settings}
            setSettings={setSettings}
          />
        );

      default:
        return (
          <AIModelTab
            settings={settings}
            setSettings={setSettings}
          />
        );
    }
  };

  return (
    <div className="w-full h-screen flex bg-black text-white">
      {/* Sidebar */}
      <SettingsSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="h-16 flex items-center justify-between px-8 border-b border-white/10">
          <h1 className="text-lg font-semibold">Jarvis Settings</h1>

          <button
            onClick={onClose}
            className="text-sm text-white/60 hover:text-white transition"
          >
            Close
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-8">
          {renderActiveTab()}
        </div>
      </div>
    </div>
  );
}
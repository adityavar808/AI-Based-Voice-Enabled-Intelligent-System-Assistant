import { useState } from "react";
import SettingsSidebar from "./components/SettingsSidebar";
import AIModelTab from "./tabs/AIModelTab";
import SecurityTab from "./tabs/SecurityTab";

export default function SettingsPage({ onClose }) {
  const [activeTab, setActiveTab] = useState("ai-model");

  return (
    <div className="w-full h-full flex bg-black text-white">
      <SettingsSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      <div className="flex-1 p-8">
        {activeTab === "ai-model" && <AIModelTab />}
        {activeTab === "security" && <SecurityTab />}
      </div>
    </div>
  );
}
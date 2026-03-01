const tabs = [
  { id: "ai-model", label: "AI Model" },
  { id: "security", label: "Security" },
  { id: "memory", label: "Memory" },
  { id: "integrations", label: "Integrations" },
  { id: "voice", label: "Voice" },
  { id: "appearance", label: "Appearance" },
  { id: "developer", label: "Developer / Labs" },
];

export default function SettingsSidebar({ activeTab, setActiveTab }) {
  return (
    <div className="w-64 border-r border-white/10 p-6">
      <h2 className="text-xl font-semibold mb-6">Settings</h2>

      <div className="flex flex-col gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`text-left px-3 py-2 rounded-md transition ${
              activeTab === tab.id
                ? "bg-white/10 text-white"
                : "text-white/60 hover:bg-white/5 hover:text-white"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
}
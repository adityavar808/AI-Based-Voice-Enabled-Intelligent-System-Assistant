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
    <div className="w-full border-b border-white/10 bg-black/60 p-4 backdrop-blur-md lg:h-full lg:w-72 lg:flex-shrink-0 lg:border-b-0 lg:border-r lg:p-6">
      <h2 className="mb-4 text-lg font-semibold lg:mb-8 lg:text-xl">Settings</h2>

      <div className="flex gap-2 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`rounded-lg px-4 py-3 text-left whitespace-nowrap transition-all ${
              activeTab === tab.id
                ? "bg-blue-500/20 text-blue-400 shadow-[0_0_10px_#3b82f6]"
                : "text-white/60 hover:bg-blue-500/10 hover:text-blue-400"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
}

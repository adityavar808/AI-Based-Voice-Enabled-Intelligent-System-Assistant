import SettingsCard from "../components/SettingsCard";

export default function AIModelTab({ settings, setSettings }) {
  const { model, temperature } = settings.ai;

  return (
    <>
      <SettingsCard
        title="AI Model Configuration"
        description="Configure core AI behavior settings."
      >
        {/* Model Dropdown */}
        <div className="mb-6">
          <label className="block text-sm mb-2">Model</label>
          <select
            value={model}
            onChange={(e) =>
              setSettings((prev) => ({
                ...prev,
                ai: {
                  ...prev.ai,
                  model: e.target.value,
                },
              }))
            }
            className="bg-black border border-white/20 rounded px-3 py-2 w-full"
          >
            <option value="zenix-core">ZENIX Core</option>
            <option value="zenix-pro">ZENIX Pro</option>
          </select>
        </div>

        {/* Temperature Slider */}
        <div>
          <label className="block text-sm mb-2">
            Temperature: {temperature}
          </label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={temperature}
            onChange={(e) =>
              setSettings((prev) => ({
                ...prev,
                ai: {
                  ...prev.ai,
                  temperature: Number(e.target.value),
                },
              }))
            }
            className="w-full"
          />
        </div>
      </SettingsCard>
    </>
  );
}
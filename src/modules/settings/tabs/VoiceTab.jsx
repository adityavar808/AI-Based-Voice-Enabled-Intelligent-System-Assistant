import SettingsCard from "../components/SettingsCard";

export default function VoiceTab({ settings, setSettings }) {
  const { sensitivity, profile = "auto" } = settings.voice;
  const voiceProfiles = [
    {
      value: "auto",
      label: "Auto",
      description: "Pick the best available English voice automatically.",
    },
    {
      value: "male",
      label: "Male",
      description: "Prefer a deeper-sounding voice when available.",
    },
    {
      value: "female",
      label: "Female",
      description: "Prefer a brighter-sounding voice when available.",
    },
  ];

  return (
    <>
      <SettingsCard
        title="Voice Style"
        description="Choose how ZENIX should sound when speaking. Available voices depend on your browser and system."
      >
        <div className="grid gap-3 sm:grid-cols-3">
          {voiceProfiles.map((option) => {
            const isSelected = profile === option.value;

            return (
              <button
                key={option.value}
                type="button"
                onClick={() =>
                  setSettings((prev) => ({
                    ...prev,
                    voice: {
                      ...prev.voice,
                      profile: option.value,
                    },
                  }))
                }
                className={`rounded-xl border px-4 py-3 text-left transition ${
                  isSelected
                    ? "border-cyan-400 bg-cyan-400/10 shadow-[0_0_18px_rgba(34,211,238,0.18)]"
                    : "border-white/10 bg-white/5 hover:border-cyan-400/40 hover:bg-white/10"
                }`}
              >
                <p className="text-sm font-medium text-white">{option.label}</p>
                <p className="mt-1 text-xs text-white/60">
                  {option.description}
                </p>
              </button>
            );
          })}
        </div>
      </SettingsCard>

      <SettingsCard
        title="Voice Sensitivity"
        description="Adjust microphone sensitivity."
      >
        <label className="block text-sm mb-2 text-white/80">
          Sensitivity: {sensitivity}
        </label>

        <input
          type="range"
          min="0"
          max="100"
          value={sensitivity}
          onChange={(e) =>
            setSettings((prev) => ({
              ...prev,
              voice: {
                ...prev.voice,
                sensitivity: Number(e.target.value),
              },
            }))
          }
          className="w-full"
        />
      </SettingsCard>
    </>
  );
}

import SettingsCard from "../components/SettingsCard";

export default function VoiceTab({ settings, setSettings }) {
  const { sensitivity } = settings.voice;

  return (
    <>
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
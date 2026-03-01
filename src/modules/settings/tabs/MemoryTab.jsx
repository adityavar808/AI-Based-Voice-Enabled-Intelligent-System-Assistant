import SettingsCard from "../components/SettingsCard";

export default function MemoryTab({ settings, setSettings }) {
  const { enabled } = settings.memory;

  return (
    <>
      <SettingsCard
        title="Memory Settings"
        description="Enable or disable assistant memory."
      >
        <label className="flex items-center gap-3 text-white/80">
          <input
            type="checkbox"
            checked={enabled}
            onChange={() =>
              setSettings((prev) => ({
                ...prev,
                memory: {
                  ...prev.memory,
                  enabled: !prev.memory.enabled,
                },
              }))
            }
          />
          Enable Memory
        </label>
      </SettingsCard>
    </>
  );
}
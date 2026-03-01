import SettingsCard from "../components/SettingsCard";

export default function DeveloperTab({ settings, setSettings }) {
  const { debug } = settings.developer;

  return (
    <>
      <SettingsCard
        title="Developer Tools"
        description="Enable debugging options."
      >
        <label className="flex items-center gap-3 text-white/80">
          <input
            type="checkbox"
            checked={debug}
            onChange={() =>
              setSettings((prev) => ({
                ...prev,
                developer: {
                  ...prev.developer,
                  debug: !prev.developer.debug,
                },
              }))
            }
          />
          Debug Mode
        </label>
      </SettingsCard>
    </>
  );
}
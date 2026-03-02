import SettingsCard from "../components/SettingsCard";
import ToggleSwitch from "../components/ToggleSwitch";

export default function DeveloperTab({ settings, setSettings }) {
  const { debug } = settings.developer;

  return (
    <>
      <SettingsCard
        title="Developer Tools"
        description="Enable debugging options."
      >
        <div className="flex items-center justify-between text-white/80">
          <span>Debug Mode</span>

          <ToggleSwitch
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
        </div>
      </SettingsCard>
    </>
  );
}
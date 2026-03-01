import SettingsCard from "../components/SettingsCard";

export default function AppearanceTab({ settings, setSettings }) {
  const { darkMode } = settings.appearance;

  return (
    <>
      <SettingsCard
        title="Appearance Settings"
        description="Toggle dark mode."
      >
        <label className="flex items-center gap-3 text-white/80">
          <input
            type="checkbox"
            checked={darkMode}
            onChange={() =>
              setSettings((prev) => ({
                ...prev,
                appearance: {
                  ...prev.appearance,
                  darkMode: !prev.appearance.darkMode,
                },
              }))
            }
          />
          Dark Mode
        </label>
      </SettingsCard>
    </>
  );
}
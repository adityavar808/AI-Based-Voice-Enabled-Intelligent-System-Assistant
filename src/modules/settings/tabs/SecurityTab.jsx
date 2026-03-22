import SettingsCard from "../components/SettingsCard";

export default function SecurityTab({ settings, setSettings, resetToDefault }) {
  const { micAccess } = settings.security;

  return (
    <>
      {/* Normal Security Settings */}
      <SettingsCard
        title="Security Settings"
        description="Manage microphone access and system permissions."
      >
        <label className="flex items-center justify-between text-white/80">
          <span>Microphone Access</span>
          <input
            type="checkbox"
            checked={micAccess}
            onChange={() =>
              setSettings((prev) => ({
                ...prev,
                security: {
                  ...prev.security,
                  micAccess: !prev.security.micAccess,
                },
              }))
            }
            className="accent-white"
          />
        </label>
      </SettingsCard>

      {/* 🔥 Danger Zone Section */}
      <div className="border border-red-500/30 bg-red-500/5 rounded-xl p-6 mt-10">
        <h3 className="text-lg font-semibold text-red-400 mb-2">
          Danger Zone
        </h3>

        <p className="text-sm text-red-300/70 mb-6">
          Actions below are irreversible. Proceed with caution.
        </p>

        <div className="flex justify-between items-center border border-red-500/20 rounded-lg p-4">
          <div>
            <p className="text-sm font-medium text-white">
              Reset All Settings
            </p>
            <p className="text-xs text-white/60">
              Restore all settings to default values.
            </p>
          </div>

          <button
            onClick={() => {
              const confirmed = window.confirm(
                "Are you sure you want to reset all settings?"
              );

              if (confirmed) {
                resetToDefault();
              }
            }}
            className="bg-red-500 text-white px-4 py-2 rounded-md text-sm hover:bg-red-600 transition"
          >
            Reset
          </button>
        </div>
      </div>
    </>
  );
}

import SettingsCard from "../components/SettingsCard";

export default function IntegrationsTab({ settings, setSettings }) {
  const { enabled, googleDrive, slack } = settings.integrations;

  const toggleIntegration = (key) => {
    setSettings((prev) => ({
      ...prev,
      integrations: {
        ...prev.integrations,
        [key]: !prev.integrations[key],
      },
    }));
  };

  return (
    <>
      {/* Master Toggle */}
      <SettingsCard
        title="Integrations"
        description="Connect external services to extend Jarvis capabilities."
      >
        <label className="flex items-center justify-between text-white/80">
          <span>Enable Integrations</span>
          <input
            type="checkbox"
            checked={enabled}
            onChange={() => toggleIntegration("enabled")}
            className="accent-white"
          />
        </label>
      </SettingsCard>

      {enabled && (
        <>
          {/* Google Drive */}
          <div className="border border-white/10 rounded-xl p-6 mb-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">Google Drive</p>
                <p className="text-sm text-white/60">
                  Allow Jarvis to access cloud files.
                </p>
              </div>

              <button
                onClick={() => toggleIntegration("googleDrive")}
                className={`px-4 py-2 rounded-md text-sm ${
                  googleDrive
                    ? "bg-green-500 text-black"
                    : "bg-white/10 text-white"
                }`}
              >
                {googleDrive ? "Connected" : "Connect"}
              </button>
            </div>
          </div>

          {/* Slack */}
          <div className="border border-white/10 rounded-xl p-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">Slack</p>
                <p className="text-sm text-white/60">
                  Send notifications to Slack workspace.
                </p>
              </div>

              <button
                onClick={() => toggleIntegration("slack")}
                className={`px-4 py-2 rounded-md text-sm ${
                  slack
                    ? "bg-green-500 text-black"
                    : "bg-white/10 text-white"
                }`}
              >
                {slack ? "Connected" : "Connect"}
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}
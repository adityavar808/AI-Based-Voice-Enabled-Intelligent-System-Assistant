import SettingsCard from "../components/SettingsCard";

export default function SecurityTab({ settings, setSettings }) {
  const { micAccess } = settings.security;

  return (
    <>
      <SettingsCard
        title="Security Settings"
        description="Manage microphone access."
      >
        <label className="flex items-center gap-3 text-white/80">
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
          />
          Microphone Access
        </label>
      </SettingsCard>
    </>
  );
}
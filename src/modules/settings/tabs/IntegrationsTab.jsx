import SettingsCard from "../components/SettingsCard";

export default function IntegrationsTab({ settings, setSettings }) {
  return (
    <>
      <SettingsCard
        title="Integrations"
        description="Connect external services."
      >
        <div className="text-white/80">
          No integrations configured.
        </div>
      </SettingsCard>
    </>
  );
}
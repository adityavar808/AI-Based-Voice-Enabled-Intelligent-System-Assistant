import SettingsCard from "../components/SettingsCard";

export default function SecurityTab() {
  return (
    <>
      <SettingsCard
        title="Security Settings"
        description="Manage access and permissions."
      >
        <div className="text-white/80">
          Microphone access enabled.
        </div>
      </SettingsCard>
    </>
  );
}
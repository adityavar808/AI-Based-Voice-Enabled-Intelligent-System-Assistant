import SettingsCard from "../components/SettingsCard";

export default function DeveloperTab() {
  return (
    <>
      <SettingsCard
        title="Developer Tools"
        description="Advanced debugging options."
      >
        <div className="text-white/80">
          Debug mode disabled.
        </div>
      </SettingsCard>
    </>
  );
}
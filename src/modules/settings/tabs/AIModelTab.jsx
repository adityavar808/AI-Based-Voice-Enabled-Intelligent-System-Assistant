import SettingsCard from "../components/SettingsCard";

export default function AIModelTab() {
  return (
    <>
      <SettingsCard
        title="AI Model Configuration"
        description="Configure core AI behavior settings."
      >
        <div className="text-white/80">Model: ZENIX Core v1</div>
      </SettingsCard>
    </>
  );
}
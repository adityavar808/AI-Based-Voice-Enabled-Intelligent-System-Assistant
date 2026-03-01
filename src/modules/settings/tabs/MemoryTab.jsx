import SettingsCard from "../components/SettingsCard";

export default function MemoryTab() {
  return (
    <>
      <SettingsCard
        title="Memory Settings"
        description="Manage assistant memory and personalization."
      >
        <div className="text-white/80">
          Memory system not yet connected.
        </div>
      </SettingsCard>
    </>
  );
}
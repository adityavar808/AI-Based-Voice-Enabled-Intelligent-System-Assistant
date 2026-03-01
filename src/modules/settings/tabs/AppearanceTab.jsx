import SettingsCard from "../components/SettingsCard";

export default function AppearanceTab() {
  return (
    <>
      <SettingsCard
        title="Appearance Settings"
        description="Customize UI look and feel."
      >
        <div className="text-white/80">
          Dark mode enabled.
        </div>
      </SettingsCard>
    </>
  );
}
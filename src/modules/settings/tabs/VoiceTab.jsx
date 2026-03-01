import SettingsCard from "../components/SettingsCard";

export default function VoiceTab() {
  return (
    <>
      <SettingsCard
        title="Voice Settings"
        description="Control voice assistant behavior."
      >
        <div className="text-white/80">
          Voice sensitivity: Default
        </div>
      </SettingsCard>
    </>
  );
}
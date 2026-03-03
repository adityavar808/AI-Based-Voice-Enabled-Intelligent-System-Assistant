export default function SettingsCard({ title, description, children }) {
  return (
    <div className="bg-white/5 border border-blue-500/20 rounded-xl p-6 mb-6 hover:border-blue-400/40 transition shadow-[0_0_5px_rgba(59,130,246,0.2)]">
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      {description && (
        <p className="text-sm text-white/60 mb-4">{description}</p>
      )}
      {children}
    </div>
  );
}
export default function SettingsCard({ title, description, children }) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-6 mb-6">
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      {description && (
        <p className="text-sm text-white/60 mb-4">{description}</p>
      )}
      {children}
    </div>
  );
}
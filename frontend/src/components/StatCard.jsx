export default function StatCard({ icon: Icon, label, value, color = 'primary' }) {
  const colorClasses = {
    primary: 'bg-[#3b82f6]/10 text-[#3b82f6]',
    success: 'bg-[#10b981]/10 text-[#10b981]',
    warning: 'bg-[#f59e0b]/10 text-[#f59e0b]',
    danger: 'bg-[#ef4444]/10 text-[#ef4444]',
  };

  return (
    <div className="card p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[#94a3b8] text-sm font-medium mb-2">{label}</p>
          <p className="text-4xl font-bold text-[#f1f5f9]">{value}</p>
        </div>
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
}
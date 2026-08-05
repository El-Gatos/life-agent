export default function CircularProgress({ 
  value = 0, 
  total = 1, 
  label, 
  color = '#3b82f6',
  icon: IconComponent
}) {
  const safeValue = Math.min(value, total);
  const percentage = total > 0 ? Math.round((safeValue / total) * 100) : 0;
  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="bg-white rounded-lg p-6 border border-[#e2e8f0] shadow-sm hover:shadow-md transition-all animate-fade flex flex-col items-center">
      <div className="p-2.5 rounded-lg mb-4" style={{ backgroundColor: `${color}15` }}>
        {IconComponent && <IconComponent className="w-5 h-5" style={{ color }} />}
      </div>

      <div className="relative w-28 h-28 mb-4">
        <svg className="w-full h-full" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="45" fill="none" stroke="#e2e8f0" strokeWidth="5" />
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke={color}
            strokeWidth="5"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            style={{
              transform: 'rotate(-90deg)',
              transformOrigin: '50% 50%',
              transition: 'stroke-dashoffset 0.5s ease-out',
            }}
          />
          <text x="50" y="55" textAnchor="middle" fontSize="24" fontWeight="bold" fill="#1e293b">
            {percentage}%
          </text>
        </svg>
      </div>

      <h3 className="text-sm font-semibold text-[#1e293b] text-center">{label}</h3>
      <p className="text-xs text-[#94a3b8] mt-1">{safeValue}/{total}</p>
    </div>
  );
}
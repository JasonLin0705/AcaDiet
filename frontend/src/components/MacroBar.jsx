export default function MacroBar({ label, current, target, color, unit = 'g' }) {
  const pct = target > 0 ? Math.min((current / target) * 100, 100) : 0;
  const over = current > target * 1.05;

  const configs = {
    green:  { gradient: 'from-emerald-400 to-emerald-600', bg: 'bg-emerald-50',  text: 'text-emerald-600' },
    blue:   { gradient: 'from-blue-400 to-blue-600',       bg: 'bg-blue-50',     text: 'text-blue-600'   },
    orange: { gradient: 'from-orange-400 to-orange-500',   bg: 'bg-orange-50',   text: 'text-orange-600' },
    purple: { gradient: 'from-purple-400 to-purple-600',   bg: 'bg-purple-50',   text: 'text-purple-600' },
  };
  const c = configs[color] || configs.green;

  return (
    <div>
      <div className="flex justify-between items-center mb-1.5">
        <span className="text-sm font-semibold text-gray-700">{label}</span>
        <span className={`text-sm font-bold ${over ? 'text-red-500' : c.text}`}>
          {Math.round(current)}
          <span className="text-gray-400 font-normal">/{Math.round(target)}{unit}</span>
        </span>
      </div>
      <div className={`h-3 rounded-full overflow-hidden ${c.bg}`}>
        <div
          className={`h-full rounded-full bg-gradient-to-r transition-all duration-700 ease-out ${over ? 'from-red-400 to-red-600' : c.gradient}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      {over && (
        <p className="text-xs text-red-500 mt-0.5 font-medium">
          +{Math.round(current - target)}{unit} over goal
        </p>
      )}
    </div>
  );
}

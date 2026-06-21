export default function MacroBar({ label, current, target, color, unit = 'g' }) {
  const pct = target > 0 ? Math.min((current / target) * 100, 100) : 0;
  const over = current > target * 1.05;

  const colorMap = {
    green: { bar: '#16a34a', over: '#dc2626', bg: '#f0fdf4' },
    blue: { bar: '#2563eb', over: '#dc2626', bg: '#eff6ff' },
    orange: { bar: '#ea580c', over: '#dc2626', bg: '#fff7ed' },
    purple: { bar: '#9333ea', over: '#dc2626', bg: '#faf5ff' },
  };
  const colors = colorMap[color] || colorMap.green;

  return (
    <div>
      <div className="flex justify-between text-sm mb-1.5">
        <span className="font-medium text-gray-700">{label}</span>
        <span className={over ? 'text-red-600 font-semibold' : 'text-gray-600'}>
          <strong>{Math.round(current)}</strong>
          <span className="text-gray-400"> / {Math.round(target)}{unit}</span>
        </span>
      </div>
      <div className="h-2.5 rounded-full overflow-hidden" style={{ backgroundColor: colors.bg }}>
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${pct}%`,
            backgroundColor: over ? colors.over : colors.bar,
          }}
        />
      </div>
      {over && (
        <p className="text-xs text-red-500 mt-0.5">+{Math.round(current - target)}{unit} over target</p>
      )}
    </div>
  );
}

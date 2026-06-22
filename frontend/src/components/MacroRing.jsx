export default function MacroRing({ label, current, target, color, unit = 'g' }) {
  const pct = target > 0 ? Math.min((current / target) * 100, 100) : 0;
  const over = current > target * 1.05;

  const strokeColors = {
    green:  'text-emerald-500',
    blue:   'text-blue-500',
    orange: 'text-orange-500',
    purple: 'text-purple-500',
  };
  const stroke = over ? 'text-red-500' : (strokeColors[color] || strokeColors.green);

  const size = 88;
  const sw = 8;
  const r = (size - sw) / 2;
  const c = 2 * Math.PI * r;
  const offset = c * (1 - pct / 100);

  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2} cy={size / 2} r={r}
            fill="none" strokeWidth={sw}
            className="text-gray-100" stroke="currentColor"
          />
          <circle
            cx={size / 2} cy={size / 2} r={r}
            fill="none" strokeWidth={sw} strokeLinecap="round"
            className={`${stroke} transition-all duration-700 ease-out`}
            stroke="currentColor"
            strokeDasharray={c}
            strokeDashoffset={offset}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-base font-extrabold text-gray-900 leading-none">{Math.round(current)}</span>
          <span className="text-[10px] text-gray-400 leading-none mt-0.5">/{Math.round(target)}{unit}</span>
        </div>
      </div>
      <span className="text-xs font-semibold text-gray-600">{label}</span>
      {over && (
        <span className="text-[10px] text-red-500 font-medium">+{Math.round(current - target)}{unit}</span>
      )}
    </div>
  );
}

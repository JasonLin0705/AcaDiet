import { useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

const LINES = [
  { key: 'calories', label: 'Calories', color: '#22c55e' },
  { key: 'protein',  label: 'Protein',  color: '#3b82f6' },
  { key: 'carbs',    label: 'Carbs',    color: '#f97316' },
  { key: 'fat',      label: 'Fat',      color: '#9333ea' },
];

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function MacroHistoryChart({ stats = [] }) {
  const [active, setActive] = useState({ calories: true, protein: true, carbs: true, fat: true });

  if (stats.length < 2) {
    return (
      <div className="pt-2 flex items-center justify-center h-40 text-gray-400 text-sm">
        Generate more meal plans to see your trends
      </div>
    );
  }

  const data = stats.map((s) => ({ ...s, date: formatDate(s.date) }));

  return (
    <div className="pt-2">
      <div className="flex flex-wrap gap-2 mb-4">
        {LINES.map(({ key, label, color }) => (
          <button
            key={key}
            onClick={() => setActive((prev) => ({ ...prev, [key]: !prev[key] }))}
            className="px-3 py-1 rounded-full text-xs font-medium border transition-colors"
            style={
              active[key]
                ? { backgroundColor: color, borderColor: color, color: '#fff' }
                : { backgroundColor: 'transparent', borderColor: color, color: color }
            }
          >
            {label}
          </button>
        ))}
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={data} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
          <XAxis dataKey="date" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
          <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
          <Tooltip
            contentStyle={{ borderRadius: '0.75rem', border: '1px solid #e5e7eb', fontSize: 12 }}
          />
          {LINES.map(({ key, color }) =>
            active[key] ? (
              <Line
                key={key}
                type="monotone"
                dataKey={key}
                stroke={color}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
              />
            ) : null
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

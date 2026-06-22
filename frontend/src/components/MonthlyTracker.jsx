import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import MacroHistoryChart from './MacroHistoryChart';

const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const pad = (n) => String(n).padStart(2, '0');
const currentMonth = () => new Date().toISOString().slice(0, 7);

function shiftMonth(month, delta) {
  const [y, m] = month.split('-').map(Number);
  const d = new Date(y, m - 1 + delta, 1);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;
}

export default function MonthlyTracker({ goals }) {
  const { getMonthlyLog } = useAuth();
  const [month, setMonth] = useState(currentMonth());
  const [days, setDays] = useState([]);
  const [loading, setLoading] = useState(true);

  const g = goals || { calories: 2000, protein: 150, carbs: 200, fat: 65 };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getMonthlyLog(month);
      setDays(data.days || []);
    } catch {
      setDays([]);
    } finally {
      setLoading(false);
    }
  }, [getMonthlyLog, month]);

  useEffect(() => { load(); }, [load]);

  const [year, monthIdx] = [Number(month.slice(0, 4)), Number(month.slice(5, 7)) - 1];
  const monthLabel = new Date(year, monthIdx, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const daysInMonth = new Date(year, monthIdx + 1, 0).getDate();
  const firstWeekday = new Date(year, monthIdx, 1).getDay();
  const todayStr = new Date().toISOString().slice(0, 10);
  const isFutureMonth = month >= currentMonth();

  const byDate = {};
  for (const d of days) byDate[d.date] = d;

  const cells = [];
  for (let i = 0; i < firstWeekday; i++) cells.push(null);
  for (let day = 1; day <= daysInMonth; day++) cells.push(`${month}-${pad(day)}`);

  const avg = days.length
    ? ['calories', 'protein', 'carbs', 'fat'].reduce((acc, k) => {
        acc[k] = Math.round(days.reduce((s, d) => s + d[k], 0) / days.length);
        return acc;
      }, {})
    : null;

  return (
    <div className="space-y-4">
      {/* Calendar */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => setMonth(m => shiftMonth(m, -1))}
            className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 active:scale-95 transition-all"
            aria-label="Previous month"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h2 className="text-lg font-extrabold text-gray-900">{monthLabel}</h2>
          <button
            onClick={() => setMonth(m => shiftMonth(m, 1))}
            disabled={isFutureMonth}
            className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 active:scale-95 transition-all disabled:opacity-30 disabled:pointer-events-none"
            aria-label="Next month"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1 mb-1">
          {WEEKDAYS.map((w, i) => (
            <div key={i} className="text-center text-[11px] font-bold text-gray-400 py-1">{w}</div>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-10">
            <div className="w-6 h-6 border-2 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-7 gap-1">
            {cells.map((date, i) => {
              if (!date) return <div key={`b${i}`} />;
              const d = byDate[date];
              const dayNum = Number(date.slice(8, 10));
              const isToday = date === todayStr;
              const pct = d && g.calories > 0 ? Math.min((d.calories / g.calories) * 100, 100) : 0;
              return (
                <div
                  key={date}
                  className={`relative aspect-square rounded-lg border overflow-hidden flex flex-col items-center justify-center
                    ${d ? 'border-emerald-100 bg-emerald-50/40' : 'border-gray-100 bg-gray-50/50'}
                    ${isToday ? 'ring-2 ring-emerald-400' : ''}`}
                  title={d ? `${Math.round(d.calories)} kcal · ${Math.round(d.protein)}p / ${Math.round(d.carbs)}c / ${Math.round(d.fat)}f` : 'No log'}
                >
                  <span className={`text-[11px] font-semibold leading-none ${d ? 'text-gray-700' : 'text-gray-300'}`}>{dayNum}</span>
                  {d && (
                    <span className="text-[10px] font-bold text-emerald-700 leading-none mt-0.5">{Math.round(d.calories)}</span>
                  )}
                  {d && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-emerald-100">
                      <div className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600" style={{ width: `${pct}%` }} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Monthly summary */}
      {!loading && (
        avg ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <h3 className="font-bold text-gray-900 mb-1">Daily average</h3>
            <p className="text-[11px] text-gray-400 mb-4">Across {days.length} logged {days.length === 1 ? 'day' : 'days'} this month</p>
            <div className="grid grid-cols-4 gap-2.5">
              {[
                { label: 'Calories', value: avg.calories, unit: 'kcal', cls: 'from-emerald-50 to-emerald-100/50 text-emerald-700 border-emerald-100' },
                { label: 'Protein', value: avg.protein, unit: 'g', cls: 'from-blue-50 to-blue-100/50 text-blue-700 border-blue-100' },
                { label: 'Carbs', value: avg.carbs, unit: 'g', cls: 'from-orange-50 to-orange-100/50 text-orange-700 border-orange-100' },
                { label: 'Fat', value: avg.fat, unit: 'g', cls: 'from-purple-50 to-purple-100/50 text-purple-700 border-purple-100' },
              ].map(s => (
                <div key={s.label} className={`bg-gradient-to-b ${s.cls} rounded-2xl border p-4 text-center`}>
                  <div className="text-2xl font-extrabold text-gray-900">{s.value}</div>
                  <div className="text-xs font-semibold uppercase tracking-wide mt-0.5">{s.unit}</div>
                  <div className="text-[11px] text-gray-500 mt-1">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 text-center py-10 text-gray-400">
            <p className="text-3xl mb-2">📅</p>
            <p className="text-sm">No foods logged this month yet.</p>
          </div>
        )
      )}

      {/* Trend */}
      {!loading && days.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <h3 className="font-bold text-gray-900">Macro trend</h3>
          <MacroHistoryChart stats={days} />
        </div>
      )}
    </div>
  );
}

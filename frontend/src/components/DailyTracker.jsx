import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import MacroRing from './MacroRing';
import MonthlyTracker from './MonthlyTracker';

const EMPTY_TOTALS = { calories: 0, protein: 0, carbs: 0, fat: 0 };
const EMPTY_FORM = { name: '', calories: '', protein: '', carbs: '', fat: '' };

const MACRO_FIELDS = [
  { key: 'calories', label: 'Calories', placeholder: 'kcal' },
  { key: 'protein', label: 'Protein', placeholder: 'g' },
  { key: 'carbs', label: 'Carbs', placeholder: 'g' },
  { key: 'fat', label: 'Fat', placeholder: 'g' },
];

export default function DailyTracker({ goals, favorites = [] }) {
  const { getLog, addLog, removeLog } = useAuth();
  const [entries, setEntries] = useState([]);
  const [totals, setTotals] = useState(EMPTY_TOTALS);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState('day');

  const g = goals || { calories: 2000, protein: 150, carbs: 200, fat: 65 };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getLog();
      setEntries(data.entries || []);
      setTotals(data.totals || EMPTY_TOTALS);
    } catch {
      // ignore — keep showing whatever we have
    } finally {
      setLoading(false);
    }
  }, [getLog]);

  useEffect(() => { load(); }, [load]);

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || saving) return;
    setSaving(true);
    try {
      await addLog({
        name: form.name.trim(),
        calories: Number(form.calories) || 0,
        protein: Number(form.protein) || 0,
        carbs: Number(form.carbs) || 0,
        fat: Number(form.fat) || 0,
      });
      setForm(EMPTY_FORM);
      await load();
    } catch {} finally {
      setSaving(false);
    }
  };

  const quickAdd = async (f) => {
    try {
      await addLog({ name: f.foodName, calories: f.calories, protein: f.protein, carbs: f.carbs, fat: f.fat });
      await load();
    } catch {}
  };

  const remove = async (id) => {
    setEntries(prev => prev.filter(e => e.id !== id));
    try { await removeLog(id); } catch {}
    load();
  };

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  return (
    <div className="space-y-4">
      {/* Day / Month toggle */}
      <div className="flex justify-center">
        <div className="inline-flex items-center bg-gray-100 rounded-xl p-0.5">
          {['day', 'month'].map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${tab === t ? 'bg-white text-emerald-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              {t === 'day' ? 'Day' : 'Month'}
            </button>
          ))}
        </div>
      </div>

      {tab === 'month' ? (
        <MonthlyTracker goals={g} />
      ) : (
      <>
      {/* Header + rings */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        <div className="mb-5">
          <h2 className="text-xl font-extrabold text-gray-900">Today</h2>
          <p className="text-sm text-gray-400 mt-0.5">{today}</p>
        </div>
        <div className="grid grid-cols-4 gap-2">
          <MacroRing label="Calories" current={totals.calories} target={g.calories} color="green"  unit="" />
          <MacroRing label="Protein"  current={totals.protein}  target={g.protein}  color="blue"   unit="g" />
          <MacroRing label="Carbs"    current={totals.carbs}    target={g.carbs}    color="orange" unit="g" />
          <MacroRing label="Fat"      current={totals.fat}      target={g.fat}      color="purple" unit="g" />
        </div>
      </div>

      {/* Add food */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        <h3 className="font-bold text-gray-900 mb-3">Log a food</h3>
        <form onSubmit={submit} className="space-y-3">
          <input
            type="text"
            value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })}
            placeholder="e.g. Protein bar"
            className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent"
          />
          <div className="grid grid-cols-4 gap-2">
            {MACRO_FIELDS.map(f => (
              <div key={f.key}>
                <label className="block text-[11px] font-semibold text-gray-500 mb-1">{f.label}</label>
                <input
                  type="number"
                  min="0"
                  inputMode="decimal"
                  value={form[f.key]}
                  onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                  placeholder={f.placeholder}
                  className="w-full px-2.5 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent"
                />
              </div>
            ))}
          </div>
          <button
            type="submit"
            disabled={!form.name.trim() || saving}
            className="w-full py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl font-bold hover:from-emerald-600 hover:to-emerald-700 active:scale-[0.98] transition-all shadow-md shadow-emerald-200/50 disabled:opacity-40 text-sm"
          >
            {saving ? 'Adding…' : 'Add to Today'}
          </button>
        </form>
      </div>

      {/* Quick-add favorites */}
      {favorites.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <h3 className="font-bold text-gray-900 mb-3">Quick add from favorites</h3>
          <div className="space-y-2">
            {favorites.map(f => (
              <div key={f.foodId} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{f.foodName}</p>
                  <p className="text-[11px] text-gray-400">{f.calories} kcal · {f.protein}p / {f.carbs}c / {f.fat}f</p>
                </div>
                <button
                  onClick={() => quickAdd(f)}
                  className="shrink-0 px-3 py-1.5 bg-emerald-100 text-emerald-700 rounded-lg text-xs font-bold hover:bg-emerald-200 active:scale-95 transition-all"
                >
                  + Add
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Today's entries */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        <h3 className="font-bold text-gray-900 mb-3">Logged today</h3>
        {loading ? (
          <div className="flex justify-center py-6">
            <div className="w-6 h-6 border-2 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
          </div>
        ) : entries.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <p className="text-3xl mb-2">🍽</p>
            <p className="text-sm">Nothing logged yet today.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {entries.map(e => (
              <div key={e.id} className="flex items-center gap-3 p-3.5 bg-white rounded-xl border border-gray-100">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{e.name}</p>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className="text-[11px] text-blue-500 font-medium">{e.protein}g protein</span>
                    <span className="text-[11px] text-orange-500 font-medium">{e.carbs}g carbs</span>
                    <span className="text-[11px] text-purple-500 font-medium">{e.fat}g fat</span>
                  </div>
                </div>
                <div className="shrink-0 text-right">
                  <div className="text-base font-bold text-gray-900">{e.calories}</div>
                  <div className="text-[10px] text-gray-400 uppercase tracking-wide">kcal</div>
                </div>
                <button
                  onClick={() => remove(e.id)}
                  className="shrink-0 p-1.5 rounded-lg hover:bg-red-50 text-gray-300 hover:text-red-500 transition-colors"
                  aria-label="Remove entry"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
      </>
      )}
    </div>
  );
}

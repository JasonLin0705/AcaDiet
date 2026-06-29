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

function currentMeal() {
  const h = new Date().getHours() + new Date().getMinutes() / 60;
  if (h < 10.5) return 'breakfast';
  if (h < 16) return 'lunch';
  return 'dinner';
}

const MEAL_LABEL = { breakfast: 'breakfast', lunch: 'lunch', dinner: 'dinner' };

export default function DailyTracker({ goals, favorites = [], university = null, hallSelections = null }) {
  const { getLog, addLog, removeLog, eatNow, favoritesToday } = useAuth();
  const [entries, setEntries] = useState([]);
  const [totals, setTotals] = useState(EMPTY_TOTALS);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState('day');
  const [eatLoading, setEatLoading] = useState(false);
  const [eatError, setEatError] = useState(null);
  const [eatResult, setEatResult] = useState(null);
  const [favLoading, setFavLoading] = useState(false);
  const [favError, setFavError] = useState(null);
  const [favResult, setFavResult] = useState(null);

  const g = goals || { calories: 2000, protein: 150, carbs: 200, fat: 65 };

  const hallForMeal = (meal) =>
    hallSelections?.[`${meal}Hall`] ||
    hallSelections?.breakfastHall ||
    hallSelections?.lunchHall ||
    hallSelections?.dinnerHall ||
    null;

  const canEatNow = !!(university?.subdomain && hallForMeal(currentMeal())?.slug);
  const canCheckFavorites = !!(university?.subdomain && hallSelections && favorites.length > 0);

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

  const loadFavoritesToday = useCallback(async () => {
    if (!university?.subdomain || !hallSelections || favorites.length === 0) return;
    setFavLoading(true);
    setFavError(null);
    try {
      const data = await favoritesToday({
        school: university.subdomain,
        breakfastHall: hallSelections.breakfastHall,
        lunchHall: hallSelections.lunchHall,
        dinnerHall: hallSelections.dinnerHall,
      });
      setFavResult(data);
    } catch (err) {
      setFavError(err?.message || "Could not check your favorites against today's menu.");
      setFavResult(null);
    } finally {
      setFavLoading(false);
    }
  }, [favoritesToday, university, hallSelections, favorites.length]);

  useEffect(() => { if (canCheckFavorites) loadFavoritesToday(); }, [canCheckFavorites, loadFavoritesToday]);

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

  const runEatNow = async () => {
    const meal = currentMeal();
    const hall = hallForMeal(meal);
    if (!university?.subdomain || !hall?.slug || eatLoading) return;
    setEatLoading(true);
    setEatError(null);
    try {
      const data = await eatNow({
        school: university.subdomain,
        hallSlug: hall.slug,
        hallName: hall.name,
        menuTypes: hall.menuTypes,
        mealType: meal,
      });
      setEatResult(data);
    } catch (err) {
      setEatError(err?.message || 'Could not load live suggestions. The hall may be closed or have no menu posted.');
      setEatResult(null);
    } finally {
      setEatLoading(false);
    }
  };

  const addRecommendation = async (item) => {
    try {
      await addLog({
        name: item.name,
        calories: item.calories,
        protein: item.protein,
        carbs: item.carbs,
        fat: item.fat,
      });
      await load();
    } catch {}
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

      {/* Eat Now — live suggestions against remaining macros */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        <div className="flex items-center justify-between mb-1">
          <h3 className="font-bold text-gray-900">Eat now</h3>
          {eatResult && (
            <span className="text-[11px] text-gray-400 capitalize">{MEAL_LABEL[eatResult.mealType] || eatResult.mealType}</span>
          )}
        </div>
        <p className="text-xs text-gray-400 mb-3">
          What to grab right now, scored against the macros you have left today.
        </p>

        {!canEatNow ? (
          <div className="text-center py-5 px-3 bg-gray-50 rounded-xl">
            <p className="text-sm text-gray-500">Pick a dining hall in the <span className="font-semibold text-gray-700">Plan</span> tab to get live suggestions.</p>
          </div>
        ) : (
          <>
            <button
              onClick={runEatNow}
              disabled={eatLoading}
              className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-bold hover:from-amber-600 hover:to-orange-600 active:scale-[0.98] transition-all shadow-md shadow-amber-200/50 disabled:opacity-40 text-sm"
            >
              {eatLoading ? 'Finding options…' : eatResult ? 'Refresh suggestions' : 'What should I eat right now?'}
            </button>

            {eatError && (
              <p className="mt-3 text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2">{eatError}</p>
            )}

            {eatResult && !eatLoading && (
              <div className="mt-4">
                {eatResult.atGoal ? (
                  <div className="text-center py-6 text-gray-500">
                    <p className="text-3xl mb-2">🎉</p>
                    <p className="text-sm">You've hit your goals for today — nicely done.</p>
                  </div>
                ) : (eatResult.recommendations || []).length === 0 ? (
                  <div className="text-center py-6 text-gray-400">
                    <p className="text-sm">Nothing on the {MEAL_LABEL[eatResult.mealType] || eatResult.mealType} menu fits your remaining budget right now.</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p className="text-[11px] text-gray-400 mb-1">
                      ~{Math.max(0, Math.round(eatResult.remaining?.calories || 0))} kcal · {Math.max(0, Math.round(eatResult.remaining?.protein || 0))}g protein left
                    </p>
                    {eatResult.recommendations.map((item, i) => (
                      <div key={item.id || i} className="flex items-center gap-3 p-3.5 bg-white rounded-xl border border-gray-100">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900 truncate">{item.name}</p>
                          {item.servingSize && (
                            <p className="text-[11px] text-gray-400 mt-0.5">{item.servingSize}</p>
                          )}
                          <div className="flex items-center gap-3 mt-0.5">
                            <span className="text-[11px] text-blue-500 font-medium">{item.protein}g protein</span>
                            <span className="text-[11px] text-orange-500 font-medium">{item.carbs}g carbs</span>
                            <span className="text-[11px] text-purple-500 font-medium">{item.fat}g fat</span>
                          </div>
                        </div>
                        <div className="shrink-0 text-right">
                          <div className="text-base font-bold text-gray-900">{item.calories}</div>
                          <div className="text-[10px] text-gray-400 uppercase tracking-wide">kcal</div>
                        </div>
                        <button
                          onClick={() => addRecommendation(item)}
                          className="shrink-0 px-3 py-1.5 bg-emerald-100 text-emerald-700 rounded-lg text-xs font-bold hover:bg-emerald-200 active:scale-95 transition-all"
                        >
                          + Add
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Today at your halls — favorites available on today's live menu */}
      {favorites.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-bold text-gray-900">Today at your halls</h3>
            {favResult && !favLoading && (
              <span className="text-[11px] text-gray-400">
                {(favResult.matches || []).length} of {favResult.favoritesCount} on menu
              </span>
            )}
          </div>
          <p className="text-xs text-gray-400 mb-3">
            Which of your favorites are on today's menu, and where.
          </p>

          {!canCheckFavorites ? (
            <div className="text-center py-5 px-3 bg-gray-50 rounded-xl">
              <p className="text-sm text-gray-500">Pick a dining hall in the <span className="font-semibold text-gray-700">Plan</span> tab to see your favorites' availability.</p>
            </div>
          ) : favLoading ? (
            <div className="flex justify-center py-6">
              <div className="w-6 h-6 border-2 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
            </div>
          ) : favError ? (
            <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2">{favError}</p>
          ) : (favResult?.matches || []).length === 0 ? (
            <div className="text-center py-6 text-gray-400">
              <p className="text-3xl mb-2">🔍</p>
              <p className="text-sm">None of your favorites are on the menu today.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {favResult.matches.map((m, i) => {
                const addItem = m.locations?.[0]?.item || {
                  name: m.favorite.foodName,
                  calories: m.favorite.calories,
                  protein: m.favorite.protein,
                  carbs: m.favorite.carbs,
                  fat: m.favorite.fat,
                };
                return (
                  <div key={m.favorite.foodId || i} className="flex items-center gap-3 p-3.5 bg-white rounded-xl border border-gray-100">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{m.favorite.foodName}</p>
                      <div className="flex flex-wrap items-center gap-1.5 mt-1">
                        {m.locations.map((loc, j) => (
                          <span key={j} className="text-[10px] px-1.5 py-0.5 rounded-full font-semibold bg-emerald-50 text-emerald-700 capitalize">
                            {MEAL_LABEL[loc.mealType] || loc.mealType} · {loc.hallName}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="shrink-0 text-right">
                      <div className="text-base font-bold text-gray-900">{m.favorite.calories}</div>
                      <div className="text-[10px] text-gray-400 uppercase tracking-wide">kcal</div>
                    </div>
                    <button
                      onClick={() => addRecommendation(addItem)}
                      className="shrink-0 px-3 py-1.5 bg-emerald-100 text-emerald-700 rounded-lg text-xs font-bold hover:bg-emerald-200 active:scale-95 transition-all"
                    >
                      + Add
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

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

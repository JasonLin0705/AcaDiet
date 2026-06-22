import { useState, useEffect } from 'react';
import FoodItem from './FoodItem';
import MacroBar from './MacroBar';

function HallBadge({ name, color }) {
  const colors = {
    amber:   'bg-amber-100 text-amber-700',
    emerald: 'bg-emerald-100 text-emerald-700',
    indigo:  'bg-indigo-100 text-indigo-700',
  };
  return (
    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${colors[color] || colors.emerald}`}>
      {name}
    </span>
  );
}

function MealSection({ title, emoji, items, targetCals, emptyLabel, hallName, hallColor, favorites, onToggleFavorite }) {
  const totalCals = items.reduce((s, i) => s + (i.calories || 0), 0);
  const pct = targetCals > 0 ? Math.min((totalCals / targetCals) * 100, 100) : 0;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-50">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="text-xl">{emoji}</span>
            <div>
              <h3 className="font-bold text-gray-900">{title}</h3>
              {hallName && <HallBadge name={hallName} color={hallColor} />}
            </div>
          </div>
          <div className="text-right shrink-0">
            <div className="text-base font-bold text-gray-900">{totalCals}<span className="text-xs font-normal text-gray-400 ml-1">cal</span></div>
            <div className="text-[11px] text-gray-400">of {Math.round(targetCals)} target</div>
          </div>
        </div>
        {items.length > 0 && (
          <div className="mt-3 h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600 transition-all duration-700"
              style={{ width: `${pct}%` }}
            />
          </div>
        )}
      </div>

      <div className="p-4 space-y-2">
        {items.length > 0 ? (
          items.map((item) => (
            <FoodItem
              key={item.id}
              item={item}
              isFavorite={favorites ? favorites.some(f => f.foodId === String(item.id)) : false}
              onToggleFavorite={onToggleFavorite ? () => onToggleFavorite(item) : undefined}
            />
          ))
        ) : (
          <div className="text-center py-8 text-gray-400">
            <p className="text-3xl mb-2">🍽</p>
            <p className="text-sm">{emptyLabel || 'No items for this meal.'}</p>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, unit, color }) {
  const colors = {
    emerald: 'from-emerald-50 to-emerald-100/50 text-emerald-700 border-emerald-100',
    blue:    'from-blue-50 to-blue-100/50 text-blue-700 border-blue-100',
    orange:  'from-orange-50 to-orange-100/50 text-orange-700 border-orange-100',
    purple:  'from-purple-50 to-purple-100/50 text-purple-700 border-purple-100',
  };
  return (
    <div className={`bg-gradient-to-b ${colors[color]} rounded-2xl border p-4 text-center`}>
      <div className="text-2xl font-extrabold text-gray-900">{Math.round(value)}</div>
      <div className={`text-xs font-semibold uppercase tracking-wide mt-0.5 ${colors[color].split(' ')[3]}`}>{unit}</div>
      <div className="text-[11px] text-gray-500 mt-1">{label}</div>
    </div>
  );
}

function SavedToast({ show }) {
  return (
    <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 ${show ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
      <div className="bg-gray-900 text-white text-sm font-medium px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5">
        <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
        </svg>
        Meal plan saved to your history
      </div>
    </div>
  );
}

export default function MealPlanDisplay({ plan, goals, university, hallSelections, onRegenerate, onStartOver, generating, favorites, onToggleFavorite, onShare }) {
  const { breakfast = [], lunch = [], dinner = [], totals = {}, availableCounts = {} } = plan;
  const { breakfastHall, lunchHall, dinnerHall } = hallSelections || {};
  const [showToast, setShowToast] = useState(false);
  const [shareLoading, setShareLoading] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);

  const date = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  const totalItems = breakfast.length + lunch.length + dinner.length;
  const totalAvailable = (availableCounts.breakfast ?? 0) + (availableCounts.lunch ?? 0) + (availableCounts.dinner ?? 0);
  const noMenuPublished = totalAvailable === 0;

  const handleShare = async () => {
    if (!onShare) return;
    setShareLoading(true);
    try {
      const url = await onShare();
      if (url) {
        await navigator.clipboard.writeText(url);
        setShareCopied(true);
        setTimeout(() => setShareCopied(false), 2500);
      }
    } catch {}
    setShareLoading(false);
  };

  // Show a brief toast if auto-saved (parent triggers via saveHistory)
  useEffect(() => {
    if (totalItems > 0) {
      const t = setTimeout(() => setShowToast(true), 600);
      const t2 = setTimeout(() => setShowToast(false), 3000);
      return () => { clearTimeout(t); clearTimeout(t2); };
    }
  }, []);

  // Unique halls for display
  const uniqueHalls = [breakfastHall, lunchHall, dinnerHall]
    .filter(Boolean)
    .filter((h, i, a) => h && a.findIndex(x => x?.slug === h?.slug) === i);

  return (
    <div className="space-y-4">
      <SavedToast show={showToast} />

      {/* Header card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div>
            <h2 className="text-xl font-extrabold text-gray-900">Your Meal Plan</h2>
            <p className="text-sm text-gray-400 mt-0.5">{university?.name} · {date}</p>
          </div>
          <button
            onClick={onRegenerate}
            disabled={generating}
            className="shrink-0 flex items-center gap-1.5 px-3.5 py-2 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 active:scale-95 transition-all disabled:opacity-40"
          >
            <svg className={`w-4 h-4 ${generating ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            {generating ? 'Loading…' : 'Refresh'}
          </button>
        </div>

        {/* Hall pills */}
        {uniqueHalls.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {uniqueHalls.map(h => (
              <span key={h.slug} className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full font-medium">
                {h.name}
              </span>
            ))}
          </div>
        )}

        {noMenuPublished && (
          <div className="mt-3 p-3.5 bg-orange-50 border border-orange-100 rounded-xl text-sm text-orange-700">
            No menu has been published for these dining halls today. They may be closed or menus haven't been posted yet.
          </div>
        )}
        {!noMenuPublished && totalItems === 0 && (
          <div className="mt-3 p-3.5 bg-amber-50 border border-amber-100 rounded-xl text-sm text-amber-700">
            No menu items matched your dietary restrictions. Try relaxing your filters.
          </div>
        )}
      </div>

      {/* Meal sections */}
      <MealSection
        title="Breakfast"
        emoji="☀️"
        items={breakfast}
        targetCals={(goals?.calories || 2000) * 0.25}
        hallName={breakfastHall?.name}
        hallColor="amber"
        emptyLabel={availableCounts.breakfast === 0 ? "Breakfast isn't served at this hall today." : "No breakfast items matched your restrictions."}
        favorites={favorites}
        onToggleFavorite={onToggleFavorite}
      />
      <MealSection
        title="Lunch"
        emoji="🌤"
        items={lunch}
        targetCals={(goals?.calories || 2000) * 0.35}
        hallName={lunchHall?.name}
        hallColor="emerald"
        emptyLabel={availableCounts.lunch === 0 ? "Lunch isn't served at this hall today." : "No lunch items matched your restrictions."}
        favorites={favorites}
        onToggleFavorite={onToggleFavorite}
      />
      <MealSection
        title="Dinner"
        emoji="🌙"
        items={dinner}
        targetCals={(goals?.calories || 2000) * 0.35}
        hallName={dinnerHall?.name}
        hallColor="indigo"
        emptyLabel={availableCounts.dinner === 0 ? "Dinner isn't served at this hall today." : "No dinner items matched your restrictions."}
        favorites={favorites}
        onToggleFavorite={onToggleFavorite}
      />

      {/* Daily totals */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        <h3 className="font-bold text-gray-900 text-lg mb-4">Daily Totals</h3>

        <div className="grid grid-cols-4 gap-2.5 mb-5">
          <StatCard label="Calories" value={totals.calories || 0} unit="kcal" color="emerald" />
          <StatCard label="Protein"  value={totals.protein  || 0} unit="g"    color="blue"    />
          <StatCard label="Carbs"    value={totals.carbs    || 0} unit="g"    color="orange"  />
          <StatCard label="Fat"      value={totals.fat      || 0} unit="g"    color="purple"  />
        </div>

        <div className="space-y-4">
          <MacroBar label="Calories"      current={totals.calories || 0} target={goals?.calories || 2000} color="green"  unit=" kcal" />
          <MacroBar label="Protein"       current={totals.protein  || 0} target={goals?.protein  || 150}  color="blue"              />
          <MacroBar label="Carbohydrates" current={totals.carbs    || 0} target={goals?.carbs    || 200}  color="orange"            />
          <MacroBar label="Fat"           current={totals.fat      || 0} target={goals?.fat      || 65}   color="purple"            />
          {(totals.fiber || 0) > 0 && (
            <MacroBar label="Fiber" current={totals.fiber} target={28} color="green" />
          )}
        </div>

        {(totals.sodium || 0) > 0 && (
          <p className="text-xs text-gray-400 mt-4 text-center">
            Sodium: {Math.round(totals.sodium)} mg / 2,300 mg daily limit
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={onStartOver}
          className="py-3.5 px-4 border border-gray-200 text-gray-600 rounded-xl font-semibold hover:bg-gray-50 active:scale-[0.98] transition-all text-sm"
        >
          Start Over
        </button>
        {onShare && (
          <button
            onClick={handleShare}
            disabled={shareLoading}
            className="py-3.5 px-4 border border-gray-200 text-gray-600 rounded-xl font-semibold hover:bg-gray-50 active:scale-[0.98] transition-all text-sm flex items-center gap-1.5 disabled:opacity-40"
          >
            {shareCopied ? (
              <>
                <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
                Copied!
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
                Share
              </>
            )}
          </button>
        )}
        <button
          onClick={onRegenerate}
          disabled={generating}
          className="flex-1 py-3.5 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl font-bold hover:from-emerald-600 hover:to-emerald-700 active:scale-[0.98] transition-all shadow-md shadow-emerald-200/50 disabled:opacity-40 text-sm"
        >
          {generating ? 'Generating…' : 'New Plan'}
        </button>
      </div>
    </div>
  );
}

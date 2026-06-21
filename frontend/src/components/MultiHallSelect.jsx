import { useState } from 'react';

const MEALS = [
  { key: 'breakfast', label: 'Breakfast', emoji: '☀️', time: '7:00 – 10:30 AM', color: 'amber' },
  { key: 'lunch',     label: 'Lunch',     emoji: '🌤', time: '11:00 AM – 2:30 PM', color: 'emerald' },
  { key: 'dinner',    label: 'Dinner',    emoji: '🌙', time: '5:00 – 8:30 PM', color: 'indigo' },
];

const COLOR = {
  amber:   { bg: 'bg-amber-50',   border: 'border-amber-300',   badge: 'bg-amber-100 text-amber-800',   dot: 'bg-amber-400',   ring: 'ring-amber-100'   },
  emerald: { bg: 'bg-emerald-50', border: 'border-emerald-300', badge: 'bg-emerald-100 text-emerald-800', dot: 'bg-emerald-500', ring: 'ring-emerald-100' },
  indigo:  { bg: 'bg-indigo-50',  border: 'border-indigo-300',  badge: 'bg-indigo-100 text-indigo-800',  dot: 'bg-indigo-500',  ring: 'ring-indigo-100'  },
};

function MealSlot({ meal, halls, selected, onChange }) {
  const c = COLOR[meal.color];
  const isSelected = !!selected;

  return (
    <div className={`rounded-2xl border-2 p-5 transition-all duration-200 ${isSelected ? `${c.border} ${c.bg}` : 'border-gray-100 bg-white shadow-sm'}`}>
      <div className="flex items-center gap-3 mb-4">
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl shadow-sm ${isSelected ? 'bg-white' : 'bg-gray-50'}`}>
          {meal.emoji}
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-gray-900 text-base">{meal.label}</h3>
          <p className="text-xs text-gray-400 mt-0.5">{meal.time}</p>
        </div>
        {selected && (
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${c.badge}`}>
            {selected.name}
          </span>
        )}
      </div>

      <div className="space-y-1.5">
        {halls.map(hall => {
          const active = selected?.slug === hall.slug;
          return (
            <button
              key={hall.slug}
              onClick={() => onChange(active ? null : hall)}
              className={`w-full text-left px-4 py-3 rounded-xl border text-sm font-medium transition-all duration-150 flex items-center gap-3 ${
                active
                  ? `border-2 ${c.border} bg-white text-gray-900 shadow-sm`
                  : 'border border-gray-100 bg-white text-gray-600 hover:border-gray-200 hover:bg-gray-50'
              }`}
            >
              <div className={`w-2.5 h-2.5 rounded-full shrink-0 transition-colors ${active ? c.dot : 'bg-gray-200'}`} />
              <span className="flex-1 truncate">{hall.name}</span>
              {active && (
                <svg className="w-4 h-4 text-emerald-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </button>
          );
        })}

        <button
          onClick={() => onChange(null)}
          className={`w-full text-left px-4 py-3 rounded-xl border text-sm font-medium transition-all flex items-center gap-3 ${
            !selected
              ? 'border border-gray-300 bg-gray-50 text-gray-500'
              : 'border border-gray-100 bg-white text-gray-300 hover:border-gray-200 hover:text-gray-400'
          }`}
        >
          <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${!selected ? 'bg-gray-400' : 'bg-gray-200'}`} />
          <span>Skip {meal.label}</span>
          {!selected && (
            <svg className="w-4 h-4 text-gray-400 shrink-0 ml-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}

export default function MultiHallSelect({ university, halls, goals, restrictions, onGenerate, onBack, loading }) {
  const [selections, setSelections] = useState({
    breakfast: halls[0] || null,
    lunch: halls[0] || null,
    dinner: halls[0] || null,
  });

  const set = (meal) => (hall) => setSelections(s => ({ ...s, [meal]: hall }));
  const hasAny = selections.breakfast || selections.lunch || selections.dinner;
  const selectedCount = [selections.breakfast, selections.lunch, selections.dinner].filter(Boolean).length;

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-1">Choose your dining halls</h2>
        <p className="text-gray-500 text-sm">
          Mix and match halls for each meal at <strong>{university.fullName}</strong>.
          Skip any meal you won't be eating.
        </p>
        {selectedCount > 0 && (
          <div className="mt-3 flex items-center gap-2">
            <div className="flex -space-x-1">
              {[selections.breakfast, selections.lunch, selections.dinner].filter(Boolean).map((_, i) => (
                <div key={i} className={`w-5 h-5 rounded-full border-2 border-white ${['bg-amber-400','bg-emerald-500','bg-indigo-500'][i]}`} />
              ))}
            </div>
            <span className="text-xs text-gray-500 font-medium">{selectedCount} meal{selectedCount > 1 ? 's' : ''} selected</span>
          </div>
        )}
      </div>

      {MEALS.map(meal => (
        <MealSlot
          key={meal.key}
          meal={meal}
          halls={halls}
          selected={selections[meal.key]}
          onChange={set(meal.key)}
        />
      ))}

      {loading && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex items-center justify-center gap-3">
          <div className="w-6 h-6 border-[3px] border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
          <p className="text-gray-600 text-sm font-medium">Crunching the numbers for your perfect meal plan...</p>
        </div>
      )}

      <div className="flex gap-3 pt-1">
        <button
          onClick={onBack}
          disabled={loading}
          className="px-5 py-3.5 border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors text-sm disabled:opacity-40"
        >
          Back
        </button>
        <button
          onClick={() => onGenerate({ breakfastHall: selections.breakfast, lunchHall: selections.lunch, dinnerHall: selections.dinner })}
          disabled={!hasAny || loading}
          className="flex-1 py-3.5 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl font-bold hover:from-emerald-600 hover:to-emerald-700 active:scale-[0.98] transition-all shadow-lg shadow-emerald-200/60 disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none text-sm"
        >
          {loading ? 'Generating…' : `Generate My Meal Plan${selectedCount > 0 ? ` (${selectedCount} meal${selectedCount > 1 ? 's' : ''})` : ''}`}
        </button>
      </div>
    </div>
  );
}

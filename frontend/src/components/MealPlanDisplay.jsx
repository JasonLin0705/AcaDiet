import FoodItem from './FoodItem';
import MacroBar from './MacroBar';

function MealSection({ title, emoji, items, targetCals, emptyLabel }) {
  const totalCals = items.reduce((s, i) => s + i.calories, 0);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl">{emoji}</span>
          <h3 className="font-semibold text-gray-900 text-lg">{title}</h3>
        </div>
        <div className="text-right">
          <span className="text-sm font-semibold text-gray-700">{totalCals} cal</span>
          <span className="text-xs text-gray-400 ml-1">/ {Math.round(targetCals)} target</span>
        </div>
      </div>

      <div className="p-4 space-y-2">
        {items.length > 0 ? (
          items.map((item) => <FoodItem key={item.id} item={item} />)
        ) : (
          <div className="text-center py-6 text-gray-400">
            <p className="text-2xl mb-2">🍽</p>
            <p className="text-sm">
              {emptyLabel || 'No menu items available for this meal period.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function NutritionStat({ label, value, unit }) {
  return (
    <div className="bg-gray-50 rounded-xl p-3 text-center">
      <div className="text-xl font-bold text-gray-900">{Math.round(value)}<span className="text-sm font-medium text-gray-500 ml-0.5">{unit}</span></div>
      <div className="text-xs text-gray-500 mt-0.5">{label}</div>
    </div>
  );
}

export default function MealPlanDisplay({ plan, goals, university, diningHall, onRegenerate, onStartOver, generating }) {
  const { breakfast, lunch, dinner, totals, availableCounts } = plan;
  const date = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  const totalItems = breakfast.length + lunch.length + dinner.length;
  const totalAvailable = (availableCounts?.breakfast ?? 0) + (availableCounts?.lunch ?? 0) + (availableCounts?.dinner ?? 0);
  const noMenuPublished = totalAvailable === 0;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Your Meal Plan</h2>
            <p className="text-sm text-gray-500 mt-0.5">
              {university.name} · {diningHall.name} · {date}
            </p>
          </div>
          <button
            onClick={onRegenerate}
            disabled={generating}
            className="shrink-0 flex items-center gap-1.5 px-3 py-2 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <svg className={`w-4 h-4 ${generating ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Regenerate
          </button>
        </div>

        {noMenuPublished ? (
          <div className="mt-3 p-3 bg-orange-50 rounded-xl text-sm text-orange-700">
            No menu has been published for this dining hall today. It may be closed or menus haven't been posted yet.
          </div>
        ) : totalItems === 0 ? (
          <div className="mt-3 p-3 bg-amber-50 rounded-xl text-sm text-amber-700">
            No menu items matched your dietary restrictions. Try relaxing your filters.
          </div>
        ) : null}
      </div>

      {/* Meal sections */}
      <MealSection
        title="Breakfast"
        emoji="🌅"
        items={breakfast}
        targetCals={goals.calories * 0.25}
        emptyLabel={availableCounts?.breakfast === 0 ? "Breakfast isn't served at this hall today." : "No breakfast items matched your restrictions."}
      />
      <MealSection
        title="Lunch"
        emoji="☀️"
        items={lunch}
        targetCals={goals.calories * 0.35}
        emptyLabel={availableCounts?.lunch === 0 ? "Lunch isn't served at this hall today." : "No lunch items matched your restrictions."}
      />
      <MealSection
        title="Dinner"
        emoji="🌙"
        items={dinner}
        targetCals={goals.calories * 0.35}
        emptyLabel={availableCounts?.dinner === 0 ? "Dinner isn't served at this hall today." : "No dinner items matched your restrictions."}
      />

      {/* Daily Summary */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        <h3 className="font-semibold text-gray-900 text-lg mb-4">Daily Totals</h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
          <NutritionStat label="Calories" value={totals.calories} unit="kcal" />
          <NutritionStat label="Protein" value={totals.protein} unit="g" />
          <NutritionStat label="Carbs" value={totals.carbs} unit="g" />
          <NutritionStat label="Fat" value={totals.fat} unit="g" />
        </div>

        <div className="space-y-4">
          <MacroBar label="Calories" current={totals.calories} target={goals.calories} color="green" unit=" kcal" />
          <MacroBar label="Protein" current={totals.protein} target={goals.protein} color="blue" />
          <MacroBar label="Carbohydrates" current={totals.carbs} target={goals.carbs} color="orange" />
          <MacroBar label="Fat" current={totals.fat} target={goals.fat} color="purple" />
          {totals.fiber > 0 && (
            <MacroBar label="Fiber" current={totals.fiber} target={28} color="green" />
          )}
        </div>

        {totals.sodium > 0 && (
          <p className="text-xs text-gray-400 mt-4 text-center">
            Sodium: {Math.round(totals.sodium)} mg / 2300 mg daily limit
          </p>
        )}
      </div>

      <div className="flex gap-3">
        <button
          onClick={onStartOver}
          className="flex-1 py-3 border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors text-sm"
        >
          Start Over
        </button>
      </div>
    </div>
  );
}

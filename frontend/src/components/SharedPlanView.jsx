import FoodItem from './FoodItem';
import MacroBar from './MacroBar';

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

function MealSection({ title, emoji, items }) {
  const totalCals = items.reduce((s, i) => s + (i.calories || 0), 0);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-50">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="text-xl">{emoji}</span>
            <h3 className="font-bold text-gray-900">{title}</h3>
          </div>
          <div className="text-right shrink-0">
            <div className="text-base font-bold text-gray-900">
              {totalCals}<span className="text-xs font-normal text-gray-400 ml-1">cal</span>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-2">
        {items.length > 0 ? (
          items.map((item) => <FoodItem key={item.id} item={item} />)
        ) : (
          <div className="text-center py-8 text-gray-400">
            <p className="text-3xl mb-2">🍽</p>
            <p className="text-sm">No items for this meal.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function SharedPlanView({ sharedPlan }) {
  const { school, date, hallName, breakfast = [], lunch = [], dinner = [], calories = 0, protein = 0, carbs = 0, fat = 0 } = sharedPlan;

  const formattedDate = date
    ? new Date(date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
    : '';

  return (
    <div className="space-y-4">
      {/* Header card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        <div className="flex items-start justify-between gap-3 mb-2">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                Shared Meal Plan
              </span>
            </div>
            <h2 className="text-xl font-extrabold text-gray-900">{school}{hallName ? ` — ${hallName}` : ''}</h2>
            <p className="text-sm text-gray-400 mt-0.5">{formattedDate}</p>
          </div>
          <span className="text-3xl">🥗</span>
        </div>
      </div>

      {/* Meal sections */}
      <MealSection title="Breakfast" emoji="☀️" items={breakfast} />
      <MealSection title="Lunch"     emoji="🌤"  items={lunch}     />
      <MealSection title="Dinner"    emoji="🌙"  items={dinner}    />

      {/* Daily totals */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        <h3 className="font-bold text-gray-900 text-lg mb-4">Daily Totals</h3>

        <div className="grid grid-cols-4 gap-2.5 mb-5">
          <StatCard label="Calories" value={calories} unit="kcal" color="emerald" />
          <StatCard label="Protein"  value={protein}  unit="g"    color="blue"    />
          <StatCard label="Carbs"    value={carbs}    unit="g"    color="orange"  />
          <StatCard label="Fat"      value={fat}      unit="g"    color="purple"  />
        </div>

        <div className="space-y-4">
          <MacroBar label="Calories"      current={calories} target={2000} color="green"  unit=" kcal" />
          <MacroBar label="Protein"       current={protein}  target={150}  color="blue"              />
          <MacroBar label="Carbohydrates" current={carbs}    target={200}  color="orange"            />
          <MacroBar label="Fat"           current={fat}      target={65}   color="purple"            />
        </div>
      </div>

      {/* CTA */}
      <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 rounded-2xl border border-emerald-100 p-6 text-center">
        <p className="text-sm text-gray-500 mb-1">Want your own personalized meal plan?</p>
        <p className="font-bold text-gray-900 text-lg mb-4">Built for your goals, your dining hall.</p>
        <button
          onClick={() => { window.location.href = window.location.origin; }}
          className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl font-bold hover:from-emerald-600 hover:to-emerald-700 active:scale-[0.98] transition-all shadow-md shadow-emerald-200/50 text-sm"
        >
          Try AcaDiet Free
        </button>
      </div>
    </div>
  );
}

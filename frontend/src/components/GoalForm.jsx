import { useState } from 'react';

const RESTRICTIONS = [
  { id: 'vegetarian', label: 'Vegetarian', icon: '🥦' },
  { id: 'vegan', label: 'Vegan', icon: '🌱' },
  { id: 'gluten-free', label: 'Gluten-Free', icon: '🌾' },
  { id: 'halal', label: 'Halal', icon: '☪️' },
  { id: 'kosher', label: 'Kosher', icon: '✡️' },
  { id: 'nut-free', label: 'Nut-Free', icon: '🥜' },
  { id: 'dairy-free', label: 'Dairy-Free', icon: '🥛' },
];

const TRACK_COLORS = {
  green: '#d1fae5',
  blue: '#dbeafe',
  orange: '#ffedd5',
  purple: '#f3e8ff',
};

const ACCENT_COLORS = {
  green: '#059669',
  blue: '#2563eb',
  orange: '#ea580c',
  purple: '#9333ea',
};

function MacroSlider({ label, value, min, max, step = 5, unit, color, onChange }) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <label className="text-sm font-semibold text-gray-700">{label}</label>
        <div className="flex items-center gap-1.5">
          <input
            type="number"
            value={value}
            min={min}
            max={max}
            onChange={(e) => onChange(Math.max(min, Math.min(max, Number(e.target.value))))}
            className="w-16 text-right text-sm font-bold text-gray-900 border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          />
          <span className="text-xs text-gray-400 w-5">{unit}</span>
        </div>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full"
        style={{
          background: `linear-gradient(to right, ${ACCENT_COLORS[color]} ${pct}%, ${TRACK_COLORS[color]} 0%)`,
        }}
      />
    </div>
  );
}

export default function GoalForm({ onSubmit, onBack, initialGoals, initialRestrictions }) {
  const [calories, setCalories] = useState(initialGoals?.calories || 2000);
  const [protein, setProtein] = useState(initialGoals?.protein || 150);
  const [carbs, setCarbs] = useState(initialGoals?.carbs || 200);
  const [fat, setFat] = useState(initialGoals?.fat || 65);
  const [restrictions, setRestrictions] = useState(initialRestrictions || []);

  const macroCalories = protein * 4 + carbs * 4 + fat * 9;
  const calDiff = macroCalories - calories;
  const balanced = Math.abs(calDiff) < 150;

  const toggleRestriction = (id) =>
    setRestrictions((prev) => prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ goals: { calories, protein, carbs, fat }, restrictions });
  };

  const calPct = ((calories - 1200) / (4000 - 1200)) * 100;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Calories + Macros card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-xl font-bold text-gray-900">Nutrition Goals</h2>
          <span className="text-xs text-gray-400 font-medium">Daily targets</span>
        </div>
        <p className="text-sm text-gray-500 mb-6">
          Drag the sliders to match your daily goals — we'll build your meal plan around them.
        </p>

        {/* Calorie hero */}
        <div className="mb-6 p-4 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl border border-emerald-100">
          <div className="flex items-end justify-between mb-3">
            <div>
              <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wider mb-0.5">Daily Calories</p>
              <div className="text-4xl font-extrabold text-gray-900 leading-none">
                {calories.toLocaleString()}
                <span className="text-base font-medium text-gray-400 ml-1">kcal</span>
              </div>
            </div>
            <div className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
              balanced ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
            }`}>
              {balanced ? '✓ Balanced' : calDiff > 0 ? `+${calDiff} kcal` : `${Math.abs(calDiff)} kcal short`}
            </div>
          </div>
          <input
            type="range"
            min={1200}
            max={4000}
            step={50}
            value={calories}
            onChange={(e) => setCalories(Number(e.target.value))}
            className="w-full"
            style={{
              background: `linear-gradient(to right, #059669 ${calPct}%, #d1fae5 0%)`,
            }}
          />
        </div>

        {/* Protein / Carbs / Fat */}
        <div className="space-y-5">
          <MacroSlider label="Protein" value={protein} min={30} max={300} unit="g" color="blue" onChange={setProtein} />
          <MacroSlider label="Carbohydrates" value={carbs} min={50} max={500} unit="g" color="orange" onChange={setCarbs} />
          <MacroSlider label="Fat" value={fat} min={20} max={200} unit="g" color="purple" onChange={setFat} />
        </div>

        {/* Macro pill summary */}
        <div className="mt-5 grid grid-cols-3 gap-2 text-center">
          {[
            { label: 'Protein', val: protein, kcal: protein * 4, color: 'text-blue-600', bg: 'bg-blue-50' },
            { label: 'Carbs', val: carbs, kcal: carbs * 4, color: 'text-orange-600', bg: 'bg-orange-50' },
            { label: 'Fat', val: fat, kcal: fat * 9, color: 'text-purple-600', bg: 'bg-purple-50' },
          ].map(({ label, val, kcal, color, bg }) => (
            <div key={label} className={`${bg} rounded-xl p-2.5`}>
              <div className={`text-base font-bold ${color}`}>{val}g</div>
              <div className="text-xs text-gray-500 font-medium">{label}</div>
              <div className="text-[10px] text-gray-400">{kcal} kcal</div>
            </div>
          ))}
        </div>
      </div>

      {/* Dietary restrictions */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-base font-bold text-gray-900 mb-1">Dietary Restrictions</h3>
        <p className="text-sm text-gray-500 mb-4">Select all that apply — we'll filter accordingly.</p>
        <div className="flex flex-wrap gap-2">
          {RESTRICTIONS.map(({ id, label, icon }) => {
            const active = restrictions.includes(id);
            return (
              <button
                key={id}
                type="button"
                onClick={() => toggleRestriction(id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-full text-sm font-semibold border transition-all duration-200 ${
                  active
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm scale-105'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700'
                }`}
              >
                <span className="text-base leading-none">{icon}</span>
                {label}
              </button>
            );
          })}
        </div>
        {restrictions.length === 0 && (
          <p className="text-xs text-gray-400 mt-3">No restrictions selected — all menu items will be considered.</p>
        )}
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={onBack}
          className="px-5 py-3 border border-gray-200 text-gray-600 rounded-xl font-semibold hover:bg-gray-50 transition-all duration-200"
        >
          Back
        </button>
        <button
          type="submit"
          className="flex-1 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl font-bold hover:from-emerald-600 hover:to-emerald-700 transition-all duration-200 shadow-sm hover:shadow-md"
        >
          Choose Dining Hall →
        </button>
      </div>
    </form>
  );
}

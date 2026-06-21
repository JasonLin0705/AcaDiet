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

function MacroSlider({ label, value, min, max, step = 5, unit, color, onChange }) {
  return (
    <div>
      <div className="flex justify-between items-center mb-1.5">
        <label className="text-sm font-medium text-gray-700">{label}</label>
        <div className="flex items-center gap-1">
          <input
            type="number"
            value={value}
            min={min}
            max={max}
            onChange={(e) => onChange(Math.max(min, Math.min(max, Number(e.target.value))))}
            className="w-16 text-right text-sm font-semibold text-gray-900 border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <span className="text-sm text-gray-500 w-4">{unit}</span>
        </div>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className={`w-full h-2 rounded-full appearance-none cursor-pointer accent-${color}-500`}
        style={{ accentColor: { green: '#16a34a', blue: '#2563eb', orange: '#ea580c', purple: '#9333ea' }[color] }}
      />
      <div className="flex justify-between text-xs text-gray-400 mt-0.5">
        <span>{min}{unit}</span>
        <span>{max}{unit}</span>
      </div>
    </div>
  );
}

export default function GoalForm({ onSubmit, onBack }) {
  const [calories, setCalories] = useState(2000);
  const [protein, setProtein] = useState(150);
  const [carbs, setCarbs] = useState(200);
  const [fat, setFat] = useState(65);
  const [restrictions, setRestrictions] = useState([]);

  const macroCalories = protein * 4 + carbs * 4 + fat * 9;
  const calDiff = Math.abs(macroCalories - calories);
  const balanced = calDiff < 150;

  const toggleRestriction = (id) => {
    setRestrictions((prev) =>
      prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id]
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ goals: { calories, protein, carbs, fat }, restrictions });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-1">Set your nutrition goals</h2>
        <p className="text-gray-500 text-sm mb-6">
          We'll generate a meal plan that best matches these targets.
        </p>

        <div className="space-y-6">
          <MacroSlider
            label="Daily Calories"
            value={calories}
            min={1200}
            max={4000}
            step={50}
            unit="kcal"
            color="green"
            onChange={setCalories}
          />
          <div className="grid grid-cols-1 gap-5">
            <MacroSlider
              label="Protein"
              value={protein}
              min={30}
              max={300}
              unit="g"
              color="blue"
              onChange={setProtein}
            />
            <MacroSlider
              label="Carbohydrates"
              value={carbs}
              min={50}
              max={500}
              unit="g"
              color="orange"
              onChange={setCarbs}
            />
            <MacroSlider
              label="Fat"
              value={fat}
              min={20}
              max={200}
              unit="g"
              color="purple"
              onChange={setFat}
            />
          </div>
        </div>

        <div className={`mt-4 p-3 rounded-xl text-sm flex items-start gap-2 ${balanced ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'}`}>
          <span className="text-base">{balanced ? '✓' : '⚠'}</span>
          <span>
            Macro calories: <strong>{macroCalories} kcal</strong>
            {balanced
              ? ' — matches your calorie goal'
              : ` — ${calDiff > 0 ? '+' : ''}${macroCalories - calories} kcal vs goal. Adjust macros or calories.`}
          </span>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-1">Dietary restrictions</h3>
        <p className="text-sm text-gray-500 mb-4">Select all that apply — we'll filter menu items accordingly.</p>
        <div className="flex flex-wrap gap-2">
          {RESTRICTIONS.map(({ id, label, icon }) => {
            const active = restrictions.includes(id);
            return (
              <button
                key={id}
                type="button"
                onClick={() => toggleRestriction(id)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium border transition-all ${
                  active
                    ? 'bg-green-600 text-white border-green-600 shadow-sm'
                    : 'bg-white text-gray-700 border-gray-200 hover:border-green-300 hover:bg-green-50'
                }`}
              >
                <span>{icon}</span>
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
          className="px-5 py-3 border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
        >
          Back
        </button>
        <button
          type="submit"
          className="flex-1 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-colors shadow-sm"
        >
          Continue to Dining Hall
        </button>
      </div>
    </form>
  );
}

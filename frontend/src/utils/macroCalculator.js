// Macro goal calculator — turns body stats + activity + goal into daily targets.
// Mifflin–St Jeor BMR -> TDEE (activity) -> goal-adjusted calories -> macro split.
// All inputs metric. Pure, dependency-free, never returns NaN.

export const ACTIVITY_LEVELS = [
  { id: 'sedentary', label: 'Little/no exercise', multiplier: 1.2 },
  { id: 'light', label: '1–3 days/wk', multiplier: 1.375 },
  { id: 'moderate', label: '3–5 days/wk', multiplier: 1.55 },
  { id: 'active', label: '6–7 days/wk', multiplier: 1.725 },
  { id: 'athlete', label: 'Athlete / 2x day', multiplier: 1.9 },
];

export const GOALS = [
  { id: 'cut', label: 'Lose weight', factor: 0.8 },
  { id: 'maintain', label: 'Maintain', factor: 1.0 },
  { id: 'bulk', label: 'Gain muscle', factor: 1.1 },
];

const clamp = (n, lo, hi, fallback) => {
  const v = Number(n);
  if (!Number.isFinite(v)) return fallback;
  return Math.min(hi, Math.max(lo, v));
};

const roundTo = (n, step) => Math.round(n / step) * step;

export function calculateMacros({ sex, age, heightCm, weightKg, activity, goal } = {}) {
  const s = sex === 'female' ? 'female' : 'male';
  const a = clamp(age, 13, 100, 25);
  const h = clamp(heightCm, 120, 250, 170);
  const w = clamp(weightKg, 30, 250, 70);

  const level = ACTIVITY_LEVELS.find(l => l.id === activity)
    || ACTIVITY_LEVELS.find(l => l.id === 'moderate');
  const goalDef = GOALS.find(g => g.id === goal)
    || GOALS.find(g => g.id === 'maintain');

  const bmr = w * 10 + h * 6.25 - a * 5 + (s === 'male' ? 5 : -161);
  const tdee = bmr * level.multiplier;
  const calories = roundTo(tdee * goalDef.factor, 10);

  const protein = Math.round(1.8 * w);
  const fat = Math.round((calories * 0.25) / 9);
  const carbs = Math.max(0, Math.round((calories - protein * 4 - fat * 9) / 4));

  return {
    calories,
    protein,
    carbs,
    fat,
    bmr: Math.round(bmr),
    tdee: Math.round(tdee),
  };
}

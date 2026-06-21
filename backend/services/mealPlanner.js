const MEAL_RATIOS = { breakfast: 0.25, lunch: 0.35, dinner: 0.35 };

function filterByRestrictions(items, restrictions) {
  return items.filter(item => {
    if (restrictions.includes('vegetarian') && !item.isVegetarian) return false;
    if (restrictions.includes('vegan') && !item.isVegan) return false;
    if (restrictions.includes('gluten-free') && !item.isGlutenFree) return false;
    if (restrictions.includes('halal') && !item.isHalal) return false;
    if (restrictions.includes('kosher') && !item.isKosher) return false;
    if (restrictions.includes('nut-free') && item.containsNuts) return false;
    if (restrictions.includes('dairy-free') && item.containsDairy) return false;
    return true;
  });
}

function scoreItem(item, remaining) {
  const { calories: calBudget, protein, carbs, fat } = remaining;
  if (item.calories > calBudget * 1.15) return -1;

  // How well does this item fill the remaining macro gaps (normalized 0-1 per macro)
  const proteinFit = protein > 0 ? Math.min(item.protein / protein, 1) : 0;
  const carbsFit = carbs > 0 ? Math.min(item.carbs / carbs, 1) : 0;
  const fatFit = fat > 0 ? Math.min(item.fat / fat, 1) : 0;
  const calFit = calBudget > 0 ? Math.min(item.calories / calBudget, 1) : 0;

  // Weight macros equally; penalize items that are too calorie-dense for remaining budget
  return (proteinFit + carbsFit + fatFit + calFit) / 4;
}

function selectBestItems(items, mealType, goals) {
  if (!items.length) return [];

  const ratio = MEAL_RATIOS[mealType] || 0.33;
  const calTarget = goals.calories * ratio;

  const remaining = {
    calories: calTarget,
    protein: goals.protein * ratio,
    carbs: goals.carbs * ratio,
    fat: goals.fat * ratio,
  };

  const pool = [...items];
  const selected = [];

  for (let i = 0; i < 4 && pool.length > 0; i++) {
    const scored = pool
      .map((item, idx) => ({ item, idx, score: scoreItem(item, remaining) }))
      .filter(s => s.score >= 0)
      .sort((a, b) => b.score - a.score);

    if (!scored.length) break;

    const { item, idx } = scored[0];
    selected.push(item);
    remaining.calories -= item.calories;
    remaining.protein -= item.protein;
    remaining.carbs -= item.carbs;
    remaining.fat -= item.fat;
    pool.splice(idx, 1);

    if (remaining.calories <= calTarget * 0.10) break;
  }

  return selected;
}

function sumNutrition(items) {
  return items.reduce(
    (acc, item) => ({
      calories: acc.calories + item.calories,
      protein: acc.protein + item.protein,
      carbs: acc.carbs + item.carbs,
      fat: acc.fat + item.fat,
      fiber: acc.fiber + item.fiber,
      sodium: acc.sodium + item.sodium,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, sodium: 0 }
  );
}

function generate(menu, goals, restrictions) {
  const { breakfast = [], lunch = [], dinner = [] } = menu;

  const filteredBreakfast = filterByRestrictions(breakfast, restrictions);
  const filteredLunch = filterByRestrictions(lunch, restrictions);
  const filteredDinner = filterByRestrictions(dinner, restrictions);

  const selectedBreakfast = selectBestItems(filteredBreakfast, 'breakfast', goals);
  const selectedLunch = selectBestItems(filteredLunch, 'lunch', goals);
  const selectedDinner = selectBestItems(filteredDinner, 'dinner', goals);

  const totals = sumNutrition([...selectedBreakfast, ...selectedLunch, ...selectedDinner]);

  return {
    breakfast: selectedBreakfast,
    lunch: selectedLunch,
    dinner: selectedDinner,
    totals,
    goals,
    availableCounts: {
      breakfast: breakfast.length,
      lunch: lunch.length,
      dinner: dinner.length,
      breakfastFiltered: filteredBreakfast.length,
      lunchFiltered: filteredLunch.length,
      dinnerFiltered: filteredDinner.length,
    },
  };
}

module.exports = { generate };

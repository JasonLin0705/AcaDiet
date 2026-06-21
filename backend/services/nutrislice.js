const axios = require('axios');

const KNOWN_SCHOOLS = [
  { name: 'UCLA', subdomain: 'ucla', fullName: 'University of California, Los Angeles' },
  { name: 'UC Berkeley', subdomain: 'ucberkeley', fullName: 'University of California, Berkeley' },
  { name: 'Stanford University', subdomain: 'stanford', fullName: 'Stanford University' },
  { name: 'MIT', subdomain: 'mit', fullName: 'Massachusetts Institute of Technology' },
  { name: 'Harvard University', subdomain: 'harvard', fullName: 'Harvard University' },
  { name: 'Yale University', subdomain: 'yale', fullName: 'Yale University' },
  { name: 'Cornell University', subdomain: 'cornell', fullName: 'Cornell University' },
  { name: 'NYU', subdomain: 'nyu', fullName: 'New York University' },
  { name: 'University of Michigan', subdomain: 'umich', fullName: 'University of Michigan' },
  { name: 'UT Austin', subdomain: 'utexas', fullName: 'University of Texas at Austin' },
  { name: 'Purdue University', subdomain: 'purdue', fullName: 'Purdue University' },
  { name: 'Michigan State', subdomain: 'msu', fullName: 'Michigan State University' },
  { name: 'UNC Chapel Hill', subdomain: 'unc', fullName: 'University of North Carolina at Chapel Hill' },
  { name: 'Virginia Tech', subdomain: 'vt', fullName: 'Virginia Polytechnic Institute and State University' },
  { name: 'Georgia Tech', subdomain: 'gatech', fullName: 'Georgia Institute of Technology' },
  { name: 'University of Florida', subdomain: 'uf', fullName: 'University of Florida' },
  { name: 'Ohio State University', subdomain: 'osu', fullName: 'Ohio State University' },
  { name: 'Penn State', subdomain: 'pennstate', fullName: 'Pennsylvania State University' },
  { name: 'University of Colorado', subdomain: 'colorado', fullName: 'University of Colorado Boulder' },
  { name: 'Arizona State University', subdomain: 'asu', fullName: 'Arizona State University' },
  { name: 'UC San Diego', subdomain: 'ucsd', fullName: 'University of California, San Diego' },
  { name: 'UC Davis', subdomain: 'ucdavis', fullName: 'University of California, Davis' },
  { name: 'UC Santa Barbara', subdomain: 'ucsb', fullName: 'University of California, Santa Barbara' },
  { name: 'UC Irvine', subdomain: 'uci', fullName: 'University of California, Irvine' },
  { name: 'Northeastern University', subdomain: 'northeastern', fullName: 'Northeastern University' },
  { name: 'Boston University', subdomain: 'bu', fullName: 'Boston University' },
  { name: 'Rutgers University', subdomain: 'rutgers', fullName: 'Rutgers University' },
  { name: 'Indiana University', subdomain: 'indiana', fullName: 'Indiana University Bloomington' },
  { name: 'UW Madison', subdomain: 'wisc', fullName: 'University of Wisconsin-Madison' },
  { name: 'University of Oregon', subdomain: 'uoregon', fullName: 'University of Oregon' },
  { name: 'University of Washington', subdomain: 'uw', fullName: 'University of Washington' },
  { name: 'University of Arizona', subdomain: 'arizona', fullName: 'University of Arizona' },
  { name: 'USC', subdomain: 'usc', fullName: 'University of Southern California' },
  { name: 'Duke University', subdomain: 'duke', fullName: 'Duke University' },
  { name: 'Vanderbilt University', subdomain: 'vanderbilt', fullName: 'Vanderbilt University' },
  { name: 'University of Maryland', subdomain: 'umd', fullName: 'University of Maryland' },
  { name: 'University of Virginia', subdomain: 'virginia', fullName: 'University of Virginia' },
  { name: 'Georgetown University', subdomain: 'georgetown', fullName: 'Georgetown University' },
  { name: 'Carnegie Mellon', subdomain: 'cmu', fullName: 'Carnegie Mellon University' },
  { name: 'Rice University', subdomain: 'rice', fullName: 'Rice University' },
  { name: 'University of Illinois', subdomain: 'illinoisstate', fullName: 'University of Illinois Urbana-Champaign' },
  { name: 'University of Minnesota', subdomain: 'umn', fullName: 'University of Minnesota' },
  { name: 'Iowa State University', subdomain: 'iastate', fullName: 'Iowa State University' },
  { name: 'Colorado State University', subdomain: 'coloradostate', fullName: 'Colorado State University' },
  { name: 'University of Tennessee', subdomain: 'utk', fullName: 'University of Tennessee Knoxville' },
];

function searchUniversities(query) {
  const q = query.toLowerCase();
  return KNOWN_SCHOOLS
    .filter(s =>
      s.name.toLowerCase().includes(q) ||
      s.fullName.toLowerCase().includes(q) ||
      s.subdomain.toLowerCase().includes(q)
    )
    .slice(0, 8);
}

function apiHeaders(school) {
  return {
    'Accept': 'application/json',
    'User-Agent': 'AcaDiet/1.0',
    'x-nutrislice-origin': `${school}.nutrislice.com`,
  };
}

async function getDiningHalls(school) {
  const url = `https://${school}.api.nutrislice.com/menu/api/schools/`;
  const response = await axios.get(url, {
    timeout: 10000,
    headers: apiHeaders(school),
  });
  const data = response.data;
  const list = Array.isArray(data) ? data : (data.schools || []);
  return list.map(s => ({
    id: s.id,
    name: s.name,
    slug: s.slug,
    menuTypes: extractMenuTypes(s.menu_types || []),
  })).filter(s => s.name && s.slug);
}

function extractMenuTypes(rawTypes) {
  if (!Array.isArray(rawTypes)) return [];
  return rawTypes.map(mt => {
    if (typeof mt === 'string') return mt;
    return mt.name || mt.slug || String(mt.id || '');
  }).filter(Boolean);
}

async function getMenuTypes(school, hallSlug) {
  try {
    const url = `https://${school}.api.nutrislice.com/menu/api/schools/${hallSlug}/menu-types/`;
    const response = await axios.get(url, { timeout: 10000, headers: apiHeaders(school) });
    const data = response.data;
    const types = Array.isArray(data) ? data : (data.menu_types || data.results || []);
    return types.map(mt => ({
      label: (mt.name || mt.slug || '').toLowerCase(),
      slug: mt.slug || String(mt.id || ''),
      id: mt.id,
    })).filter(mt => mt.slug);
  } catch {
    return [];
  }
}

function categorizeMealTypes(menuTypes) {
  const categories = { breakfast: [], lunch: [], dinner: [] };
  const uncategorized = [];

  for (const mt of menuTypes) {
    const l = mt.label;
    if (l.includes('breakfast') || l.includes('brunch')) {
      categories.breakfast.push(mt);
    } else if (l.includes('lunch')) {
      categories.lunch.push(mt);
    } else if (l.includes('dinner') || l.includes('supper')) {
      categories.dinner.push(mt);
    } else {
      uncategorized.push(mt);
    }
  }

  // If nothing categorized, distribute uncategorized evenly
  if (uncategorized.length > 0 && Object.values(categories).every(a => a.length === 0)) {
    const slots = ['breakfast', 'lunch', 'dinner'];
    uncategorized.forEach((mt, i) => categories[slots[i % 3]].push(mt));
  }

  return categories;
}

async function getMenu(school, hallSlug, date) {
  const [year, month, day] = date.split('-');
  const results = { breakfast: [], lunch: [], dinner: [] };

  // Fetch the school's actual menu types first
  const menuTypes = await getMenuTypes(school, hallSlug);
  const categories = menuTypes.length > 0
    ? categorizeMealTypes(menuTypes)
    : { breakfast: [{ slug: 'breakfast' }], lunch: [{ slug: 'lunch' }], dinner: [{ slug: 'dinner' }] };

  await Promise.all(Object.entries(categories).map(async ([mealPeriod, types]) => {
    const items = [];
    for (const mt of types) {
      try {
        const url = `https://${school}.api.nutrislice.com/menu/api/weeks/school/${hallSlug}/menu-type/${mt.slug}/${year}/${month}/${day}/`;
        const response = await axios.get(url, {
          timeout: 12000,
          headers: apiHeaders(school),
        });
        const days = response.data?.days || [];
        const todayData = days.find(d => d.date === date) || days[Math.floor(days.length / 2)] || days[0];
        if (todayData) {
          items.push(...parseMenuItems(todayData.menu_items || [], mealPeriod));
        }
      } catch {
        // skip this type
      }
    }
    results[mealPeriod] = items;
  }));

  return results;
}

function getTagLabel(t) {
  if (typeof t === 'string') return t.toLowerCase();
  return (t.label || t.name || t.slug || '').toLowerCase();
}

function parseMenuItems(rawItems, mealType) {
  const seen = new Set();
  return rawItems
    .filter(item => item.food && item.food.name)
    .map(item => {
      const food = item.food;
      const nutrition = food.rounded_nutrition_info || food.nutrition_info || {};
      const tags = (food.food_tags || []).map(getTagLabel);

      return {
        id: String(food.id || item.id || Math.random()),
        name: food.name,
        description: food.ingredients || '',
        mealType,
        calories: Number(nutrition.calories) || 0,
        protein: Number(nutrition.protein) || 0,
        carbs: Number(nutrition.total_carb) || 0,
        fat: Number(nutrition.total_fat) || 0,
        fiber: Number(nutrition.dietary_fiber) || 0,
        sugar: Number(nutrition.sugar) || 0,
        sodium: Number(nutrition.sodium) || 0,
        servingSize: food.serving_size_info?.serving_size_description || food.serving_size || '',
        isVegan: food.is_vegan || tags.some(t => t.includes('vegan')) || false,
        isVegetarian: food.is_vegetarian || tags.some(t => t.includes('vegetarian') || t === 'veg') || false,
        isGlutenFree: tags.some(t => t.includes('gluten')) || false,
        isHalal: tags.some(t => t.includes('halal')) || false,
        isKosher: tags.some(t => t.includes('kosher')) || false,
        containsNuts: food.contains_tree_nuts || food.contains_peanuts || false,
        containsDairy: food.contains_milk || false,
      };
    })
    .filter(item => {
      if (item.calories === 0) return false;
      if (seen.has(item.name)) return false;
      seen.add(item.name);
      return true;
    });
}

module.exports = { searchUniversities, getDiningHalls, getMenu };

const BASE = '/api';

async function request(url, options = {}) {
  const token = localStorage.getItem('acadiet_token');
  const res = await fetch(BASE + url, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...options,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw Object.assign(new Error(data.error || 'Request failed'), data);
  return data;
}

export const searchUniversities = (q) =>
  request(`/universities/search?q=${encodeURIComponent(q)}`);

export const getDiningHalls = (school) =>
  request(`/dining-halls?school=${encodeURIComponent(school)}`);

export const generateMealPlan = ({ school, date, goals, restrictions, breakfastHall, lunchHall, dinnerHall }) =>
  request('/meal-plan/generate', {
    method: 'POST',
    body: JSON.stringify({ school, date, goals, restrictions, breakfastHall, lunchHall, dinnerHall }),
  });

const BASE = '/api';

async function request(url, options = {}) {
  const res = await fetch(BASE + url, {
    headers: { 'Content-Type': 'application/json' },
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

export const generateMealPlan = ({ school, hall, date, goals, restrictions, menuTypes }) =>
  request('/meal-plan/generate', {
    method: 'POST',
    body: JSON.stringify({ school, hall, date, goals, restrictions, menuTypes }),
  });

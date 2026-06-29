const BASE = '/api/auth';

async function req(url, options = {}) {
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

export const authService = {
  register: (data) => req('/register', { method: 'POST', body: JSON.stringify(data) }),
  login: (data) => req('/login', { method: 'POST', body: JSON.stringify(data) }),
  getMe: () => req('/me'),
  saveGoals: (goals) => req('/goals', { method: 'PUT', body: JSON.stringify(goals) }),
  saveHistory: (entry) => req('/history', { method: 'POST', body: JSON.stringify(entry) }),
  getHistory: () => req('/history'),
  getHistoryStats: () => req('/history/stats'),
  getFavorites: () => req('/favorites'),
  addFavorite: (item) => req('/favorites', { method: 'POST', body: JSON.stringify(item) }),
  removeFavorite: (foodId) => req(`/favorites/${encodeURIComponent(foodId)}`, { method: 'DELETE' }),
  shareHistory: (id) => req(`/history/${id}/share`, { method: 'POST' }),
  addLog: (entry) => req('/log', { method: 'POST', body: JSON.stringify(entry) }),
  getLog: (date) => req(`/log${date ? `?date=${encodeURIComponent(date)}` : ''}`),
  getMonthlyLog: (month) => req('/log/monthly' + (month ? '?month=' + encodeURIComponent(month) : '')),
  removeLog: (id) => req(`/log/${encodeURIComponent(id)}`, { method: 'DELETE' }),
  eatNow: (payload) => req('/eat-now', { method: 'POST', body: JSON.stringify(payload) }),
  favoritesToday: (payload) => req('/favorites-today', { method: 'POST', body: JSON.stringify(payload) }),
};

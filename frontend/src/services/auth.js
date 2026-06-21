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
};

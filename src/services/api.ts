const isLocalhost = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
const API_URL = isLocalhost ? 'http://localhost:3000/api' : '/api';

export const api = {
  // CHAMPIONSHIPS
  getChampionships: async () => {
    const res = await fetch(`${API_URL}/championships`);
    return res.json();
  },
  createChampionship: async (data: any) => {
    const res = await fetch(`${API_URL}/championships`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  // BARBERS
  getBarberLocations: async () => {
    const res = await fetch(`${API_URL}/barbers/locations`);
    return res.json();
  },
  getBarber: async (id: string) => {
    const res = await fetch(`${API_URL}/barbers/${id}`);
    if (!res.ok) return null;
    return res.json();
  },

  // FEED
  getPosts: async () => {
    const res = await fetch(`${API_URL}/posts`);
    return res.json();
  },
  // AUTH
  register: async (data: any) => {
    const res = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },
  login: async (email: string, password?: string) => {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    return res.json();
  },
  createPost: async (data: any) => {
    const res = await fetch(`${API_URL}/posts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },
};

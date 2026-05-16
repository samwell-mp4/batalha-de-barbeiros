const API_URL = import.meta.env.VITE_API_URL || '/api';

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

  // MAP
  getBarberLocations: async () => {
    const res = await fetch(`${API_URL}/barbers/locations`);
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
  login: async (email: string) => {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
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

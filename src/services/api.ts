const isLocalhost = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
const API_URL = isLocalhost ? 'http://localhost:3000/api' : '/api';

function getAuthHeaders(headers?: Record<string, string>) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const h: Record<string, string> = { 'Content-Type': 'application/json', ...(headers || {}) };
  if (token) {
    h['Authorization'] = `Bearer ${token}`;
  }
  return h;
}

export const api = {
  // CHAMPIONSHIPS
  getChampionships: async () => {
    const res = await fetch(`${API_URL}/championships`);
    return res.json();
  },
  createChampionship: async (data: any) => {
    const res = await fetch(`${API_URL}/championships`, {
      method: 'POST',
      headers: getAuthHeaders(),
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
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return res.json();
  },
  login: async (email: string, password?: string) => {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ email, password }),
    });
    return res.json();
  },
  updateProfile: async (id: string, data: any) => {
    const res = await fetch(`${API_URL}/auth/profile/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return res.json();
  },
  changePassword: async (id: string, data: any) => {
    const res = await fetch(`${API_URL}/auth/password/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return res.json();
  },
  createPost: async (data: any) => {
    const res = await fetch(`${API_URL}/posts`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return res.json();
  },
  deletePost: async (id: string) => {
    const res = await fetch(`${API_URL}/posts/${id}`, {
      method: 'DELETE',
    });
    return res.json();
  },
  updatePost: async (id: string, data: any) => {
    const res = await fetch(`${API_URL}/posts/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return res.json();
  },
  deleteComment: async (postId: string, commentId: string) => {
    const res = await fetch(`${API_URL}/posts/${postId}/comment/${commentId}`, {
      method: 'DELETE',
    });
    return res.json();
  },

  // APPOINTMENTS & MATCHMAKING
  createAppointment: async (data: any) => {
    const res = await fetch(`${API_URL}/appointments`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return res.json();
  },
  getClientAppointments: async (clientId: string) => {
    const res = await fetch(`${API_URL}/appointments/client/${clientId}`);
    if (!res.ok) return [];
    return res.json();
  },
  getBarberAppointments: async (barberId: string) => {
    const res = await fetch(`${API_URL}/appointments/barber/${barberId}`);
    if (!res.ok) return [];
    return res.json();
  },
  updateAppointmentStatus: async (id: string, status: string, barberId?: string, price?: number, date?: string, time?: string) => {
    const res = await fetch(`${API_URL}/appointments/${id}/status`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status, barberId, price, date, time }),
    });
    return res.json();
  },
  getAppointmentDetails: async (id: string) => {
    const res = await fetch(`${API_URL}/appointments/${id}`);
    if (!res.ok) return null;
    return res.json();
  },
  getActiveAppointment: async (userId: string) => {
    const res = await fetch(`${API_URL}/appointments/user-active/${userId}`);
    if (!res.ok) return null;
    return res.json();
  },
  getActiveRequests: async (latitude?: number, longitude?: number) => {
    let url = `${API_URL}/appointments/active-requests`;
    if (latitude && longitude) {
      url += `?latitude=${latitude}&longitude=${longitude}`;
    }
    const res = await fetch(url);
    if (!res.ok) return [];
    return res.json();
  },
  updateBarberProfile: async (id: string, data: any) => {
    const res = await fetch(`${API_URL}/barbers/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return res.json();
  },
  deleteAppointment: async (id: string) => {
    const res = await fetch(`${API_URL}/appointments/${id}`, {
      method: 'DELETE',
    });
    return res.json();
  },
  clearHistory: async (userId: string) => {
    const res = await fetch(`${API_URL}/appointments/clear-history/${userId}`, {
      method: 'DELETE',
    });
    return res.json();
  },
  getBarbers: async () => {
    const res = await fetch(`${API_URL}/barbers`);
    return res.json();
  },
  getChampionshipDetails: async (id: string) => {
    const res = await fetch(`${API_URL}/championships/${id}`);
    return res.json();
  },
  voteMatch: async (championshipId: string, data: any) => {
    const res = await fetch(`${API_URL}/championships/${championshipId}/vote`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return res.json();
  },

  acceptChallenge: async (id: string, photo2: string) => {
    const res = await fetch(`${API_URL}/championships/${id}/accept`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ photo2 }),
    });
    return res.json();
  },
  startBattleNow: async (id: string) => {
    const res = await fetch(`${API_URL}/championships/${id}/start-now`, {
      method: 'POST',
    });
    return res.json();
  },
  startBattleScheduled: async (id: string) => {
    const res = await fetch(`${API_URL}/championships/${id}/start-scheduled`, {
      method: 'POST',
    });
    return res.json();
  },
  toggleLike: async (id: string, userId: string) => {
    const res = await fetch(`${API_URL}/championships/${id}/like`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ userId })
    });
    return res.json();
  },
  addComment: async (id: string, userId: string, content: string) => {
    const res = await fetch(`${API_URL}/championships/${id}/comment`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ userId, content })
    });
    return res.json();
  },

  // POST SOCIAL INTERACTIONS
  likePost: async (postId: string, userId: string) => {
    const res = await fetch(`${API_URL}/posts/${postId}/like`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ userId })
    });
    return res.json();
  },
  commentPost: async (postId: string, userId: string, content: string) => {
    const res = await fetch(`${API_URL}/posts/${postId}/comment`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ userId, content })
    });
    return res.json();
  },

  rateBarber: async (barberId: string, rating: number) => {
    const res = await fetch(`${API_URL}/barbers/${barberId}/rate`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ rating })
    });
    return res.json();
  },

  // MESSAGES / CHAT
  getMessages: async (userId1: string, userId2: string) => {
    const res = await fetch(`${API_URL}/messages/${userId1}/${userId2}`);
    if (!res.ok) return [];
    return res.json();
  },
  sendMessage: async (senderId: string, receiverId: string, content: string) => {
    const res = await fetch(`${API_URL}/messages`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ senderId, receiverId, content })
    });
    return res.json();
  },
  getConversations: async (userId: string) => {
    const res = await fetch(`${API_URL}/messages/conversations/${userId}`);
    if (!res.ok) return [];
    return res.json();
  },

  // PAYMENTS — Mercado Pago PIX
  createPixPayment: async (appointmentId: string) => {
    const res = await fetch(`${API_URL}/payments/create-pix`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ appointmentId }),
    });
    return res.json();
  },
  getPayment: async (appointmentId: string) => {
    const res = await fetch(`${API_URL}/payments/${appointmentId}`);
    if (!res.ok) return null;
    return res.json();
  },
  updatePixKey: async (barberId: string, pixKey: string) => {
    const res = await fetch(`${API_URL}/payments/barber-pix-key`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ barberId, pixKey }),
    });
    return res.json();
  },
  getFinanceiro: async (barberId: string) => {
    const res = await fetch(`${API_URL}/payments/financeiro/${barberId}`);
    if (!res.ok) return null;
    return res.json();
  },
  getNotifications: async (userId: string) => {
    const res = await fetch(`${API_URL}/payments/notifications/${userId}`);
    if (!res.ok) return [];
    return res.json();
  },
  // CITIES
  searchCities: async (q: string) => {
    if (!q || q.length < 2) return [];
    const res = await fetch(`${API_URL}/cities/search?q=${encodeURIComponent(q)}`);
    if (!res.ok) return [];
    return res.json();
  },
  getTopCities: async () => {
    const res = await fetch(`${API_URL}/cities/top`);
    if (!res.ok) return [];
    return res.json();
  },
};

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export const fetchAPI = async (endpoint, options = {}) => {
  const token = localStorage.getItem('eventlay_token');

  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(data.message || `Request failed with status ${response.status}`);
    error.status = response.status;
    throw error;
  }

  return data;
};

export const api = {
  // Auth
  register: (userData) => fetchAPI('/auth/register', { method: 'POST', body: JSON.stringify(userData) }),
  login: (credentials) => fetchAPI('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),

  // Events
  getPublishedEvents: (search = '') => fetchAPI(`/events${search ? `?search=${encodeURIComponent(search)}` : ''}`),
  getEventById: (id) => fetchAPI(`/events/${id}`),
  getMyEvents: () => fetchAPI('/events/organizer/mine'),
  createEvent: (eventData) => fetchAPI('/events', { method: 'POST', body: JSON.stringify(eventData) }),
  updateEvent: (id, eventData) => fetchAPI(`/events/${id}`, { method: 'PUT', body: JSON.stringify(eventData) }),
  deleteEvent: (id) => fetchAPI(`/events/${id}`, { method: 'DELETE' }),

  // Registrations
  registerForEvent: (eventId) => fetchAPI('/registrations', { method: 'POST', body: JSON.stringify({ eventId }) }),
  getMyRegistrations: () => fetchAPI('/registrations/mine'),
  getEventRegistrations: (eventId) => fetchAPI(`/events/${eventId}/registrations`),
};

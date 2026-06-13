import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
});

// Auto-attach token
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('roamly_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auto-logout on 401
API.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('roamly_token');
      localStorage.removeItem('roamly_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// Auth
export const signup = (data) => API.post('/api/auth/signup', data);
export const login = (data) => API.post('/api/auth/login', data);
export const getMe = () => API.get('/api/auth/me');
export const logout = () => API.post('/api/auth/logout');

// AI Features
export const chat = (data) => API.post('/api/ai/chat', data);
export const vibeSearch = (vibe) => API.post('/api/ai/vibe-search', { vibe });
export const tripRoast = (itinerary) => API.post('/api/ai/trip-roast', { itinerary });
export const destinationBattle = (data) => API.post('/api/ai/battle', data);
export const whatIfSimulator = (scenario) => API.post('/api/ai/what-if', { scenario });
export const buildItinerary = (data) => API.post('/api/ai/itinerary', data);
export const budgetTruth = (data) => API.post('/api/ai/budget-truth', data);
export const analyzeDNA = (answers) => API.post('/api/ai/analyze-dna', { answers });
export const packingList = (data) => API.post('/api/ai/packing-list', data);
export const cultureCoach = (destination) => API.post('/api/ai/culture-coach', { destination });
//Agent 

export const runAgent = (data) => API.post('/api/ai/agent/run-sync', data);
// Destinations
export const exploreDestination = (data) => API.post('/api/destinations/explore', data);export const getPlacesNearby = (params) => API.get('/api/destinations/places-nearby', { params });
export const geocode = (destination) => API.get('/api/destinations/geocode', { params: { destination } });
export const getCountryInfo = (country) => API.get('/api/destinations/country-info', { params: { country } });

// Weather
export const getWeather = (params) => API.get('/api/weather', { params });

// User
export const getProfile = () => API.get('/api/user/profile');
export const updateProfile = (data) => API.patch('/api/user/profile', data);
export const getSavedTrips = () => API.get('/api/user/trips');
export const deleteTrip = (id) => API.delete(`/api/user/trips/${id}`);
export const addToWishlist = (destination) => API.post('/api/user/wishlist', { destination });
export const updateDNA = (data) => API.patch('/api/user/dna', data);
export const addTripAutopsy = (data) => API.post('/api/user/autopsy', data);
export const getChatHistory = () => API.get('/api/user/history');

export default API;

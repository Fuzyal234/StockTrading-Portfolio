import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true
  withCredentials: true
});

// Request interceptor for adding auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    if (!config.headers) {
      config.headers = new axios.AxiosHeaders();
    }
    if (!config.headers) {
      config.headers = new axios.AxiosHeaders();
    }
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
}, (error) => {
  return Promise.reject(error);
});

// Response interceptor for handling errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
  async (error) => {
    if (error.response?.status === 401) {
<<<<<<< Updated upstream
      // Handle unauthorized access
      localStorage.removeItem('token');
      window.location.href = '/login';
=======
      Cookies.remove('token');
      if (typeof window !== 'undefined' && 
          !window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
>>>>>>> Stashed changes
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: async (data: { email: string; password: string }) => {
    const response = await api.post('/api/users/login', data);
    if (response.data.token) {
<<<<<<< Updated upstream
      localStorage.setItem('token', response.data.token);
=======
      Cookies.set('token', response.data.token, {
        expires: 7,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
      });
>>>>>>> Stashed changes
    }
    return response.data;
  },
  register: async (data: { name: string; email: string; password: string }) => {
    const response = await api.post('/api/users/register', data);
    return response.data;
  }
};

export default api; 
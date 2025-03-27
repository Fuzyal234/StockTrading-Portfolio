import api from './api';
import Cookies from 'js-cookie';

export interface User {
  id: number;
  email: string;
  name: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  name: string;
  email: string;
  password: string;
}

export const userService = {
  // Login user
  login: async (credentials: LoginCredentials): Promise<{ token: string; user: User }> => {
    try {
      const response = await api.post('/api/users/login', credentials);
      const { token, user } = response.data;
      
      if (!token) {
        throw new Error('No token received from server');
      }

      // Store token in cookies with proper settings
      Cookies.set('token', token, {
        expires: 7, // 7 days
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax'
      });

      return { token, user };
    } catch (error: any) {
      console.error('Login error:', error);
      if (error.response?.status === 401) {
        throw new Error('Invalid email or password');
      }
      throw new Error(error.response?.data?.error || 'Login failed');
    }
  login: async (credentials: LoginCredentials): Promise<{ token: string; user: User }> => {
    try {
      const response = await api.post('/api/users/login', credentials);
      const { token, user } = response.data;
      
      if (!token) {
        throw new Error('No token received from server');
      }

      // Store token in cookies with proper settings
      Cookies.set('token', token, {
        expires: 7, // 7 days
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax'
      });

      return { token, user };
    } catch (error: any) {
      console.error('Login error:', error);
      if (error.response?.status === 401) {
        throw new Error('Invalid email or password');
      }
      throw new Error(error.response?.data?.error || 'Login failed');
    }
  },

  // Get current user
  getCurrentUser: async (): Promise<User> => {
    try {
      const response = await api.get('/api/users/me');
      return response.data;
    } catch (error: any) {
      console.error('Get current user error:', error);
      if (error.response?.status === 401) {
        // Clear invalid token
        Cookies.remove('token');
        throw new Error('Session expired. Please login again.');
      }
      throw error;
    }
  getCurrentUser: async (): Promise<User> => {
    try {
      const response = await api.get('/api/users/me');
      return response.data;
    } catch (error: any) {
      console.error('Get current user error:', error);
      if (error.response?.status === 401) {
        // Clear invalid token
        Cookies.remove('token');
        throw new Error('Session expired. Please login again.');
      }
      throw error;
    }
  },

  // Update user profile
  updateProfile: async (userData: Partial<User>) => {
    const response = await api.put('/api/users/me', userData);
    const response = await api.put('/api/users/me', userData);
    return response.data;
  },

<<<<<<< Updated upstream
=======
  // Logout user
  logout: () => {
    Cookies.remove('token');
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  },

  // Check if user is authenticated
  isAuthenticated: (): boolean => {
    const token = Cookies.get('token');
    return !!token;
  isAuthenticated: (): boolean => {
    const token = Cookies.get('token');
    return !!token;
  },

  // Get token
  getToken: (): string | undefined => {
    return Cookies.get('token');
  },

>>>>>>> Stashed changes
  // Register new user
  register: async (userData: RegisterData) => {
    const response = await api.post('/api/users/register', userData);
    return response.data;
  }
}; 
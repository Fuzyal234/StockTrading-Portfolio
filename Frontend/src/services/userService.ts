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
  email: string;
  password: string;
  name: string;
}

export interface Trade {
  id: string;
  symbol: string;
  quantity: number;
  price: number;
  type: 'BUY' | 'SELL';
  timestamp: string;
}

export interface Portfolio {
  id: string;
  userId: string;
  totalValue: number;
  cashBalance: number;
  positions: Position[];
}

export interface Position {
  symbol: string;
  quantity: number;
  averagePrice: number;
  currentPrice: number;
  totalValue: number;
  profitLoss: number;
}

export const userService = {
  // Login user
  login: async (credentials: LoginCredentials) => {
    const response = await api.post('/api/users/login', credentials);
    if (response.data.token) {
      // Store token in cookie with 7 days expiry
      Cookies.set('token', response.data.token, { expires: 7 });
    }
    return response.data;
  },

  // Register new user
  register: async (userData: RegisterData) => {
    const response = await api.post('/api/users/register', userData);
    return response.data;
  },

  // Get current user
  getCurrentUser: async () => {
    const response = await api.get('/api/users/me');
    return response.data;
  },

  // Update user profile
  updateProfile: async (userData: Partial<User>) => {
    const response = await api.put('/api/users/profile', userData);
    return response.data;
  },

  // Logout user
  logout: () => {
    Cookies.remove('token');
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    return !!Cookies.get('token');
  },
};

export const tradeService = {
  getAllTrades: async () => {
    const response = await api.get('/api/trades');
    return response.data;
  },
  getTradeById: async (id: string) => {
    const response = await api.get(`/api/trades/${id}`);
    return response.data;
  },
  createTrade: async (tradeData: Omit<Trade, 'id' | 'timestamp'>) => {
    const response = await api.post('/api/trades', tradeData);
    return response.data;
  },
  updateTrade: async (id: string, tradeData: Partial<Trade>) => {
    const response = await api.put(`/api/trades/${id}`, tradeData);
    return response.data;
  },
  deleteTrade: async (id: string) => {
    const response = await api.delete(`/api/trades/${id}`);
    return response.data;
  }
};

export const portfolioService = {
  getPortfolio: async () => {
    const response = await api.get('/api/portfolio');
    return response.data;
  },
  getPositions: async () => {
    const response = await api.get('/api/portfolio/positions');
    return response.data;
  },
  getPerformance: async () => {
    const response = await api.get('/api/portfolio/performance');
    return response.data;
  },
  updateSettings: async (settings: any) => {
    const response = await api.put('/api/portfolio/settings', settings);
    return response.data;
  }
}; 
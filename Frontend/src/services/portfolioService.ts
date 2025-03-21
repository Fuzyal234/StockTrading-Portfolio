import api from './api';

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

export const portfolioService = {
  // Get user's portfolio
  getPortfolio: async () => {
    const response = await api.get('/api/portfolio');
    return response.data;
  },

  // Get portfolio positions
  getPositions: async () => {
    const response = await api.get('/api/portfolio/positions');
    return response.data;
  },

  // Get portfolio performance
  getPerformance: async () => {
    const response = await api.get('/api/portfolio/performance');
    return response.data;
  },

  // Update portfolio settings
  updateSettings: async (settings: any) => {
    const response = await api.put('/api/portfolio/settings', settings);
    return response.data;
  },
}; 
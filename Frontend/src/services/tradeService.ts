import api from './api';

export interface Trade {
  id: string;
  symbol: string;
  quantity: number;
  price: number;
  type: 'BUY' | 'SELL';
  timestamp: string;
}

export const tradeService = {
  // Get all trades
  getAllTrades: async () => {
    const response = await api.get('/api/trades');
    return response.data;
  },

  // Get a single trade by ID
  getTradeById: async (id: string) => {
    const response = await api.get(`/api/trades/${id}`);
    return response.data;
  },

  // Create a new trade
  createTrade: async (tradeData: Omit<Trade, 'id' | 'timestamp'>) => {
    const response = await api.post('/api/trades', tradeData);
    return response.data;
  },

  // Update a trade
  updateTrade: async (id: string, tradeData: Partial<Trade>) => {
    const response = await api.put(`/api/trades/${id}`, tradeData);
    return response.data;
  },

  // Delete a trade
  deleteTrade: async (id: string) => {
    const response = await api.delete(`/api/trades/${id}`);
    return response.data;
  },
}; 
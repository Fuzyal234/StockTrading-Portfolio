import api from './api';

export interface Stock {
  symbol: string;
  name: string;
  currentPrice: number;
  change: number;
  changePercent: number;
  marketCap: number;
  volume: number;
}

export interface StockQuote {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  timestamp: string;
}

export const stockService = {
  // Get all stocks
  getAllStocks: async () => {
    const response = await api.get('/api/stocks');
    return response.data;
  },

  // Get stock by symbol
  getStockBySymbol: async (symbol: string) => {
    const response = await api.get(`/api/stocks/${symbol}`);
    return response.data;
  },

  // Get stock quote
  getStockQuote: async (symbol: string) => {
    const response = await api.get(`/api/stocks/${symbol}/quote`);
    return response.data;
  },

  // Get stock historical data
  getHistoricalData: async (symbol: string, timeframe: string) => {
    const response = await api.get(`/api/stocks/${symbol}/historical`, {
      params: { timeframe }
    });
    return response.data;
  },

  // Search stocks
  searchStocks: async (query: string) => {
    const response = await api.get('/api/stocks/search', {
      params: { query }
    });
    return response.data;
  },
}; 
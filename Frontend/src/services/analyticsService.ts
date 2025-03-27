import api from './api';

export interface PortfolioAnalytics {
  id: number;
  userId: number;
  date: string;
  totalValue: number;
  cashBalance: number;
  dayReturn: number;
  totalReturn: number;
  sectorAllocation: Record<string, number>;
  riskMetrics: {
    beta: number;
    alpha: number;
    sharpeRatio: number;
    volatility: number;
  };
}

export interface HistoricalValue {
  date: string;
  totalValue: number;
  dayReturn: number;
}

export const analyticsService = {
  // Get latest analytics summary
  getSummary: async (): Promise<PortfolioAnalytics> => {
    const response = await api.get('/api/analytics/summary');
    return response.data;
  },

  // Get historical portfolio value
  getHistoricalValue: async (timeframe: '1W' | '1M' | '3M' | '6M' | '1Y' | 'YTD' = '1M'): Promise<HistoricalValue[]> => {
    const response = await api.get(`/api/analytics/historical-value?timeframe=${timeframe}`);
    return response.data;
  },

  // Get sector allocation
  getSectorAllocation: async (): Promise<Record<string, number>> => {
    const response = await api.get('/api/analytics/sector-allocation');
    return response.data;
  },

  // Get risk metrics
  getRiskMetrics: async () => {
    const response = await api.get('/api/analytics/risk-metrics');
    return response.data;
  }
}; 
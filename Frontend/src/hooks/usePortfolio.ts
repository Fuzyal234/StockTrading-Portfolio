import { useState, useEffect } from 'react';
import { api } from '@/lib/api';

interface Portfolio {
  totalValue: number;
  totalInvestment: number;
  totalProfitLoss: number;
  valueChange: number;
  profitLossChange: number;
  trades: Array<{
    id: string;
    symbol: string;
    quantity: number;
    price: number;
    type: 'BUY' | 'SELL';
    date: string;
  }>;
}

interface UsePortfolioResult {
  portfolio: Portfolio | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function usePortfolio(): UsePortfolioResult {
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchPortfolio = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await api.get('/api/portfolio');
      setPortfolio(response.data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch portfolio data'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPortfolio();
  }, []);

  return {
    portfolio,
    isLoading,
    error,
    refetch: fetchPortfolio,
  };
} 
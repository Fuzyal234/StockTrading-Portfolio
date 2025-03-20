'use client';

import {
  Box,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  VStack,
} from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import axios from 'axios';

interface PortfolioMetrics {
  totalValue: number;
  totalInvestment: number;
  totalProfitLoss: number;
  profitLossPercentage: number;
}

export default function PortfolioSummary() {
  const [metrics, setMetrics] = useState<PortfolioMetrics>({
    totalValue: 0,
    totalInvestment: 0,
    totalProfitLoss: 0,
    profitLossPercentage: 0,
  });

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const response = await axios.get('/api/portfolio/metrics');
        setMetrics(response.data);
      } catch (error) {
        console.error('Error fetching portfolio metrics:', error);
      }
    };

    fetchMetrics();
  }, []);

  return (
    <Box p={4} borderWidth="1px" borderRadius="lg">
      <VStack spacing={4} align="stretch">
        <Stat>
          <StatLabel>Total Portfolio Value</StatLabel>
          <StatNumber>${metrics.totalValue.toFixed(2)}</StatNumber>
          <StatHelpText>
            <StatArrow type={metrics.profitLossPercentage >= 0 ? 'increase' : 'decrease'} />
            {Math.abs(metrics.profitLossPercentage).toFixed(2)}%
          </StatHelpText>
        </Stat>

        <Stat>
          <StatLabel>Total Investment</StatLabel>
          <StatNumber>${metrics.totalInvestment.toFixed(2)}</StatNumber>
        </Stat>

        <Stat>
          <StatLabel>Total Profit/Loss</StatLabel>
          <StatNumber color={metrics.totalProfitLoss >= 0 ? 'green.500' : 'red.500'}>
            ${metrics.totalProfitLoss.toFixed(2)}
          </StatNumber>
        </Stat>
      </VStack>
    </Box>
  );
} 
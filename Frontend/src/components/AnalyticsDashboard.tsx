'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardBody,
  CardHeader,
  Heading,
  Text,
  Stack,
  Select,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  Spinner,
  useColorModeValue,
} from '@chakra-ui/react';
import { Line, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { analyticsService, PortfolioAnalytics, HistoricalValue } from '@/services/analyticsService';
import { formatCurrency, formatPercentage } from '@/utils/formatters';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

export default function AnalyticsDashboard() {
  const [timeframe, setTimeframe] = useState<'1W' | '1M' | '3M' | '6M' | '1Y' | 'YTD'>('1M');
  const [summary, setSummary] = useState<PortfolioAnalytics | null>(null);
  const [historicalData, setHistoricalData] = useState<HistoricalValue[]>([]);
  const [sectorAllocation, setSectorAllocation] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  const cardBg = useColorModeValue('white', 'gray.700');
  const textColor = useColorModeValue('gray.600', 'gray.200');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [summaryData, historicalValue, sectors] = await Promise.all([
          analyticsService.getSummary(),
          analyticsService.getHistoricalValue(timeframe),
          analyticsService.getSectorAllocation(),
        ]);
        setSummary(summaryData);
        setHistoricalData(historicalValue);
        setSectorAllocation(sectors);
      } catch (error) {
        console.error('Failed to fetch analytics data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [timeframe]);

  const portfolioValueChartData = {
    labels: historicalData.map(d => new Date(d.date).toLocaleDateString()),
    datasets: [
      {
        label: 'Portfolio Value',
        data: historicalData.map(d => d.totalValue),
        fill: false,
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1,
      },
    ],
  };

  const sectorAllocationChartData = {
    labels: Object.keys(sectorAllocation),
    datasets: [
      {
        data: Object.values(sectorAllocation),
        backgroundColor: [
          '#FF6384',
          '#36A2EB',
          '#FFCE56',
          '#4BC0C0',
          '#9966FF',
          '#FF9F40',
        ],
      },
    ],
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="400px">
        <Spinner size="xl" />
      </Box>
    );
  }

  return (
    <Box p={4}>
      <Grid templateColumns={{ base: 'repeat(1, 1fr)', md: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' }} gap={4} mb={8}>
        <Card bg={cardBg}>
          <CardBody>
            <Stat>
              <StatLabel>Total Portfolio Value</StatLabel>
              <StatNumber>{formatCurrency(summary?.totalValue || 0)}</StatNumber>
              <StatHelpText>
                <StatArrow type={summary?.dayReturn && summary.dayReturn >= 0 ? 'increase' : 'decrease'} />
                {formatPercentage(summary?.dayReturn || 0)} (24h)
              </StatHelpText>
            </Stat>
          </CardBody>
        </Card>

        <Card bg={cardBg}>
          <CardBody>
            <Stat>
              <StatLabel>Cash Balance</StatLabel>
              <StatNumber>{formatCurrency(summary?.cashBalance || 0)}</StatNumber>
            </Stat>
          </CardBody>
        </Card>

        <Card bg={cardBg}>
          <CardBody>
            <Stat>
              <StatLabel>Total Return</StatLabel>
              <StatNumber>{formatPercentage(summary?.totalReturn || 0)}</StatNumber>
            </Stat>
          </CardBody>
        </Card>

        <Card bg={cardBg}>
          <CardBody>
            <Stat>
              <StatLabel>Risk Score</StatLabel>
              <StatNumber>
                {summary?.riskMetrics?.sharpeRatio?.toFixed(2) || 'N/A'}
              </StatNumber>
              <StatHelpText>Sharpe Ratio</StatHelpText>
            </Stat>
          </CardBody>
        </Card>
      </Grid>

      <Grid templateColumns={{ base: 'repeat(1, 1fr)', lg: 'repeat(2, 1fr)' }} gap={8}>
        <Card bg={cardBg}>
          <CardHeader>
            <Stack direction="row" alignItems="center" justify="space-between">
              <Heading size="md">Portfolio Value History</Heading>
              <Select
                value={timeframe}
                onChange={(e) => setTimeframe(e.target.value as typeof timeframe)}
                width="100px"
              >
                <option value="1W">1W</option>
                <option value="1M">1M</option>
                <option value="3M">3M</option>
                <option value="6M">6M</option>
                <option value="1Y">1Y</option>
                <option value="YTD">YTD</option>
              </Select>
            </Stack>
          </CardHeader>
          <CardBody>
            <Box height="300px">
              <Line
                data={portfolioValueChartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      display: false,
                    },
                  },
                }}
              />
            </Box>
          </CardBody>
        </Card>

        <Card bg={cardBg}>
          <CardHeader>
            <Heading size="md">Sector Allocation</Heading>
          </CardHeader>
          <CardBody>
            <Box height="300px">
              <Pie
                data={sectorAllocationChartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                }}
              />
            </Box>
          </CardBody>
        </Card>
      </Grid>
    </Box>
  );
} 
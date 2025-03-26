'use client'
import React, { useState } from 'react'
import {
  Box,
  Heading,
  Select,
  HStack,
  useColorModeValue,
  Text,
  Spinner,
  Center,
} from '@chakra-ui/react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import { useQuery } from 'react-query'
import { userService } from '@/services/userService'
import { useRouter } from 'next/navigation'

interface PerformanceData {
  date: string;
  value: number;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <Box
        bg={useColorModeValue('white', 'gray.800')}
        p={3}
        border="1px"
        borderColor={useColorModeValue('gray.200', 'gray.700')}
        borderRadius="md"
        boxShadow="lg"
      >
        <p style={{ color: '#666' }}>{`Date: ${label}`}</p>
        <p style={{ color: '#3182CE' }}>{`Value: $${payload[0].value.toLocaleString()}`}</p>
      </Box>
    )
  }
  return null
}

export function PortfolioChart() {
  const router = useRouter();
  const [timeframe, setTimeframe] = useState('1M');
  
  const { data: performanceData, isLoading, error } = useQuery<PerformanceData[]>(
    ['portfolio-performance', timeframe],
    async () => {
      if (!userService.isAuthenticated()) {
        router.push('/login');
        throw new Error('Please login to view your portfolio');
      }

      const token = userService.getToken();
      console.log('Auth token:', token); // Debug token

      try {
        const response = await fetch(`http://localhost:8001/api/portfolio/performance?timeframe=${timeframe}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.status === 401) {
          userService.logout();
          router.push('/login');
          throw new Error('Session expired. Please login again.');
        }

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.error('API Error:', errorData); // Debug API errors
          throw new Error(`Failed to fetch performance data: ${response.statusText}`);
        }

        const data = await response.json();
        console.log('Performance data:', data); // Debug received data
        return data;
      } catch (err) {
        console.error('Fetch error:', err); // Debug fetch errors
        if (err instanceof Error) {
          throw new Error(err.message);
        }
        throw new Error('An unexpected error occurred');
      }
    },
    {
      retry: 1,
      retryDelay: 1000,
      onError: (error) => {
        console.error('Performance data fetch error:', error);
      }
    }
  );

  const lineColor = useColorModeValue('#3182CE', '#63B3ED')
  const gridColor = useColorModeValue('#E2E8F0', '#2D3748')

  if (isLoading) {
    return (
      <Center h="400px">
        <Spinner size="xl" />
      </Center>
    );
  }

  if (error) {
    return (
      <Center h="400px" flexDirection="column" gap={4}>
        <Text color="red.500">Error loading performance data</Text>
        <Text fontSize="sm" color="gray.500">{(error as Error).message}</Text>
      </Center>
    );
  }

  return (
    <Box>
      <HStack justify="space-between" mb={6}>
        <Heading size="md">Portfolio Performance</Heading>
        <Select
          value={timeframe}
          onChange={(e) => setTimeframe(e.target.value)}
          width="120px"
        >
          <option value="1D">1 Day</option>
          <option value="1W">1 Week</option>
          <option value="1M">1 Month</option>
          <option value="3M">3 Months</option>
          <option value="1Y">1 Year</option>
        </Select>
      </HStack>

      <Box height="400px">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={performanceData}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
            <XAxis
              dataKey="date"
              stroke={useColorModeValue('#4A5568', '#A0AEC0')}
              tick={{ fill: useColorModeValue('#4A5568', '#A0AEC0') }}
            />
            <YAxis
              stroke={useColorModeValue('#4A5568', '#A0AEC0')}
              tick={{ fill: useColorModeValue('#4A5568', '#A0AEC0') }}
              tickFormatter={(value) => `$${value.toLocaleString()}`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Line
              type="monotone"
              dataKey="value"
              name="Portfolio Value"
              stroke={lineColor}
              strokeWidth={2}
              dot={{ fill: lineColor, strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </Box>
    </Box>
  )
} 
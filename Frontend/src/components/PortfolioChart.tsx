'use client'
import React from 'react'
import {
  Box,
  Heading,
  Select,
  HStack,
  useColorModeValue,
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

interface StockPerformance {
  symbol: string
  investment: number
  currentValue: number
  profitLoss: number
}

const data = [
  { date: '2024-01', value: 20000 },
  { date: '2024-02', value: 21500 },
  { date: '2024-03', value: 22800 },
  { date: '2024-04', value: 25465 },
]

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
  const { data: holdings } = useQuery<StockPerformance[]>('holdings', async () => {
    const token = localStorage.getItem('token');
    const response = await fetch('http://localhost:8001/api/portfolio', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    if (!response.ok) {
      throw new Error('Failed to fetch portfolio data');
    }
    return response.json();
  })

  const lineColor = useColorModeValue('#3182CE', '#63B3ED')
  const gridColor = useColorModeValue('#E2E8F0', '#2D3748')

  return (
    <Box>
      <HStack justify="space-between" mb={6}>
        <Heading size="md">Portfolio Performance</Heading>
        <Select defaultValue="1M" width="120px">
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
            data={data}
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
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Line
              type="monotone"
              dataKey="value"
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
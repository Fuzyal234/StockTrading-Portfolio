'use client'
import React from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { Box, Heading } from '@chakra-ui/react'
import { useQuery } from 'react-query'

interface StockPerformance {
  symbol: string
  investment: number
  currentValue: number
  profitLoss: number
}

export function PortfolioChart() {
  const { data: holdings } = useQuery<StockPerformance[]>('holdings', async () => {
    const response = await fetch('http://localhost:8001/api/portfolio')
    if (!response.ok) {
      throw new Error('Failed to fetch portfolio data')
    }
    return response.json()
  })

  return (
    <Box>
      <Heading size="md" mb={4}>Portfolio Performance</Heading>
      <Box height="400px">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={holdings}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="symbol" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="investment" name="Total Investment" fill="#8884d8" />
            <Bar dataKey="currentValue" name="Current Value" fill="#82ca9d" />
          </BarChart>
        </ResponsiveContainer>
      </Box>
    </Box>
  )
} 
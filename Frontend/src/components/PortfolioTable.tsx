'use client'
import React from 'react'
import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Text,
  Box,
  Heading,
} from '@chakra-ui/react'
import { useQuery } from '@tanstack/react-query'

interface StockHolding {
  symbol: string
  quantity: number
  averagePrice: number
  currentPrice: number
  totalValue: number
  profitLoss: number
  profitLossPercentage: number
}

export function PortfolioTable() {
  const { data: holdings } = useQuery<StockHolding[]>({
    queryKey: ['holdings'],
    queryFn: async () => {
      const response = await fetch('http://localhost:8001/api/portfolio')
      if (!response.ok) {
        throw new Error('Failed to fetch portfolio data')
      }
      return response.json()
    }
  })

  return (
    <Box>
      <Heading size="md" mb={4}>Portfolio Holdings</Heading>
      <Table variant="simple">
        <Thead>
          <Tr>
            <Th>Symbol</Th>
            <Th isNumeric>Shares</Th>
            <Th isNumeric>Average Price</Th>
            <Th isNumeric>Current Price</Th>
            <Th isNumeric>Total Value</Th>
            <Th isNumeric>Profit/Loss</Th>
          </Tr>
        </Thead>
        <Tbody>
          {holdings?.map((holding: StockHolding) => (
            <Tr key={holding.symbol}>
              <Td>{holding.symbol}</Td>
              <Td isNumeric>{holding.quantity}</Td>
              <Td isNumeric>${holding.averagePrice.toFixed(2)}</Td>
              <Td isNumeric>${holding.currentPrice.toFixed(2)}</Td>
              <Td isNumeric>${holding.totalValue.toFixed(2)}</Td>
              <Td isNumeric>
                <Text color={holding.profitLoss >= 0 ? 'green.500' : 'red.500'}>
                  ${holding.profitLoss.toFixed(2)}
                </Text>
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </Box>
  )
} 
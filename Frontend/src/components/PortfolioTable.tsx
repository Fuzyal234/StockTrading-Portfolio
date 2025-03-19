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
} from '@chakra-ui/react'
import { useQuery } from 'react-query'

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
  const { data: holdings, isLoading } = useQuery<StockHolding[]>('holdings', async () => {
    const response = await fetch('http://localhost:4001/api/portfolio')
    if (!response.ok) {
      throw new Error('Failed to fetch portfolio data')
    }
    return response.json()
  })

  if (isLoading) {
    return <Text>Loading portfolio data...</Text>
  }

  return (
    <TableContainer>
      <Table variant="simple">
        <Thead>
          <Tr>
            <Th>Symbol</Th>
            <Th isNumeric>Quantity</Th>
            <Th isNumeric>Avg. Price</Th>
            <Th isNumeric>Current Price</Th>
            <Th isNumeric>Total Value</Th>
            <Th isNumeric>Profit/Loss</Th>
            <Th isNumeric>P/L %</Th>
          </Tr>
        </Thead>
        <Tbody>
          {holdings?.map((holding) => (
            <Tr key={holding.symbol}>
              <Td>{holding.symbol}</Td>
              <Td isNumeric>{holding.quantity}</Td>
              <Td isNumeric>${holding.averagePrice.toFixed(2)}</Td>
              <Td isNumeric>${holding.currentPrice.toFixed(2)}</Td>
              <Td isNumeric>${holding.totalValue.toFixed(2)}</Td>
              <Td isNumeric color={holding.profitLoss >= 0 ? 'green.500' : 'red.500'}>
                ${Math.abs(holding.profitLoss).toFixed(2)}
              </Td>
              <Td isNumeric color={holding.profitLossPercentage >= 0 ? 'green.500' : 'red.500'}>
                {holding.profitLossPercentage.toFixed(2)}%
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </TableContainer>
  )
} 
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
  id: number;
  symbol: string;
  name: string;
  quantity: number;
  purchasePrice: number;
  portfolioId: number;
  createdAt: string;
  updatedAt: string;
}

export function PortfolioTable() {
  const { data: portfolio, isLoading } = useQuery<{ stocks: StockHolding[] }>('holdings', async () => {
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
  });

  if (isLoading) {
    return <Text>Loading portfolio data...</Text>;
  }

  return (
    <TableContainer>
      <Table variant="simple">
        <Thead>
          <Tr>
            <Th>Symbol</Th>
            <Th>Name</Th>
            <Th isNumeric>Quantity</Th>
            <Th isNumeric>Purchase Price</Th>
            <Th isNumeric>Total Value</Th>
          </Tr>
        </Thead>
        <Tbody>
          {portfolio?.stocks.map((stock) => (
            <Tr key={stock.id}>
              <Td>{stock.symbol}</Td>
              <Td>{stock.name}</Td>
              <Td isNumeric>{stock.quantity}</Td>
              <Td isNumeric>${stock.purchasePrice.toFixed(2)}</Td>
              <Td isNumeric>${(stock.quantity * stock.purchasePrice).toFixed(2)}</Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </TableContainer>
  );
} 
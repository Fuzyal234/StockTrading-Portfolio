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
  Badge,
  Icon,
  useColorModeValue,
  Box,
  Skeleton,
} from '@chakra-ui/react'
import { useQuery } from 'react-query'
import { motion } from 'framer-motion'
import { FiTrendingUp, FiTrendingDown } from 'react-icons/fi'

const MotionTr = motion(Tr)

interface StockHolding {
  id: number;
  symbol: string;
  name: string;
  quantity: number;
  purchasePrice: number;
  currentPrice: number;
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

  const bgColor = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')
  const textColor = useColorModeValue('gray.600', 'gray.300')
  const hoverBgColor = useColorModeValue('gray.50', 'gray.700')

  if (isLoading) {
    return (
      <Box>
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} height="60px" mb={2} />
        ))}
      </Box>
    );
  }

  return (
    <TableContainer>
      <Table variant="simple">
        <Thead>
          <Tr>
            <Th color={textColor}>Symbol</Th>
            <Th color={textColor}>Name</Th>
            <Th isNumeric color={textColor}>Quantity</Th>
            <Th isNumeric color={textColor}>Purchase Price</Th>
            <Th isNumeric color={textColor}>Current Price</Th>
            <Th isNumeric color={textColor}>Total Value</Th>
            <Th isNumeric color={textColor}>P/L</Th>
          </Tr>
        </Thead>
        <Tbody>
          {portfolio?.stocks.map((stock, index) => {
            const totalValue = stock.quantity * (stock.currentPrice || stock.purchasePrice);
            const profitLoss = totalValue - (stock.quantity * stock.purchasePrice);
            const profitLossPercentage = (profitLoss / (stock.quantity * stock.purchasePrice)) * 100;
            const isProfit = profitLoss >= 0;

            return (
              <MotionTr
                key={stock.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                whileHover={{
                  backgroundColor: hoverBgColor,
                  transform: 'translateY(-2px)',
                  boxShadow: 'md',
                  transition: { duration: 0.2 }
                }}
              >
                <Td fontWeight="bold">{stock.symbol}</Td>
                <Td color={textColor}>{stock.name}</Td>
                <Td isNumeric>{stock.quantity.toLocaleString()}</Td>
                <Td isNumeric>${stock.purchasePrice.toFixed(2)}</Td>
                <Td isNumeric>${(stock.currentPrice || stock.purchasePrice).toFixed(2)}</Td>
                <Td isNumeric fontWeight="bold">${totalValue.toLocaleString()}</Td>
                <Td isNumeric>
                  <Badge
                    colorScheme={isProfit ? 'green' : 'red'}
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    gap={1}
                    width="fit-content"
                  >
                    <Icon as={isProfit ? FiTrendingUp : FiTrendingDown} />
                    {profitLossPercentage.toFixed(2)}%
                  </Badge>
                </Td>
              </MotionTr>
            );
          })}
        </Tbody>
      </Table>
    </TableContainer>
  );
} 
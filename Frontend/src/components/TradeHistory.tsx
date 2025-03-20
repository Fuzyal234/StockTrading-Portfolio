'use client';

import {
  Box,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Heading,
} from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import axios from 'axios';

interface Trade {
  id: string;
  symbol: string;
  type: 'BUY' | 'SELL';
  quantity: number;
  price: number;
  timestamp: string;
}

export default function TradeHistory() {
  const [trades, setTrades] = useState<Trade[]>([]);

  useEffect(() => {
    const fetchTrades = async () => {
      try {
        const response = await axios.get('/api/trades');
        setTrades(response.data);
      } catch (error) {
        console.error('Error fetching trades:', error);
      }
    };

    fetchTrades();
  }, []);

  return (
    <Box p={4} borderWidth="1px" borderRadius="lg">
      <Heading size="md" mb={4}>Trade History</Heading>
      <Table variant="simple">
        <Thead>
          <Tr>
            <Th>Date</Th>
            <Th>Symbol</Th>
            <Th>Type</Th>
            <Th isNumeric>Quantity</Th>
            <Th isNumeric>Price</Th>
            <Th isNumeric>Total</Th>
          </Tr>
        </Thead>
        <Tbody>
          {trades.map((trade) => (
            <Tr key={trade.id}>
              <Td>{new Date(trade.timestamp).toLocaleDateString()}</Td>
              <Td>{trade.symbol}</Td>
              <Td color={trade.type === 'BUY' ? 'green.500' : 'red.500'}>
                {trade.type}
              </Td>
              <Td isNumeric>{trade.quantity}</Td>
              <Td isNumeric>${trade.price.toFixed(2)}</Td>
              <Td isNumeric>${(trade.quantity * trade.price).toFixed(2)}</Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </Box>
  );
} 
'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  useToast,
} from '@chakra-ui/react';
import { tradeService, Trade } from '@/services/tradeService';

export default function TradeHistory() {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    loadTrades();
  }, []);

  const loadTrades = async () => {
    try {
      const data = await tradeService.getAllTrades();
      setTrades(data);
    } catch (error) {
      toast({
        title: 'Error loading trades',
        status: 'error',
        duration: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Box>Loading trade history...</Box>;
  }

  return (
    <Box p={6} borderWidth={1} borderRadius="lg">
      <Heading size="md" mb={6}>Trade History</Heading>
      
      <Box overflowX="auto">
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th>Date</Th>
              <Th>Symbol</Th>
              <Th>Type</Th>
              <Th>Quantity</Th>
              <Th>Price</Th>
              <Th>Total</Th>
            </Tr>
          </Thead>
          <Tbody>
            {trades.map((trade) => (
              <Tr key={trade.id}>
                <Td>{new Date(trade.timestamp).toLocaleDateString()}</Td>
                <Td>{trade.symbol}</Td>
                <Td>
                  <Badge
                    colorScheme={trade.type === 'BUY' ? 'green' : 'red'}
                  >
                    {trade.type}
                  </Badge>
                </Td>
                <Td>{trade.quantity}</Td>
                <Td>${trade.price.toFixed(2)}</Td>
                <Td>${(trade.quantity * trade.price).toFixed(2)}</Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>
    </Box>
  );
} 
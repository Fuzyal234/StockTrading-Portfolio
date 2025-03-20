'use client';

import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Select,
  VStack,
  useToast,
} from '@chakra-ui/react';
import { useState } from 'react';
import axios from 'axios';

interface TradeFormData {
  symbol: string;
  type: 'BUY' | 'SELL';
  quantity: number;
  price: number;
}

export default function TradeForm() {
  const toast = useToast();
  const [formData, setFormData] = useState<TradeFormData>({
    symbol: '',
    type: 'BUY',
    quantity: 0,
    price: 0,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post('/api/trades', formData);
      toast({
        title: 'Trade recorded',
        status: 'success',
        duration: 3000,
      });
      setFormData({
        symbol: '',
        type: 'BUY',
        quantity: 0,
        price: 0,
      });
    } catch (error) {
      toast({
        title: 'Error recording trade',
        status: 'error',
        duration: 3000,
      });
    }
  };

  return (
    <Box p={4} borderWidth="1px" borderRadius="lg">
      <form onSubmit={handleSubmit}>
        <VStack spacing={4}>
          <FormControl isRequired>
            <FormLabel>Stock Symbol</FormLabel>
            <Input
              value={formData.symbol}
              onChange={(e) => setFormData({ ...formData, symbol: e.target.value.toUpperCase() })}
              placeholder="e.g., AAPL"
            />
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Trade Type</FormLabel>
            <Select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as 'BUY' | 'SELL' })}
            >
              <option value="BUY">Buy</option>
              <option value="SELL">Sell</option>
            </Select>
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Quantity</FormLabel>
            <Input
              type="number"
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
              min="1"
            />
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Price per Share</FormLabel>
            <Input
              type="number"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
              min="0"
              step="0.01"
            />
          </FormControl>

          <Button type="submit" colorScheme="blue" width="full">
            Record Trade
          </Button>
        </VStack>
      </form>
    </Box>
  );
} 
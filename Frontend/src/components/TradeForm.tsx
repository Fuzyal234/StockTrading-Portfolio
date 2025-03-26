'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Select,
  VStack,
  useToast,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
} from '@chakra-ui/react';
import { stockService, Stock } from '@/services/stockService';
import { tradeService } from '@/services/tradeService';

export default function TradeForm() {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [selectedStock, setSelectedStock] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [type, setType] = useState<'BUY' | 'SELL'>('BUY');
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  useEffect(() => {
    loadStocks();
  }, []);

  const loadStocks = async () => {
    try {
      const data = await stockService.getAllStocks();
      setStocks(data);
    } catch (error) {
      toast({
        title: 'Error loading stocks',
        status: 'error',
        duration: 3000,
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const stock = stocks.find(s => s.symbol === selectedStock);
      if (!stock) throw new Error('Stock not found');

      await tradeService.createTrade({
        stockId: selectedStock,
        quantity,
        price: stock.currentPrice,
        type,
      });

      toast({
        title: 'Trade executed successfully',
        status: 'success',
        duration: 3000,
      });

      // Reset form
      setSelectedStock('');
      setQuantity(1);
      setType('BUY');
    } catch (error) {
      toast({
        title: 'Error executing trade',
        description: error instanceof Error ? error.message : 'Unknown error',
        status: 'error',
        duration: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box p={6} borderWidth={1} borderRadius="lg">
      <form onSubmit={handleSubmit}>
        <VStack spacing={4}>
          <FormControl isRequired>
            <FormLabel>Stock</FormLabel>
            <Select
              value={selectedStock}
              onChange={(e) => setSelectedStock(e.target.value)}
              placeholder="Select stock"
            >
              {stocks.map((stock) => (
                <option key={stock.symbol} value={stock.symbol}>
                  {stock.symbol} - {stock.name}
                </option>
              ))}
            </Select>
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Type</FormLabel>
            <Select value={type} onChange={(e) => setType(e.target.value as 'BUY' | 'SELL')}>
              <option value="BUY">Buy</option>
              <option value="SELL">Sell</option>
            </Select>
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Quantity</FormLabel>
            <NumberInput min={1} value={quantity} onChange={(_, value) => setQuantity(value)}>
              <NumberInputField />
              <NumberInputStepper>
                <NumberIncrementStepper />
                <NumberDecrementStepper />
              </NumberInputStepper>
            </NumberInput>
          </FormControl>

          <Button
            type="submit"
            colorScheme="blue"
            width="full"
            isLoading={loading}
            isDisabled={!selectedStock}
          >
            Execute Trade
          </Button>
        </VStack>
      </form>
    </Box>
  );
} 
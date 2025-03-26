'use client'
import React, { useState } from 'react'
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  FormControl,
  FormLabel,
  Input,
  Select,
  useToast,
  useColorModeValue,
} from '@chakra-ui/react'
import { tradeService } from '@/services/tradeService'
import { useQueryClient } from 'react-query'

interface AddTradeModalProps {
  isOpen: boolean
  onClose: () => void
}

export function AddTradeModal({ isOpen, onClose }: AddTradeModalProps) {
  const [formData, setFormData] = useState({
    stockId: '',
    type: 'BUY',
    quantity: '',
    price: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const toast = useToast()
  const queryClient = useQueryClient()
  const bgColor = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      await tradeService.createTrade({
        stockId: formData.stockId,
        type: formData.type as 'BUY' | 'SELL',
        quantity: Number(formData.quantity),
        price: Number(formData.price)
      })

      toast({
        title: 'Trade added successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      })
      
      // Invalidate trades query to refresh the data
      queryClient.invalidateQueries('trades')
      
      onClose()
      // Reset form
      setFormData({
        stockId: '',
        type: 'BUY',
        quantity: '',
        price: '',
      })
    } catch (error) {
      toast({
        title: 'Error adding trade',
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent bg={bgColor}>
        <ModalHeader>Add New Trade</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <form onSubmit={handleSubmit}>
            <FormControl mb={4}>
              <FormLabel>Stock Symbol</FormLabel>
              <Input
                value={formData.stockId}
                onChange={(e) => setFormData({ ...formData, stockId: e.target.value })}
                placeholder="Enter stock symbol"
                required
              />
            </FormControl>
            <FormControl mb={4}>
              <FormLabel>Type</FormLabel>
              <Select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                required
              >
                <option value="BUY">Buy</option>
                <option value="SELL">Sell</option>
              </Select>
            </FormControl>
            <FormControl mb={4}>
              <FormLabel>Quantity</FormLabel>
              <Input
                type="number"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                placeholder="Enter quantity"
                required
                min="1"
              />
            </FormControl>
            <FormControl mb={4}>
              <FormLabel>Price</FormLabel>
              <Input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                placeholder="Enter price"
                required
                min="0.01"
                step="0.01"
              />
            </FormControl>
          </form>
        </ModalBody>

        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose}>
            Cancel
          </Button>
          <Button
            colorScheme="blue"
            onClick={handleSubmit}
            isLoading={isSubmitting}
          >
            Add Trade
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
} 
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
  NumberInput,
  NumberInputField,
  VStack,
} from '@chakra-ui/react'

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8001/api/trades', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          stockId: formData.stockId,
          type: formData.type,
          quantity: Number(formData.quantity),
          price: Number(formData.price)
        }),
      })
      if (response.ok) {
        onClose()
        // TODO: Add success toast and refresh portfolio data
      }
    } catch (error) {
      console.error('Error adding trade:', error)
      // TODO: Add error toast
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <form onSubmit={handleSubmit}>
          <ModalHeader>Add New Trade</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Stock Symbol</FormLabel>
                <Input
                  value={formData.stockId}
                  onChange={(e) => setFormData({ ...formData, stockId: e.target.value.toUpperCase() })}
                  placeholder="e.g. AAPL"
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>Trade Type</FormLabel>
                <Select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                >
                  <option value="BUY">Buy</option>
                  <option value="SELL">Sell</option>
                </Select>
              </FormControl>
              <FormControl isRequired>
                <FormLabel>Quantity</FormLabel>
                <NumberInput min={1}>
                  <NumberInputField
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    placeholder="Number of shares"
                  />
                </NumberInput>
              </FormControl>
              <FormControl isRequired>
                <FormLabel>Price per Share</FormLabel>
                <NumberInput min={0.01} precision={2}>
                  <NumberInputField
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="Price per share"
                  />
                </NumberInput>
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button colorScheme="blue" type="submit">
              Add Trade
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  )
} 
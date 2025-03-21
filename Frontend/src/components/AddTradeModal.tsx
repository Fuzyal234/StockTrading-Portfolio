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
  useToast,
  Icon,
  Text,
  useColorModeValue,
} from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { FiDollarSign, FiTrendingUp, FiTrendingDown } from 'react-icons/fi'

const MotionModalContent = motion(ModalContent)

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
  const bgColor = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const token = localStorage.getItem('token')
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
        toast({
          title: 'Trade added successfully',
          status: 'success',
          duration: 3000,
          isClosable: true,
        })
        onClose()
        // Reset form
        setFormData({
          stockId: '',
          type: 'BUY',
          quantity: '',
          price: '',
        })
      } else {
        throw new Error('Failed to add trade')
      }
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
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay backdropFilter="blur(4px)" />
      <MotionModalContent
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        bg={bgColor}
        border="1px"
        borderColor={borderColor}
      >
        <form onSubmit={handleSubmit}>
          <ModalHeader display="flex" alignItems="center" gap={2}>
            <Icon as={formData.type === 'BUY' ? FiTrendingUp : FiTrendingDown} color={formData.type === 'BUY' ? 'green.500' : 'red.500'} />
            <Text>Add New Trade</Text>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={6}>
              <FormControl isRequired>
                <FormLabel>Stock Symbol</FormLabel>
                <Input
                  value={formData.stockId}
                  onChange={(e) => setFormData({ ...formData, stockId: e.target.value.toUpperCase() })}
                  placeholder="e.g. AAPL"
                  size="lg"
                  _focus={{
                    borderColor: formData.type === 'BUY' ? 'green.500' : 'red.500',
                    boxShadow: 'outline',
                  }}
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Trade Type</FormLabel>
                <Select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  size="lg"
                  _focus={{
                    borderColor: formData.type === 'BUY' ? 'green.500' : 'red.500',
                    boxShadow: 'outline',
                  }}
                >
                  <option value="BUY">Buy</option>
                  <option value="SELL">Sell</option>
                </Select>
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Quantity</FormLabel>
                <NumberInput min={1} size="lg">
                  <NumberInputField
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    placeholder="Number of shares"
                    _focus={{
                      borderColor: formData.type === 'BUY' ? 'green.500' : 'red.500',
                      boxShadow: 'outline',
                    }}
                  />
                </NumberInput>
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Price per Share</FormLabel>
                <NumberInput min={0.01} precision={2} size="lg">
                  <NumberInputField
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="Price per share"
                    _focus={{
                      borderColor: formData.type === 'BUY' ? 'green.500' : 'red.500',
                      boxShadow: 'outline',
                    }}
                  />
                </NumberInput>
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button
              colorScheme={formData.type === 'BUY' ? 'green' : 'red'}
              type="submit"
              isLoading={isSubmitting}
              leftIcon={<Icon as={formData.type === 'BUY' ? FiTrendingUp : FiTrendingDown} />}
              size="lg"
            >
              {formData.type === 'BUY' ? 'Buy Stock' : 'Sell Stock'}
            </Button>
          </ModalFooter>
        </form>
      </MotionModalContent>
    </Modal>
  )
} 
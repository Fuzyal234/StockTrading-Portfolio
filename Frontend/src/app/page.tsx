'use client'
import React from 'react'
import {
  Box,
  Container,
  Heading,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  Button,
  useDisclosure,
} from '@chakra-ui/react'
import { AddTradeModal } from '@/components/AddTradeModal'
import { PortfolioTable } from '@/components/PortfolioTable'
import { PortfolioChart } from '@/components/PortfolioChart'

export default function Home() {
  const { isOpen, onOpen, onClose } = useDisclosure()

  return (
    <Container maxW="container.xl" py={8}>
      <Box mb={8} display="flex" justifyContent="space-between" alignItems="center">
        <Heading>Stock Trading Portfolio</Heading>
        <Button colorScheme="blue" onClick={onOpen}>Add Trade</Button>
      </Box>

      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6} mb={8}>
        <Stat p={4} shadow="md" border="1px" borderColor="gray.200" borderRadius="md">
          <StatLabel>Total Portfolio Value</StatLabel>
          <StatNumber>$25,465.00</StatNumber>
          <StatHelpText>
            <StatArrow type="increase" />
            23.36%
          </StatHelpText>
        </Stat>
        <Stat p={4} shadow="md" border="1px" borderColor="gray.200" borderRadius="md">
          <StatLabel>Total Investment</StatLabel>
          <StatNumber>$20,000.00</StatNumber>
        </Stat>
        <Stat p={4} shadow="md" border="1px" borderColor="gray.200" borderRadius="md">
          <StatLabel>Total Profit/Loss</StatLabel>
          <StatNumber>$5,465.00</StatNumber>
          <StatHelpText>
            <StatArrow type="increase" />
            27.33%
          </StatHelpText>
        </Stat>
      </SimpleGrid>

      <Box mb={8}>
        <PortfolioChart />
      </Box>

      <Box>
        <PortfolioTable />
      </Box>

      <AddTradeModal isOpen={isOpen} onClose={onClose} />
    </Container>
  )
} 
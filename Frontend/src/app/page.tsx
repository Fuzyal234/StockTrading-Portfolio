'use client'
import React, { Suspense } from 'react'
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
  Skeleton,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
} from '@chakra-ui/react'
import { AddTradeModal } from '@/components/AddTradeModal'
import { PortfolioTable } from '@/components/PortfolioTable'
import { PortfolioChart } from '@/components/PortfolioChart'
import { usePortfolio } from '@/hooks/usePortfolio'
import { ErrorBoundary } from '@/components/ErrorBoundary'

const LoadingSkeleton = () => (
  <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6} mb={8}>
    {[1, 2, 3].map((i) => (
      <Skeleton key={i} height="100px" borderRadius="md" />
    ))}
  </SimpleGrid>
)

const PortfolioStats = () => {
  const { portfolio, isLoading, error } = usePortfolio()

  if (error) {
    return (
      <Alert status="error" mb={8}>
        <AlertIcon />
        <AlertTitle>Error loading portfolio data</AlertTitle>
        <AlertDescription>{error.message}</AlertDescription>
      </Alert>
    )
  }

  if (isLoading) {
    return <LoadingSkeleton />
  }

  return (
    <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6} mb={8}>
      <Stat p={4} shadow="md" border="1px" borderColor="gray.200" borderRadius="md">
        <StatLabel>Total Portfolio Value</StatLabel>
        <StatNumber>${portfolio?.totalValue?.toLocaleString() ?? 0}</StatNumber>
        <StatHelpText>
          <StatArrow type={(portfolio?.valueChange ?? 0) >= 0 ? 'increase' : 'decrease'} />
          {Math.abs(portfolio?.valueChange ?? 0).toFixed(2)}%
        </StatHelpText>
      </Stat>
      <Stat p={4} shadow="md" border="1px" borderColor="gray.200" borderRadius="md">
        <StatLabel>Total Investment</StatLabel>
        <StatNumber>${portfolio?.totalInvestment.toLocaleString()}</StatNumber>
      </Stat>
      <Stat p={4} shadow="md" border="1px" borderColor="gray.200" borderRadius="md">
        <StatLabel>Total Profit/Loss</StatLabel>
        <StatNumber>${portfolio?.totalProfitLoss?.toLocaleString() ?? 0}</StatNumber>
        <StatHelpText>
          <StatArrow type={(portfolio?.profitLossChange ?? 0) >= 0 ? 'increase' : 'decrease'} />
          {Math.abs(portfolio?.profitLossChange ?? 0).toFixed(2)}%
        </StatHelpText>
      </Stat>
    </SimpleGrid>
  )
}

export default function Home() {
  const { isOpen, onOpen, onClose } = useDisclosure()

  return (
    <Container maxW="container.xl" py={8}>
      <Box mb={8} display="flex" justifyContent="space-between" alignItems="center">
        <Heading size="lg">Stock Trading Portfolio</Heading>
        <Button colorScheme="blue" onClick={onOpen}>Add Trade</Button>
      </Box>

      <ErrorBoundary>
        <Suspense fallback={<LoadingSkeleton />}>
          <PortfolioStats />
        </Suspense>
      </ErrorBoundary>

      <Box mb={8}>
        <ErrorBoundary>
          <Suspense fallback={<Skeleton height="400px" borderRadius="md" />}>
            <PortfolioChart />
          </Suspense>
        </ErrorBoundary>
      </Box>

      <Box>
        <ErrorBoundary>
          <Suspense fallback={<Skeleton height="200px" borderRadius="md" />}>
            <PortfolioTable />
          </Suspense>
        </ErrorBoundary>
      </Box>

      <AddTradeModal isOpen={isOpen} onClose={onClose} />
    </Container>
  )
} 
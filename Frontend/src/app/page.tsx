'use client'

import { Box, Container, Heading, SimpleGrid, VStack } from '@chakra-ui/react'
import TradeForm from '@/components/TradeForm'
import PortfolioSummary from '@/components/PortfolioSummary'
import TradeHistory from '@/components/TradeHistory'

export default function Home() {
  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={8} align="stretch">
        <Heading textAlign="center">Stock Trading Portfolio</Heading>
        
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8}>
          <Box>
            <TradeForm />
          </Box>
          <Box>
            <PortfolioSummary />
          </Box>
        </SimpleGrid>

        <Box>
          <TradeHistory />
        </Box>
      </VStack>
    </Container>
  )
} 
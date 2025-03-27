'use client'
import React, { useEffect, useState } from 'react'
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
  useColorModeValue,
  Flex,
  Icon,
  Text,
  Badge,
  Spinner,
  Center,
} from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { AddTradeModal } from '@/components/AddTradeModal'
import { PortfolioTable } from '@/components/PortfolioTable'
import { PortfolioChart } from '@/components/PortfolioChart'
import { FiTrendingUp, FiDollarSign, FiBarChart2 } from 'react-icons/fi'
import { useRouter } from 'next/navigation'
import { userService } from '@/services/userService'

const MotionBox = motion(Box)

export default function Home() {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const bgColor = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        if (!userService.isAuthenticated()) {
          const currentPath = window.location.pathname;
          window.location.href = `/login?from=${encodeURIComponent(currentPath)}`;
          return;
        }
        
        // Verify token is valid by fetching user data
        await userService.getCurrentUser();
        setIsLoading(false);
      } catch (error) {
        console.error('Auth check error:', error);
        // Clear invalid token
        userService.logout();
        const currentPath = window.location.pathname;
        window.location.href = `/login?from=${encodeURIComponent(currentPath)}`;
      }
    };
    
    checkAuth();
  }, []);

  if (isLoading) {
    return (
      <Center h="100vh">
        <Spinner size="xl" />
      </Center>
    )
  }

  return (
    <Container maxW="container.xl" py={8}>
      <MotionBox
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        mb={8}
        display="flex"
        justifyContent="space-between"
        alignItems="center"
      >
        <Flex alignItems="center" gap={3}>
          <Icon as={FiBarChart2} w={8} h={8} color="blue.500" />
          <Heading size="lg">Stock Trading Portfolio</Heading>
        </Flex>
        <Button
          colorScheme="blue"
          onClick={onOpen}
          leftIcon={<FiTrendingUp />}
          size="lg"
          _hover={{ transform: 'translateY(-2px)', boxShadow: 'lg' }}
          transition="all 0.2s"
        >
          Add Trade
        </Button>
      </MotionBox>

      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6} mb={8}>
        <MotionBox
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.2 }}
        >
          <Stat
            p={6}
            shadow="lg"
            border="1px"
            borderColor={borderColor}
            borderRadius="xl"
            bg={bgColor}
          >
            <StatLabel fontSize="lg" color="gray.600">Total Portfolio Value</StatLabel>
            <StatNumber fontSize="3xl" color="blue.600">$25,465.00</StatNumber>
            <StatHelpText>
              <StatArrow type="increase" />
              <Badge colorScheme="green" ml={2}>23.36%</Badge>
            </StatHelpText>
          </Stat>
        </MotionBox>

        <MotionBox
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.2 }}
        >
          <Stat
            p={6}
            shadow="lg"
            border="1px"
            borderColor={borderColor}
            borderRadius="xl"
            bg={bgColor}
          >
            <StatLabel fontSize="lg" color="gray.600">Total Investment</StatLabel>
            <StatNumber fontSize="3xl" color="purple.600">$20,000.00</StatNumber>
            <StatHelpText>
              <Icon as={FiDollarSign} color="purple.500" />
              <Text as="span" ml={2}>Initial Capital</Text>
            </StatHelpText>
          </Stat>
        </MotionBox>

        <MotionBox
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.2 }}
        >
          <Stat
            p={6}
            shadow="lg"
            border="1px"
            borderColor={borderColor}
            borderRadius="xl"
            bg={bgColor}
          >
            <StatLabel fontSize="lg" color="gray.600">Total Profit/Loss</StatLabel>
            <StatNumber fontSize="3xl" color="green.600">$5,465.00</StatNumber>
            <StatHelpText>
              <StatArrow type="increase" />
              <Badge colorScheme="green" ml={2}>27.33%</Badge>
            </StatHelpText>
          </Stat>
        </MotionBox>
      </SimpleGrid>

      <MotionBox
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        mb={8}
        p={6}
        shadow="lg"
        border="1px"
        borderColor={borderColor}
        borderRadius="xl"
        bg={bgColor}
      >
        <PortfolioChart />
      </MotionBox>

      <MotionBox
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        p={6}
        shadow="lg"
        border="1px"
        borderColor={borderColor}
        borderRadius="xl"
        bg={bgColor}
      >
        <PortfolioTable />
      </MotionBox>

      <AddTradeModal isOpen={isOpen} onClose={onClose} />
    </Container>
  )
} 
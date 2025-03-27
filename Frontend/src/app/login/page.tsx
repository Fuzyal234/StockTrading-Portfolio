'use client'

import { useState } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  Heading,
  Text,
  Link as ChakraLink,
  useToast,
  Container,
} from '@chakra-ui/react';
import { useRouter } from 'next/navigation';
import { userService } from '@/services/userService';
import { portfolioService } from '@/services/portfolioService';

export default function LoginPage() {
  const router = useRouter();
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await userService.login(formData);
      
      if (response.token) {
        toast({
          title: 'Login successful',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        
        // Get the redirect URL from query params
        const params = new URLSearchParams(window.location.search);
        const redirectTo = params.get('from') || '/';
        
        // Verify the token is valid before redirecting
        try {
          await userService.getCurrentUser();
          // Use window.location.href for a full page reload
          window.location.href = redirectTo;
        } catch (error: any) {
          console.error('Token verification failed:', error);
          toast({
            title: 'Session error',
            description: error.message || 'Please try logging in again',
            status: 'error',
            duration: 3000,
            isClosable: true,
          });
        }
      } else {
        throw new Error('No token received');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      toast({
        title: 'Login failed',
        description: error.message || 'Invalid email or password',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container maxW="container.sm" py={10}>
      <Box p={8} borderWidth={1} borderRadius={8} boxShadow="lg">
        <VStack spacing={6}>
          <Heading>Login</Heading>
          <form onSubmit={handleSubmit} style={{ width: '100%' }}>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Email</FormLabel>
                <Input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Password</FormLabel>
                <Input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                />
              </FormControl>

              <Button
                type="submit"
                colorScheme="blue"
                width="100%"
                isLoading={isLoading}
              >
                Login
              </Button>
            </VStack>
          </form>

          <Text>
            Don't have an account?{' '}
            <ChakraLink href="/register" color="blue.500">
              Register
            </ChakraLink>
          </Text>
        </VStack>
      </Box>
    </Container>
  );
} 
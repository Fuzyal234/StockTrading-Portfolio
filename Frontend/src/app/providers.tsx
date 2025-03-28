'use client'
import { CacheProvider } from '@chakra-ui/next-js'
import { ChakraProvider } from '@chakra-ui/react'
import { QueryClient, QueryClientProvider } from 'react-query'

const queryClient = new QueryClient()

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <CacheProvider>
      <ChakraProvider>
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      </ChakraProvider>
    </CacheProvider>
  )
} 
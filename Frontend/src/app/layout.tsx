'use client'
import React from 'react'
import { Providers } from './providers'
import { Box, Container } from '@chakra-ui/react'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <Box minH="100vh" display="flex" flexDirection="column">
            <Navbar />
            <Box flex="1" py={8}>
              <Container maxW="container.xl">
                {children}
              </Container>
            </Box>
            <Footer />
          </Box>
        </Providers>
      </body>
    </html>
  )
} 
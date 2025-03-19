import {
  Box,
  Container,
  Stack,
  Text,
  Link,
  Icon,
  useColorModeValue,
} from '@chakra-ui/react';
import { FaGithub, FaTwitter, FaLinkedin } from 'react-icons/fa';

export function Footer() {
  const bgColor = useColorModeValue('white', 'gray.900');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  return (
    <Box
      as="footer"
      bg={bgColor}
      borderTop="1px"
      borderColor={borderColor}
      py={8}
    >
      <Container maxW="container.xl">
        <Stack spacing={8} direction={{ base: 'column', md: 'row' }} justify="space-between" align="center">
          <Stack spacing={4}>
            <Text fontSize="lg" fontWeight="bold">
              StockTrading
            </Text>
            <Text color="gray.600" fontSize="sm">
              © {new Date().getFullYear()} StockTrading. All rights reserved.
            </Text>
          </Stack>
          <Stack direction="row" spacing={6}>
            <Link href="https://github.com" isExternal>
              <Icon as={FaGithub} w={6} h={6} />
            </Link>
            <Link href="https://twitter.com" isExternal>
              <Icon as={FaTwitter} w={6} h={6} />
            </Link>
            <Link href="https://linkedin.com" isExternal>
              <Icon as={FaLinkedin} w={6} h={6} />
            </Link>
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
} 
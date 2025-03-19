import {
  Box,
  Flex,
  HStack,
  IconButton,
  Button,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useDisclosure,
  useColorModeValue,
  Stack,
} from '@chakra-ui/react';
import { HamburgerIcon, CloseIcon } from '@chakra-ui/icons';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';

const Links = [
  { name: 'Dashboard', href: '/' },
  { name: 'Portfolio', href: '/portfolio' },
  { name: 'Trades', href: '/trades' },
  { name: 'Analytics', href: '/analytics' },
];

export function Navbar() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <Box bg={useColorModeValue('white', 'gray.900')} px={4} shadow="sm">
      <Flex h={16} alignItems="center" justifyContent="space-between">
        <IconButton
          size="md"
          icon={isOpen ? <CloseIcon /> : <HamburgerIcon />}
          aria-label="Open Menu"
          display={{ md: 'none' }}
          onClick={isOpen ? onClose : onOpen}
        />
        <HStack spacing={8} alignItems="center">
          <Box fontWeight="bold" fontSize="xl">
            StockTrading
          </Box>
          <HStack as="nav" spacing={4} display={{ base: 'none', md: 'flex' }}>
            {Links.map((link) => (
              <Link key={link.name} href={link.href}>
                <Button
                  variant="ghost"
                  colorScheme={pathname === link.href ? 'blue' : 'gray'}
                >
                  {link.name}
                </Button>
              </Link>
            ))}
          </HStack>
        </HStack>
        <Flex alignItems="center">
          {user ? (
            <Menu>
              <MenuButton
                as={Button}
                rounded="full"
                variant="link"
                cursor="pointer"
              >
                {user.email}
              </MenuButton>
              <MenuList>
                <MenuItem onClick={() => router.push('/profile')}>
                  Profile
                </MenuItem>
                <MenuItem onClick={logout}>Logout</MenuItem>
              </MenuList>
            </Menu>
          ) : (
            <Stack direction="row" spacing={4}>
              <Button variant="ghost" onClick={() => router.push('/login')}>
                Login
              </Button>
              <Button colorScheme="blue" onClick={() => router.push('/register')}>
                Sign Up
              </Button>
            </Stack>
          )}
        </Flex>
      </Flex>

      {isOpen ? (
        <Box pb={4} display={{ md: 'none' }}>
          <Stack as="nav" spacing={4}>
            {Links.map((link) => (
              <Link key={link.name} href={link.href}>
                <Button
                  variant="ghost"
                  colorScheme={pathname === link.href ? 'blue' : 'gray'}
                  w="full"
                  justifyContent="flex-start"
                >
                  {link.name}
                </Button>
              </Link>
            ))}
          </Stack>
        </Box>
      ) : null}
    </Box>
  );
} 
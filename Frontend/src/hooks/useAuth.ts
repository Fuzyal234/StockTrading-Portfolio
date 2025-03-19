import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: Error | null;
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: true,
    error: null,
  });
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      if (typeof window === 'undefined') return;
      
      const token = localStorage.getItem('token');
      if (!token) {
        setState({ user: null, isLoading: false, error: null });
        return;
      }

      const response = await api.get('/api/users/me');
      setState({ user: response.data, isLoading: false, error: null });
    } catch (error) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
      }
      setState({
        user: null,
        isLoading: false,
        error: error instanceof Error ? error : new Error('Authentication failed'),
      });
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setState({ ...state, isLoading: true, error: null });
      const response = await api.post('/api/auth/login', { email, password });
      const { token, user } = response.data;
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', token);
      }
      setState({ user, isLoading: false, error: null });
      router.push('/');
    } catch (error) {
      setState({
        ...state,
        isLoading: false,
        error: error instanceof Error ? error : new Error('Login failed'),
      });
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      setState({ ...state, isLoading: true, error: null });
      const response = await api.post('/api/auth/register', { name, email, password });
      const { token, user } = response.data;
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', token);
      }
      setState({ user, isLoading: false, error: null });
      router.push('/');
    } catch (error) {
      setState({
        ...state,
        isLoading: false,
        error: error instanceof Error ? error : new Error('Registration failed'),
      });
    }
  };

  const logout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
    }
    setState({ user: null, isLoading: false, error: null });
    router.push('/login');
  };

  return {
    ...state,
    login,
    register,
    logout,
  };
} 
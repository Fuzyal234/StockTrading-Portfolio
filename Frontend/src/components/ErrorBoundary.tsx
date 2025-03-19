import React, { Component, ErrorInfo, ReactNode } from 'react';
import {
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Button,
  Box,
} from '@chakra-ui/react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <Alert
          status="error"
          variant="subtle"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          textAlign="center"
          height="200px"
          borderRadius="md"
        >
          <AlertIcon boxSize="40px" mr={0} />
          <AlertTitle mt={4} mb={1} fontSize="lg">
            Something went wrong
          </AlertTitle>
          <AlertDescription maxWidth="sm">
            {this.state.error?.message || 'An unexpected error occurred'}
          </AlertDescription>
          <Button
            colorScheme="red"
            variant="outline"
            mt={4}
            onClick={() => window.location.reload()}
          >
            Reload Page
          </Button>
        </Alert>
      );
    }

    return this.props.children;
  }
} 
import React from 'react';
import { Box, Typography, Button } from '@mui/material';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    // Log error in development mode
    if (process.env.NODE_ENV === 'development') {
      console.error('ErrorBoundary caught error:', error);
    }
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    try {
      // Enhanced logging with structured error information
      const errorDetails = {
        message: error?.message || 'Unknown error',
        stack: error?.stack,
        componentStack: errorInfo?.componentStack,
        timestamp: new Date().toISOString(),
        userAgent: navigator?.userAgent,
        url: window?.location?.href
      };
      
      console.error('Error caught by boundary:', errorDetails);
      
      // Send to error reporting service in production
      if (process.env.NODE_ENV === 'production') {
        // Log essential error info for production debugging
        console.error('Production error:', {
          message: error?.message,
          timestamp: errorDetails.timestamp
        });
      }
    } catch (loggingError) {
      console.error('Error in error boundary logging:', loggingError);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <Box sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h5" gutterBottom>
            Something went wrong
          </Typography>
          <Button 
            variant="contained" 
            onClick={() => {
              try {
                window.location.reload();
              } catch (reloadError) {
                console.error('Error reloading page:', reloadError);
                try {
                  window.location.href = '/';
                } catch (redirectError) {
                  console.error('Error redirecting:', redirectError);
                }
              }
            }}
          >
            Reload Page
          </Button>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
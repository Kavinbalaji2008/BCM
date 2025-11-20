import React, { useEffect } from 'react';
import { Box, Typography, Container } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Business } from '@mui/icons-material';

function LandingPage() {
  const navigate = useNavigate();

  useEffect(() => {
    try {
      const timer = setTimeout(() => {
        try {
          if (typeof navigate === 'function') {
            navigate('/login');
          } else {
            // Fallback navigation
            window.location.href = '/login';
          }
        } catch (navError) {
          console.error('Navigation error:', navError);
          // Fallback to direct navigation
          window.location.href = '/login';
        }
      }, 3000);

      return () => {
        try {
          clearTimeout(timer);
        } catch (error) {
          console.error('Error clearing timer:', error);
        }
      };
    } catch (error) {
      console.error('Error in LandingPage useEffect:', error);
      // Immediate fallback navigation
      try {
        window.location.href = '/login';
      } catch (fallbackError) {
        console.error('Fallback navigation failed:', fallbackError);
      }
    }
  }, [navigate]);

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 50%, #334155 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Large Animated Background Circle */}
      <Box
        sx={{
          position: 'absolute',
          top: '-20%',
          left: '-20%',
          width: '800px',
          height: '800px',
          background: 'radial-gradient(circle, #0EA5E9 0%, #3B82F6 50%, #6366F1 100%)',
          borderRadius: '50%',
          opacity: 0.05,
          animation: 'megaFloat 25s ease-in-out infinite'
        }}
      />

      {/* Large Animated Triangle */}
      <Box
        sx={{
          position: 'absolute',
          bottom: '-15%',
          right: '-15%',
          width: '600px',
          height: '600px',
          opacity: 0.08,
          animation: 'triangleRotate 20s linear infinite'
        }}
      >
        <svg viewBox="0 0 600 600" width="600" height="600">
          <polygon 
            points="300,50 550,450 50,450" 
            fill="#10B981" 
            fillOpacity="0.2"
            stroke="#10B981" 
            strokeWidth="3"
          />
        </svg>
      </Box>

      {/* Floating Orb */}
      <Box
        sx={{
          position: 'absolute',
          top: '10%',
          right: '15%',
          width: '300px',
          height: '300px',
          background: 'linear-gradient(45deg, #F59E0B, #EAB308, #CA8A04)',
          borderRadius: '50%',
          opacity: 0.1,
          animation: 'orbFloat 12s ease-in-out infinite',
          filter: 'blur(1px)'
        }}
      />

      <Container maxWidth="sm">
        <Box
          textAlign="center"
          sx={{
            position: 'relative',
            zIndex: 1
          }}
        >
          <Box sx={{ mb: 4 }}>
            <Business
              sx={{
                fontSize: 120,
                color: '#0EA5E9',
                filter: 'drop-shadow(0 8px 20px rgba(14, 165, 233, 0.4))'
              }}
            />
          </Box>

          <Typography
            variant="h1"
            sx={{
              fontWeight: 700,
              color: '#F8FAFC',
              mb: 2,
              textShadow: '0 4px 20px rgba(14, 165, 233, 0.3)',
              letterSpacing: '4px',
              fontSize: '4rem'
            }}
          >
            BCM
          </Typography>

          <Typography
            variant="h4"
            sx={{
              fontWeight: 400,
              color: '#0EA5E9',
              mb: 4,
              textShadow: '0 2px 10px rgba(14, 165, 233, 0.2)'
            }}
          >
            Business Contact Manager
          </Typography>

          <Typography
            variant="h6"
            sx={{
              color: '#64748B',
              fontStyle: 'italic'
            }}
          >
            Loading...
          </Typography>
        </Box>
      </Container>

      {/* CSS Animations with error handling */}
      <style>
{`
              @keyframes megaFloat {
                0%, 100% { 
                  transform: translate(0px, 0px) scale(1);
                  opacity: 0.05;
                }
                50% { 
                  transform: translate(50px, -30px) scale(1.1);
                  opacity: 0.08;
                }
              }
              
              @keyframes triangleRotate {
                0% { 
                  transform: rotate(0deg);
                  opacity: 0.08;
                }
                50% { 
                  opacity: 0.12;
                }
                100% { 
                  transform: rotate(360deg);
                  opacity: 0.08;
                }
              }
              
              @keyframes orbFloat {
                0%, 100% { 
                  transform: translateY(0px) scale(1);
                  opacity: 0.1;
                }
                50% { 
                  transform: translateY(-40px) scale(1.2);
                  opacity: 0.15;
                }
              }
            `}
      </style>
    </Box>
  );
}

export default LandingPage;
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { signupUser } from "../services/api";
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Divider,
  InputAdornment,
  IconButton,
} from "@mui/material";
import { 
  Person, 
  Email, 
  Lock, 
  Business, 
  Visibility, 
  VisibilityOff 
} from "@mui/icons-material";
import { toast } from "react-toastify";

function SignupPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    company: "",
  });
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const sanitizeInput = (input) => {
    if (typeof input !== 'string') return input;
    return input.replace(/<script[^>]*>.*?<\/script>/gi, '')
                .replace(/<[^>]*>/g, '')
                .replace(/javascript:/gi, '')
                .replace(/on\w+=/gi, '');
  };

  const handleChange = (e) => {
    try {
      if (!e?.target) return;
      const { name, value } = e.target;
      if (!name) return;
      const sanitizedValue = sanitizeInput(value);
      setFormData({ ...formData, [name]: sanitizedValue });
    } catch (error) {
      console.error('Error handling form change:', error);
    }
  };

  const validateForm = () => {
    const errors = [];
    
    if (!formData.name?.trim()) {
      errors.push('Name is required');
    } else if (formData.name.length < 2) {
      errors.push('Name must be at least 2 characters');
    } else if (formData.name.length > 50) {
      errors.push('Name must be less than 50 characters');
    }
    
    if (!formData.email?.trim()) {
      errors.push('Email is required');
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        errors.push('Please enter a valid email address');
      }
    }
    
    if (!formData.password?.trim()) {
      errors.push('Password is required');
    } else if (formData.password.length < 6) {
      errors.push('Password must be at least 6 characters');
    } else if (formData.password.length > 100) {
      errors.push('Password must be less than 100 characters');
    }
    
    if (formData.company && formData.company.length > 100) {
      errors.push('Company name must be less than 100 characters');
    }
    
    return errors;
  };

  const handleSubmit = async (e) => {
    try {
      e?.preventDefault();
      setError("");
      
      const validationErrors = validateForm();
      if (validationErrors.length > 0) {
        const errorMsg = validationErrors[0];
        setError(errorMsg);
        toast.error(`❌ ${errorMsg}`);
        return;
      }
      
      toast.info("Creating your account...");
      await signupUser(formData);
      toast.success("✅ Account created successfully!");
      
      try {
        if (typeof navigate === 'function') {
          navigate("/login");
        } else {
          window.location.href = "/login";
        }
      } catch (navError) {
        console.error('Navigation error:', navError);
        window.location.href = "/login";
      }
    } catch (err) {
      console.error('Signup error:', err);
      const errorMsg = err?.response?.data?.message || err?.message || "Signup failed. Please try again.";
      setError(errorMsg);
      toast.error(`❌ ${errorMsg}`);
    }
  };

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #F8FAFC 0%, #E2E8F0 50%, #CBD5E1 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      p: 2,
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Large Animated Spiral */}
      <Box
        sx={{
          position: 'absolute',
          top: '-25%',
          right: '-25%',
          width: '900px',
          height: '900px',
          opacity: 0.06,
          animation: 'spiralRotate 30s linear infinite'
        }}
      >
        <svg viewBox="0 0 900 900" width="900" height="900">
          <path 
            d="M450,50 Q700,200 600,450 Q400,700 450,450 Q500,200 450,50" 
            fill="none" 
            stroke="url(#spiralGradient)" 
            strokeWidth="8"
          />
          <defs>
            <linearGradient id="spiralGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#10B981" stopOpacity="0.4"/>
              <stop offset="50%" stopColor="#059669" stopOpacity="0.3"/>
              <stop offset="100%" stopColor="#047857" stopOpacity="0.2"/>
            </linearGradient>
          </defs>
        </svg>
      </Box>

      {/* Large Floating Square */}
      <Box
        sx={{
          position: 'absolute',
          bottom: '-20%',
          left: '-20%',
          width: '700px',
          height: '700px',
          background: 'linear-gradient(45deg, #EC4899, #F472B6, #FB7185)',
          transform: 'rotate(25deg)',
          opacity: 0.08,
          animation: 'squareFloat 18s ease-in-out infinite',
          borderRadius: '50px'
        }}
      />

      {/* Animated Wave */}
      <Box
        sx={{
          position: 'absolute',
          top: '20%',
          left: '5%',
          width: '400px',
          height: '300px',
          opacity: 0.1,
          animation: 'waveMotion 14s ease-in-out infinite'
        }}
      >
        <svg viewBox="0 0 400 300" width="400" height="300">
          <path 
            d="M0,150 Q100,50 200,150 T400,150 L400,300 L0,300 Z" 
            fill="url(#waveGradient2)"
          />
          <defs>
            <linearGradient id="waveGradient2" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.5"/>
              <stop offset="50%" stopColor="#EAB308" stopOpacity="0.4"/>
              <stop offset="100%" stopColor="#CA8A04" stopOpacity="0.3"/>
            </linearGradient>
          </defs>
        </svg>
      </Box>

      <Container maxWidth="sm" sx={{ position: 'relative', zIndex: 1 }}>
        <Paper elevation={20} sx={{ 
          p: 6, 
          borderRadius: 4, 
          backgroundColor: "rgba(255, 255, 255, 0.95)",
          backdropFilter: "blur(20px)",
          boxShadow: "0 25px 50px rgba(16, 185, 129, 0.15)",
          border: '1px solid rgba(16, 185, 129, 0.1)'
        }}>
          <Box textAlign="center" mb={4}>
            <Business sx={{ fontSize: 60, color: "#10B981", mb: 2 }} />
            <Typography variant="h3" sx={{ fontWeight: 600, color: "#0F172A", mb: 1 }}>
              Join Us
            </Typography>
            <Typography variant="body1" sx={{ color: "#64748B" }}>
              Create your account
            </Typography>
          </Box>

          {error && (
            <Typography color="error" variant="body2" textAlign="center" sx={{ mb: 2 }}>
              {error}
            </Typography>
          )}

          <form onSubmit={handleSubmit}>
            <TextField
              label="Full Name"
              name="name"
              fullWidth
              margin="normal"
              value={formData.name}
              onChange={handleChange}
              required
              variant="outlined"
              inputProps={{ maxLength: 50 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Person sx={{ color: "#10B981" }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 3,
                  backgroundColor: '#F8FAFC',
                  '&:hover fieldset': { borderColor: '#10B981' },
                  '&.Mui-focused fieldset': { borderColor: '#10B981', borderWidth: '2px' }
                }
              }}
            />
            
            <TextField
              label="Email Address"
              name="email"
              type="email"
              fullWidth
              margin="normal"
              value={formData.email}
              onChange={handleChange}
              required
              variant="outlined"
              inputProps={{ maxLength: 100 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Email sx={{ color: "#10B981" }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 3,
                  backgroundColor: '#F8FAFC',
                  '&:hover fieldset': { borderColor: '#10B981' },
                  '&.Mui-focused fieldset': { borderColor: '#10B981', borderWidth: '2px' }
                }
              }}
            />
            
            <TextField
              label="Company (Optional)"
              name="company"
              fullWidth
              margin="normal"
              value={formData.company}
              onChange={handleChange}
              variant="outlined"
              inputProps={{ maxLength: 100 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Business sx={{ color: "#10B981" }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 3,
                  backgroundColor: '#F8FAFC',
                  '&:hover fieldset': { borderColor: '#10B981' },
                  '&.Mui-focused fieldset': { borderColor: '#10B981', borderWidth: '2px' }
                }
              }}
            />
            
            <TextField
              label="Password"
              name="password"
              type={showPassword ? "text" : "password"}
              fullWidth
              margin="normal"
              value={formData.password}
              onChange={handleChange}
              required
              variant="outlined"
              inputProps={{ maxLength: 100 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock sx={{ color: "#10B981" }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 3,
                  backgroundColor: '#F8FAFC',
                  '&:hover fieldset': { borderColor: '#10B981' },
                  '&.Mui-focused fieldset': { borderColor: '#10B981', borderWidth: '2px' }
                }
              }}
            />

            <Button 
              variant="contained" 
              type="submit" 
              fullWidth
              sx={{ 
                mt: 4, 
                py: 2,
                borderRadius: 3,
                background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                fontSize: '1.2rem',
                fontWeight: 600,
                textTransform: 'none',
                boxShadow: '0 8px 25px rgba(16, 185, 129, 0.3)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 12px 35px rgba(16, 185, 129, 0.4)'
                },
                transition: 'all 0.3s ease'
              }}
            >
              Create Account
            </Button>
          </form>

          <Divider sx={{ my: 4, borderColor: '#E2E8F0' }} />

          <Typography variant="body2" textAlign="center" sx={{ color: "#64748B" }}>
            Already have an account?{' '}
            <Link 
              to="/login" 
              style={{ 
                color: '#10B981', 
                textDecoration: 'none',
                fontWeight: 600
              }}
            >
              Sign in here
            </Link>
          </Typography>
        </Paper>
      </Container>


    </Box>
  );
}

export default SignupPage;
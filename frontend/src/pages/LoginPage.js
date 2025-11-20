import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { loginUser, forgotPassword, resetPassword } from "../services/api";
import { Container, TextField, Button, Typography, Box, Paper, Divider, InputAdornment, IconButton } from "@mui/material";
import { Visibility, VisibilityOff, Email, Lock, Business } from "@mui/icons-material";
import { toast } from "react-toastify";

function LoginPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState(0);
  const [forgotEmail, setForgotEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const handleChange = React.useCallback((e) => {
    try {
      if (!e?.target) return;
      const { name, value } = e.target;
      if (!name) return;
      setFormData(prev => ({ ...prev, [name]: value }));
    } catch (error) {
      console.error('Error handling form change:', error);
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    try {
      if (!formData.email?.trim() || !formData.password?.trim()) {
        const errorMsg = "Email and password are required";
        toast.error(`❌ ${errorMsg}`);
        setError(errorMsg);
        return;
      }
      
      toast.info("Logging in...");
      const res = await loginUser(formData);
      const token = res.token || res.data?.token;
      const userData = res.data?.user || res.data;
      
      if (token) {
        try {
          if (typeof Storage !== 'undefined' && localStorage) {
            localStorage.setItem("jwtToken", token);
            if (userData) {
              localStorage.setItem("userData", JSON.stringify(userData));
            }
          }
        } catch (storageError) {
          console.error('Error saving to localStorage:', storageError);
        }
        toast.success("✅ Login successful!");
        try {
          if (typeof navigate === 'function') {
            navigate("/dashboard");
          } else {
            window.location.href = "/dashboard";
          }
        } catch (navError) {
          console.error('Navigation error:', navError);
          window.location.href = "/dashboard";
        }
      } else {
        toast.error("❌ Login failed: Invalid response from server");
        setError("Login failed: no token returned");
      }
    } catch (err) {
      console.error('Login error:', err);
      const errorMsg = err.response?.data?.message || "Invalid email or password";
      toast.error(`❌ ${errorMsg}`);
      setError(errorMsg);
    }
  };

  const handleSendOTP = async () => {
    try {
      if (!forgotEmail?.trim()) {
        toast.error("❌ Email is required");
        return;
      }
      
      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(forgotEmail)) {
        toast.error("❌ Please enter a valid email address");
        return;
      }
      
      toast.info("Sending OTP...");
      const res = await forgotPassword(forgotEmail);
      if (!res || !res.data) {
        throw new Error("Failed to send OTP");
      }
      toast.success("✉️ OTP sent to your email!");
      setStep(2);
    } catch (err) {
      console.error('Send OTP error:', err);
      const errorMsg = err.response?.data?.message || "Failed to send OTP";
      toast.error(`❌ ${errorMsg}`);
    }
  };

  const handleResetPassword = async () => {
    try {
      if (!otp?.trim() || !newPassword?.trim()) {
        toast.error("❌ OTP and new password are required");
        return;
      }
      
      toast.info("Resetting password...");
      const res = await resetPassword(forgotEmail, otp, newPassword);
      if (!res.data) throw new Error("Failed to reset password");
      toast.success("🔐 Password changed successfully!");
      setStep(0);
      setForgotEmail("");
      setOtp("");
      setNewPassword("");
    } catch (err) {
      console.error('Reset password error:', err);
      const errorMsg = err.response?.data?.message || "Failed to reset password";
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
            fill="url(#triangleGradient)" 
            stroke="#10B981" 
            strokeWidth="3"
          />
          <defs>
            <linearGradient id="triangleGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#10B981" stopOpacity="0.3"/>
              <stop offset="50%" stopColor="#059669" stopOpacity="0.2"/>
              <stop offset="100%" stopColor="#047857" stopOpacity="0.1"/>
            </linearGradient>
          </defs>
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

      <Container maxWidth="sm" sx={{ position: 'relative', zIndex: 1 }}>
        <Paper elevation={20} sx={{ 
          p: 6, 
          borderRadius: 4, 
          backgroundColor: "rgba(255, 255, 255, 0.95)",
          backdropFilter: "blur(20px)",
          boxShadow: "0 25px 50px rgba(14, 165, 233, 0.15)",
          border: '1px solid rgba(14, 165, 233, 0.1)'
        }}>
          {step === 0 && (
            <>
              <Box textAlign="center" mb={4}>
                <Business sx={{ fontSize: 60, color: "#0EA5E9", mb: 2 }} />
                <Typography variant="h3" sx={{ fontWeight: 600, color: "#0F172A", mb: 1 }}>
                  Welcome Back
                </Typography>
                <Typography variant="body1" sx={{ color: "#64748B" }}>
                  Sign in to your account
                </Typography>
              </Box>
              
              <form onSubmit={handleLogin}>
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
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Email sx={{ color: "#0EA5E9" }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 3,
                      backgroundColor: '#F8FAFC',
                      '&:hover fieldset': { borderColor: '#0EA5E9' },
                      '&.Mui-focused fieldset': { borderColor: '#0EA5E9', borderWidth: '2px' }
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
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock sx={{ color: "#0EA5E9" }} />
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
                      '&:hover fieldset': { borderColor: '#0EA5E9' },
                      '&.Mui-focused fieldset': { borderColor: '#0EA5E9', borderWidth: '2px' }
                    }
                  }}
                />
                
                {error && (
                  <Typography color="error" variant="body2" textAlign="center" sx={{ mt: 2 }}>
                    {error}
                  </Typography>
                )}
                
                <Button 
                  variant="contained" 
                  type="submit" 
                  fullWidth
                  sx={{ 
                    mt: 4, 
                    py: 2,
                    borderRadius: 3,
                    background: 'linear-gradient(135deg, #0EA5E9 0%, #3B82F6 100%)',
                    fontSize: '1.2rem',
                    fontWeight: 600,
                    textTransform: 'none',
                    boxShadow: '0 8px 25px rgba(14, 165, 233, 0.3)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #0284C7 0%, #2563EB 100%)',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 12px 35px rgba(14, 165, 233, 0.4)'
                    },
                    transition: 'all 0.3s ease'
                  }}
                >
                  Sign In
                </Button>
              </form>
              
              <Box textAlign="center" mt={3}>
                <Typography
                  variant="body2"
                  sx={{ 
                    cursor: "pointer", 
                    color: "#0EA5E9", 
                    fontWeight: 500,
                    '&:hover': { textDecoration: 'underline', color: '#0284C7' }
                  }}
                  onClick={() => setStep(1)}
                >
                  Forgot your password?
                </Typography>
              </Box>
              
              <Divider sx={{ my: 4, borderColor: '#E2E8F0' }} />
              
              <Typography variant="body2" textAlign="center" sx={{ color: "#64748B" }}>
                Don't have an account?{' '}
                <Link 
                  to="/signup" 
                  style={{ 
                    color: '#0EA5E9', 
                    textDecoration: 'none',
                    fontWeight: 600
                  }}
                >
                  Create one here
                </Link>
              </Typography>
            </>
          )}

          {step === 1 && (
            <>
              <Box textAlign="center" mb={4}>
                <Email sx={{ fontSize: 60, color: "#0EA5E9", mb: 2 }} />
                <Typography variant="h4" sx={{ fontWeight: 600, color: "#0F172A", mb: 1 }}>
                  Reset Password
                </Typography>
                <Typography variant="body1" sx={{ color: "#64748B" }}>
                  Enter your email to receive a reset code
                </Typography>
              </Box>
              
              <TextField
                label="Email Address"
                type="email"
                fullWidth
                margin="normal"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                required
                variant="outlined"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Email sx={{ color: "#0EA5E9" }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 3,
                    backgroundColor: '#F8FAFC',
                    '&:hover fieldset': { borderColor: '#0EA5E9' },
                    '&.Mui-focused fieldset': { borderColor: '#0EA5E9', borderWidth: '2px' }
                  }
                }}
              />
              
              <Button 
                variant="contained" 
                onClick={handleSendOTP}
                fullWidth
                sx={{ 
                  mt: 4, 
                  py: 2,
                  borderRadius: 3,
                  background: 'linear-gradient(135deg, #0EA5E9 0%, #3B82F6 100%)',
                  fontSize: '1.2rem',
                  fontWeight: 600,
                  textTransform: 'none'
                }}
              >
                Send Reset Code
              </Button>
              
              <Box textAlign="center" mt={3}>
                <Typography
                  variant="body2"
                  sx={{ 
                    cursor: "pointer", 
                    color: "#0EA5E9",
                    fontWeight: 500,
                    '&:hover': { textDecoration: 'underline' }
                  }}
                  onClick={() => setStep(0)}
                >
                  ← Back to Sign In
                </Typography>
              </Box>
            </>
          )}

          {step === 2 && (
            <>
              <Box textAlign="center" mb={4}>
                <Lock sx={{ fontSize: 60, color: "#0EA5E9", mb: 2 }} />
                <Typography variant="h4" sx={{ fontWeight: 600, color: "#0F172A", mb: 1 }}>
                  Create New Password
                </Typography>
                <Typography variant="body1" sx={{ color: "#64748B" }}>
                  Enter the code and your new password
                </Typography>
              </Box>
              
              <TextField
                label="Verification Code"
                type="text"
                fullWidth
                margin="normal"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
                variant="outlined"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 3,
                    backgroundColor: '#F8FAFC',
                    '&:hover fieldset': { borderColor: '#0EA5E9' },
                    '&.Mui-focused fieldset': { borderColor: '#0EA5E9', borderWidth: '2px' }
                  }
                }}
              />
              <TextField
                label="New Password"
                type="password"
                fullWidth
                margin="normal"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                variant="outlined"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock sx={{ color: "#0EA5E9" }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 3,
                    backgroundColor: '#F8FAFC',
                    '&:hover fieldset': { borderColor: '#0EA5E9' },
                    '&.Mui-focused fieldset': { borderColor: '#0EA5E9', borderWidth: '2px' }
                  }
                }}
              />
              
              <Button 
                variant="contained" 
                onClick={handleResetPassword}
                fullWidth
                sx={{ 
                  mt: 4, 
                  py: 2,
                  borderRadius: 3,
                  background: 'linear-gradient(135deg, #0EA5E9 0%, #3B82F6 100%)',
                  fontSize: '1.2rem',
                  fontWeight: 600,
                  textTransform: 'none'
                }}
              >
                Update Password
              </Button>
              
              <Box textAlign="center" mt={3}>
                <Typography
                  variant="body2"
                  sx={{ 
                    cursor: "pointer", 
                    color: "#0EA5E9",
                    fontWeight: 500,
                    '&:hover': { textDecoration: 'underline' }
                  }}
                  onClick={() => setStep(0)}
                >
                  ← Back to Sign In
                </Typography>
              </Box>
            </>
          )}
        </Paper>
      </Container>


    </Box>
  );
}

export default LoginPage;
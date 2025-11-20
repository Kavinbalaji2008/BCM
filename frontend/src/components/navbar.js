import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import LoginIcon from "@mui/icons-material/Login";
import AppRegistrationIcon from "@mui/icons-material/AppRegistration";
import LogoutIcon from "@mui/icons-material/Logout";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  
  const isLoggedIn = (() => {
    try {
      if (typeof Storage !== 'undefined' && localStorage) {
        const token = localStorage.getItem("jwtToken");
        // Basic token validation
        if (token && typeof token === 'string' && token.trim().length > 0) {
          return token;
        }
      }
      return null;
    } catch (error) {
      console.error('Error accessing localStorage:', error);
      return null;
    }
  })();
  
  const isDashboard = location?.pathname === "/dashboard";


  const handleLogout = () => {
    try {
      if (typeof Storage !== 'undefined' && localStorage) {
        localStorage.removeItem("jwtToken");
      }
      if (typeof navigate === 'function') {
        navigate("/login");
      } else {
        window.location.href = "/login";
      }
    } catch (error) {
      console.error('Error during logout:', error);
      try {
        window.location.href = "/login";
      } catch (redirectError) {
        console.error('Error redirecting to login:', redirectError);
      }
    }
  };

  return (
    <AppBar position="static" color="primary">
      <Toolbar style={{ display: "flex", justifyContent: "space-between" }}>
        {/* Left: Logo & Title */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <AccountCircleIcon />
          <Typography variant="h6">Business Contacts Manager</Typography>
        </div>

        {/* Right: Buttons */}
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          {/* Show Login/Signup only when NOT on dashboard AND NOT logged in */}
          {!isDashboard && !isLoggedIn && (
            <>
              <Button color="inherit" component={Link} to="/login" startIcon={<LoginIcon />}>
                Login
              </Button>
              <Button color="inherit" component={Link} to="/signup" startIcon={<AppRegistrationIcon />}>
                Signup
              </Button>
            </>
          )}
          {/* Show Logout only when on dashboard OR logged in, but NOT on auth pages */}
          {isDashboard && isLoggedIn && (
            <Button color="inherit" onClick={handleLogout} startIcon={<LogoutIcon />}>
              Logout
            </Button>
          )}
        </div>
      </Toolbar>
    </AppBar>
  );
}

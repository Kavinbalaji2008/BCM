import React from "react";
import { Navigate } from "react-router-dom";

export default function PrivateRoute({ children }) {
  try {
    // Validate children prop
    if (!children) {
      console.error('PrivateRoute: children prop is required');
      return <Navigate to="/login" replace />;
    }
    
    let token = null;
    if (typeof Storage !== 'undefined' && localStorage) {
      token = localStorage.getItem("jwtToken"); // same key as login
    }
    
    // Additional token validation
    if (!token || typeof token !== 'string' || token.trim() === '') {
      console.warn('No valid authentication token found');
      return <Navigate to="/login" replace />;
    }
    
    // Basic JWT format validation (should have 3 parts)
    try {
      const tokenParts = token.split('.');
      if (tokenParts.length !== 3) {
        console.warn('Invalid token format');
        return <Navigate to="/login" replace />;
      }
    } catch (tokenError) {
      console.error('Error validating token format:', tokenError);
      return <Navigate to="/login" replace />;
    }
    
    return children;
  } catch (error) {
    console.error('Error checking authentication:', error);
    return <Navigate to="/login" replace />;
  }
}

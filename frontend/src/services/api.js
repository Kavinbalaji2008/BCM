// src/services/api.js
import axios from "axios";

// Allow overriding the backend URL via environment variable (useful for dev/prod)
const BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:4000/api";

// ✅ Get token from local storage (support both keys if present)
const getToken = () => {
  try {
    if (typeof Storage !== 'undefined' && localStorage) {
      return localStorage.getItem("jwtToken") || localStorage.getItem("token");
    }
    return null;
  } catch (error) {
    console.error('Error accessing localStorage:', error);
    return null;
  }
};

// Axios instance
export const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// ✅ Add token to every request if available
api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    // Log request details in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`🚀 ${config.method.toUpperCase()} ${config.url}`, {
        headers: config.headers,
        data: config.data
      });
    }
  } else {
    console.warn(`⚠️ No token for ${config.method.toUpperCase()} ${config.url}`);
  }
  return config;
});

// Optional: log base URL in dev to help debugging network issues
if (process.env.NODE_ENV === "development") {
  // eslint-disable-next-line no-console
  console.info("API base URL:", BASE_URL);
}

// ========================== AUTH ==========================
export const signupUser = async (data) => {
  try {
    if (process.env.NODE_ENV === 'development') {
      console.log("📝 Attempting signup with data:", data);
    }
    const res = await api.post("/user/signup", data);
    console.log("✅ Signup successful:", res.data);
    return res;
  } catch (error) {
    console.error("❌ Signup failed:", {
      status: error.response?.status,
      data: error.response?.data,
      message: error.response?.data?.message
    });
    throw error;
  }
};
export const loginUser = async (data) => {
  try {
    console.log("🔑 Attempting login...");
    const res = await api.post("/user/login", data);
    console.log("✅ Login response:", {
      data: res.data,
      headers: res.headers,
      status: res.status,
      config: {
        url: res.config.url,
        baseURL: res.config.baseURL,
        headers: res.config.headers
      }
    });
    return res;
  } catch (error) {
    console.error("❌ Login failed:", {
      status: error.response?.status,
      data: error.response?.data,
      config: error.config
    });
    throw error;
  }
};

export const forgotPassword = async (email) => {
  try {
    console.log("📧 Sending forgot password request for:", email);
    const res = await api.post("/user/forgot-password", { email });
    console.log("✅ Forgot password request sent successfully");
    return res;
  } catch (error) {
    console.error("❌ Forgot password failed:", {
      status: error.response?.status,
      data: error.response?.data
    });
    throw error;
  }
};

export const resetPassword = async (email, otp, newPassword) => {
  try {
    console.log("🔐 Resetting password for:", email);
    const res = await api.post("/user/reset-password", { email, otp, newPassword });
    console.log("✅ Password reset successful");
    return res;
  } catch (error) {
    console.error("❌ Password reset failed:", {
      status: error.response?.status,
      data: error.response?.data
    });
    throw error;
  }
};

// ========================== PROFILE ==========================
export const getUserProfile = async () => {
  const token = getToken();
  console.log("🔐 Auth token present:", !!token);
  if (!token) {
    console.warn("⚠️ No auth token found");
    return { name: "Not logged in", email: "", company: "", role: "" };
  }

  // Optimized endpoint discovery - try most likely endpoints first
  const primaryEndpoints = ["/user/profile", "/user/me"];
  const fallbackEndpoints = ["/users/profile", "/users/me", "/auth/profile", "/profile"];
  
  // Try primary endpoints first (most likely to work)
  for (const endpoint of primaryEndpoints) {
    try {
      console.log(`🔍 Trying primary endpoint: ${endpoint}`);
      const res = await api.get(endpoint);
      
      if (res?.data) {
        console.log(`✅ Success with ${endpoint}:`, res.data);
        return res.data.user || res.data;
      }
    } catch (error) {
      console.log(`❌ Primary endpoint ${endpoint} failed:`, error.response?.status);
      // Continue to next primary endpoint
    }
  }
  
  // If primary endpoints fail, try fallback endpoints
  let lastError = null;
  for (const endpoint of fallbackEndpoints) {
    try {
      console.log(`🔍 Trying fallback endpoint: ${endpoint}`);
      const res = await api.get(endpoint);
      
      if (res?.data) {
        console.log(`✅ Success with fallback ${endpoint}:`, res.data);
        return res.data.user || res.data;
      }
    } catch (error) {
      lastError = error;
      console.log(`❌ Fallback endpoint ${endpoint} failed:`, error.response?.status);
    }
  }

  // All endpoints failed
  console.error("❌ All profile endpoints failed. Last error:", {
    message: lastError.message,
    status: lastError.response?.status,
    data: lastError.response?.data,
    config: {
      url: lastError.config?.url,
      headers: lastError.config?.headers
    }
  });

  return {
    name: "Loading failed",
    email: "Check network",
    company: "—",
    role: "User",
    error: lastError.response?.data?.message || lastError.message
  };
};

export const uploadProfilePicture = async (file) => {
  try {
    if (!file || !file.type?.startsWith('image/') || file.size > 5000000) {
      throw new Error('Invalid file type or size (max 5MB)');
    }
    
    // SSRF Protection: Validate endpoint
    const endpoint = "/user/upload-profile-picture";
    if (!endpoint.startsWith('/') || endpoint.includes('..') || endpoint.includes('//')) {
      throw new Error('Invalid endpoint');
    }
    
    console.log("📁 Uploading profile picture:", file.name);
    const formData = new FormData();
    formData.append('profilePicture', file);
    
    const token = getToken();
    if (!token) {
      throw new Error('Authentication required');
    }
    
    const res = await api.post(endpoint, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${token}`
      }
    });
    console.log("✅ Profile picture uploaded successfully:", res.data);
    return res.data;
  } catch (error) {
    console.error("❌ Profile picture upload failed:", error);
    throw error;
  }
};

export const updateUserProfile = async (data) => {
  try {
    // SSRF Protection: Validate endpoint
    const endpoint = "/user/profile";
    if (!endpoint.startsWith('/') || endpoint.includes('..') || endpoint.includes('//')) {
      throw new Error('Invalid endpoint');
    }
    
    console.log("📝 Updating profile with data:", data);
    const res = await api.put(endpoint, data);
    console.log("✅ Profile updated successfully:", res.data);
    return res.data;
  } catch (error) {
    console.error("❌ Profile update failed:", {
      status: error.response?.status,
      data: error.response?.data,
      message: error.response?.data?.message
    });
    throw error;
  }
};

// ========================== CONTACTS ==========================
// These aliases make it match your Dashboard.js and ContactForm.js imports
export const getContacts = async () => {
  try {
    console.log('📋 Fetching contacts from backend...');
    const response = await api.get("/contacts");
    console.log('✅ Contacts fetched:', response.data);
    return response;
  } catch (error) {
    console.error('❌ Failed to fetch contacts:', error);
    throw error;
  }
};
export const addContact = async (data) => api.post("/contacts", data);
export const updateContact = async (id, data) => {
  console.log(`📝 Updating contact ${id} with data:`, data);
  try {
    const response = await api.put(`/contacts/${id}`, data);
    console.log('✅ Contact update successful:', response.data);
    return response;
  } catch (error) {
    console.error('❌ Contact update failed:', {
      id,
      url: `/contacts/${id}`,
      status: error.response?.status,
      data: error.response?.data,
      message: error.response?.data?.message
    });
    throw error;
  }
};
export const deleteContact = async (id) => {
  console.log(`🗑️ Attempting to delete contact: /contacts/${id}`);
  try {
    const response = await api.delete(`/contacts/${id}`);
    console.log('✅ Delete successful:', response.data);
    return response;
  } catch (error) {
    console.error('❌ Delete failed:', {
      url: `/contacts/${id}`,
      status: error.response?.status,
      data: error.response?.data
    });
    throw error;
  }
};

// ========================== INTERACTIONS ==========================
export const getInteractions = async () => {
  try {
    console.log("📅 Fetching interactions from backend...");
    const res = await api.get("/interactions");
    console.log("✅ Interactions fetched:", res.data);
    return res.data;
  } catch (error) {
    console.error("❌ Failed to fetch interactions:", error);
    return [];
  }
};

export const updateInteraction = async (id, data) => {
  try {
    console.log(`📝 Updating interaction ${id}:`, data);
    const res = await api.put(`/interactions/${id}`, data);
    console.log("✅ Interaction updated:", res.data);
    return res.data;
  } catch (error) {
    console.error("❌ Failed to update interaction:", error);
    throw error;
  }
};

export const deleteInteraction = async (id) => {
  try {
    console.log(`🗑️ Deleting interaction ${id}`);
    const res = await api.delete(`/interactions/${id}`);
    console.log("✅ Interaction deleted:", res.data);
    return res.data;
  } catch (error) {
    console.error("❌ Failed to delete interaction:", error);
    throw error;
  }
};

export const addInteraction = async (data) => {
  try {
    // Comprehensive SSRF Protection: Validate endpoint
    const endpoint = "/interactions";
    const allowedEndpoints = ['/interactions', '/user/profile', '/contacts', '/auth/profile'];
    
    if (!endpoint || typeof endpoint !== 'string' || 
        !endpoint.startsWith('/') || 
        endpoint.includes('..') || 
        endpoint.includes('//') ||
        endpoint.includes('\\') ||
        /[<>"'`\s]/.test(endpoint) ||
        endpoint.length > 100 ||
        !allowedEndpoints.some(allowed => endpoint.startsWith(allowed))) {
      throw new Error('Invalid or unsafe endpoint');
    }
    
    console.log("📝 Adding interaction:", data);
    const res = await api.post(endpoint, data);
    console.log("✅ Interaction added:", res.data);
    return res.data;
  } catch (error) {
    console.error("❌ Failed to add interaction:", error);
    throw error;
  }
};



// Backwards aliases (if some code used customers previously)
export const getCustomers = getContacts;
export const addCustomer = addContact;
export const updateCustomer = updateContact;
export const deleteCustomer = deleteContact;

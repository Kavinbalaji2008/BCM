import { toast } from "react-toastify";

// Track active toasts to prevent duplicates
const activeToasts = new Set();

const createToast = (type, message, options = {}) => {
  try {
    // Validate inputs
    if (!type || typeof type !== 'string') {
      console.error('Toast type must be a non-empty string');
      return null;
    }
    
    if (!message || typeof message !== 'string') {
      console.error('Toast message must be a non-empty string');
      return null;
    }
    
    if (typeof options !== 'object' || options === null) {
      options = {};
    }
    
    // Performance-optimized sanitization
    let sanitizedMessage;
    try {
      if (typeof message === 'string' && message.length > 0) {
        // Skip regex if no HTML tags for better performance
        sanitizedMessage = message.indexOf('<') === -1 ? 
          message.trim() : 
          message.replace(/<script[^>]*>.*?<\/script>/gi, '')
                 .replace(/<[^>]*>/g, '')
                 .trim();
      } else {
        sanitizedMessage = String(message || '').trim();
      }
    } catch (sanitizeError) {
      console.error('Error sanitizing message:', sanitizeError);
      sanitizedMessage = 'Error processing message';
    }
    
    if (!sanitizedMessage) {
      console.error('Message is empty after sanitization');
      return null;
    }
    
    // Create a unique key for the message
    const key = `${type}-${sanitizedMessage}`;
    
    // If this exact message is already showing, don't show it again
    if (activeToasts.has(key)) {
      return null;
    }
    
    // Validate toast method exists
    if (!toast || !toast[type] || typeof toast[type] !== 'function') {
      console.error(`Invalid toast type: ${type}`);
      return null;
    }
    
    // Add to active toasts
    activeToasts.add(key);
    
    // Show the toast with enhanced error handling
    const toastId = toast[type](sanitizedMessage, {
      ...options,
      onClose: () => {
        try {
          // Remove from active toasts when closed
          activeToasts.delete(key);
          if (options.onClose && typeof options.onClose === 'function') {
            options.onClose();
          }
        } catch (error) {
          console.error('Error in toast onClose handler:', error);
        }
      }
    });
    
    return toastId;
  } catch (error) {
    console.error('Error creating toast:', error);
    return null;
  }
};

export const optimizedToast = {
  success: (message, options) => {
    try {
      return createToast('success', message, options);
    } catch (error) {
      console.error('Error in success toast:', error);
      return null;
    }
  },
  error: (message, options) => {
    try {
      return createToast('error', message, options);
    } catch (error) {
      console.error('Error in error toast:', error);
      return null;
    }
  },
  info: (message, options) => {
    try {
      return createToast('info', message, options);
    } catch (error) {
      console.error('Error in info toast:', error);
      return null;
    }
  },
  warn: (message, options) => {
    try {
      return createToast('warn', message, options);
    } catch (error) {
      console.error('Error in warn toast:', error);
      return null;
    }
  },
  warning: (message, options) => {
    try {
      return createToast('warn', message, options);
    } catch (error) {
      console.error('Error in warning toast:', error);
      return null;
    }
  },
  // Clear all active toasts
  clear: () => {
    try {
      activeToasts.clear();
      if (toast.dismiss && typeof toast.dismiss === 'function') {
        toast.dismiss();
      }
    } catch (error) {
      console.error('Error clearing toasts:', error);
    }
  }
};
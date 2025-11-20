import React from 'react';
import {
  Dialog,
  DialogContent,
  IconButton,
  Box
} from '@mui/material';
import { Close } from '@mui/icons-material';

function ImageViewDialog({ open, onClose, imageSrc, userName }) {
  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{
        sx: { backgroundColor: 'rgba(0,0,0,0.9)' }
      }}
    >
      <DialogContent sx={{ p: 0, position: 'relative' }}>
        <IconButton
          onClick={onClose}
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            color: 'white',
            zIndex: 1
          }}
        >
          <Close />
        </IconButton>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '60vh'
          }}
        >
          <img
            src={imageSrc}
            alt={`${userName || 'User'}'s profile`}
            onError={React.useCallback((e) => {
              try {
                console.error('Error loading image:', imageSrc);
                if (e.target) {
                  e.target.style.display = 'none';
                }
              } catch (error) {
                console.error('Error handling image error:', error);
              }
            }, [imageSrc])}
            onLoad={React.useCallback(() => {
              if (process.env.NODE_ENV === 'development') {
                console.log('Image loaded successfully');
              }
            }, [])}
            style={{
              maxWidth: '100%',
              maxHeight: '80vh',
              objectFit: 'contain'
            }}
          />
        </Box>
      </DialogContent>
    </Dialog>
  );
}

export default ImageViewDialog;
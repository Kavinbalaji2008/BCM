import React, { useState, useRef, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Slider,
  Typography
} from '@mui/material';

function ImageCropDialog({ open, onClose, imageSrc, onCrop }) {
  const canvasRef = useRef(null);
  const imageRef = useRef(null);
  const [crop, setCrop] = useState({ x: 50, y: 50, size: 200 });
  const [scale, setScale] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [imageLoaded, setImageLoaded] = useState(false);

  // Enhanced canvas drawing with better error handling
  const drawCanvas = React.useCallback(() => {
    try {
      const canvas = canvasRef.current;
      if (!canvas) {
        console.error('Canvas ref not available');
        return;
      }
      
      const ctx = canvas.getContext('2d');
      const img = imageRef.current;
      
      if (!ctx) {
        console.error('Canvas context not available');
        return;
      }
      
      if (!img) {
        console.error('Image ref not available');
        return;
      }

      canvas.width = 400;
      canvas.height = 400;
      
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Validate scale and crop values
      const safeScale = isNaN(scale) || scale <= 0 ? 1 : scale;
      const safeCrop = {
        x: isNaN(crop.x) ? 200 : crop.x,
        y: isNaN(crop.y) ? 200 : crop.y,
        size: isNaN(crop.size) || crop.size <= 0 ? 200 : crop.size
      };
      
      // Draw image scaled
      const imgWidth = img.width * safeScale;
      const imgHeight = img.height * safeScale;
      const x = (canvas.width - imgWidth) / 2;
      const y = (canvas.height - imgHeight) / 2;
      
      ctx.drawImage(img, x, y, imgWidth, imgHeight);
      
      // Draw crop overlay
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Clear crop area
      ctx.globalCompositeOperation = 'destination-out';
      ctx.beginPath();
      ctx.arc(safeCrop.x, safeCrop.y, safeCrop.size / 2, 0, 2 * Math.PI);
      ctx.fill();
      
      // Draw crop circle border
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = '#1976d2';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(safeCrop.x, safeCrop.y, safeCrop.size / 2, 0, 2 * Math.PI);
      ctx.stroke();
    } catch (error) {
      console.error('Error drawing canvas:', error);
    }
  }, [crop, scale]);

  useEffect(() => {
    if (imageSrc && open) {
      try {
        if (typeof imageSrc !== 'string' || !imageSrc.trim()) {
          console.error('Invalid image source');
          setImageLoaded(false);
          return;
        }
        
        const img = new Image();
        img.onload = () => {
          try {
            if (img.width === 0 || img.height === 0) {
              console.error('Invalid image dimensions');
              setImageLoaded(false);
              return;
            }
            imageRef.current = img;
            setImageLoaded(true);
            drawCanvas();
          } catch (error) {
            console.error('Error in image onload:', error);
            setImageLoaded(false);
          }
        };
        img.onerror = (error) => {
          console.error('Failed to load image:', error);
          setImageLoaded(false);
        };
        img.src = imageSrc;
      } catch (error) {
        console.error('Error loading image:', error);
        setImageLoaded(false);
      }
    } else {
      setImageLoaded(false);
    }
  }, [imageSrc, open, drawCanvas]);

  useEffect(() => {
    if (imageLoaded) {
      drawCanvas();
    }
  }, [crop, scale, imageLoaded, drawCanvas]);



  const handleMouseDown = (e) => {
    try {
      if (!canvasRef.current) return;
      const rect = canvasRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      // Check if click is inside crop circle
      const distance = Math.sqrt((x - crop.x) ** 2 + (y - crop.y) ** 2);
      if (distance <= crop.size / 2) {
        setIsDragging(true);
        setDragStart({ x: x - crop.x, y: y - crop.y });
      }
    } catch (error) {
      console.error('Error handling mouse down:', error);
    }
  };

  const handleMouseMove = React.useCallback((e) => {
    try {
      if (!isDragging || !canvasRef.current || !e) return;
      
      const rect = canvasRef.current.getBoundingClientRect();
      if (!rect) return;
      
      const x = e.clientX - rect.left - (dragStart.x || 0);
      const y = e.clientY - rect.top - (dragStart.y || 0);
      
      // Validate crop size with enhanced error handling
      const safeSize = isNaN(crop.size) || crop.size <= 0 ? 200 : crop.size;
      const radius = safeSize / 2;
      
      // Keep crop circle within canvas bounds
      const newX = Math.max(radius, Math.min(400 - radius, x));
      const newY = Math.max(radius, Math.min(400 - radius, y));
      
      if (!isNaN(newX) && !isNaN(newY) && isFinite(newX) && isFinite(newY)) {
        setCrop(prev => ({ ...prev, x: newX, y: newY }));
      } else {
        console.error('Invalid coordinates calculated:', { newX, newY });
      }
    } catch (error) {
      console.error('Error handling mouse move:', error);
    }
  }, [isDragging, dragStart, crop.size]);

  const handleMouseUp = () => {
    try {
      setIsDragging(false);
    } catch (error) {
      console.error('Error handling mouse up:', error);
    }
  };

  const handleCrop = async () => {
    try {
      const canvas = canvasRef.current;
      const img = imageRef.current;
      
      if (!canvas || !img) return;
      
      // Create crop canvas
      const cropCanvas = document.createElement('canvas');
      const cropCtx = cropCanvas.getContext('2d');
      
      if (!cropCtx) {
        console.error('Failed to get canvas context');
        return;
      }
      
      cropCanvas.width = crop.size;
      cropCanvas.height = crop.size;
      
      // Calculate source coordinates
      const imgWidth = img.width * scale;
      const imgHeight = img.height * scale;
      const imgX = (400 - imgWidth) / 2;
      const imgY = (400 - imgHeight) / 2;
      
      const sourceX = (crop.x - crop.size / 2 - imgX) / scale;
      const sourceY = (crop.y - crop.size / 2 - imgY) / scale;
      const sourceSize = crop.size / scale;
      
      // Draw cropped image
      cropCtx.drawImage(
        img,
        sourceX, sourceY, sourceSize, sourceSize,
        0, 0, crop.size, crop.size
      );
      
      // Optimized blob creation with timeout
      const blobPromise = new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Blob creation timeout'));
        }, 5000);
        
        try {
          cropCanvas.toBlob((blob) => {
            clearTimeout(timeout);
            try {
              if (blob && blob.type?.startsWith('image/') && blob.size > 0) {
                resolve(blob);
              } else {
                reject(new Error('Invalid blob generated'));
              }
            } catch (blobError) {
              reject(blobError);
            }
          }, 'image/jpeg', 0.9);
        } catch (toBlobError) {
          clearTimeout(timeout);
          reject(toBlobError);
        }
      });
      
      try {
        const blob = await blobPromise;
        onCrop(blob);
      } catch (error) {
        console.error('Error creating cropped image:', error);
      }
    } catch (error) {
      console.error('Error cropping image:', error);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Crop Profile Picture</DialogTitle>
      <DialogContent>
        <Box sx={{ textAlign: 'center', mb: 2 }}>
          <canvas
            ref={canvasRef}
            style={{
              border: '1px solid #ccc',
              cursor: isDragging ? 'grabbing' : 'grab',
              maxWidth: '100%'
            }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          />
        </Box>
        
        <Box sx={{ mb: 2 }}>
          <Typography gutterBottom>Zoom</Typography>
          <Slider
            value={scale}
            onChange={(e, value) => setScale(value)}
            min={0.5}
            max={3}
            step={0.1}
            valueLabelDisplay="auto"
          />
        </Box>
        
        <Box sx={{ mb: 2 }}>
          <Typography gutterBottom>Crop Size</Typography>
          <Slider
            value={crop.size}
            onChange={(e, value) => setCrop(prev => ({ ...prev, size: value }))}
            min={100}
            max={300}
            step={10}
            valueLabelDisplay="auto"
          />
        </Box>
        
        <Typography variant="body2" color="textSecondary" align="center">
          Drag the circle to position your crop area
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleCrop} variant="contained" disabled={!imageLoaded}>
          Crop & Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default ImageCropDialog;
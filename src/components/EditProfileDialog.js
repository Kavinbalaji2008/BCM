import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Box,
  Divider,
  Avatar,
  IconButton,
  FormControlLabel,
  Switch
} from '@mui/material';
import { PhotoCamera } from '@mui/icons-material';
import ImageCropDialog from './ImageCropDialog';
import ImageViewDialog from './ImageViewDialog';

function EditProfileDialog({ open, onClose, user, onSave }) {
  const [formData, setFormData] = useState(() => {
    try {
      return {
        name: user?.name || '',
        email: user?.email || '',
        profilePicture: user?.profilePicture || '',
        phoneNumber: user?.phoneNumber || '',
        dateOfBirth: user?.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split('T')[0] : '',
        gender: user?.gender || '',
        company: user?.company || '',
        jobTitle: user?.jobTitle || '',
        bio: user?.bio || '',
        address: {
          street: user?.address?.street || '',
          city: user?.address?.city || '',
          state: user?.address?.state || '',
          country: user?.address?.country || '',
          postalCode: user?.address?.postalCode || ''
        },
        socialLinks: {
          linkedin: user?.socialLinks?.linkedin || '',
          twitter: user?.socialLinks?.twitter || '',
          facebook: user?.socialLinks?.facebook || '',
          instagram: user?.socialLinks?.instagram || ''
        },
        preferences: {
          language: user?.preferences?.language || 'English',
          notifications: user?.preferences?.notifications ?? true,
          theme: user?.preferences?.theme || 'light'
        }
      };
    } catch (error) {
      console.error('Error initializing form data:', error);
      return {
        name: '', email: '', profilePicture: '', phoneNumber: '', dateOfBirth: '',
        gender: '', company: '', jobTitle: '', bio: '',
        address: { street: '', city: '', state: '', country: '', postalCode: '' },
        socialLinks: { linkedin: '', twitter: '', facebook: '', instagram: '' },
        preferences: { language: 'English', notifications: true, theme: 'light' }
      };
    }
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [cropDialogOpen, setCropDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [tempImageSrc, setTempImageSrc] = useState('');


  const handleChange = React.useCallback((e) => {
    try {
      if (!e?.target) return;
      
      const { name, value, type, checked } = e.target;
      let finalValue = type === 'checkbox' ? checked : value;
      
      // Sanitize string inputs to prevent XSS
      if (typeof finalValue === 'string') {
        finalValue = sanitizeInput(finalValue);
      }
      
      if (name?.includes('.')) {
        const [category, field] = name.split('.');
        if (category && field) {
          setFormData(prev => ({
            ...prev,
            [category]: {
              ...prev[category],
              [field]: finalValue
            }
          }));
        }
      } else if (name) {
        setFormData(prev => ({ ...prev, [name]: finalValue }));
      }
    } catch (error) {
      console.error('Error updating form data:', error);
    }
  }, []);

  const sanitizeInput = (input) => {
    if (typeof input !== 'string') return input;
    return input.replace(/<script[^>]*>.*?<\/script>/gi, '')
                .replace(/<[^>]*>/g, '')
                .replace(/javascript:/gi, '')
                .replace(/on\w+=/gi, '');
  };

  const handleProfilePictureChange = (e) => {
    try {
      const file = e.target.files?.[0];
      if (!file) return;
      
      // Enhanced file validation
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type) || file.size > 5000000) {
        console.error('Invalid file type or size');
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const result = event.target?.result;
          if (!result || typeof result !== 'string') {
            console.error('Invalid file reader result');
            return;
          }
          
          // Enhanced XSS protection with strict validation
          const isValidImage = result.startsWith('data:image/') &&
                              result.length < 10000000 && // 10MB limit
                              result.length > 100 && // Minimum size check
                              /^data:image\/(jpeg|jpg|png|gif|webp);base64,[A-Za-z0-9+/=]+$/.test(result) &&
                              !result.includes('<') && // No HTML tags
                              !result.includes('script') && // No script
                              !result.includes('data:text/'); // No text data URLs
          
          if (isValidImage) {
            setTempImageSrc(result);
            setCropDialogOpen(true);
          } else {
            console.error('Invalid or unsafe image data');
          }
        } catch (error) {
          console.error('Error processing file result:', error);
        }
      };
      reader.onerror = (error) => {
        console.error('File read error:', error);
      };
      
      try {
        reader.readAsDataURL(file);
      } catch (readError) {
        console.error('Error initiating file read:', readError);
      }
    } catch (error) {
      console.error('Error handling file:', error);
    }
  };

  const handleCrop = (croppedBlob) => {
    try {
      if (!croppedBlob || !croppedBlob.type?.startsWith('image/')) {
        console.error('Invalid cropped image');
        return;
      }
      
      setSelectedFile(croppedBlob);
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const result = e.target?.result;
          if (!result || typeof result !== 'string') {
            console.error('Invalid file reader result');
            return;
          }
          
          // Enhanced XSS protection and validation
          const isValidImage = result.startsWith('data:image/') &&
                              result.length < 10000000 && // 10MB limit
                              result.length > 100 && // Minimum size check
                              /^data:image\/(jpeg|jpg|png|gif|webp);base64,[A-Za-z0-9+/=]+$/.test(result);
          
          if (isValidImage) {
            setFormData(prev => ({ ...prev, profilePicture: result }));
          } else {
            console.error('Invalid or unsafe cropped image data');
          }
        } catch (error) {
          console.error('Error processing cropped image result:', error);
        }
      };
      reader.onerror = (error) => {
        console.error('Error reading cropped image:', error);
      };
      
      try {
        reader.readAsDataURL(croppedBlob);
      } catch (readError) {
        console.error('Error initiating file read:', readError);
      }
    } catch (error) {
      console.error('Error processing cropped image:', error);
    } finally {
      setCropDialogOpen(false);
    }
  };

  const handleSave = () => {
    try {
      if (!formData.name?.trim()) {
        console.error('Name is required');
        return;
      }
      
      if (typeof onSave !== 'function') {
        console.error('onSave is not a function');
        return;
      }
      
      const dataToSave = { ...formData };
      if (selectedFile) {
        dataToSave.profilePictureFile = selectedFile;
      }
      onSave(dataToSave);
      
      if (typeof onClose === 'function') {
        onClose();
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      // Ensure dialog closes on error
      if (typeof onClose === 'function') {
        onClose();
      }
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Typography variant="h5" component="div">
          Edit Profile
        </Typography>
      </DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={3}>
          {/* Profile Picture */}
          <Grid item xs={12}>
            <Box display="flex" alignItems="center" gap={2} mb={2}>
              <Avatar
                src={formData.profilePicture}
                onClick={() => formData.profilePicture && setViewDialogOpen(true)}
                sx={{ 
                  width: 80, 
                  height: 80,
                  cursor: formData.profilePicture ? 'pointer' : 'default',
                  '&:hover': formData.profilePicture ? {
                    opacity: 0.8,
                    transform: 'scale(1.05)'
                  } : {}
                }}
              >
                {formData.name?.charAt(0)?.toUpperCase()}
              </Avatar>
              <Box>
                <input
                  accept="image/*"
                  style={{ display: 'none' }}
                  id="profile-picture-upload"
                  type="file"
                  onChange={handleProfilePictureChange}
                />
                <label htmlFor="profile-picture-upload">
                  <IconButton color="primary" component="span">
                    <PhotoCamera />
                  </IconButton>
                </label>
                <Typography variant="body2" color="textSecondary">
                  Click camera icon to change profile picture
                </Typography>
              </Box>
            </Box>
          </Grid>

          {/* Basic Information */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>Basic Information</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Full Name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Email"
                  name="email"
                  value={formData.email}
                  type="email"
                  disabled
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Phone Number"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Gender</InputLabel>
                  <Select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    label="Gender"
                  >
                    <MenuItem value="Male">Male</MenuItem>
                    <MenuItem value="Female">Female</MenuItem>
                    <MenuItem value="Other">Other</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Date of Birth"
                  name="dateOfBirth"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
              </Grid>
            </Grid>
          </Grid>

          {/* Professional Information */}
          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
            <Typography variant="h6" gutterBottom>Professional Information</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Company"
                  name="company"
                  value={formData.company}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Job Title"
                  name="jobTitle"
                  value={formData.jobTitle}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Bio"
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  multiline
                  rows={3}
                />
              </Grid>
            </Grid>
          </Grid>

          {/* Address */}
          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
            <Typography variant="h6" gutterBottom>Address</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Street"
                  name="address.street"
                  value={formData.address.street}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="City"
                  name="address.city"
                  value={formData.address.city}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="State"
                  name="address.state"
                  value={formData.address.state}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Country"
                  name="address.country"
                  value={formData.address.country}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Postal Code"
                  name="address.postalCode"
                  value={formData.address.postalCode}
                  onChange={handleChange}
                />
              </Grid>
            </Grid>
          </Grid>

          {/* Social Links */}
          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
            <Typography variant="h6" gutterBottom>Social Links</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="LinkedIn"
                  name="socialLinks.linkedin"
                  value={formData.socialLinks.linkedin}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Twitter"
                  name="socialLinks.twitter"
                  value={formData.socialLinks.twitter}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Facebook"
                  name="socialLinks.facebook"
                  value={formData.socialLinks.facebook}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Instagram"
                  name="socialLinks.instagram"
                  value={formData.socialLinks.instagram}
                  onChange={handleChange}
                />
              </Grid>
            </Grid>
          </Grid>

          {/* Preferences */}
          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
            <Typography variant="h6" gutterBottom>Preferences</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Language</InputLabel>
                  <Select
                    name="preferences.language"
                    value={formData.preferences.language}
                    onChange={handleChange}
                    label="Language"
                  >
                    <MenuItem value="English">English</MenuItem>
                    <MenuItem value="Spanish">Spanish</MenuItem>
                    <MenuItem value="French">French</MenuItem>
                    <MenuItem value="German">German</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Theme</InputLabel>
                  <Select
                    name="preferences.theme"
                    value={formData.preferences.theme}
                    onChange={handleChange}
                    label="Theme"
                  >
                    <MenuItem value="light">Light</MenuItem>
                    <MenuItem value="dark">Dark</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      name="preferences.notifications"
                      checked={formData.preferences.notifications}
                      onChange={handleChange}
                    />
                  }
                  label="Enable Notifications"
                />
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave} variant="contained" color="primary">
          Save Changes
        </Button>
      </DialogActions>
      
      <ImageCropDialog
        open={cropDialogOpen}
        onClose={() => setCropDialogOpen(false)}
        imageSrc={tempImageSrc}
        onCrop={handleCrop}
      />
      
      <ImageViewDialog
        open={viewDialogOpen}
        onClose={() => setViewDialogOpen(false)}
        imageSrc={formData.profilePicture}
        userName={formData.name}
      />
    </Dialog>
  );
}

export default EditProfileDialog;
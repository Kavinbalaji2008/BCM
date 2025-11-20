// src/components/ProfileDialog.js
import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Button,
  Box,
  Avatar,
  Chip
} from "@mui/material";
import EditProfileDialog from "./EditProfileDialog";
import ImageViewDialog from "./ImageViewDialog";

function ProfileDialog({ open, onClose, user, onProfileUpdate }) {
  const [editOpen, setEditOpen] = useState(false);
  const [viewImageOpen, setViewImageOpen] = useState(false);

  const handleEditSave = (updatedData) => {
    try {
      if (!updatedData) {
        console.error('No updated data provided');
        return;
      }
      if (typeof onProfileUpdate !== 'function') {
        console.error('onProfileUpdate is not a function');
        return;
      }
      onProfileUpdate(updatedData);
      setEditOpen(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      // Ensure dialog closes even on error
      setEditOpen(false);
    }
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={2}>
            <Avatar
              src={user?.profilePicture}
              onClick={() => user?.profilePicture && setViewImageOpen(true)}
              sx={{ 
                width: 60, 
                height: 60,
                cursor: user?.profilePicture ? 'pointer' : 'default',
                '&:hover': user?.profilePicture ? {
                  opacity: 0.8,
                  transform: 'scale(1.05)'
                } : {}
              }}
            >
              {user?.name?.charAt(0)?.toUpperCase()}
            </Avatar>
            <Box>
              <Typography variant="h6">{user?.name}</Typography>
              <Typography variant="body2" color="textSecondary">
                {user?.jobTitle} {user?.company && `at ${user.company}`}
              </Typography>
            </Box>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          <Box mb={2}>
            <Typography variant="h6" gutterBottom>Contact Information</Typography>
            <Typography variant="body2"><strong>Email:</strong> {user?.email}</Typography>
            <Typography variant="body2"><strong>Phone:</strong> {user?.phoneNumber || "—"}</Typography>
            {user?.dateOfBirth && (
              <Typography variant="body2">
                <strong>Date of Birth:</strong> {(() => {
                  try {
                    return new Date(user.dateOfBirth).toLocaleDateString();
                  } catch (error) {
                    console.error('Error formatting date:', error);
                    return 'Invalid date';
                  }
                })()}
              </Typography>
            )}
            {user?.gender && (
              <Typography variant="body2"><strong>Gender:</strong> {user.gender}</Typography>
            )}
          </Box>

          {user?.bio && (
            <Box mb={2}>
              <Typography variant="h6" gutterBottom>Bio</Typography>
              <Typography variant="body2">{user.bio}</Typography>
            </Box>
          )}

          {(user?.address?.city || user?.address?.country) && (
            <Box mb={2}>
              <Typography variant="h6" gutterBottom>Location</Typography>
              <Typography variant="body2">
                {[user.address?.city, user.address?.state, user.address?.country]
                  .filter(Boolean)
                  .join(", ")}
              </Typography>
            </Box>
          )}

          {(user?.socialLinks?.linkedin || user?.socialLinks?.twitter || 
            user?.socialLinks?.facebook || user?.socialLinks?.instagram) && (
            <Box mb={2}>
              <Typography variant="h6" gutterBottom>Social Links</Typography>
              <Box display="flex" gap={1} flexWrap="wrap">
                {user.socialLinks?.linkedin && (
                  <Chip label="LinkedIn" size="small" color="primary" />
                )}
                {user.socialLinks?.twitter && (
                  <Chip label="Twitter" size="small" color="info" />
                )}
                {user.socialLinks?.facebook && (
                  <Chip label="Facebook" size="small" color="primary" />
                )}
                {user.socialLinks?.instagram && (
                  <Chip label="Instagram" size="small" color="secondary" />
                )}
              </Box>
            </Box>
          )}

          <Box>
            <Typography variant="h6" gutterBottom>Preferences</Typography>
            <Typography variant="body2">
              <strong>Language:</strong> {user?.preferences?.language || "English"}
            </Typography>
            <Typography variant="body2">
              <strong>Theme:</strong> {user?.preferences?.theme || "Light"}
            </Typography>
            <Typography variant="body2">
              <strong>Notifications:</strong> {user?.preferences?.notifications ? "Enabled" : "Disabled"}
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Close</Button>
          <Button 
            onClick={() => setEditOpen(true)} 
            variant="contained" 
            color="primary"
          >
            Edit Profile
          </Button>
        </DialogActions>
      </Dialog>

      <EditProfileDialog
        open={editOpen}
        onClose={() => setEditOpen(false)}
        user={user}
        onSave={handleEditSave}
      />
      
      <ImageViewDialog
        open={viewImageOpen}
        onClose={() => setViewImageOpen(false)}
        imageSrc={user?.profilePicture}
        userName={user?.name}
      />
    </>
  );
}

export default ProfileDialog;

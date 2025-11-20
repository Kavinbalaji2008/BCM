// src/components/ContactCard.js
import React from "react";
import { Paper, Typography, Box, Button, Divider } from "@mui/material";
import { deleteContact } from "../services/api";

function ContactCard({ contact, onEdit, onRefresh }) {
  // Validate props
  if (!contact || typeof contact !== 'object') {
    console.error('ContactCard: Invalid contact prop');
    return null;
  }

  // Constants for user messages
  const MESSAGES = {
    CONFIRM_DELETE: "Are you sure you want to delete this contact?",
    SUCCESS: "Contact deleted successfully!",
    ERROR: "Failed to delete contact.",
    INVALID_DATA: "Cannot delete contact: Invalid contact data"
  };

  const handleDelete = async () => {
    try {
      // Validate contact data
      if (!contact._id) {
        console.error('Contact ID is missing');
        alert(MESSAGES.INVALID_DATA);
        return;
      }
      
      // Get user confirmation
      const userConfirmed = window.confirm(MESSAGES.CONFIRM_DELETE);
      if (!userConfirmed) return;

      // Delete contact
      await deleteContact(contact._id);
      alert(MESSAGES.SUCCESS);
      
      // Refresh the contact list
      if (typeof onRefresh === 'function') {
        onRefresh();
      } else {
        console.error('onRefresh callback is not a function');
      }
    } catch (err) {
      console.error("❌ Error deleting contact:", err);
      const errorMsg = err?.response?.data?.message || err?.message || MESSAGES.ERROR;
      alert(errorMsg);
    }
  };

  const handleEdit = () => {
    try {
      if (typeof onEdit === 'function') {
        onEdit();
      } else {
        console.error('onEdit is not a function');
      }
    } catch (error) {
      console.error('Error in edit handler:', error);
    }
  };

  return (
    <Paper sx={{ p: 2, boxShadow: 3 }}>
      <Typography variant="h6">{contact.name || 'Unknown Contact'}</Typography>
      {contact.company && <Typography>{contact.company}</Typography>}
      {contact.emails?.length > 0 && (
        <Box>
          {contact.emails.filter(email => email && typeof email === 'string').map((email, idx) => (
            <Typography key={`email-${idx}`} variant="body2">
              {email}
            </Typography>
          ))}
        </Box>
      )}
      {contact.phones?.length > 0 && (
        <Box>
          {contact.phones.filter(phone => phone && typeof phone === 'string').map((phone, idx) => (
            <Typography key={`phone-${idx}`} variant="body2">
              {phone}
            </Typography>
          ))}
        </Box>
      )}
      {contact.address && <Typography>{contact.address}</Typography>}
      <Typography
        sx={{
          bgcolor: "#e3f2fd",
          px: 1,
          borderRadius: 1,
          display: "inline-block",
          mt: 1,
        }}
      >
        {contact.category || 'Unknown'}
      </Typography>

      <Divider sx={{ my: 1 }} />

      <Box sx={{ display: "flex", gap: 1 }}>
        <Button variant="outlined" size="small" onClick={handleEdit}>
          Edit
        </Button>
        <Button variant="outlined" size="small" color="error" onClick={handleDelete}>
          Delete
        </Button>
      </Box>
    </Paper>
  );
}

export default ContactCard;

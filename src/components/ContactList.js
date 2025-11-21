import React from "react";
import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  Divider, 
  Avatar, 
  Chip,
  IconButton,
  Grid
} from "@mui/material";
import { 
  Edit, 
  Delete, 
  Email, 
  Phone, 
  LocationOn, 
  Business 
} from "@mui/icons-material";

function ContactList({ contacts, handleEdit, handleDelete }) {
  // Validate props with enhanced logging
  if (!Array.isArray(contacts)) {
    if (process.env.NODE_ENV === 'development') {
      console.error('ContactList: contacts prop must be an array, received:', typeof contacts);
    }
    return null;
  }
  
  if (!contacts.length) {
    return (
      <Card sx={{ 
        borderRadius: 3,
        boxShadow: '0 8px 25px rgba(14, 165, 233, 0.08)',
        border: '1px solid rgba(14, 165, 233, 0.1)'
      }}>
        <CardContent sx={{ textAlign: 'center', py: 8 }}>
          <Business sx={{ fontSize: 80, color: '#0EA5E9', mb: 3 }} />
          <Typography variant="h5" color="#0F172A" gutterBottom fontWeight="600">
            No Contacts Found
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Start building your network by adding your first contact
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Grid container spacing={3}>
      {contacts.map((contact, index) => {
        if (!contact || typeof contact !== 'object') {
          if (process.env.NODE_ENV === 'development') {
            console.error('Invalid contact data at index:', index, contact);
          }
          return null;
        }
        
        const contactKey = contact._id || contact.id || `contact-${index}`;
        
        return (
        <Grid item xs={12} sm={6} lg={4} key={contactKey}>
          <Card sx={{ 
            height: '100%',
            borderRadius: 3,
            boxShadow: '0 8px 25px rgba(14, 165, 233, 0.08)',
            border: '1px solid rgba(14, 165, 233, 0.1)',
            transition: 'all 0.3s ease',
            '&:hover': {
              transform: 'translateY(-8px)',
              boxShadow: '0 16px 40px rgba(14, 165, 233, 0.15)',
              border: '1px solid rgba(14, 165, 233, 0.2)'
            }
          }}>
            <CardContent sx={{ p: 3 }}>
              <Box display="flex" alignItems="center" mb={2}>
                <Avatar sx={{ 
                  bgcolor: "#0EA5E9",
                  width: 56,
                  height: 56,
                  mr: 2,
                  fontSize: '1.5rem',
                  fontWeight: 700,
                  boxShadow: '0 8px 25px rgba(14, 165, 233, 0.3)'
                }}>
                  {(() => {
                    try {
                      return contact.name?.charAt(0)?.toUpperCase() || '?';
                    } catch (error) {
                      console.error('Error getting contact initial:', error);
                      return '?';
                    }
                  })()}
                </Avatar>
                <Box flex={1}>
                  <Typography variant="h6" fontWeight="700" color="#0F172A" gutterBottom>
                    {contact.name || 'Unknown Contact'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" fontWeight="500">
                    {contact.company || 'No Company'}
                  </Typography>
                </Box>
              </Box>

              <Divider sx={{ my: 2, borderColor: '#E2E8F0' }} />

              <Box mb={2}>
                {contact.emails?.slice(0, 2).map((email, idx) => {
                  if (!email || typeof email !== 'string') return null;
                  return (
                  <Box key={`email-${idx}`} display="flex" alignItems="center" mb={1}>
                    <Email sx={{ fontSize: 18, color: '#10B981', mr: 1 }} />
                    <Typography variant="body2" color="text.secondary" sx={{ 
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      {email}
                    </Typography>
                  </Box>
                  );
                })}

                {contact.phones?.slice(0, 2).map((phone, idx) => {
                  if (!phone || typeof phone !== 'string') return null;
                  return (
                  <Box key={`phone-${idx}`} display="flex" alignItems="center" mb={1}>
                    <Phone sx={{ fontSize: 18, color: '#F59E0B', mr: 1 }} />
                    <Typography variant="body2" color="text.secondary">
                      {phone}
                    </Typography>
                  </Box>
                  );
                })}

                {contact.address && (
                  <Box display="flex" alignItems="center" mb={1}>
                    <LocationOn sx={{ fontSize: 18, color: '#EC4899', mr: 1 }} />
                    <Typography variant="body2" color="text.secondary" sx={{ 
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      {contact.address}
                    </Typography>
                  </Box>
                )}
              </Box>

              <Box display="flex" justifyContent="space-between" alignItems="center" mt={2}>
                <Chip 
                  label={contact.category || 'Unknown'}
                  sx={{
                    background: contact.category === "Client" ? 
                      'linear-gradient(135deg, #0EA5E9 0%, #3B82F6 100%)' :
                      contact.category === "Vendor" ? 
                      'linear-gradient(135deg, #10B981 0%, #059669 100%)' : 
                      'linear-gradient(135deg, #F59E0B 0%, #EAB308 100%)',
                    color: 'white',
                    fontWeight: 600,
                    fontSize: '0.75rem'
                  }}
                />
                
                <Box>
                  <IconButton
                    size="small"
                    onClick={() => {
                      try {
                        if (!contact) {
                          console.error('Invalid contact data');
                          return;
                        }
                        if (typeof handleEdit !== 'function') {
                          console.error('Edit handler not available');
                          return;
                        }
                        handleEdit(contact);
                      } catch (error) {
                        console.error('Error editing contact:', error);
                      }
                    }}
                    sx={{ 
                      mr: 1,
                      color: '#0EA5E9',
                      '&:hover': { 
                        backgroundColor: 'rgba(14, 165, 233, 0.1)',
                        transform: 'scale(1.1)'
                      }
                    }}
                  >
                    <Edit fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => {
                      try {
                        if (!contact?._id) {
                          console.error('Invalid contact ID');
                          return;
                        }
                        if (typeof handleDelete !== 'function') {
                          console.error('Delete handler not available');
                          return;
                        }
                        try {
                          handleDelete(contact._id);
                        } catch (deleteError) {
                          if (process.env.NODE_ENV === 'development') {
                            console.error('Error executing delete handler:', deleteError);
                          }
                        }
                      } catch (error) {
                        console.error('Error deleting contact:', error);
                      }
                    }}
                    sx={{ 
                      color: '#EF4444',
                      '&:hover': { 
                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                        transform: 'scale(1.1)'
                      }
                    }}
                  >
                    <Delete fontSize="small" />
                  </IconButton>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        );
      }).filter(Boolean)}
    </Grid>
  );
}

export default ContactList;
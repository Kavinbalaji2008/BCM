import React, { useState, useEffect } from "react";
import {
  TextField,
  Button,
  Box,
  Select,
  MenuItem,
  IconButton,
  Typography,
} from "@mui/material";
import { addContact, updateContact } from "../services/api";
import { FaPlus, FaMinus } from "react-icons/fa";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function ContactForm({ contact, onSuccess, onCancel }) {
  const [form, setForm] = useState({
    name: "",
    company: "",
    emails: [""],
    phones: [""],
    address: "",
    category: "Client",
  });

  // Populate form if editing
  useEffect(() => {
    if (contact) {
      // Handle both old and new schema formats
      const emails = contact.emails?.length ? contact.emails : 
                    contact.email ? [contact.email] : [""];
      const phones = contact.phones?.length ? contact.phones : 
                    contact.phone ? [contact.phone] : [""];
      
      setForm({
        name: contact.name || "",
        company: contact.company || "",
        emails,
        phones,
        address: contact.address || "",
        category: contact.category || "Client",
      });
    }
  }, [contact]);

  // Enhanced input sanitization to prevent XSS
  const sanitizeInput = React.useCallback((input, preserveSpaces = false) => {
    try {
      if (typeof input !== 'string') return input;
      const sanitized = input.replace(/<script[^>]*>.*?<\/script>/gi, '')
                  .replace(/<iframe[^>]*>.*?<\/iframe>/gi, '')
                  .replace(/<object[^>]*>.*?<\/object>/gi, '')
                  .replace(/<embed[^>]*>.*?<\/embed>/gi, '')
                  .replace(/<[^>]*>/g, '')
                  .replace(/javascript:/gi, '')
                  .replace(/vbscript:/gi, '')
                  .replace(/data:/gi, '')
                  .replace(/on\w+=/gi, '')
                  .replace(/expression\(/gi, '')
                  .replace(/url\(/gi, '');
      return preserveSpaces ? sanitized : sanitized.trim();
    } catch (error) {
      console.error('Error sanitizing input:', error);
      return String(input || '');
    }
  }, []);

  const handleChange = React.useCallback((e) => {
    try {
      if (!e?.target) return;
      const { name, value } = e.target;
      if (!name) return;
      const preserveSpaces = name === 'address';
      const sanitizedValue = sanitizeInput(value, preserveSpaces);
      setForm(prev => ({ ...prev, [name]: sanitizedValue }));
    } catch (error) {
      console.error('Error handling form change:', error);
    }
  }, [sanitizeInput]);

  const handleArrayChange = React.useCallback((index, value, field) => {
    try {
      if (!form[field] || !Array.isArray(form[field]) || index < 0 || index >= form[field].length) {
        console.error('Invalid array operation:', { field, index, arrayLength: form[field]?.length });
        return;
      }
      const sanitizedValue = sanitizeInput(value);
      const updated = [...form[field]];
      updated[index] = sanitizedValue;
      setForm(prev => ({ ...prev, [field]: updated }));
    } catch (error) {
      console.error('Error updating array field:', error);
    }
  }, [form, sanitizeInput]);

  const addArrayField = (field) => {
    try {
      if (!form[field] || !Array.isArray(form[field])) {
        console.error('Invalid field for array operation:', field);
        return;
      }
      setForm({ ...form, [field]: [...form[field], ""] });
    } catch (error) {
      console.error('Error adding array field:', error);
    }
  };
  
  const removeArrayField = (field, index) => {
    try {
      if (!form[field] || !Array.isArray(form[field]) || index < 0 || index >= form[field].length) {
        console.error('Invalid array operation:', { field, index, arrayLength: form[field]?.length });
        return;
      }
      const updated = [...form[field]];
      updated.splice(index, 1);
      setForm({ ...form, [field]: updated.length ? updated : [""] });
    } catch (error) {
      console.error('Error removing array field:', error);
    }
  };

  // Enhanced form validation
  const validateForm = React.useCallback(() => {
    try {
      if (!form.name?.trim()) {
        toast.error("Name is required!");
        return false;
      }
      if (form.name.length > 100) {
        toast.error("Name must be less than 100 characters!");
        return false;
      }
      // Validate emails
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      for (const email of form.emails) {
        if (email.trim() && !emailRegex.test(email)) {
          toast.error(`Invalid email format: ${email}`);
          return false;
        }
      }
      return true;
    } catch (error) {
      console.error('Error validating form:', error);
      return false;
    }
  }, [form]);

  const handleSubmit = async (e) => {
    try {
      e?.preventDefault();
      
      if (!validateForm()) return;
      
      if (typeof onSuccess !== 'function') {
        console.error('onSuccess callback is not a function');
        return;
      }
      
      const contactData = {
        ...form,
        emails: form.emails.filter(email => email.trim()),
        phones: form.phones.filter(phone => phone.trim())
      };
      
      if (contact?._id) {
        await updateContact(contact._id, contactData);
        toast.success("✅ Contact updated successfully!");
      } else {
        await addContact(contactData);
        toast.success("✅ Contact added successfully!");
      }
      onSuccess();
    } catch (err) {
      console.error('Error saving contact:', err);
      const errorMsg = err?.response?.data?.error || err?.message || "Error saving contact";
      toast.error(`❌ ${errorMsg}`);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2, mb: 3 }}>
      <TextField label="Name" name="name" fullWidth value={form.name} onChange={handleChange} required />
      <TextField label="Company" name="company" fullWidth value={form.company} onChange={handleChange} />

      {/* Emails */}
      <Typography mt={2}>Emails</Typography>
      {form.emails.map((email, i) => (
        <Box key={i} sx={{ display: "flex", alignItems: "center", mt: 1 }}>
          <TextField
            label={`Email ${i + 1}`}
            value={email}
            onChange={(e) => handleArrayChange(i, e.target.value, "emails")}
            fullWidth
          />
          <IconButton onClick={() => removeArrayField("emails", i)}>
            <FaMinus />
          </IconButton>
          {i === form.emails.length - 1 && (
            <IconButton onClick={() => addArrayField("emails")}>
              <FaPlus />
            </IconButton>
          )}
        </Box>
      ))}

      {/* Phones */}
      <Typography mt={2}>Phones</Typography>
      {form.phones.map((phone, i) => (
        <Box key={i} sx={{ display: "flex", alignItems: "center", mt: 1 }}>
          <TextField
            label={`Phone ${i + 1}`}
            value={phone}
            onChange={(e) => handleArrayChange(i, e.target.value, "phones")}
            fullWidth
          />
          <IconButton onClick={() => removeArrayField("phones", i)}>
            <FaMinus />
          </IconButton>
          {i === form.phones.length - 1 && (
            <IconButton onClick={() => addArrayField("phones")}>
              <FaPlus />
            </IconButton>
          )}
        </Box>
      ))}

      <TextField label="Address" name="address" fullWidth value={form.address} onChange={handleChange} sx={{ mt: 2 }} />

      <Select
        name="category"
        value={form.category}
        onChange={handleChange}
        fullWidth
        sx={{ mt: 2 }}
      >
        <MenuItem value="Client">Client</MenuItem>
        <MenuItem value="Vendor">Vendor</MenuItem>
        <MenuItem value="Partner">Partner</MenuItem>
      </Select>

      <Box mt={3} sx={{ display: "flex", gap: 2 }}>
        <Button variant="contained" type="submit">
          {contact?._id ? "Update" : "Add"} Contact
        </Button>
        <Button 
          variant="outlined" 
          onClick={() => {
            try {
              if (typeof onCancel === 'function') {
                onCancel();
              } else {
                console.error('onCancel callback is not a function');
              }
            } catch (error) {
              console.error('Error in cancel handler:', error);
            }
          }}
        >
          Cancel
        </Button>
      </Box>
    </Box>
  );
}

export default ContactForm;

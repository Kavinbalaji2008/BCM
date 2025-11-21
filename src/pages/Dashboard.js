import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Avatar,
  Chip,
  IconButton,
  Paper,
  LinearProgress,
  Fab,
  Toolbar,
  Menu,
  MenuItem,
  Divider,
  List,
  ListItem,
  ListItemText,
  InputAdornment,
  Select,
  FormControl,
  InputLabel,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import {
  Add,
  Search,
  FilterList,
  Notifications,

  People,
  Analytics,
  Business,
  TrendingUp,
  Phone,
  Email,
  LocationOn,
  MoreVert,
  Brightness4,
  Brightness7,
  ExitToApp,
  AccountCircle,
  Schedule,
  Event,
  Save,
  Cancel,
  Edit,
  Delete,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { optimizedToast as toast } from "../utils/toastUtils";
import {
  getContacts,
  deleteContact,
  getUserProfile,
  updateUserProfile,
  uploadProfilePicture,
  addInteraction,
  getInteractions,
  updateInteraction,
  deleteInteraction,
} from "../services/api";

import ContactForm from "../components/ContactForm";
import ContactList from "../components/ContactList";
import AnalyticsWidget from "../components/AnalyticsWidget";
import ProfileDialog from "../components/ProfileDialog";
import Sidebar from "../components/Sidebar";
import TaskManager from "../components/TaskManager";

function Dashboard() {
  const navigate = useNavigate();
  const [contacts, setContacts] = useState([]);
  const [editingContact, setEditingContact] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [userProfile, setUserProfile] = useState({});
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");

  const [anchorEl, setAnchorEl] = useState(null);
  const [activeView, setActiveView] = useState("dashboard");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");
  const [interactions, setInteractions] = useState([]);

  
  const fetchInteractions = useCallback(async () => {
    try {
      const backendInteractions = await getInteractions();
      console.log('Fetched interactions:', backendInteractions); // Debug log
      if (Array.isArray(backendInteractions) && backendInteractions.length > 0) {
        setInteractions(backendInteractions);
      } else {
        // Fall back to localStorage if no backend data
        const savedInteractions = localStorage.getItem('bcm_interactions');
        if (savedInteractions) {
          try {
            const parsed = JSON.parse(savedInteractions);
            if (Array.isArray(parsed)) {
              setInteractions(parsed);
            }
          } catch (err) {
            console.error('Failed to parse saved interactions:', err);
            localStorage.removeItem('bcm_interactions');
          }
        }
      }
    } catch (error) {
      console.error('Failed to fetch interactions from backend:', error);
      // Fall back to localStorage
      const savedInteractions = localStorage.getItem('bcm_interactions');
      if (savedInteractions) {
        try {
          const parsed = JSON.parse(savedInteractions);
          if (Array.isArray(parsed)) {
            setInteractions(parsed);
          }
        } catch (err) {
          console.error('Failed to parse saved interactions:', err);
          localStorage.removeItem('bcm_interactions');
        }
      }
    }
  }, []);

  // Fetch interactions on component mount
  useEffect(() => {
    fetchInteractions();
  }, [fetchInteractions]);

  useEffect(() => {
    try {
      if (interactions.length >= 0 && typeof Storage !== 'undefined' && localStorage) {
        localStorage.setItem('bcm_interactions', JSON.stringify(interactions));
      }
    } catch (error) {
      console.error('Failed to save interactions to localStorage:', error);
    }
  }, [interactions]);

  // Calculate today's activities for notifications
  const todaysActivities = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return interactions.filter(interaction => {
      const dateField = interaction.scheduledDate || interaction.date;
      if (!dateField) return false;
      try {
        const interactionDate = new Date(dateField);
        if (isNaN(interactionDate.getTime())) return false;
        interactionDate.setHours(0, 0, 0, 0);
        return interactionDate.getTime() === today.getTime();
      } catch (error) {
        console.error('Error parsing interaction date:', error);
        return false;
      }
    });
  }, [interactions]);

  useEffect(() => {
    setTodayNotifications(todaysActivities.length);
  }, [todaysActivities]);

  const [notificationAnchor, setNotificationAnchor] = useState(null);
  const [todayNotifications, setTodayNotifications] = useState(0);
  const [scheduleDialog, setScheduleDialog] = useState(false);
  const [editingInteraction, setEditingInteraction] = useState(null);
  const [scheduleForm, setScheduleForm] = useState({
    type: 'meeting',
    title: '',
    description: '',
    scheduledDate: '',
    scheduledTime: '',
    contactId: '',
    location: ''
  });

  const [stats, setStats] = useState({
    totalContacts: 0,
    clients: 0,
    vendors: 0,
    partners: 0,
    recentActivity: 0,
  });

  const fetchContacts = useCallback(async () => {
    try {
      const res = await getContacts();
      if (res?.data && Array.isArray(res.data)) {
        setContacts(res.data);
      } else {
        console.error('Invalid contacts data received');
        setContacts([]);
        toast.error('Invalid contacts data received');
      }
    } catch (err) {
      console.error("❌ Error fetching contacts:", err);
      setContacts([]);
      toast.error("Failed to fetch contacts.");
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("jwtToken");
    if (!token) {
      toast.warn("Please login to continue!");
      navigate("/login");
    } else {
      fetchProfile();
      fetchContacts();
      fetchInteractions();
    }
  }, [navigate, fetchContacts, fetchInteractions]);

  useEffect(() => {
    const totalContacts = contacts.length;
    const clients = contacts.filter(c => c.category === "Client").length;
    const vendors = contacts.filter(c => c.category === "Vendor").length;
    const partners = contacts.filter(c => c.category === "Partner").length;
    
    setStats({
      totalContacts,
      clients,
      vendors,
      partners,
      recentActivity: Math.floor(totalContacts * 0.3),
    });
  }, [contacts]);

  const fetchProfile = async () => {
    try {
      const data = await getUserProfile();
      if (!data) {
        throw new Error('No profile data received');
      }
      if (data.error) {
        throw new Error(data.error);
      }
      setUserProfile(data);
    } catch (err) {
      console.error("❌ Error fetching profile:", err);
      const errorMessage = err?.message || 'Unknown error occurred';
      if (process.env.NODE_ENV === 'development') {
        console.error('Profile fetch error details:', err);
      }
      toast.error(`Failed to load profile: ${errorMessage}`);
      // Set fallback profile data to prevent UI issues
      setUserProfile({ name: 'User', email: '', company: '', role: 'User' });
    }
  };

  const handleScheduleSubmit = useCallback(async () => {
    try {
      // Validate required fields
      if (!scheduleForm.scheduledDate || !scheduleForm.scheduledTime) {
        toast.error('Date and time are required');
        return;
      }
      
      const interactionData = {
        type: scheduleForm.type,
        title: scheduleForm.title,
        description: scheduleForm.description,
        notes: scheduleForm.description,
        scheduledDate: new Date(`${scheduleForm.scheduledDate}T${scheduleForm.scheduledTime}`).toISOString(),
        contactId: scheduleForm.contactId || null,
        location: scheduleForm.location || ''
      };
      
      if (editingInteraction) {
        try {
          const updatedInteraction = {
            ...editingInteraction,
            type: scheduleForm.type,
            title: scheduleForm.title || scheduleForm.type.charAt(0).toUpperCase() + scheduleForm.type.slice(1),
            description: scheduleForm.description || scheduleForm.title,
            notes: scheduleForm.description,
            scheduledDate: interactionData.scheduledDate,
            location: scheduleForm.location || '',
            contactId: scheduleForm.contactId || null,
          };

          // Update in backend
          await updateInteraction(editingInteraction._id, updatedInteraction);

          // Update local state
          setInteractions(prev => prev.map(int =>
            int._id === editingInteraction._id ? updatedInteraction : int
          ));
          toast.success('✅ Interaction updated successfully!');
        } catch (error) {
          console.error('Failed to update interaction:', error);
          toast.error('❌ Failed to update interaction');
          return;
        }
      } else {
        const response = await addInteraction(interactionData);
        const newInteraction = {
          _id: response._id || Date.now().toString(),
          type: scheduleForm.type,
          title: scheduleForm.title || scheduleForm.type.charAt(0).toUpperCase() + scheduleForm.type.slice(1),
          description: scheduleForm.description || scheduleForm.title,
          notes: scheduleForm.description,
          scheduledDate: interactionData.scheduledDate,
          location: scheduleForm.location || '',
          contactId: scheduleForm.contactId || null,
          createdAt: new Date().toISOString()
        };
        
        try {
          setInteractions(prev => [...prev, newInteraction]);
          toast.success('✅ Interaction scheduled successfully!');
        } catch (stateError) {
          console.error('Error updating interactions state:', stateError);
          toast.error('Failed to update interactions list');
        }
      }
      
      setScheduleDialog(false);
      setEditingInteraction(null);
      setScheduleForm({
        type: 'meeting',
        title: '',
        description: '',
        scheduledDate: '',
        scheduledTime: '',
        contactId: '',
        location: ''
      });
      
      // Refresh interactions from backend
      await fetchInteractions();
    } catch (err) {
      console.error('Schedule error:', err.response?.data);
      toast.error(`❌ ${err.response?.data?.message || 'Failed to schedule interaction'}`);
    }
  }, [scheduleForm, editingInteraction, fetchInteractions]);

  const handleEditInteraction = useCallback((interaction) => {
    try {
      if (!interaction) {
        console.error('Invalid interaction data');
        return;
      }

      setEditingInteraction(interaction);

      // Handle date parsing with fallbacks
      let scheduledDate = '';
      let scheduledTime = '';

      const dateField = interaction.scheduledDate || interaction.date;
      if (dateField) {
        try {
          const date = new Date(dateField);
          if (!isNaN(date.getTime())) {
            scheduledDate = date.toISOString().split('T')[0];
            scheduledTime = date.toTimeString().slice(0, 5);
          }
        } catch (dateError) {
          console.warn('Could not parse scheduled date, using empty values:', dateError);
        }
      }

      setScheduleForm({
        type: interaction.type || 'meeting',
        title: interaction.title || '',
        description: interaction.description || interaction.notes || '',
        scheduledDate,
        scheduledTime,
        contactId: interaction.contactId || '',
        location: interaction.location || ''
      });
      setScheduleDialog(true);
    } catch (error) {
      console.error('Error editing interaction:', error);
      toast.error('Failed to edit interaction');
    }
  }, []);

  const handleDeleteInteraction = useCallback(async (interactionId) => {
    try {
      if (!interactionId) {
        console.error('Invalid interaction ID');
        toast.error('Invalid interaction ID');
        return;
      }

      const confirmed = window.confirm('Are you sure you want to delete this scheduled activity?');
      if (!confirmed) return;

      // Delete from backend
      await deleteInteraction(interactionId);

      // Update local state
      setInteractions(prev => prev.filter(int => int._id !== interactionId));
      toast.success('🗑️ Interaction deleted successfully!');
      
      // Refresh interactions from backend
      await fetchInteractions();
    } catch (error) {
      console.error('Error deleting interaction:', error);
      toast.error('Failed to delete interaction');
    }
  }, [fetchInteractions]);

  const handleFormSuccess = useCallback(() => {
    try {
      setEditingContact(null);
      setShowForm(false);
      fetchContacts();
    } catch (error) {
      console.error('Error handling form success:', error);
    }
  }, [fetchContacts]);

  const handleFormCancel = useCallback(() => {
    try {
      setEditingContact(null);
      setShowForm(false);
    } catch (error) {
      console.error('Error handling form cancel:', error);
    }
  }, []);

  const handleDelete = useCallback(async (id) => {
    try {
      if (!id) {
        toast.error('Invalid contact ID');
        return;
      }
      
      const confirmed = window.confirm("Are you sure you want to delete this contact?");
      if (!confirmed) return;
      
      await deleteContact(id);
      await fetchContacts();
      toast.success("🗑️ Contact deleted successfully!");
    } catch (err) {
      console.error("❌ Error deleting contact:", err);
      toast.error('Failed to delete contact');
    }
  }, [fetchContacts]);

  const handleEdit = useCallback((contact) => {
    try {
      if (!contact) {
        toast.error('Invalid contact data');
        return;
      }
      setEditingContact(contact);
      setShowForm(true);
      setActiveView("contacts");
    } catch (error) {
      console.error('Error editing contact:', error);
      toast.error('Failed to edit contact');
    }
  }, []);

  const handleAddNew = useCallback(() => {
    try {
      setEditingContact(null);
      setShowForm(true);
      setActiveView("contacts");
    } catch (error) {
      console.error('Error adding new contact:', error);
      toast.error('Failed to open contact form');
    }
  }, []);

  const handleProfileUpdate = async (updatedData) => {
    try {
      toast.info("Updating profile...");
      
      if (updatedData.profilePictureFile) {
        await uploadProfilePicture(updatedData.profilePictureFile);
        delete updatedData.profilePictureFile;
        delete updatedData.profilePicture;
      }
      
      // Optimized change detection
      const hasChanges = checkForChanges(updatedData);
      
      if (hasChanges) {
        const response = await updateUserProfile(updatedData);
        const updatedUser = response.user || response;
        setUserProfile(updatedUser);
      }
      
      setTimeout(() => fetchProfile(), 500);
      toast.success("✅ Profile updated successfully!");
    } catch (err) {
      console.error("❌ Error updating profile:", err);
      toast.error(`Failed to update profile: ${err.response?.data?.message || err.message}`);
    }
  };

  // Helper function for optimized change detection
  const checkForChanges = useCallback((data) => {
    return Object.values(data).some(value => {
      if (typeof value === 'object' && value !== null) {
        return Object.values(value).some(subValue => subValue && String(subValue).trim() !== '');
      }
      return value && String(value).trim() !== '';
    });
  }, []);

  const toggleTheme = useCallback(() => {
    try {
      const newTheme = theme === "light" ? "dark" : "light";
      setTheme(newTheme);
      if (typeof Storage !== 'undefined' && localStorage) {
        localStorage.setItem("theme", newTheme);
      }
      toast.success(`Theme switched to ${newTheme === "dark" ? "🌙 Dark" : "☀️ Light"} Mode`);
    } catch (error) {
      console.error('Error toggling theme:', error);
      toast.error('Failed to change theme');
    }
  }, [theme]);

  const handleLogout = useCallback(() => {
    try {
      if (typeof Storage !== 'undefined' && localStorage) {
        localStorage.removeItem("jwtToken");
      }
      toast.info("You've been logged out.");
      navigate("/login");
    } catch (error) {
      console.error('Error during logout:', error);
      // Force navigation even if localStorage fails
      navigate("/login");
    }
  }, [navigate]);

  // Stats Cards Component with Professional CRM Colors
  const StatsCard = ({ title, value, icon, color, trend }) => (
    <Card sx={{ 
      height: '100%', 
      background: `linear-gradient(135deg, ${color}15 0%, ${color}05 100%)`,
      border: `1px solid ${color}20`,
      borderRadius: 3,
      transition: 'all 0.3s ease',
      '&:hover': {
        transform: 'translateY(-8px)',
        boxShadow: `0 12px 40px ${color}25`,
        border: `1px solid ${color}40`
      }
    }}>
      <CardContent sx={{ p: 3 }}>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography variant="h3" fontWeight="700" color={color} sx={{ mb: 1 }}>
              {value}
            </Typography>
            <Typography variant="body1" color="text.secondary" fontWeight="500">
              {title}
            </Typography>
            {trend && (
              <Chip 
                label={`+${trend}%`} 
                size="small" 
                sx={{ 
                  mt: 1.5,
                  background: `linear-gradient(135deg, #10B981 0%, #059669 100%)`,
                  color: 'white',
                  fontWeight: 600
                }}
              />
            )}
          </Box>
          <Avatar sx={{ 
            bgcolor: color, 
            width: 64, 
            height: 64,
            boxShadow: `0 8px 25px ${color}40`
          }}>
            {icon}
          </Avatar>
        </Box>
      </CardContent>
    </Card>
  );

  // Search and Filter Component
  const renderSearchAndFilter = () => (
    <Card sx={{ 
      mb: 3, 
      borderRadius: 3,
      boxShadow: '0 8px 25px rgba(14, 165, 233, 0.08)',
      border: '1px solid rgba(14, 165, 233, 0.1)'
    }}>
      <CardContent sx={{ p: 3 }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              placeholder="Search contacts by name, company, email, phone..."
              value={searchTerm}
              onChange={(e) => {
                const value = e.target.value;
                console.log('Search term changed:', value); // Debug log
                setSearchTerm(value);
              }}
              autoComplete="off"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search sx={{ color: '#0EA5E9' }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  backgroundColor: '#F8FAFC',
                  '&:hover fieldset': { borderColor: '#0EA5E9' },
                  '&.Mui-focused fieldset': { borderColor: '#0EA5E9', borderWidth: '2px' }
                }
              }}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Filter by Category</InputLabel>
              <Select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                startAdornment={<FilterList sx={{ mr: 1, color: '#10B981' }} />}
                sx={{
                  borderRadius: 2,
                  backgroundColor: '#F8FAFC',
                  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#10B981' },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#10B981', borderWidth: '2px' }
                }}
              >
                <MenuItem value="All">All Categories</MenuItem>
                <MenuItem value="Client">Clients</MenuItem>
                <MenuItem value="Vendor">Vendors</MenuItem>
                <MenuItem value="Partner">Partners</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <Button
              fullWidth
              variant="contained"
              startIcon={<Add />}
              onClick={handleAddNew}
              sx={{ 
                py: 1.8,
                borderRadius: 2,
                background: 'linear-gradient(135deg, #0EA5E9 0%, #3B82F6 100%)',
                fontSize: '1rem',
                fontWeight: 600,
                textTransform: 'none',
                boxShadow: '0 8px 25px rgba(14, 165, 233, 0.3)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #0284C7 0%, #2563EB 100%)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 12px 35px rgba(14, 165, 233, 0.4)'
                }
              }}
            >
              Add Contact
            </Button>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );

  // Memoized filtered contacts for performance
  // Optimized memoized filtered contacts
  const filteredContacts = useMemo(() => {
    console.log('Filtering contacts:', { 
      totalContacts: contacts.length, 
      searchTerm, 
      filterCategory 
    }); // Debug log
    
    if (!Array.isArray(contacts) || contacts.length === 0) {
      console.log('No contacts to filter');
      return [];
    }
    
    const searchLower = searchTerm.trim().toLowerCase();
    const isAllCategories = filterCategory === "All";
    
    const filtered = contacts.filter(contact => {
      try {
        if (!contact || typeof contact !== 'object') return false;
        
        // Early category filter for performance
        if (!isAllCategories && contact.category !== filterCategory) return false;
        
        // Skip search if no search term
        if (!searchTerm.trim()) return true;
        
        const name = (contact.name || '').toLowerCase();
        const company = (contact.company || '').toLowerCase();
        const category = (contact.category || '').toLowerCase();
        const address = (contact.address || '').toLowerCase();
        const emails = Array.isArray(contact.emails) ? contact.emails : [];
        const phones = Array.isArray(contact.phones) ? contact.phones : [];
        
        // Search in multiple fields
        const matchesName = name.includes(searchLower);
        const matchesCompany = company.includes(searchLower);
        const matchesCategory = category.includes(searchLower);
        const matchesAddress = address.includes(searchLower);
        const matchesEmail = emails.some(email => 
          typeof email === 'string' && email.toLowerCase().includes(searchLower)
        );
        const matchesPhone = phones.some(phone => 
          typeof phone === 'string' && phone.toLowerCase().includes(searchLower)
        );
        
        const matches = matchesName || matchesCompany || matchesCategory || 
                       matchesAddress || matchesEmail || matchesPhone;
        
        if (searchTerm.trim() && matches) {
          console.log('Contact matches search:', contact.name, { 
            matchesName, matchesCompany, matchesEmail 
          });
        }
        
        return matches;
      } catch (error) {
        console.error('Error filtering contact:', error);
        return false;
      }
    });
    
    console.log('Filtered results:', filtered.length, 'contacts');
    return filtered;
  }, [contacts, searchTerm, filterCategory]);



  // Main Content Renderer
  const renderMainContent = () => {
    switch (activeView) {
      case "dashboard":
        return (
          <>
            {/* Professional Welcome Header */}
            <Card sx={{
              mb: 4,
              borderRadius: 3,
              background: 'linear-gradient(135deg, #0EA5E9 0%, #3B82F6 100%)',
              color: 'white',
              boxShadow: '0 12px 40px rgba(14, 165, 233, 0.3)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <CardContent sx={{ p: 4 }}>
                <Box sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: 2
                }}>
                  <Box>
                    <Typography variant="h4" fontWeight="600" sx={{ mb: 1 }}>
                      Welcome back, {userProfile?.name || 'User'}!
                    </Typography>
                    <Typography variant="body1" sx={{ opacity: 0.9, mb: 2 }}>
                      Here's what's happening with your contacts today
                    </Typography>
                    <Typography variant="caption" sx={{ opacity: 0.8 }}>
                      {new Date().toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </Typography>
                  </Box>
                  <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    flexWrap: 'wrap'
                  }}>
                    <Chip
                      label={`${stats.totalContacts} Total Contacts`}
                      sx={{
                        backgroundColor: 'rgba(255, 255, 255, 0.2)',
                        color: 'white',
                        fontWeight: 600,
                        backdropFilter: 'blur(10px)'
                      }}
                    />
                    <Chip
                      label={`${interactions.length} Scheduled Activities`}
                      sx={{
                        backgroundColor: 'rgba(255, 255, 255, 0.2)',
                        color: 'white',
                        fontWeight: 600,
                        backdropFilter: 'blur(10px)'
                      }}
                    />
                    <Button
                      variant="contained"
                      startIcon={<Schedule />}
                      onClick={() => setScheduleDialog(true)}
                      sx={{
                        backgroundColor: 'rgba(255, 255, 255, 0.2)',
                        color: 'white',
                        border: '1px solid rgba(255, 255, 255, 0.3)',
                        backdropFilter: 'blur(10px)',
                        '&:hover': {
                          backgroundColor: 'rgba(255, 255, 255, 0.3)',
                          transform: 'translateY(-2px)'
                        },
                        transition: 'all 0.3s ease'
                      }}
                    >
                      Schedule Activity
                    </Button>
                  </Box>
                </Box>
                {/* Decorative elements */}
                <Box sx={{
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  width: 200,
                  height: 200,
                  background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
                  borderRadius: '50%',
                  transform: 'translate(50%, -50%)'
                }} />
              </CardContent>
            </Card>

            <Typography variant="h4" gutterBottom fontWeight="400" color="#0F172A" sx={{ mb: 4 }}>
              Dashboard Overview
            </Typography>
            
            {/* Stats Grid with Professional CRM Colors */}
            <Grid container spacing={3} mb={4}>
              <Grid item xs={12} sm={6} md={2.4}>
                <StatsCard
                  title="Total Contacts"
                  value={stats.totalContacts}
                  icon={<People />}
                  color="#0EA5E9"
                  trend={12}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={2.4}>
                <StatsCard
                  title="Clients"
                  value={stats.clients}
                  icon={<Business />}
                  color="#10B981"
                  trend={8}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={2.4}>
                <StatsCard
                  title="Vendors"
                  value={stats.vendors}
                  icon={<TrendingUp />}
                  color="#F59E0B"
                  trend={15}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={2.4}>
                <StatsCard
                  title="Partners"
                  value={stats.partners}
                  icon={<Analytics />}
                  color="#EC4899"
                  trend={5}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={2.4}>
                <StatsCard
                  title="Recent Activity"
                  value={stats.recentActivity}
                  icon={<Notifications />}
                  color="#8B5CF6"
                  trend={22}
                />
              </Grid>
            </Grid>

            {renderSearchAndFilter()}
            
            {/* Recent Contacts with Professional Styling */}
            <Card sx={{ 
              borderRadius: 3,
              boxShadow: '0 8px 25px rgba(14, 165, 233, 0.08)',
              border: '1px solid rgba(14, 165, 233, 0.1)'
            }}>
              <CardContent sx={{ p: 3 }}>
                <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
                  <Typography variant="h6" fontWeight="600" color="#0F172A">Recent Contacts</Typography>
                  <LinearProgress 
                    variant="determinate" 
                    value={75} 
                    sx={{ 
                      width: 120, 
                      height: 8, 
                      borderRadius: 4,
                      backgroundColor: '#E2E8F0',
                      '& .MuiLinearProgress-bar': {
                        background: 'linear-gradient(135deg, #0EA5E9 0%, #3B82F6 100%)',
                        borderRadius: 4
                      }
                    }}
                  />
                </Box>
                <List>
                  {contacts.slice(0, 5).map((contact, index) => (
                    <ListItem key={contact._id} divider={index < 4} sx={{ px: 0 }}>
                      <Avatar sx={{ 
                        mr: 2, 
                        bgcolor: "#0EA5E9",
                        width: 48,
                        height: 48,
                        fontSize: '1.2rem',
                        fontWeight: 600
                      }}>
                        {contact.name.charAt(0)}
                      </Avatar>
                      <ListItemText
                        primary={
                          <Typography variant="subtitle1" fontWeight="600" color="#0F172A">
                            {contact.name}
                          </Typography>
                        }
                        secondary={
                          <Typography variant="body2" color="text.secondary">
                            {contact.company} • {contact.category}
                          </Typography>
                        }
                      />
                      <Box display="flex" alignItems="center" gap={1}>
                        <Chip 
                          label={contact.category} 
                          size="small" 
                          sx={{
                            background: contact.category === "Client" ? 
                              'linear-gradient(135deg, #0EA5E9 0%, #3B82F6 100%)' :
                              contact.category === "Vendor" ? 
                              'linear-gradient(135deg, #10B981 0%, #059669 100%)' : 
                              'linear-gradient(135deg, #F59E0B 0%, #EAB308 100%)',
                            color: 'white',
                            fontWeight: 600
                          }}
                        />
                        <IconButton size="small">
                          <MoreVert />
                        </IconButton>
                      </Box>
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </>
        );
      
      case "contacts":
        return (
          <>
            <Typography variant="h4" gutterBottom fontWeight="400" color="#0F172A" sx={{ mb: 4 }}>
              Contact Management
            </Typography>
            
            {renderSearchAndFilter()}
            
            {/* Search Results Indicator */}
            {searchTerm.trim() && (
              <Card sx={{ 
                mb: 2,
                borderRadius: 2,
                backgroundColor: '#F0F9FF',
                border: '1px solid #0EA5E9'
              }}>
                <CardContent sx={{ py: 1.5 }}>
                  <Typography variant="body2" color="#0EA5E9" fontWeight="600">
                    Found {filteredContacts.length} contact{filteredContacts.length !== 1 ? 's' : ''} matching "{searchTerm}"
                  </Typography>
                </CardContent>
              </Card>
            )}
            
            {showForm && (
              <Card sx={{ 
                mb: 3,
                borderRadius: 3,
                boxShadow: '0 8px 25px rgba(16, 185, 129, 0.08)',
                border: '1px solid rgba(16, 185, 129, 0.1)'
              }}>
                <CardContent sx={{ p: 3 }}>
                  <ContactForm
                    contact={editingContact}
                    onSuccess={handleFormSuccess}
                    onCancel={handleFormCancel}
                  />
                </CardContent>
              </Card>
            )}
            
            <ContactList
              contacts={filteredContacts}
              handleEdit={handleEdit}
              handleDelete={handleDelete}
            />
          </>
        );
      
      case "analytics":
        return (
          <>
            <Typography variant="h4" gutterBottom fontWeight="400" color="#0F172A" sx={{ mb: 4 }}>
              Analytics & Reports
            </Typography>
            <AnalyticsWidget contacts={contacts} />
          </>
        );
      
      case "tasks":
        return (
          <>
            <Typography variant="h4" gutterBottom fontWeight="400" color="#0F172A" sx={{ mb: 4 }}>
              Task Management
            </Typography>
            <TaskManager />
          </>
        );
      
      case "schedule":
        return (
          <>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
              <Typography variant="h4" fontWeight="400" color="#0F172A">
                Schedule Management
              </Typography>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => setScheduleDialog(true)}
                sx={{
                  py: 1.5,
                  px: 3,
                  borderRadius: 2,
                  background: 'linear-gradient(135deg, #EC4899 0%, #F472B6 100%)',
                  fontSize: '1rem',
                  fontWeight: 600,
                  textTransform: 'none',
                  boxShadow: '0 8px 25px rgba(236, 72, 153, 0.3)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #BE185D 0%, #EC4899 100%)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 12px 35px rgba(236, 72, 153, 0.4)'
                  }
                }}
              >
                Schedule Activity
              </Button>
            </Box>
            
            {interactions.length === 0 ? (
              <Card sx={{ 
                borderRadius: 3,
                boxShadow: '0 8px 25px rgba(236, 72, 153, 0.08)',
                border: '1px solid rgba(236, 72, 153, 0.1)'
              }}>
                <CardContent sx={{ textAlign: 'center', py: 8 }}>
                  <Schedule sx={{ fontSize: 80, color: '#EC4899', mb: 3 }} />
                  <Typography variant="h5" color="#0F172A" gutterBottom fontWeight="600">
                    No Scheduled Activities
                  </Typography>
                  <Typography variant="body1" color="text.secondary" mb={4}>
                    Click "Schedule Activity" to add your first scheduled interaction
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={() => setScheduleDialog(true)}
                    sx={{
                      py: 1.5,
                      px: 4,
                      borderRadius: 2,
                      background: 'linear-gradient(135deg, #EC4899 0%, #F472B6 100%)',
                      fontSize: '1rem',
                      fontWeight: 600,
                      textTransform: 'none',
                      boxShadow: '0 8px 25px rgba(236, 72, 153, 0.3)'
                    }}
                  >
                    Schedule Activity
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Box sx={{ maxHeight: '70vh', overflowY: 'auto' }}>
                <Grid container spacing={2}>
                  {interactions
                    .sort((a, b) => new Date(a.scheduledDate || a.date) - new Date(b.scheduledDate || b.date))
                    .map((interaction, index) => (
                    <Grid item xs={12} key={interaction._id || index}>
                      <Card sx={{
                        borderRadius: 3,
                        boxShadow: '0 4px 15px rgba(236, 72, 153, 0.08)',
                        border: '1px solid rgba(236, 72, 153, 0.1)',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: '0 8px 25px rgba(236, 72, 153, 0.12)'
                        }
                      }}>
                        <CardContent sx={{ p: 3 }}>
                          <Box display="flex" alignItems="flex-start" justifyContent="space-between">
                            <Box display="flex" alignItems="flex-start" flex={1}>
                              <Box sx={{ mr: 2, mt: 0.5 }}>
                                {interaction.type === 'meeting' && <Event sx={{ color: "#0EA5E9", fontSize: 28 }} />}
                                {interaction.type === 'call' && <Phone sx={{ color: "#10B981", fontSize: 28 }} />}
                                {interaction.type === 'email' && <Email sx={{ color: "#F59E0B", fontSize: 28 }} />}
                                {interaction.type === 'follow-up' && <TrendingUp sx={{ color: "#EC4899", fontSize: 28 }} />}
                              </Box>
                              <Box flex={1}>
                                <Typography variant="h6" sx={{ fontWeight: 600, color: "#0F172A", mb: 1 }}>
                                  {(() => {
                                    console.log('Interaction data:', interaction);
                                    return interaction.title || (interaction.type ? interaction.type.charAt(0).toUpperCase() + interaction.type.slice(1) : 'Scheduled Activity');
                                  })()}
                                </Typography>
                                <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                                  {interaction.description || interaction.notes || 'No description provided'}
                                </Typography>
                                <Box display="flex" flexWrap="wrap" gap={2} alignItems="center">
                                  <Chip
                                    label={interaction.type?.charAt(0).toUpperCase() + interaction.type?.slice(1) || 'Activity'}
                                    size="small"
                                    sx={{
                                      background: interaction.type === 'meeting' ? 'linear-gradient(135deg, #0EA5E9 0%, #3B82F6 100%)' :
                                               interaction.type === 'call' ? 'linear-gradient(135deg, #10B981 0%, #059669 100%)' :
                                               interaction.type === 'email' ? 'linear-gradient(135deg, #F59E0B 0%, #EAB308 100%)' :
                                               'linear-gradient(135deg, #EC4899 0%, #F472B6 100%)',
                                      color: 'white',
                                      fontWeight: 600
                                    }}
                                  />
                                  <Typography variant="body2" sx={{ color: "#EC4899", fontWeight: 600 }}>
                                    {(() => {
                                      try {
                                        const dateField = interaction.scheduledDate || interaction.date;
                                        if (!dateField) return 'No date set';
                                        const date = new Date(dateField);
                                        if (isNaN(date.getTime())) return 'Invalid date';
                                        return date.toLocaleString();
                                      } catch (error) {
                                        console.error('Error formatting date:', error);
                                        return 'Invalid date';
                                      }
                                    })()}
                                  </Typography>
                                  {interaction.location && (
                                    <Box display="flex" alignItems="center">
                                      <LocationOn sx={{ fontSize: 16, mr: 0.5, color: "#64748B" }} />
                                      <Typography variant="body2" color="text.secondary">{interaction.location}</Typography>
                                    </Box>
                                  )}
                                  {interaction.contactId && (
                                    <Typography variant="body2" sx={{ color: "#8B5CF6", fontWeight: 500 }}>
                                      Contact: {contacts.find(c => c._id === interaction.contactId)?.name || 'Unknown'}
                                    </Typography>
                                  )}
                                </Box>
                              </Box>
                            </Box>
                            <Box display="flex" flexDirection="column" gap={1}>
                              <IconButton
                                size="small"
                                onClick={() => handleEditInteraction(interaction)}
                                sx={{ color: "#0EA5E9", '&:hover': { backgroundColor: '#0EA5E915' } }}
                              >
                                <Edit fontSize="small" />
                              </IconButton>
                              <IconButton
                                size="small"
                                onClick={() => handleDeleteInteraction(interaction._id)}
                                sx={{ color: "#EF4444", '&:hover': { backgroundColor: '#EF444415' } }}
                              >
                                <Delete fontSize="small" />
                              </IconButton>
                            </Box>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            )}
          </>
        );
      
      default:
        return null;
    }
  };

  return (
    <Box sx={{ 
      display: 'flex', 
      minHeight: '100vh',
      bgcolor: theme === "dark" ? "#0F172A" : "#F8FAFC"
    }}>
      {/* Enhanced Sidebar */}
      <Sidebar
        onProfileOpen={() => setProfileOpen(true)}
        onLogout={handleLogout}
        onThemeToggle={toggleTheme}
        userProfile={userProfile}
        activeView={activeView}
        onViewChange={setActiveView}
        theme={theme}
        notificationCount={todayNotifications}
        onNotificationsClick={() => setActiveView('schedule')}
      />


      {/* Profile Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: '0 8px 32px rgba(15, 23, 42, 0.12)',
            border: '1px solid rgba(14, 165, 233, 0.1)'
          }
        }}
      >
        <MenuItem onClick={() => { setProfileOpen(true); setAnchorEl(null); }}>
          <AccountCircle sx={{ mr: 1, color: '#0EA5E9' }} /> Profile
        </MenuItem>
        <MenuItem onClick={() => { toggleTheme(); setAnchorEl(null); }}>
          {theme === "dark" ? <Brightness7 sx={{ mr: 1, color: '#F59E0B' }} /> : <Brightness4 sx={{ mr: 1, color: '#8B5CF6' }} />}
          {theme === "dark" ? "Light Mode" : "Dark Mode"}
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => { handleLogout(); setAnchorEl(null); }}>
          <ExitToApp sx={{ mr: 1, color: '#EF4444' }} /> Logout
        </MenuItem>
      </Menu>

      {/* Main Content */}
      <Paper 
        component="main" 
        sx={{ 
          flexGrow: 1, 
          ml: '90px',
          p: 4,
          bgcolor: theme === "dark" ? "#0F172A" : "#F8FAFC",
          borderRadius: 0,
          minHeight: '100vh'
        }}
      >
        <Toolbar />
        {renderMainContent()}
      </Paper>

      {/* Professional Floating Action Button */}
      <Fab
        sx={{
          position: 'fixed',
          bottom: 32,
          right: 32,
          background: 'linear-gradient(135deg, #0EA5E9 0%, #3B82F6 100%)',
          boxShadow: '0 8px 25px rgba(14, 165, 233, 0.4)',
          '&:hover': {
            background: 'linear-gradient(135deg, #0284C7 0%, #2563EB 100%)',
            transform: 'scale(1.1)',
            boxShadow: '0 12px 35px rgba(14, 165, 233, 0.5)'
          }
        }}
        onClick={handleAddNew}
      >
        <Add />
      </Fab>

      {/* Notifications Menu */}
      <Menu
        anchorEl={notificationAnchor}
        open={Boolean(notificationAnchor)}
        onClose={() => setNotificationAnchor(null)}
        PaperProps={{
          sx: { 
            width: 380, 
            maxHeight: 450,
            borderRadius: 2,
            boxShadow: '0 8px 32px rgba(15, 23, 42, 0.12)'
          }
        }}
      >
        <Box sx={{ p: 3, borderBottom: '1px solid #E2E8F0' }}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6" fontWeight="600" color="#0F172A">Scheduled Activities</Typography>
            <IconButton 
              size="small" 
              onClick={() => {
                setNotificationAnchor(null);
                setScheduleDialog(true);
              }}
              sx={{ color: '#0EA5E9' }}
            >
              <Add />
            </IconButton>
          </Box>
        </Box>
        {todaysActivities.length === 0 ? (
          <MenuItem>
            <Typography color="text.secondary">No activities scheduled for today</Typography>
          </MenuItem>
        ) : (
          todaysActivities.map((interaction, index) => (
            <MenuItem key={interaction._id || index} sx={{ flexDirection: 'column', alignItems: 'flex-start', py: 2 }}>
              <Typography variant="subtitle2" fontWeight="600" color="#0F172A">
                {interaction.title || interaction.type?.charAt(0).toUpperCase() + interaction.type?.slice(1) || 'Scheduled Activity'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {interaction.description || interaction.notes || 'No description'}
              </Typography>
              <Typography variant="caption" sx={{ color: "#0EA5E9", fontWeight: 600 }}>
                {(() => {
                  try {
                    const dateField = interaction.scheduledDate || interaction.date;
                    return dateField ? new Date(dateField).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'No time';
                  } catch (error) {
                    return 'Invalid time';
                  }
                })()}
              </Typography>
            </MenuItem>
          ))
        )}
      </Menu>

      {/* Schedule Dialog */}
      <Dialog
        open={scheduleDialog}
        onClose={() => setScheduleDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0 8px 32px rgba(15, 23, 42, 0.12)'
          }
        }}
      >
        <DialogTitle sx={{ 
          background: 'linear-gradient(135deg, #EC4899 0%, #F472B6 100%)',
          color: 'white',
          fontWeight: 600
        }}>
          {editingInteraction ? 'Edit Activity' : 'Schedule New Activity'}
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <FormControl fullWidth margin="normal">
            <InputLabel>Activity Type</InputLabel>
            <Select
              value={scheduleForm.type}
              onChange={(e) => setScheduleForm({...scheduleForm, type: e.target.value})}
              sx={{
                borderRadius: 2,
                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#EC4899' },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#EC4899' }
              }}
            >
              <MenuItem value="meeting">Meeting</MenuItem>
              <MenuItem value="call">Phone Call</MenuItem>
              <MenuItem value="email">Email</MenuItem>
              <MenuItem value="follow-up">Follow Up</MenuItem>
            </Select>
          </FormControl>
          
          <TextField
            fullWidth
            label="Title"
            margin="normal"
            value={scheduleForm.title}
            onChange={(e) => setScheduleForm({...scheduleForm, title: e.target.value})}
            inputProps={{ maxLength: 100 }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                '&:hover fieldset': { borderColor: '#EC4899' },
                '&.Mui-focused fieldset': { borderColor: '#EC4899' }
              }
            }}
          />
          
          <TextField
            fullWidth
            label="Description"
            margin="normal"
            multiline
            rows={2}
            value={scheduleForm.description}
            onChange={(e) => setScheduleForm({...scheduleForm, description: e.target.value})}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                '&:hover fieldset': { borderColor: '#EC4899' },
                '&.Mui-focused fieldset': { borderColor: '#EC4899' }
              }
            }}
          />
          
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Date"
                type="date"
                margin="normal"
                InputLabelProps={{ shrink: true }}
                value={scheduleForm.scheduledDate}
                onChange={(e) => setScheduleForm({...scheduleForm, scheduledDate: e.target.value})}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    '&:hover fieldset': { borderColor: '#EC4899' },
                    '&.Mui-focused fieldset': { borderColor: '#EC4899' }
                  }
                }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Time"
                type="time"
                margin="normal"
                InputLabelProps={{ shrink: true }}
                value={scheduleForm.scheduledTime}
                onChange={(e) => setScheduleForm({...scheduleForm, scheduledTime: e.target.value})}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    '&:hover fieldset': { borderColor: '#EC4899' },
                    '&.Mui-focused fieldset': { borderColor: '#EC4899' }
                  }
                }}
              />
            </Grid>
          </Grid>
          
          <FormControl fullWidth margin="normal">
            <InputLabel>Contact (Optional)</InputLabel>
            <Select
              value={scheduleForm.contactId}
              onChange={(e) => setScheduleForm({...scheduleForm, contactId: e.target.value})}
              sx={{
                borderRadius: 2,
                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#EC4899' },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#EC4899' }
              }}
            >
              <MenuItem value="">None</MenuItem>
              {contacts.map(contact => (
                <MenuItem key={contact._id} value={contact._id}>
                  {contact.name} - {contact.company}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <TextField
            fullWidth
            label="Location (Optional)"
            margin="normal"
            value={scheduleForm.location}
            onChange={(e) => setScheduleForm({...scheduleForm, location: e.target.value})}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                '&:hover fieldset': { borderColor: '#EC4899' },
                '&.Mui-focused fieldset': { borderColor: '#EC4899' }
              }
            }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button
            onClick={() => setScheduleDialog(false)}
            startIcon={<Cancel />}
            sx={{ 
              borderRadius: 2,
              color: '#64748B',
              '&:hover': { backgroundColor: '#F1F5F9' }
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleScheduleSubmit}
            startIcon={<Save />}
            disabled={!scheduleForm.title || !scheduleForm.scheduledDate || !scheduleForm.scheduledTime}
            sx={{
              borderRadius: 2,
              background: 'linear-gradient(135deg, #EC4899 0%, #F472B6 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #BE185D 0%, #EC4899 100%)'
              }
            }}
          >
            {editingInteraction ? 'Update' : 'Schedule'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Profile Dialog */}
      <ProfileDialog
        open={profileOpen}
        onClose={() => setProfileOpen(false)}
        user={userProfile}
        onProfileUpdate={handleProfileUpdate}
      />
    </Box>
  );
}

export default Dashboard;
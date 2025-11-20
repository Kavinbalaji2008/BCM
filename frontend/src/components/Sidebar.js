import React, { useState } from "react";
import { 
  Box, 
  Avatar, 
  IconButton, 
  Tooltip, 
  Badge,
  Typography,
  Divider,
  Chip
} from "@mui/material";
import { 
  Dashboard,
  People,
  Analytics,
  Schedule,
  Settings,
  Notifications,
  ExitToApp,
  Brightness4,
  Brightness7
} from "@mui/icons-material";

function Sidebar({
  onProfileOpen,
  onLogout,
  onAnalyticsToggle,
  onThemeToggle,
  userProfile,
  activeView,
  onViewChange,
  theme,
  notificationCount = 0,
  onNotificationsClick
}) {
  const [hoveredItem, setHoveredItem] = useState(null);

  const menuItems = [
    { 
      id: 'dashboard', 
      icon: Dashboard, 
      label: 'Dashboard', 
      color: '#0EA5E9',
      onClick: () => onViewChange('dashboard')
    },
    { 
      id: 'contacts', 
      icon: People, 
      label: 'Contacts', 
      color: '#10B981',
      onClick: () => onViewChange('contacts')
    },
    { 
      id: 'analytics', 
      icon: Analytics, 
      label: 'Analytics', 
      color: '#F59E0B',
      onClick: () => onViewChange('analytics')
    },
    { 
      id: 'schedule', 
      icon: Schedule, 
      label: 'Schedule', 
      color: '#EC4899',
      onClick: () => onViewChange('schedule')
    },
    {
      id: 'notifications',
      icon: Notifications,
      label: 'Notifications',
      color: '#8B5CF6',
      badge: notificationCount,
      onClick: () => {
        // Handle notifications click - navigate to schedule view to show today's events
        if (typeof onNotificationsClick === 'function') {
          onNotificationsClick();
        } else {
          console.log('Notifications clicked - showing today\'s events');
        }
      }
    }
  ];

  const SidebarButton = ({ item, isActive }) => {
    try {
      if (!item || typeof item !== 'object') {
        console.error('Invalid sidebar item:', item);
        return null;
      }
      
      const IconComponent = item.icon;
      if (!IconComponent) {
        console.error('Missing icon component for item:', item.id);
        return null;
      }
      
      return (
        <Tooltip title={item.label || 'Menu Item'} placement="right" arrow>
          <IconButton
            onClick={() => {
              try {
                if (typeof item.onClick === 'function') {
                  item.onClick();
                } else {
                  console.warn('No onClick handler for item:', item.id);
                }
              } catch (error) {
                console.error('Error executing menu action:', error);
              }
            }}
            onMouseEnter={() => {
              try {
                setHoveredItem(item.id);
              } catch (error) {
                console.error('Error setting hover state:', error);
              }
            }}
            onMouseLeave={() => {
              try {
                setHoveredItem(null);
              } catch (error) {
                console.error('Error clearing hover state:', error);
              }
            }}
          sx={{
            width: 56,
            height: 56,
            mb: 2,
            borderRadius: 3,
            background: isActive ? 
              `linear-gradient(135deg, ${item.color} 0%, ${item.color}CC 100%)` :
              hoveredItem === item.id ? 
              `linear-gradient(135deg, ${item.color}20 0%, ${item.color}10 100%)` :
              'transparent',
            border: isActive ? 
              `2px solid ${item.color}` : 
              `2px solid transparent`,
            color: isActive ? 'white' : item.color,
            transition: 'all 0.3s ease',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: `0 8px 25px ${item.color}40`
            }
          }}
        >
          {item.badge ? (
            <Badge badgeContent={item.badge} color="error">
              <IconComponent sx={{ fontSize: 24 }} />
            </Badge>
          ) : (
            <IconComponent sx={{ fontSize: 24 }} />
          )}
        </IconButton>
      </Tooltip>
    );
    } catch (error) {
      console.error('Error rendering sidebar button:', error);
      return null;
    }
  };

  return (
    <Box
      sx={{
        width: 90,
        minHeight: '100vh',
        background: theme === 'dark' ? 
          'linear-gradient(180deg, #0F172A 0%, #1E293B 100%)' :
          'linear-gradient(180deg, #FFFFFF 0%, #F8FAFC 100%)',
        borderRight: `1px solid ${theme === 'dark' ? '#334155' : '#E2E8F0'}`,
        color: theme === 'dark' ? '#fff' : '#0F172A',
        py: 3,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        boxShadow: '0 8px 32px rgba(15, 23, 42, 0.12)',
        position: 'relative',
        zIndex: 1000
      }}
    >
      {/* Profile Section */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          mb: 4,
          p: 2,
          borderRadius: 3,
          background: `linear-gradient(135deg, #0EA5E9 0%, #3B82F6 100%)`,
          width: '100%',
          maxWidth: 70
        }}
      >
        <Tooltip title="View Profile" placement="right" arrow>
          <Avatar
            src={userProfile?.profilePicture}
            onClick={() => {
              try {
                if (typeof onProfileOpen === 'function') {
                  onProfileOpen();
                } else {
                  console.error('onProfileOpen is not a function');
                }
              } catch (error) {
                console.error('Error opening profile:', error);
              }
            }}
            sx={{
              width: 48,
              height: 48,
              cursor: "pointer",
              mb: 1,
              border: "3px solid rgba(255,255,255,0.3)",
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'scale(1.1)',
                boxShadow: '0 8px 25px rgba(255,255,255,0.3)'
              }
            }}
          >
            {(() => {
              try {
                return userProfile?.name?.charAt(0)?.toUpperCase() || 'U';
              } catch (error) {
                console.error('Error getting user initial:', error);
                return 'U';
              }
            })()}
          </Avatar>
        </Tooltip>
        
        <Typography 
          variant="caption" 
          sx={{ 
            color: 'white', 
            fontWeight: 600,
            textAlign: 'center',
            fontSize: '0.65rem'
          }}
        >
          {userProfile?.name?.split(' ')[0] || 'User'}
        </Typography>
        
        <Chip
          label="Online"
          size="small"
          sx={{
            mt: 0.5,
            height: 16,
            fontSize: '0.6rem',
            backgroundColor: '#10B981',
            color: 'white',
            '& .MuiChip-label': { px: 1 }
          }}
        />
      </Box>

      {/* Navigation Menu */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        {menuItems.map((item) => (
          <SidebarButton 
            key={item.id} 
            item={item} 
            isActive={activeView === item.id}
          />
        ))}
      </Box>

      <Divider sx={{ width: '80%', my: 2, borderColor: theme === 'dark' ? '#334155' : '#E2E8F0' }} />

      {/* Bottom Actions */}
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        {/* Theme Toggle */}
        <Tooltip title={theme === 'dark' ? 'Light Mode' : 'Dark Mode'} placement="right" arrow>
          <IconButton
            onClick={onThemeToggle}
            sx={{
              width: 48,
              height: 48,
              mb: 2,
              borderRadius: 3,
              background: theme === 'dark' ? 
                'linear-gradient(135deg, #F59E0B 0%, #EAB308 100%)' :
                'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)',
              color: 'white',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: theme === 'dark' ? 
                  '0 8px 25px rgba(245, 158, 11, 0.4)' :
                  '0 8px 25px rgba(139, 92, 246, 0.4)'
              }
            }}
          >
            {theme === 'dark' ? 
              <Brightness7 sx={{ fontSize: 20 }} /> : 
              <Brightness4 sx={{ fontSize: 20 }} />
            }
          </IconButton>
        </Tooltip>

        {/* Settings */}
        <Tooltip title="Settings" placement="right" arrow>
          <IconButton
            sx={{
              width: 48,
              height: 48,
              mb: 2,
              borderRadius: 3,
              color: theme === 'dark' ? '#64748B' : '#94A3B8',
              transition: 'all 0.3s ease',
              '&:hover': {
                background: 'linear-gradient(135deg, #64748B 0%, #475569 100%)',
                color: 'white',
                transform: 'translateY(-2px)',
                boxShadow: '0 8px 25px rgba(100, 116, 139, 0.4)'
              }
            }}
          >
            <Settings sx={{ fontSize: 20 }} />
          </IconButton>
        </Tooltip>

        {/* Logout */}
        <Tooltip title="Logout" placement="right" arrow>
          <IconButton
            onClick={() => {
              try {
                if (typeof onLogout === 'function') {
                  onLogout();
                } else {
                  console.error('onLogout is not a function');
                  // Enhanced fallback logout behavior
                  try {
                    if (typeof Storage !== 'undefined' && localStorage) {
                      localStorage.removeItem('jwtToken');
                      localStorage.removeItem('userData');
                    }
                    if (typeof window !== 'undefined') {
                      window.location.href = '/login';
                    }
                  } catch (fallbackError) {
                    console.error('Fallback logout failed:', fallbackError);
                    // Last resort - force page reload
                    try {
                      window.location.reload();
                    } catch (reloadError) {
                      console.error('Even reload failed:', reloadError);
                    }
                  }
                }
              } catch (error) {
                console.error('Error during logout:', error);
              }
            }}
            sx={{
              width: 48,
              height: 48,
              borderRadius: 3,
              background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
              color: 'white',
              transition: 'all 0.3s ease',
              '&:hover': {
                background: 'linear-gradient(135deg, #DC2626 0%, #B91C1C 100%)',
                transform: 'translateY(-2px)',
                boxShadow: '0 8px 25px rgba(239, 68, 68, 0.4)'
              }
            }}
          >
            <ExitToApp sx={{ fontSize: 20 }} />
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  );
}

export default Sidebar;
// src/components/AdminNav/index.js
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Drawer, List, ListItem, ListItemIcon, ListItemText,
  Divider, Typography, Box, IconButton
} from '@mui/material';
import {
  Storage as StorageIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';

const drawerWidth = 240;

const AdminNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const navItems = [
    {
      text: 'CSV Management',
      icon: <StorageIcon />,
      path: '/admin/csv'
    }
  ];
  
  return (
    <Drawer
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          backgroundColor: '#1a1a1a',
          borderRight: '1px solid rgba(255, 255, 255, 0.12)'
        },
      }}
      variant="permanent"
      anchor="left"
    >
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="h6" sx={{ color: 'primary.main' }}>
          Admin Panel
        </Typography>
        <IconButton 
          edge="end" 
          color="secondary" 
          onClick={() => navigate('/')}
          title="Return to game"
        >
          <ArrowBackIcon />
        </IconButton>
      </Box>
      <Divider />
      <List>
        {navItems.map((item) => (
          <ListItem 
            button 
            key={item.text}
            onClick={() => navigate(item.path)}
            selected={location.pathname.includes(item.path)}
            sx={{
              '&.Mui-selected': {
                backgroundColor: 'rgba(156, 39, 176, 0.12)',
                '&:hover': {
                  backgroundColor: 'rgba(156, 39, 176, 0.2)',
                }
              },
              '&:hover': {
                backgroundColor: 'rgba(156, 39, 176, 0.08)',
              }
            }}
          >
            <ListItemIcon sx={{ color: location.pathname.includes(item.path) ? 'primary.main' : 'inherit' }}>
              {item.icon}
            </ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
      </List>
    </Drawer>
  );
};

export default AdminNav;
// src/App.js
import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import FirstStage from './components/FirstStage';
import SecondStage from './components/SecondStage';
import FinalStage from './components/FinalStage';
import CSVManagement from './components/CSVManagement';
import AdminNav from './components/AdminNav';
import axios from 'axios';

// Set axios default base URL
axios.defaults.baseURL = 'https://kriya-backend.onrender.com/';

// Creating a dark mystery theme
const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#9c27b0', // Purple
    },
    secondary: {
      main: '#f50057', // Pink
    },
    background: {
      default: '#0a0a0a',
      paper: '#1a1a1a',
    },
  },
  typography: {
    fontFamily: '"Crimson Text", "Times New Roman", serif',
    h1: {
      fontFamily: '"Creepster", cursive',
    },
    h2: {
      fontFamily: '"Creepster", cursive',
    },
    h3: {
      fontFamily: '"Creepster", cursive',
    },
  },
});

function App() {
  // Auth state to control navigation
  const [auth, setAuth] = useState({
    firstStageCompleted: false,
    secondStageCompleted: false,
    isAdmin: false // Added admin state for admin panel access
  });

  // Admin layout wrapper component
  const AdminLayout = ({ children }) => (
    <Box sx={{ display: 'flex' }}>
      <AdminNav />
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        {children}
      </Box>
    </Box>
  );

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Router>
        <Routes>
          {/* Original Routes */}
          <Route 
            path="/abc" 
            element={<FirstStage setAuth={setAuth} />} 
          />
          <Route 
            path="/second-stage" 
            element={
              auth.firstStageCompleted ? 
              <SecondStage setAuth={setAuth} /> : 
              <Navigate to="/" />
            } 
          />
          <Route 
            path="/final-stage" 
            element={
              auth.secondStageCompleted ? 
              <FinalStage /> : 
              <Navigate to="/" />
            } 
          />
          
          {/* Admin Routes */}
          <Route 
            path="/" 
            element={
              <AdminLayout>
                <Navigate to="/admin/csv" />
              </AdminLayout>
            } 
          />
          
          {/* CSV Management route that handles both the list view and nested routes */}
          <Route 
            path="/admin/csv" 
            element={
              <AdminLayout>
                <CSVManagement />
              </AdminLayout>
            } 
          />
          
          {/* Explicit route for direct access to CSV IDs */}
          <Route 
            path="/admin/csv/:csvId" 
            element={
              <AdminLayout>
                <CSVManagement />
              </AdminLayout>
            } 
          />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
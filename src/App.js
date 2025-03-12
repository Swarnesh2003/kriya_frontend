// src/App.js
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
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

// Admin Protected Route Component
const AdminProtectedRoute = ({ children, auth }) => {
  if (!auth.isAdmin) {
    return <Navigate to="/" />;
  }
  return children;
};

// Admin layout wrapper component
const AdminLayout = ({ children }) => (
  <Box sx={{ display: 'flex' }}>
    <AdminNav />
    <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
      {children}
    </Box>
  </Box>
);

function App() {
  // Auth state to control navigation
  const [auth, setAuth] = useState({
    firstStageCompleted: false,
    secondStageCompleted: false,
    isAdmin: false
  });

  // Load auth state from localStorage if available
  useEffect(() => {
    const savedAuth = localStorage.getItem('authState');
    if (savedAuth) {
      try {
        setAuth(JSON.parse(savedAuth));
      } catch (e) {
        console.error("Error parsing saved auth state:", e);
      }
    }
  }, []);

  // Save auth state to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('authState', JSON.stringify(auth));
  }, [auth]);

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Router>
        <Routes>
          {/* Original Routes */}
          <Route 
            path="/" 
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
            path="/admin" 
            element={
              <AdminProtectedRoute auth={auth}>
                <AdminLayout>
                  <Navigate to="/admin/csv" />
                </AdminLayout>
              </AdminProtectedRoute>
            } 
          />
          
          {/* CSV Management route for listing */}
          <Route 
            path="/admin/csv" 
            element={
              <AdminProtectedRoute auth={auth}>
                <AdminLayout>
                  <CSVManagement />
                </AdminLayout>
              </AdminProtectedRoute>
            } 
          />
          
          {/* CSV Management route for specific CSV */}
          <Route 
            path="/admin/csv/:csvId" 
            element={
              <AdminProtectedRoute auth={auth}>
                <AdminLayout>
                  <CSVManagement />
                </AdminLayout>
              </AdminProtectedRoute>
            } 
          />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
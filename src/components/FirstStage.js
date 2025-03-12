// src/components/FirstStage.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Container, Typography, TextField, Button, Paper, Box,
  Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions
} from '@mui/material';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import axios from 'axios';

function FirstStage({ setAuth }) {
  const [teamNumber, setTeamNumber] = useState('');
  const [passcode, setPasscode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Check for admin credentials
    if (teamNumber === 'admin' && passcode === 'admintechkriya') {
      setAuth(prev => ({ ...prev, isAdmin: true }));
      navigate('/admin');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post('https://kriya-backend.onrender.com/api/verify-first-stage', {
        teamNumber,
        passcode
      });

      if (response.data.success) {
        setAuth(prev => ({ ...prev, firstStageCompleted: true }));
        navigate('/second-stage');
      } else {
        setError('Invalid credentials. Try again.');
        setOpenDialog(true);
      }
    } catch (error) {
      setError('An error occurred. Please try again.');
      setOpenDialog(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="sm" sx={{ mt: 8 }}>
      <Paper 
        elevation={10} 
        sx={{ 
          p: 4, 
          bgcolor: 'rgba(26, 26, 26, 0.8)',
          borderRadius: 2,
          border: '1px solid #9c27b0',
          boxShadow: '0 0 15px #9c27b080'
        }}
      >
        <Box 
          sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center'
          }}
        >
          <Typography component="h1" variant="h3" gutterBottom>
            The Mystery Begins
          </Typography>
          
          <Typography variant="body1" sx={{ mb: 4, textAlign: 'center' }}>
            Enter if you dare. Provide your team's credentials to unlock the first mystery.
          </Typography>
          
          <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="teamNumber"
              label="Team Number"
              name="teamNumber"
              type="text"
              value={teamNumber}
              onChange={(e) => setTeamNumber(e.target.value)}
              variant="outlined"
              sx={{ mb: 2 }}
            />
            
            <TextField
              margin="normal"
              required
              fullWidth
              name="passcode"
              label="Passcode"
              type="text"
              id="passcode"
              value={passcode}
              onChange={(e) => setPasscode(e.target.value)}
              variant="outlined"
              sx={{ mb: 4 }}
            />
            
            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              size="large"
              disabled={loading}
              startIcon={<LockOpenIcon />}
              sx={{ py: 1.5, fontSize: '1.1rem' }}
            >
              {loading ? 'Verifying...' : 'Unlock The Mystery'}
            </Button>
          </Box>
        </Box>
      </Paper>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>{"Access Denied"}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {error || "Your credentials couldn't be verified. Please check and try again."}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)} color="primary">
            Try Again
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default FirstStage;
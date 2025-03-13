// src/components/SecondStage.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Container, Typography, TextField, Button, Paper, Box, 
  Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions
} from '@mui/material';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import axios from 'axios';

function SecondStage({ setAuth }) {
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

    try {
      const response = await axios.post('https://kriya-backend.onrender.com/api/verify-second-stage', {
        teamNumber,
        passcode
      });

      if (response.data.success) {
        setAuth(prev => ({ ...prev, secondStageCompleted: true }));
        navigate('/final-stage');
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
    <Container component="main" maxWidth="md" sx={{ mt: 4 }}>
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
            The Plot Thickens
          </Typography>
          
          <Typography variant="h6" sx={{ mb: 2, textAlign: 'center' }}>
            You've unveiled the first layer of the mystery, but secrets still remain...
            
            Another locked door stands in your way, requiring a passcode in the format "x1y2", where x1 represents the previous state and y2 is the move needed to crack the puzzle.
          </Typography>
          
          <Box 
            component="img"
            sx={{
              maxWidth: '100%',
              height: 'auto',
              my: 4,
              border: '2px solid #f50057',
              borderRadius: 1,
              boxShadow: '0 0 10px rgba(245, 0, 87, 0.5)'
            }}
            alt="Mystery Image"
            src="/img.jpg"
          />
          
          <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%', mt: 2 }}>
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
              label="Secret Key"
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
              color="secondary"
              size="large"
              disabled={loading}
              startIcon={<LockOpenIcon />}
              sx={{ py: 1.5, fontSize: '1.1rem' }}
            >
              {loading ? 'Decoding...' : 'Unlock The Final Secret'}
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

export default SecondStage;
// src/components/FinalStage.js
import React from 'react';
import { Container, Typography, Paper, Box, Link, Button } from '@mui/material';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';

function FinalStage() {
  return (
    <Container component="main" maxWidth="sm" sx={{ mt: 8 }}>
      <Paper 
        elevation={10} 
        sx={{ 
          p: 4, 
          bgcolor: 'rgba(26, 26, 26, 0.8)',
          borderRadius: 2,
          border: '1px solid #4caf50',
          boxShadow: '0 0 15px rgba(76, 175, 80, 0.5)'
        }}
      >
        <Box 
          sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center'
          }}
        >
          <EmojiEventsIcon sx={{ fontSize: 60, color: '#ffc107', mb: 2 }} />
          
          <Typography component="h1" variant="h3" gutterBottom>
            Mystery Solved!
          </Typography>
          
          <Typography variant="body1" sx={{ mb: 4, textAlign: 'center' }}>
            Congratulations! You've successfully navigated through all the challenges.
          </Typography>
          
          <Box 
            sx={{ 
              p: 3, 
              bgcolor: 'rgba(0, 0, 0, 0.5)', 
              borderRadius: 1,
              mb: 4,
              width: '100%',
              textAlign: 'center'
            }}
          >
            <Link
              href=""
              target="_blank"
              rel="noopener"
              sx={{ 
                color: '#4caf50',
                textDecoration: 'none',
                fontSize: '1.2rem',
                fontWeight: 'bold',
                '&:hover': {
                  textDecoration: 'underline'
                }
              }}
            >
              Get your second round details from volunteers by showing this screen.
            </Link>
          </Box>
          
          <Button
            variant="outlined"
            color="primary"
            href="/"
            sx={{ mt: 2 }}
          >
            Return to Start
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}

export default FinalStage;
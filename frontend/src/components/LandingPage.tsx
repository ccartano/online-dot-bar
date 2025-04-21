import React from 'react';
import { Box, Container, Typography } from '@mui/material';
import SearchBar from './SearchBar';

export const LandingPage: React.FC = () => {
  return (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F5F5F1',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0
      }}
    >
      <Container maxWidth="md">
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 4,
          }}
        >
          <Typography
            variant="h1"
            sx={{
              textAlign: 'center',
              lineHeight: 1,
              margin: 0,
              fontSize: {
                xs: '3rem',    // For extra-small devices
                sm: '4rem',    // For small devices
                md: '6rem',    // For medium devices and up
              },
              fontFamily: 'Corinthia, cursive',
              fontWeight: 400,
            }}
          >
            The Online.Bar
          </Typography>
          
          <Box sx={{ width: '100%', maxWidth: '600px' }}>
            <SearchBar />
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default LandingPage; 
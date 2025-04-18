import React from 'react';
import { Box, Container, Typography } from '@mui/material';

const LandingPage: React.FC = () => {
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
            }}
          >
            The Online.Bar
          </Typography>
          
          {/* Search functionality temporarily disabled
          <Box
            component="form"
            onSubmit={handleSearch}
            sx={{
              width: '100%',
              maxWidth: '600px',
              display: 'flex',
              gap: 2,
            }}
          >
            <SearchInput
              fullWidth
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for cocktails, ingredients..."
              variant="outlined"
              size="medium"
              sx={{ 
                flex: 1,
                '& .MuiOutlinedInput-root': {
                  height: '56px',
                }
              }}
            />
            <Button
              type="submit"
              variant="contained"
              size="large"
              sx={{
                fontFamily: 'Corinthia, cursive',
                fontSize: '1.5rem',
                px: 4,
                backgroundColor: '#9CB4A3',
                color: '#1A1A1A',
                '&:hover': {
                  backgroundColor: '#7A9084',
                },
              }}
            >
              Search
            </Button>
          </Box>
          */}
        </Box>
      </Container>
    </Box>
  );
};

export default LandingPage; 
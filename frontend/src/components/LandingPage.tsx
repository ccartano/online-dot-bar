import React from 'react';
import { Box, Container } from '@mui/material';

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
          <h1
            style={{
              fontFamily: 'Italianno, cursive',
              fontSize: '6rem',
              color: '#1A1A1A',
              textAlign: 'center',
              lineHeight: 1,
              marginBottom: '1rem',
              marginBlockStart: 0,
              marginBlockEnd: 0,
              marginInlineStart: 0,
              marginInlineEnd: 0,
            }}
          >
            The Online.Bar
          </h1>
          
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
                fontFamily: 'Italianno, cursive',
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
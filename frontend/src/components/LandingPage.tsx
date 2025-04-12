import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, TextField, Button, Container } from '@mui/material';
import { styled } from '@mui/material/styles';

const SearchInput = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    backgroundColor: '#FFFFFF',
    borderRadius: '8px',
    '& fieldset': {
      borderColor: '#E5E5E5',
    },
    '&:hover fieldset': {
      borderColor: theme.palette.primary.main,
    },
    '&.Mui-focused fieldset': {
      borderColor: theme.palette.primary.main,
    },
  },
}));

const LandingPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/cocktails?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <Box
      sx={{
        height: 'calc(100vh - 100px)', // Subtract navbar height
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F5F5F1',
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
              fontFamily: 'Italianno, cursive',
              fontSize: { xs: '4rem', sm: '5rem', md: '6rem' },
              color: '#1A1A1A',
              textAlign: 'center',
              lineHeight: 1,
              mb: 2,
            }}
          >
            The Online.Bar
          </Typography>
          
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
        </Box>
      </Container>
    </Box>
  );
};

export default LandingPage; 
import React from 'react';
import { Typography, Box } from '@mui/material';
import { Link } from 'react-router-dom';
import { Icon } from '@mdi/react';
import { Cocktail } from '../services/cocktail.service';

interface CocktailCardProps {
  cocktail: Cocktail;
}

const capitalizeWords = (str: string): string => {
  return str.split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

export const CocktailCard: React.FC<CocktailCardProps> = ({ cocktail }) => {
  return (
    <Box
      sx={{
        transition: 'transform 0.2s',
        '&:hover': {
          transform: 'scale(1.02)',
        }
      }}
    >
      <Link 
        to={`/cocktails/${cocktail.id}`} 
        style={{ 
          textDecoration: 'none',
          display: 'block',
          padding: '16px',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
          {cocktail.glassType?.icon && (
            <Icon 
              path={cocktail.glassType.icon} 
              size={1.2}
              color="#1a1a1a"
            />
          )}
          <Typography
            variant="h6"
            sx={{
              fontFamily: 'Italianno, cursive',
              fontSize: '1.8rem',
              color: '#1a1a1a',
            }}
          >
            {capitalizeWords(cocktail.name)}
          </Typography>
        </Box>
      </Link>
    </Box>
  );
}; 
import React from 'react';
import { Box, IconButton } from '@mui/material';
import { Link } from 'react-router-dom';
import { Icon } from '@mdi/react';
import { mdiPencil } from '@mdi/js';
import { Cocktail } from '../services/cocktail.service';
import { AdminService } from '../services/admin.service';

interface CocktailCardProps {
  cocktail: Cocktail;
  onEdit?: (cocktail: Cocktail) => void;
}

const capitalizeWords = (str: string): string => {
  return str.split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

export const CocktailCard: React.FC<CocktailCardProps> = ({ cocktail, onEdit }) => {
  const isAdmin = AdminService.isAdmin();

  return (
    <Box
      sx={{
        position: 'relative',
        width: '100%',
        height: '100%',
        '&:hover .edit-button': {
          opacity: 1,
        },
      }}
    >
      {isAdmin && onEdit && (
        <IconButton
          className="edit-button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onEdit(cocktail);
          }}
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            opacity: 0,
            transition: 'opacity 0.2s',
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
            },
          }}
        >
          <Icon path={mdiPencil} size={1} />
        </IconButton>
      )}
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
          <h3
            style={{
              fontFamily: "'Old Standard TT', serif",
              color: '#1a1a1a',
              margin: 0,
              padding: 0
            }}
          >
            {capitalizeWords(cocktail.name)}
          </h3>
        </Box>
      </Link>
    </Box>
  );
}; 
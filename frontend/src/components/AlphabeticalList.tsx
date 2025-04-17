import React from 'react';
import { Box, Typography, styled } from '@mui/material';
import { Link } from 'react-router-dom';

const StyledLink = styled(Box)({
  position: 'relative',
  display: 'inline-block',
  transition: 'color 0.2s ease',
  color: '#1A1A1A',
  '&:hover': {
    color: '#9CB4A3',
    '&::after': {
      transform: 'scaleX(1)'
    }
  },
  '&::after': {
    content: '""',
    position: 'absolute',
    bottom: '-2px',
    left: 0,
    right: 0,
    height: '2px',
    backgroundColor: '#9CB4A3',
    transform: 'scaleX(0)',
    transition: 'transform 0.2s ease',
    transformOrigin: 'center'
  }
});

interface AlphabeticalListProps<T> {
  items: T[];
  getItemId: (item: T) => number;
  getItemName: (item: T) => string;
  getItemLink: (item: T) => string;
  renderItem?: (item: T) => React.ReactNode;
}

export const AlphabeticalList = <T,>({ 
  items, 
  getItemId, 
  getItemName, 
  getItemLink,
  renderItem 
}: AlphabeticalListProps<T>) => {
  // Group items by first letter
  const itemsByLetter = items.reduce((acc, item) => {
    const firstLetter = getItemName(item).charAt(0).toUpperCase();
    if (!acc[firstLetter]) {
      acc[firstLetter] = [];
    }
    acc[firstLetter].push(item);
    return acc;
  }, {} as Record<string, T[]>);

  // Sort letters alphabetically
  const sortedLetters = Object.keys(itemsByLetter).sort();

  return (
    <Box sx={{ 
      flex: 1,
      height: 'fit-content',
      pr: 2,
      position: 'relative',
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100%'
    }}>
      {sortedLetters.map((letter) => {
        const letterItems = itemsByLetter[letter] || [];
        if (letterItems.length === 0) return null;

        return (
          <Box key={letter} sx={{ mb: 6 }}>
            <h2 
              style={{
                fontFamily: 'Italianno, cursive',
                fontSize: '2.5rem',
                color: '#1a1a1a',
                marginBottom: '1.5rem',
                marginBlockStart: 0,
                marginBlockEnd: 0,
                marginInlineStart: 0,
                marginInlineEnd: 0,
              }}
            >
              {letter}
            </h2>
            <Box sx={{ 
              display: 'flex', 
              flexWrap: 'wrap', 
              gap: 4,
              justifyContent: 'flex-start'
            }}>
              {letterItems.map((item) => (
                <Box 
                  key={getItemId(item)} 
                  sx={{ 
                    width: { xs: '100%', sm: 'calc(50% - 16px)', md: 'calc(33.33% - 16px)', lg: 'calc(25% - 16px)' },
                    minWidth: { xs: 'auto', sm: '250px' },
                    flexShrink: 0,
                    display: 'flex',
                    justifyContent: 'flex-start'
                  }}
                >
                  {renderItem ? (
                    renderItem(item)
                  ) : (
                    <Link
                      to={getItemLink(item)}
                      style={{ textDecoration: 'none' }}
                    >
                      <StyledLink>
                        <Typography
                          variant="body1"
                          sx={{
                            fontWeight: 'medium',
                            fontFamily: "'Old Standard TT', serif",
                            color: 'inherit',
                            fontSize: '1.2rem'
                          }}
                        >
                          {getItemName(item)}
                        </Typography>
                      </StyledLink>
                    </Link>
                  )}
                </Box>
              ))}
            </Box>
          </Box>
        );
      })}
    </Box>
  );
}; 
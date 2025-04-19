import React, { useEffect, useRef } from 'react';
import { Box, Typography, styled } from '@mui/material';
import { Link, useLocation } from 'react-router-dom';

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
  getItemId: (item: T) => number | string;
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
  const location = useLocation();
  const itemRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const containerRef = useRef<HTMLDivElement>(null);

  // Handle scroll restoration when navigating back
  useEffect(() => {
    if (location.state?.clickedItemId) {
      const itemRef = itemRefs.current[location.state.clickedItemId];
      if (itemRef && containerRef.current) {
        // Calculate the offset from the top of the container
        const containerRect = containerRef.current.getBoundingClientRect();
        const itemRect = itemRef.getBoundingClientRect();
        const offset = itemRect.top - containerRect.top;

        // Scroll the container to the item
        containerRef.current.scrollTo({
          top: containerRef.current.scrollTop + offset,
          behavior: 'smooth'
        });
      }
    }
  }, [location]);

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

  const handleClick = (itemId: string | number) => {
    // Store the clicked item ID in history state
    window.history.replaceState(
      { ...window.history.state, clickedItemId: itemId },
      ''
    );
  };

  return (
    <Box 
      ref={containerRef}
      sx={{ 
        flex: 1,
        height: 'fit-content',
        pr: 2,
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100%',
        overflow: 'auto',
        '&::-webkit-scrollbar': {
          display: 'none'
        },
        scrollbarWidth: 'none',
        msOverflowStyle: 'none'
      }}
    >
      {sortedLetters.map((letter) => {
        const letterItems = itemsByLetter[letter] || [];
        if (letterItems.length === 0) return null;

        return (
          <Box key={letter} sx={{ mb: 6 }}>
            <Typography
              variant="decorativeLarge"
              sx={{
                mb: 1.5,
                m: 0,
                fontFamily: 'Corinthia, cursive',
                fontSize: '2.5rem',
                fontWeight: 'bold'
              }}
            >
              {letter}
            </Typography>
            <Box sx={{ 
              display: 'flex', 
              flexWrap: 'wrap', 
              gap: 4,
              justifyContent: 'flex-start'
            }}>
              {letterItems.map((item) => {
                const itemId = getItemId(item);
                const link = getItemLink(item);
                return (
                  <Box 
                    key={itemId}
                    ref={(el: HTMLDivElement | null) => {
                      itemRefs.current[itemId] = el;
                    }}
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
                        to={link}
                        style={{ textDecoration: 'none' }}
                        onClick={() => handleClick(itemId)}
                      >
                        <StyledLink>
                          <Typography
                            variant="serifMedium"
                            sx={{
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
                );
              })}
            </Box>
          </Box>
        );
      })}
    </Box>
  );
}; 
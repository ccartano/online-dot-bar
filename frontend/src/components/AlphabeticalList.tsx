import React, { useEffect, useRef, useMemo, useCallback } from 'react';
import { Box, Typography, styled } from '@mui/material';
import { Link, useLocation, useNavigate } from 'react-router-dom';

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
  const navigate = useNavigate();
  const itemRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const containerRef = useRef<HTMLDivElement>(null);

  // Clear storage on initial mount if there's no navigation state
  useEffect(() => {
    if (!location.state?.clickedItemId) {
      sessionStorage.removeItem('lastClickedItem');
    }
  }, []);

  // Memoize the grouped and sorted items
  const { itemsByLetter, sortedLetters } = useMemo(() => {
    // Group items by first letter
    const grouped = items.reduce((acc, item) => {
      const firstLetter = getItemName(item).charAt(0).toUpperCase();
      if (!acc[firstLetter]) {
        acc[firstLetter] = [];
      }
      acc[firstLetter].push(item);
      return acc;
    }, {} as Record<string, T[]>);

    // Sort letters alphabetically
    const letters = Object.keys(grouped).sort();

    return { itemsByLetter: grouped, sortedLetters: letters };
  }, [items, getItemName]);

  // Memoize the click handler
  const handleClick = useCallback((itemId: string | number, link: string) => {
    sessionStorage.setItem('lastClickedItem', String(itemId));
    navigate(link, { 
      state: { clickedItemId: itemId },
      replace: false
    });
  }, [navigate]);

  // Handle scroll restoration when navigating back
  useEffect(() => {
    const storedItemId = sessionStorage.getItem('lastClickedItem');
    const itemId = location.state?.clickedItemId || storedItemId;
    
    if (itemId) {
      const timer = setTimeout(() => {
        const itemRef = itemRefs.current[itemId];
        
        if (itemRef && containerRef.current) {
          requestAnimationFrame(() => {
            const containerRect = containerRef.current!.getBoundingClientRect();
            const itemRect = itemRef.getBoundingClientRect();
            const offset = itemRect.top - containerRect.top;
            
            const buffer = 20;
            const scrollPosition = containerRef.current!.scrollTop + offset - buffer;
            
            containerRef.current!.scrollTo({
              top: scrollPosition,
              behavior: 'smooth'
            });
          });
        }
      }, 300);

      return () => clearTimeout(timer);
    }
  }, [location.state?.clickedItemId]);

  return (
    <Box 
      ref={containerRef}
      sx={{ 
        flex: 1,
        height: '100%',
        position: 'relative',
        overflowY: 'auto',
        pr: 2,
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
          <Box 
            key={letter} 
            sx={{ 
              mb: 6,
              '&:last-child': {
                mb: 2
              }
            }}
          >
            <Typography
              component="h3"
              variant="h3Corinthia"
              color="primary.main"
              fontWeight="bold"
              sx={{ mb: 2 }}>
              {letter}
            </Typography>
            <Box sx={{ 
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(2, 1fr)',
                md: 'repeat(3, 1fr)',
                lg: 'repeat(4, 1fr)'
              },
              gap: 3
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
                  >
                    {renderItem ? (
                      renderItem(item)
                    ) : (
                      <Link
                        to={link}
                        style={{ textDecoration: 'none' }}
                        onClick={(e) => {
                          e.preventDefault();
                          handleClick(itemId, link);
                        }}
                      >
                        <StyledLink>
                          <Typography 
                            component="p"
                            variant="body1">
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
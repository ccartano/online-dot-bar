import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Box } from '@mui/material';
import { Cocktail } from '../services/cocktail.service';
import { GlassType } from '../types/glass.types';
import { FilterSidebar } from './FilterSidebar';
import { AlphabeticalList } from './AlphabeticalList';

// Helper function to capitalize words
const capitalizeWords = (str: string): string => {
  return str
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

const baseSpirits = ['Gin', 'Whiskey', 'Vodka', 'Rum', 'Tequila', 'Brandy', 'Other'] as const;
type BaseSpirit = typeof baseSpirits[number];

export const CocktailsPage: React.FC = () => {
  const [cocktails, setCocktails] = useState<Cocktail[]>([]);
  const [glassTypeMap, setGlassTypeMap] = useState<Record<number, string>>({});
  const [selectedGlassTypes, setSelectedGlassTypes] = useState<string[]>([]);
  const [selectedSpirits, setSelectedSpirits] = useState<BaseSpirit[]>([]);
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('search') || '';

  useEffect(() => {
    const fetchCocktails = async () => {
      try {
        const params = new URLSearchParams();
        if (searchQuery) {
          params.append('name', searchQuery);
        }
        if (selectedGlassTypes.length > 0) {
          params.append('glassTypeNames', selectedGlassTypes.join(','));
        }
        if (selectedSpirits.length > 0) {
          // Convert spirits to ingredient IDs - this is a simplification
          // In a real app, you'd want to map spirits to specific ingredient IDs
          const spiritIngredientIds = selectedSpirits.map(spirit => {
            switch(spirit) {
              case 'Gin': return 1;
              case 'Whiskey': return 2;
              case 'Vodka': return 3;
              case 'Rum': return 4;
              case 'Tequila': return 5;
              case 'Brandy': return 6;
              default: return 7;
            }
          });
          params.append('ingredientIds', spiritIngredientIds.join(','));
        }
        
        const response = await fetch(`/api/cocktails?${params.toString()}`);
        const data = await response.json();
        setCocktails(data);
      } catch (error) {
        console.error('Error fetching cocktails:', error);
      }
    };

    fetchCocktails();
  }, [searchQuery, selectedGlassTypes, selectedSpirits]);

  useEffect(() => {
    const fetchGlassTypes = async () => {
      try {
        const response = await fetch('/api/glass-types');
        const data = await response.json();
        const glassTypeMap = data.reduce((acc: Record<number, string>, type: GlassType) => {
          acc[type.id] = type.name;
          return acc;
        }, {});
        setGlassTypeMap(glassTypeMap);
      } catch (error) {
        console.error('Error fetching glass types:', error);
      }
    };

    fetchGlassTypes();
  }, []);

  const handleGlassTypeChange = (glassType: string) => {
    setSelectedGlassTypes(prev => {
      if (prev.includes(glassType)) {
        return prev.filter(g => g !== glassType);
      } else {
        return [...prev, glassType];
      }
    });
  };

  const handleSpiritChange = (spirit: BaseSpirit) => {
    setSelectedSpirits(prev => {
      if (prev.includes(spirit)) {
        return prev.filter(s => s !== spirit);
      } else {
        return [...prev, spirit];
      }
    });
  };

  const filterSections = [
    {
      title: 'Base Spirit',
      options: baseSpirits.map(spirit => ({
        id: spirit,
        label: spirit,
        checked: selectedSpirits.includes(spirit),
        onChange: () => handleSpiritChange(spirit)
      }))
    },
    {
      title: 'Glass Type',
      options: Object.entries(glassTypeMap).map(([id, name]) => ({
        id,
        label: name,
        checked: selectedGlassTypes.includes(name),
        onChange: () => handleGlassTypeChange(name)
      }))
    }
  ];

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      height: 'calc(100vh - 64px)',
      overflow: 'hidden',
      position: 'relative'
    }}>
      <Box sx={{ 
        display: 'flex', 
        gap: { xs: 0, sm: 4 }, 
        height: '100%',
        overflow: 'hidden',
        position: 'relative'
      }}>
        <FilterSidebar sections={filterSections} />
        <Box sx={{ 
          flex: 1, 
          overflow: 'auto',
          p: 2,
          '&::-webkit-scrollbar': {
            display: 'none'
          },
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          overflowY: 'auto',
          overflowX: 'hidden'
        }}>
          <AlphabeticalList
            items={cocktails}
            getItemId={(item) => item.id}
            getItemName={(item) => capitalizeWords(item.name)}
            getItemLink={(item) => `/cocktails/${item.id}`}
          />
        </Box>
      </Box>
    </Box>
  );
}; 
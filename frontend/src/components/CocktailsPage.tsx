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
        const response = await fetch('/api/cocktails');
        const data = await response.json();
        setCocktails(data);
        
       
      } catch (error) {
        console.error('Error fetching cocktails:', error);
      }
    };

    fetchCocktails();
  }, []);

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
      const newGlassTypes = prev.includes(glassType)
        ? prev.filter(g => g !== glassType)
        : [...prev, glassType];
      return newGlassTypes;
    });
  };

  const handleSpiritChange = (spirit: BaseSpirit) => {
    setSelectedSpirits(prev => {
      const newSpirits = prev.includes(spirit)
        ? prev.filter(s => s !== spirit)
        : [...prev, spirit];
      return newSpirits;
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

  const filteredCocktails = cocktails
    .filter(cocktail => {
      // Apply search filter
      if (searchQuery && !cocktail.name.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }

      // Apply glass type filter
      if (selectedGlassTypes.length > 0) {
        const glassName = cocktail.glassTypeId ? glassTypeMap[cocktail.glassTypeId] : 'Unknown';
        if (!selectedGlassTypes.includes(glassName)) {
          return false;
        }
      }

      // Apply spirit filter
      if (selectedSpirits.length > 0) {
        const spiritIngredients = cocktail.ingredients
          .filter(i => i.ingredient?.type?.toLowerCase() === 'spirit')
          .map(i => ({
            name: i.ingredient.name,
            type: i.ingredient.type,
            category: (() => {
              const name = i.ingredient.name.toLowerCase();
              if (name.includes('gin')) return 'Gin';
              if (name.includes('whiskey') || name.includes('whisky') || name.includes('bourbon') || name.includes('scotch') || name.includes('rye')) return 'Whiskey';
              if (name.includes('vodka')) return 'Vodka';
              if (name.includes('rum') || name.includes('rhum')) return 'Rum';
              if (name.includes('tequila') || name.includes('mezcal')) return 'Tequila';
              if (name.includes('brandy') || name.includes('cognac') || name.includes('armagnac')) return 'Brandy';
              return 'Other';
            })()
          }));

        const cocktailSpirits = spiritIngredients.map(i => i.category);
        
        if (!selectedSpirits.some(spirit => cocktailSpirits.includes(spirit))) {
          return false;
        }
      }

      return true;
    })
    .sort((a, b) => a.name.localeCompare(b.name));

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
            items={filteredCocktails}
            getItemId={(item) => item.slug}
            getItemName={(item) => capitalizeWords(item.name)}
            getItemLink={(item) => `/cocktails/${item.slug}`}
          />
        </Box>
      </Box>
    </Box>
  );
}; 
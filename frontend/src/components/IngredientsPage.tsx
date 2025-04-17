import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Box } from '@mui/material';
import { Ingredient, IngredientType } from '../types/ingredient.types';
import { FilterSidebar } from './FilterSidebar';
import { AlphabeticalList } from './AlphabeticalList';

// Helper function to capitalize words
const capitalizeWords = (str: string): string => {
  return str
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

export const IngredientsPage: React.FC = () => {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<IngredientType[]>([]);
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('search') || '';

  useEffect(() => {
    const fetchIngredients = async () => {
      try {
        const response = await fetch('/api/ingredients');
        const data = await response.json();
        setIngredients(data);
      } catch (error) {
        console.error('Error fetching ingredients:', error);
      }
    };

    fetchIngredients();
  }, []);

  const handleTypeChange = (type: IngredientType) => {
    setSelectedTypes(prev => {
      if (prev.includes(type)) {
        return prev.filter(t => t !== type);
      } else {
        return [...prev, type];
      }
    });
  };

  const filterSections = [
    {
      title: 'Ingredient Type',
      options: Object.values(IngredientType).map(type => ({
        id: type,
        label: capitalizeWords(type),
        checked: selectedTypes.includes(type),
        onChange: () => handleTypeChange(type)
      }))
    }
  ];

  const filteredIngredients = ingredients.filter(ingredient => {
    // Apply search filter
    if (searchQuery && !ingredient.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }

    // Apply type filter
    if (selectedTypes.length > 0 && !selectedTypes.includes(ingredient.type)) {
      return false;
    }

    return true;
  });

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      minHeight: 'calc(100vh - 64px)',
      position: 'relative'
    }}>
      <Box sx={{ 
        display: 'flex', 
        gap: { xs: 0, sm: 4 }, 
        flex: 1,
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
          msOverflowStyle: 'none'
        }}>
          <AlphabeticalList
            items={filteredIngredients}
            getItemId={(item) => item.id}
            getItemName={(item) => capitalizeWords(item.name)}
            getItemLink={(item) => `/ingredients/${item.id}`}
          />
        </Box>
      </Box>
    </Box>
  );
}; 
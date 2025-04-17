import React, { useEffect, useState, useMemo } from 'react';
import { Box } from '@mui/material';
import { Ingredient, IngredientType } from '../types/ingredient.types';
import { fetchIngredients } from '../services/ingredient.service';
import { FilterSidebar } from './FilterSidebar';
import { AlphabeticalList } from './AlphabeticalList';

// Helper function to capitalize words (similar to CocktailCard)
const capitalizeWords = (str: string): string => {
  if (!str) return '';
  return str.split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

export const IngredientsPage: React.FC = () => {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTypes, setSelectedTypes] = useState<IngredientType[]>([]);

  useEffect(() => {
    const loadIngredients = async () => {
      try {
        setLoading(true);
        const data = await fetchIngredients();
        setIngredients(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    loadIngredients();
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

  const filteredIngredients = useMemo(() => {
    if (selectedTypes.length === 0) {
      return ingredients;
    }
    return ingredients.filter(ingredient => selectedTypes.includes(ingredient.type));
  }, [ingredients, selectedTypes]);

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

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (error) {
    return <div className="flex justify-center items-center h-screen text-red-500">Error: {error}</div>;
  }

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      height: '100%',
      overflow: 'hidden'
    }}>
      <Box sx={{ 
        display: 'flex', 
        gap: 4, 
        flex: 1, 
        minHeight: 0,
        overflow: 'hidden',
        position: 'relative'
      }}>
        <FilterSidebar sections={filterSections} />
        <Box sx={{ flex: 1, overflow: 'auto' }}>
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
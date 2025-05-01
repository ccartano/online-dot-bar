import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Box } from '@mui/material';
import { Ingredient } from '../types/ingredient.types';
import { FilterSidebar, FilterSection } from './FilterSidebar';
import { AlphabeticalList } from './AlphabeticalList';
import { LoadingState } from './LoadingState';
import { getIngredientTypeLabel } from '../utils/ingredientUtils';
import { SEO } from './SEO';
import { IngredientType } from '../utils/constants';

// Move this outside the component to prevent recreation
const capitalizeWords = (str: string): string => {
  return str
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

export const IngredientsPage: React.FC = () => {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<IngredientType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('search') || '';

  // Memoize the fetch function
  const fetchIngredients = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/ingredients');
      const data = await response.json();
      setIngredients(data);
      setError(null);
    } catch (error) {
      console.error('Error fetching ingredients:', error);
      setError('Failed to load ingredients. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchIngredients();
  }, [fetchIngredients]);

  // Memoize the type change handler
  const handleTypeChange = useCallback((type: IngredientType) => {
    setSelectedTypes(prev => {
      if (prev.includes(type)) {
        return prev.filter(t => t !== type);
      } else {
        return [...prev, type];
      }
    });
  }, []);

  // Memoize filter sections to prevent unnecessary recalculations
  const filterSections: FilterSection[] = useMemo(() => [
    {
      title: 'Ingredient Type',
      options: (Object.values(IngredientType) as IngredientType[]).map(type => ({
        id: type,
        label: getIngredientTypeLabel(type),
        checked: selectedTypes.includes(type),
        onChange: () => handleTypeChange(type)
      }))
    }
  ], [selectedTypes, handleTypeChange]);

  // Memoize filtered ingredients
  const filteredIngredients = useMemo(() => {
    return ingredients.filter(ingredient => {
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
  }, [ingredients, searchQuery, selectedTypes]);

  // Memoize item handlers to prevent recreation on each render
  const itemHandlers = useMemo(() => ({
    getItemId: (item: Ingredient) => item.slug,
    getItemName: (item: Ingredient) => capitalizeWords(item.name),
    getItemLink: (item: Ingredient) => `/ingredients/${item.slug}`
  }), []);

  return (
    <>
      <SEO 
        title="Cocktail Ingredients A-Z | The Online.Bar"
        description="Browse our comprehensive A-Z list of cocktail ingredients. Find spirits, liqueurs, mixers, garnishes, and more with detailed information about each ingredient."
      />
      <LoadingState loading={loading} error={error}>
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
                {...itemHandlers}
              />
            </Box>
          </Box>
        </Box>
      </LoadingState>
    </>
  );
}; 
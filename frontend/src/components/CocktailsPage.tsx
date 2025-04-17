import { useEffect, useState } from 'react';
import { Cocktail } from '../services/cocktail.service';
import { Box } from '@mui/material';
import { getApiUrl } from '../config/api.config';
import { BaseSpirit, getBaseSpirit } from '../utils/spiritUtils';
import { GlassType } from '../types/glass.types';
import { FilterSidebar } from './FilterSidebar';
import { AlphabeticalList } from './AlphabeticalList';

// Helper function to capitalize words
const capitalizeWords = (str: string): string => {
  if (!str) return '';
  return str.split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

export const CocktailsPage: React.FC = () => {
  const [cocktails, setCocktails] = useState<Cocktail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSpirits, setSelectedSpirits] = useState<BaseSpirit[]>([]);
  const [selectedGlassTypes, setSelectedGlassTypes] = useState<string[]>([]);
  const [glassTypeMap, setGlassTypeMap] = useState<Record<number, string>>({});
  const [glassTypes, setGlassTypes] = useState<GlassType[]>([]);

  useEffect(() => {
    fetchCocktails();
    fetchGlassTypes();
  }, []);

  const fetchCocktails = async () => {
    try {
      const response = await fetch(getApiUrl('/cocktails'));
      if (!response.ok) {
        throw new Error('Failed to fetch cocktails');
      }
      const data = await response.json();
      setCocktails(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  const fetchGlassTypes = async () => {
    try {
      const response = await fetch(getApiUrl('/glass-types'));
      if (!response.ok) {
        throw new Error('Failed to fetch glass types');
      }
      const data = await response.json();
      const map = data.reduce((acc: Record<number, string>, glassType: { id: number; name: string }) => {
        acc[glassType.id] = glassType.name;
        return acc;
      }, {});
      setGlassTypeMap(map);
      setGlassTypes(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    }
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

  const handleGlassTypeChange = (glassType: string) => {
    setSelectedGlassTypes(prev => {
      if (prev.includes(glassType)) {
        return prev.filter(g => g !== glassType);
      } else {
        return [...prev, glassType];
      }
    });
  };

  const filteredCocktails = cocktails.filter(cocktail => {
    const spirit = getBaseSpirit(cocktail.ingredients.map(i => ({ ingredient: { name: i.ingredient.name } })));
    const matchesSpirit = selectedSpirits.length === 0 || selectedSpirits.includes(spirit);
    const glassName = cocktail.glassTypeId ? glassTypeMap[cocktail.glassTypeId] : 'Unknown';
    const matchesGlass = selectedGlassTypes.length === 0 || selectedGlassTypes.includes(glassName);
    return matchesSpirit && matchesGlass;
  });

  const filterSections = [
    {
      title: 'Spirit',
      options: (['Gin', 'Whiskey', 'Vodka', 'Rum', 'Tequila', 'Brandy', 'Other'] as BaseSpirit[]).map(spirit => ({
        id: spirit,
        label: spirit,
        checked: selectedSpirits.includes(spirit),
        onChange: () => handleSpiritChange(spirit)
      }))
    },
    {
      title: 'Glass Type',
      options: Object.values(glassTypeMap).map(glassName => ({
        id: glassName,
        label: glassName,
        checked: selectedGlassTypes.includes(glassName),
        onChange: () => handleGlassTypeChange(glassName)
      }))
    }
  ];

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (error) {
    return <div className="flex justify-center items-center h-screen text-red-500">{error}</div>;
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
            items={filteredCocktails}
            getItemId={(item) => item.id}
            getItemName={(item) => capitalizeWords(item.name)}
            getItemLink={(item) => `/cocktails/${item.id}`}
          />
        </Box>
      </Box>
    </Box>
  );
}; 
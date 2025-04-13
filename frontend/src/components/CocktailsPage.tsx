import { useEffect, useState } from 'react';
import { Cocktail } from '../services/cocktail.service';
import { Alert, Snackbar, Box } from '@mui/material';
import { CocktailCard } from './CocktailCard';
import { getApiUrl } from '../config/api.config';
import { BaseSpirit, getBaseSpirit } from '../utils/spiritUtils';
import { CocktailFilters } from './CocktailFilters';

export const CocktailsPage: React.FC = () => {
  const [cocktails, setCocktails] = useState<Cocktail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSpirits, setSelectedSpirits] = useState<BaseSpirit[]>([]);
  const [selectedGlassTypes, setSelectedGlassTypes] = useState<string[]>([]);
  const [glassTypeMap, setGlassTypeMap] = useState<Record<number, string>>({});
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

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

  console.log('Glass Type Map:', glassTypeMap);
  console.log('Selected Glass Types:', selectedGlassTypes);

  const filteredCocktails = cocktails.filter(cocktail => {
    const spirit = getBaseSpirit(cocktail.ingredients.map(i => ({ ingredient: { name: i.ingredient.name } })));
    const matchesSpirit = selectedSpirits.length === 0 || selectedSpirits.includes(spirit);
    const glassName = cocktail.glassTypeId ? glassTypeMap[cocktail.glassTypeId] : 'Unknown';
    console.log('Cocktail:', cocktail.name, 'Glass ID:', cocktail.glassTypeId, 'Glass Name:', glassName);
    const matchesGlass = selectedGlassTypes.length === 0 || selectedGlassTypes.includes(glassName);
    return matchesSpirit && matchesGlass;
  });

  // Group cocktails by first letter
  const cocktailsByLetter = filteredCocktails.reduce((acc, cocktail) => {
    const firstLetter = cocktail.name.charAt(0).toUpperCase();
    if (!acc[firstLetter]) {
      acc[firstLetter] = [];
    }
    acc[firstLetter].push(cocktail);
    return acc;
  }, {} as Record<string, Cocktail[]>);

  // Sort letters alphabetically
  const sortedLetters = Object.keys(cocktailsByLetter).sort();

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (error) {
    return <div className="flex justify-center items-center h-screen text-red-500">{error}</div>;
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <Box sx={{ display: 'flex', gap: 4, flex: 1, minHeight: 0, overflow: 'hidden' }}>
        <CocktailFilters
          selectedSpirits={selectedSpirits}
          selectedGlassTypes={selectedGlassTypes}
          glassTypeMap={glassTypeMap}
          onSpiritChange={handleSpiritChange}
          onGlassTypeChange={handleGlassTypeChange}
        />

        <Box sx={{ 
          flex: 1,
          height: '100%',
          pr: 2,
          overflowY: 'auto',
          position: 'relative'
        }}>
          {sortedLetters.map((letter) => {
            const letterCocktails = cocktailsByLetter[letter] || [];
            if (letterCocktails.length === 0) return null;

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
                  {letterCocktails.map((cocktail) => (
                    <Box 
                      key={cocktail.id} 
                      sx={{ 
                        width: 'calc(25% - 12px)',
                        minWidth: '250px',
                        flexShrink: 0,
                        display: 'flex',
                        justifyContent: 'flex-start'
                      }}
                    >
                      <CocktailCard cocktail={cocktail} />
                    </Box>
                  ))}
                </Box>
              </Box>
            );
          })}
        </Box>
      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}; 
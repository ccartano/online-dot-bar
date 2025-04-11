import { useEffect, useState } from 'react';
import { Cocktail } from '../services/cocktail.service';
import { Alert, Snackbar, Box, Typography, Checkbox, FormControlLabel, FormGroup, Divider } from '@mui/material';
import { CocktailCard } from './CocktailCard';
import { getApiUrl } from '../config/api.config';
import { BaseSpirit, getBaseSpirit } from '../utils/spiritUtils';

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
    const glassName = glassTypeMap[cocktail.glassTypeId] || 'Unknown';
    console.log('Cocktail:', cocktail.name, 'Glass Name:', glassName);
    const matchesGlass = selectedGlassTypes.length === 0 || selectedGlassTypes.includes(glassName);
    return matchesSpirit && matchesGlass;
  });

  const cocktailsBySpirit = filteredCocktails.reduce((acc, cocktail) => {
    const spirit = getBaseSpirit(cocktail.ingredients.map(i => ({ ingredient: { name: i.ingredient.name } })));
    if (!acc[spirit]) {
      acc[spirit] = [];
    }
    acc[spirit].push(cocktail);
    return acc;
  }, {} as Record<BaseSpirit, Cocktail[]>);

  const spiritOrder: BaseSpirit[] = ['Gin', 'Whiskey', 'Vodka', 'Rum', 'Tequila', 'Brandy', 'Other'];

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (error) {
    return <div className="flex justify-center items-center h-screen text-red-500">{error}</div>;
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ display: 'flex', gap: 4 }}>
        <Box sx={{ width: 240, flexShrink: 0, p: 2, borderRight: '1px solid #e0e0e0' }}>
          <Typography variant="h6" sx={{ fontFamily: 'Italianno, cursive', fontSize: '2rem', mb: 2 }}>
            Filters
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
            Spirit
          </Typography>
          <FormGroup sx={{ pl: 2, mb: 4 }}>
            {spiritOrder.map((spirit) => (
              <FormControlLabel
                key={spirit}
                control={
                  <Checkbox
                    checked={selectedSpirits.includes(spirit)}
                    onChange={() => handleSpiritChange(spirit)}
                  />
                }
                label={spirit}
                sx={{ mb: 1 }}
              />
            ))}
          </FormGroup>
          <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
            Glass Type
          </Typography>
          <FormGroup sx={{ pl: 2 }}>
            {Object.values(glassTypeMap).map((glassName) => (
              <FormControlLabel
                key={glassName}
                control={
                  <Checkbox
                    checked={selectedGlassTypes.includes(glassName)}
                    onChange={() => handleGlassTypeChange(glassName)}
                  />
                }
                label={glassName}
                sx={{ mb: 1 }}
              />
            ))}
          </FormGroup>
        </Box>

        <Box sx={{ flexGrow: 1 }}>
          {spiritOrder.map((spirit) => {
            const spiritCocktails = cocktailsBySpirit[spirit] || [];
            if (spiritCocktails.length === 0) return null;

            return (
              <Box key={spirit} sx={{ mb: 6 }}>
                <Typography 
                  variant="h4" 
                  component="h2"
                  sx={{
                    fontFamily: 'Italianno, cursive',
                    fontSize: '2.5rem',
                    color: '#1a1a1a',
                    mb: 3,
                  }}
                >
                  {spirit}
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                  {spiritCocktails.map((cocktail) => (
                    <Box key={cocktail.id} sx={{ width: { xs: '100%', sm: 'calc(50% - 16px)', md: 'calc(33.33% - 16px)', lg: 'calc(25% - 16px)' } }}>
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
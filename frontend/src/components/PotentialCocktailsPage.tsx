import { useEffect, useState } from 'react';
import { CocktailTable } from './CocktailTable';
import { PaperlessDocument } from '../types/paperless.types';
import { Cocktail } from '../services/cocktail.service';
import { Alert, Snackbar, Box, Button, Typography } from '@mui/material';
import { getApiUrl } from '../config/api.config';
import { CocktailParserService } from '../services/cocktail-parser.service';
import { GlassType } from '../types/glass.types';
import { detectGlassTypeFromInstructions } from '../utils/glassTypeDetector';
import { SEO } from './SEO';

export const PotentialCocktailsPage: React.FC = () => {
  const [cocktails, setCocktails] = useState<Cocktail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showOnlyPending] = useState(true);
  const [glassTypes, setGlassTypes] = useState<GlassType[]>([]);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchCocktailsAndGlassTypes = async (page: number = 1) => {
    if (page === 1) {
      setLoading(true);
    } else {
      setIsLoadingMore(true);
    }
    try {
      const response = await fetch(getApiUrl(`/paperless/documents?page=${page}`));
      if (!response.ok) {
        throw new Error('Failed to fetch documents');
      }
      const { documents, hasMore: morePages } = await response.json();
      
      // Fetch Glass Types first
      const glassResponse = await fetch(getApiUrl('/glass-types'));
      if (!glassResponse.ok) throw new Error('Failed to fetch glass types');
      const glassData = await glassResponse.json();
      setGlassTypes(glassData);
      
      // Parse cocktails using the appropriate service based on document tags
      const parsedCocktails = CocktailParserService.parseCocktailsFromDocuments(documents)
        .map(cocktail => {
          // Detect glass type from instructions
          const detectedGlassType = detectGlassTypeFromInstructions(cocktail.instructions || '', glassData);
          
          return {
            ...cocktail,
            created: documents.find((doc: PaperlessDocument) => doc.id === cocktail.paperlessId)?.created,
            glassType: detectedGlassType || undefined,
            glassTypeId: detectedGlassType?.id || undefined
          } as Cocktail;
        });
      
      // Check status for each cocktail
      const cocktailsWithStatus = await Promise.all(
        parsedCocktails.map(async (cocktail) => {
          try {
            const statusResponse = await fetch(getApiUrl(`/cocktails/paperless/${cocktail.paperlessId}`));
            if (!statusResponse.ok) {
              return {
                ...cocktail,
                status: 'pending' as const
              };
            }
            const contentType = statusResponse.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
              const data = await statusResponse.json();
              return {
                ...cocktail,
                status: data.status || 'active'
              };
            } else {
              return {
                ...cocktail,
                status: 'pending' as const
              };
            }
          } catch (err) {
            console.error('Error fetching status for cocktail:', err);
            return {
              ...cocktail,
              status: 'pending' as const
            };
          }
        })
      );
      
      // Remove duplicates based on paperlessId when appending new cocktails
      setCocktails(prev => {
        if (page === 1) {
          return cocktailsWithStatus;
        }
        
        // Create a map of existing cocktails by paperlessId
        const existingCocktails = new Map(prev.map(c => [c.paperlessId, c]));
        
        // Add new cocktails, skipping any that already exist
        cocktailsWithStatus.forEach(cocktail => {
          if (!existingCocktails.has(cocktail.paperlessId)) {
            existingCocktails.set(cocktail.paperlessId, cocktail);
          }
        });
        
        // Convert the map back to an array
        return Array.from(existingCocktails.values());
      });
      
      setHasMore(morePages);
      setCurrentPage(page);

      // If showing only pending cocktails and all cocktails on this page are active,
      // automatically load the next page
      if (showOnlyPending && morePages && cocktailsWithStatus.every(c => c.status === 'active')) {
        fetchCocktailsAndGlassTypes(page + 1);
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
      setIsLoadingMore(false);
    }
  };

  const handleLoadMore = () => {
    if (!isLoadingMore && hasMore) {
      fetchCocktailsAndGlassTypes(currentPage + 1);
    }
  };

  useEffect(() => {
    fetchCocktailsAndGlassTypes(1);
  }, []);

  const handleCocktailUpdate = async (updatedCocktail: Cocktail) => {
    try {
      // First get all ingredients
      const ingredientsResponse = await fetch(getApiUrl('/ingredients'));
      if (!ingredientsResponse.ok) {
        throw new Error('Failed to fetch ingredients');
      }
      const allIngredients = await ingredientsResponse.json();

      // Create or get all ingredients
      const ingredientPromises = updatedCocktail.ingredients.map(async (ingredient) => {
        // Find existing ingredient
        const existingIngredient = allIngredients.find(
          (i: { name: string }) => i.name.toLowerCase() === ingredient.ingredient.name.toLowerCase()
        );
        
        if (existingIngredient) {
          return existingIngredient.id;
        }

        // Create new ingredient if it doesn't exist
        const createResponse = await fetch(getApiUrl('/ingredients'), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: ingredient.ingredient.name
          }),
        });

        if (!createResponse.ok) {
          throw new Error('Failed to create ingredient');
        }

        const newIngredient = await createResponse.json();
        return newIngredient.id;
      });

      const ingredientIds = await Promise.all(ingredientPromises);

      // Now create the cocktail with the ingredient IDs
      const response = await fetch(getApiUrl('/cocktails'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: updatedCocktail.name,
          instructions: updatedCocktail.instructions,
          paperlessId: updatedCocktail.paperlessId,
          glassTypeId: updatedCocktail.glassType?.id ?? null,
          ingredients: updatedCocktail.ingredients.map((ingredient, index) => ({
            ingredientId: ingredientIds[index],
            amount: ingredient.amount,
            unit: ingredient.unit,
            order: index
          }))
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create cocktail');
      }

      // Update the status of the cocktail in the list
      setCocktails(cocktails.map(cocktail => 
        cocktail.id === updatedCocktail.id 
          ? { ...cocktail, status: 'active' }
          : cocktail
      ));

      setSnackbar({
        open: true,
        message: 'Cocktail created successfully!',
        severity: 'success',
      });
    } catch (err) {
      console.error('Error creating cocktail:', err);
      setSnackbar({
        open: true,
        message: err instanceof Error ? err.message : 'Failed to create cocktail',
        severity: 'error',
      });
    }
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const filteredCocktails = (showOnlyPending
    ? cocktails.filter(cocktail => cocktail.status === 'pending')
    : cocktails
  ).sort((a, b) => a.name.localeCompare(b.name));

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (error) {
    return <div className="flex justify-center items-center h-screen text-red-500">{error}</div>;
  }

  return (
    <>
      <SEO 
        title="What Can I Make? - The Online.Bar"
        description="Discover cocktails you can make with ingredients you have. Find recipes based on your available ingredients and explore new drink possibilities."
      />
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" sx={{ mb: 3 }}>
          Potential Cocktails
        </Typography>
        <CocktailTable
          cocktails={filteredCocktails}
          onCocktailUpdate={handleCocktailUpdate}
          glassTypes={glassTypes}
          showDelete={false}
          searchTerm={searchTerm}
          onSearchChange={handleSearchChange}
        />
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {hasMore && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
              <Button
                variant="contained"
                onClick={handleLoadMore}
                disabled={isLoadingMore}
                sx={{ minWidth: 200 }}
              >
                {isLoadingMore ? 'Loading...' : 'Load More'}
              </Button>
            </Box>
          )}
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
    </>
  );
}; 
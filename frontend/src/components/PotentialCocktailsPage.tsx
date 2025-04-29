import { useEffect, useState } from 'react';
import { CocktailTable } from './CocktailTable';
import { PaperlessDocument } from '../types/paperless.types';
import { Cocktail } from '../types/cocktail.types';
import { Alert, Snackbar, Box, Button, Typography, FormControl, InputLabel, Select, MenuItem, SelectChangeEvent } from '@mui/material';
import { getApiUrl } from '../config/api.config';
import { CocktailParserService } from '../services/cocktail-parsing';
import { GlassType } from '../types/glass.types';
import { detectGlassTypeFromInstructions } from '../utils/glassTypeDetector';
import { SEO } from './SEO';
import { AdminService } from '../services/admin.service';

// Tag ID to name mapping
const TAG_MAP: Record<string, string> = {
  '2': 'American Bartenders Handbook',
  '3': 'Encylopedia'
};

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
  const [selectedTag, setSelectedTag] = useState<string>('');
  const availableTags = Object.entries(TAG_MAP).map(([id, name]) => ({ id, name }));

  const fetchCocktailsAndGlassTypes = async (page: number = 1) => {
    console.log('fetchCocktailsAndGlassTypes called with page:', page, 'and tag:', selectedTag);
    if (!selectedTag) {
      console.log('No tag selected, returning early');
      setCocktails([]);
      setHasMore(false);
      return;
    }

    if (page === 1) {
      setLoading(true);
    } else {
      setIsLoadingMore(true);
    }
    try {
      // Build the API URL with query parameters
      const params = new URLSearchParams({
        page: page.toString(),
        page_size: '200',
        ordering: '-created',
        truncate_content: 'false',
        tags__id__all: selectedTag
      });

      const url = getApiUrl(`/paperless/documents?${params.toString()}`);
      console.log('Making API call to:', url);

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch documents');
      }
      const { documents, hasMore: morePages } = await response.json();
      console.log('Received response with', documents.length, 'documents');
      
      // Fetch cocktails and glass types in one call
      const cocktailsResponse = await fetch(getApiUrl('/cocktails/with-glass-types'));
      if (!cocktailsResponse.ok) throw new Error('Failed to fetch cocktails and glass types');
      const { glassTypes } = await cocktailsResponse.json();
      setGlassTypes(glassTypes);
      
      // Parse cocktails using the appropriate service based on document tags
      const parsedCocktails = CocktailParserService.parseCocktailsFromDocuments(documents)
        .map(cocktail => {
          // Detect glass type from instructions
          const detectedGlassType = detectGlassTypeFromInstructions(cocktail.instructions || '', glassTypes);
          
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
      console.error('Error in fetchCocktailsAndGlassTypes:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
      setIsLoadingMore(false);
    }
  };

  const handleTagChange = (event: SelectChangeEvent) => {
    const newTag = event.target.value;
    console.log('Tag changed to:', newTag);
    setSelectedTag(newTag);
    setCurrentPage(1); // Reset to first page when changing tags
    if (!newTag) {
      console.log('No tag selected, clearing results');
      setCocktails([]);
      setHasMore(false);
    }
  };

  useEffect(() => {
    if (selectedTag) {
      console.log('Selected tag changed to:', selectedTag, 'making API call');
      fetchCocktailsAndGlassTypes(1);
    }
  }, [selectedTag]);

  useEffect(() => {
    setLoading(false); // No need to fetch tags anymore
  }, []);

  const handleLoadMore = () => {
    if (!isLoadingMore && hasMore) {
      fetchCocktailsAndGlassTypes(currentPage + 1);
    }
  };

  const handleCocktailUpdate = async (updatedCocktail: Cocktail) => {
    try {
      // First get all ingredients
      const ingredientsResponse = await fetch(getApiUrl('/ingredients'));
      if (!ingredientsResponse.ok) {
        throw new Error('Failed to fetch ingredients');
      }
      const allIngredients = await ingredientsResponse.json();

      // Create or get all ingredients
      const ingredientPromises = updatedCocktail.ingredients.map(async (ingredient: Cocktail['ingredients'][0]) => {
        // Find existing ingredient
        const existingIngredient = allIngredients.find(
          (i: { name: string }) => i.name.toLowerCase() === ingredient.ingredient.name.toLowerCase()
        );
        
        if (existingIngredient) {
          return existingIngredient.id;
        }

        // Create new ingredient if it doesn't exist
        const headers = await AdminService.getAdminHeaders();
        const createResponse = await fetch(getApiUrl('/ingredients'), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...headers,
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
      const headers = await AdminService.getAdminHeaders();
      const response = await fetch(getApiUrl('/cocktails'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
        body: JSON.stringify({
          name: updatedCocktail.name,
          instructions: updatedCocktail.instructions,
          paperlessId: updatedCocktail.paperlessId,
          glassTypeId: updatedCocktail.glassType?.id ?? null,
          ingredients: updatedCocktail.ingredients.map((ingredient: Cocktail['ingredients'][0], index: number) => ({
            ingredientId: ingredientIds[index],
            amount: ingredient.amount,
            unit: ingredient.unit,
            order: index
          }))
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create cocktail');
      }

      // Update the status of the cocktail in the list
      setCocktails(prevCocktails => 
        prevCocktails.map(cocktail => 
          cocktail.paperlessId === updatedCocktail.paperlessId
          ? { ...cocktail, status: 'active' }
          : cocktail
        )
      );

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
        <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel id="tag-filter-label">Filter by Tag</InputLabel>
            <Select
              labelId="tag-filter-label"
              value={selectedTag}
              label="Filter by Tag"
              onChange={handleTagChange}
            >
              <MenuItem value="">Select a tag to view cocktails</MenuItem>
              {availableTags.map(tag => (
                <MenuItem key={tag.id} value={tag.id}>{tag.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
        {selectedTag ? (
          <>
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
          </>
        ) : (
          <Typography variant="body1" sx={{ textAlign: 'center', mt: 4 }}>
            Please select a tag to view cocktails
          </Typography>
        )}
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
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Box } from '@mui/material';
import { CocktailDetailData } from '../types/cocktail.types';
import { fetchCocktailBySlug } from '../services/cocktail.service';
import { SEO } from './SEO';
import { titleize } from '../utils/formatting';
import { IngredientList } from './IngredientList';
import { LoadingState } from './LoadingState';
import { TitleSection } from './TitleSection';
import { DescriptionSection } from './DescriptionSection';
import { RelatedItemsList } from './RelatedItemsList';

export const CocktailDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [cocktailData, setCocktailData] = useState<CocktailDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCocktail = async () => {
      try {
        const data = await fetchCocktailBySlug(slug || '');
        setCocktailData(data);
      } catch {
        setError('Cocktail not found');
      } finally {
        setLoading(false);
      }
    };

    fetchCocktail();
  }, [slug]);

  return (
    <LoadingState loading={loading} error={error}>
      {cocktailData && (
        <>
          <SEO 
            cocktail={cocktailData.cocktail}
          />
          <Box sx={{ 
            p: 3, 
            maxWidth: '600px', 
            margin: 'auto',
            minHeight: 'calc(100vh - 64px)', // Account for header height
            display: 'flex',
            flexDirection: 'column'
          }}>
            <TitleSection title={titleize(cocktailData.cocktail.name)} />

            <Box sx={{ mb: 4 }}>
              <DescriptionSection title="Ingredients" variant="h5" content="" sx={{mb: 1}} />
              <IngredientList 
                ingredients={cocktailData.cocktail.ingredients}
                glassType={cocktailData.cocktail.glassType}
              />
            </Box>

            <DescriptionSection 
              title="Instructions"
              variant="h5"
              content={cocktailData.cocktail.instructions}
            />

            {cocktailData.potentialAkas.length > 0 && (
              <RelatedItemsList 
                title="Also Known As"
                items={cocktailData.potentialAkas.map((aka: { id: number; name: string; slug?: string }) => ({
                  id: aka.id,
                  name: aka.name,
                  slug: aka.slug || ''
                }))}
                basePath="/cocktails"
              />
            )}

            {cocktailData.variations.length > 0 && (
              <RelatedItemsList 
                title="Variations"
                items={cocktailData.variations.map((v: { id: number; name: string; slug?: string }) => ({
                  id: v.id,
                  name: v.name,
                  slug: v.slug || ''
                }))}
                basePath="/cocktails"
              />
            )}
          </Box>
        </>
      )}
    </LoadingState>
  );
}; 
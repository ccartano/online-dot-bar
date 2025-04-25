import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Box } from '@mui/material';
import { Cocktail } from '../services/cocktail.service';
import { fetchCocktailBySlug } from '../services/cocktail.service';
import { DocumentTitle } from './DocumentTitle';
import { SEO } from './SEO';
import { titleize } from '../utils/formatting';
import { IngredientList } from './IngredientList';
import { LoadingState } from './LoadingState';
import { TitleSection } from './TitleSection';
import { DescriptionSection } from './DescriptionSection';
import { RelatedItemsList } from './RelatedItemsList';

// Define type for the API response
interface CocktailDetailData {
  cocktail: Cocktail;
  potentialAkas: { id: number; name: string; slug?: string }[];
  potentialVariations: { id: number; name: string; slug?: string }[];
}

export const CocktailDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [cocktailData, setCocktailData] = useState<CocktailDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCocktail = async () => {
      try {
        const cocktail = await fetchCocktailBySlug(slug || '');
        setCocktailData({
          cocktail,
          potentialAkas: [], // These will be populated by the backend
          potentialVariations: [], // These will be populated by the backend
        });
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
            title={`${cocktailData.cocktail ? titleize(cocktailData.cocktail.name) : 'Cocktail'} Recipe - The Online.Bar`}
            description={cocktailData.cocktail?.description ? 
              `${titleize(cocktailData.cocktail.name)}: ${cocktailData.cocktail.description}` : 
              `Learn how to make the perfect ${cocktailData.cocktail.name}. Get ingredients, measurements, and step-by-step instructions for this ${cocktailData.cocktail.category || 'cocktail'}.`
            }
            image={cocktailData.cocktail.imageUrl || undefined}
          />
          <DocumentTitle title={titleize(cocktailData.cocktail.name)} />
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

            <RelatedItemsList 
              title="Also Known As"
              items={cocktailData.potentialAkas}
              basePath="/cocktails"
            />

            <RelatedItemsList 
              title="Variations"
              items={cocktailData.potentialVariations}
              basePath="/cocktails"
            />
          </Box>
        </>
      )}
    </LoadingState>
  );
}; 
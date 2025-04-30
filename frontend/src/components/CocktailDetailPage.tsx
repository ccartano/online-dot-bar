import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Box } from '@mui/material';
import { CocktailDetailData } from '../types/cocktail.types';
import { fetchCocktailBySlug } from '../services/cocktail.service';
import { DocumentTitle } from './DocumentTitle';
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
            title={`${cocktailData.cocktail ? titleize(cocktailData.cocktail.name) : 'Cocktail'} Recipe - The Online.Bar`}
            description={cocktailData.cocktail?.description ? 
              `${titleize(cocktailData.cocktail.name)}: ${cocktailData.cocktail.description}. Learn how to make this ${cocktailData.cocktail.category || 'cocktail'} with step-by-step instructions, ingredients, and measurements.` : 
              `Learn how to make the perfect ${cocktailData.cocktail.name}. Get ingredients, measurements, and step-by-step instructions for this ${cocktailData.cocktail.category || 'cocktail'}.`
            }
            image={cocktailData.cocktail.imageUrl || undefined}
            canonicalUrl={`/cocktails/${cocktailData.cocktail.slug}`}
            ogType="article"
            twitterCard="summary_large_image"
            additionalMetaTags={[
              { name: 'keywords', content: `cocktail recipe, ${cocktailData.cocktail.name}, ${cocktailData.cocktail.category || 'cocktail'}, how to make ${cocktailData.cocktail.name}, cocktail ingredients` },
              { name: 'author', content: 'The Online.Bar' },
              { property: 'article:published_time', content: new Date().toISOString() },
              { property: 'article:modified_time', content: new Date().toISOString() },
              { property: 'article:section', content: 'Cocktail Recipes' },
              { property: 'article:tag', content: String(cocktailData.cocktail.category || 'Cocktails') }
            ]}
            structuredData={{
              '@context': 'https://schema.org',
              '@type': 'Recipe',
              name: titleize(cocktailData.cocktail.name),
              description: cocktailData.cocktail.description,
              image: cocktailData.cocktail.imageUrl,
              recipeCategory: cocktailData.cocktail.category || 'Cocktail',
              recipeCuisine: 'International',
              prepTime: 'PT5M',
              cookTime: 'PT5M',
              totalTime: 'PT10M',
              recipeYield: '1 serving',
              recipeIngredient: cocktailData.cocktail.ingredients.map(ing => 
                `${ing.amount} ${ing.unit} ${ing.ingredient.name}`
              ),
              recipeInstructions: cocktailData.cocktail.instructions ? 
                cocktailData.cocktail.instructions.split('\n').map(step => ({
                  '@type': 'HowToStep',
                  text: step.trim()
                })) : [],
              author: {
                '@type': 'Organization',
                name: 'The Online.Bar'
              }
            }}
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
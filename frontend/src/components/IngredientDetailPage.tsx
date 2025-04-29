import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Box, List, ListItem, styled } from '@mui/material';
import { Ingredient } from '../types/ingredient.types';
import { Cocktail } from '../types/cocktail.types';
import { fetchIngredientBySlug } from '../services/ingredient.service';
import { fetchCocktailsByIngredient } from '../services/cocktail.service';
import { DocumentTitle } from './DocumentTitle';
import { SEO } from './SEO';
import { titleize } from '../utils/formatting';
import { LoadingState } from './LoadingState';
import { TitleSection } from './TitleSection';
import { DescriptionSection } from './DescriptionSection';
import { IngredientList } from './IngredientList';
import { getIngredientTypeLabel } from '../utils/ingredientUtils';

const StyledLink = styled(Box)({
  position: 'relative',
  display: 'inline-block',
  transition: 'color 0.2s ease',
  color: '#1A1A1A',
  '&:hover': {
    color: '#9CB4A3',
    '&::after': {
      transform: 'scaleX(1)'
    }
  },
  '&::after': {
    content: '""',
    position: 'absolute',
    bottom: '-2px',
    left: 0,
    right: 0,
    height: '2px',
    backgroundColor: '#9CB4A3',
    transform: 'scaleX(0)',
    transition: 'transform 0.2s ease',
    transformOrigin: 'center'
  }
});

export const IngredientDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [ingredient, setIngredient] = useState<Ingredient | null>(null);
  const [cocktails, setCocktails] = useState<Cocktail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      if (!slug) {
        setError('Ingredient not found');
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const ingredientData = await fetchIngredientBySlug(slug);
        const cocktailData = await fetchCocktailsByIngredient(ingredientData.id, 10, true);
        setIngredient(ingredientData);
        setCocktails(cocktailData);
        setError(null);
      } catch (err) {
        setError('Ingredient not found');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [slug]);

  return (
    <LoadingState loading={loading} error={error}>
      {ingredient && (
        <>
          <SEO 
            title={`${titleize(ingredient.name)} - The Online.Bar`}
            description={ingredient.description ? 
              `${ingredient.name}: ${ingredient.description}` : 
              `Learn about ${ingredient.name} in cocktails. Discover its characteristics, common uses, and cocktail recipes that feature this ingredient.`
            }
            image={ingredient.imageUrl || undefined}
          />
          <DocumentTitle title={titleize(ingredient.name)} />
          <Box sx={{ 
            p: { xs: 2, sm: 3 }, 
            maxWidth: '600px', 
            margin: 'auto',
            minHeight: 'calc(100vh - 64px)',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <TitleSection 
              title={titleize(ingredient.name)}
              variant="h1"
              sx={{
                fontSize: { xs: '2.5rem', sm: '3rem' },
                mb: 1
              }}
            />
            
            <Box sx={{ mb: 1 }}>
              <IngredientList 
                ingredients={[{
                  ingredient: {
                    id: ingredient.id,
                    slug: ingredient.slug,
                    name: getIngredientTypeLabel(ingredient.type),
                    description: ingredient.description || undefined
                  },
                  order: 0
                }]}
                customLabel="Categorization"
                noLink={true}
              />
            </Box>

            {ingredient.description && (
              <DescriptionSection 
                title="Description"
                content={ingredient.description}
                variant="h5"
                sx={{mb: 1}}
              />
            )}

            <Box sx={{ pt: 3 }}>
              <DescriptionSection 
                title={`Try cocktails featuring ${titleize(ingredient.name)}`}
                content={""}
                variant="h5"
                sx={{
                  fontFamily: 'Corinthia, cursive',
                  fontWeight: 700,
                  color: '#1a1a1a',
                  mb: 2
                }}
              />
              {cocktails.length > 0 ? (
                <List>
                  {cocktails.map((cocktail) => (
                    <ListItem
                      key={cocktail.id}
                      component="a"
                      href={`/cocktails/${cocktail.slug}`}
                      sx={{
                        mb: 1,
                        borderRadius: 1,
                        display: 'block',
                        p: 1,
                        textDecoration: 'none',
                        '&:hover': {
                          textDecoration: 'none'
                        }
                      }}
                    >
                      <StyledLink>
                        <Box sx={{ 
                          fontFamily: 'serif',
                          fontSize: '1.1rem',
                          lineHeight: 1.5
                        }}>
                          {titleize(cocktail.name)}
                        </Box>
                      </StyledLink>
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Box sx={{ color: 'text.secondary' }}>
                  No cocktails found featuring this ingredient in the current selection.
                </Box>
              )}
            </Box>
          </Box>
        </>
      )}
    </LoadingState>
  );
}; 
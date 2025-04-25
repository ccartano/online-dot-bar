import { Box, List, ListItem, Typography } from '@mui/material';
import { Link } from 'react-router-dom';
import { Cocktail } from '../services/cocktail.service';
import { formatAmountAndUnit, formatIngredientName } from '../utils/ingredientFormatting';

interface IngredientListProps {
  ingredients: Cocktail['ingredients'];
  glassType?: Cocktail['glassType'];
  customLabel?: string;
  noLink?: boolean;
}

export const IngredientList: React.FC<IngredientListProps> = ({ ingredients, glassType, customLabel, noLink }) => {
  return (
    <List>
      {[...ingredients]
        .sort((a, b) => {
          if (a.amount && !b.amount) return -1;
          if (!a.amount && b.amount) return 1;
          return 0;
        })
        .map((ingredient, index) => {
          const formattedAmount = formatAmountAndUnit(ingredient);
          const ingredientName = formatIngredientName(ingredient);

          return (
            <ListItem key={index} sx={{ 
              py: 0, 
              display: 'flex', 
              flexDirection: 'row',
              alignItems: 'center',
              width: '100%',
              gap: 1,
              overflow: 'hidden'
            }}>
              <Box sx={{ 
                display: 'flex',
                width: { xs: '100px', sm: '250px' },
                alignItems: 'center',
                gap: 1,
                flexShrink: 0,
                minHeight: '40px'
              }}>
                {customLabel ? (
                  <Typography 
                    variant="body1"
                    component="p"
                    sx={{ 
                      minWidth: 'fit-content',
                      display: 'flex',
                      alignItems: 'center',
                      fontSize: '1.25rem'
                    }}>
                    {customLabel}
                  </Typography>
                ) : (
                  <Typography 
                    variant="body1"
                    component="p"
                    sx={{ 
                      minWidth: 'fit-content',
                      display: 'flex',
                      alignItems: 'center',
                      fontSize: '1.25rem'
                    }}>
                      {formattedAmount ? `${formattedAmount.amount} ${formattedAmount.unit}` : ''}
                    </Typography>
                )}
                {(customLabel || formattedAmount) && (
                  <Box sx={{ 
                    flex: 1,
                    color: '#ccc',
                    textAlign: 'left',
                    overflow: 'hidden',
                    minHeight: '40px',
                    whiteSpace: 'nowrap',
                    display: 'flex',
                    alignItems: 'center',
                    minWidth: 0,
                  }}>
                    <Box sx={{ 
                      width: '100%',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}>
                      {'................................................'.repeat(10)}
                    </Box>
                  </Box>
                )}
              </Box>
              <Box sx={{ 
                lineHeight: 2,
                flex: 1,
                minWidth: 0,
                textOverflow: 'ellipsis'
              }}>
                {!noLink && ingredient.ingredient.id ? (
                  <Link 
                    to={`/ingredients/${ingredient.ingredient.slug}`} 
                    style={{ 
                      textDecoration: 'none', 
                      color: 'inherit'
                    }}
                  >
                    <Typography variant="body1">{ingredientName}</Typography>
                  </Link>
                ) : (
                  <Typography variant="body1">{ingredientName}</Typography>
                )}
              </Box>
            </ListItem>
          );
        })}
      {glassType && (
        <ListItem sx={{ 
          py: 0, 
          display: 'flex', 
          flexDirection: 'row',
          alignItems: 'center',
          width: '100%',
          gap: 1,
          minHeight: '40px',
          overflow: 'hidden'
        }}>
          <Box sx={{ 
            display: 'flex',
            width: { xs: '100px', sm: '250px' },
            alignItems: 'center',
            gap: 1,
            flexShrink: 0
          }}>
            <Typography 
              variant="body1"
              component="p"
              sx={{ 
                lineHeight: 1,
                minWidth: 'fit-content',
                fontSize: "1rem",
              }}>
              Glass Type
            </Typography>
            <Box sx={{ 
              flex: 1,
              lineHeight: 1,
              color: '#ccc',
              textAlign: 'left',
              overflow: 'hidden',
              whiteSpace: 'nowrap',
              display: 'flex',
              alignItems: 'center',
              minWidth: 0
            }}>
              <Box sx={{ 
                width: '100%',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}>
                {'................................................'.repeat(10)}
              </Box>
            </Box>
          </Box>
          <Box sx={{ 
            lineHeight: 1,
            flex: 1,
            minWidth: 0,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}>
            {glassType.name}
          </Box>
        </ListItem>
      )}
    </List>
  );
}; 
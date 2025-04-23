import { Box, Checkbox, FormControlLabel, FormGroup, Divider, Typography } from '@mui/material';
import { IngredientType } from '../types/ingredient.types';
import { getIngredientTypeLabel } from '../utils/ingredientUtils';

interface IngredientFiltersProps {
  selectedTypes: IngredientType[];
  onTypeChange: (type: IngredientType) => void;
}

export const IngredientFilters: React.FC<IngredientFiltersProps> = ({
  selectedTypes,
  onTypeChange,
}) => {
  const allTypes = Object.values(IngredientType);

  return (
    <Box sx={{ 
      width: 240, 
      flexShrink: 0, 
      p: 2, 
      borderRight: '1px solid #e0e0e0',
      overflowY: 'auto',
      height: '100%'
    }}>
      <Typography variant="decorative" sx={{ mb: 1 }}>
        Filters
      </Typography>
      <Divider sx={{ mb: 2 }} />
      <Typography variant="h6" sx={{ 
        fontFamily: 'Old Standard TT, serif',
        fontSize: '1rem',
        fontWeight: 'bold',
        mb: 0.5
      }}>
        Ingredient Type
      </Typography>
      <FormGroup sx={{ pl: 1, mb: 4 }}>
        {allTypes.map((type) => (
          <FormControlLabel
            key={type}
            control={
              <Checkbox
                checked={selectedTypes.includes(type)}
                onChange={() => onTypeChange(type)}
                size="small"
              />
            }
            label={getIngredientTypeLabel(type)}
            sx={{ mb: 0, '& .MuiFormControlLabel-label': { fontFamily: 'Old Standard TT, serif', fontSize: '0.9rem' } }}
          />
        ))}
      </FormGroup>
      {/* Add more filter sections if needed */}
    </Box>
  );
}; 
import { Box, Checkbox, FormControlLabel, FormGroup, Divider, Typography } from '@mui/material';
import { IngredientType } from '../types/ingredient.types'; // Assuming you have this enum

interface IngredientFiltersProps {
  selectedTypes: IngredientType[];
  onTypeChange: (type: IngredientType) => void;
}

// Helper function to capitalize enum values for display
const formatTypeName = (type: string): string => {
  return type.charAt(0).toUpperCase() + type.slice(1);
};

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
      height: '100%', // Ensure it takes full height within flex container
      bgcolor: 'background.paper' // Match potential theme background
    }}>
      <Typography variant="h5" sx={{ fontFamily: 'Italianno, cursive', mb: 1 }}>
        Filters
      </Typography>
      <Divider sx={{ mb: 2 }} />
      <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 0.5, fontSize: '1rem' }}>
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
                size="small" // Smaller checkboxes might fit better
              />
            }
            label={formatTypeName(type)}
            sx={{ mb: 0, '& .MuiFormControlLabel-label': { fontFamily: 'Old Standard TT, serif', fontSize: '0.9rem' } }}
          />
        ))}
      </FormGroup>
      {/* Add more filter sections if needed */}
    </Box>
  );
}; 
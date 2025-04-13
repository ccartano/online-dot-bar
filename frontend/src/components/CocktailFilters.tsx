import { Box, Checkbox, FormControlLabel, FormGroup, Divider } from '@mui/material';
import { BaseSpirit } from '../utils/spiritUtils';

interface CocktailFiltersProps {
  selectedSpirits: BaseSpirit[];
  selectedGlassTypes: string[];
  glassTypeMap: Record<number, string>;
  onSpiritChange: (spirit: BaseSpirit) => void;
  onGlassTypeChange: (glassType: string) => void;
}

export const CocktailFilters: React.FC<CocktailFiltersProps> = ({
  selectedSpirits,
  selectedGlassTypes,
  glassTypeMap,
  onSpiritChange,
  onGlassTypeChange,
}) => {
  return (
    <Box sx={{ 
      width: 240, 
      flexShrink: 0, 
      p: 2, 
      borderRight: '1px solid #e0e0e0',
      overflowY: 'auto',
      height: '100%'
    }}>
      <h2 style={{ fontFamily: 'Italianno, cursive', fontSize: '2rem', marginBottom: '1rem' }}>
        Filters
      </h2>
      <Divider sx={{ mb: 2 }} />
      <h3 style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>
        Spirit
      </h3>
      <FormGroup sx={{ pl: 2, mb: 4 }}>
        {(['Gin', 'Whiskey', 'Vodka', 'Rum', 'Tequila', 'Brandy', 'Other'] as BaseSpirit[]).map((spirit) => (
          <FormControlLabel
            key={spirit}
            control={
              <Checkbox
                checked={selectedSpirits.includes(spirit)}
                onChange={() => onSpiritChange(spirit)}
              />
            }
            label={spirit}
            sx={{ mb: 1, '& .MuiFormControlLabel-label': { fontFamily: 'Old Standard TT, serif' } }}
          />
        ))}
      </FormGroup>
      <h3 style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>
        Glass Type
      </h3>
      <FormGroup sx={{ pl: 2 }}>
        {Object.values(glassTypeMap).map((glassName) => (
          <FormControlLabel
            key={glassName}
            control={
              <Checkbox
                checked={selectedGlassTypes.includes(glassName)}
                onChange={() => onGlassTypeChange(glassName)}
              />
            }
            label={glassName}
            sx={{ mb: 1, '& .MuiFormControlLabel-label': { fontFamily: 'Old Standard TT, serif' } }}
          />
        ))}
      </FormGroup>
    </Box>
  );
}; 
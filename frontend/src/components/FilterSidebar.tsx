import React from 'react';
import { Box, Divider, FormGroup, FormControlLabel, Checkbox } from '@mui/material';

interface FilterSection {
  title: string;
  options: {
    id: string;
    label: string;
    checked: boolean;
    onChange: () => void;
  }[];
}

interface FilterSidebarProps {
  sections: FilterSection[];
}

export const FilterSidebar: React.FC<FilterSidebarProps> = ({ sections }) => {
  return (
    <Box sx={{ 
      width: 240, 
      flexShrink: 0, 
      p: 2, 
      borderRight: '1px solid #e0e0e0',
      position: 'sticky',
      top: 0,
      height: '100%',
      overflowY: 'auto'
    }}>
      <h2 style={{ fontFamily: 'Italianno, cursive', fontSize: '2rem', marginBottom: '1rem' }}>
        Filters
      </h2>
      <Divider sx={{ mb: 2 }} />
      
      {sections.map((section, index) => (
        <React.Fragment key={section.title}>
          <h3 style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>
            {section.title}
          </h3>
          <FormGroup sx={{ pl: 2, mb: index < sections.length - 1 ? 4 : 0 }}>
            {section.options.map((option) => (
              <FormControlLabel
                key={option.id}
                control={
                  <Checkbox
                    checked={option.checked}
                    onChange={option.onChange}
                  />
                }
                label={option.label}
                sx={{ mb: 1, '& .MuiFormControlLabel-label': { fontFamily: 'Old Standard TT, serif' } }}
              />
            ))}
          </FormGroup>
        </React.Fragment>
      ))}
    </Box>
  );
}; 
import React, { useState } from 'react';
import { Box, Divider, FormGroup, FormControlLabel, Checkbox, IconButton, Drawer, useMediaQuery, useTheme } from '@mui/material';
import FilterListIcon from '@mui/icons-material/FilterList';

interface FilterOption {
  id: string;
  label: string;
  checked: boolean;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

interface FilterSection {
  title: string;
  options: FilterOption[];
}

interface FilterSidebarProps {
  sections: FilterSection[];
}

export const FilterSidebar: React.FC<FilterSidebarProps> = ({ sections }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const drawer = (
    <Box sx={{ p: 2 }}>
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

  if (isMobile) {
    return (
      <>
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            right: '16px',
            height: '64px',
            display: { xs: 'flex', sm: 'none' },
            alignItems: 'center',
            zIndex: 1100
          }}
        >
          <IconButton
            onClick={handleDrawerToggle}
            sx={{
              color: '#1a1a1a',
              '&:hover': {
                backgroundColor: 'transparent'
              },
              '& .MuiSvgIcon-root': {
                fontSize: '2rem'
              }
            }}
          >
            <FilterListIcon />
          </IconButton>
        </Box>
        <Drawer
          anchor="right"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': {
              width: '80%',
              maxWidth: '400px',
              borderTopRightRadius: 0,
              borderBottomRightRadius: 0,
              bgcolor: 'white'
            }
          }}
        >
          {drawer}
        </Drawer>
      </>
    );
  }

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
      {drawer}
    </Box>
  );
}; 
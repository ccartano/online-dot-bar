import React, { useState } from 'react';
import { Box, Divider, FormGroup, FormControlLabel, Checkbox, IconButton, Drawer, useMediaQuery, useTheme, Typography } from '@mui/material';
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
    <Box sx={{ p: 0 }}>
      <Typography variant="decorative" sx={{ mb: 1 }}>
        Filters
      </Typography>
      <Divider sx={{ mb: 2 }} />
      
      {sections.map((section, index) => (
        <React.Fragment key={section.title}>
          <Typography
            variant="h2"
            component="h2"
            sx={{
              fontWeight: 'bold',
              marginBottom: '0.5rem',
              fontFamily: 'Corinthia, cursive',
              fontSize: '1.5rem'
            }}
          >
            {section.title}
          </Typography>
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
              bgcolor: 'white',
              p: 2
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
      borderRight: '1px solid #e0e0e0',
      position: 'relative'
    }}>
      <Box sx={{
        position: 'sticky',
        top: 0,
        height: '100vh',
        overflow: 'auto',
        p: 2
      }}>
        {drawer}
      </Box>
    </Box>
  );
}; 
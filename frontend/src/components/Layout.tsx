import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Box, IconButton, Drawer, List, ListItem, ListItemText, Typography } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import '../App.css';

const drawerWidth = 240;

const navItems = [
  { text: 'Cocktails', path: '/cocktails' },
  { text: 'Ingredients', path: '/ingredients' },
  { text: 'Categories', path: '/categories' }
];

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Box
        component="nav"
        sx={{
          width: '100%',
          position: 'sticky',
          top: 0,
          zIndex: 1000,
          backgroundColor: 'white',
          borderBottom: '1px solid #eee',
          height: '64px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 3
        }}
      >
        <Box sx={{ width: '40px', display: { sm: 'none' } }}>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
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
            <MenuIcon />
          </IconButton>
        </Box>
        <Typography
          sx={{
            fontFamily: 'Italianno, cursive',
            fontSize: '2.5rem',
            color: '#1a1a1a',
            textAlign: 'center',
            flex: 1
          }}
        >
          The Online.Bar
        </Typography>
        <Box sx={{ width: '40px' }} />
        <Drawer
          variant="temporary"
          anchor="left"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': {
              width: '80%',
              maxWidth: '400px',
              borderTopLeftRadius: 0,
              borderBottomLeftRadius: 0,
              bgcolor: 'white',
              display: 'flex',
              flexDirection: 'column'
            }
          }}
        >
          <Box sx={{ 
            p: 2, 
            borderBottom: '1px solid #eee',
            display: 'flex',
            alignItems: 'center'
          }}>
            <Typography
              variant="h6"
              sx={{
                fontFamily: 'Italianno, cursive',
                fontSize: '2rem',
                color: '#1a1a1a'
              }}
            >
              Menu
            </Typography>
          </Box>
          <List sx={{ 
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            flex: 1,
            gap: 2
          }}>
            {navItems.map((item) => (
              <ListItem 
                key={item.text} 
                component={Link} 
                to={item.path}
                onClick={handleDrawerToggle}
                sx={{
                  justifyContent: 'center',
                  py: 2,
                  color: isActive(item.path) ? '#1a1a1a' : '#666',
                  '&:hover': {
                    color: '#9CB4A3',
                    backgroundColor: 'transparent'
                  }
                }}
              >
                <ListItemText 
                  primary={item.text} 
                  sx={{ 
                    textAlign: 'center',
                    '& .MuiTypography-root': {
                      fontFamily: 'Italianno, cursive',
                      fontSize: '2rem'
                    }
                  }} 
                />
              </ListItem>
            ))}
          </List>
        </Drawer>
        <Box
          sx={{
            display: { xs: 'none', sm: 'flex' },
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            height: '100%'
          }}
        >
          {navItems.map((item) => (
            <Link 
              key={item.text}
              to={item.path} 
              style={{ 
                textDecoration: 'none',
                color: isActive(item.path) ? '#1a1a1a' : '#666',
                fontFamily: "'Italianno', cursive",
                fontSize: '1.8rem',
                margin: '0 1rem',
                padding: '0.5rem 1rem',
                borderRadius: '4px'
              }}
            >
              {item.text}
            </Link>
          ))}
        </Box>
      </Box>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` }
        }}
      >
        {children}
      </Box>
    </Box>
  );
}; 
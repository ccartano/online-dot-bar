import React, { useState, useCallback, memo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Box, 
  IconButton, 
  Drawer, 
  List, 
  ListItem, 
  ListItemText, 
  Typography, 
  useMediaQuery,
  styled,
  ThemeProvider,
  createTheme,
  Theme
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import '../App.css';

interface NavItem {
  text: string;
  path: string;
}

// Create a custom theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#9CB4A3',
    },
    secondary: {
      main: '#1a1a1a',
    },
  },
  typography: {
    fontFamily: [
      'Corinthia',
      'cursive',
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
  },
  components: {
    MuiDrawer: {
      styleOverrides: {
        paper: {
          width: '80%',
          maxWidth: '400px',
          borderTopLeftRadius: 0,
          borderBottomLeftRadius: 0,
        },
      },
    },
  },
});

// Styled components
const StyledNav = styled('nav')`
  width: 100%;
  position: sticky;
  top: 0;
  z-index: 1000;
  background-color: white;
  border-bottom: 1px solid #eee;
  height: 56px;
  display: flex;
  align-items: center;
  padding: 0 16px;
  justify-content: space-between;

  @media (min-width: 600px) {
    height: 64px;
    padding: 0 24px;
  }
`;

const StyledLink = styled(Link)(({ theme }: { theme: Theme }) => ({
  textDecoration: 'none',
  color: theme.palette.secondary.main,
  transition: 'color 0.2s ease',
  '&:hover': {
    color: theme.palette.primary.main,
  },
}));

const StyledHomeLink = styled(Link)(({ theme }: { theme: Theme }) => ({
  textDecoration: 'none',
  color: theme.palette.secondary.main,
  transition: 'color 0.2s ease',
  '&:hover': {
    color: theme.palette.primary.main,
  },
  fontSize: '1.5rem',
  fontFamily: 'Corinthia, cursive',
  '@media (min-width: 600px)': {
    fontSize: '2rem',
  }
}));

const navItems: NavItem[] = [
  { text: 'Cocktails', path: '/cocktails' },
  { text: 'Ingredients', path: '/ingredients' },
  { text: 'Categories', path: '/categories' }
];

// Memoized NavItem component
const NavItem = memo(({ item, isActive, onClick }: { 
  item: NavItem, 
  isActive: boolean,
  onClick?: () => void 
}) => (
  <Box
    sx={{
      position: 'relative',
      '&:hover::after': {
        transform: 'scaleX(1)'
      },
      '&::after': {
        content: '""',
        position: 'absolute',
        bottom: 0,
        left: '1rem',
        right: '1rem',
        height: '2px',
        backgroundColor: 'primary.main',
        transform: isActive ? 'scaleX(1)' : 'scaleX(0)',
        transition: 'transform 0.2s ease',
        transformOrigin: 'center'
      }
    }}
  >
    <StyledLink 
      to={item.path} 
      onClick={onClick}
      aria-current={isActive ? 'page' : undefined}
    >
      <Typography 
        variant="decorative"
        sx={{
          color: isActive ? 'secondary.main' : '#666',
          transition: 'color 0.2s ease',
          fontSize: { sm: '1.875rem', md: '2rem' },
          fontFamily: 'Corinthia, cursive',
          '&:hover': {
            color: 'primary.main'
          }
        }}
      >
        {item.text}
      </Typography>
    </StyledLink>
  </Box>
));

// Memoized MobileMenu component
const MobileMenu = memo(({ 
  open, 
  onClose, 
  navItems, 
  isActive 
}: { 
  open: boolean, 
  onClose: () => void, 
  navItems: NavItem[],
  isActive: (path: string) => boolean 
}) => (
  <Drawer
    variant="temporary"
    anchor="left"
    open={open}
    onClose={onClose}
    ModalProps={{
      keepMounted: true,
    }}
    sx={{
      display: { xs: 'block', sm: 'none' },
    }}
  >
    <Box sx={{ 
      p: 2, 
      borderBottom: '1px solid #eee',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <StyledHomeLink to="/" onClick={onClose}>
        The Online.Bar
      </StyledHomeLink>
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
          onClick={onClose}
          sx={{
            justifyContent: 'center',
            py: 2,
          }}
        >
          <ListItemText 
            primary={item.text} 
            sx={{ 
              textAlign: 'center',
              '& .MuiTypography-root': {
                variant: 'decorative',
                color: isActive(item.path) ? 'secondary.main' : '#666',
                transition: 'color 0.2s ease',
                fontSize: '3rem',
                fontFamily: 'Corinthia, cursive',
                '&:hover': {
                  color: 'primary.main'
                }
              }
            }} 
          />
        </ListItem>
      ))}
    </List>
  </Drawer>
));

export const Layout: React.FC<{ children: React.ReactNode }> = memo(({ children }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleDrawerToggle = useCallback(() => {
    setMobileOpen(prev => !prev);
  }, []);

  const isActive = useCallback((path: string) => {
    return location.pathname === path;
  }, [location.pathname]);

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <StyledNav>
          {isMobile ? (
            <>
              <IconButton
                color="inherit"
                aria-label="open drawer"
                edge="start"
                onClick={handleDrawerToggle}
                sx={{ 
                  color: 'secondary.main',
                  '&:hover': {
                    color: 'primary.main'
                  }
                }}
              >
                <MenuIcon />
              </IconButton>
              <StyledHomeLink to="/">
                The Online.Bar
              </StyledHomeLink>
              <Box sx={{ width: 48 }} /> {/* Spacer to center the title */}
            </>
          ) : (
            <>
              <StyledHomeLink to="/">
                The Online.Bar
              </StyledHomeLink>
              <Box 
                sx={{ 
                  display: 'flex', 
                  gap: 4,
                  alignItems: 'center'
                }}
              >
                {navItems.map((item) => (
                  <NavItem 
                    key={item.text} 
                    item={item} 
                    isActive={isActive(item.path)} 
                  />
                ))}
              </Box>
            </>
          )}
        </StyledNav>
        
        <MobileMenu 
          open={mobileOpen} 
          onClose={handleDrawerToggle} 
          navItems={navItems}
          isActive={isActive}
        />
        
        <Box component="main" sx={{ flex: 1 }}>
          {children}
        </Box>
      </Box>
    </ThemeProvider>
  );
});

export default Layout; 
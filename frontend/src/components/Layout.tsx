import React, { useState, useCallback, memo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Box, 
  IconButton, 
  Drawer, 
  List, 
  ListItem, 
  Typography, 
  useMediaQuery,
  styled,
  ThemeProvider,
  Theme
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { theme } from '../theme/theme';
import '../App.css';

interface NavItem {
  text: string;
  path: string;
}

// Styled components
const StyledNav = styled('nav')`
  width: 100%;
  position: sticky;
  top: 0;
  z-index: 1000;
  background-color: white;
  border-bottom: 1px solid #eee;
  height: 64px;
  display: flex;
  align-items: center;
  padding: 0 16px;
  justify-content: space-between;

  @media (min-width: 600px) {
    height: 72px;
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

const NavItemsContainer = styled(Box)`
  display: flex;
  gap: 0;
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
`;

const navItems: NavItem[] = [
  { text: 'Cocktails', path: '/cocktails' },
  { text: 'Ingredients', path: '/ingredients' },
  { text: 'Products', path: '/products' }
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
      },
      '&:not(:last-child)::before': {
        content: '""',
        position: 'absolute',
        right: 0,
        top: '25%',
        bottom: '25%',
        width: '1px',
        backgroundColor: '#eee',
      },
      padding: '0 2rem'
    }}
  >
    <StyledLink 
      to={item.path} 
      onClick={onClick}
      aria-current={isActive ? 'page' : undefined}
    >
      <Typography 
        variant="h3Corinthia"
        sx={{
          color: isActive ? 'secondary.main' : '#666',
          transition: 'color 0.2s ease',
          fontSize: { sm: '1.875rem', md: '2rem' },
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
      '& .MuiDrawer-paper': {
        width: '85%',
        maxWidth: '400px',
        p: 3
      }
    }}
  >
    <Box sx={{ 
      p: 2, 
      borderBottom: '1px solid #eee',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <Link to="/" onClick={onClose} style={{ textDecoration: 'none' }}>
        <Typography
          variant="h3Corinthia"
          sx={{
            color: 'secondary.main',
            transition: 'color 0.2s ease',
            fontSize: { xs: '2rem', sm: '2.5rem' },
            '&:hover': {
              color: 'primary.main'
            }
          }}
        >
          The Online.Bar
        </Typography>
      </Link>
    </Box>
    <List sx={{ 
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      flex: 1,
      gap: 3,
      p: 2
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
          <Typography 
            variant="body1Corinthia"
            component="p"
            sx={{
              color: isActive(item.path) ? 'secondary.main' : '#666',
              transition: 'color 0.2s ease',
              fontSize: { xs: '2.5rem', sm: '3rem' },
              '&:hover': {
                color: 'primary.main'
              }
            }}
          >
            {item.text}
          </Typography>
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
                  },
                  '& .MuiSvgIcon-root': {
                    fontSize: { xs: '1.5rem', sm: '1.5rem' }
                  }
                }}
              >
                <MenuIcon />
              </IconButton>
              <Link to="/" onClick={handleDrawerToggle} style={{ textDecoration: 'none' }}>
                <Typography
                  variant="h3Corinthia"
                  sx={{
                    color: 'secondary.main',
                    transition: 'color 0.2s ease',
                    fontSize: { xs: '2rem', sm: '2.5rem' },
                    '&:hover': {
                      color: 'primary.main'
                    }
                  }}
                >
                  The Online.Bar
                </Typography>
              </Link>
              <Box sx={{ width: 48 }} /> {/* Spacer to center the title */}
            </>
          ) : (
            <>
              <Link to="/" onClick={handleDrawerToggle} style={{ textDecoration: 'none' }}>
                <Typography
                  variant="h3Corinthia"
                  sx={{
                    color: 'secondary.main',
                    transition: 'color 0.2s ease',
                    fontSize: { xs: '1.5rem', sm: '2rem' },
                    '&:hover': {
                      color: 'primary.main'
                    }
                  }}
                >
                  The Online.Bar
                </Typography>
              </Link>
              <NavItemsContainer>
                {navItems.map((item) => (
                  <NavItem 
                    key={item.text} 
                    item={item} 
                    isActive={isActive(item.path)} 
                  />
                ))}
              </NavItemsContainer>
              <Box sx={{ width: 200 }} /> {/* Spacer to balance the layout */}
            </>
          )}
        </StyledNav>
        
        <MobileMenu 
          open={mobileOpen} 
          onClose={handleDrawerToggle} 
          navItems={navItems}
          isActive={isActive}
        />
        
        <Box component="main" sx={{ flexGrow: 1 }}>
          {children}
        </Box>
      </Box>
    </ThemeProvider>
  );
});

export default Layout; 
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Box } from '@mui/material';
import '../App.css';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      minHeight: '100vh',
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0
    }}>
      <Box 
        component="nav" 
        sx={{ 
          position: 'sticky', 
          top: 0, 
          zIndex: 1000,
          backgroundColor: 'white',
          borderBottom: '1px solid #e0e0e0',
          padding: '1rem'
        }}
      >
        <Box 
          className="nav-links" 
          sx={{ 
            display: 'flex', 
            gap: '2rem',
            justifyContent: 'center'
          }}
        >
          <Link 
            to="/cocktails" 
            className={isActive('/cocktails') ? 'active' : ''}
            style={{ 
              textDecoration: 'none',
              color: isActive('/cocktails') ? '#1a1a1a' : '#666',
              fontFamily: "'Italianno', cursive",
              fontSize: '1.8rem'
            }}
          >
            Cocktails
          </Link>
          <Link 
            to="/ingredients" 
            className={isActive('/ingredients') ? 'active' : ''}
            style={{ 
              textDecoration: 'none',
              color: isActive('/ingredients') ? '#1a1a1a' : '#666',
              fontFamily: "'Italianno', cursive",
              fontSize: '1.8rem'
            }}
          >
            Ingredients
          </Link>
          <Link 
            to="/categories" 
            className={isActive('/categories') ? 'active' : ''}
            style={{ 
              textDecoration: 'none',
              color: isActive('/categories') ? '#1a1a1a' : '#666',
              fontFamily: "'Italianno', cursive",
              fontSize: '1.8rem'
            }}
          >
            Categories
          </Link>
        </Box>
      </Box>
      <Box 
        component="main" 
        sx={{ 
          flexGrow: 1, 
          position: 'relative',
          overflow: 'auto'
        }}
      >
        {children}
      </Box>
    </Box>
  );
}; 
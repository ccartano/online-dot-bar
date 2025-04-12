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
    <div className="layout" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <nav className="navbar" style={{ position: 'sticky', top: 0, zIndex: 1000 }}>
        <div className="nav-links">
          <Link 
            to="/cocktails" 
            className={isActive('/cocktails') ? 'active' : ''}
          >
            Cocktails
          </Link>
          <Link 
            to="/ingredients" 
            className={isActive('/ingredients') ? 'active' : ''}
          >
            Ingredients
          </Link>
          <Link 
            to="/categories" 
            className={isActive('/categories') ? 'active' : ''}
          >
            Categories
          </Link>
        </div>
      </nav>
      <Box component="main" sx={{ flexGrow: 1, position: 'relative' }}>
        {children}
      </Box>
    </div>
  );
}; 
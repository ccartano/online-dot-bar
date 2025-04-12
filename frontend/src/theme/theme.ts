import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    primary: {
      main: '#9CB4A3', // Sage/Mint green
      light: '#B8C7BE',
      dark: '#7A9084',
    },
    secondary: {
      main: '#1A1A1A', // Dark gray/Almost black
      light: '#404040',
      dark: '#000000',
    },
    background: {
      default: '#F5F5F1', // Off-white/Cream
      paper: '#FFFFFF',
    },
    text: {
      primary: '#1A1A1A',
      secondary: '#666666',
    },
    grey: {
      100: '#F5F5F1',
      200: '#E5E5E5',
      300: '#CCCCCC',
      400: '#B3B3B3',
      500: '#999999',
      600: '#666666',
      700: '#4D4D4D',
      800: '#333333',
      900: '#1A1A1A',
    },
  },
  typography: {
    fontFamily: [
      'system-ui',
      '-apple-system',
      'BlinkMacSystemFont',
      'Segoe UI',
      'Roboto',
      'Oxygen',
      'Ubuntu',
      'Cantarell',
      'Fira Sans',
      'Droid Sans',
      'Helvetica Neue',
      'sans-serif',
    ].join(','),
    h1: {
      fontFamily: 'Italianno, cursive',
      fontSize: '5rem',
      color: '#1A1A1A',
    },
    h2: {
      fontFamily: 'Italianno, cursive',
      fontSize: '4rem',
      color: '#1A1A1A',
    },
    h3: {
      fontFamily: 'Italianno, cursive',
      fontSize: '3rem',
      color: '#1A1A1A',
    },
    h4: {
      fontFamily: 'Italianno, cursive',
      fontSize: '2.5rem',
      color: '#1A1A1A',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: '8px',
        },
        contained: {
          backgroundColor: '#9CB4A3',
          color: '#1A1A1A',
          '&:hover': {
            backgroundColor: '#7A9084',
          },
        },
        outlined: {
          borderColor: '#9CB4A3',
          color: '#1A1A1A',
          '&:hover': {
            borderColor: '#7A9084',
            backgroundColor: 'rgba(156, 180, 163, 0.1)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: '#FFFFFF',
          borderRadius: '12px',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: '#FFFFFF',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
        },
      },
    },
  },
}); 
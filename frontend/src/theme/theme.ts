import { createTheme } from '@mui/material/styles';

// Extend the theme to include custom variants
declare module '@mui/material/styles' {
  interface TypographyVariants {
    h1Corinthia: React.CSSProperties;
    h2Corinthia: React.CSSProperties;
    h3Corinthia: React.CSSProperties;
    h4Corinthia: React.CSSProperties;
    h5Corinthia: React.CSSProperties;
    h6Corinthia: React.CSSProperties;
    body1Corinthia: React.CSSProperties;
    body2Corinthia: React.CSSProperties;
    subtitle1Corinthia: React.CSSProperties;
    subtitle2Corinthia: React.CSSProperties;
    buttonCorinthia: React.CSSProperties;
    captionCorinthia: React.CSSProperties;
    overlineCorinthia: React.CSSProperties;
  }

  interface TypographyVariantsOptions {
    h1Corinthia?: React.CSSProperties;
    h2Corinthia?: React.CSSProperties;
    h3Corinthia?: React.CSSProperties;
    h4Corinthia?: React.CSSProperties;
    h5Corinthia?: React.CSSProperties;
    h6Corinthia?: React.CSSProperties;
    body1Corinthia?: React.CSSProperties;
    body2Corinthia?: React.CSSProperties;
    subtitle1Corinthia?: React.CSSProperties;
    subtitle2Corinthia?: React.CSSProperties;
    buttonCorinthia?: React.CSSProperties;
    captionCorinthia?: React.CSSProperties;
    overlineCorinthia?: React.CSSProperties;
  }
}

// Update the Typography variants
declare module '@mui/material/Typography' {
  interface TypographyPropsVariantOverrides {
    h1Corinthia: true;
    h2Corinthia: true;
    h3Corinthia: true;
    h4Corinthia: true;
    h5Corinthia: true;
    h6Corinthia: true;
    body1Corinthia: true;
    body2Corinthia: true;
    subtitle1Corinthia: true;
    subtitle2Corinthia: true;
    buttonCorinthia: true;
    captionCorinthia: true;
    overlineCorinthia: true;
  }
}

// Define common styles that use Corinthia font
const corinthiaStyles = {
  fontFamily: "'Corinthia', cursive",
  fontWeight: 400,
  color: '#1A1A1A',
};

// Define common styles for Old Standard TT
const serifStyles = {
  fontFamily: "'Old Standard TT', serif",
  color: '#1A1A1A',
};

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
    fontFamily: "'Old Standard TT', serif",
    // Old Standard variants
    h1: {
      ...serifStyles,
      fontSize: '3.5rem',
      fontWeight: 400,
      lineHeight: 1.2,
    },
    h2: {
      ...serifStyles,
      fontSize: '3rem',
      fontWeight: 400,
      lineHeight: 1.2,
    },
    h3: {
      ...serifStyles,
      fontSize: '2.5rem',
      fontWeight: 400,
      lineHeight: 1.2,
    },
    h4: {
      ...serifStyles,
      fontSize: '2rem',
      fontWeight: 400,
      lineHeight: 1.2,
    },
    h5: {
      ...serifStyles,
      fontSize: '1.5rem',
      fontWeight: 400,
      lineHeight: 1.2,
    },
    h6: {
      ...serifStyles,
      fontSize: '1.25rem',
      fontWeight: 400,
      lineHeight: 1.2,
    },
    body1: {
      ...serifStyles,
      fontSize: '1rem',
      lineHeight: 1.5,
    },
    body2: {
      ...serifStyles,
      fontSize: '0.875rem',
      lineHeight: 1.5,
    },
    subtitle1: {
      ...serifStyles,
      fontSize: '1rem',
      fontWeight: 500,
      lineHeight: 1.5,
    },
    subtitle2: {
      ...serifStyles,
      fontSize: '0.875rem',
      fontWeight: 500,
      lineHeight: 1.5,
    },
    button: {
      ...serifStyles,
      fontSize: '0.875rem',
      fontWeight: 500,
      textTransform: 'none',
    },
    caption: {
      ...serifStyles,
      fontSize: '0.75rem',
      lineHeight: 1.5,
    },
    overline: {
      ...serifStyles,
      fontSize: '0.75rem',
      fontWeight: 500,
      textTransform: 'uppercase',
      lineHeight: 1.5,
    },
    // Corinthia variants
    h1Corinthia: {
      ...corinthiaStyles,
      fontSize: '4.5rem',
      lineHeight: 1.2,
    },
    h2Corinthia: {
      ...corinthiaStyles,
      fontSize: '3.75rem',
      lineHeight: 1.2,
    },
    h3Corinthia: {
      ...corinthiaStyles,
      fontSize: '3rem',
      lineHeight: 1.2,
    },
    h4Corinthia: {
      ...corinthiaStyles,
      fontSize: '2.25rem',
      lineHeight: 1.2,
    },
    h5Corinthia: {
      ...corinthiaStyles,
      fontSize: '1.75rem',
      lineHeight: 1.2,
    },
    h6Corinthia: {
      ...corinthiaStyles,
      fontSize: '1.5rem',
      lineHeight: 1.2,
    },
    body1Corinthia: {
      ...corinthiaStyles,
      fontSize: '1.25rem',
      lineHeight: 1.5,
    },
    body2Corinthia: {
      ...corinthiaStyles,
      fontSize: '1rem',
      lineHeight: 1.5,
    },
    subtitle1Corinthia: {
      ...corinthiaStyles,
      fontSize: '1.25rem',
      lineHeight: 1.5,
    },
    subtitle2Corinthia: {
      ...corinthiaStyles,
      fontSize: '1rem',
      lineHeight: 1.5,
    },
    buttonCorinthia: {
      ...corinthiaStyles,
      fontSize: '1.25rem',
      textTransform: 'none',
    },
    captionCorinthia: {
      ...corinthiaStyles,
      fontSize: '0.875rem',
      lineHeight: 1.5,
    },
    overlineCorinthia: {
      ...corinthiaStyles,
      fontSize: '0.875rem',
      textTransform: 'uppercase',
      lineHeight: 1.5,
    },
  },
  components: {
    MuiTypography: {
      defaultProps: {
        variantMapping: {
          h1: 'h1',
          h2: 'h2',
          h3: 'h3',
          h4: 'h4',
          h5: 'h5',
          h6: 'h6',
          body1: 'p',
          body2: 'p',
          subtitle1: 'p',
          subtitle2: 'p',
          button: 'span',
          caption: 'span',
          overline: 'span',
        }
      }
    },
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
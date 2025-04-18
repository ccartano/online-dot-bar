import { createTheme } from '@mui/material/styles';

// Extend the theme to include custom variants
declare module '@mui/material/styles' {
  interface TypographyVariants {
    decorative: React.CSSProperties;
    decorativeLarge: React.CSSProperties;
    decorativeSmall: React.CSSProperties;
    serif: React.CSSProperties;
    serifMedium: React.CSSProperties;
  }

  interface TypographyVariantsOptions {
    decorative?: React.CSSProperties;
    decorativeLarge?: React.CSSProperties;
    decorativeSmall?: React.CSSProperties;
    serif?: React.CSSProperties;
    serifMedium?: React.CSSProperties;
  }
}

// Update the Button variants
declare module '@mui/material/Button' {
  interface ButtonPropsVariantOverrides {
    decorative: true;
  }
}

// Update the Typography variants
declare module '@mui/material/Typography' {
  interface TypographyPropsVariantOverrides {
    decorative: true;
    decorativeLarge: true;
    decorativeSmall: true;
    serif: true;
    serifMedium: true;
  }
}

// Define common styles that use Corinthia font
const corinthiaStyles = {
  fontFamily: 'Corinthia, cursive',
  fontWeight: 700,
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
    h1: {
      ...corinthiaStyles,
      fontSize: '5rem',
    },
    h2: {
      ...corinthiaStyles,
      fontSize: '4rem',
    },
    h3: {
      ...corinthiaStyles,
      fontSize: '3rem',
    },
    h4: {
      ...corinthiaStyles,
      fontSize: '2rem',
    },
    h5: {
      ...corinthiaStyles,
      fontSize: '1.8rem',
    },
    h6: {
      ...corinthiaStyles,
      fontSize: '1.5rem',
    },
  },
  components: {
    MuiTypography: {
      defaultProps: {
        variantMapping: {
          serif: 'p',
          serifMedium: 'p',
        }
      },
      variants: [
        {
          props: { variant: 'decorative' },
          style: {
            ...corinthiaStyles,
            fontSize: '2rem',
          },
        },
        {
          props: { variant: 'decorativeLarge' },
          style: {
            ...corinthiaStyles,
            fontSize: '2.5rem',
          },
        },
        {
          props: { variant: 'decorativeSmall' },
          style: {
            ...corinthiaStyles,
            fontSize: '1.5rem',
          },
        },
        {
          props: { variant: 'serif' },
          style: {
            ...serifStyles,
            fontSize: '1rem',
          },
        },
        {
          props: { variant: 'serifMedium' },
          style: {
            ...serifStyles,
            fontSize: '1.1rem',
            fontWeight: 500,
          },
        },
      ],
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
      variants: [
        {
          props: { variant: 'decorative' },
          style: {
            ...corinthiaStyles,
            fontSize: '1.5rem',
          },
        },
      ],
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
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { HelmetProvider } from 'react-helmet-async';
import { theme } from './theme/theme';
import { Layout } from './components/Layout';
import LandingPage from './components/LandingPage';
import { CocktailsPage } from './components/CocktailsPage';
import { CocktailDetailPage } from './components/CocktailDetailPage';
import { AdminPage } from './components/AdminPage';
import { IngredientsPage } from './components/IngredientsPage';
import { IngredientDetailPage } from './components/IngredientDetailPage';
import ProductsPage from './pages/ProductsPage';
import { trackPageView } from './utils/gtm';
import { useEffect } from 'react';
import './App.css';

// Component to track route changes
const RouteChangeTracker = () => {
  const location = useLocation();

  useEffect(() => {
    trackPageView(location.pathname);
  }, [location]);

  return null;
};

const App = () => {
  return (
    <HelmetProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
          <RouteChangeTracker />
          <Routes>
            <Route path="/admin/*" element={<AdminPage />} />
            <Route path="/*" element={
              <Layout>
                <Routes>
                  <Route path="/" element={<LandingPage />} />
                  <Route path="/cocktails" element={<CocktailsPage />} />
                  <Route path="/cocktails/:slug" element={<CocktailDetailPage />} />
                  <Route path="/ingredients" element={<IngredientsPage />} />
                  <Route path="/ingredients/:slug" element={<IngredientDetailPage />} />
                  <Route path="/products" element={<ProductsPage />} />
                </Routes>
              </Layout>
            } />
          </Routes>
        </Router>
      </ThemeProvider>
    </HelmetProvider>
  );
};

export default App;

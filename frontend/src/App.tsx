import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { theme } from './theme/theme';
import { Layout } from './components/Layout';
import LandingPage from './components/LandingPage';
import { CocktailsPage } from './components/CocktailsPage';
import { CocktailDetailPage } from './components/CocktailDetailPage';
import { AdminPage } from './components/AdminPage';
import { IngredientsPage } from './components/IngredientsPage';
import { IngredientDetailPage } from './components/IngredientDetailPage';
import './App.css';

const App = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
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
              </Routes>
            </Layout>
          } />
        </Routes>
      </Router>
    </ThemeProvider>
  );
};

export default App;

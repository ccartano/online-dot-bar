import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { theme } from './theme/theme';
import { Layout } from './components/Layout';
import LandingPage from './components/LandingPage';
import { CocktailsPage } from './components/CocktailsPage';
import { CocktailDetailPage } from './components/CocktailDetailPage';
import { PotentialCocktailsPage } from './components/PotentialCocktailsPage';
import './App.css';

const App = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/cocktails" element={<CocktailsPage />} />
            <Route path="/cocktails/:id" element={<CocktailDetailPage />} />
            <Route path="/potential-cocktails" element={<PotentialCocktailsPage />} />
          </Routes>
        </Layout>
      </Router>
    </ThemeProvider>
  );
};

export default App;

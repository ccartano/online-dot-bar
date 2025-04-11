import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import { PotentialCocktailsPage } from './components/PotentialCocktailsPage';
import { CocktailsPage } from './components/CocktailsPage';
import { CocktailDetailPage } from './components/CocktailDetailPage';
import { Layout } from './components/Layout';
import './App.css';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/potential-cocktails" element={<PotentialCocktailsPage />} />
          <Route path="/cocktails" element={<CocktailsPage />} />
          <Route path="/cocktails/:id" element={<CocktailDetailPage />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;

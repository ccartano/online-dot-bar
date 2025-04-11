import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import { PotentialCocktailsPage } from './components/PotentialCocktailsPage';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/potential-cocktails" element={<PotentialCocktailsPage />} />
      </Routes>
    </Router>
  );
}

export default App;

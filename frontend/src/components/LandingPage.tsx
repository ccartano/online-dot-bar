import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../App.css';

const LandingPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement search functionality
    console.log('Searching for:', searchQuery);
  };

  return (
    <div className="landing-page">
      <nav className="navbar">
        <div className="nav-links">
          <Link to="/potential-cocktails">Potential Cocktails</Link>
          <Link to="/cocktails">Cocktails</Link>
          <Link to="/ingredients">Ingredients</Link>
          <Link to="/categories">Categories</Link>
        </div>
      </nav>
      
      <div className="main-content">
        <h1 className="site-title">The Online.Bar</h1>
        
        <form onSubmit={handleSearch} className="search-container">
          <div className="search-bar">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for cocktails, ingredients..."
              className="search-input"
            />
            <button type="submit" className="search-button">
              Search
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LandingPage; 
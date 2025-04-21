import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { searchItems, SearchResult } from '../services/searchService';
import '../styles/SearchBar.css';

const SearchBar: React.FC = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [hasMoreResults, setHasMoreResults] = useState(false);
  const navigate = useNavigate();
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const search = async () => {
      if (query.length < 2) {
        setResults([]);
        setHasMoreResults(false);
        return;
      }

      const searchResults = await searchItems(query);
      setResults(searchResults);
      setHasMoreResults(searchResults.length === 10);
      setIsOpen(true);
    };

    const debounceTimer = setTimeout(search, 300);
    return () => clearTimeout(debounceTimer);
  }, [query]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev < results.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : prev));
    } else if (e.key === 'Enter' && selectedIndex >= 0) {
      handleSelect(results[selectedIndex]);
    }
  };

  const handleSelect = (result: SearchResult) => {
    setQuery('');
    setIsOpen(false);
    const route = result.type === 'cocktail' ? 'cocktails' : 'ingredients';
    navigate(`/${route}/${result.slug}`);
  };

  const getItemUrl = (result: SearchResult) => {
    return `/${result.type}/${result.id}`;
  };

  return (
    <div className="search-container" ref={searchRef}>
      <div className="search-input-wrapper">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Search cocktails or ingredients..."
          className="search-input"
        />
        {isOpen && results.length > 0 && (
          <div className="search-results">
            {results.map((result, index) => (
              <div
                key={result.id}
                className={`search-result-item ${index === selectedIndex ? 'selected' : ''}`}
                onClick={() => handleSelect(result)}
              >
                <span className="result-name">{result.name}</span>
                <span className="result-type">
                  {result.type === 'ingredient' && result.ingredientType
                    ? `${result.type} (${result.ingredientType})`
                    : result.type}
                </span>
              </div>
            ))}
            {hasMoreResults && (
              <div className="more-results-message">
                Showing top 10 results. Try a more specific search.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchBar; 
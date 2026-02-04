import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MapPin, Loader2 } from 'lucide-react';
import { useLocationSearch } from '../../hooks/useWeatherData.js';

const SearchBar = ({ 
  onLocationSelect, 
  onUseLocation, 
  isGettingLocation = false 
}) => {
  const [search, setSearch] = useState('');
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef();
  const debounceRef = useRef();

  // Use our custom hook for location search with debouncing
  const { 
    data: results = [], 
    isLoading: isSearching, 
    error: searchError 
  } = useLocationSearch(search);

  // Debounce search input
  useEffect(() => {
    clearTimeout(debounceRef.current);
    if (search.trim()) {
      setShowResults(true);
      debounceRef.current = setTimeout(() => {
        // Search is handled by React Query in the hook
      }, 350);
    } else {
      setShowResults(false);
    }

    return () => clearTimeout(debounceRef.current);
  }, [search]);

  // Close results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLocationSelect = (location) => {
    const locationData = {
      label: `${location.name}, ${location.country}`,
      query: `${location.lat},${location.lon}`
    };
    onLocationSelect(locationData);
    setSearch('');
    setShowResults(false);
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Escape') {
      setShowResults(false);
    }
  };

  return (
    <div className="search" ref={searchRef}>
      <div className="search-input-wrapper">
        <Search className="search-icon" size={18} />
        <motion.input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => search.trim() && setShowResults(true)}
          type="text"
          placeholder="Search city"
          whileFocus={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
        />
        {isSearching && search.trim().length > 2 && (
          <Loader2 className="search-loading animate-spin" size={16} />
        )}
      </div>

      <motion.button 
        onClick={onUseLocation} 
        type="button"
        className="location-btn"
        disabled={isGettingLocation}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
      >
        {isGettingLocation ? (
          <Loader2 className="animate-spin" size={16} />
        ) : (
          <MapPin size={16} />
        )}
        <span>Live</span>
      </motion.button>

      <AnimatePresence>
        {showResults && (
          <motion.div 
            className="search-results"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {searchError ? (
              <div className="search-error">
                <p>Unable to search locations</p>
              </div>
            ) : results.length > 0 ? (
              results.slice(0, 5).map((item, index) => (
                <motion.button
                  key={`${item.lat}-${item.lon}`}
                  className="result"
                  onClick={() => handleLocationSelect(item)}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
                >
                  <span>{item.name}</span>
                  <small>{item.region}, {item.country}</small>
                </motion.button>
              ))
            ) : search.trim() && !isSearching ? (
              <div className="no-results">
                <p>No locations found</p>
              </div>
            ) : null}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SearchBar;
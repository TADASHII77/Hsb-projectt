import React, { useState, useEffect } from 'react';

const MapSection = ({ searchFilters, onSearch, updateSearchFilters }) => {
  const [job, setJob] = useState('');
  const [city, setCity] = useState('');
  const [showCitySuggestions, setShowCitySuggestions] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);



  // Update local state when global filters change (only on initial load or URL params)
  useEffect(() => {
    // Only update if the searchFilters have actual values and our local state is empty
    // This prevents overriding user input while they're typing
    if (searchFilters.job && !job) {
      setJob(searchFilters.job);
    }
    if (searchFilters.city && !city) {
      setCity(searchFilters.city);
    }
    
    // If there are search filters on mount, it means a search was already performed
    if (searchFilters.job || searchFilters.city) {
      setHasSearched(true);
    }
  }, []); // Empty dependency array - only run once on mount

  const handleSearch = () => {
    if (job.trim() || city.trim()) {
      onSearch(job.trim(), city.trim());
      setHasSearched(true);
    }
  };

  const handleJobInputChange = (e) => {
    const value = e.target.value;
    setJob(value);
  };

  const handleCityInputChange = (e) => {
    const value = e.target.value;
    setCity(value);
    
    // Allow free text input - no suggestions filtering
    setShowCitySuggestions(false);
  };



  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // Generate map URL based on submitted search filters
  const getMapUrl = () => {
    const location = searchFilters.city || 'Delhi, India';
    
    // Clean and encode the location for URL
    const cleanLocation = location.trim();
    const encodedLocation = encodeURIComponent(cleanLocation);
    
    // Use Google Maps iframe src that can search for any location dynamically
    // This method uses Google's built-in search without requiring an API key
    const mapUrl = `https://maps.google.com/maps?width=100%25&height=400&hl=en&q=${encodedLocation}&t=&z=12&ie=UTF8&iwloc=&output=embed`;
    
    return mapUrl;
  };

  return (
    <section className="pb-4 sm:pb-6 relative ">
      <div className="mx-auto">
        {/* Search Bar - Mobile Responsive */}
        <div className="bg-[#213A59] p-3 sm:p-4 rounded-lg border">
          <div className="max-w-7xl mx-auto flex flex-col lg:gap-14 gap-4 sm:flex-row sm:justify-center">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="What is your job?"
                value={job}
                onChange={handleJobInputChange}
                onKeyDown={handleKeyPress}
                className="w-full px-3 sm:px-4 py-2 sm:py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div className="relative w-full">
              <input
                type="text"
                placeholder="City"
                value={city}
                onChange={handleCityInputChange}
                onKeyDown={handleKeyPress}
                className="w-full px-3 sm:px-4 py-2 sm:py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              

            </div>
            
            <button
              onClick={handleSearch}
              className="w-full sm:w-56 shrink-0 px-4 sm:px-6 py-2 bg-red-600 text-white text-sm sm:text-base rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors duration-200"
            >
              Search
            </button>
          </div>
          
          {/* Quick search buttons - Mobile responsive */}
          {/* <div className="flex gap-2 mt-3 flex-wrap">
            <span className="text-white text-xs sm:text-sm">Popular:</span>
                         {['Heating Repair', 'AC Installation', 'Expert Service', 'Duct Cleaning'].map((quickSearch) => (
              <button
                key={quickSearch}
                onClick={() => {
                  setJob(quickSearch);
                  onSearch(quickSearch, city || searchFilters.city || 'Delhi');
                }}
                className="text-xs bg-white/20 text-white px-2 sm:px-3 py-1 rounded-full hover:bg-white/30 transition-colors"
              >
                {quickSearch}
              </button>
            ))}
          </div> */}
        </div>

        {/* Map Container - Mobile responsive */}
        <div className="rounded-lg overflow-hidden border border-gray-300 shadow " style={{ height: '400px' }}>
          <iframe
            key={`map-${searchFilters.city || 'Delhi'}-${searchFilters.job || 'HVAC'}`}
            title={`${searchFilters.job || 'Businesses'} in ${searchFilters.city || 'Delhi'}`}
            width="100%"
            height="100%"
            frameBorder="0"
            style={{ border: 0, minHeight: '250px' }}
            src={getMapUrl()}
            allowFullScreen=""
            aria-hidden="false"
            tabIndex="0"
          ></iframe>
        </div>
        
        {/* Search Results Summary - Mobile responsive */}
        {hasSearched && (searchFilters.job || searchFilters.city) && (
          <div className=" p-3 bg-blue-50 rounded-lg">
            <p className="text-xs sm:text-sm text-gray-700">
              Searching for: <span className="font-medium">{searchFilters.job || 'All Services'}</span> 
              {' '}in <span className="font-medium">{searchFilters.city.charAt(0).toUpperCase() + searchFilters.city.slice(1) || 'Delhi'}</span>
            </p>
          </div>
        )}
      </div>

      {/* Overlay to close suggestions when clicking outside */}
      {showCitySuggestions && (
        <div 
          className="fixed inset-0 z-40"
          onClick={() => {
            setShowCitySuggestions(false);
          }}
        />
      )}
    </section>
  );
};

export default MapSection; 
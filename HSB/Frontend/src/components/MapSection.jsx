import React, { useState, useEffect } from 'react';

const MapSection = ({ searchFilters, onSearch, updateSearchFilters }) => {
  const [job, setJob] = useState('');
  const [city, setCity] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showJobSuggestions, setShowJobSuggestions] = useState(false);
  const [showCitySuggestions, setShowCitySuggestions] = useState(false);

  // Job suggestions based on HVAC services
  const jobSuggestions = [
    'HVAC Technician',
    'Heating Repair',
    'Air Conditioning Repair',
    'Furnace Installation',
    'Duct Cleaning',
    'Heat Pump Service',
    'Thermostat Installation',
    'Boiler Repair',
    'Ventilation System',
    'Emergency HVAC Service'
  ];

  // Popular city suggestions - expandable list
  const citySuggestions = [
    // India - Major cities
    'Delhi', 'New Delhi', 'Mumbai', 'Bangalore', 'Chennai', 'Kolkata', 'Hyderabad', 'Pune', 'Ahmedabad', 'Jaipur', 'Lucknow', 'Gurgaon', 'Noida', 'Chandigarh', 'Kochi', 'Indore',
    
    // USA - Major cities and country
    'USA', 'United States', 'New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia', 'San Antonio', 'San Diego', 'Dallas', 'San Jose', 'Austin', 'Jacksonville', 'Fort Worth', 'Columbus', 'Charlotte', 'San Francisco', 'Indianapolis', 'Seattle', 'Denver', 'Washington DC', 'Boston', 'Nashville', 'Baltimore', 'Las Vegas', 'Portland', 'Detroit', 'Memphis', 'Louisville', 'Milwaukee', 'Albuquerque', 'Tucson', 'Fresno', 'Sacramento', 'Mesa', 'Kansas City', 'Atlanta', 'Colorado Springs', 'Omaha', 'Raleigh', 'Miami', 'Long Beach', 'Virginia Beach', 'Oakland', 'Minneapolis', 'Tampa', 'Tulsa', 'Arlington', 'New Orleans',
    
    // Canada - Major cities and country  
    'Canada', 'Toronto', 'Montreal', 'Vancouver', 'Calgary', 'Edmonton', 'Ottawa', 'Winnipeg', 'Quebec City', 'Hamilton', 'Kitchener', 'London', 'Victoria', 'Halifax', 'Oshawa', 'Windsor', 'Saskatoon', 'St. Catharines', 'Regina', 'Sherbrooke', 'Kelowna', 'Barrie', 'Guelph', 'Kingston', 'Kanata',
    
    // UK - Major cities and country
    'UK', 'United Kingdom', 'London', 'Birmingham', 'Manchester', 'Glasgow', 'Liverpool', 'Leeds', 'Sheffield', 'Edinburgh', 'Bristol', 'Cardiff', 'Leicester', 'Coventry', 'Bradford', 'Belfast', 'Nottingham', 'Hull', 'Newcastle', 'Stoke-on-Trent', 'Southampton', 'Derby', 'Portsmouth', 'Brighton', 'Plymouth', 'Northampton', 'Reading', 'Luton', 'Wolverhampton', 'Bolton', 'Bournemouth', 'Norwich', 'Swindon', 'Swansea', 'Southend-on-Sea', 'Middlesbrough', 'Peterborough', 'Cambridge', 'Doncaster', 'York', 'Poole', 'Gloucester', 'Burnley', 'Huddersfield', 'Telford', 'Watford', 'Oxford', 'Warrington', 'Slough', 'Stockport', 'Blackpool',
    
    // Australia - Major cities and country
    'Australia', 'Sydney', 'Melbourne', 'Brisbane', 'Perth', 'Adelaide', 'Gold Coast', 'Newcastle', 'Canberra', 'Central Coast', 'Wollongong', 'Logan City', 'Geelong', 'Hobart', 'Townsville', 'Cairns', 'Darwin', 'Toowoomba', 'Ballarat', 'Bendigo', 'Albury', 'Launceston', 'Mackay', 'Rockhampton', 'Bunbury', 'Bundaberg', 'Coffs Harbour', 'Wagga Wagga', 'Hervey Bay', 'Mildura', 'Shepparton', 'Port Macquarie', 'Gladstone', 'Tamworth', 'Traralgon', 'Orange', 'Bowral', 'Geraldton', 'Nowra', 'Warrnambool', 'Kalgoorlie', 'Albany', 'Blue Mountains', 'Dubbo', 'Goulburn',
    
    // Other major international cities
    'Paris, France', 'Berlin, Germany', 'Rome, Italy', 'Madrid, Spain', 'Amsterdam, Netherlands', 'Brussels, Belgium', 'Vienna, Austria', 'Zurich, Switzerland', 'Stockholm, Sweden', 'Copenhagen, Denmark', 'Oslo, Norway', 'Helsinki, Finland', 'Dublin, Ireland', 'Lisbon, Portugal', 'Athens, Greece', 'Prague, Czech Republic', 'Warsaw, Poland', 'Budapest, Hungary', 'Bucharest, Romania', 'Sofia, Bulgaria', 'Zagreb, Croatia', 'Ljubljana, Slovenia', 'Bratislava, Slovakia', 'Tallinn, Estonia', 'Riga, Latvia', 'Vilnius, Lithuania',
    
    // Asian cities
    'Tokyo, Japan', 'Seoul, South Korea', 'Beijing, China', 'Shanghai, China', 'Hong Kong', 'Singapore', 'Bangkok, Thailand', 'Manila, Philippines', 'Jakarta, Indonesia', 'Kuala Lumpur, Malaysia', 'Ho Chi Minh City, Vietnam', 'Hanoi, Vietnam', 'Phnom Penh, Cambodia', 'Yangon, Myanmar', 'Dhaka, Bangladesh', 'Karachi, Pakistan', 'Lahore, Pakistan', 'Islamabad, Pakistan', 'Kathmandu, Nepal', 'Colombo, Sri Lanka',
    
    // Middle Eastern cities
    'Dubai, UAE', 'Abu Dhabi, UAE', 'Doha, Qatar', 'Kuwait City, Kuwait', 'Riyadh, Saudi Arabia', 'Jeddah, Saudi Arabia', 'Tel Aviv, Israel', 'Jerusalem, Israel', 'Amman, Jordan', 'Beirut, Lebanon', 'Baghdad, Iraq', 'Tehran, Iran', 'Istanbul, Turkey', 'Ankara, Turkey',
    
    // African cities
    'Cairo, Egypt', 'Lagos, Nigeria', 'Johannesburg, South Africa', 'Cape Town, South Africa', 'Nairobi, Kenya', 'Casablanca, Morocco', 'Algiers, Algeria', 'Tunis, Tunisia', 'Accra, Ghana', 'Addis Ababa, Ethiopia',
    
    // South American cities
    'São Paulo, Brazil', 'Rio de Janeiro, Brazil', 'Buenos Aires, Argentina', 'Lima, Peru', 'Bogotá, Colombia', 'Santiago, Chile', 'Caracas, Venezuela', 'Quito, Ecuador', 'La Paz, Bolivia', 'Montevideo, Uruguay'
  ];

  // Update local state when global filters change
  useEffect(() => {
    setJob(searchFilters.job || '');
    setCity(searchFilters.city || '');
  }, [searchFilters]);

  const handleSearch = () => {
    if (job.trim() || city.trim()) {
      onSearch(job.trim(), city.trim() || 'Delhi');
      setShowJobSuggestions(false);
      setShowCitySuggestions(false);
    }
  };

  const handleJobInputChange = (e) => {
    const value = e.target.value;
    setJob(value);
    
    // Only show suggestions, don't update filters until search button is clicked
    if (value.length > 0) {
      const filtered = jobSuggestions.filter(suggestion =>
        suggestion.toLowerCase().includes(value.toLowerCase())
      );
      setSuggestions(filtered);
      setShowJobSuggestions(true);
    } else {
      setShowJobSuggestions(false);
    }
  };

  const handleCityInputChange = (e) => {
    const value = e.target.value;
    setCity(value);
    
    // Only show suggestions, don't update filters until search button is clicked
    if (value.length > 0) {
      const filtered = citySuggestions.filter(suggestion =>
        suggestion.toLowerCase().includes(value.toLowerCase())
      );
      setSuggestions(filtered);
      setShowCitySuggestions(true);
    } else {
      setShowCitySuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion, type) => {
    if (type === 'job') {
      setJob(suggestion);
      setShowJobSuggestions(false);
    } else {
      setCity(suggestion);
      setShowCitySuggestions(false);
    }
    // Don't update filters here - wait for search button click
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // Generate map URL based on city - Dynamic version that works with any location
  const getMapUrl = () => {
    const location = city || searchFilters.city || 'Delhi, India';
    
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
          <div className="flex flex-col lg:gap-14 gap-4 sm:flex-row sm:justify-center">
            <div className="relative flex-1 sm:flex-none">
              <input
                type="text"
                placeholder="What is your job?"
                value={job}
                onChange={handleJobInputChange}
                onKeyPress={handleKeyPress}
                onFocus={() => job.length > 0 && setShowJobSuggestions(true)}
                className="w-full sm:w-[400px] lg:w-[439px] px-3 sm:px-4 py-2 sm:py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              
              {/* Job Suggestions Dropdown */}
              {showJobSuggestions && suggestions.length > 0 && (
                <div className="absolute top-full left-0 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg z-50 max-h-48 overflow-y-auto">
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestionClick(suggestion, 'job')}
                      className="w-full px-3 sm:px-4 py-2 text-left text-sm hover:bg-gray-100 transition-colors text-gray-700"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            <div className="relative flex-1 sm:flex-none">
              <input
                type="text"
                placeholder="City"
                value={city}
                onChange={handleCityInputChange}
                onKeyPress={handleKeyPress}
                onFocus={() => city.length > 0 && setShowCitySuggestions(true)}
                className="w-full sm:w-[400px] lg:w-[444px] px-3 sm:px-4 py-2 sm:py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              
              {/* City Suggestions Dropdown */}
              {showCitySuggestions && suggestions.length > 0 && (
                <div className="absolute top-full left-0 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg z-50 max-h-48 overflow-y-auto">
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestionClick(suggestion, 'city')}
                      className="w-full px-3 sm:px-4 py-2 text-left text-sm hover:bg-gray-100 transition-colors text-gray-700"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            <button
              onClick={handleSearch}
              className="w-full sm:w-36 px-4 sm:px-6 py-2 bg-red-600 text-white text-sm sm:text-base rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors duration-200"
            >
              Search
            </button>
          </div>
          
          {/* Quick search buttons - Mobile responsive */}
          {/* <div className="flex gap-2 mt-3 flex-wrap">
            <span className="text-white text-xs sm:text-sm">Popular:</span>
            {['Heating Repair', 'AC Installation', 'Emergency Service', 'Duct Cleaning'].map((quickSearch) => (
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
            key={`map-${searchFilters.city || 'Delhi'}`}
            title={`${job || 'HVAC Technicians'} in ${city || searchFilters.city || 'Delhi'}`}
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
        {(searchFilters.job || searchFilters.city) && (
          <div className=" p-3 bg-blue-50 rounded-lg">
            <p className="text-xs sm:text-sm text-gray-700">
              Searching for: <span className="font-medium">{searchFilters.job || 'HVAC Services'}</span> 
              {' '}in <span className="font-medium">{searchFilters.city || 'Delhi'}</span>
            </p>
          </div>
        )}
      </div>

      {/* Overlay to close suggestions when clicking outside */}
      {(showJobSuggestions || showCitySuggestions) && (
        <div 
          className="fixed inset-0 z-40"
          onClick={() => {
            setShowJobSuggestions(false);
            setShowCitySuggestions(false);
          }}
        />
      )}
    </section>
  );
};

export default MapSection; 
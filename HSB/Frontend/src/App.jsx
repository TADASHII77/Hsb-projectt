import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useSearchParams, useLocation } from 'react-router-dom';
import Header from './components/Header.jsx';
import MapSection from './components/MapSection.jsx';
import TechniciansList from './components/TechniciansList.jsx';
import TechnicianReview from './components/TechnicianReview.jsx';
import JobPosting from './components/JobPosting.jsx';
import BusinessPosting from './components/BusinessPosting.jsx';
import ExpertContactForm from './components/ExpertContactForm.jsx';
import Footer from './components/Footer.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import BusinessDashboard from './pages/BusinessDashboard.jsx';
import UserDashboard from './pages/UserDashboard.jsx';
import AlertContainer from './components/AlertContainer.jsx';

// Home component that contains the main page layout
const Home = ({ searchFilters, updateSearchFilters, handleSearch, isMenuOpen, toggleMenu, userLocation, setUserLocation }) => {
  const [searchParams] = useSearchParams();
  
  // Handle URL parameters on component mount
  useEffect(() => {
    const jobParam = searchParams.get('job');
    const cityParam = searchParams.get('city');
    
    if (jobParam || cityParam) {
      console.log('Processing URL parameters:', { job: jobParam, city: cityParam });
      
      // Update search filters with URL parameters
      const newFilters = {};
      if (jobParam) newFilters.job = jobParam;
      if (cityParam) newFilters.city = cityParam;
      
      updateSearchFilters(newFilters);
      
      // Also trigger search to ensure immediate filtering
      if (jobParam || cityParam) {
        handleSearch(jobParam || '', cityParam || '');
      }
      
      // Clear URL parameters after setting filters (optional)
      // This prevents the URL from staying cluttered
      setTimeout(() => {
        const newUrl = window.location.pathname;
        window.history.replaceState({}, '', newUrl);
      }, 100);
    }
  }, [searchParams, updateSearchFilters]);

  return (
    <>
      <MapSection 
        searchFilters={searchFilters}
        onSearch={handleSearch}
        updateSearchFilters={updateSearchFilters}
      />
      <TechniciansList 
        searchFilters={searchFilters}
        updateSearchFilters={updateSearchFilters}
      />
    </>
  );
};

function App() {
  // Global search state
  const [searchFilters, setSearchFilters] = useState({
    job: '',
    city: 'Delhi',
    sortBy: '',
    category: '',
    starExpertsOnly: false,
    bureauVerifiedOnly: false,
    minRating: ''
  });

  // Menu state for header
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  // Location state
  const [userLocation, setUserLocation] = useState('Delhi, India');

  // Function to update search filters
  const updateSearchFilters = (newFilters) => {
    setSearchFilters(prev => ({ ...prev, ...newFilters }));
  };

  // Function to handle search from MapSection
  const handleSearch = (job, city) => {
    updateSearchFilters({ job, city });
  };

  // Function to toggle menu
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        <Header 
          isMenuOpen={isMenuOpen}
          toggleMenu={toggleMenu}
          userLocation={userLocation}
          setUserLocation={setUserLocation}
        />
        
        <Routes>
          <Route 
            path="/" 
            element={
              <Home 
                searchFilters={searchFilters}
                updateSearchFilters={updateSearchFilters}
                handleSearch={handleSearch}
                isMenuOpen={isMenuOpen}
                toggleMenu={toggleMenu}
                userLocation={userLocation}
                setUserLocation={setUserLocation}
              />
            } 
          />
          <Route path="/technician/:id" element={<TechnicianReview />} />
          <Route path="/job" element={<JobPosting />} />
          <Route path="/business" element={<BusinessPosting />} />
          <Route path="/business-dashboard" element={<BusinessDashboard />} />
          <Route path="/user-dashboard" element={<UserDashboard />} />
          <Route path="/expert-contact" element={<ExpertContactForm />} />
          <Route path="/admin/*" element={<AdminDashboard />} />
        </Routes>
        
        <Footer />
        <AlertContainer />
      </div>
    </Router>
  );
}

export default App;
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
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

// Home component that contains the main page layout
const Home = ({ searchFilters, updateSearchFilters, handleSearch, isMenuOpen, toggleMenu, userLocation, setUserLocation }) => {
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
      </div>
    </Router>
  );
}

export default App;
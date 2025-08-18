import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  Navigate,
} from "react-router-dom";
import Header from "./components/Header.jsx";
import MapSection from "./components/MapSection.jsx";
import BusinessesList from "./components/BusinessesList.jsx";
import BusinessReview from "./components/BusinessReview.jsx";
import JobPosting from "./components/JobPosting.jsx";
import BusinessPosting from "./components/BusinessPosting.jsx";
import Footer from "./components/Footer.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";
import UserDashboard from "./pages/UserDashboard.jsx";
import BusinessDashboard from "./pages/BusinessDashboard.jsx";
import AlertContainer from "./components/AlertContainer.jsx";
import { useUrlParams } from "./hooks/useUrlParams.js";
import { BusinessProvider } from "./hooks/useBusinesses.jsx";
import { AuthProvider, useAuth } from "./contexts/AuthContext.jsx";
import AuthGuard from "./components/AuthGuard.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import ExpertContactForm from "./components/ExpertContactForm.jsx";

// Home component that contains the main page layout
const Home = ({ searchFilters, updateSearchFilters, handleSearch }) => {
  const { job, location, hasParams } = useUrlParams();
  const [hasProcessedUrlParams, setHasProcessedUrlParams] = useState(false);

  // Handle URL parameters on component mount - only once
  useEffect(() => {
    if (hasParams && (job || location) && !hasProcessedUrlParams) {
      // Update search filters with URL parameters
      const newFilters = {};
      if (job) newFilters.job = job;
      if (location) newFilters.city = location;

      updateSearchFilters(newFilters);

      // Trigger search to ensure immediate filtering
      handleSearch(job, location);
      
      // Mark as processed to prevent infinite loop
      setHasProcessedUrlParams(true);
    }
  }, [job, location, hasParams, hasProcessedUrlParams, updateSearchFilters, handleSearch]);

  return (
    <>
      <MapSection
        searchFilters={searchFilters}
        onSearch={handleSearch}
        updateSearchFilters={updateSearchFilters}
      />
      <BusinessesList
        searchFilters={searchFilters}
        updateSearchFilters={updateSearchFilters}
        onSearch={handleSearch}
      />
    </>
  );
};

// AppContent component that can use useLocation hook
const AppContent = () => {
  const location = useLocation();
  const [showLayout, setShowLayout] = useState(false);
  const routes = ["/admin"];
  const { session } = useAuth();
  // Menu state for header
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Global search state
  const [searchFilters, setSearchFilters] = useState({
    job: "",
    city: "",
    sortBy: "",
    category: "",
    starExpertsOnly: false,
    bureauVerifiedOnly: false,
    minRating: "",
    maxDistance: "",
  });

  // Function to update search filters
  const updateSearchFilters = (newFilters) => {
    setSearchFilters((prev) => ({ ...prev, ...newFilters }));
  };

  // Function to handle search from MapSection or BusinessesList
  const handleSearch = (job, city) => {
    updateSearchFilters({ job, city });
    
    // Trigger the actual search in BusinessesList component
    // This will be handled by the BusinessesList component's searchBusinesses function
  };

  // Function to toggle menu
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  useEffect(() => {
    setShowLayout(!routes.includes(location.pathname));
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col">
      {showLayout && <Header isMenuOpen={isMenuOpen} toggleMenu={toggleMenu} />}

      <Routes>
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Home
                searchFilters={searchFilters}
                updateSearchFilters={updateSearchFilters}
                handleSearch={handleSearch}
                isMenuOpen={isMenuOpen}
                toggleMenu={toggleMenu}
              />
            </ProtectedRoute>
          }
        />
        <Route 
          path="/business/:id" 
          element={
            <ProtectedRoute>
              <BusinessReview />
            </ProtectedRoute>
          } 
        />
        <Route path="/job-posting" element={<JobPosting />} />
        <Route path="/business-registration" element={<BusinessPosting />} />
        <Route path="/login" element={<AuthGuard />} />
        <Route
          path="/user-dashboard"
          element={
            session && session.user.role === "user" ? (
              <UserDashboard />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/business-dashboard"
          element={
            session && session.user.role === "business" ? (
              <BusinessDashboard />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route path="/admin/*" element={<AdminDashboard />} />
        <Route path="/expert-contact" element={<ExpertContactForm />} />
      </Routes>

      {showLayout && <Footer />}
      <AlertContainer />
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <BusinessProvider>
        <Router>
          <AppContent />
        </Router>
      </BusinessProvider>
    </AuthProvider>
  );
}

export default App;

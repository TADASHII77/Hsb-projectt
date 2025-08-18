import React, { useState, useEffect, createContext, useContext, useCallback } from 'react';
import apiService from '../services/api';

// Create context
const BusinessContext = createContext();

// Provider component
export const BusinessProvider = ({ children }) => {
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(null);

  const refetch = useCallback(async (location = null) => {
    try {
      setLoading(true);
      setError(null);
      
      let response;
      if (location) {
        // Fetch businesses by location
        response = await apiService.getBusinessesByLocation(location);
        setCurrentLocation(location);
      } else {
        // Don't fetch all businesses by default - let the component handle nearby businesses
        setBusinesses([]);
        setCurrentLocation(null);
        return;
      }
      
      if (response && response.success && response.data) {
        setBusinesses(response.data);
      } else {
        throw new Error('Invalid API response format');
      }
    } catch (err) {
      console.error('Error fetching businesses:', err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchByLocation = useCallback(async (location) => {
    await refetch(location);
  }, [refetch]);

  const fetchAll = useCallback(async () => {
    await refetch();
  }, [refetch]);

  // Remove automatic fetch on mount - let the component handle nearby businesses
  // useEffect(() => {
  //   refetch();
  // }, []);

  const value = {
    businesses,
    loading,
    error,
    refetch,
    fetchByLocation,
    fetchAll,
    currentLocation
  };

  return (
    <BusinessContext.Provider value={value}>
      {children}
    </BusinessContext.Provider>
  );
};

// Hook to use the business context
export const useBusinesses = () => {
  const context = useContext(BusinessContext);
  if (context === undefined) {
    throw new Error('useBusinesses must be used within a BusinessProvider');
  }
  return context;
};

// Legacy hook for backward compatibility (deprecated)
export const useTechnicians = () => {
  console.warn('useTechnicians() is deprecated. Use useBusinesses() instead.');
  return useBusinesses();
}; 
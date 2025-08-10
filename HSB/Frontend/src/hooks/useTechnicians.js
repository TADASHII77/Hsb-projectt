import { useState, useEffect, useCallback } from 'react';
import apiService from '../services/api.js';
import { allTechnicians } from '../data/techniciansData.js'; // Fallback data

export const useTechnicians = () => {
  const [technicians, setTechnicians] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isUsingFallback, setIsUsingFallback] = useState(false);

  const fetchTechnicians = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiService.getTechnicians();
      console.log("response of technician data",response)
      
      if (response.success && response.data) {
        // Transform MongoDB data to match frontend format
        const transformedData = response.data.map(tech => ({
          id: tech.technicianId,
          technicianId: tech.technicianId, // Preserve original technicianId
          logo:tech.logo,
          name: tech.name,
          rating: tech.rating,
          reviews: tech.reviews,
          services: tech.services,
          verified: tech.verified,
          emergency: tech.emergency,
          distance: tech.distance,
          category: tech.category,
          address: tech.address,
          phone: tech.phone,
          email: tech.email, // Add email field
          website: tech.website,
          description: tech.description,
          serviceAreas: tech.serviceAreas,
          expertise: tech.expertise,
          workPhotos: tech.workPhotos
        }));
        // console.log("transformedData",transformedData)
        
        setTechnicians(transformedData);
        setIsUsingFallback(false);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err) {
      console.warn('Failed to fetch from API, using fallback data:', err);
      setTechnicians(allTechnicians);
      setIsUsingFallback(true);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const searchTechnicians = useCallback(async (query) => {
    try {
      setLoading(true);
      const response = await apiService.searchTechnicians(query);
      
      if (response.success && response.data) {
        const transformedData = response.data.map(tech => ({
          id: tech.technicianId,
          technicianId: tech.technicianId,
          name: tech.name,
          rating: tech.rating,
          reviews: tech.reviews,
          services: tech.services,
          verified: tech.verified,
          emergency: tech.emergency,
          distance: tech.distance,
          category: tech.category,
          address: tech.address,
          phone: tech.phone,
          email: tech.email,
          website: tech.website,
          description: tech.description,
          serviceAreas: tech.serviceAreas,
          expertise: tech.expertise
        }));
        
        setTechnicians(transformedData);
      }
    } catch (err) {
      console.error('Search failed:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const filterTechnicians = useCallback(async (filters) => {
    try {
      setLoading(true);
      const response = await apiService.filterTechnicians(filters);
      
      if (response.success && response.data) {
        const transformedData = response.data.map(tech => ({
          id: tech.technicianId,
          technicianId: tech.technicianId,
          name: tech.name,
          rating: tech.rating,
          reviews: tech.reviews,
          services: tech.services,
          verified: tech.verified,
          emergency: tech.emergency,
          distance: tech.distance,
          category: tech.category,
          address: tech.address,
          phone: tech.phone,
          email: tech.email,
          website: tech.website,
          description: tech.description,
          serviceAreas: tech.serviceAreas,
          expertise: tech.expertise
        }));
        
        setTechnicians(transformedData);
      }
    } catch (err) {
      console.error('Filter failed:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTechnicians();
  }, [fetchTechnicians]);

  return {
    technicians,
    loading,
    error,
    isUsingFallback,
    refetch: fetchTechnicians,
    searchTechnicians,
    filterTechnicians
  };
}; 
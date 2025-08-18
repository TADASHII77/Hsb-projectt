import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { parseUrlParams, hasSearchParams, clearUrlParams } from '../utils/urlParams.js';

/**
 * Custom hook to handle URL parameters for job and location requirements
 * @returns {Object} Object containing job and location requirements and utility functions
 */
export const useUrlParams = () => {
  const [searchParams] = useSearchParams();
  const [urlRequirements, setUrlRequirements] = useState({
    job: '',
    location: '',
    category: '',
    hasParams: false
  });

  useEffect(() => {
    if (hasSearchParams()) {
      const params = parseUrlParams();
      const jobRequirement = params.job || params.service || '';
      const locationRequirement = params.location || params.city || params.area || 'Canada'; // Default to Canada
      const categoryRequirement = params.category || '';

      setUrlRequirements({
        job: jobRequirement,
        location: locationRequirement,
        category: categoryRequirement,
        hasParams: !!(jobRequirement || locationRequirement || categoryRequirement)
      });

      // Clear URL parameters after processing
      setTimeout(() => {
        clearUrlParams();
      }, 100);
    } else {
      setUrlRequirements({
        job: '',
        location: '',
        category: '',
        hasParams: false
      });
    }
  }, [searchParams]);

  return {
    ...urlRequirements,
    clearParams: clearUrlParams
  };
};

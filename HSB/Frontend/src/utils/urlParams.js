/**
 * Utility functions for handling URL parameters
 */

/**
 * Parse URL parameters and extract job and location requirements
 * @param {string} url - The URL to parse (defaults to current window location)
 * @returns {Object} Object containing job and location parameters
 */
export const parseUrlParams = (url = window.location.href) => {
  try {
    const urlObj = new URL(url);
    const params = new URLSearchParams(urlObj.search);
    
    return {
      job: params.get('job') || '',
      location: params.get('location') || '',
      city: params.get('city') || '', // Support both 'location' and 'city' parameters
      service: params.get('service') || '', // Alternative to 'job'
      area: params.get('area') || '' // Alternative to 'location'
    };
  } catch (error) {
    console.error('Error parsing URL parameters:', error);
    return {
      job: '',
      location: '',
      city: '',
      service: '',
      area: ''
    };
  }
};

/**
 * Get the primary job requirement from URL parameters
 * @param {string} url - The URL to parse
 * @returns {string} The job/service requirement
 */
export const getJobRequirement = (url = window.location.href) => {
  const params = parseUrlParams(url);
  return params.job || params.service || '';
};

/**
 * Get the primary location requirement from URL parameters
 * @param {string} url - The URL to parse
 * @returns {string} The location requirement
 */
export const getLocationRequirement = (url = window.location.href) => {
  const params = parseUrlParams(url);
  return params.location || params.city || params.area || '';
};

/**
 * Check if URL contains any search parameters
 * @param {string} url - The URL to check
 * @returns {boolean} True if URL has search parameters
 */
export const hasSearchParams = (url = window.location.href) => {
  const params = parseUrlParams(url);
  return !!(params.job || params.service || params.location || params.city || params.area);
};

/**
 * Clear URL parameters without reloading the page
 */
export const clearUrlParams = () => {
  const newUrl = window.location.pathname;
  window.history.replaceState({}, '', newUrl);
};

/**
 * Update URL parameters without reloading the page
 * @param {Object} params - Object containing parameters to update
 */
export const updateUrlParams = (params) => {
  const url = new URL(window.location.href);
  const searchParams = url.searchParams;
  
  Object.entries(params).forEach(([key, value]) => {
    if (value) {
      searchParams.set(key, value);
    } else {
      searchParams.delete(key);
    }
  });
  
  window.history.replaceState({}, '', url.toString());
};

/**
 * Create a URL with search parameters
 * @param {Object} params - Object containing parameters
 * @param {string} baseUrl - Base URL (defaults to current location)
 * @returns {string} URL with parameters
 */
export const createSearchUrl = (params, baseUrl = window.location.origin) => {
  const url = new URL(baseUrl);
  const searchParams = url.searchParams;
  
  Object.entries(params).forEach(([key, value]) => {
    if (value) {
      searchParams.set(key, value);
    }
  });
  
  return url.toString();
};

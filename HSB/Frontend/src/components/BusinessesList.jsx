import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
} from "react";
import { useNavigate } from "react-router-dom";
import { showSuccess, showError, showWarning } from "../utils/alert";
import { getUserInfo, isUserLoggedIn } from "../utils/userSession";
import { useUrlParams } from "../hooks/useUrlParams";

import apiService from "../services/api";
import QuoteConfirmationModal from "./QuoteConfirmationModal";
import { InlineLoader, OverlayLoader } from "./Loader";

const BusinessesList = ({ searchFilters, updateSearchFilters, onSearch }) => {
  const navigate = useNavigate();
  const {
    job: urlJob,
    location: urlLocation,
    category: urlCategory,
    hasParams,
  } = useUrlParams();

  // State for businesses and API management
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // State for quote requests
  const [selectedQuotes, setSelectedQuotes] = useState(new Set());
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedBusiness, setSelectedBusiness] = useState(null);
  const [quoteType, setQuoteType] = useState("single");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  // New state for custom No Businesses modal
  const [showNoBusinessesModal, setShowNoBusinessesModal] = useState(false);

  // State for pagination
  const [displayedBusinesses, setDisplayedBusinesses] = useState(8);

  // State for carousel
  const [carouselStates, setCarouselStates] = useState({});

  // State for filter loading
  const [filterLoading, setFilterLoading] = useState(null);

  // Helper function to parse distance string to number
  const parseDistance = (distanceStr) => {
    if (!distanceStr) return 0;
    if (typeof distanceStr === "number") return distanceStr;

    // Extract number from strings like "10 km", "5km", "15", etc.
    const match = distanceStr.toString().match(/(\d+(?:\.\d+)?)/);
    return match ? parseFloat(match[1]) : 0;
  };

  // Main search function with API integration
  const searchBusinesses = useCallback(
    async (job, location, filters = {}) => {
      try {
        setLoading(true);
        setError(null);

        // Build search parameters
        const searchParams = {
          job: job || undefined,
          location: location || undefined,
          category: urlCategory || undefined,
          verified: filters.bureauVerifiedOnly || undefined,
          rating: filters.minRating
            ? parseFloat(filters.minRating.replace(/[^\d.]/g, ""))
            : undefined,
          sortBy: filters.sortBy || undefined,
          // If maxDistance is "no-limit", don't send distance parameter
          // Otherwise use the selected distance (defaults to "10")
          distance:
            filters.maxDistance === "no-limit"
              ? undefined
              : filters.maxDistance || "10",
          page: 1,
          limit: 50,
        };

        // Remove undefined values
        Object.keys(searchParams).forEach(
          (key) => searchParams[key] === undefined && delete searchParams[key]
        );

        const response = await apiService.searchBusinesses(searchParams);

        if (response && response.success && response.data) {
          setBusinesses(response.data);
        } else {
          setBusinesses([]);
        }
      } catch (err) {
        console.error("Error searching businesses:", err);
        setError(err.message);
        // Don't clear businesses on error, keep existing ones
      } finally {
        setLoading(false);
        setFilterLoading(null); // Clear filter loading state
      }
    },
    [urlCategory]
  );

  // Effect to handle URL params on initial load
  useEffect(() => {
    if (hasParams) {
      // Set search filters from URL params
      updateSearchFilters({
        job: urlJob || "",
        city: urlLocation || "",
      });
    }
  }, [hasParams, urlJob, urlLocation, updateSearchFilters]);

  // Effect to automatically search when location is available
  useEffect(() => {
    const location = searchFilters.city?.trim();

    // If location is available, automatically trigger search
    if (location) {
      searchBusinesses(searchFilters.job?.trim(), location, {
        ...searchFilters,
        maxDistance: searchFilters.maxDistance || "10", // Default to 10km if not set
      });
    }
  }, [
    searchFilters.city,
    searchFilters.job,
    searchFilters.bureauVerifiedOnly,
    searchFilters.minRating,
    searchFilters.sortBy,
  ]);

  // Effect to handle distance filter changes
  useEffect(() => {
    const location = searchFilters.city?.trim();

    // If location is available and distance filter changes, trigger search
    if (location && searchFilters.maxDistance !== undefined) {
      searchBusinesses(searchFilters.job?.trim(), location, searchFilters);
    }
  }, [searchFilters.maxDistance, searchBusinesses]);

  // Most filtering is now done on the backend, so this is simplified
  const filteredBusinesses = useMemo(() => {
    let filtered = [...businesses];

    // Only apply client-side filtering for features not supported by backend
    // Most filtering is handled by the API now

    // Filter by maximum distance (if not already handled by backend)
    if (searchFilters.maxDistance && filtered.length > 0) {
      const maxDist = parseFloat(searchFilters.maxDistance);
      filtered = filtered.filter((business) => {
        const businessDistance = parseDistance(
          business.serviceRadius?.distance || business.distance || "0"
        );
        const isWithinRange = businessDistance <= maxDist;

        return isWithinRange;
      });
    }

    return filtered;
  }, [businesses, searchFilters.maxDistance]);

  // Business separation is now handled in the render sections

  const handleFilterChange = (filterType, value) => {
    updateSearchFilters({ [filterType]: value });

    const location = searchFilters.city?.trim();
    if (
      location &&
      ["bureauVerifiedOnly", "minRating", "sortBy", "maxDistance"].includes(
        filterType
      )
    ) {
      setFilterLoading(filterType);

      const updatedFilters = { ...searchFilters, [filterType]: value };

      searchBusinesses(searchFilters.job?.trim(), location, updatedFilters);
    }
  };

  // Function to handle manual search button click
  const handleSearchClick = () => {
    const job = searchFilters.job?.trim();
    const location = searchFilters.city?.trim();

    if (job || location) {
      // Perform manual search with current filters
      searchBusinesses(job, location, searchFilters);
    }
  };

  // Helper function to get the correct business ID
  const getBusinessId = (business) => {
    return business._id || business.id;
  };

  // Helper function to format address
  const formatAddress = (business) => {
    if (!business.address) return "Address not available";

    const { street, province, state, country } = business.address;
    const parts = [street, province, state, country].filter(Boolean);
    return parts.length > 0 ? parts.join(", ") : "Address not available";
  };

  // Helper function to format distance for display
  const formatDistance = (business) => {
    const distance = business.serviceRadius?.distance || business.distance;
    if (!distance) return "N/A";

    const parsedDistance = parseDistance(distance);
    return `${parsedDistance} km`;
  };

  // Track last search to prevent duplicate API calls
  const lastSearchRef = useRef({ job: "", location: "", filters: {} });

  // Function removed - using simplified search approach

  const handleQuoteRequest = (type, business = null) => {
    const userInfo = getUserInfo();

    if (!isUserLoggedIn()) {
      setShowLoginModal(true);
      return;
    }

    if (type === "bulk") {
      // Handle bulk quote request - get first 3 businesses
      const availableBusinesses = filteredBusinesses.slice(0, 3);
      if (availableBusinesses.length === 0) {
        setShowNoBusinessesModal(true);
        return;
      }

      setSelectedBusiness(availableBusinesses);
      setQuoteType("bulk");
      setShowConfirmModal(true);
    } else {
      // Handle individual quote request
      setSelectedBusiness(business);
      setQuoteType("single");
      setShowConfirmModal(true);
    }
  };

  const handleQuoteSubmit = async () => {
    // Double-check if user is still logged in before submitting
    if (!isUserLoggedIn()) {
      setIsSubmitting(false);
      setShowLoginModal(true);
      return;
    }

    setIsSubmitting(true);
    const userInfo = getUserInfo();

    try {
      if (quoteType === "bulk") {
        // Handle bulk quote request
        const results = [];
        const businesses = Array.isArray(selectedBusiness)
          ? selectedBusiness
          : [selectedBusiness];

        for (const business of businesses) {
          const businessId = getBusinessId(business);
          try {
            const result = await apiService.requestQuote(businessId, {
              name: userInfo.name,
              email: userInfo.email,
            });
            results.push({ business: business.name, success: result.success });

            if (result.success) {
              const newSelected = new Set(selectedQuotes);
              newSelected.add(businessId);
              setSelectedQuotes(newSelected);
            }
          } catch (error) {
            results.push({ business: business.name, success: false, error: error });
          }
        }

        const successCount = results.filter((r) => r.success).length;
        const totalCount = results.length;

        if (successCount === totalCount) {
          showSuccess(
            `Quote requests sent to all ${totalCount} businesses successfully!`,
            "Bulk Quotes Sent"
          );
        } else if (successCount > 0) {
          showWarning(
            `Quote requests sent to ${successCount} out of ${totalCount} businesses.`,
            "Partial Success"
          );
        } else {
          // Check if any of the errors are authentication-related
          const hasAuthError = results.some(r => 
            r.error && r.error.message && r.error.message.includes("User not found")
          );
          
          if (hasAuthError) {
            showError(
              "Please log in to send quote requests. Your session may have expired.",
              "Authentication Required"
            );
            setShowLoginModal(true);
          } else {
            showError(
              "Failed to send quote requests. Please try again.",
              "Request Failed"
            );
          }
        }
      } else {
        // Handle single quote request
        const businessId = getBusinessId(selectedBusiness);
        const result = await apiService.requestQuote(businessId, {
          name: userInfo.name,
          email: userInfo.email,
        });

        if (result.success) {
          const newSelected = new Set(selectedQuotes);
          newSelected.add(businessId);
          setSelectedQuotes(newSelected);

          showSuccess(
            "Quote request sent successfully! You will receive a confirmation email shortly.",
            "Quote Requested"
          );
        } else {
          showError(
            "Failed to send quote request. Please try again.",
            "Request Failed"
          );
        }
      }

      // Close modal and reset
      setShowConfirmModal(false);
      setSelectedBusiness(null);
      setQuoteType("single");
    } catch (error) {
      console.error("Error sending quote request:", error);
      
      // Check if it's an authentication/user not found error
      if (error.message && error.message.includes("User not found")) {
        showError(
          "Please log in to send quote requests. Your session may have expired.",
          "Authentication Required"
        );
        setShowLoginModal(true);
      } else {
        showError(
          "An error occurred while sending your quote request. Please try again.",
          "Request Error"
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const closeConfirmModal = () => {
    setShowConfirmModal(false);
    setSelectedBusiness(null);
    setQuoteType("single");
  };

  const handleBusinessClick = (business) => {
    // Use businessId for API data, fallback to id for static data
    const businessId = getBusinessId(business);
    navigate(`/business/${businessId}`);
  };

  const loadMoreBusinesses = () => {
    setDisplayedBusinesses((prev) =>
      Math.min(prev + 4, filteredBusinesses.length)
    );
  };

  // Function to generate appropriate header text based on search filters
  const getHeaderText = () => {
    const hasJob = searchFilters.job && searchFilters.job.trim() !== "";
    const hasCity = searchFilters.city && searchFilters.city.trim() !== "";

    if (hasJob && hasCity) {
      return `${searchFilters.job} in ${searchFilters.city}`;
    } else if (hasJob && !hasCity) {
      return `${searchFilters.job} - Location Required`;
    } else if (!hasJob && hasCity) {
      return `All Businesses in ${
        searchFilters.city.charAt(0).toUpperCase() + searchFilters.city.slice(1)
      }`;
    } else {
      return "All Businesses - Search for Services";
    }
  };

  // Function to check if search validation is needed
  const needsSearchValidation = () => {
    const hasJob = searchFilters.job && searchFilters.job.trim() !== "";
    const hasCity = searchFilters.city && searchFilters.city.trim() !== "";

    // If job is filled but city is empty, show validation message
    return hasJob && !hasCity;
  };

  // Function to check if both fields are empty
  const bothFieldsEmpty = () => {
    const hasJob = searchFilters.job && searchFilters.job.trim() !== "";
    const hasCity = searchFilters.city && searchFilters.city.trim() !== "";

    return !hasJob && !hasCity;
  };

  // Function to check if we should show businesses
  const shouldShowBusinesses = () => {
    const hasJob = searchFilters.job && searchFilters.job.trim() !== "";
    const hasCity = searchFilters.city && searchFilters.city.trim() !== "";

    // Show businesses if:
    // 1. Both job and city are provided (client-side filtering), OR
    // 2. Only city is provided (API-based filtering), OR
    // 3. No filters are applied (show all businesses)
    return (hasJob && hasCity) || (!hasJob && hasCity) || (!hasJob && !hasCity);
  };

  // Function to check if any filters are applied
  const hasActiveFilters = () => {
    return (
      searchFilters.starExpertsOnly ||
      searchFilters.bureauVerifiedOnly ||
      (searchFilters.minRating && searchFilters.minRating !== "") ||
      (searchFilters.sortBy && searchFilters.sortBy !== "") ||
      (searchFilters.maxDistance && searchFilters.maxDistance !== "" && searchFilters.maxDistance !== "no-limit" && searchFilters.maxDistance !== "10")
    );
  };

  const renderStars = (rating) => {
    return (
      <div className="flex items-center gap-1">
        <div className="bg-[#AF2638] text-white px-2 py-1 rounded flex items-center gap-1 text-sm font-medium">
          <span>{rating}</span>
          <span>★</span>
        </div>
      </div>
    );
  };

  const BusinessCard = ({ business, isRecommended = false }) => {
    return (
      <div
        className={`border rounded-[15px] p-3 sm:p-4 mb-4 bg-white cursor-pointer hover:shadow-lg transition-shadow duration-200 ${
          isRecommended
            ? "border-[#AF2638] border-2 shadow-md"
            : "border-black/40"
        }`}
        onClick={() => handleBusinessClick(business)}
      >
        {/* Mobile Layout */}
        <div className="block sm:hidden">
          {/* Top Section - Logo, Text, and Verification Badge */}
          <div className="flex items-start gap-3 mb-3">
            {/* Company Logo */}
            <div className=" w-16 h-16 flex items-center justify-center  rounded-lg">
              <img
                src={business.logo || "/Agesolutions.png"}
                alt={business.name}
                className="w-12 h-12 object-contain"
                onError={(e) => {
                  e.target.src = "/Agesolutions.png";
                }}
              />
            </div>

            {/* Company Name and Rating */}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="w-max text-lg font-semibold text-gray-900 leading-tight">
                  {business.name}
                </h3>
                {isRecommended && (
                  <span className="bg-[#AF2638] text-white text-xs px-2 py-1 rounded-full font-medium">
                    Recommended
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 mb-2">
                {renderStars(business.rating)}
                <span className="text-sm text-gray-600">
                  ({business.reviews} Reviews)
                </span>
              </div>

              {/* Distance and Address */}
              <div className="text-sm text-gray-600 mb-3">
                <p>
                  {formatDistance(business)} away • {formatAddress(business)}
                </p>
              </div>
            </div>

            {/* Verification Badge */}
            {business.verified && (
              <div className="flex-shrink-0 w-16 h-8 flex items-center justify-center">
                <img
                  src="/HSBverification.png"
                  alt="HSB Verification"
                  className="w-full h-full object-contain"
                />
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className=" flex justify-center mb-3">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleQuoteRequest("single", business);
              }}
              className={` py-2 px-4 rounded-md text-sm font-medium flex items-center justify-center gap-2 ${
                selectedQuotes.has(getBusinessId(business))
                  ? "bg-green-600 text-white"
                  : "bg-[#AF2638] text-white"
              }`}
            >
              <svg
                width="15"
                height="15"
                viewBox="0 0 15 15"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <g clipPath="url(#clip0_39_695)">
                  <path
                    d="M12.041 0.257324V2.9297H14.7132L12.041 0.257324Z"
                    fill="white"
                  />
                  <path
                    d="M11.6016 3.80859C11.3589 3.80859 11.1621 3.61184 11.1621 3.36914V0H4.86328C4.13634 0 3.54492 0.591416 3.54492 1.31836V6.23112C3.68971 6.218 3.83622 6.21094 3.98438 6.21094C5.48227 6.21094 6.82315 6.89578 7.71053 7.96875H12.4805C12.7232 7.96875 12.9199 8.16551 12.9199 8.4082C12.9199 8.6509 12.7232 8.84766 12.4805 8.84766H8.28949C8.56418 9.38367 8.74131 9.97749 8.79817 10.6055H12.4805C12.7232 10.6055 12.9199 10.8022 12.9199 11.0449C12.9199 11.2876 12.7232 11.4844 12.4805 11.4844H8.79817C8.66675 12.9357 7.89132 14.2039 6.76049 15H13.6523C14.3793 15 14.9707 14.4086 14.9707 13.6816V3.80859H11.6016ZM12.4805 6.21094H6.03516C5.79246 6.21094 5.5957 6.01418 5.5957 5.77148C5.5957 5.52879 5.79246 5.33203 6.03516 5.33203H12.4805C12.7232 5.33203 12.9199 5.52879 12.9199 5.77148C12.9199 6.01418 12.7232 6.21094 12.4805 6.21094Z"
                    fill="white"
                  />
                  <path
                    d="M3.98438 7.08984C1.80354 7.08984 0.0292969 8.86409 0.0292969 11.0449C0.0292969 13.2258 1.80354 15 3.98438 15C6.16521 15 7.93945 13.2258 7.93945 11.0449C7.93945 8.86409 6.16521 7.08984 3.98438 7.08984ZM3.74024 10.6055H4.22854C4.74006 10.6055 5.15625 11.0217 5.15625 11.5332V12.0215C5.15625 12.466 4.84189 12.8384 4.42383 12.9284V13.0957C4.42383 13.3384 4.22707 13.5352 3.98438 13.5352C3.74168 13.5352 3.54492 13.3384 3.54492 13.0957V12.9284C3.12686 12.8384 2.8125 12.466 2.8125 12.0215C2.8125 11.7788 3.00926 11.582 3.25195 11.582C3.49465 11.582 3.69141 11.7788 3.69141 12.0215C3.69141 12.0484 3.71332 12.0703 3.74024 12.0703H4.22854C4.25546 12.0703 4.27737 12.0484 4.27737 12.0215V11.5332C4.27737 11.5063 4.25546 11.4844 4.22854 11.4844H3.74024C3.22869 11.4844 2.8125 11.0682 2.8125 10.5566V10.0684C2.8125 9.62382 3.12686 9.25146 3.54492 9.16148V8.99414C3.54492 8.75145 3.74168 8.55469 3.98438 8.55469C4.22707 8.55469 4.42383 8.75145 4.42383 8.99414V9.16148C4.84189 9.25146 5.15625 9.62382 5.15625 10.0684C5.15625 10.3111 4.95949 10.5078 4.7168 10.5078C4.4741 10.5078 4.27734 10.3111 4.27734 10.0684C4.27734 10.0414 4.25543 10.0195 4.22851 10.0195H3.74021C3.71329 10.0195 3.69138 10.0414 3.69138 10.0684V10.5566C3.69141 10.5836 3.71332 10.6055 3.74024 10.6055Z"
                    fill="white"
                  />
                </g>
                <defs>
                  <clipPath id="clip0_39_695">
                    <rect width="15" height="15" fill="white" />
                  </clipPath>
                </defs>
              </svg>
              {selectedQuotes.has(getBusinessId(business))
                ? "Quote Requested"
                : "Get a Free Quote"}
            </button>
          </div>
        </div>

        {/* Desktop Layout */}
        <div
          className="hidden sm:flex items-start gap-6"
          style={{ minHeight: "180px" }}
        >
          {/* Company Logo */}
          <div className="flex  gap-6 w-full">
            <div
              className="flex-shrink-0 flex items-center justify-center"
              style={{ width: "161px", height: "160px", borderRadius: "10px" }}
            >
              <img
                src={business.logo || "/Agesolutions.png"}
                alt={business.name}
                className="w-full h-full object-fill"
                onError={(e) => {
                  e.target.src = "/Agesolutions.png";
                }}
              />
            </div>

            <div className="flex-1">
              {/* Company Name and Rating */}
              <div className="flex justify-between items-start mb-2">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-xl font-semibold text-gray-900">
                      {business.name}
                    </h3>
                    {isRecommended && (
                      <span className="bg-[#AF2638] text-white text-xs px-2 py-1 rounded-full font-medium">
                        Recommended
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    {renderStars(business.rating)}
                    <span className="text-sm text-gray-600">
                      ({business.reviews} Reviews)
                    </span>
                    {business.expert && (
                      <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">
                        24/7
                      </span>
                    )}
                  </div>
                </div>

                {/* Verification Badge */}
                {business.verified && (
                  <div
                    className="w-24 h-8"
                    style={{ width: "99.3846206665039px", height: "34px" }}
                  >
                    <img src="/HSBverification.png" alt="HSB Verification" />
                  </div>
                )}
              </div>

              {/* Distance and Address */}
              <div className="text-sm text-gray-600 mb-3">
                <p>
                  {formatDistance(business)} away • {formatAddress(business)}
                </p>
              </div>

              {/* Services */}
              <div className="flex flex-wrap gap-2 mb-2">
                {business.services.map((service, index) => (
                  <span
                    key={index}
                    className="text-sm bg-[#F3F3F3] rounded p-1 text-gray-600"
                  >
                    {service}
                  </span>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleQuoteRequest("single", business);
                  }}
                  className={`w-52 h-10 flex items-center justify-center gap-2 font-semibold rounded-md shadow transition-colors duration-200 ${
                    selectedQuotes.has(getBusinessId(business))
                      ? "bg-green-600 text-white hover:bg-green-700"
                      : "bg-[#AF2638] text-white hover:bg-red-700"
                  }`}
                >
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 15 15"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <g clipPath="url(#clip0_39_695)">
                      <path
                        d="M12.041 0.257324V2.9297H14.7132L12.041 0.257324Z"
                        fill="white"
                      />
                      <path
                        d="M11.6016 3.80859C11.3589 3.80859 11.1621 3.61184 11.1621 3.36914V0H4.86328C4.13634 0 3.54492 0.591416 3.54492 1.31836V6.23112C3.68971 6.218 3.83622 6.21094 3.98438 6.21094C5.48227 6.21094 6.82315 6.89578 7.71053 7.96875H12.4805C12.7232 7.96875 12.9199 8.16551 12.9199 8.4082C12.9199 8.6509 12.7232 8.84766 12.4805 8.84766H8.28949C8.56418 9.38367 8.74131 9.97749 8.79817 10.6055H12.4805C12.7232 10.6055 12.9199 10.8022 12.9199 11.0449C12.9199 11.2876 12.7232 11.4844 12.4805 11.4844H8.79817C8.66675 12.9357 7.89132 14.2039 6.76049 15H13.6523C14.3793 15 14.9707 14.4086 14.9707 13.6816V3.80859H11.6016ZM12.4805 6.21094H6.03516C5.79246 6.21094 5.5957 6.01418 5.5957 5.77148C5.5957 5.52879 5.79246 5.33203 6.03516 5.33203H12.4805C12.7232 5.33203 12.9199 5.52879 12.9199 5.77148C12.9199 6.01418 12.7232 6.21094 12.4805 6.21094Z"
                        fill="white"
                      />
                      <path
                        d="M3.98438 7.08984C1.80354 7.08984 0.0292969 8.86409 0.0292969 11.0449C0.0292969 13.2258 1.80354 15 3.98438 15C6.16521 15 7.93945 13.2258 7.93945 11.0449C7.93945 8.86409 6.16521 7.08984 3.98438 7.08984ZM3.74024 10.6055H4.22854C4.74006 10.6055 5.15625 11.0217 5.15625 11.5332V12.0215C5.15625 12.466 4.84189 12.8384 4.42383 12.9284V13.0957C4.42383 13.3384 4.22707 13.5352 3.98438 13.5352C3.74168 13.5352 3.54492 13.3384 3.54492 13.0957V12.9284C3.12686 12.8384 2.8125 12.466 2.8125 12.0215C2.8125 11.7788 3.00926 11.582 3.25195 11.582C3.49465 11.582 3.69141 11.7788 3.69141 12.0215C3.69141 12.0484 3.71332 12.0703 3.74024 12.0703H4.22854C4.25546 12.0703 4.27737 12.0484 4.27737 12.0215V11.5332C4.27737 11.5063 4.25546 11.4844 4.22854 11.4844H3.74024C3.22869 11.4844 2.8125 11.0682 2.8125 10.5566V10.0684C2.8125 9.62382 3.12686 9.25146 3.54492 9.16148V8.99414C3.54492 8.75145 3.74168 8.55469 3.98438 8.55469C4.22707 8.55469 4.42383 8.75145 4.42383 8.99414V9.16148C4.84189 9.25146 5.15625 9.62382 5.15625 10.0684C5.15625 10.3111 4.95949 10.5078 4.7168 10.5078C4.4741 10.5078 4.27734 10.3111 4.27734 10.0684C4.27734 10.0414 4.25543 10.0195 4.22851 10.0195H3.74021C3.71329 10.0195 3.69138 10.0414 3.69138 10.0684V10.5566C3.69141 10.5836 3.71332 10.6055 3.74024 10.6055Z"
                        fill="white"
                      />
                    </g>
                    <defs>
                      <clipPath id="clip0_39_695">
                        <rect width="15" height="15" fill="white" />
                      </clipPath>
                    </defs>
                  </svg>
                  {selectedQuotes.has(getBusinessId(business))
                    ? "Quote Requested"
                    : "Get a free Quote"}
                </button>
              </div>
            </div>
          </div>

          {/* Carousel for business work photos */}
          {(() => {
            // Prepare images: use business.images if available, else fallback to a default image
            const images =
              business.images && business.images.length > 0
                ? business.images
                : ["/image.png"];

            // Get carousel state for this business
            const businessId = getBusinessId(business);
            const currentIndex = carouselStates[businessId] || 0;

            const goToPrev = (e) => {
              e.stopPropagation();
              setCarouselStates((prev) => ({
                ...prev,
                [businessId]:
                  currentIndex === 0 ? images.length - 1 : currentIndex - 1,
              }));
            };

            const goToNext = (e) => {
              e.stopPropagation();
              setCarouselStates((prev) => ({
                ...prev,
                [businessId]:
                  currentIndex === images.length - 1 ? 0 : currentIndex + 1,
              }));
            };

            const goToIndex = (idx, e) => {
              e.stopPropagation();
              setCarouselStates((prev) => ({
                ...prev,
                [businessId]: idx,
              }));
            };

            return (
              <div
                className="relative w-full bg-gray-200 flex-shrink-0 ml-4 overflow-hidden"
                style={{
                  width: "244px",
                  height: "161px",
                  borderRadius: "10px",
                }}
              >
                {/* Image Slides */}
                <div className="relative w-full h-full overflow-hidden rounded-lg">
                  {images.map((src, idx) => (
                    <img
                      key={idx}
                      src={src}
                      alt={`${business.name} work ${idx + 1}`}
                      className={`absolute block w-full h-full object-cover transition-opacity duration-700 ease-in-out ${
                        idx === currentIndex
                          ? "opacity-100 z-10"
                          : "opacity-0 z-0"
                      }`}
                      style={{
                        top: 0,
                        left: 0,
                        borderRadius: "10px",
                      }}
                      onError={(e) => {
                        e.target.src = "/image.png";
                      }}
                    />
                  ))}
                </div>

                {/* Dots */}
                {/* {images.length > 1 && (
        <div className="absolute z-30 flex -translate-x-1/2 bottom-3 left-1/2 space-x-2">
          {images.map((_, idx) => (
            <button
              key={idx}
              type="button"
              className={`w-3 h-3 rounded-full ${currentIndex === idx ? 'bg-[#AF2638]' : 'bg-white border border-gray-300'}`}
              aria-current={currentIndex === idx}
              aria-label={`Slide ${idx + 1}`}
              onClick={e => goToIndex(idx, e)}
              style={{ outline: 'none' }}
            />
          ))}
        </div>
      )} */}

                {/* Prev/Next Buttons */}
                {images.length > 1 && (
                  <>
                    <button
                      type="button"
                      className="absolute top-0 left-0 z-30 flex items-center justify-center h-full px-2 cursor-pointer group focus:outline-none"
                      onClick={goToPrev}
                      tabIndex={-1}
                    >
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full  group-hover:bg-white/80">
                        <svg
                          className="w-4 h-4 "
                          fill="none"
                          viewBox="0 0 6 10"
                        >
                          <path
                            stroke="currentColor"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M5 1 1 5l4 4"
                          />
                        </svg>
                        <span className="sr-only">Previous</span>
                      </span>
                    </button>
                    <button
                      type="button"
                      className="absolute top-0 right-0 z-30 flex items-center justify-center h-full px-2 cursor-pointer group focus:outline-none"
                      onClick={goToNext}
                      tabIndex={-1}
                    >
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-white/60 group-hover:bg-white/80">
                        <svg
                          className="w-4 h-4 "
                          fill="none"
                          viewBox="0 0 6 10"
                        >
                          <path
                            stroke="currentColor"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="m1 9 4-4-4-4"
                          />
                        </svg>
                        <span className="sr-only">Next</span>
                      </span>
                    </button>
                  </>
                )}
              </div>
            );
          })()}
        </div>
      </div>
    );
  };

  // Show loading state
  if (loading) {
    return (
      <section className="bg-white px-2 sm:px-8">
        <div className="flex justify-center items-center py-12">
          <div className="text-lg text-gray-600">Loading businesses...</div>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-white px-2 sm:px-8">
      {/* Header Section */}
      <div className="max-w-7xl mx-auto mb-4 sm:mb-6">
        <div className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-center gap-3">
          <h2 className="text-heading-md sm:text-heading-lg text-gray-900 leading-tight">
            {getHeaderText()}
          </h2>
          <button
            onClick={() => handleQuoteRequest("bulk")}
            className="w-full sm:w-52 h-10 flex items-center justify-center gap-2 bg-[#AF2638] text-white font-semibold rounded-md shadow hover:bg-red-700 transition-colors duration-200 text-sm sm:text-base"
          >
            <svg
              width="15"
              height="15"
              viewBox="0 0 15 15"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <g clipPath="url(#clip0_39_695)">
                <path
                  d="M12.041 0.257324V2.9297H14.7132L12.041 0.257324Z"
                  fill="white"
                />
                <path
                  d="M11.6016 3.80859C11.3589 3.80859 11.1621 3.61184 11.1621 3.36914V0H4.86328C4.13634 0 3.54492 0.591416 3.54492 1.31836V6.23112C3.68971 6.218 3.83622 6.21094 3.98438 6.21094C5.48227 6.21094 6.82315 6.89578 7.71053 7.96875H12.4805C12.7232 7.96875 12.9199 8.16551 12.9199 8.4082C12.9199 8.6509 12.7232 8.84766 12.4805 8.84766H8.28949C8.56418 9.38367 8.74131 9.97749 8.79817 10.6055H12.4805C12.7232 10.6055 12.9199 10.8022 12.9199 11.0449C12.9199 11.2876 12.7232 11.4844 12.4805 11.4844H8.79817C8.66675 12.9357 7.89132 14.2039 6.76049 15H13.6523C14.3793 15 14.9707 14.4086 14.9707 13.6816V3.80859H11.6016ZM12.4805 6.21094H6.03516C5.79246 6.21094 5.5957 6.01418 5.5957 5.77148C5.5957 5.52879 5.79246 5.33203 6.03516 5.33203H12.4805C12.7232 5.33203 12.9199 5.52879 12.9199 5.77148C12.9199 6.01418 12.7232 6.21094 12.4805 6.21094Z"
                  fill="white"
                />
                <path
                  d="M3.98438 7.08984C1.80354 7.08984 0.0292969 8.86409 0.0292969 11.0449C0.0292969 13.2258 1.80354 15 3.98438 15C6.16521 15 7.93945 13.2258 7.93945 11.0449C7.93945 8.86409 6.16521 7.08984 3.98438 7.08984ZM3.74024 10.6055H4.22854C4.74006 10.6055 5.15625 11.0217 5.15625 11.5332V12.0215C5.15625 12.466 4.84189 12.8384 4.42383 12.9284V13.0957C4.42383 13.3384 4.22707 13.5352 3.98438 13.5352C3.74168 13.5352 3.54492 13.3384 3.54492 13.0957V12.9284C3.12686 12.8384 2.8125 12.466 2.8125 12.0215C2.8125 11.7788 3.00926 11.582 3.25195 11.582C3.49465 11.582 3.69141 11.7788 3.69141 12.0215C3.69141 12.0484 3.71332 12.0703 3.74024 12.0703H4.22854C4.25546 12.0703 4.27737 12.0484 4.27737 12.0215V11.5332C4.27737 11.5063 4.25546 11.4844 4.22854 11.4844H3.74024C3.22869 11.4844 2.8125 11.0682 2.8125 10.5566V10.0684C2.8125 9.62382 3.12686 9.25146 3.54492 9.16148V8.99414C3.54492 8.75145 3.74168 8.55469 3.98438 8.55469C4.22707 8.55469 4.42383 8.75145 4.42383 8.99414V9.16148C4.84189 9.25146 5.15625 9.62382 5.15625 10.0684C5.15625 10.3111 4.95949 10.5078 4.7168 10.5078C4.4741 10.5078 4.27734 10.3111 4.27734 10.0684C4.27734 10.0414 4.25543 10.0195 4.22851 10.0195H3.74021C3.71329 10.0195 3.69138 10.0414 3.69138 10.0684V10.5566C3.69141 10.5836 3.71332 10.6055 3.74024 10.6055Z"
                  fill="white"
                />
              </g>
              <defs>
                <clipPath id="clip0_39_695">
                  <rect width="15" height="15" fill="white" />
                </clipPath>
              </defs>
            </svg>
            Get Multiple Quotes
          </button>
        </div>

        {/* Results Summary */}
        {shouldShowBusinesses() &&
          (searchFilters.job || searchFilters.city) && (
            <div className="mt-2 text-gray-600 text-sm">
              <div className="flex items-center gap-2">
                {loading && (
                  <InlineLoader
                    size="sm"
                    color="primary"
                    text="Updating results..."
                  />
                )}
                {!loading && (
                  <span>
                    Found {filteredBusinesses.length} business
                    {filteredBusinesses.length !== 1 ? "es" : ""}
                    {searchFilters.job && ` for "${searchFilters.job}"`}
                    {searchFilters.city && ` in ${searchFilters.city}`}

                  </span>
                )}
              </div>
            </div>
          )}

        {/* Filters and Controls - Mobile Responsive */}
        {shouldShowBusinesses() && (
          <div className="flex flex-wrap items-center gap-2 sm:gap-4 mb-4 mt-4">
            <div className="flex items-center gap-2">
              <select
                value={searchFilters.sortBy || ""}
                onChange={(e) => handleFilterChange("sortBy", e.target.value)}
                disabled={filterLoading === "sortBy"}
                className={`border border-[#E5E5E5] bg-[#F3F3F3] rounded-md h-[34px] px-4 py-1 text-xs sm:text-sm opacity-100 focus:outline-none focus:ring-2 focus:ring-blue-500 font-body font-medium ${
                  filterLoading === "sortBy"
                    ? "opacity-50 cursor-not-allowed"
                    : ""
                }`}
              >
                <option value="">
                  {filterLoading === "sortBy" ? "Updating..." : "Sort by"}
                </option>
                <option value="Rating">Rating</option>
                <option value="Reviews">Reviews</option>
                <option value="Distance">Distance</option>
              </select>
              {filterLoading === "sortBy" && (
                <InlineLoader size="xs" color="primary" />
              )}
            </div>

            <div
              className={`flex justify-center items-center gap-2 border border-[#E5E5E5] rounded-md h-[34px] px-4 py-2 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-body font-medium transition-colors ${
                filterLoading === "bureauVerifiedOnly"
                  ? "opacity-50 cursor-not-allowed"
                  : "cursor-pointer"
              } ${
                searchFilters.bureauVerifiedOnly
                  ? "bg-[#213A59] text-white"
                  : "bg-[#F3F3F3] text-gray-600"
              }`}
              onClick={() => {
                if (filterLoading !== "bureauVerifiedOnly") {
                  handleFilterChange(
                    "bureauVerifiedOnly",
                    !searchFilters.bureauVerifiedOnly
                  );
                }
              }}
            >
              <div className="w-4 h-4 flex items-center justify-center">
                {filterLoading === "bureauVerifiedOnly" ? (
                  <InlineLoader size="xs" color="white" />
                ) : (
                  <img
                    src="/LogoIcon1.png"
                    alt="Bureau Verified"
                    className="w-full h-full object-contain"
                  />
                )}
              </div>
              <span className="text-xs sm:text-sm hidden sm:block">
                {filterLoading === "bureauVerifiedOnly"
                  ? "Updating..."
                  : "Bureau Verified Experts"}
              </span>
              <span className="text-xs sm:text-sm sm:hidden">
                {filterLoading === "bureauVerifiedOnly"
                  ? "Updating..."
                  : "Verified"}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={searchFilters.minRating || ""}
                onChange={(e) =>
                  handleFilterChange("minRating", e.target.value)
                }
                disabled={filterLoading === "minRating"}
                className={`border border-[#E5E5E5] bg-[#F3F3F3] rounded-md h-[34px] px-4 py-1 text-xs sm:text-sm opacity-100 focus:outline-none focus:ring-2 focus:ring-blue-500 font-body font-medium ${
                  filterLoading === "minRating"
                    ? "opacity-50 cursor-not-allowed"
                    : ""
                }`}
              >
                <option value="">
                  {filterLoading === "minRating" ? "Updating..." : "Rating"}
                </option>
                <option value="4.5+ Stars">4.5+ Stars</option>
                <option value="4+ Stars">4+ Stars</option>
                <option value="3+ Stars">3+ Stars</option>
              </select>
              {filterLoading === "minRating" && (
                <InlineLoader size="xs" color="primary" />
              )}
            </div>

            <div className="flex items-center gap-2">
              <select
                value={searchFilters.maxDistance || "10"}
                onChange={(e) =>
                  handleFilterChange("maxDistance", e.target.value)
                }
                disabled={filterLoading === "maxDistance"}
                className={`border rounded-md h-[34px] px-4 py-1 text-xs sm:text-sm opacity-100 focus:outline-none focus:ring-2 focus:ring-blue-500 font-body font-medium ${
                  filterLoading === "maxDistance"
                    ? "opacity-50 cursor-not-allowed"
                    : ""
                } ${
                  "border-[#E5E5E5] bg-[#F3F3F3]"
                }`}
              >
                <option value="no-limit">No Distance Limit</option>
                <option value="5">Within 5 km</option>
                <option value="10">Within 10 km</option>
                <option value="15">Within 15 km</option>
                <option value="25">Within 25 km</option>
                <option value="50">Within 50 km</option>
              </select>
              {filterLoading === "maxDistance" && (
                <InlineLoader size="xs" color="primary" />
              )}

            </div>

            {/* Search Button - Only show when manual search is needed */}
            {(searchFilters.job || searchFilters.city) &&
              !searchFilters.city && (
                <button
                  onClick={handleSearchClick}
                  disabled={loading}
                  className="bg-[#AF2638] text-white px-4 py-2 rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Searching...
                    </div>
                  ) : (
                    "Refresh Search"
                  )}
                </button>
              )}
          </div>
        )}
      </div>

      <div className="max-w-7xl mx-auto px-0">
        {/* Validation Messages */}
        {needsSearchValidation() && (
          <div className="text-center py-12">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 max-w-md mx-auto">
              <div className="flex items-center justify-center mb-4">
                <svg
                  className="w-12 h-12 text-yellow-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Location Required
              </h3>
              <p className="text-gray-600 mb-4">
                Please enter a location to find {searchFilters.job} services
                near you.
              </p>
              <button
                onClick={() => updateSearchFilters({ city: "" })}
                className="bg-[#AF2638] text-white px-4 py-2 rounded font-medium hover:bg-red-700 transition-colors"
              >
                Add Location
              </button>
            </div>
          </div>
        )}

        {/* Recommended Experts Section (4+ rating) */}
        {shouldShowBusinesses() && (
          <div className={`relative ${loading ? "opacity-75" : ""}`}>
            <>
              <div className="flex items-center gap-2 mb-3 sm:mb-4 mt-2">
                <div className="w-6 h-8 sm:w-8 sm:h-10">
                  <img src="/LogoIcon1.png" alt="logoicon" />
                </div>
                <span className="text-heading-md text-[#213A59] font-medium">
                  Recommended Experts{" "}
                  {searchFilters.city ? `in ${searchFilters.city}` : ""}
                </span>
              </div>
              {(() => {
                const recommendedExperts = filteredBusinesses
                  .filter((business) => business.rating >= 4)
                  .slice(
                    0,
                    Math.min(displayedBusinesses / 2, filteredBusinesses.length)
                  );

                return recommendedExperts.length > 0 ? (
                  <div className="mb-6">
                    {recommendedExperts.map((business) => (
                      <BusinessCard
                        key={getBusinessId(business)}
                        business={business}
                        isRecommended={true}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 mb-6">
                    <p className="text-gray-500 text-sm">
                      No recommended experts found{" "}
                      {searchFilters.city ? `in ${searchFilters.city}` : ""}.
                    </p>
                  </div>
                );
              })()}

              {/* Other Experts Section (below 4 rating) */}
              <div className={`relative ${loading ? "opacity-75" : ""}`}>
                <div className="flex items-center gap-2 mb-3 sm:mb-4 mt-2">
                  <div className="w-6 h-8 sm:w-8 sm:h-10">
                    <img src="/LogoIcon1.png" alt="logoicon" />
                  </div>
                  <span className="text-heading-md text-[#213A59] font-medium">
                    Other Experts{" "}
                    {searchFilters.city ? `in ${searchFilters.city}` : ""}
                  </span>
                </div>
                {(() => {
                  const recommendedCount = filteredBusinesses
                    .filter((business) => business.rating >= 4)
                    .slice(
                      0,
                      Math.min(
                        displayedBusinesses / 2,
                        filteredBusinesses.length
                      )
                    ).length;

                  const otherExperts = filteredBusinesses
                    .filter((business) => business.rating < 4)
                    .slice(0, displayedBusinesses - recommendedCount);

                  return otherExperts.length > 0 ? (
                    <div className="mb-6">
                      {otherExperts.map((business) => (
                        <BusinessCard
                          key={getBusinessId(business)}
                          business={business}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4 mb-6">
                      <p className="text-gray-500 text-sm">
                        No other experts found{" "}
                        {searchFilters.city ? `in ${searchFilters.city}` : ""}.
                      </p>
                    </div>
                  );
                })()}
              </div>
            </>
          </div>
        )}

        {/* Loading overlay for filter changes */}
        {loading && businesses.length > 0 && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 flex flex-col items-center">
              <InlineLoader
                size="lg"
                color="primary"
                text="Updating results..."
              />
            </div>
          </div>
        )}

        {/* Unified No Results Message - Only show when there are active search filters but no results */}
        {(searchFilters.job || searchFilters.city) &&
          businesses.length === 0 &&
          !loading &&
          hasActiveFilters() && (
            <div className="text-center py-12">
                              <button
                  onClick={() =>
                    updateSearchFilters({
                      starExpertsOnly: false,
                      bureauVerifiedOnly: false,
                      minRating: "",
                      sortBy: "",
                      maxDistance: "10",
                    })
                  }
                  className="bg-[#AF2638] text-white px-4 sm:px-6 py-2 rounded font-medium hover:bg-red-700 transition-colors text-sm sm:text-base"
                >
                  Clear Filters
                </button>
            </div>
          )}

        {/* Load More Button */}
        {displayedBusinesses < filteredBusinesses.length && (
          <div className="text-center mt-6 sm:mt-8">
            <button
              onClick={loadMoreBusinesses}
              className="bg-red-600 text-white px-4 sm:px-6 py-2 rounded-md font-medium hover:bg-red-700 transition-colors mb-3 text-sm sm:text-base"
            >
              Load More
            </button>
          </div>
        )}

        {/* Quote Summary */}
        {selectedQuotes.size > 0 && (
          <div className="fixed bottom-4 right-4 bg-[#AF2638] text-white p-3 sm:p-4 rounded-lg shadow-lg">
            <div className="text-xs sm:text-sm font-medium">
              {selectedQuotes.size} quote{selectedQuotes.size !== 1 ? "s" : ""}{" "}
              requested
            </div>
            <button
              onClick={() => setSelectedQuotes(new Set())}
              className="text-xs underline hover:no-underline"
            >
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* Quote Confirmation Modal */}
      <QuoteConfirmationModal
        showConfirmModal={showConfirmModal}
        quoteType={quoteType}
        selectedBusiness={selectedBusiness}
        isSubmitting={isSubmitting}
        onClose={closeConfirmModal}
        onSubmit={handleQuoteSubmit}
        getBusinessId={getBusinessId}
      />

      {/* Login Required Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
            {/* Header with gradient background */}
            <div className="bg-gradient-to-r from-[#213A59] to-[#AF2638] p-6 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                    <svg
                      className="w-6 h-6 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">Login Required</h3>
                    <p className="text-sm text-white/80">
                      Access your account to continue
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowLoginModal(false)}
                  className="text-white/80 hover:text-white p-1 rounded-full hover:bg-white/20 transition-colors"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-[#213A59] to-[#AF2638] rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-8 h-8 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">
                  Get Free Quotes from Top Businesses
                </h4>
                <p className="text-gray-600 text-sm leading-relaxed">
                  To request quotes and connect with verified businesses, you
                  need to create an account or post a job.
                </p>
              </div>

              {/* Benefits */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h5 className="font-medium text-gray-900 mb-3">Why login?</h5>
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-[#AF2638] text-white rounded-full flex items-center justify-center text-xs font-bold">
                      ✓
                    </div>
                    <span className="text-sm text-gray-700">
                      Get personalized quotes from verified businesses
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-[#AF2638] text-white rounded-full flex items-center justify-center text-xs font-bold">
                      ✓
                    </div>
                    <span className="text-sm text-gray-700">
                      Track your quote requests and responses
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-[#AF2638] text-white rounded-full flex items-center justify-center text-xs font-bold">
                      ✓
                    </div>
                    <span className="text-sm text-gray-700">
                      Save your favorite businesses for later
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-[#AF2638] text-white rounded-full flex items-center justify-center text-xs font-bold">
                      ✓
                    </div>
                    <span className="text-sm text-gray-700">
                      Receive notifications about new quotes
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={() => {
                    setShowLoginModal(false);
                    navigate("/job-posting");
                  }}
                  className="w-full bg-gradient-to-r from-[#213A59] to-[#AF2638] text-white font-semibold py-3 px-4 rounded-lg hover:from-[#1a2d47] hover:to-[#8f1e2f] transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                    />
                  </svg>
                  Post a Job (Customer Login)
                </button>

                <button
                  onClick={() => {
                    setShowLoginModal(false);
                    navigate("/business-registration");
                  }}
                  className="w-full border-2 border-[#213A59] text-[#213A59] font-semibold py-3 px-4 rounded-lg hover:bg-[#213A59] hover:text-white transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                    />
                  </svg>
                  Register Your Business
                </button>

                <div className="text-center">
                  <button
                    onClick={() => setShowLoginModal(false)}
                    className="text-gray-500 hover:text-gray-700 text-sm font-medium transition-colors"
                  >
                    Maybe later
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* No Businesses Available Modal */}
      {showNoBusinessesModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full mx-4 transform transition-all duration-300 ease-out">
            {/* Header with gradient background */}
            <div className="bg-gradient-to-r from-[#213A59] to-[#AF2638] rounded-t-2xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">No Businesses Found</h3>
                    <p className="text-white/90 text-sm">
                      We couldn't find any businesses for your request
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowNoBusinessesModal(false)}
                  className="text-white hover:text-gray-200 transition-colors duration-200"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-yellow-100 to-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-8 h-8 text-yellow-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                    />
                  </svg>
                </div>

                <h4 className="text-lg font-semibold text-gray-900 mb-3">
                  No businesses available for quote requests
                </h4>

                <p className="text-gray-600 mb-6 leading-relaxed">
                  We couldn't find any businesses that match your current
                  criteria. This might be due to your location, service type, or
                  search filters.
                </p>

                {/* Suggestions */}
                <div className="bg-gray-50 rounded-xl p-4 mb-6">
                  <h5 className="font-medium text-gray-900 mb-3">
                    Try these suggestions:
                  </h5>
                  <ul className="text-sm text-gray-600 space-y-2 text-left">
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      <span>
                        Expand your search area or try a different location
                      </span>
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      <span>Modify your service requirements or filters</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => setShowNoBusinessesModal(false)}
                  className="flex-1 bg-gray-100 text-gray-700 px-6 py-3 rounded-xl font-medium hover:bg-gray-200 transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                  Try Again
                </button>
              </div>

              {/* Additional Help */}
              <div className="mt-4 text-center">
                <p className="text-xs text-gray-500">
                  Need help?{" "}
                  <button className="text-[#213A59] hover:underline font-medium">
                    Contact Support
                  </button>
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default BusinessesList;

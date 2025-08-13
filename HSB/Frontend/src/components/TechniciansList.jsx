import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTechnicians } from '../hooks/useTechnicians';
import { allTechnicians } from '../data/techniciansData';
import apiService from '../services/api';

const TechniciansList = ({ searchFilters, updateSearchFilters }) => {
  const navigate = useNavigate();
  const [displayedTechnicians, setDisplayedTechnicians] = useState(8);
  const [selectedQuotes, setSelectedQuotes] = useState(new Set());
  const [showAllFilters, setShowAllFilters] = useState(false);
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [selectedTechnician, setSelectedTechnician] = useState(null);
  const [customerData, setCustomerData] = useState({
    name: '',
    email: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { technicians: apiTechnicians, loading, error, isUsingFallback } = useTechnicians();

  // Filter and sort technicians based on search filters
  const filteredTechnicians = useMemo(() => {
    let filtered = [...(apiTechnicians.length > 0 ? apiTechnicians : allTechnicians)];

    // Filter by job search
    if (searchFilters.job) {
      filtered = filtered.filter(tech => 
        tech.services.some(service => 
          service.toLowerCase().includes(searchFilters.job.toLowerCase())
        ) || tech.name.toLowerCase().includes(searchFilters.job.toLowerCase())
      );
    }

    // Filter by category
    if (searchFilters.category && searchFilters.category !== 'Categories') {
      filtered = filtered.filter(tech => 
        tech.category === searchFilters.category ||
        tech.services.some(service => 
          service.toLowerCase().includes(searchFilters.category.toLowerCase())
        )
      );
    }

    // Filter by star experts (verified only)
    if (searchFilters.starExpertsOnly) {
      filtered = filtered.filter(tech => tech.verified);
    }

    // Filter by bureau verified experts
    if (searchFilters.bureauVerifiedOnly) {
      filtered = filtered.filter(tech => tech.verified);
    }

    // Filter by minimum rating
    if (searchFilters.minRating) {
      const minRating = searchFilters.minRating === '4.5+ Stars' ? 4.5 :
                       searchFilters.minRating === '4+ Stars' ? 4 : 
                       searchFilters.minRating === '3+ Stars' ? 3 : 0;
      filtered = filtered.filter(tech => tech.rating >= minRating);
    }

    // Sort technicians
    if (searchFilters.sortBy) {
      switch (searchFilters.sortBy) {
        case 'Rating':
          filtered.sort((a, b) => b.rating - a.rating);
          break;
        case 'Reviews':
          filtered.sort((a, b) => b.reviews - a.reviews);
          break;
        case 'Distance':
          filtered.sort((a, b) => a.distance - b.distance);
          break;
        default:
          break;
      }
    }

    return filtered;
  }, [searchFilters, apiTechnicians]);

  // Separate recommended (top-rated) and other technicians
  const recommendedTechnicians = filteredTechnicians.filter(tech => tech.rating >= 4.7).slice(0, Math.min(displayedTechnicians / 2, 4));
  const otherTechnicians = filteredTechnicians.filter(tech => tech.rating < 4.7 || !recommendedTechnicians.includes(tech)).slice(0, displayedTechnicians - recommendedTechnicians.length);

  const handleFilterChange = (filterType, value) => {
    updateSearchFilters({ [filterType]: value });
  };

  // Helper function to get the correct technician ID
  const getTechnicianId = (technician) => {
    return technician.technicianId || technician.id;
  };

  const handleQuoteRequest = (technician) => {
    setSelectedTechnician(technician);
    setShowQuoteModal(true);
  };

  const handleQuoteSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const techId = getTechnicianId(selectedTechnician);
      const result = await apiService.requestQuote(techId, customerData);
      
      if (result.success) {
        // Mark as quote requested
    const newSelected = new Set(selectedQuotes);
        newSelected.add(techId);
        setSelectedQuotes(newSelected);
        
        // Close modal and reset form
        setShowQuoteModal(false);
        setCustomerData({ name: '', email: '' });
        setSelectedTechnician(null);
        
        alert('Quote request sent successfully! You will receive a confirmation email shortly.');
    } else {
        alert('Failed to send quote request. Please try again.');
    }
    } catch (error) {
      console.error('Error sending quote request:', error);
      alert('An error occurred while sending your quote request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const closeQuoteModal = () => {
    setShowQuoteModal(false);
    setCustomerData({ name: '', email: '' });
    setSelectedTechnician(null);
  };

  const handleTechnicianClick = (technician) => {
    // Use technicianId for API data, fallback to id for static data
    const techId = getTechnicianId(technician);
    navigate(`/technician/${techId}`);
  };

  const loadMoreTechnicians = () => {
    setDisplayedTechnicians(prev => Math.min(prev + 4, filteredTechnicians.length));
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

  const TechnicianCard = ({ tech, isRecommended = false }) => {
    console.log('TechnicianCard tech:', tech);
    
    return (
    <div 
      className="border border-black border-opacity-40 rounded-[15px] p-3 sm:p-4 mb-4 bg-white cursor-pointer hover:shadow-lg transition-shadow duration-200"
      onClick={() => handleTechnicianClick(tech)}
    >
      {/* Mobile Layout */}
      <div className="block sm:hidden">
        {/* Top Section - Logo, Text, and Verification Badge */}
        <div className="flex items-start gap-3 mb-3">
          {/* Company Logo */}
          <div className=" w-16 h-16 flex items-center justify-center  rounded-lg">
            <img 
              src={tech.logo || "/Agesolutions.png"} 
              alt={tech.name} 
              className="w-12 h-12 object-contain" 
              onError={(e) => {
                e.target.src = "/Agesolutions.png";
              }}
            />
          </div>
          
          {/* Company Name and Rating */}
          <div className="flex-1">
            <h3 className="w-max text-lg font-semibold text-gray-900 mb-1 leading-tight">
              {tech.name}
            </h3>
            <div className="flex items-center gap-2 mb-2">
              {renderStars(tech.rating)}
              <span className="text-sm text-gray-600">({tech.reviews} Reviews)</span>
            </div>
              
        {/* Distance and Address */}
        <div className="text-sm text-gray-600 mb-3">
          <p>{tech.distance}km away • {tech.address}</p>
        </div>
          </div>
          
          {/* Verification Badge */}
          {tech.verified && (
            <div className="flex-shrink-0 w-16 h-8 flex items-center justify-center">
              <img src="/HSBverification.png" alt='HSB Verification' className="w-full h-full object-contain" />
            </div>
          )}
        </div>
      
        
        {/* Emergency Badge
        {tech.emergency && (
          <div className="mb-3">
            <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">24/7</span>
          </div>
        )} */}
        
        {/* Action Buttons */}
        <div className=" flex justify-center mb-3">
          {/* <button 
            onClick={(e) => {
              e.stopPropagation();
              // Handle call functionality here
            }}
            className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md text-sm font-medium flex items-center justify-center gap-2"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M20.01 15.38c-1.23 0-2.42-.2-3.53-.56a.977.977 0 0 0-1.01.24l-1.57 1.97c-2.83-1.35-5.48-3.9-6.89-6.83l1.95-1.66c.27-.28.35-.67.24-1.02-.37-1.11-.56-2.3-.56-3.53 0-.54-.45-.99-.99-.99H4.19C3.65 3 3 3.24 3 3.99 3 13.28 10.73 21 20.01 21c.71 0 .99-.63.99-1.18v-3.45c0-.54-.45-.99-.99-.99z" fill="currentColor"/>
            </svg>
            Call Now
          </button> */}
          
          <button 
            onClick={(e) => {
              e.stopPropagation();
              handleQuoteRequest(tech);
            }}
            className={` py-2 px-4 rounded-md text-sm font-medium flex items-center justify-center gap-2 ${
              selectedQuotes.has(getTechnicianId(tech)) 
                ? 'bg-green-600 text-white' 
                : 'bg-[#AF2638] text-white'
            }`}
          >
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
              <g clipPath="url(#clip0_39_695)">
                <path d="M12.041 0.257324V2.9297H14.7132L12.041 0.257324Z" fill="white"/>
                <path d="M11.6016 3.80859C11.3589 3.80859 11.1621 3.61184 11.1621 3.36914V0H4.86328C4.13634 0 3.54492 0.591416 3.54492 1.31836V6.23112C3.68971 6.218 3.83622 6.21094 3.98438 6.21094C5.48227 6.21094 6.82315 6.89578 7.71053 7.96875H12.4805C12.7232 7.96875 12.9199 8.16551 12.9199 8.4082C12.9199 8.6509 12.7232 8.84766 12.4805 8.84766H8.28949C8.56418 9.38367 8.74131 9.97749 8.79817 10.6055H12.4805C12.7232 10.6055 12.9199 10.8022 12.9199 11.0449C12.9199 11.2876 12.7232 11.4844 12.4805 11.4844H8.79817C8.66675 12.9357 7.89132 14.2039 6.76049 15H13.6523C14.3793 15 14.9707 14.4086 14.9707 13.6816V3.80859H11.6016ZM12.4805 6.21094H6.03516C5.79246 6.21094 5.5957 6.01418 5.5957 5.77148C5.5957 5.52879 5.79246 5.33203 6.03516 5.33203H12.4805C12.7232 5.33203 12.9199 5.52879 12.9199 5.77148C12.9199 6.01418 12.7232 6.21094 12.4805 6.21094Z" fill="white"/>
                <path d="M3.98438 7.08984C1.80354 7.08984 0.0292969 8.86409 0.0292969 11.0449C0.0292969 13.2258 1.80354 15 3.98438 15C6.16521 15 7.93945 13.2258 7.93945 11.0449C7.93945 8.86409 6.16521 7.08984 3.98438 7.08984ZM3.74024 10.6055H4.22854C4.74006 10.6055 5.15625 11.0217 5.15625 11.5332V12.0215C5.15625 12.466 4.84189 12.8384 4.42383 12.9284V13.0957C4.42383 13.3384 4.22707 13.5352 3.98438 13.5352C3.74168 13.5352 3.54492 13.3384 3.54492 13.0957V12.9284C3.12686 12.8384 2.8125 12.466 2.8125 12.0215C2.8125 11.7788 3.00926 11.582 3.25195 11.582C3.49465 11.582 3.69141 11.7788 3.69141 12.0215C3.69141 12.0484 3.71332 12.0703 3.74024 12.0703H4.22854C4.25546 12.0703 4.27737 12.0484 4.27737 12.0215V11.5332C4.27737 11.5063 4.25546 11.4844 4.22854 11.4844H3.74024C3.22869 11.4844 2.8125 11.0682 2.8125 10.5566V10.0684C2.8125 9.62382 3.12686 9.25146 3.54492 9.16148V8.99414C3.54492 8.75145 3.74168 8.55469 3.98438 8.55469C4.22707 8.55469 4.42383 8.75145 4.42383 8.99414V9.16148C4.84189 9.25146 5.15625 9.62382 5.15625 10.0684C5.15625 10.3111 4.95949 10.5078 4.7168 10.5078C4.4741 10.5078 4.27734 10.3111 4.27734 10.0684C4.27734 10.0414 4.25543 10.0195 4.22851 10.0195H3.74021C3.71329 10.0195 3.69138 10.0414 3.69138 10.0684V10.5566C3.69141 10.5836 3.71332 10.6055 3.74024 10.6055Z" fill="white"/>
              </g>
              <defs>
                <clipPath id="clip0_39_695">
                  <rect width="15" height="15" fill="white"/>
                </clipPath>
              </defs>
            </svg>
            {selectedQuotes.has(getTechnicianId(tech)) ? 'Quote Requested' : 'Get a Free Quote'}
          </button>
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden sm:flex items-start gap-6" style={{ minHeight: '180px' }}>
        {/* Company Logo */}
        <div className="flex  gap-6 w-full">
        <div className="flex-shrink-0 flex items-center justify-center" style={{width: '161px', height: '160px', borderRadius: '10px'}}>
          <img 
          //  src={technician.logo || "/company-logo.png"} 
            src={tech.logo || "/Agesolutions.png"} 
            alt={tech.name}
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
              <h3 className="text-xl font-semibold text-gray-900 mb-1">
                {tech.name}
              </h3>
              <div className="flex items-center gap-2 mb-2">
                {renderStars(tech.rating)}
                <span className="text-sm text-gray-600">({tech.reviews} Reviews)</span>
                {tech.emergency && (
                  <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">24/7</span>
                )}
              </div>
            </div>
            
            {/* Verification Badge */}
            {tech.verified && (
              <div className="w-24 h-8" style={{ width: '99.3846206665039px', height: '34px' }}>
                <img src="/HSBverification.png" alt='HSB Verification' />
              </div>
            )}
          </div>
          
          {/* Distance and Address */}
          <div className="text-sm text-gray-600 mb-3">
            <p>{tech.distance}km away • {tech.address}</p>
          </div>
          
          {/* Services/Categories */}
          <div className="flex flex-wrap gap-2 mb-2">
            {tech.services.map((service, index) => (
              <span key={index} className="text-sm bg-[#F3F3F3] rounded p-1 text-gray-600">
                {service}
              </span>
            ))}
          </div>
          
          {/* Action Buttons */}
          <div className="flex gap-3">
            <button 
              onClick={(e) => {
                e.stopPropagation();
                handleQuoteRequest(tech);
              }}
              className={`w-52 h-10 flex items-center justify-center gap-2 font-semibold rounded-md shadow transition-colors duration-200 ${
                selectedQuotes.has(getTechnicianId(tech)) 
                  ? 'bg-green-600 text-white hover:bg-green-700' 
                  : 'bg-[#AF2638] text-white hover:bg-red-700'
              }`}
            >
              <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                <g clipPath="url(#clip0_39_695)">
                  <path d="M12.041 0.257324V2.9297H14.7132L12.041 0.257324Z" fill="white"/>
                  <path d="M11.6016 3.80859C11.3589 3.80859 11.1621 3.61184 11.1621 3.36914V0H4.86328C4.13634 0 3.54492 0.591416 3.54492 1.31836V6.23112C3.68971 6.218 3.83622 6.21094 3.98438 6.21094C5.48227 6.21094 6.82315 6.89578 7.71053 7.96875H12.4805C12.7232 7.96875 12.9199 8.16551 12.9199 8.4082C12.9199 8.6509 12.7232 8.84766 12.4805 8.84766H8.28949C8.56418 9.38367 8.74131 9.97749 8.79817 10.6055H12.4805C12.7232 10.6055 12.9199 10.8022 12.9199 11.0449C12.9199 11.2876 12.7232 11.4844 12.4805 11.4844H8.79817C8.66675 12.9357 7.89132 14.2039 6.76049 15H13.6523C14.3793 15 14.9707 14.4086 14.9707 13.6816V3.80859H11.6016ZM12.4805 6.21094H6.03516C5.79246 6.21094 5.5957 6.01418 5.5957 5.77148C5.5957 5.52879 5.79246 5.33203 6.03516 5.33203H12.4805C12.7232 5.33203 12.9199 5.52879 12.9199 5.77148C12.9199 6.01418 12.7232 6.21094 12.4805 6.21094Z" fill="white"/>
                  <path d="M3.98438 7.08984C1.80354 7.08984 0.0292969 8.86409 0.0292969 11.0449C0.0292969 13.2258 1.80354 15 3.98438 15C6.16521 15 7.93945 13.2258 7.93945 11.0449C7.93945 8.86409 6.16521 7.08984 3.98438 7.08984ZM3.74024 10.6055H4.22854C4.74006 10.6055 5.15625 11.0217 5.15625 11.5332V12.0215C5.15625 12.466 4.84189 12.8384 4.42383 12.9284V13.0957C4.42383 13.3384 4.22707 13.5352 3.98438 13.5352C3.74168 13.5352 3.54492 13.3384 3.54492 13.0957V12.9284C3.12686 12.8384 2.8125 12.466 2.8125 12.0215C2.8125 11.7788 3.00926 11.582 3.25195 11.582C3.49465 11.582 3.69141 11.7788 3.69141 12.0215C3.69141 12.0484 3.71332 12.0703 3.74024 12.0703H4.22854C4.25546 12.0703 4.27737 12.0484 4.27737 12.0215V11.5332C4.27737 11.5063 4.25546 11.4844 4.22854 11.4844H3.74024C3.22869 11.4844 2.8125 11.0682 2.8125 10.5566V10.0684C2.8125 9.62382 3.12686 9.25146 3.54492 9.16148V8.99414C3.54492 8.75145 3.74168 8.55469 3.98438 8.55469C4.22707 8.55469 4.42383 8.75145 4.42383 8.99414V9.16148C4.84189 9.25146 5.15625 9.62382 5.15625 10.0684C5.15625 10.3111 4.95949 10.5078 4.7168 10.5078C4.4741 10.5078 4.27734 10.3111 4.27734 10.0684C4.27734 10.0414 4.25543 10.0195 4.22851 10.0195H3.74021C3.71329 10.0195 3.69138 10.0414 3.69138 10.0684V10.5566C3.69141 10.5836 3.71332 10.6055 3.74024 10.6055Z" fill="white"/>
                </g>
                <defs>
                  <clipPath id="clip0_39_695">
                    <rect width="15" height="15" fill="white"/>
                  </clipPath>
                </defs>
              </svg>
              {selectedQuotes.has(getTechnicianId(tech)) ? 'Quote Requested' : 'Get a free Quote'}
            </button>
          </div>
        </div>
        </div>
        
        {/* Company Image */}

        
{/* 
{/* Carousel for technician work photos */}
{(() => {
  // Prepare images: use tech.workPhotos if available, else fallback to a default image
  const images = (tech.workPhotos && tech.workPhotos.length > 0)
    ? tech.workPhotos
    : ["/image.png"];

  // Carousel state (per card, so use React.useState inside render function)
  const [currentIndex, setCurrentIndex] = React.useState(0);

  const goToPrev = (e) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const goToNext = (e) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const goToIndex = (idx, e) => {
    e.stopPropagation();
    setCurrentIndex(idx);
  };

  return (
    <div
      className="relative w-full bg-gray-200 flex-shrink-0 ml-4 overflow-hidden"
      style={{ width: '244px', height: '161px', borderRadius: '10px' }}
    >
      {/* Image Slides */}
      <div className="relative w-full h-full overflow-hidden rounded-lg">
        {images.map((src, idx) => (
          <img
            key={idx}
            src={src}
            alt={`${tech.name} work ${idx + 1}`}
            className={`absolute block w-full h-full object-cover transition-opacity duration-700 ease-in-out ${idx === currentIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
            style={{
              top: 0,
              left: 0,
              borderRadius: '10px',
            }}
            onError={e => { e.target.src = "/image.png"; }}
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
              <svg className="w-4 h-4 " fill="none" viewBox="0 0 6 10">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 1 1 5l4 4"/>
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
              <svg className="w-4 h-4 " fill="none" viewBox="0 0 6 10">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 9 4-4-4-4"/>
              </svg>
              <span className="sr-only">Next</span>
            </span>
          </button>
        </>
      )}
    </div>
  );
})()}

        {/* <div className="bg-gray-200 flex-shrink-0 ml-4 overflow-hidden" style={{width: '244px', height: '161px', borderRadius: '10px'}}>
          <img 
            src={(tech.workPhotos && tech.workPhotos.length > 0) ? tech.workPhotos[0] : "/image.png"} 
            alt={`${tech.name} workspace`}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.src = "/image.png";
            }}
          />
        </div> */}
      </div>
    </div>
    );
  };

  // Show loading state
  if (loading) {
    return (
      <section className="bg-white px-2 sm:px-8">
        <div className="flex justify-center items-center py-12">
          <div className="text-lg text-gray-600">Loading technicians...</div>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-white px-2 sm:px-8">
      {/* API Status Indicator */}
      {isUsingFallback && (
        <div className="mb-4 p-3 bg-yellow-50 border-l-4 border-yellow-400 text-yellow-700">
          <p className="text-sm">
            ⚠️ Using offline data. Backend API is not available.
          </p>
        </div>
      )}
      
      {/* Header Section */}
      <div className="mb-4 sm:mb-6">
        <div className='flex flex-col sm:flex-row sm:justify-between items-start sm:items-center gap-3'>
          <h2 className="font-roboto font-semibold text-2xl sm:text-[40px] leading-[100%] align-middle tracking-normal">
            HVAC Technicians in {searchFilters.city || 'Delhi'}
          </h2>
          <button 
            onClick={() => handleQuoteRequest('bulk')}
            className="w-full sm:w-52 h-10 flex items-center justify-center gap-2 bg-[#AF2638] text-white font-semibold rounded-md shadow hover:bg-red-700 transition-colors duration-200 text-sm sm:text-base"
          >
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
              <g clipPath="url(#clip0_39_695)">
                <path d="M12.041 0.257324V2.9297H14.7132L12.041 0.257324Z" fill="white"/>
                <path d="M11.6016 3.80859C11.3589 3.80859 11.1621 3.61184 11.1621 3.36914V0H4.86328C4.13634 0 3.54492 0.591416 3.54492 1.31836V6.23112C3.68971 6.218 3.83622 6.21094 3.98438 6.21094C5.48227 6.21094 6.82315 6.89578 7.71053 7.96875H12.4805C12.7232 7.96875 12.9199 8.16551 12.9199 8.4082C12.9199 8.6509 12.7232 8.84766 12.4805 8.84766H8.28949C8.56418 9.38367 8.74131 9.97749 8.79817 10.6055H12.4805C12.7232 10.6055 12.9199 10.8022 12.9199 11.0449C12.9199 11.2876 12.7232 11.4844 12.4805 11.4844H8.79817C8.66675 12.9357 7.89132 14.2039 6.76049 15H13.6523C14.3793 15 14.9707 14.4086 14.9707 13.6816V3.80859H11.6016ZM12.4805 6.21094H6.03516C5.79246 6.21094 5.5957 6.01418 5.5957 5.77148C5.5957 5.52879 5.79246 5.33203 6.03516 5.33203H12.4805C12.7232 5.33203 12.9199 5.52879 12.9199 5.77148C12.9199 6.01418 12.7232 6.21094 12.4805 6.21094Z" fill="white"/>
                <path d="M3.98438 7.08984C1.80354 7.08984 0.0292969 8.86409 0.0292969 11.0449C0.0292969 13.2258 1.80354 15 3.98438 15C6.16521 15 7.93945 13.2258 7.93945 11.0449C7.93945 8.86409 6.16521 7.08984 3.98438 7.08984ZM3.74024 10.6055H4.22854C4.74006 10.6055 5.15625 11.0217 5.15625 11.5332V12.0215C5.15625 12.466 4.84189 12.8384 4.42383 12.9284V13.0957C4.42383 13.3384 4.22707 13.5352 3.98438 13.5352C3.74168 13.5352 3.54492 13.3384 3.54492 13.0957V12.9284C3.12686 12.8384 2.8125 12.466 2.8125 12.0215C2.8125 11.7788 3.00926 11.582 3.25195 11.582C3.49465 11.582 3.69141 11.7788 3.69141 12.0215C3.69141 12.0484 3.71332 12.0703 3.74024 12.0703H4.22854C4.25546 12.0703 4.27737 12.0484 4.27737 12.0215V11.5332C4.27737 11.5063 4.25546 11.4844 4.22854 11.4844H3.74024C3.22869 11.4844 2.8125 11.0682 2.8125 10.5566V10.0684C2.8125 9.62382 3.12686 9.25146 3.54492 9.16148V8.99414C3.54492 8.75145 3.74168 8.55469 3.98438 8.55469C4.22707 8.55469 4.42383 8.75145 4.42383 8.99414V9.16148C4.84189 9.25146 5.15625 9.62382 5.15625 10.0684C5.15625 10.3111 4.95949 10.5078 4.7168 10.5078C4.4741 10.5078 4.27734 10.3111 4.27734 10.0684C4.27734 10.0414 4.25543 10.0195 4.22851 10.0195H3.74021C3.71329 10.0195 3.69138 10.0414 3.69138 10.0684V10.5566C3.69141 10.5836 3.71332 10.6055 3.74024 10.6055Z" fill="white"/>
              </g>
              <defs>
                <clipPath id="clip0_39_695">
                  <rect width="15" height="15" fill="white"/>
                </clipPath>
              </defs>
            </svg>
            Get Multiple Quotes
          </button>
        </div>

        {/* Results Summary */}
        {(searchFilters.job || filteredTechnicians.length !== allTechnicians.length) && (
          <div className="mt-2 text-gray-600 text-sm">
            Found {filteredTechnicians.length} technician{filteredTechnicians.length !== 1 ? 's' : ''} 
            {searchFilters.job && ` for "${searchFilters.job}"`}
            {searchFilters.city && ` in ${searchFilters.city}`}
          </div>
        )}
        
        {/* Filters and Controls - Mobile Responsive */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-4 mb-4 mt-4">
          <div className="flex items-center gap-2">
            <select 
              value={searchFilters.sortBy || ''}
              onChange={(e) => handleFilterChange('sortBy', e.target.value)}
              className="border border-[#E5E5E5] bg-[#F3F3F3] rounded-md h-[34px] px-4 py-1 text-xs sm:text-sm opacity-100 focus:outline-none focus:ring-2 focus:ring-blue-500 font-roboto font-medium"
            
            >
              <option value="">Sort by</option>
              <option value="Rating">Rating</option>
              <option value="Reviews">Reviews</option>
              <option value="Distance">Distance</option>
            </select>
          </div>
          
          <div className="flex items-center gap-2">
            <select 
              value={searchFilters.category || ''}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              className="border border-[#E5E5E5] bg-[#F3F3F3] rounded-md h-[34px] px-4 py-1 text-xs sm:text-sm opacity-100 focus:outline-none focus:ring-2 focus:ring-blue-500 font-roboto font-medium"
            >
              <option value="">Categories</option>
              <option value="Heating">Heating</option>
              <option value="Cooling">Cooling</option>
              <option value="Installation">Installation</option>
              <option value="Repair">Repair</option>
              <option value="Emergency">Emergency</option>
              <option value="Maintenance">Maintenance</option>
            </select>
          </div>
          
          <div 
            className={`flex justify-center items-center gap-2 border border-[#E5E5E5] rounded-md h-[34px] px-4 py-2 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-roboto font-medium cursor-pointer transition-colors ${
              searchFilters.starExpertsOnly ? 'bg-[#AF2638] text-white' : 'bg-[#F3F3F3] text-gray-600'
            }`}
            onClick={() => handleFilterChange('starExpertsOnly', !searchFilters.starExpertsOnly)}
          >
            <div className="w-4 h-4 flex items-center justify-center">
              <img src="/StarRibbon.png" alt="Star Experts" className="w-full h-full object-contain" />
            </div>
            <span className="text-xs sm:text-sm">Star Experts</span>
          </div>
          
          <div 
            className={`flex justify-center items-center gap-2 border border-[#E5E5E5] rounded-md h-[34px] px-4 py-2 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-roboto font-medium cursor-pointer transition-colors ${
              searchFilters.bureauVerifiedOnly ? 'bg-[#AF2638] text-white' : 'bg-[#F3F3F3] text-gray-600'
            }`}
            onClick={() => handleFilterChange('bureauVerifiedOnly', !searchFilters.bureauVerifiedOnly)}
          >
            <div className="w-4 h-4 flex items-center justify-center">
              <img src="/LogoIcon1.png" alt="Bureau Verified" className="w-full h-full object-contain" />
            </div>
            <span className="text-xs sm:text-sm hidden sm:block">Bureau Verified Experts</span>
            <span className="text-xs sm:text-sm sm:hidden">Verified</span>
          </div>

          <div className="flex items-center gap-2">
            <select 
              value={searchFilters.minRating || ''}
              onChange={(e) => handleFilterChange('minRating', e.target.value)}
              className="border border-[#E5E5E5] bg-[#F3F3F3] rounded-md h-[34px] px-4 py-1 text-xs sm:text-sm opacity-100 focus:outline-none focus:ring-2 focus:ring-blue-500 font-roboto font-medium"
            >
              <option value="">Rating</option>
              <option value="4.5+ Stars">4.5+ Stars</option>
              <option value="4+ Stars">4+ Stars</option>
              <option value="3+ Stars">3+ Stars</option>
            </select>
          </div>
          
          <button 
            onClick={() => setShowAllFilters(!showAllFilters)}
            className="flex justify-center items-center gap-2 border border-[#E5E5E5] bg-[#F3F3F3] rounded-md h-[34px] px-4 py-2 text-xs sm:text-sm opacity-100 focus:outline-none focus:ring-2 focus:ring-blue-500 font-roboto font-medium"
          >
            <svg width="17" height="18" viewBox="0 0 17 18" fill="none" xmlns="http://www.w3.org/2000/svg">
<path fill-rule="evenodd" clip-rule="evenodd" d="M10.6513 3.22205C10.9447 3.22205 11.1825 3.47389 11.1825 3.78455V6.09758C11.1825 6.40824 10.9447 6.66008 10.6513 6.66008C10.3579 6.66008 10.12 6.40824 10.12 6.09758V5.47424H1.49622C1.20282 5.47424 0.964966 5.22241 0.964966 4.91174C0.964966 4.60109 1.20282 4.34924 1.49622 4.34924H10.12V3.78455C10.12 3.47389 10.3579 3.22205 10.6513 3.22205ZM16.1144 4.90629C16.1173 5.21693 15.8818 5.47121 15.5884 5.47422L12.7307 5.50356C12.4374 5.50658 12.1972 5.25719 12.1944 4.94654C12.1916 4.63589 12.4271 4.38163 12.7205 4.37861L15.5781 4.34927C15.8715 4.34626 16.1116 4.59565 16.1144 4.90629ZM6.40483 6.93584C6.69824 6.93584 6.93608 7.18768 6.93608 7.49834V8.62487V8.62614V9.81137C6.93608 10.122 6.69824 10.3739 6.40483 10.3739C6.11143 10.3739 5.87358 10.122 5.87358 9.81137V9.18804H1.49622C1.20282 9.18804 0.964966 8.93619 0.964966 8.62554C0.964966 8.31489 1.20282 8.06304 1.49622 8.06304H5.87358V7.49834C5.87358 7.18768 6.11143 6.93584 6.40483 6.93584ZM7.96868 8.62554C7.96868 8.31489 8.20654 8.06304 8.49993 8.06304H15.5833C15.8767 8.06304 16.1145 8.31489 16.1145 8.62554C16.1145 8.93619 15.8767 9.18804 15.5833 9.18804H8.49993C8.20654 9.18804 7.96868 8.93619 7.96868 8.62554ZM9.21953 11.4087C9.51292 11.4087 9.75078 11.6606 9.75078 11.9712V14.2842C9.75078 14.5949 9.51292 14.8467 9.21953 14.8467C8.92614 14.8467 8.68828 14.5949 8.68828 14.2842V13.6609H1.75161C1.45821 13.6609 1.22036 13.409 1.22036 13.0984C1.22036 12.7877 1.45821 12.5359 1.75161 12.5359H8.68828V11.9712C8.68828 11.6606 8.92614 11.4087 9.21953 11.4087ZM16.3699 13.0949C16.3717 13.4056 16.1353 13.6589 15.8419 13.6609L11.3265 13.6904C11.0331 13.6923 10.7938 13.442 10.792 13.1313C10.7902 12.8207 11.0266 12.5673 11.3199 12.5654L15.8354 12.5359C16.1288 12.534 16.3681 12.7843 16.3699 13.0949Z" fill="black"/>
</svg>

            {showAllFilters ? 'Hide' : 'All'} Filters
          </button>
        </div>

        {/* Advanced Filters - Mobile Responsive */}
        {showAllFilters && (
          <div className="bg-gray-50 p-3 sm:p-4 rounded-lg mb-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Emergency Service</label>
                <select 
                  value={searchFilters.emergency || ''}
                  onChange={(e) => handleFilterChange('emergency', e.target.value)}
                  className="w-full border border-gray-300 rounded px-2 sm:px-3 py-1 text-xs sm:text-sm"
                >
                  <option value="">Any</option>
                  <option value="true">24/7 Available</option>
                  <option value="false">Regular Hours</option>
                </select>
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Max Distance</label>
                <select 
                  value={searchFilters.maxDistance || ''}
                  onChange={(e) => handleFilterChange('maxDistance', e.target.value)}
                  className="w-full border border-gray-300 rounded px-2 sm:px-3 py-1 text-xs sm:text-sm"
                >
                  <option value="">Any Distance</option>
                  <option value="2">Within 2km</option>
                  <option value="5">Within 5km</option>
                  <option value="10">Within 10km</option>
                </select>
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Min Reviews</label>
                <select 
                  value={searchFilters.minReviews || ''}
                  onChange={(e) => handleFilterChange('minReviews', e.target.value)}
                  className="w-full border border-gray-300 rounded px-2 sm:px-3 py-1 text-xs sm:text-sm"
                >
                  <option value="">Any</option>
                  <option value="50">50+ Reviews</option>
                  <option value="100">100+ Reviews</option>
                  <option value="150">150+ Reviews</option>
                </select>
              </div>
              <div className="flex items-end">
                <button 
                  onClick={() => updateSearchFilters({
                    sortBy: '', category: '', starExpertsOnly: false, 
                    bureauVerifiedOnly: false, minRating: '', emergency: '',
                    maxDistance: '', minReviews: ''
                  })}
                  className="w-full bg-gray-500 text-white px-2 sm:px-3 py-1 rounded text-xs sm:text-sm hover:bg-gray-600 transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Recommended Section */}
        {recommendedTechnicians.length > 0 && (
          <div className="flex items-center gap-2 mb-3 sm:mb-4">
            <div className="w-6 h-8 sm:w-8 sm:h-10">
              <img src="/LogoIcon1.png" alt='logoicon' />
            </div>
            <span className="font-['Roboto'] font-medium text-lg sm:text-[30px] leading-[100%] align-middle text-[#213A59]">
              Recommended Experts Near You
            </span>
          </div>
        )}
      </div>

      <div className="px-0 sm:px-4">
        {/* Recommended Technicians */}
        {recommendedTechnicians.length > 0 && (
          <div className="mb-6 sm:mb-8">
            {recommendedTechnicians.map(tech => (
              <TechnicianCard key={getTechnicianId(tech)} tech={tech} isRecommended={true} />
            ))}
          </div>
        )}

        {/* Other Technicians Section */}
        {otherTechnicians.length > 0 && (
          <>
            <div className="flex items-center gap-2 mb-3 sm:mb-4 mt-2">
                          <div className="w-6 h-8 sm:w-8 sm:h-10">
              <img src="/LogoIcon1.png" alt='logoicon' />
            </div>
              <span className="font-['Roboto'] font-medium text-lg sm:text-[30px] leading-[100%] align-middle text-[#213A59]">
                Other Experts Near You
              </span>
            </div>

            <div className="">
              {otherTechnicians.map(tech => (
                <TechnicianCard key={getTechnicianId(tech)} tech={tech} />
              ))}
            </div>
          </>
        )}

        {/* No Results Message */}
        {filteredTechnicians.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500 text-base sm:text-lg mb-4">
              No technicians found matching your criteria
            </div>
            <button 
              onClick={() => updateSearchFilters({
                job: '', category: '', starExpertsOnly: false, 
                bureauVerifiedOnly: false, minRating: ''
              })}
              className="bg-[#AF2638] text-white px-4 sm:px-6 py-2 rounded font-medium hover:bg-red-700 transition-colors text-sm sm:text-base"
            >
              Clear Filters
            </button>
          </div>
        )}
        
        {/* Load More Button */}
        {displayedTechnicians < filteredTechnicians.length && (
          <div className="text-center mt-6 sm:mt-8">
            <button 
              onClick={loadMoreTechnicians}
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
              {selectedQuotes.size} quote{selectedQuotes.size !== 1 ? 's' : ''} requested
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

      {/* Quote Request Modal */}
      {showQuoteModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Request Quote from {selectedTechnician?.name}
              </h3>
              
              <form onSubmit={handleQuoteSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    value={customerData.name}
                    onChange={(e) => setCustomerData({...customerData, name: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#AF2638]"
                    required
                    disabled={isSubmitting}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Your Email *
                  </label>
                  <input
                    type="email"
                    value={customerData.email}
                    onChange={(e) => setCustomerData({...customerData, email: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#AF2638]"
                    required
                    disabled={isSubmitting}
                  />
                </div>
                
                <div className="text-sm text-gray-600">
                  <p>By requesting a quote, you agree to receive communication from the technician and our platform.</p>
                </div>
                
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={closeQuoteModal}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                    disabled={isSubmitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#AF2638] text-white rounded-md text-sm font-medium hover:bg-red-700 disabled:opacity-50"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Sending...' : 'Request Quote'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default TechniciansList;
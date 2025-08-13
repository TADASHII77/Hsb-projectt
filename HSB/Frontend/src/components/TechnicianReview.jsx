import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { techniciansData, reviewsData } from '../data/techniciansData';
import apiService from '../services/api';

const TechnicianReview = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Profile');
  const [showContactModal, setShowContactModal] = useState(false);
  const [technician, setTechnician] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTechnician = async () => {
      try {
        setLoading(true);
        console.log('Fetching technician with ID:', id);
        
        // Try to fetch from API first
        try {
          const response = await apiService.get(`/technicians/${id}`);
          console.log('API response:', response);
          
          if (response.success && response.data) {
            setTechnician(response.data);
            // For now, use static reviews data or empty array
            setReviews(reviewsData[id] || []);
            setLoading(false);
            return;
          }
        } catch (apiError) {
          console.log('API fetch failed, trying static data:', apiError);
        }

        // Fallback to static data
        const staticTechnician = techniciansData[id];
        if (staticTechnician) {
          setTechnician(staticTechnician);
          setReviews(reviewsData[id] || []);
        } else {
          setError('Technician not found');
        }
      } catch (err) {
        console.error('Error fetching technician:', err);
        setError('Failed to load technician data');
      } finally {
        setLoading(false);
      }
    };

    fetchTechnician();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#AF2638] mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900">Loading technician...</h2>
        </div>
      </div>
    );
  }

  if (error || !technician) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Technician Not Found</h2>
          <p className="text-gray-600 mb-4">The technician you're looking for doesn't exist or has been removed.</p>
          <button 
            onClick={() => navigate('/')}
            className="bg-[#AF2638] text-white px-6 py-2 rounded-md hover:bg-red-700 transition-colors"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  const renderStars = (rating, size = "text-base") => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    return (
      <div className={`flex ${size} text-yellow-400`}>
        {Array.from({ length: fullStars }, (_, i) => (
          <span key={i}>★</span>
        ))}
        {hasHalfStar && <span>☆</span>}
        {Array.from({ length: emptyStars }, (_, i) => (
          <span key={i} className="text-gray-300">☆</span>
        ))}
      </div>
    );
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'Profile':
        return (
          <div className="space-y-6 md:space-y-8">
            {/* Good to know section */}
            <div>
              <h3 className="text-lg md:text-2xl font-semibold mb-4 md:mb-6 text-black">Good to know</h3>
              <div className="space-y-3 md:space-y-4">
                <div className="flex items-center">
                  <svg className="w-3 h-3 md:w-4 md:h-4 mr-3 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm md:text-lg text-black">Verified by Home Service Bureau</span>
                </div>
                <div className="flex items-center">
                  <svg className="w-3 h-3 md:w-4 md:h-4 mr-3 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  <span className="text-sm md:text-lg text-black">Offers warranty</span>
                </div>
                <div className="flex items-center">
                  <svg className="w-3 h-3 md:w-4 md:h-4 mr-3 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  <span className="text-sm md:text-lg text-black">Trusted expert in your area</span>
                </div>
              </div>
            </div>
            
            {/* Expert In section */}
            <div>
              <h3 className="text-lg md:text-2xl font-semibold mb-4 md:mb-6 text-black">Expert In</h3>
              <p className="text-sm md:text-lg text-black leading-relaxed">
                {technician.expertise || technician.description || 'No expertise information available'}
              </p>
            </div>
            
            {/* About this company section */}
            <div>
              <h3 className="text-lg md:text-2xl font-semibold mb-4 md:mb-6 text-black">About this company</h3>
              <p className="text-sm md:text-lg text-black leading-relaxed mb-4 md:mb-6">
                {technician.description || 'No description available'}
              </p>
              <div>
                <h4 className="text-base md:text-lg font-semibold mb-2 md:mb-3 text-black">Service Areas:</h4>
                <p className="text-sm md:text-lg text-black">
                  {technician.serviceAreas || 'Service areas not specified'}
                </p>
              </div>
            </div>
            
            {/* Portfolio section */}
           
            {/* <div>
              <h3 className="text-lg md:text-2xl font-semibold mb-4 md:mb-6 text-black">Portfolio</h3>
              <div className="grid grid-cols-3 md:grid-cols-5 gap-2 md:gap-4">
                {technician.workPhotos && technician.workPhotos.length > 0 ? (
                  // Show first 3 uploaded work photos in Profile tab
                  technician.workPhotos.slice(0, 3).map((photo, i) => (
                    <div key={i} className="aspect-[3/2] bg-gray-200 rounded-lg overflow-hidden">
                      <img 
                        src={photo} 
                        alt={`Portfolio ${i + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = "/portfolio-1.png";
                        }}
                      />
                    </div>
                  ))
                ) : (
                  // Show default portfolio images if no work photos uploaded
                  Array.from({ length: 3 }, (_, i) => (
                    <div key={i} className="aspect-[3/2] bg-gray-200 rounded-lg overflow-hidden">
                      <img 
                        src="/portfolio-1.png" 
                        alt={`Portfolio ${i + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))
                )}
              </div>
               Show "View More" button if there are more than 3 photos 
              {technician.workPhotos && technician.workPhotos.length > 3 && (
                <div className="mt-4 text-center">
                  <button 
                    onClick={() => setActiveTab('Portfolio')}
                    className="text-[#AF2638] hover:text-red-700 font-medium"
                  >
                    View All {technician.workPhotos.length} Photos →
                  </button>
                </div>
              )}
            </div> */}

          
            
        
          </div>
        );
      
      case 'Portfolio':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg md:text-2xl font-semibold mb-4 md:mb-6 text-black">Portfolio</h3>
              <div className="grid grid-cols-3 md:grid-cols-5 gap-2 md:gap-4">
                {technician.workPhotos && technician.workPhotos.length > 0 ? (
                  // Show uploaded work photos
                  technician.workPhotos.map((photo, i) => (
                    <div key={i} className="aspect-[3/2] bg-gray-200 rounded-lg overflow-hidden">
                      <img 
                        src={photo} 
                        alt={`Portfolio ${i + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = "/portfolio-1.png";
                        }}
                      />
                    </div>
                  ))
                ) : (
                  // Show default portfolio images if no work photos uploaded
                  Array.from({ length: 6 }, (_, i) => (
                    <div key={i} className="aspect-[3/2] bg-gray-200 rounded-lg overflow-hidden">
                      <img 
                        src="/portfolio-1.png" 
                        alt={`Portfolio ${i + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))
                )}
              </div>
              {/* Pagination for mobile - only show if we have many photos */}
              {technician.workPhotos && technician.workPhotos.length > 9 && (
                <div className="md:hidden flex justify-center mt-4">
                  <div className="flex space-x-2">
                    <button className="w-5 h-5 bg-gray-800 text-white rounded text-xs flex items-center justify-center">1</button>
                    <button className="w-5 h-5 bg-gray-300 text-black rounded text-xs flex items-center justify-center">2</button>
                    <button className="w-5 h-5 bg-gray-300 text-black rounded text-xs flex items-center justify-center">3</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      
      case 'Reviews':
        return (
          <div className="space-y-4 md:space-y-6">
            {/* Reviews Header */}
              <div>
              <h3 className="text-lg md:text-2xl font-semibold mb-2 md:mb-3 text-black">Reviews</h3>
              <p className="text-sm md:text-lg font-semibold text-black mb-2">{technician.reviews || 0} Verified Reviews</p>
              <div className="flex items-center gap-2 md:gap-4">
                <span className="text-sm md:text-lg font-semibold text-black">{technician.rating || 0}/5</span>
                <div className="flex text-yellow-400">
                  {renderStars(technician.rating || 0, "text-sm md:text-base")}
                </div>
                <span className="text-sm md:text-lg text-black">average rating</span>
              </div>
              <button className="md:hidden mt-4 bg-[#AF2638] text-white px-4 py-2 rounded-lg text-xs font-medium hover:bg-red-700 transition-colors">
                Write A Review
              </button>
            </div>
            
            {/* Reviews List */}
            <div className="space-y-4 md:space-y-8">
              {reviews.slice(0, 3).map((review, index) => (
                <div key={review.id}>
                  <div className="flex items-start gap-3 md:gap-4">
                    <div className="w-8 h-8 md:w-12 md:h-12 bg-gray-300 rounded-full flex-shrink-0 overflow-hidden">
                      <img 
                        src="/profile-avatar.png" 
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 md:gap-3 mb-1 md:mb-2">
                        <h4 className="text-xs md:text-lg font-semibold text-black">{review.customerName}</h4>
                        <div className="flex text-yellow-400">
                          {renderStars(review.rating, "text-xs md:text-base")}
                        </div>
                      </div>
                      <p className="text-xs md:text-sm text-black mb-2 md:mb-4">{review.reviewCount} Reviews</p>
                      <p className="text-xs md:text-lg text-black leading-relaxed">{review.comment}</p>
                    </div>
                  </div>
                  {index < reviews.slice(0, 3).length - 1 && (
                    <hr className="mt-4 md:mt-8 border-gray-300" />
                  )}
                </div>
              ))}
            </div>

            {/* Load More Button */}
            <div className="flex justify-center mt-6 md:mt-8">
              <button className="bg-[#AF2638] text-white px-6 md:px-8 py-2 md:py-3 rounded-lg text-xs md:text-lg font-medium hover:bg-red-700 transition-colors">
                Load More
              </button>
            </div>
          </div>
        );
      
      case 'Contact Info':
        return (
          <div className="space-y-4 md:space-y-6">
              <div>
              <h3 className="text-lg md:text-2xl font-semibold mb-4 md:mb-6 text-black">Contact Information</h3>
              <div className="space-y-3 md:space-y-4">
                <div className="flex items-center">
                  <svg className="w-3 h-3 md:w-4 md:h-4 mr-3 text-black" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"/>
                  </svg>
                  <span className="text-sm md:text-lg text-black">{technician.phone || 'Phone not available'}</span>
              </div>
                <div className="flex items-center">
                  <svg className="w-3 h-3 md:w-4 md:h-4 mr-3 text-black" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.083 9h1.946c.089-1.546.383-2.97.837-4.118A6.004 6.004 0 004.083 9zM10 2a8 8 0 100 16 8 8 0 000-16zm0 2c-.076 0-.232.032-.465.262-.238.234-.497.623-.737 1.182-.389.907-.673 2.142-.766 3.556h3.936c-.093-1.414-.377-2.649-.766-3.556-.24-.559-.499-.948-.737-1.182C10.232 4.032 10.076 4 10 4zm3.971 5c-.089-1.546-.383-2.97-.837-4.118A6.004 6.004 0 0115.917 9h-1.946zm-2.003 2H8.032c.093 1.414.377 2.649.766 3.556.24.559.499.948.737 1.182.233.23.389.262.465.262.076 0 .232-.032.465-.262.238-.234.497-.623.737-1.182.389-.907.673-2.142.766-3.556zm1.166 4.118c.454-1.148.748-2.572.837-4.118h1.946a6.004 6.004 0 01-2.783 4.118zm-6.268 0C6.412 13.97 6.118 12.546 6.032 11H4.083a6.004 6.004 0 002.851 4.118z" clipRule="evenodd"/>
                  </svg>
                  <span className="text-sm md:text-lg text-black">{technician.website || 'Website not available'}</span>
              </div>
                <div className="flex items-center">
                  <svg className="w-3 h-3 md:w-4 md:h-4 mr-3 text-black" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"/>
                  </svg>
                  <span className="text-sm md:text-lg text-black">{technician.address || 'Address not available'}</span>
              </div>
              </div>
            </div>
            <div className='flex space-x-4 md:space-x-6'>
            <a href="#" className="text-[#213A59] hover:text-gray-600">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <g clip-path="url(#clip0_61_320)">
          <path d="M17.0703 0H2.92969C1.31439 0 0 1.31439 0 2.92969V17.0703C0 18.6856 1.31439 20 2.92969 20H8.82812V12.9297H6.48438V9.41406H8.82812V7.03125C8.82812 5.09262 10.4051 3.51562 12.3438 3.51562H15.8984V7.03125H12.3438V9.41406H15.8984L15.3125 12.9297H12.3438V20H17.0703C18.6856 20 20 18.6856 20 17.0703V2.92969C20 1.31439 18.6856 0 17.0703 0Z" fill="#213A59"/>
          </g>
          <defs>
          <clipPath id="clip0_61_320">
          <rect width="20" height="20" fill="white"/>
          </clipPath>
          </defs>
          </svg>

          </a>
          <a href="#" className="text-[#213A59] hover:text-gray-600">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
<g clip-path="url(#clip0_61_322)">
<path d="M11.7578 10C11.7578 10.9708 10.9708 11.7578 10 11.7578C9.02924 11.7578 8.24219 10.9708 8.24219 10C8.24219 9.02924 9.02924 8.24219 10 8.24219C10.9708 8.24219 11.7578 9.02924 11.7578 10Z" fill="#213A59"/>
<path d="M12.9688 4.6875H7.03125C5.73883 4.6875 4.6875 5.73883 4.6875 7.03125V12.9688C4.6875 14.2612 5.73883 15.3125 7.03125 15.3125H12.9688C14.2612 15.3125 15.3125 14.2612 15.3125 12.9688V7.03125C15.3125 5.73883 14.2612 4.6875 12.9688 4.6875ZM10 12.9297C8.38455 12.9297 7.07031 11.6154 7.07031 10C7.07031 8.38455 8.38455 7.07031 10 7.07031C11.6154 7.07031 12.9297 8.38455 12.9297 10C12.9297 11.6154 11.6154 12.9297 10 12.9297ZM13.3594 7.22656C13.0357 7.22656 12.7734 6.96426 12.7734 6.64062C12.7734 6.31699 13.0357 6.05469 13.3594 6.05469C13.683 6.05469 13.9453 6.31699 13.9453 6.64062C13.9453 6.96426 13.683 7.22656 13.3594 7.22656Z" fill="#213A59"/>
<path d="M14.7266 0H5.27344C2.36572 0 0 2.36572 0 5.27344V14.7266C0 17.6343 2.36572 20 5.27344 20H14.7266C17.6343 20 20 17.6343 20 14.7266V5.27344C20 2.36572 17.6343 0 14.7266 0ZM16.4844 12.9688C16.4844 14.9072 14.9072 16.4844 12.9688 16.4844H7.03125C5.09277 16.4844 3.51562 14.9072 3.51562 12.9688V7.03125C3.51562 5.09277 5.09277 3.51562 7.03125 3.51562H12.9688C14.9072 3.51562 16.4844 5.09277 16.4844 7.03125V12.9688Z" fill="#213A59"/>
</g>
<defs>
<clipPath id="clip0_61_322">
<rect width="20" height="20" fill="white"/>
</clipPath>
</defs>
</svg>

          </a>
          <a href="#" className="text-[#213A59] hover:text-gray-600">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
            </svg>
          </a>
          <a href="#" className="text-[#213A59] hover:text-gray-600">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
<g clip-path="url(#clip0_61_330)">
<path d="M10.6689 9.65857L15.1696 16.0962H13.3225L9.64982 10.8431V10.8428L9.11061 10.0716L4.82031 3.93469H6.66742L10.1297 8.88742L10.6689 9.65857Z" fill="#213A59"/>
<path d="M17.839 0H2.16104C0.967563 0 0 0.967563 0 2.16104V17.839C0 19.0324 0.967563 20 2.16104 20H17.839C19.0324 20 20 19.0324 20 17.839V2.16104C20 0.967563 19.0324 0 17.839 0ZM12.7566 16.9604L9.0401 11.5514L4.38696 16.9604H3.18435L8.50611 10.7746L3.18435 3.02934H7.24336L10.7627 8.15126L15.1689 3.02934H16.3715L11.2968 8.92828H11.2965L16.8156 16.9604H12.7566Z" fill="#213A59"/>
</g>
<defs>
<clipPath id="clip0_61_330">
<rect width="20" height="20" fill="white"/>
</clipPath>
</defs>
</svg>

          </a>
          <a href="#" className="text-[#213A59] hover:text-gray-600">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
<g clip-path="url(#clip0_61_333)">
<path d="M8.71436 8.03174V11.6825L12.0794 9.87301L8.71436 8.03174Z" fill="#213A59"/>
<path d="M14.9841 0H5C2.25397 0 0 2.25397 0 5.01587V15C0 17.746 2.25397 20 5 20H14.9841C17.746 20 20 17.746 20 14.9841V5.01587C20 2.25397 17.746 0 14.9841 0ZM16.1905 10.4921C16.1905 11.5397 16.0952 12.6032 16.0952 12.6032C16.0952 12.6032 15.9841 13.4921 15.619 13.8889C15.1429 14.4127 14.619 14.4127 14.381 14.4444C12.6349 14.5714 10.0159 14.5873 10.0159 14.5873C10.0159 14.5873 6.7619 14.5397 5.7619 14.4444C5.49206 14.3968 4.85714 14.4127 4.38095 13.8889C4 13.4921 3.90476 12.6032 3.90476 12.6032C3.90476 12.6032 3.80952 11.5397 3.80952 10.4921V9.50794C3.80952 8.46032 3.90476 7.39683 3.90476 7.39683C3.90476 7.39683 4.01587 6.50794 4.38095 6.11111C4.85714 5.5873 5.38095 5.57143 5.61905 5.53968C7.38095 5.4127 10 5.39683 10 5.39683C10 5.39683 12.619 5.4127 14.3651 5.53968C14.6032 5.57143 15.1429 5.5873 15.619 6.09524C16 6.49206 16.0952 7.39683 16.0952 7.39683C16.0952 7.39683 16.1905 8.46032 16.1905 9.50794V10.4921Z" fill="#213A59"/>
</g>
<defs>
<clipPath id="clip0_61_333">
<rect width="20" height="20" fill="white"/>
</clipPath>
</defs>
</svg>

          </a>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-white">
     

      {/* Main Content Container */}
      <div className="max-w-[1500px] mx-auto md:px-0">
        {/* Hero Section - Desktop */}
        <div className="hidden md:block relative h-[600px] overflow-hidden">
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: 'url(/hero-background.png)'
            }}
          >
            <div className="absolute inset-0 bg-black bg-opacity-50"></div>
          </div>
          
          {/* Company Info Content */}
          <div className="relative z-10 flex items-end h-full px-48 pb-12">
            <div className="flex items-end gap-8 w-full">
              {/* Company Logo */}
              <div className="w-60 h-60 bg-white rounded-lg shadow-lg flex items-center justify-center flex-shrink-0 ">
                <img 
                  src={technician.logo || "/company-logo.png"} 
                  alt="Company Logo"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = "/company-logo.png";
                  }}
                />
              </div>
              
              {/* Company Details */}
              <div className="flex-1">
                <h1 className="text-4xl font-semibold text-white mb-2">{technician.name}</h1>
                <p className="text-xl text-white mb-2">HVAC Technician</p>
                <p className="text-xl text-white mb-8">{technician.address}</p>
                
            <div className="flex items-center gap-6">
                  <button 
                    onClick={() => setShowContactModal(true)}
                    className="bg-[#AF2638] text-white px-8 py-3 rounded-lg text-lg font-medium hover:bg-red-700 transition-colors flex items-center gap-3"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"/>
                    </svg>
                    Get a Free Quote
                  </button>
                  <button className="border-2 border-white text-white px-8 py-3 rounded-lg text-lg font-medium hover:bg-white hover:text-gray-900 transition-colors flex items-center gap-3">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                </svg>
                    Write a Review
              </button>
                </div>
            </div>
          </div>
        </div>
      </div>

        {/* Hero Section - Mobile */}
        <div className="md:hidden">
            {/* Background Image */}
            <div 
            className="h-[200px] bg-cover bg-center relative"
              style={{
              backgroundImage: 'url(/herobackgroundmobile.png)'
              }}
            >
            <div className="absolute inset-0  bg-opacity-50"></div>
          </div>
              
                  {/* Company Logo */}
          <div className="flex justify-center -mt-16 relative z-10 mb-4">
            <div className="w-32 h-32 lg:w-32 lg:h-32 bg-white rounded-lg shadow-lg flex items-center justify-center border border-gray-300 p-2">
              <img 
                src={technician.logo || "/company-logo.png"} 
                alt="Company Logo"
                className="w-full h-full object-contain"
                onError={(e) => {
                  e.target.src = "/company-logo.png";
                }}
              />
            </div>
          </div>

          {/* Company Name */}
          <div className="text-center mb-4">
            <h1 className="text-xl font-semibold text-black mb-2">{technician.name}</h1>
            
            {/* HSB Verification Badges */}
            <div className="flex justify-center gap-2 mb-4">
              <img 
                src="/HSBverification.png" 
                alt="HSB Verification"
                className="h-6 w-auto object-contain"
              />
              <img 
                src="/HSBverification.png" 
                alt="HSB Verification"
                className="h-6 w-auto object-contain"
              />
            </div>
          </div>

          {/* Mobile Action Buttons */}
          <div className="px-5">
            <div className="flex gap-3 mb-6">
              {/* <button className="flex-1 bg-[#26AF2D] text-white py-2.5  text-xs font-medium">
                Call Now
              </button> */}
              <button 
                onClick={() => setShowContactModal(true)}
                className="flex-1 bg-[#AF2638] text-white py-2.5  text-xs font-medium"
              >
                Get A Free Quote
              </button>
              <button className="flex-1 bg-[#213A59] text-white py-2.5  text-xs font-medium">
                Write A Review
              </button>
          </div>
        </div>
      </div>

        {/* Bureau Score Section */}
        <div className=" px-5 md:px-48 py-6 md:py-24">
          <div className="bg-[#F3F3F3]  rounded-lg md:rounded-2xl p-5 md:p-14 shadow-sm">
            <div className="md:flex md:items-center md:justify-between">
              <div className="md:flex md:items-center ">
                <div>
                  <div className="flex items-center gap-2 md:block mb-3 md:mb-6">
                    <h2 className="text-base md:text-3xl font-semibold text-black">Bureau Score</h2>
                    <div className="md:hidden text-center flex items-center justify-center">
                      <div className="w-8 h-8 flex items-center justify-center">
                        <svg className="w-6 h-6" viewBox="0 0 46 47" fill="none">
                          <path d="M23 3.83L28.09 14.09L39.37 15.64L31.19 23.64L33.18 34.87L23 29.63L12.82 34.87L14.81 23.64L6.63 15.64L17.91 14.09L23 3.83Z" fill="url(#starGradientMobile)"/>
                          <defs>
                            <linearGradient id="starGradientMobile" x1="23" y1="3.83" x2="23" y2="34.87" gradientUnits="userSpaceOnUse">
                              <stop stopColor="#FFE61C"/>
                              <stop offset="1" stopColor="#FFA929"/>
                            </linearGradient>
                          </defs>
                        </svg>
                      </div>
                      <div className="text-sm font-semibold text-black">{technician.rating}/5</div>
                    </div>
                    <p className='md:hidden'style={{fontSize: '12px'}} >Based on 1,143 Reviews</p>
                  </div>
                  <div className="flex items-start gap-4 md:gap-8 mb-4 md:mb-0">
                    <div className="text-center md:text-left ">
                      
                    <div className="text-center md:text-left flex">
                      {/* Star Rating */}
                      <div className="hidden md:flex justify-center md:justify-start mb-2">
                        <div className="w-12 h-12 md:w-12 md:h-12 flex items-center justify-center">
                          <svg className="w-10 h-10 md:w-10 md:h-10" viewBox="0 0 46 47" fill="none">
                            <path d="M23 3.83L28.09 14.09L39.37 15.64L31.19 23.64L33.18 34.87L23 29.63L12.82 34.87L14.81 23.64L6.63 15.64L17.91 14.09L23 3.83Z" fill="url(#starGradientDesktop)"/>
                            <defs>
                              <linearGradient id="starGradientDesktop" x1="23" y1="3.83" x2="23" y2="34.87" gradientUnits="userSpaceOnUse">
                                <stop stopColor="#FFE61C"/>
                                <stop offset="1" stopColor="#FFA929"/>
                              </linearGradient>
                            </defs>
                      </svg>
                    </div>
                  </div>
                      <div className="hidden md:block text-base md:text-4xl font-semibold text-black mb-1 md:mb-2">{technician.rating}/5</div>
                    </div>
                      
                  
                    </div>
                    
                {/* <div className="hidden md:block border-l border-gray-300 h-24 mx-8"></div>
                 */}
                    <div className="space-y-4 md:space-y-5">
                    <div className="flex items-center justify-between gap-3 md:gap-4">
                      <span className="text-xs md:text-xs text-black w-auto">Quality of Work</span>
                      <div className="w-40 md:w-42 h-2.5 md:h-2.5 bg-[#D9D9D9]">
                        <div className="w-[56%] h-full bg-[#213A59]"></div>
                      </div>
                    </div>
                    <div className="flex justify-between items-center gap-3 md:gap-4">
                      <span className="text-xs md:text-xs text-black w-auto">Response Time</span>
                      <div className="w-40 md:w-42 h-2.5 md:h-2.5 bg-[#D9D9D9]">
                        <div className="w-[80%] h-full bg-[#213A59]"></div>
                      </div>
                    </div>
                    <div className="flex justify-between items-center gap-3 md:gap-4">
                      <span className="text-xs md:text-xs text-black w-auto">Budget</span>
                      <div className="w-40 md:w-42 h-2.5 md:h-2.5 bg-[#D9D9D9]">
                        <div className="w-[96%] h-full bg-[#213A59]"></div>
                    </div>
                  </div>
                    <div className="flex justify-between items-center gap-3 md:gap-4">
                      <span className="text-xs md:text-xs text-black w-auto">Communication</span>
                      <div className="w-40 md:w-42 h-2.5 md:h-2.5 bg-[#D9D9D9]">
                        <div className="w-[86%] h-full bg-[#213A59]"></div>
                      </div>
                    </div>
                  </div>
                    {/* <div className="md:hidden">
                      <p className="text-xs text-black">based on {technician.reviews.toLocaleString()} Reviews</p>
                    </div> */}
                  </div>

               

              
                </div>
                
                <div className="hidden md:block border-l border-gray-300 h-24 mx-8"></div>
                
                <div className="hidden md:block">
                  <p className="text-base font-semibold text-black mb-6">Review by score</p>
                  
                  <div className="space-y-6">
                  <div className="space-y-4 md:space-y-5">
                    <div className="flex justify-between items-center gap-3 md:gap-4">
                      <span className="text-xs md:text-xs text-black w-auto">Quality of Work</span>
                      <div className="w-40 md:w-42 h-2.5 md:h-2.5 bg-[#D9D9D9]">
                        <div className="w-[56%] h-full bg-[#213A59]"></div>
                      </div>
                          </div>
                    <div className="flex justify-between items-center gap-3 md:gap-4">
                      <span className="text-xs md:text-xs text-black w-auto">Response Time</span>
                      <div className="w-40 md:w-42 h-2.5 md:h-2.5 bg-[#D9D9D9]">
                        <div className="w-[80%] h-full bg-[#213A59]"></div>
                      </div>
                    </div>
                    <div className="flex justify-between items-center gap-3 md:gap-4">
                      <span className="text-xs md:text-xs text-black w-auto">Budget</span>
                      <div className="w-40 md:w-42 h-2.5 md:h-2.5 bg-[#D9D9D9]">
                        <div className="w-[96%] h-full bg-[#213A59]"></div>
                  </div>
                </div>
                  
                  </div>

                    
                  </div>
                </div>
              </div>
              
              <div className="hidden md:flex flex-col md:items-center md:gap-6">
                <div className="w-36 h-12">
                  <img 
                    src="/hsb-verification-1.png" 
                    alt="HSB Verification"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="w-36 h-12">
                  <img 
                    src="/hsb-verification-1.png" 
                    alt="HSB Verification"
                    className="w-full h-full object-contain"
                  />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
        <div className="px-5 md:px-48">
          <div className="flex border-b border-gray-300 overflow-x-auto">
                {['Profile', 'Portfolio', 'Reviews', 'Contact Info'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                className={`px-3 md:px-6 py-3 md:py-4 text-sm md:text-3xl font-normal border-b-2 transition-colors whitespace-nowrap ${
                      activeTab === tab
                    ? 'border-[#AF2638] text-[#AF2638] bg-red-50'
                    : 'border-transparent text-black hover:text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
            </div>
          </div>

          {/* Tab Content */}
        <div className="px-5 md:px-48 py-6 md:py-16">
            {renderTabContent()}
        </div>

     

      
      </div>

      {/* Contact Modal */}
      {showContactModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 md:p-8 max-w-sm md:max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4 md:mb-6">
              <h3 className="text-lg md:text-xl font-semibold">Contact {technician.name}</h3>
              <button 
                onClick={() => setShowContactModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <p className="text-base md:text-lg font-semibold text-blue-600">{technician.phone}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <p className="text-sm text-gray-600">{technician.address}</p>
              </div>
              <div className="flex gap-3 pt-4">
                {/* <button className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-green-700 transition-colors">
                  Call Now
                </button> */}
                <button className="flex-1 border border-gray-300 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-50 transition-colors">
                  Send Message
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TechnicianReview;
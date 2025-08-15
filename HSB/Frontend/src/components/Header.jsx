import React, { useState } from "react";
import { showSuccess } from '../utils/alert';

const Header = ({ isMenuOpen, toggleMenu, userLocation, setUserLocation }) => {
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  
  // Check user authentication status
  const userType = localStorage.getItem('userType');
  const userName = localStorage.getItem('userName') || localStorage.getItem('businessName');
  const isLoggedIn = userType && userName;

  const locations = [
    'Delhi, India',
    'Mumbai, India',
    'Bangalore, India',
    'Chennai, India',
    'Kolkata, India',
    'Hyderabad, India',
    'Pune, India',
    'Ahmedabad, India'
  ];

  const handleLocationChange = (newLocation) => {
    setUserLocation(newLocation);
    setShowLocationDropdown(false);
  };

  const handleLogout = () => {
    // Clear all user session data
    localStorage.removeItem('userType');
    localStorage.removeItem('userName');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userPhone');
    localStorage.removeItem('userId');
    localStorage.removeItem('businessName');
    localStorage.removeItem('businessId');
    localStorage.removeItem('businessEmail');
    
    // Show success message
    showSuccess('You have been successfully logged out.', 'Logged Out');
    
    // Close menu
    toggleMenu();
    
    // Reload page to update UI
    setTimeout(() => {
      window.location.reload();
    }, 1500);
  };

  return (
    <header className="bg-white border-none border-gray-200 py-2 px-2 sm:px-4 relative">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        {/* Mobile: Location with My HSB */}
        <div className="flex items-center sm:hidden">
          <div 
            className="flex items-center gap-1 text-gray-600 text-xs cursor-pointer hover:text-[#213A59] transition-colors"
            onClick={() => setShowLocationDropdown(!showLocationDropdown)}
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M9.99999 0C6.32405 0 3.33331 2.99074 3.33331 6.66668C3.33331 7.7702 3.60921 8.86434 4.1337 9.8348L9.63542 19.7852C9.70866 19.9178 9.84823 20 9.99999 20C10.1518 20 10.2913 19.9178 10.3646 19.7852L15.8683 9.83152C16.3908 8.86434 16.6667 7.77016 16.6667 6.66664C16.6667 2.99074 13.6759 0 9.99999 0ZM9.99999 10C8.16202 10 6.66667 8.50465 6.66667 6.66668C6.66667 4.82871 8.16202 3.33336 9.99999 3.33336C11.838 3.33336 13.3333 4.82871 13.3333 6.66668C13.3333 8.50465 11.838 10 9.99999 10Z"
                fill="currentColor"
              />
            </svg>
            <span className="font-roboto font-normal text-xs">My HSB</span>
          </div>
        </div>

        {/* Desktop: Logo */}
        <div className="hidden sm:flex items-center flex-1 min-w-0">
          <div className="flex items-center justify-center cursor-pointer">
            <div className="w-8 h-10 sm:w-10 sm:h-12 mt-1 flex-shrink-0">
              <img src="/LogoIcon1.png" alt="Logo" />
            </div>
            <span className="text-[#213A59] font-roboto font-bold text-lg sm:text-[30px] leading-none align-middle ml-2 truncate">
              Home Service Bureau
            </span>
          </div>
        </div>

        {/* Mobile: Center Logo */}
        <div className="flex sm:hidden items-center justify-center flex-1">
          <div className="w-8 h-10 flex-shrink-0">
            <img src="/LogoIcon1.png" alt="Logo" />
          </div>
        </div>
        
        <div className="flex items-center space-x-2 sm:space-x-6 flex-shrink-0">
          {/* Desktop Location selector */}
          <div className="relative hidden sm:block">
            <div 
              className="flex gap-1 items-center text-gray-600 text-xs sm:text-sm cursor-pointer hover:text-[#213A59] transition-colors"
              onClick={() => setShowLocationDropdown(!showLocationDropdown)}
            >
              <svg
                width="16"
                height="16"
                className="sm:w-5 sm:h-5 flex-shrink-0"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M9.99999 0C6.32405 0 3.33331 2.99074 3.33331 6.66668C3.33331 7.7702 3.60921 8.86434 4.1337 9.8348L9.63542 19.7852C9.70866 19.9178 9.84823 20 9.99999 20C10.1518 20 10.2913 19.9178 10.3646 19.7852L15.8683 9.83152C16.3908 8.86434 16.6667 7.77016 16.6667 6.66664C16.6667 2.99074 13.6759 0 9.99999 0ZM9.99999 10C8.16202 10 6.66667 8.50465 6.66667 6.66668C6.66667 4.82871 8.16202 3.33336 9.99999 3.33336C11.838 3.33336 13.3333 4.82871 13.3333 6.66668C13.3333 8.50465 11.838 10 9.99999 10Z"
                  fill="currentColor"
                />
              </svg>

              <p className="font-roboto font-normal text-sm sm:text-[20px] leading-none align-middle">
                {userLocation}
              </p>
              
              <svg 
                className={`w-3 h-3 sm:w-4 sm:h-4 transition-transform flex-shrink-0 ${showLocationDropdown ? 'rotate-180' : ''}`} 
                fill="currentColor" 
                viewBox="0 0 20 20"
              >
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </div>

            {/* Location Dropdown */}
            {showLocationDropdown && (
              <div className="absolute top-full right-0 mt-2 w-44 sm:w-48 bg-white border border-gray-200 rounded-md shadow-lg z-50 max-h-60 overflow-y-auto">
                {locations.map((location) => (
                  <button
                    key={location}
                    onClick={() => handleLocationChange(location)}
                    className={`w-full px-3 sm:px-4 py-2 text-left text-xs sm:text-sm hover:bg-gray-100 transition-colors ${
                      userLocation === location ? 'bg-blue-50 text-[#213A59]' : 'text-gray-700'
                    }`}
                  >
                    {location}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Menu button */}
          <div className="relative">
            <div 
              className="flex gap-1 sm:gap-2 items-center text-gray-600 text-xs sm:text-sm cursor-pointer hover:text-black transition-colors"
              onClick={toggleMenu}
            >
              <p className="font-roboto font-normal text-sm sm:text-[20px] leading-none align-middle hidden sm:block">
                Menu
              </p>

              <svg
                className={`transition-transform duration-200 w-5 h-5 sm:w-8 sm:h-8 flex-shrink-0 ${isMenuOpen ? 'rotate-90' : ''}`}
                viewBox="0 0 30 30"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M28.75 16.2241H1.25C0.559998 16.2241 0 15.6641 0 14.9741C0 14.2841 0.559998 13.7241 1.25 13.7241H28.75C29.44 13.7241 30 14.2841 30 14.9741C30 15.6641 29.44 16.2241 28.75 16.2241Z"
                  fill="currentColor"
                />
                <path
                  d="M28.75 6.64062H1.25C0.559998 6.64062 0 6.08063 0 5.39062C0 4.70062 0.559998 4.14062 1.25 4.14062H28.75C29.44 4.14062 30 4.70062 30 5.39062C30 6.08063 29.44 6.64062 28.75 6.64062Z"
                  fill="currentColor"
                />
                <path
                  d="M28.75 25.8071H1.25C0.559998 25.8071 0 25.2471 0 24.5571C0 23.8671 0.559998 23.3071 1.25 23.3071H28.75C29.44 23.3071 30 23.8671 30 24.5571C30 25.2471 29.44 25.8071 28.75 25.8071Z"
                  fill="currentColor"
                />
              </svg>
            </div>

            {/* Menu Dropdown */}
            {isMenuOpen && (
              <div className="absolute top-full right-0 mt-2 w-56 sm:w-64 bg-white border border-gray-200 rounded-md shadow-lg z-50">
                <div className="p-3 sm:p-4">
                  <div className="space-y-2 sm:space-y-3">
                    <h3 className="font-semibold text-[#213A59] border-b pb-2 text-sm sm:text-base">Services</h3>
                    <a href="/" className="block py-2 px-3 text-gray-700 hover:bg-gray-100 rounded transition-colors text-sm">Find HVAC Experts</a>
                    <a href="/job" className="block py-2 px-3 text-gray-700 hover:bg-gray-100 rounded transition-colors text-sm">Post a Job</a>
                    <a href="/business" className="block py-2 px-3 text-gray-700 hover:bg-gray-100 rounded transition-colors text-sm">Register Business</a>
                    
                    <h3 className="font-semibold text-[#213A59] border-b pb-2 pt-3 text-sm sm:text-base">Account</h3>
                    {isLoggedIn ? (
                      <>
                        <div className="px-3 py-2 text-sm text-gray-500">
                          Welcome, {userName}
                        </div>
                        {userType === 'business' && (
                          <a href="/business-dashboard" className="block py-2 px-3 text-gray-700 hover:bg-gray-100 rounded transition-colors text-sm">Business Dashboard</a>
                        )}
                        {userType === 'customer' && (
                          <a href="/user-dashboard" className="block py-2 px-3 text-gray-700 hover:bg-gray-100 rounded transition-colors text-sm">My Dashboard</a>
                        )}
                        <button 
                          onClick={handleLogout}
                          className="w-full text-left py-2 px-3 text-red-600 hover:bg-red-50 rounded transition-colors text-sm flex items-center gap-2"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                          </svg>
                          Logout
                        </button>
                      </>
                    ) : (
                      <>
                        <a href="/user-dashboard" className="block py-2 px-3 text-blue-600 hover:bg-blue-50 rounded transition-colors text-sm">Login as User</a>
                        <a href="/business-dashboard" className="block py-2 px-3 text-green-600 hover:bg-green-50 rounded transition-colors text-sm">Login as Business</a>
                      </>
                    )}
                    {/* <a href="#" className="block py-2 px-3 text-gray-700 hover:bg-gray-100 rounded transition-colors text-sm">Support</a> */}
                    
                    {/* <h3 className="font-semibold text-[#213A59] border-b pb-2 pt-3 text-sm sm:text-base">Company</h3>
                    <a href="#" className="block py-2 px-3 text-gray-700 hover:bg-gray-100 rounded transition-colors text-sm">About Us</a>
                    <a href="#" className="block py-2 px-3 text-gray-700 hover:bg-gray-100 rounded transition-colors text-sm">Contact</a> */}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Location Dropdown */}
      {showLocationDropdown && (
        <div className="sm:hidden absolute top-full left-2 mt-2 w-44 bg-white border border-gray-200 rounded-md shadow-lg z-50 max-h-60 overflow-y-auto">
          {locations.map((location) => (
            <button
              key={location}
              onClick={() => handleLocationChange(location)}
              className={`w-full px-3 py-2 text-left text-xs hover:bg-gray-100 transition-colors ${
                userLocation === location ? 'bg-blue-50 text-[#213A59]' : 'text-gray-700'
              }`}
            >
              {location}
            </button>
          ))}
        </div>
      )}

      {/* Overlay to close dropdowns when clicking outside */}
      {(isMenuOpen || showLocationDropdown) && (
        <div 
          className="fixed inset-0 z-40"
          onClick={() => {
            toggleMenu();
            setShowLocationDropdown(false);
          }}
        />
      )}
    </header>
  );
};

export default Header;

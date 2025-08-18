import React, { useState } from "react";
import { showSuccess } from "../utils/alert";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext.jsx";

const Header = ({ isMenuOpen, toggleMenu }) => {
  const navigate = useNavigate();
  const { signOut, session, isAuthenticated } = useAuth();

  // Check user authentication status using new auth system
  const isLoggedIn = isAuthenticated();
  const userName = session?.user?.name;
  const userRole = session?.user?.role;

  const handleLogout = () => {
    // Use new auth system to sign out
    signOut();

    // Show success message
    showSuccess("You have been successfully logged out.", "Logged Out");

    // Close menu
    toggleMenu();

    // Navigate to home page
    setTimeout(() => {
      navigate("/");
    }, 1500);
  };

  return (
    <header className="bg-white border-none border-gray-200 py-2 px-2 sm:px-4 relative">
      <div className="max-w-7xl mx-auto flex justify-between items-center">

        {/* Desktop: Logo */}
        <div className="hidden sm:flex items-center flex-1 min-w-0">
          <Link
            to="/"
            className="flex items-center justify-center cursor-pointer"
          >
            <div className="w-8 h-10 sm:w-10 sm:h-12 mt-1 flex-shrink-0">
              <img src="/LogoIcon1.png" alt="Logo" draggable={false} />
            </div>
            <span className="text-[#213A59] text-display font-bold text-lg sm:text-[30px] leading-none align-middle ml-2 truncate">
              Home Service Bureau
            </span>
          </Link>
        </div>

        {/* Mobile: Center Logo */}
        <div className="flex sm:hidden items-center justify-center flex-1">
          <Link to="/" className="w-8 h-10 flex-shrink-0">
            <img src="/LogoIcon1.png" alt="Logo" draggable={false} />
          </Link>
        </div>

        <div className="flex items-center space-x-2 sm:space-x-6 flex-shrink-0">
          {/* Menu button */}
          <div className="relative">
            <div
              className="flex gap-1 sm:gap-2 items-center text-gray-600 text-xs sm:text-sm cursor-pointer hover:text-black transition-colors"
              onClick={toggleMenu}
            >
              <p className="text-ui font-medium text-sm sm:text-[20px] leading-none align-middle hidden sm:block mb-0">
                Menu
              </p>

              <svg
                className={`transition-transform duration-200 w-5 h-5 sm:w-8 sm:h-8 flex-shrink-0 ${
                  isMenuOpen ? "rotate-90" : ""
                }`}
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
                    <h3 className="font-display font-semibold text-[#213A59] border-b pb-2 text-sm sm:text-base">
                      Services
                    </h3>
                    <Link
                      to="/"
                      className="block py-2 px-3 text-gray-700 hover:bg-gray-100 rounded transition-colors text-sm"
                    >
                      Find Local Experts
                    </Link>
                    <Link
                      to="/job-posting"
                      className="block py-2 px-3 text-gray-700 hover:bg-gray-100 rounded transition-colors text-sm"
                    >
                      Post a Job
                    </Link>
                    <Link
                      to="/business-registration"
                      className="block py-2 px-3 text-gray-700 hover:bg-gray-100 rounded transition-colors text-sm"
                    >
                      Register Business
                    </Link>

                    <h3 className="font-display font-semibold text-[#213A59] border-b pb-2 pt-3 text-sm sm:text-base">
                      Account
                    </h3>
                    {isLoggedIn ? (
                      <>
                        <div className="px-3 py-2 text-sm text-gray-500">
                          Welcome, {userName}
                        </div>
                        {userRole === "Business" && (
                          <Link
                            to="/business-dashboard"
                            className="block py-2 px-3 text-gray-700 hover:bg-gray-100 rounded transition-colors text-sm"
                          >
                            Business Dashboard
                          </Link>
                        )}
                        {userRole === "Customer" && (
                          <Link
                            to="/user-dashboard"
                            className="block py-2 px-3 text-gray-700 hover:bg-gray-100 rounded transition-colors text-sm"
                          >
                            My Dashboard
                          </Link>
                        )}
                        <button
                          onClick={handleLogout}
                          className="w-full text-left py-2 px-3 text-red-600 hover:bg-red-50 rounded transition-colors text-sm flex items-center gap-2"
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
                              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                            />
                          </svg>
                          Logout
                        </button>
                      </>
                    ) : (
                      <>
                        <Link
                          to="/login"
                          className="block py-2 px-3 text-blue-600 hover:bg-blue-50 rounded transition-colors text-sm"
                        >
                          Login
                        </Link>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Overlay to close dropdowns when clicking outside */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-40" onClick={toggleMenu} />
      )}
    </header>
  );
};

export default Header;

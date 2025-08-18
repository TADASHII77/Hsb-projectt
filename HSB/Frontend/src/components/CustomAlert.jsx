import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

const CustomAlert = ({ isOpen, onClose, type = 'info', title, message, duration = 5000 }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      setIsClosing(false);
      
      // Auto close after duration
      const timer = setTimeout(() => {
        handleClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [isOpen, duration]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsVisible(false);
      onClose();
    }, 300);
  };

  const getAlertStyles = () => {
    const baseStyles = "relative overflow-hidden";
    
    switch (type) {
      case 'success':
        return `${baseStyles} bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-green-500`;
      case 'error':
        return `${baseStyles} bg-gradient-to-r from-red-50 to-rose-50 border-l-4 border-red-500`;
      case 'warning':
        return `${baseStyles} bg-gradient-to-r from-yellow-50 to-orange-50 border-l-4 border-yellow-500`;
      default:
        return `${baseStyles} bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500`;
    }
  };

  const getIconStyles = () => {
    switch (type) {
      case 'success':
        return 'text-green-600 bg-green-100';
      case 'error':
        return 'text-red-600 bg-red-100';
      case 'warning':
        return 'text-yellow-600 bg-yellow-100';
      default:
        return 'text-blue-600 bg-blue-100';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
        );
      case 'error':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        );
      case 'warning':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  if (!isVisible) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4">
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-black transition-opacity duration-300 ${
          isClosing ? 'bg-black/0' : 'bg-black/20'
        }`}
        onClick={handleClose}
      />
      
      {/* Alert */}
      <div className={`
        relative w-full max-w-md mx-auto transform transition-all duration-300 ease-out
        ${isClosing 
          ? 'scale-95 opacity-0 translate-y-2' 
          : 'scale-100 opacity-100 translate-y-0'
        }
      `}>
        <div className={`
          ${getAlertStyles()}
          rounded-2xl shadow-2xl border border-gray-200
          backdrop-blur-sm
        `}>
          {/* Progress bar */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gray-200 rounded-t-2xl overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-[#213A59] to-[#AF2638] transition-all ease-linear"
              style={{ 
                width: isClosing ? '0%' : '100%',
                transitionDuration: isClosing ? '300ms' : `${duration}ms`
              }} 
            />
          </div>
          
          <div className="p-6">
            <div className="flex items-start">
              {/* Icon */}
              <div className={`
                flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center
                ${getIconStyles()}
                shadow-lg
              `}>
                {getIcon()}
              </div>
              
              {/* Content */}
              <div className="ml-4 flex-1">
                {title && (
                  <h3 className="text-lg font-bold text-gray-900 mb-1">
                    {title}
                  </h3>
                )}
                <p className="text-gray-700 leading-relaxed">
                  {message}
                </p>
              </div>
              
              {/* Close button */}
              <button
                onClick={handleClose}
                className="flex-shrink-0 ml-4 p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-200 transition-colors duration-200"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
          
          {/* HSB Brand accent */}
          <div className="absolute bottom-0 right-0 w-16 h-16 opacity-10">
            <div className="w-full h-full bg-gradient-to-tl from-[#AF2638] to-[#213A59] rounded-tl-full" />
          </div>
        </div>
      </div>
      

    </div>,
    document.body
  );
};

export default CustomAlert;

import React from "react";

const Loader = ({ 
  size = "md", 
  variant = "spinner", 
  color = "primary", 
  text = "", 
  className = "" 
}) => {
  const sizeClasses = {
    xs: "w-3 h-3",
    sm: "w-4 h-4", 
    md: "w-6 h-6",
    lg: "w-8 h-8",
    xl: "w-12 h-12"
  };

  const colorClasses = {
    primary: "border-[#AF2638]",
    secondary: "border-gray-400",
    white: "border-white",
    blue: "border-blue-500",
    green: "border-green-500"
  };

  const spinnerClasses = `animate-spin rounded-full border-2 border-t-transparent ${sizeClasses[size]} ${colorClasses[color]}`;

  const dotsClasses = "flex space-x-1";
  const dotClasses = `w-2 h-2 bg-current rounded-full animate-pulse ${colorClasses[color].replace('border-', 'bg-')}`;

  const pulseClasses = `animate-pulse rounded-full ${sizeClasses[size]} ${colorClasses[color].replace('border-', 'bg-')}`;

  const renderLoader = () => {
    switch (variant) {
      case "dots":
        return (
          <div className={dotsClasses}>
            <div className={`${dotClasses} animation-delay-0`}></div>
            <div className={`${dotClasses} animation-delay-150`}></div>
            <div className={`${dotClasses} animation-delay-300`}></div>
          </div>
        );
      case "pulse":
        return <div className={pulseClasses}></div>;
      case "spinner":
      default:
        return <div className={spinnerClasses}></div>;
    }
  };

  return (
    <div className={`flex items-center justify-center gap-2 ${className}`}>
      {renderLoader()}
      {text && (
        <span className={`text-sm font-medium ${
          color === 'white' ? 'text-white' : 
          color === 'primary' ? 'text-[#AF2638]' : 
          'text-gray-600'
        }`}>
          {text}
        </span>
      )}
    </div>
  );
};

// Inline loader for small spaces
export const InlineLoader = ({ size = "sm", color = "primary", className = "" }) => (
  <Loader size={size} color={color} className={className} />
);

// Full page loader
export const FullPageLoader = ({ text = "Loading...", className = "" }) => (
  <div className={`fixed inset-0 bg-white bg-opacity-75 flex items-center justify-center z-50 ${className}`}>
    <div className="bg-white rounded-lg shadow-lg p-6 flex flex-col items-center gap-4">
      <Loader size="lg" color="primary" />
      <span className="text-gray-600 font-medium">{text}</span>
    </div>
  </div>
);

// Overlay loader for components
export const OverlayLoader = ({ text = "Loading...", className = "" }) => (
  <div className={`absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center rounded-lg ${className}`}>
    <div className="flex flex-col items-center gap-2">
      <Loader size="md" color="primary" />
      <span className="text-sm text-gray-600 font-medium">{text}</span>
    </div>
  </div>
);

// Button loader
export const ButtonLoader = ({ text = "Loading...", className = "" }) => (
  <div className={`flex items-center gap-2 ${className}`}>
    <Loader size="sm" color="white" />
    <span className="text-sm font-medium">{text}</span>
  </div>
);

// Table loader
export const TableLoader = ({ rows = 5, className = "" }) => (
  <div className={`space-y-2 ${className}`}>
    {Array.from({ length: rows }).map((_, index) => (
      <div key={index} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg animate-pulse">
        <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
        </div>
        <div className="w-20 h-8 bg-gray-200 rounded"></div>
      </div>
    ))}
  </div>
);

// Card loader
export const CardLoader = ({ className = "" }) => (
  <div className={`bg-white rounded-lg shadow-sm p-6 animate-pulse ${className}`}>
    <div className="flex items-center gap-4 mb-4">
      <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
      <div className="flex-1 space-y-2">
        <div className="h-5 bg-gray-200 rounded w-3/4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      </div>
    </div>
    <div className="space-y-2">
      <div className="h-4 bg-gray-200 rounded"></div>
      <div className="h-4 bg-gray-200 rounded w-5/6"></div>
      <div className="h-4 bg-gray-200 rounded w-4/6"></div>
    </div>
  </div>
);

// Skeleton loader for content
export const SkeletonLoader = ({ lines = 3, className = "" }) => (
  <div className={`space-y-2 ${className}`}>
    {Array.from({ length: lines }).map((_, index) => (
      <div 
        key={index} 
        className={`h-4 bg-gray-200 rounded animate-pulse ${
          index === lines - 1 ? 'w-3/4' : 'w-full'
        }`}
      ></div>
    ))}
  </div>
);

export default Loader;

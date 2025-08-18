import React from "react";

const TypographyGuide = () => {
  return (
    <div className="max-w-4xl mx-auto p-8 space-y-12">
      <div className="text-center mb-12">
        <h1 className="text-heading-xl text-gray-900 mb-4">
          Typography System
        </h1>
        <p className="text-body-lg text-gray-600 max-w-2xl mx-auto">
          A comprehensive typography system designed for optimal readability, 
          accessibility, and visual hierarchy across all devices.
        </p>
      </div>

      {/* Font Families */}
      <section className="space-y-6">
        <h2 className="text-heading-lg text-gray-900">Font Families</h2>
        
        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h3 className="text-heading-md text-gray-900">Display Fonts</h3>
            <div className="space-y-2">
              <p className="text-display text-2xl">Outfit - Display & Headings</p>
              <p className="text-display text-lg text-gray-600">
                Modern, geometric sans-serif perfect for headlines and branding
              </p>
            </div>
          </div>
          
          <div className="space-y-4">
            <h3 className="text-heading-md text-gray-900">Body Fonts</h3>
            <div className="space-y-2">
              <p className="text-body-lg">Plus Jakarta Sans - Body Text</p>
              <p className="text-body-md text-gray-600">
                Highly legible sans-serif optimized for reading on screens
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Heading Hierarchy */}
      <section className="space-y-6">
        <h2 className="text-heading-lg text-gray-900">Heading Hierarchy</h2>
        
        <div className="space-y-4">
          <h1 className="text-heading-xl text-gray-900">
            Heading 1 - Extra Large
          </h1>
          <h2 className="text-heading-lg text-gray-900">
            Heading 2 - Large
          </h2>
          <h3 className="text-heading-md text-gray-900">
            Heading 3 - Medium
          </h3>
          <h4 className="text-heading-sm text-gray-900">
            Heading 4 - Small
          </h4>
          <h5 className="text-lg font-semibold text-gray-900">
            Heading 5 - Base
          </h5>
          <h6 className="text-base font-semibold text-gray-900">
            Heading 6 - Small
          </h6>
        </div>
      </section>

      {/* Body Text */}
      <section className="space-y-6">
        <h2 className="text-heading-lg text-gray-900">Body Text</h2>
        
        <div className="space-y-4">
          <div>
            <h3 className="text-heading-sm text-gray-900 mb-2">Large Body Text</h3>
            <p className="text-body-lg">
              This is large body text with improved line height and spacing. 
              Perfect for important content and introductory paragraphs that 
              need to stand out while maintaining excellent readability.
            </p>
          </div>
          
          <div>
            <h3 className="text-heading-sm text-gray-900 mb-2">Medium Body Text</h3>
            <p className="text-body-md">
              This is the standard body text size used throughout the application. 
              It provides optimal readability with a line height of 1.7 and 
              comfortable letter spacing for extended reading sessions.
            </p>
          </div>
          
          <div>
            <h3 className="text-heading-sm text-gray-900 mb-2">Small Body Text</h3>
            <p className="text-body-sm">
              Smaller text for captions, metadata, and secondary information. 
              Still maintains good readability with appropriate line height.
            </p>
          </div>
        </div>
      </section>

      {/* UI Elements */}
      <section className="space-y-6">
        <h2 className="text-heading-lg text-gray-900">UI Elements</h2>
        
        <div className="space-y-6">
          <div>
            <h3 className="text-heading-sm text-gray-900 mb-4">Buttons</h3>
            <div className="flex flex-wrap gap-4">
              <button className="btn-primary bg-blue-600 text-white hover:bg-blue-700">
                Primary Button
              </button>
              <button className="btn-secondary border border-gray-300 text-gray-700 hover:bg-gray-50">
                Secondary Button
              </button>
            </div>
          </div>
          
          <div>
            <h3 className="text-heading-sm text-gray-900 mb-4">Form Elements</h3>
            <div className="space-y-4 max-w-md">
              <input 
                type="text" 
                placeholder="Input field with improved typography"
                className="input-field w-full"
              />
              <textarea 
                placeholder="Textarea with enhanced readability"
                className="input-field w-full h-24 resize-none"
              />
            </div>
          </div>
          
          <div>
            <h3 className="text-heading-sm text-gray-900 mb-4">Navigation</h3>
            <nav className="flex gap-6">
              <a href="#" className="nav-link text-blue-600 hover:text-blue-800">
                Home
              </a>
              <a href="#" className="nav-link text-gray-600 hover:text-gray-900">
                About
              </a>
              <a href="#" className="nav-link text-gray-600 hover:text-gray-900">
                Services
              </a>
            </nav>
          </div>
        </div>
      </section>

      {/* Text Utilities */}
      <section className="space-y-6">
        <h2 className="text-heading-lg text-gray-900">Text Utilities</h2>
        
        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h3 className="text-heading-sm text-gray-900">Emphasis & Muted</h3>
            <p className="text-body-md">
              <span className="text-emphasis">This text has emphasis</span> while 
              <span className="text-muted"> this text is muted</span> for 
              better visual hierarchy.
            </p>
          </div>
          
          <div className="space-y-4">
            <h3 className="text-heading-sm text-gray-900">Responsive Text</h3>
            <p className="text-responsive-sm">
              Small responsive text that scales with screen size
            </p>
            <p className="text-responsive-md">
              Medium responsive text for better mobile experience
            </p>
          </div>
        </div>
      </section>

      {/* Cards */}
      <section className="space-y-6">
        <h2 className="text-heading-lg text-gray-900">Card Components</h2>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <h3 className="card-title">Card Title</h3>
            <p className="card-subtitle">Card subtitle with improved typography</p>
            <p className="text-readable">
              Card content with enhanced readability and proper spacing. 
              This demonstrates how the typography system works in card components.
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <h3 className="card-title">Another Card</h3>
            <p className="card-subtitle">Showcasing consistent typography</p>
            <p className="text-readable">
              Consistent typography across all components ensures a cohesive 
              user experience and professional appearance.
            </p>
          </div>
        </div>
      </section>

      {/* Footer Example */}
      <section className="space-y-6">
        <h2 className="text-heading-lg text-gray-900">Footer Typography</h2>
        
        <footer className="bg-gray-900 text-white p-8 rounded-lg">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <h3 className="footer-heading">Company</h3>
              <p className="footer-text">
                Footer text with improved readability and proper contrast 
                for accessibility.
              </p>
            </div>
            <div>
              <h3 className="footer-heading">Services</h3>
              <p className="footer-text">
                Consistent typography in footer sections maintains 
                visual hierarchy and brand consistency.
              </p>
            </div>
            <div>
              <h3 className="footer-heading">Contact</h3>
              <p className="footer-text">
                All text elements follow the established typography 
                system for optimal user experience.
              </p>
            </div>
          </div>
        </footer>
      </section>
    </div>
  );
};

export default TypographyGuide;

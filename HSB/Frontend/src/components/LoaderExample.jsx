import React, { useState } from 'react';
import Loader, { 
  InlineLoader, 
  FullPageLoader, 
  OverlayLoader, 
  ButtonLoader, 
  TableLoader, 
  CardLoader, 
  SkeletonLoader 
} from './Loader';

const LoaderExample = () => {
  const [showFullPageLoader, setShowFullPageLoader] = useState(false);
  const [showOverlayLoader, setShowOverlayLoader] = useState(false);

  return (
    <div className="max-w-4xl mx-auto p-8 space-y-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Loader Component Examples</h1>

      {/* Basic Loader Variants */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-800">Basic Loader Variants</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="text-lg font-medium mb-4">Spinner (Default)</h3>
            <div className="space-y-4">
              <Loader size="xs" />
              <Loader size="sm" />
              <Loader size="md" />
              <Loader size="lg" />
              <Loader size="xl" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="text-lg font-medium mb-4">Dots</h3>
            <div className="space-y-4">
              <Loader variant="dots" size="sm" />
              <Loader variant="dots" size="md" />
              <Loader variant="dots" size="lg" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="text-lg font-medium mb-4">Pulse</h3>
            <div className="space-y-4">
              <Loader variant="pulse" size="sm" />
              <Loader variant="pulse" size="md" />
              <Loader variant="pulse" size="lg" />
            </div>
          </div>
        </div>
      </section>

      {/* Color Variants */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-800">Color Variants</h2>
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center">
              <Loader color="primary" />
              <p className="text-sm text-gray-600 mt-2">Primary</p>
            </div>
            <div className="text-center">
              <Loader color="secondary" />
              <p className="text-sm text-gray-600 mt-2">Secondary</p>
            </div>
            <div className="text-center">
              <Loader color="white" />
              <p className="text-sm text-gray-600 mt-2">White</p>
            </div>
            <div className="text-center">
              <Loader color="blue" />
              <p className="text-sm text-gray-600 mt-2">Blue</p>
            </div>
            <div className="text-center">
              <Loader color="green" />
              <p className="text-sm text-gray-600 mt-2">Green</p>
            </div>
          </div>
        </div>
      </section>

      {/* Inline Loader */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-800">Inline Loader</h2>
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <span>Loading data...</span>
              <InlineLoader size="sm" color="primary" />
            </div>
            <div className="flex items-center gap-4">
              <span>Processing...</span>
              <InlineLoader size="md" color="blue" />
            </div>
            <div className="flex items-center gap-4">
              <span>Saving changes...</span>
              <InlineLoader size="sm" color="green" />
            </div>
          </div>
        </div>
      </section>

      {/* Button Loader */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-800">Button Loader</h2>
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex flex-wrap gap-4">
            <button className="bg-blue-600 text-white px-4 py-2 rounded-md flex items-center gap-2">
              <ButtonLoader text="Loading..." />
            </button>
            <button className="bg-green-600 text-white px-4 py-2 rounded-md flex items-center gap-2">
              <ButtonLoader text="Saving..." />
            </button>
            <button className="bg-red-600 text-white px-4 py-2 rounded-md flex items-center gap-2">
              <ButtonLoader text="Processing..." />
            </button>
          </div>
        </div>
      </section>

      {/* Skeleton Loader */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-800">Skeleton Loader</h2>
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium mb-2">3 Lines</h4>
              <SkeletonLoader lines={3} />
            </div>
            <div>
              <h4 className="text-sm font-medium mb-2">5 Lines</h4>
              <SkeletonLoader lines={5} />
            </div>
          </div>
        </div>
      </section>

      {/* Card Loader */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-800">Card Loader</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <CardLoader />
          <CardLoader />
        </div>
      </section>

      {/* Table Loader */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-800">Table Loader</h2>
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <TableLoader rows={3} />
        </div>
      </section>

      {/* Interactive Examples */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-800">Interactive Examples</h2>
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex flex-wrap gap-4">
            <button
              onClick={() => setShowFullPageLoader(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              Show Full Page Loader
            </button>
            <button
              onClick={() => setShowOverlayLoader(true)}
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
            >
              Show Overlay Loader
            </button>
          </div>
        </div>
      </section>

      {/* Overlay Loader Example */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-800">Overlay Loader Example</h2>
        <div className="relative bg-gray-100 p-8 rounded-lg border border-gray-200 min-h-[200px]">
          <p className="text-gray-600 mb-4">This is a content area that can be overlaid with a loader.</p>
          <button
            onClick={() => setShowOverlayLoader(true)}
            className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700"
          >
            Show Overlay
          </button>
          {showOverlayLoader && (
            <OverlayLoader 
              text="Loading content..." 
              className="rounded-lg"
            />
          )}
        </div>
      </section>

      {/* Full Page Loader */}
      {showFullPageLoader && (
        <FullPageLoader text="Loading application..." />
      )}

      {/* Close buttons for full page loader */}
      {showFullPageLoader && (
        <div className="fixed top-4 right-4 z-50">
          <button
            onClick={() => setShowFullPageLoader(false)}
            className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
          >
            Close Full Page Loader
          </button>
        </div>
      )}

      {/* Close button for overlay loader */}
      {showOverlayLoader && (
        <div className="fixed top-4 right-4 z-50">
          <button
            onClick={() => setShowOverlayLoader(false)}
            className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
          >
            Close Overlay Loader
          </button>
        </div>
      )}
    </div>
  );
};

export default LoaderExample;

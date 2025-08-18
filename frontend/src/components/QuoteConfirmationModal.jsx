import React from "react";

const QuoteConfirmationModal = ({
  showConfirmModal,
  quoteType = "single",
  selectedBusiness,
  isSubmitting,
  onClose,
  onSubmit,
  getBusinessId,
  // Additional props for BusinessReview use case
  business,
  searchedJob,
}) => {
  if (!showConfirmModal) return null;

  // Determine which business data to use
  const businessData = business || selectedBusiness;
  const businessName = businessData?.name;
  const businessLogo = businessData?.logo || businessData?.image || "/Agesolutions.png";
  const businessCategory = searchedJob || businessData?.category || "Business";
  const businessRating = businessData?.rating;
  const businessReviews = businessData?.reviews;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full mx-4 transform transition-all duration-300 ease-out">
        {/* Header with gradient background */}
        <div className="bg-gradient-to-r from-[#213A59] to-[#AF2638] rounded-t-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
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
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">
                  {quoteType === "bulk"
                    ? "Request Multiple Quotes"
                    : "Request Free Quote"}
                </h3>
                <p className="text-sm text-white/80">
                  Get professional estimates from verified businesses
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
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
          <div className="mb-6">
            {quoteType === "bulk" ? (
              <div>
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
                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">
                    Request Quotes from Top 3 Businesses
                  </h4>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    Get competitive quotes from the best businesses in your area
                  </p>
                </div>
                
                <div className="space-y-3 mb-6">
                  {Array.isArray(selectedBusiness) &&
                    selectedBusiness.slice(0, 3).map((business, index) => (
                      <div
                        key={getBusinessId(business)}
                        className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100"
                      >
                        <div className="w-10 h-10 bg-gradient-to-br from-[#213A59] to-[#AF2638] text-white rounded-full flex items-center justify-center text-sm font-bold">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-semibold text-gray-900">
                              {business.name}
                            </p>
                            {business.verified && (
                              <div className="flex items-center gap-1 bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                                <svg
                                  className="w-3 h-3"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                                Verified
                              </div>
                            )}
                          </div>
                          <p className="text-sm text-gray-500">
                            {business.category || "Professional Service"}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-1">
                            <span className="text-sm font-semibold text-gray-900">
                              {business.rating}
                            </span>
                            <span className="text-yellow-400">★</span>
                          </div>
                          <p className="text-xs text-gray-500">
                            {business.reviews} reviews
                          </p>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            ) : (
              <div>
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
                    Request Free Quote
                  </h4>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    Get a personalized quote from{" "}
                    <span className="font-semibold text-[#AF2638]">
                      {businessName}
                    </span>
                  </p>
                </div>

                <div className="bg-gray-50 rounded-xl p-4 mb-6 border border-gray-100">
                  <div className="flex items-center gap-4">
                    <img
                      src={businessLogo}
                      alt={businessName}
                      className="w-16 h-16 rounded-xl object-cover border-2 border-white shadow-sm"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h5 className="font-semibold text-gray-900 text-lg">
                          {businessName}
                        </h5>
                        {businessData?.verified && (
                          <div className="flex items-center gap-1 bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                            <svg
                              className="w-3 h-3"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                clipRule="evenodd"
                              />
                            </svg>
                            Verified
                          </div>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 mb-2">
                        {businessCategory}
                      </p>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          <span className="text-sm font-semibold text-gray-900">
                            {businessRating}
                          </span>
                          <span className="text-yellow-400">★</span>
                        </div>
                        <span className="text-xs text-gray-500">
                          ({businessReviews} reviews)
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Benefits Section */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center flex-shrink-0">
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
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold text-blue-900 mb-1">
                    What happens next?
                  </p>
                  <p className="text-xs text-blue-800 leading-relaxed">
                    {quoteType === "bulk"
                      ? "All selected businesses will receive your request and contact you directly with their competitive quotes within 24-48 hours."
                      : "The business will receive your request and contact you directly with a personalized quote within 24-48 hours."}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 disabled:opacity-50 transition-all duration-200"
            >
              Cancel
            </button>
            <button
              onClick={onSubmit}
              disabled={isSubmitting}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-[#213A59] to-[#AF2638] text-white font-semibold rounded-xl hover:from-[#1a2d47] hover:to-[#8f1e2f] disabled:opacity-50 transition-all duration-200 flex items-center justify-center gap-2 shadow-lg"
            >
              {isSubmitting ? (
                <>
                  <svg
                    className="animate-spin w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Sending Request...
                </>
              ) : (
                <>
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
                      d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                    />
                  </svg>
                  {quoteType === "bulk"
                    ? "Send All Requests"
                    : "Send Request"}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuoteConfirmationModal;

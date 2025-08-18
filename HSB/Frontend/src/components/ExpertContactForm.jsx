import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { generateAndSendOtp, verifyOtp, clearOtp, getResendRemainingMs, formatSeconds } from '../services/otp';
import { showSuccess, showError, showWarning, showInfo } from '../utils/alert';
import apiService from '../services/api';

const ExpertContactForm = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1); // 1 = job details, 2 = contact info, 3 = OTP verification, 4 = password
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [resendRemainingMs, setResendRemainingMs] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showValidationErrors, setShowValidationErrors] = useState(false);
  
  // Job posting form data
  const [jobData, setJobData] = useState({
    service: '',
    postalCode: '',
    city: '',
    description: '',
    startTime: '',
    budget: '',
    images: null
  });
  
  // Contact form data
  const [contactData, setContactData] = useState({
    fullName: '',
    email: '',
    phone: '',
    verificationCode: '',
    password: ''
  });

  // Load saved job data from session storage on component mount
  useEffect(() => {
    const loadSavedData = () => {
      const savedData = sessionStorage.getItem('jobPostingData');
      if (savedData) {
        try {
          const parsed = JSON.parse(savedData);
          setJobData({
            ...parsed,
            images: null // Reset file input
          });
        } catch (error) {
          console.error('Error loading saved job posting data:', error);
        }
      }
    };
    loadSavedData();
  }, []);

  // Save job data to session storage whenever it changes
  const saveToSessionStorage = (data) => {
    try {
      const dataToSave = {
        ...data,
        images: null
      };
      sessionStorage.setItem('jobPostingData', JSON.stringify(dataToSave));
      console.log('Saved to session storage:', dataToSave);
    } catch (error) {
      console.error('Error saving job posting data to session storage:', error);
    }
  };

  // Effect to save data whenever jobData changes
  useEffect(() => {
    if (Object.keys(jobData).length > 0) {
      saveToSessionStorage(jobData);
    }
  }, [jobData]);

  // Also save contact data to session storage
  const saveContactToSessionStorage = (data) => {
    try {
      const dataToSave = {
        ...data,
        verificationCode: '', // Don't save OTP code
        password: '' // Don't save password
      };
      sessionStorage.setItem('contactFormData', JSON.stringify(dataToSave));
      console.log('Saved contact data to session storage:', dataToSave);
    } catch (error) {
      console.error('Error saving contact data to session storage:', error);
    }
  };

  // Effect to save contact data whenever it changes
  useEffect(() => {
    if (Object.keys(contactData).length > 0) {
      saveContactToSessionStorage(contactData);
    }
  }, [contactData]);

  // Load saved contact data from session storage
  useEffect(() => {
    const loadSavedContactData = () => {
      const savedData = sessionStorage.getItem('contactFormData');
      if (savedData) {
        try {
          const parsed = JSON.parse(savedData);
          setContactData(prev => ({
            ...prev,
            ...parsed,
            verificationCode: '', // Reset OTP code
            password: '' // Reset password
          }));
        } catch (error) {
          console.error('Error loading saved contact data:', error);
        }
      }
    };
    loadSavedContactData();
  }, []);

  // Clear session storage when component unmounts (optional - for cleanup)
  useEffect(() => {
    return () => {
      // Only clear if user navigates away without completing the form
      // This prevents clearing data when user is still in the form flow
    };
  }, []);

  const handleJobInputChange = (e) => {
    const { name, value, type, files } = e.target;
    
    setJobData(prev => ({
      ...prev,
      [name]: type === 'file' ? files[0] : value
    }));
  };



  const handleContactInputChange = (e) => {
    const { name, value } = e.target;
    setContactData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Phone number validation function
  const isValidPhoneNumber = (phone) => {
    if (!phone || typeof phone !== "string") {
      return false;
    }
    if (!phone.startsWith("+")) {
      return false;
    }
    const cleaned = phone.substring(1).replace(/\D/g, "");
    return cleaned.length >= 6;
  };

  // Email validation helper
  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Check if job form is valid
  const isJobFormValid = () => {
    return (
      jobData.service.trim() !== '' &&
      jobData.postalCode.trim() !== '' &&
      jobData.city.trim() !== '' &&
      jobData.description.trim() !== ''
    );
  };

  // Get job validation errors
  const getJobValidationErrors = () => {
    const errors = [];
    if (!jobData.service.trim()) errors.push('Service is required');
    if (!jobData.postalCode.trim()) errors.push('Postal code is required');
    if (!jobData.city.trim()) errors.push('City is required');
    if (!jobData.description.trim()) errors.push('Description is required');
    return errors;
  };

  const handleJobContinue = () => {
    setShowValidationErrors(true);
    const errors = getJobValidationErrors();
    if (errors.length > 0) {
      showWarning('Please fill in all required fields:\n' + errors.join('\n'), 'Missing Information');
      return;
    }
    setCurrentStep(2);
    window.scrollTo(0, 0);
  };

  const handleSendVerification = (e) => {
    e.preventDefault();
    
    // Validate contact fields
    if (!contactData.fullName.trim()) {
      showWarning('Please enter your full name.', 'Missing Information');
      return;
    }
    if (!contactData.email.trim()) {
      showWarning('Please enter your email address.', 'Missing Information');
      return;
    }
    if (!isValidEmail(contactData.email)) {
      showWarning('Please enter a valid email address.', 'Invalid Email');
      return;
    }
    if (!contactData.phone.trim()) {
              showWarning('Please enter your phone number.', 'Missing Information');
      return;
    }
    if (!isValidPhoneNumber(contactData.phone)) {
      showWarning('Please enter a valid phone number with country code (e.g., +1234567890).', 'Invalid Phone Number');
      return;
    }

    try {
      setIsSendingCode(true);
      const { code } = generateAndSendOtp(contactData.phone);
      console.log('[OTP] Sent code:', code);
              showSuccess('Verification code sent to your phone number!', 'Code Sent');
      setCurrentStep(3);
      setResendRemainingMs(getResendRemainingMs(contactData.phone));
    } catch (err) {
      showError('Failed to send verification code. Please try again.', 'Send Failed');
    } finally {
      setIsSendingCode(false);
    }
  };

  const handleVerifyOtp = () => {
    if (!contactData.phone || !contactData.verificationCode) {
              showWarning('Enter the verification code.', 'Missing Code');
      return;
    }
    setIsVerifying(true);
    const result = verifyOtp(contactData.phone, contactData.verificationCode);
    if (result.ok) {
      setOtpVerified(true);
      clearOtp(contactData.phone);
              showSuccess('Phone verified! Please set your password.', 'Verification Success');
      setCurrentStep(4);
      window.scrollTo(0, 0);
    } else {
      const reason = result.reason === 'EXPIRED' ? 'Code expired.' : result.reason === 'MISMATCH' ? 'Incorrect code.' : 'Invalid code.';
      showError(reason, 'Verification Failed');
    }
    setIsVerifying(false);
  };

  useEffect(() => {
    if (currentStep === 3) {
    const t = setInterval(() => {
        setResendRemainingMs(getResendRemainingMs(contactData.phone));
    }, 1000);
    return () => clearInterval(t);
    }
  }, [currentStep, contactData.phone]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!otpVerified) {
              showWarning('Please verify the OTP first.', 'Verification Required');
      return;
    }
    
    if (!contactData.password.trim()) {
      showWarning('Please enter a password.', 'Missing Password');
      return;
    }
    
    if (contactData.password.length < 6) {
      showWarning('Password must be at least 6 characters long.', 'Password Too Short');
        return;
      }

    setIsSubmitting(true);
    try {
      // 1) Register customer (or update) with hashed password in backend
      const regRes = await apiService.registerCustomer({
        name: contactData.fullName,
        email: contactData.email,
        phone: contactData.phone,
        password: contactData.password,
      });
      if (!regRes.success) {
                  showError(regRes.message || 'Error creating account', 'Registration Failed');
        return;
      }

      // Persist user session (basic)
      localStorage.setItem('userId', regRes.data.id);
      localStorage.setItem('userName', contactData.fullName);
      localStorage.setItem('userEmail', contactData.email);
      localStorage.setItem('userPhone', contactData.phone);
      localStorage.setItem('userType', regRes.data.userType || 'Customer');


      if (regRes.success) {
        // Cleanup session storage
        sessionStorage.removeItem('jobPostingData');
        sessionStorage.removeItem('contactFormData');
        
        // Redirect to listing page with search filters based on job requirements
        const searchParams = new URLSearchParams({
          job: jobData.service || '',
          city: jobData.city || ''
        });
        
        navigate(`/?${searchParams.toString()}`);
      } else {
        showError('Error posting job: ' + (regRes.message || 'Unknown error'), 'Job Posting Failed');
      }
    } catch (err) {
      console.error('Error completing job posting:', err);
      showError('Error submitting registration. Please try again.', 'Submission Error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Step 1 - Job Details
  if (currentStep === 1) {
    return (
      <div className="min-h-screen bg-white">
        <main className="max-w-7xl mx-auto px-4 sm:px-0 py-8 lg:py-[70px]">
          {/* Title */}
          <h1 className="text-2xl md:text-[40px] font-semibold text-black font-roboto mb-6 md:mb-[56px]">What is your job?</h1>
          
          {/* Subtitle */}
          <p className="text-base md:text-[18px] font-roboto text-black mb-4 md:mb-[22px]">Search for a service to find Bureau Verified Experts near you</p>

          {/* Form */}
          <div className="space-y-6 md:space-y-[56px]">
            {/* Service Input */}
            <div>
              <div className={`w-full md:w-[650px] h-[46px] bg-white border rounded-[10px] flex items-center px-[12px] ${
                showValidationErrors && jobData.service.trim() === '' ? 'border-red-500' : 'border-black'
              }`}>
                <input
                  type="text"
                  name="service"
                  value={jobData.service}
                  onChange={handleJobInputChange}
                  placeholder="E.g. Install Heat Pump"
                  className="w-full bg-transparent text-base md:text-[18px] font-light font-roboto text-black placeholder-black outline-none"
                  required
                />
              </div>
              {showValidationErrors && jobData.service.trim() === '' && (
                <p className="text-red-500 text-sm mt-1">Service is required</p>
              )}
            </div>

            {/* Location Section */}
            <div>
              <p className="text-base md:text-[18px] font-roboto text-black mb-4 md:mb-[22px]">What is the city and postal code where this service is needed?</p>
              
              <div className="flex flex-col md:flex-row gap-4 md:gap-[25px]">
                {/* Postal Code */}
                <div className="w-full md:w-[310px]">
                  <div className={`w-full h-[46px] bg-white border rounded-[10px] flex items-center px-[12px] ${
                    showValidationErrors && jobData.postalCode.trim() === '' ? 'border-red-500' : 'border-black'
                  }`}>
                    <input
                      type="text"
                      name="postalCode"
                      value={jobData.postalCode}
                      onChange={handleJobInputChange}
                      placeholder="E.g. M9X 2AB"
                      className="w-full bg-transparent text-base md:text-[18px] font-light font-roboto text-black placeholder-black outline-none"
                      required
                    />
                  </div>
                  {showValidationErrors && jobData.postalCode.trim() === '' && (
                    <p className="text-red-500 text-sm mt-1">Postal code is required</p>
                  )}
                </div>

                {/* City */}
                <div className="w-full md:w-[310px]">
                  <div className={`w-full h-[46px] bg-white border rounded-[10px] flex items-center px-[12px] ${
                    showValidationErrors && jobData.city.trim() === '' ? 'border-red-500' : 'border-black'
                  }`}>
                    <input
                      type="text"
                      name="city"
                      value={jobData.city}
                      onChange={handleJobInputChange}
                      placeholder="E.g. Delhi"
                      className="w-full bg-transparent text-base md:text-[18px] font-light font-roboto text-black placeholder-black outline-none"
                      required
                    />
                  </div>
                  {showValidationErrors && jobData.city.trim() === '' && (
                    <p className="text-red-500 text-sm mt-1">City is required</p>
                  )}
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <p className="text-base md:text-[18px] font-roboto text-black mb-4 md:mb-[22px]">Please describe what needs to done in detail.</p>
              
              <div className={`w-full md:w-[650px] h-[177px] bg-white border rounded-[10px] p-[11px] ${
                showValidationErrors && jobData.description.trim() === '' ? 'border-red-500' : 'border-black'
              }`}>
                <textarea
                  name="description"
                  value={jobData.description}
                  onChange={handleJobInputChange}
                  placeholder="E.g. I want to upgrade to a heat pump this summer to control my electricity bill. I have 4 bedroom, and house is 1,500 sq ft."
                  className="w-full h-full bg-transparent text-base md:text-[18px] font-light font-roboto text-black placeholder-black outline-none resize-none leading-6 md:leading-[27px]"
                  required
                />
              </div>
              {showValidationErrors && jobData.description.trim() === '' && (
                <p className="text-red-500 text-sm mt-1">Description is required</p>
              )}
            </div>

            {/* When to Start and Budget */}
            <div>
              <div className="flex flex-col md:flex-row gap-2 md:gap-[25px] mb-4 md:mb-[18px]">
                <p className="text-base md:text-[18px] font-roboto text-black w-full md:w-[310px]">When are you looking to start?</p>
                <p className="text-base md:text-[18px] font-roboto text-black w-full md:w-[310px]">What is your estimated budget?</p>
              </div>
              
              <div className="flex flex-col md:flex-row gap-4 md:gap-[25px]">
                {/* Start Time */}
                <div className="w-full md:w-[310px] h-[46px] bg-white border border-black rounded-[10px] flex items-center px-[12px]">
                  <select
                    name="startTime"
                    value={jobData.startTime}
                    onChange={handleJobInputChange}
                    className="w-full bg-transparent text-base md:text-[18px] font-light font-roboto text-black outline-none"
                    required
                  >
                    <option value="">Select One</option>
                    <option value="Immediately">Immediately</option>
                    <option value="Within a week">Within a week</option>
                    <option value="Within a month">Within a month</option>
                    <option value="Flexible">Flexible</option>
                  </select>
                </div>

                {/* Budget */}
                <div className="w-full md:w-[310px] h-[46px] bg-white border border-black rounded-[10px] flex items-center px-[12px]">
                  <select
                    name="budget"
                    value={jobData.budget}
                    onChange={handleJobInputChange}
                    className="w-full bg-transparent text-base md:text-[18px] font-light font-roboto text-black outline-none"
                    required
                  >
                    <option value="">Select One</option>
                    <option value="Under $500">Under $500</option>
                    <option value="$500 - $1,000">$500 - $1,000</option>
                    <option value="$1,000 - $2,500">$1,000 - $2,500</option>
                    <option value="$2,500 - $5,000">$2,500 - $5,000</option>
                    <option value="$5,000 - $10,000">$5,000 - $10,000</option>
                    <option value="$10,000+">$10,000+</option>
                    <option value="Not sure">Not sure</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Image Upload */}
            <div>
              <p className="text-base md:text-[18px] font-roboto text-black mb-4 md:mb-[22px]">Add some images that might be helpful. (Optional)</p>
              
              <div className="w-full md:w-[650px] h-[119px] bg-[#F3F3F3] rounded-[10px] flex items-center justify-center">
                <label htmlFor="images" className="cursor-pointer">
                  <input
                    type="file"
                    id="images"
                    name="images"
                    onChange={handleJobInputChange}
                    accept="image/*"
                    className="hidden"
                    multiple
                  />
                  <span className="text-lg md:text-[25px] font-extralight font-roboto text-black/50">Drop your files here</span>
                </label>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-6 md:pt-[35px] flex flex-col sm:flex-row gap-4">
              <button
                type="button"
                onClick={handleJobContinue}
                disabled={!isJobFormValid()}
                className={`w-full sm:w-[235px] h-[46px] rounded-[10px] flex items-center justify-center ${
                  !isJobFormValid()
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-[#AF2638] hover:bg-red-700'
                }`}
              >
                <span className="text-base md:text-[18px] font-semibold font-roboto text-white">
                  {!isJobFormValid() ? 'Fill Required Fields' : 'Continue'}
                </span>
              </button>
              

            </div>
          </div>
        </main>
      </div>
    );
  }

  // Step 2 - Contact Information
  if (currentStep === 2) {
  return (
    <div className="min-h-screen w-full max-w-[1500px] mx-auto bg-white">
      <div className="px-4 sm:px-8 md:px-16 lg:px-[199px] py-8 lg:py-[70px]">
        {/* Main Title */}
        <h1 className="text-2xl sm:text-3xl lg:text-[40px] font-semibold text-black font-roboto mb-8 lg:mb-[56px]">
          How should expert contact you?
        </h1>

          <form onSubmit={handleSendVerification} className="space-y-8 lg:space-y-[56px]">
          {/* Full Name */}
          <div>
              <p className="text-base lg:text-[18px] font-roboto text-black mb-4 lg:mb-[22px]">Your full name <span className="text-red-500">*</span></p>
            <div className="w-full max-w-[650px] h-[46px] bg-white border border-black rounded-[10px] flex items-center px-[12px]">
              <input
                type="text"
                name="fullName"
                  value={contactData.fullName}
                  onChange={handleContactInputChange}
                placeholder="E.g. John Doe"
                className="w-full bg-transparent text-base lg:text-[18px] font-light font-roboto text-black placeholder-black outline-none"
                required
              />
            </div>
          </div>

          {/* Email Address */}
          <div>
              <p className="text-base lg:text-[18px] font-roboto text-black mb-4 lg:mb-[22px]">Your preferred email address? <span className="text-red-500">*</span></p>
            <div className="w-full max-w-[650px] h-[46px] bg-white border border-black rounded-[10px] flex items-center px-[12px]">
              <input
                type="email"
                name="email"
                  value={contactData.email}
                  onChange={handleContactInputChange}
                placeholder="E.g. johndoe@gmail.com"
                className="w-full bg-transparent text-base lg:text-[18px] font-light font-roboto text-black placeholder-black outline-none"
                required
              />
            </div>
          </div>

          {/* Phone Number */}
          <div>
              <p className="text-base lg:text-[18px] font-roboto text-black mb-4 lg:mb-[22px]">Your preferred phone number? <span className="text-red-500">*</span></p>
            <div className="w-full max-w-[650px] h-[46px] bg-white border border-black rounded-[10px] flex items-center px-[12px]">
              <input
                type="tel"
                name="phone"
                  value={contactData.phone}
                  onChange={handleContactInputChange}
                placeholder="E.g. +1(234) 567-8910"
                className="w-full bg-transparent text-base lg:text-[18px] font-light font-roboto text-black placeholder-black outline-none"
                required
              />
            </div>
          </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="w-full sm:w-[200px] h-[46px] rounded-[10px] flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white"
              >
                <span className="text-base lg:text-[18px] font-semibold font-roboto">
                  Previous Page
                </span>
              </button>

              <button
                type="submit"
                disabled={isSendingCode}
                className={`w-full sm:w-[235px] h-[46px] rounded-[10px] flex items-center justify-center ${
                  isSendingCode ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#AF2638] hover:bg-red-700'
                }`}
              >
                <span className="text-base lg:text-[18px] font-semibold font-roboto text-white">
                  {isSendingCode ? 'Sending...' : 'Send Verification Code'}
                </span>
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // Step 3 - OTP Verification
  if (currentStep === 3) {
    return (
      <div className="min-h-screen w-full max-w-[1500px] mx-auto bg-white">
        <div className="px-4 sm:px-8 md:px-16 lg:px-[199px] py-8 lg:py-[70px]">
          {/* Main Title */}
          <h1 className="text-2xl sm:text-3xl lg:text-[40px] font-semibold text-black font-roboto mb-8 lg:mb-[56px]">
            Verify your phone number
          </h1>

          <div className="space-y-8 lg:space-y-[56px]">
            {/* Verification Code */}
              <div>
                <p className="text-base lg:text-[18px] font-roboto text-black mb-4 lg:mb-[22px]">
          Enter one-time verification code sent on your phone number.
                </p>
                <div className="w-full max-w-[650px] h-[46px] bg-white border border-black rounded-[10px] flex items-center px-[12px]">
                  <input
                    type="text"
                    name="verificationCode"
                  value={contactData.verificationCode}
                  onChange={handleContactInputChange}
                    placeholder="E.g. 889902"
                    className="w-full bg-transparent text-base lg:text-[18px] font-light font-roboto text-black placeholder-black outline-none"
                    required
                  />
                </div>
        <div className="mt-3 flex items-center gap-3">
          <button
            type="button"
            onClick={handleVerifyOtp}
            disabled={isVerifying}
                  className={`px-4 py-2 rounded-md text-white ${
                    isVerifying ? 'bg-gray-400' : 'bg-[#AF2638] hover:bg-red-700'
                  }`}
          >
            {isVerifying ? 'Verifying...' : 'Verify Code'}
          </button>
          <button
            type="button"
            onClick={handleSendVerification}
            disabled={isSendingCode || resendRemainingMs > 0}
                  className={`px-4 py-2 rounded-md border ${
                    resendRemainingMs > 0 ? 'text-gray-400 border-gray-300' : 'text-[#AF2638] border-[#AF2638]'
                  }`}
          >
            {resendRemainingMs > 0 ? `Resend in ${formatSeconds(resendRemainingMs)}s` : 'Resend Code'}
          </button>
        </div>
              </div>

            {/* Back Button */}
            <div>
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="w-full sm:w-[200px] h-[46px] rounded-[10px] flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white"
              >
                <span className="text-base lg:text-[18px] font-semibold font-roboto">
                  Previous Page
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Step 4 - Password Setting
  if (currentStep === 4) {
    return (
      <div className="min-h-screen w-full max-w-7xl mx-auto bg-white">
        <div className="px-4 sm:px-0 py-8 lg:py-[70px]">
          {/* Main Title */}
          <h1 className="text-2xl sm:text-3xl lg:text-[40px] font-semibold text-black font-roboto mb-8 lg:mb-[56px]">
            Set your password
          </h1>

          <form onSubmit={handleSubmit} className="space-y-8 lg:space-y-[56px]">
            {/* Password */}
              <div>
                <p className="text-base lg:text-[18px] font-roboto text-black mb-4 lg:mb-[22px]">
                Choose a new password for your HSB account. <span className="text-red-500">*</span>
                </p>
                <div className="w-full max-w-[650px] h-[46px] bg-white border border-black rounded-[10px] flex items-center px-[12px]">
                  <input
                    type="password"
                    name="password"
                  value={contactData.password}
                  onChange={handleContactInputChange}
                  placeholder="Enter your password (minimum 6 characters)"
                    className="w-full bg-transparent text-base lg:text-[18px] font-light font-roboto text-black placeholder-black outline-none"
                    required
                  />
                </div>
              </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                type="button"
                onClick={() => setCurrentStep(3)}
                className="w-full sm:w-[200px] h-[46px] rounded-[10px] flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white"
              >
                <span className="text-base lg:text-[18px] font-semibold font-roboto">
                  Previous Page
                </span>
              </button>

                  <button
                    type="submit"
                disabled={isSubmitting || !contactData.password.trim()}
                className={`w-full sm:w-[235px] h-[46px] rounded-[10px] flex items-center justify-center ${
                  isSubmitting || !contactData.password.trim()
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-[#AF2638] hover:bg-red-700'
                }`}
              >
                <span className="text-base lg:text-[18px] font-semibold font-roboto text-white">
                  {isSubmitting ? 'Submitting...' : 'Find Verified Experts'}
                </span>
                  </button>
                </div>

              {/* Terms and Privacy */}
              <div className="max-w-[808px]">
                <p className="text-base lg:text-[18px] font-roboto text-black leading-relaxed">
                  By clicking 'Find Verified Experts', you acknowledge and agree to our{' '}
                  <span className="underline cursor-pointer">Terms of Use</span> and{' '}
                  <span className="underline cursor-pointer">Privacy Policy</span>.
                </p>
              </div>
        </form>
      </div>
    </div>
  );
  }
};

export default ExpertContactForm; 
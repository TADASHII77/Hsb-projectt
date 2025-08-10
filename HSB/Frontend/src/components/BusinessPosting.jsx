import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiService from '../services/api';

// Beautiful Alert Component
const Alert = ({ type, title, message, onClose, isVisible }) => {
  if (!isVisible) return null;
  
  const alertStyles = {
    error: {
      container: 'bg-red-50 border-l-4 border-red-400',
      icon: 'text-red-400',
      title: 'text-red-800',
      message: 'text-red-700',
      iconPath: 'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z'
    },
    success: {
      container: 'bg-green-50 border-l-4 border-green-400',
      icon: 'text-green-400',
      title: 'text-green-800',
      message: 'text-green-700',
      iconPath: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
    },
    warning: {
      container: 'bg-yellow-50 border-l-4 border-yellow-400',
      icon: 'text-yellow-400',
      title: 'text-yellow-800',
      message: 'text-yellow-700',
      iconPath: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z'
    }
  };

  const style = alertStyles[type] || alertStyles.error;

  return (
    <div className={`fixed top-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-96 z-50 p-4 rounded-md shadow-lg ${style.container} transform transition-all duration-300 ease-in-out`}>
      <div className="flex">
        <div className="flex-shrink-0">
          <svg className={`h-5 w-5 ${style.icon}`} viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d={style.iconPath} clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3 flex-1">
          <h3 className={`text-sm font-medium ${style.title}`}>
            {title}
          </h3>
          <div className={`mt-2 text-sm ${style.message}`}>
            <p>{message}</p>
          </div>
        </div>
        <div className="ml-auto pl-3">
          <div className="-mx-1.5 -my-1.5">
            <button
              onClick={onClose}
              className={`inline-flex rounded-md p-1.5 hover:bg-opacity-20 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent transition-colors ${style.icon}`}
            >
              <span className="sr-only">Dismiss</span>
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const BusinessPosting = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1); // 1 = basic info, 2 = services
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState([]);
  const [logoPreview, setLogoPreview] = useState(null);
  
  // Alert state
  const [alert, setAlert] = useState({
    isVisible: false,
    type: 'error',
    title: '',
    message: ''
  });
  const [formData, setFormData] = useState({
    // Step 1 fields
    firstName: '',
    lastName: '',
    personalPhone: '',
    personalEmail: '',
    businessName: '',
    businessPhone: '',
    businessEmail: '',
    businessAddress: '',
    streetAddress: '',
    city: '',
    province: '',
    country: '',
    postalCode: '',
    logoFile: null,
    
    // Step 2 fields
    services: [], // Available services to select from
    businessWebsite: '',
    businessDescription: '',
    providesInsurance: '',
    insuranceNumber: '',
    acceptedPayments: [],
    availableServices: ['HVAC', 'Plumbing', 'Electrical', 'Carpentry', 'Painting', 'Roofing', 'Flooring', 'Appliance Repair'],
    businessHours: {
      monday: { start: '7:00 AM', end: '7:00 PM', closed: false },
      tuesday: { start: '7:00 AM', end: '7:00 PM', closed: false },
      wednesday: { start: '7:00 AM', end: '7:00 PM', closed: false },
      thursday: { start: '7:00 AM', end: '7:00 PM', closed: false },
      friday: { start: '7:00 AM', end: '7:00 PM', closed: false },
      saturday: { start: '8:00 AM', end: '6:00 PM', closed: false },
      sunday: { start: '9:00 AM', end: '5:00 PM', closed: true }
    },
    serviceRadius: { city: '', distance: '10 km' },
    googleMapsLink: '',
    workPhotos: []
  });

  // Alert helper functions
  const showAlert = (type, title, message) => {
    setAlert({
      isVisible: true,
      type,
      title,
      message
    });
    
    // Auto-hide alert after 8 seconds for non-error alerts
    if (type !== 'error') {
      setTimeout(() => {
        setAlert(prev => ({ ...prev, isVisible: false }));
      }, 8000);
    }
  };

  const hideAlert = () => {
    setAlert(prev => ({ ...prev, isVisible: false }));
  };

  const handleInputChange = (e) => {
    const { name, value, type, files, checked } = e.target;
    
    if (name.includes('.')) {
      // Handle nested object updates (like businessHours.monday.start)
      const [parent, child, subchild] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: subchild ? {
            ...prev[parent][child],
            [subchild]: type === 'checkbox' ? checked : value
          } : (type === 'checkbox' ? checked : value)
        }
      }));
    } else if (type === 'file') {
      if (name === 'logoFile') {
        const file = files[0];
        setFormData(prev => ({ ...prev, [name]: file }));
        
        // Create preview for logo
        if (file) {
          const reader = new FileReader();
          reader.onload = (e) => setLogoPreview(e.target.result);
          reader.readAsDataURL(file);
        } else {
          setLogoPreview(null);
        }
      } else if (name === 'workPhotos') {
        const fileArray = Array.from(files);
        setFormData(prev => ({ 
          ...prev, 
          workPhotos: [...prev.workPhotos, ...fileArray] 
        }));
        
        // Create previews for work photos
        fileArray.forEach(file => {
          const reader = new FileReader();
          reader.onload = (e) => {
            setImagePreview(prev => [...prev, e.target.result]);
          };
          reader.readAsDataURL(file);
        });
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
      
      // Hide alert when user starts typing in email field
      if (name === 'businessEmail' && alert.isVisible && alert.title.includes('Email')) {
        hideAlert();
      }
    }
  };

  const removeWorkPhoto = (index) => {
    setFormData(prev => ({
      ...prev,
      workPhotos: prev.workPhotos.filter((_, i) => i !== index)
    }));
    setImagePreview(prev => prev.filter((_, i) => i !== index));
  };

  const addService = (service) => {
    if (!formData.services.includes(service)) {
      setFormData(prev => ({
        ...prev,
        services: [...prev.services, service]
      }));
    }
  };

  const togglePaymentMethod = (method) => {
    setFormData(prev => ({
      ...prev,
      acceptedPayments: prev.acceptedPayments.includes(method)
        ? prev.acceptedPayments.filter(p => p !== method)
        : [...prev.acceptedPayments, method]
    }));
  };

  const handleInsuranceChange = (value) => {
    setFormData(prev => ({
      ...prev,
      providesInsurance: value
    }));
  };

  const handlePaymentChange = (payment) => {
    setFormData(prev => ({
      ...prev,
      acceptedPayments: prev.acceptedPayments.includes(payment)
        ? prev.acceptedPayments.filter(p => p !== payment)
        : [...prev.acceptedPayments, payment]
    }));
  };

  const removeService = (index) => {
    setFormData(prev => ({
      ...prev,
      services: prev.services.filter((_, i) => i !== index)
    }));
  };

  const handleSelectServices = () => {
    setCurrentStep(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    setIsSubmitting(true);
    
    try {
      // Create technician data from form - mapping to new schema structure
      const technicianData = {
        technicianId: Date.now(), // Generate unique ID
        name: formData.businessName,
        category: formData.services.length > 0 ? formData.services[0] : 'General',
        address: `${formData.streetAddress}, ${formData.city}, ${formData.province} ${formData.postalCode}`,
        phone: formData.businessPhone,
        email: formData.businessEmail, // Use business email for main contact
        website: formData.businessWebsite,
        description: formData.businessDescription,
        services: formData.services,
        serviceAreas: `${formData.city}, ${formData.province}`,
        expertise: formData.businessDescription,
        distance: parseInt(formData.serviceRadius.distance.split(' ')[0]) || 10,
        rating: 0,
        reviews: 0,
        verified: false,
        emergency: false,
        reviewsData: [],
        logo: logoPreview || null,
        workPhotos: imagePreview && imagePreview.length > 0 ? imagePreview : [],
        
        // New schema fields
        ownerDetails: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          personalPhone: formData.personalPhone,
          personalEmail: formData.personalEmail
        },
        
        addressDetails: {
          businessAddress: formData.businessAddress,
          streetAddress: formData.streetAddress,
          city: formData.city,
          province: formData.province,
          country: formData.country,
          postalCode: formData.postalCode
        },
        
        businessPhone: formData.businessPhone,
        businessEmail: formData.businessEmail,
        businessWebsite: formData.businessWebsite,
        businessDescription: formData.businessDescription,
        
        businessHours: formData.businessHours,
        serviceRadius: formData.serviceRadius,
        
        providesInsurance: formData.providesInsurance,
        insuranceNumber: formData.insuranceNumber,
        acceptedPayments: formData.acceptedPayments,
        googleMapsLink: formData.googleMapsLink,
        
        applicationStatus: 'pending',
        profileComplete: true
      };

      // Create user data
      const userData = {
        name: `${formData.firstName} ${formData.lastName}`,
        email: formData.personalEmail,
        phone: formData.personalPhone,
        role: 'Technician',
        businessInfo: {
          companyName: formData.businessName,
          website: formData.businessWebsite,
          serviceAreas: [formData.city],
          specialties: formData.services
        }
      };

      // Submit technician registration
      console.log('Submitting technician data:', technicianData);
      const techResponse = await apiService.post('/technicians', technicianData);
      console.log('Technician response:', techResponse);
      
      if (techResponse.success) {
        // Submit user registration
        console.log('Submitting user data:', userData);
        const userResponse = await apiService.post('/admin/users', userData);
        console.log('User response:', userResponse);
        
        if (userResponse.success) {
          // Store business information in localStorage for authentication
          localStorage.setItem('businessId', technicianData.technicianId);
          localStorage.setItem('businessName', technicianData.name);
          localStorage.setItem('businessEmail', technicianData.businessEmail);
          localStorage.setItem('userType', 'business');
          
          showAlert('success', 'Registration Successful!', 'Your business registration has been submitted successfully! Redirecting to your dashboard...');
          setTimeout(() => navigate('/business-dashboard'), 3000);
        } else {
          showAlert('error', 'User Profile Error', userResponse.message || 'Error creating user profile. Please try again.');
        }
      } else {
        // Handle specific error types
        if (techResponse.message === 'DUPLICATE_EMAIL') {
          const businessName = techResponse.existingBusiness ? ` (${techResponse.existingBusiness})` : '';
          showAlert('error', 'Email Already Registered', 
            `A business${businessName} with this email address is already registered. Each business can only register once per email address. Please use a different email or contact support if you believe this is an error.`);
        } else {
          showAlert('error', 'Registration Error', techResponse.message || 'Error registering business. Please try again.');
        }
      }
    } catch (error) {
      console.error('Error submitting business registration:', error);
      
      // Handle network or unexpected errors
      if (error.response && error.response.data && error.response.data.message === 'DUPLICATE_EMAIL') {
        const businessName = error.response.data.existingBusiness ? ` (${error.response.data.existingBusiness})` : '';
        showAlert('error', 'Email Already Registered', 
          `A business${businessName} with this email address is already registered. Each business can only register once per email address. Please use a different email or contact support if you believe this is an error.`);
      } else {
        showAlert('error', 'Network Error', 'Error submitting registration. Please check your internet connection and try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Step 1 - Basic Information Form
  if (currentStep === 1) {
    return (
      <>
        {/* Alert Component */}
        <Alert
          type={alert.type}
          title={alert.title}
          message={alert.message}
          onClose={hideAlert}
          isVisible={alert.isVisible}
        />
        
        <div className="min-h-screen w-full max-w-[1500px] mx-auto bg-white">
        <div className="px-4 sm:px-8 md:px-16 lg:px-[199px] py-8 lg:py-[70px]">
          {/* Main Title */}
          <h1 className="text-2xl sm:text-3xl lg:text-[40px] font-semibold text-black font-roboto mb-8 lg:mb-[56px]">Join as bureau expert!</h1>
          
          <form className="space-y-8 lg:space-y-[56px]">
            {/* Your full name section */}
            <div>
              <p className="text-base lg:text-[18px] font-roboto text-black mb-4 lg:mb-[22px]">Your full name</p>
              <div className="flex flex-col sm:flex-row gap-4 lg:gap-[25px]">
                <div className="w-full sm:w-[310px] h-[46px] bg-white border border-black rounded-[10px] flex items-center px-[12px]">
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    placeholder="First Name"
                    className="w-full bg-transparent text-base lg:text-[18px] font-light font-roboto text-black placeholder-black outline-none"
                  />
                </div>
                <div className="w-full sm:w-[310px] h-[46px] bg-white border border-black rounded-[10px] flex items-center px-[12px]">
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    placeholder="Last Name"
                    className="w-full bg-transparent text-base lg:text-[18px] font-light font-roboto text-black placeholder-black outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Your Contact Details */}
            <div>
              <p className="text-base lg:text-[18px] font-roboto text-black mb-4 lg:mb-[22px]">Your Contact Details</p>
              <div className="flex flex-col sm:flex-row gap-4 lg:gap-[25px]">
                <div className="w-full sm:w-[310px] h-[46px] bg-white border border-black rounded-[10px] flex items-center px-[12px]">
                  <input
                    type="tel"
                    name="personalPhone"
                    value={formData.personalPhone}
                    onChange={handleInputChange}
                    placeholder="Phone Number"
                    className="w-full bg-transparent text-base lg:text-[18px] font-light font-roboto text-black placeholder-black outline-none"
                  />
                </div>
                <div className="w-full sm:w-[310px] h-[46px] bg-white border border-black rounded-[10px] flex items-center px-[12px]">
                  <input
                    type="email"
                    name="personalEmail"
                    value={formData.personalEmail}
                    onChange={handleInputChange}
                    placeholder="Email"
                    className="w-full bg-transparent text-base lg:text-[18px] font-light font-roboto text-black placeholder-black outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Your Business Details */}
            <div>
              <h2 className="text-2xl sm:text-3xl lg:text-[40px] font-semibold text-black font-roboto mb-8 lg:mb-[56px]">Your Business Details</h2>
              
              {/* Full Business Name */}
              <div className="mb-4 lg:mb-[22px]">
                <p className="text-base lg:text-[18px] font-roboto text-black mb-4 lg:mb-[22px]">Full Business Name</p>
                <div className="w-full max-w-[645px] h-[46px] bg-white border border-black rounded-[10px] flex items-center px-[12px]">
                  <input
                    type="text"
                    name="businessName"
                    value={formData.businessName}
                    onChange={handleInputChange}
                    placeholder="Business Name"
                    className="w-full bg-transparent text-base lg:text-[18px] font-light font-roboto text-black placeholder-black outline-none"
                  />
                </div>
              </div>

              {/* Business's Contact Details */}
              <div className="mb-8 lg:mb-[56px]">
                <p className="text-base lg:text-[18px] font-roboto text-black mb-4 lg:mb-[22px]">Business's Contact Details</p>
                <div className="flex flex-col sm:flex-row gap-4 lg:gap-[25px]">
                  <div className="w-full sm:w-[310px] h-[46px] bg-white border border-black rounded-[10px] flex items-center px-[12px]">
                    <input
                      type="tel"
                      name="businessPhone"
                      value={formData.businessPhone}
                      onChange={handleInputChange}
                      placeholder="Business Phone Number"
                      className="w-full bg-transparent text-base lg:text-[18px] font-light font-roboto text-black placeholder-black outline-none"
                    />
                  </div>
                  <div className="w-full sm:w-[310px] h-[46px] bg-white border border-black rounded-[10px] flex items-center px-[12px]">
                    <input
                      type="email"
                      name="businessEmail"
                      value={formData.businessEmail}
                      onChange={handleInputChange}
                      placeholder="Business Email"
                      className="w-full bg-transparent text-base lg:text-[18px] font-light font-roboto text-black placeholder-black outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Business Address */}
              <div className="mb-8 lg:mb-[56px]">
                <p className="text-base lg:text-[18px] font-roboto text-black mb-4 lg:mb-[22px]">Business Address</p>
                <div className="w-full max-w-[645px] h-[46px] bg-white border border-black rounded-[10px] flex items-center px-[12px] mb-4 lg:mb-[22px]">
                  <input
                    type="text"
                    name="businessAddress"
                    value={formData.businessAddress}
                    onChange={handleInputChange}
                    placeholder="Search Business Address"
                    className="w-full bg-transparent text-base lg:text-[18px] font-light font-roboto text-black placeholder-black outline-none"
                  />
                </div>

                <p className="text-base lg:text-[18px] font-roboto text-black mb-4 lg:mb-[22px]">Street Address</p>
                <div className="w-full max-w-[645px] h-[46px] bg-white border border-black rounded-[10px] flex items-center px-[12px] mb-8 lg:mb-[56px]">
                  <input
                    type="text"
                    name="streetAddress"
                    value={formData.streetAddress}
                    onChange={handleInputChange}
                    placeholder="Select One"
                    className="w-full bg-transparent text-base lg:text-[18px] font-light font-roboto text-black placeholder-black outline-none"
                  />
                </div>

                {/* City and Province */}
                <div className="flex flex-col sm:flex-row gap-4 lg:gap-[25px] mb-4 lg:mb-[22px]">
                  <div className="w-full sm:w-[310px]">
                    <p className="text-base lg:text-[18px] font-roboto text-black mb-4 lg:mb-[22px]">City</p>
                    <div className="w-full h-[46px] bg-white border border-black rounded-[10px] flex items-center px-[12px]">
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        placeholder="City"
                        className="w-full bg-transparent text-base lg:text-[18px] font-light font-roboto text-black placeholder-black outline-none"
                      />
                    </div>
                  </div>
                  <div className="w-full sm:w-[310px]">
                    <p className="text-base lg:text-[18px] font-roboto text-black mb-4 lg:mb-[22px]">Province</p>
                    <div className="w-full h-[46px] bg-white border border-black rounded-[10px] flex items-center px-[12px]">
                      <input
                        type="text"
                        name="province"
                        value={formData.province}
                        onChange={handleInputChange}
                        placeholder="Province"
                        className="w-full bg-transparent text-base lg:text-[18px] font-light font-roboto text-black placeholder-black outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Country and Postal Code */}
                <div className="flex flex-col sm:flex-row gap-4 lg:gap-[25px]">
                  <div className="w-full sm:w-[310px]">
                    <p className="text-base lg:text-[18px] font-roboto text-black mb-4 lg:mb-[22px]">Country</p>
                    <div className="w-full h-[46px] bg-white border border-black rounded-[10px] flex items-center px-[12px]">
                      <input
                        type="text"
                        name="country"
                        value={formData.country}
                        onChange={handleInputChange}
                        placeholder="Country"
                        className="w-full bg-transparent text-base lg:text-[18px] font-light font-roboto text-black placeholder-black outline-none"
                      />
                    </div>
                  </div>
                  <div className="w-full sm:w-[310px]">
                    <p className="text-base lg:text-[18px] font-roboto text-black mb-4 lg:mb-[22px]">Postal Code</p>
                    <div className="w-full h-[46px] bg-white border border-black rounded-[10px] flex items-center px-[12px]">
                      <input
                        type="text"
                        name="postalCode"
                        value={formData.postalCode}
                        onChange={handleInputChange}
                        placeholder="Postal code"
                        className="w-full bg-transparent text-base lg:text-[18px] font-light font-roboto text-black placeholder-black outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Upload business logo */}
              <div className="mb-8 lg:mb-[56px]">
                <p className="text-base lg:text-[18px] font-roboto text-black mb-4 lg:mb-[22px]">Upload business logo</p>
                <div className="w-full max-w-[650px] h-[119px] bg-[#F3F3F3] rounded-[10px] flex items-center justify-center">
                  <label htmlFor="logoFile" className="cursor-pointer">
                    <input
                      type="file"
                      id="logoFile"
                      name="logoFile"
                      onChange={handleInputChange}
                      accept="image/*"
                      className="hidden"
                    />
                    {logoPreview ? (
                      <img src={logoPreview} alt="Logo Preview" className="w-full h-full object-contain rounded-lg" />
                    ) : (
                      <span className="text-lg lg:text-[25px] font-extralight font-roboto text-black/50">Drop your files here</span>
                    )}
                  </label>
                </div>
              </div>

              {/* Select Your Services Button */}
              <div>
                <button
                  type="button"
                  onClick={handleSelectServices}
                  className="w-full sm:w-[235px] h-[46px] bg-[#AF2638] rounded-[10px] flex items-center justify-center"
                >
                  <span className="text-base lg:text-[18px] font-semibold font-roboto text-white">Select Your Services</span>
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
      </>
    );
  }

  // Step 2 - Services Selection Form
  return (
    <>
      {/* Alert Component */}
      <Alert
        type={alert.type}
        title={alert.title}
        message={alert.message}
        onClose={hideAlert}
        isVisible={alert.isVisible}
      />
      
      <div className="min-h-screen w-full max-w-[1500px] mx-auto bg-white">
      <div className="px-4 sm:px-8 md:px-16 lg:px-[199px] py-8 lg:py-[70px]">
        {/* Main Title */}
        <h1 className="text-2xl sm:text-3xl lg:text-[40px] font-semibold text-black font-roboto mb-8 lg:mb-[56px]">Select services your provide and details</h1>
        
        <form onSubmit={handleSubmit} className="space-y-8 lg:space-y-[56px]">
          {/* Select all the services */}
          <div>
            <p className="text-base lg:text-[18px] font-roboto text-black mb-4 lg:mb-[22px]">Select all the services that you provide</p>
            
            {/* Available Services to Choose From */}
            <div className="mb-4">
              <p className="text-sm font-roboto text-gray-600 mb-2">Available Services:</p>
              <div className="flex flex-wrap gap-2">
                {formData.availableServices.map((service, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => addService(service)}
                    disabled={formData.services.includes(service)}
                    className={`px-3 py-1 rounded-md text-sm font-roboto transition-colors ${
                      formData.services.includes(service)
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-blue-100 text-blue-800 hover:bg-blue-200 cursor-pointer'
                    }`}
                  >
                    + {service}
                  </button>
                ))}
              </div>
            </div>

            {/* Selected Services */}
            <div className="w-full max-w-[650px] min-h-[177px] bg-white border border-black rounded-[10px] p-[14px]">
              {formData.services.length === 0 ? (
                <div className="flex items-center justify-center h-[140px] text-gray-500 text-center">
                  <p>No services selected. Click on services above to add them.</p>
                </div>
              ) : (
              <div className="flex flex-wrap gap-3 lg:gap-[20px]">
                {formData.services.map((service, index) => (
                    <div key={index} className="min-w-[100px] h-[41px] bg-[#E5E5E5] rounded-[2px] flex items-center justify-between px-3 lg:px-[18px]">
                    <span className="text-sm lg:text-[18px] font-roboto text-black leading-[27px]">{service}</span>
                    <button
                      type="button"
                      onClick={() => removeService(index)}
                        className="text-sm lg:text-[18px] font-roboto text-red-600 hover:text-red-800 leading-[27px] ml-2 font-bold"
                    >
                        ×
                    </button>
                  </div>
                ))}
              </div>
              )}
            </div>
          </div>

          {/* Additional Business Details */}
          <div>
            <h2 className="text-2xl sm:text-3xl lg:text-[40px] font-semibold text-black font-roboto mb-8 lg:mb-[56px]">Additional Business Details</h2>
            
            {/* Business website */}
            <div className="mb-8 lg:mb-[56px]">
              <p className="text-base lg:text-[18px] font-roboto text-black mb-4 lg:mb-[22px]">Business website</p>
              <div className="w-full max-w-[645px] h-[46px] bg-white border border-black rounded-[10px] flex items-center px-[12px]">
                <input
                  type="url"
                  name="businessWebsite"
                  value={formData.businessWebsite}
                  onChange={handleInputChange}
                  placeholder="www.homeservicebureau.com"
                  className="w-full bg-transparent text-base lg:text-[18px] font-light font-roboto text-black placeholder-black outline-none"
                />
              </div>
            </div>

            {/* Business description */}
            <div className="mb-8 lg:mb-[56px]">
              <p className="text-base lg:text-[18px] font-roboto text-black mb-4 lg:mb-[22px]">Business description</p>
              <div className="w-full max-w-[650px] h-[120px] lg:h-[177px] bg-white border border-black rounded-[10px] p-[11px]">
                <textarea
                  name="businessDescription"
                  value={formData.businessDescription}
                  onChange={handleInputChange}
                  placeholder="Tell us about your business, and why should homeowners trust your service"
                  className="w-full h-full bg-transparent text-base lg:text-[18px] font-light font-roboto text-black placeholder-black outline-none resize-none leading-[27px]"
                />
              </div>
            </div>

            {/* Add pictures */}
            <div className="mb-8 lg:mb-[56px]">
              <p className="text-base lg:text-[18px] font-roboto text-black mb-4 lg:mb-[22px]">Add some picture of previous work you have done (optional)</p>
              
              {/* Image Previews */}
              {imagePreview.length > 0 && (
                <div className="mb-4">
                  <div className="flex flex-wrap gap-3">
                    {imagePreview.map((src, index) => (
                      <div key={index} className="relative w-20 h-20 bg-white border border-gray-300 rounded-lg overflow-hidden">
                        <img src={src} alt={`Work Photo ${index + 1}`} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removeWorkPhoto(index)}
                          className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full text-xs hover:bg-red-600 flex items-center justify-center"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="flex flex-col sm:flex-row items-start gap-3 lg:gap-[12px]">
                <div className="w-full max-w-[650px] h-[119px] bg-[#F3F3F3] rounded-[10px] flex items-center justify-center">
                  <label htmlFor="workPhotos" className="cursor-pointer w-full h-full flex items-center justify-center">
                    <input
                      type="file"
                      id="workPhotos"
                      name="workPhotos"
                      onChange={handleInputChange}
                      accept="image/*"
                      multiple
                      className="hidden"
                    />
                    <span className="text-lg lg:text-[25px] font-extralight font-roboto text-black/50">
                      {imagePreview.length > 0 ? 'Add more photos' : 'Drop your files here'}
                    </span>
                  </label>
                </div>
                <div className="w-[68px] h-[23px] bg-[#F3F3F3] rounded-[5px] flex items-center justify-center">
                  <span className="text-[10px] font-light font-roboto text-black/50">Add More</span>
                </div>
              </div>
            </div>

            {/* Operating business hours */}
            <div className="mb-8 lg:mb-[56px]">
              <p className="text-base lg:text-[18px] font-roboto text-black mb-4 lg:mb-[22px]">Operating business hours</p>
              
              {Object.entries(formData.businessHours).map(([day, hours]) => (
                <div key={day} className="flex flex-col sm:flex-row items-start sm:items-center gap-3 lg:gap-[19px] mb-3 lg:mb-[14px]">
                <div className="flex items-center gap-3">
                    <span className="w-20 text-sm lg:text-[16px] font-medium text-black capitalize">{day}:</span>
                    <select
                      name={`businessHours.${day}.start`}
                      value={hours.start}
                      onChange={handleInputChange}
                      disabled={hours.closed}
                      className="w-[100px] lg:w-[126px] h-[46px] bg-white border border-black rounded-[10px] px-[13px] text-sm lg:text-[16px] font-light font-roboto text-black disabled:bg-gray-100"
                    >
                      {['6:00 AM', '7:00 AM', '8:00 AM', '9:00 AM', '10:00 AM'].map(time => (
                        <option key={time} value={time}>{time}</option>
                      ))}
                    </select>
                  <span className="text-base lg:text-[18px] font-light font-roboto text-black">-</span>
                    <select
                      name={`businessHours.${day}.end`}
                      value={hours.end}
                      onChange={handleInputChange}
                      disabled={hours.closed}
                      className="w-[100px] lg:w-[126px] h-[46px] bg-white border border-black rounded-[10px] px-[13px] text-sm lg:text-[16px] font-light font-roboto text-black disabled:bg-gray-100"
                    >
                      {['5:00 PM', '6:00 PM', '7:00 PM', '8:00 PM', '9:00 PM', '10:00 PM'].map(time => (
                        <option key={time} value={time}>{time}</option>
                      ))}
                    </select>
                  </div>
                  <label className="flex items-center gap-2 lg:gap-[11px] cursor-pointer">
                    <input
                      type="checkbox"
                      name={`businessHours.${day}.closed`}
                      checked={hours.closed}
                      onChange={handleInputChange}
                      className="w-[20px] h-[20px] text-[#AF2638] focus:ring-[#AF2638] rounded"
                    />
                  <span className="text-sm lg:text-[18px] font-light font-roboto text-black">Closed?</span>
                  </label>
                </div>
              ))}
            </div>

            {/* Service radius */}
            <div className="mb-8 lg:mb-[56px]">
              <p className="text-base lg:text-[18px] font-roboto text-black mb-4 lg:mb-[22px]">Service radius</p>
              <div className="flex flex-col sm:flex-row gap-3 lg:gap-[12px]">
                <div className="w-full sm:w-[355px] h-[46px] bg-white border border-black rounded-[10px] flex items-center px-[13px]">
                  <input
                    type="text"
                    name="serviceRadius.city"
                    value={formData.serviceRadius.city}
                    onChange={handleInputChange}
                    placeholder="Pick your city"
                    className="w-full bg-transparent text-base lg:text-[18px] font-light font-roboto text-black placeholder-black outline-none"
                  />
                </div>
                <div className="w-full sm:w-[197px] h-[46px] bg-white border border-black rounded-[10px] flex items-center px-[13px]">
                  <select
                    name="serviceRadius.distance"
                    value={formData.serviceRadius.distance}
                    onChange={handleInputChange}
                    className="w-full bg-transparent text-base lg:text-[18px] font-light font-roboto text-black outline-none"
                  >
                    <option value="5 km">5 km</option>
                    <option value="10 km">10 km</option>
                    <option value="15 km">15 km</option>
                    <option value="20 km">20 km</option>
                    <option value="25 km">25 km</option>
                    <option value="50 km">50 km</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Insurance/warranty */}
            <div className="mb-8 lg:mb-[56px]">
              <p className="text-base lg:text-[18px] font-roboto text-black mb-4 lg:mb-[22px]">Do you provide insurance/warranty on your services?</p>
              <div className="flex flex-col sm:flex-row gap-4 lg:gap-[56px] mb-4 lg:mb-[22px]">
                <label className="flex items-center gap-3 lg:gap-[14px] cursor-pointer">
                  <input
                    type="radio"
                    name="providesInsurance"
                    value="yes"
                    checked={formData.providesInsurance === 'yes'}
                    onChange={(e) => handleInsuranceChange(e.target.value)}
                    className="w-[20px] h-[20px] text-[#AF2638] focus:ring-[#AF2638]"
                  />
                  <span className="text-sm lg:text-[18px] font-light font-roboto text-black">Yes, we do provide insurance/warranty</span>
                </label>
                <label className="flex items-center gap-3 lg:gap-[14px] cursor-pointer">
                  <input
                    type="radio"
                    name="providesInsurance"
                    value="no"
                    checked={formData.providesInsurance === 'no'}
                    onChange={(e) => handleInsuranceChange(e.target.value)}
                    className="w-[20px] h-[20px] text-[#AF2638] focus:ring-[#AF2638]"
                  />
                  <span className="text-sm lg:text-[18px] font-light font-roboto text-black">No, we don't provide it</span>
                </label>
              </div>

              <p className="text-base lg:text-[18px] font-roboto text-black mb-4 lg:mb-[22px]">Insurance number, if your provide insurance on your services (optional)</p>
              <div className="w-full max-w-[645px] h-[46px] bg-white border border-black rounded-[10px] flex items-center px-[12px]">
                <input
                  type="text"
                  name="insuranceNumber"
                  value={formData.insuranceNumber}
                  onChange={handleInputChange}
                  placeholder="Insurance number"
                  className="w-full bg-transparent text-base lg:text-[18px] font-light font-roboto text-black placeholder-black outline-none"
                />
              </div>
            </div>

            {/* Payment methods */}
            <div className="mb-8 lg:mb-[56px]">
              <p className="text-base lg:text-[18px] font-roboto text-black mb-4 lg:mb-[22px]">Payment methods you accept (select all that applies)</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:flex lg:gap-[66px] gap-4">
                {['Cash', 'Debit Card', 'Credit Card', 'Financing'].map((method) => (
                  <label key={method} className="flex items-center gap-2 lg:gap-[7px] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.acceptedPayments.includes(method)}
                      onChange={() => togglePaymentMethod(method)}
                      className="w-[20px] h-[20px] text-[#AF2638] focus:ring-[#AF2638] rounded"
                    />
                    <span className="text-base lg:text-[18px] font-light font-roboto text-black">{method}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Google maps profile */}
            <div className="mb-8 lg:mb-[56px]">
              <p className="text-base lg:text-[18px] font-roboto text-black mb-4 lg:mb-[22px]">Enable your google reviews. Please share your Google profile link from maps.</p>
              <div className="w-full max-w-[645px] h-[46px] bg-white border border-black rounded-[10px] flex items-center px-[12px]">
                <input
                  type="url"
                  name="googleMapsLink"
                  value={formData.googleMapsLink}
                  onChange={handleInputChange}
                  placeholder="Google maps profile link"
                  className="w-full bg-transparent text-base lg:text-[18px] font-light font-roboto text-black placeholder-black outline-none"
                />
              </div>
            </div>

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full sm:w-[235px] h-[46px] rounded-[10px] flex items-center justify-center ${
                  isSubmitting 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-[#AF2638] hover:bg-red-700'
                }`}
              >
                <span className="text-base lg:text-[18px] font-semibold font-roboto text-white">
                  {isSubmitting ? 'Submitting...' : 'Submit Your Details'}
                </span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
    </>
  );
};

export default BusinessPosting; 
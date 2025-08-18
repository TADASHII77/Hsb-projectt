import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import apiService from "../services/api";
import {
  generateAndSendOtp,
  verifyOtp,
  clearOtp,
  getResendRemainingMs,
  formatSeconds,
} from "../services/otp";

// Load saved data from session storage
const loadSavedBusinessData = () => {
  const savedData = sessionStorage.getItem("businessPostingData");
  if (savedData) {
    try {
      const parsed = JSON.parse(savedData);
      // Don't restore file objects as they can't be serialized
      return {
        ...parsed,
        logoFile: null,
        workPhotos: [],
      };
    } catch (error) {
      console.error("Error loading saved business posting data:", error);
    }
  }
  return {
    // Step 1 fields
    firstName: "",
    lastName: "",
    personalPhone: "",
    verificationCode: "",
    personalPassword: "",
    businessName: "",
    businessPhone: "",
    businessEmail: "",
    businessAddress: "",
    streetAddress: "",
    city: "",
    province: "",
    country: "",
    postalCode: "",
    logoFile: null,

    // Step 2 fields
    services: [], // User-defined services
    newService: "", // Input field for new service
    businessWebsite: "",
    businessDescription: "",
    providesInsurance: "",
    insuranceNumber: "",
    acceptedPayments: [],
    businessHours: {
      monday: { start: "7:00 AM", end: "7:00 PM", closed: false },
      tuesday: { start: "7:00 AM", end: "7:00 PM", closed: false },
      wednesday: { start: "7:00 AM", end: "7:00 PM", closed: false },
      thursday: { start: "7:00 AM", end: "7:00 PM", closed: false },
      friday: { start: "7:00 AM", end: "7:00 PM", closed: false },
      saturday: { start: "8:00 AM", end: "6:00 PM", closed: false },
      sunday: { start: "9:00 AM", end: "5:00 PM", closed: true },
    },
    serviceRadius: { city: "", distance: "10 km" },
    googleMapsLink: "",
    workPhotos: [],
  };
};

// Beautiful Alert Component
const Alert = ({ type, title, message, onClose, isVisible }) => {
  if (!isVisible) return null;

  const alertStyles = {
    error: {
      container: "bg-red-50 border-l-4 border-red-400",
      icon: "text-red-400",
      title: "text-red-800",
      message: "text-red-700",
      iconPath:
        "M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z",
    },
    success: {
      container: "bg-green-50 border-l-4 border-green-400",
      icon: "text-green-400",
      title: "text-green-800",
      message: "text-green-700",
      iconPath: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
    },
    warning: {
      container: "bg-yellow-50 border-l-4 border-yellow-400",
      icon: "text-yellow-400",
      title: "text-yellow-800",
      message: "text-yellow-700",
      iconPath:
        "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z",
    },
  };

  const style = alertStyles[type] || alertStyles.error;

  return (
    <div
      className={`fixed top-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-96 z-50 p-4 rounded-md shadow-lg ${style.container} transform transition-all duration-300 ease-in-out`}
    >
      <div className="flex">
        <div className="flex-shrink-0">
          <svg
            className={`h-5 w-5 ${style.icon}`}
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path fillRule="evenodd" d={style.iconPath} clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3 flex-1">
          <h3 className={`text-sm font-medium ${style.title}`}>{title}</h3>
          <div className={`mt-2 text-sm ${style.message}`}>
            <p>{message}</p>
          </div>
        </div>
        <div className="ml-auto pl-3">
          <div className="-mx-1.5 -my-1.5">
            <button
              onClick={onClose}
              className={`inline-flex rounded-md p-1.5 hover:bg-gray-600/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent transition-colors ${style.icon}`}
            >
              <span className="sr-only">Dismiss</span>
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const BusinessPosting = () => {
  const [currentStep, setCurrentStep] = useState(1); // 1 = basic info, 2 = services, 3 = password
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [resendRemainingMs, setResendRemainingMs] = useState(0);
  const [imagePreview, setImagePreview] = useState([]);
  const [logoPreview, setLogoPreview] = useState(null);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Alert state
  const [alert, setAlert] = useState({
    isVisible: false,
    type: "error",
    title: "",
    message: "",
  });
  const [formData, setFormData] = useState(loadSavedBusinessData);

  // Field error state for validation feedback
  const [fieldErrors, setFieldErrors] = useState({});

  // Alert helper functions
  const showAlert = (type, title, message) => {
    setAlert({
      isVisible: true,
      type,
      title,
      message,
    });

    // Auto-hide alert after 8 seconds for non-error alerts
    if (type !== "error") {
      setTimeout(() => {
        setAlert((prev) => ({ ...prev, isVisible: false }));
      }, 8000);
    }
  };

  const hideAlert = () => {
    setAlert((prev) => ({ ...prev, isVisible: false }));
  };

  // Save data to session storage whenever form data changes
  const saveToSessionStorage = (data) => {
    try {
      // Don't save file objects as they can't be serialized
      const dataToSave = {
        ...data,
        logoFile: null,
        workPhotos: [],
      };
      sessionStorage.setItem("businessPostingData", JSON.stringify(dataToSave));
    } catch (error) {
      console.error(
        "Error saving business posting data to session storage:",
        error
      );
    }
  };

  // Clear session storage data
  const clearSessionStorage = () => {
    sessionStorage.removeItem("businessPostingData");
  };

  // Effect to save data whenever formData changes
  useEffect(() => {
    saveToSessionStorage(formData);
  }, [formData]);

  // Phone number validation function
  const isValidPhoneNumber = (phone) => {
    // Check if phone is provided
    if (!phone || typeof phone !== "string") {
      return false;
    }

    // Must start with + for country code
    if (!phone.startsWith("+")) {
      return false;
    }

    // Remove the + and all non-digit characters
    const cleaned = phone.substring(1).replace(/\D/g, "");

    // Must have at least 1 digit after the country code
    return cleaned.length >= 6;
  };

  // OTP helpers (owner phone)
  const handleSendOtp = () => {
    if (!formData.personalPhone) {
      showAlert("error", "Phone Required", "Enter your phone number.");
      return;
    }

    if (!isValidPhoneNumber(formData.personalPhone)) {
      showAlert(
        "error",
        "Invalid Phone Number",
        "Please enter a valid phone number with country code (e.g., +1234567890)."
      );
      return;
    }

    try {
      setIsSendingCode(true);
      const { code } = generateAndSendOtp(formData.personalPhone);
      // eslint-disable-next-line no-console
      console.log("[OTP] Business phone code:", code);
      showAlert("success", "OTP Sent", "Verification code sent to your phone.");
      // Track that OTP was sent to this phone number
      setOtpSentToPhone(formData.personalPhone);
      setResendRemainingMs(getResendRemainingMs(formData.personalPhone));
    } finally {
      setIsSendingCode(false);
    }
  };

  const handleVerifyOtp = () => {
    if (!formData.personalPhone || !formData.verificationCode) {
      showAlert("error", "Code Required", "Enter the verification code.");
      return;
    }
    setIsVerifying(true);
    const result = verifyOtp(formData.personalPhone, formData.verificationCode);
    if (result.ok) {
      setOtpVerified(true);
      clearOtp(formData.personalPhone);
      // Keep the OTP field visible after verification, only reset timer
      setResendRemainingMs(0);
      showAlert(
        "success",
        "Verified",
        "Phone verified successfully. Moving to next step..."
      );
      // Show loading and move to next page after a short delay
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentStep(3);
        setIsTransitioning(false);
        window.scrollTo(0, 0);
      }, 1500);
    } else {
      const reason =
        result.reason === "EXPIRED"
          ? "Code expired."
          : result.reason === "MISMATCH"
          ? "Incorrect code."
          : "Invalid code.";
      showAlert("error", "Invalid Code", reason);
    }
    setIsVerifying(false);
  };

  // Track the phone number that OTP was sent to
  const [otpSentToPhone, setOtpSentToPhone] = useState("");

  useEffect(() => {
    const t = setInterval(() => {
      // Only show timer if OTP was sent to the current phone number
      if (formData.personalPhone && otpSentToPhone === formData.personalPhone) {
        setResendRemainingMs(getResendRemainingMs(formData.personalPhone));
      } else {
        setResendRemainingMs(0);
      }
    }, 1000);
    return () => clearInterval(t);
  }, [formData.personalPhone, otpSentToPhone]);

  // Cleanup timer when component unmounts
  useEffect(() => {
    return () => {
      setResendRemainingMs(0);
      setOtpSentToPhone("");
    };
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, files, checked } = e.target;

    if (name.includes(".")) {
      // Handle nested object updates (like businessHours.monday.start)
      const [parent, child, subchild] = name.split(".");
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: subchild
            ? {
                ...prev[parent][child],
                [subchild]: type === "checkbox" ? checked : value,
              }
            : type === "checkbox"
            ? checked
            : value,
        },
      }));
    } else if (type === "file") {
      if (name === "logoFile") {
        const file = files[0];
        setFormData((prev) => ({ ...prev, [name]: file }));

        // Create preview for logo
        if (file) {
          const reader = new FileReader();
          reader.onload = (e) => setLogoPreview(e.target.result);
          reader.readAsDataURL(file);
        } else {
          setLogoPreview(null);
        }
      } else if (name === "workPhotos") {
        const fileArray = Array.from(files);
        setFormData((prev) => ({
          ...prev,
          workPhotos: [...prev.workPhotos, ...fileArray],
        }));

        // Create previews for work photos
        fileArray.forEach((file) => {
          const reader = new FileReader();
          reader.onload = (e) => {
            setImagePreview((prev) => [...prev, e.target.result]);
          };
          reader.readAsDataURL(file);
        });
      }
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));

      // Reset OTP timer when phone number changes
      if (name === "personalPhone") {
        setOtpSentToPhone("");
        setResendRemainingMs(0);
      }

      // Hide alert when user starts typing in email field
      if (
        name === "businessEmail" &&
        alert.isVisible &&
        alert.title.includes("Email")
      ) {
        hideAlert();
      }
    }
  };

  const removeWorkPhoto = (index) => {
    setFormData((prev) => ({
      ...prev,
      workPhotos: prev.workPhotos.filter((_, i) => i !== index),
    }));
    setImagePreview((prev) => prev.filter((_, i) => i !== index));
  };

  const addService = () => {
    const service = formData.newService.trim();
    if (service && !formData.services.includes(service)) {
      setFormData((prev) => ({
        ...prev,
        services: [...prev.services, service],
        newService: "", // Clear the input field
      }));
    }
  };

  const handleServiceInputChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      newService: e.target.value,
    }));
  };

  const handleServiceKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addService();
    }
  };

  const togglePaymentMethod = (method) => {
    setFormData((prev) => {
      const newPayments = prev.acceptedPayments.includes(method)
        ? prev.acceptedPayments.filter((p) => p !== method)
        : [...prev.acceptedPayments, method];
      return {
        ...prev,
        acceptedPayments: newPayments,
      };
    });
  };

  const handleInsuranceChange = (value) => {
    setFormData((prev) => ({
      ...prev,
      providesInsurance: value,
      // Clear insurance number if insurance is set to no
      insuranceNumber: value === "no" ? "" : prev.insuranceNumber,
    }));
  };



  const removeService = (index) => {
    setFormData((prev) => ({
      ...prev,
      services: prev.services.filter((_, i) => i !== index),
    }));
  };

  // Check if step 1 is valid
  const isStep1Valid = () => {
    return (
      formData.firstName.trim() !== "" &&
      formData.lastName.trim() !== "" &&
      formData.businessName.trim() !== "" &&
      formData.businessPhone.trim() !== "" &&
      formData.businessEmail.trim() !== "" &&
      formData.streetAddress.trim() !== "" &&
      formData.city.trim() !== "" &&
      formData.province.trim() !== "" &&
      formData.postalCode.trim() !== "" &&
      formData.logoFile
    );
  };



  // Check if step 3 is valid (password step)
  const isStep3Valid = () => {
    return formData.personalPassword.trim() !== "";
  };

  // Get validation errors for step 1
  const getStep1ValidationErrors = () => {
    const errors = [];
    if (!formData.firstName.trim()) errors.push("First name is required");
    if (!formData.lastName.trim()) errors.push("Last name is required");
    if (!formData.businessName.trim()) errors.push("Business name is required");
    if (!formData.businessPhone.trim())
      errors.push("Business phone is required");
    else if (!isValidPhoneNumber(formData.businessPhone))
      errors.push(
        "Please enter a valid business phone number with country code (e.g., +1234567890)"
      );
    if (!formData.businessEmail.trim())
      errors.push("Business email is required");
    if (!formData.streetAddress.trim())
      errors.push("Street address is required");
    if (!formData.city.trim()) errors.push("City is required");
    if (!formData.province.trim()) errors.push("Province is required");
    if (!formData.postalCode.trim()) errors.push("Postal code is required");
    return errors;
  };

  // Get validation errors for step 2 (removed password requirement)
  const getStep2ValidationErrors = () => {
    const errors = [];
    if (formData.services.length === 0)
      errors.push("At least one service is required");
    if (!formData.businessDescription.trim())
      errors.push("Business description is required");
    if (!formData.personalPhone.trim())
      errors.push("Personal phone is required");
    if (
      formData.personalPhone.trim() &&
      !isValidPhoneNumber(formData.personalPhone)
    )
      errors.push(
        "Please enter a valid phone number with country code (e.g., +1234567890)"
      );
    // Personal email is optional - removed validation
    if (!otpVerified) errors.push("Phone verification is required");

    // Validate insurance number if insurance is provided
    if (
      formData.providesInsurance === "yes" &&
      !formData.insuranceNumber.trim()
    ) {
      errors.push("Insurance number is required when providing insurance");
    }

    return errors;
  };



  // Comprehensive business data validation
  const validateBusinessData = () => {
    const errors = [];
    const fieldErrors = {};

    // Step 1 validations
    if (!formData.firstName.trim()) {
      errors.push("First name is required");
      fieldErrors.firstName = "First name is required";
    }
    if (!formData.lastName.trim()) {
      errors.push("Last name is required");
      fieldErrors.lastName = "Last name is required";
    }
    if (!formData.businessName.trim()) {
      errors.push("Business name is required");
      fieldErrors.businessName = "Business name is required";
    }
    if (!formData.businessPhone.trim()) {
      errors.push("Business phone is required");
      fieldErrors.businessPhone = "Business phone is required";
    } else if (!isValidPhoneNumber(formData.businessPhone)) {
      errors.push(
        "Please enter a valid business phone number with country code (e.g., +1234567890)"
      );
      fieldErrors.businessPhone = "Invalid phone number format";
    }
    if (!formData.businessEmail.trim()) {
      errors.push("Business email is required");
      fieldErrors.businessEmail = "Business email is required";
    } else if (!isValidEmail(formData.businessEmail)) {
      errors.push("Please enter a valid business email address");
      fieldErrors.businessEmail = "Invalid email format";
    }
    if (!formData.streetAddress.trim()) {
      errors.push("Street address is required");
      fieldErrors.streetAddress = "Street address is required";
    }
    if (!formData.city.trim()) {
      errors.push("City is required");
      fieldErrors.city = "City is required";
    }
    if (!formData.province.trim()) {
      errors.push("Province is required");
      fieldErrors.province = "Province is required";
    }
    if (!formData.postalCode.trim()) {
      errors.push("Postal code is required");
      fieldErrors.postalCode = "Postal code is required";
    }

    // Step 2 validations
    if (formData.services.length === 0) {
      errors.push("At least one service is required");
      fieldErrors.services = "At least one service is required";
    }
    if (!formData.businessDescription.trim()) {
      errors.push("Business description is required");
      fieldErrors.businessDescription = "Business description is required";
    }
    if (!formData.personalPhone.trim()) {
      errors.push("Personal phone is required");
      fieldErrors.personalPhone = "Personal phone is required";
    } else if (!isValidPhoneNumber(formData.personalPhone)) {
      errors.push(
        "Please enter a valid personal phone number with country code (e.g., +1234567890)"
      );
      fieldErrors.personalPhone = "Invalid phone number format";
    }
    if (!otpVerified) {
      errors.push("Phone verification is required");
      fieldErrors.otpVerified = "Phone verification is required";
    }

    // Validate insurance number if insurance is provided
    if (
      formData.providesInsurance === "yes" &&
      !formData.insuranceNumber.trim()
    ) {
      errors.push("Insurance number is required when providing insurance");
      fieldErrors.insuranceNumber = "Insurance number is required";
    }

    // Step 3 validations
    if (!formData.personalPassword.trim()) {
      errors.push("Password is required");
      fieldErrors.personalPassword = "Password is required";
    } else if (formData.personalPassword.length < 6) {
      errors.push("Password must be at least 6 characters long");
      fieldErrors.personalPassword = "Password must be at least 6 characters";
    }

    return { errors, fieldErrors };
  };

  // Email validation helper
  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSelectServices = () => {
    const errors = getStep1ValidationErrors();
    if (errors.length > 0) {
      showAlert(
        "error",
        "Missing Information",
        "Please fill in all required fields:\n" + errors.join("\n")
      );
      return;
    }
    setCurrentStep(2);
    // Scroll to top when moving to next step
    window.scrollTo(0, 0);
  };

  const handleProceedToPassword = () => {
    const errors = getStep2ValidationErrors();
    if (errors.length > 0) {
      showAlert(
        "error",
        "Missing Information",
        "Please fill in all required fields:\n" + errors.join("\n")
      );
      return;
    }
    setCurrentStep(3);
    // Scroll to top when moving to next step
    window.scrollTo(0, 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Clear previous field errors
    setFieldErrors({});

    // Comprehensive validation of all business data
    const { errors, fieldErrors: validationFieldErrors } =
      validateBusinessData();

    if (errors.length > 0) {
      // Set field errors for visual feedback
      setFieldErrors(validationFieldErrors);

      // Show error alert with detailed information
      showAlert(
        "error",
        "Validation Errors",
        "Please correct the following errors:\n" + errors.join("\n")
      );

      // Navigate to the first step with errors
      if (
        validationFieldErrors.firstName ||
        validationFieldErrors.lastName ||
        validationFieldErrors.businessName ||
        validationFieldErrors.businessPhone ||
        validationFieldErrors.businessEmail ||
        validationFieldErrors.streetAddress ||
        validationFieldErrors.city ||
        validationFieldErrors.province ||
        validationFieldErrors.postalCode
      ) {
        setCurrentStep(1);
        window.scrollTo(0, 0);
      } else if (
        validationFieldErrors.services ||
        validationFieldErrors.businessDescription ||
        validationFieldErrors.personalPhone ||
        validationFieldErrors.otpVerified ||
        validationFieldErrors.insuranceNumber
      ) {
        setCurrentStep(2);
        window.scrollTo(0, 0);
      } else if (validationFieldErrors.personalPassword) {
        setCurrentStep(3);
        window.scrollTo(0, 0);
      }

      return;
    }

    setIsSubmitting(true);

    try {
      // Create business data from form - mapping to new schema structure
      const businessData = {
        name: formData.businessName,
        category:
          formData.services.length > 0 ? formData.services[0] : "General",
        address: {
          street: formData.streetAddress,
          city: formData.city,
          province: formData.province,
          country: "Canada",
        },
        businessPhone: formData.businessPhone,
        phone: formData.personalPhone, // Use base schema phone field for owner
        email: formData.businessEmail, // Use business email for main contact
        password: formData.personalPassword, // Will be hashed on backend
        website: formData.businessWebsite,
        description: formData.businessDescription,
        services: formData.services,
        logo: logoPreview || null,
        images: imagePreview && imagePreview.length > 0 ? imagePreview : [],

        // Owner details - matches schema
        ownerName: {
          firstName: formData.firstName,
          lastName: formData.lastName,
        },

        // Operating hours - matches schema
        operatingHours: formData.businessHours,
        serviceRadius: formData.serviceRadius,

        // Insurance - matches schema
        insurance: formData.providesInsurance === "yes",
        insuranceNumber: formData.insuranceNumber || null,

        // Payment methods - convert to lowercase to match schema enum
        acceptedPayments: formData.acceptedPayments.map((payment) => {
          const paymentMap = {
            Cash: "cash",
            "Credit Card": "credit",
            "Debit Card": "debit",
            Financing: "financing",
          };
          return paymentMap[payment] || payment.toLowerCase();
        }),

        // Google business link - matches schema
        googleBusinessLink: formData.googleMapsLink,

        // Application status - starts as under_review
        applicationStatus: "under_review",
      };

      // Create user data for business owner (will be updated after business creation)
      const userData = {
        name: `${formData.firstName} ${formData.lastName}`,
        email: formData.businessEmail, // Use business email instead of personal email
        phone: formData.personalPhone,
        role: "business",
      };

      // Submit business registration first (without images)
      console.log("Submitting business data:", businessData);
      const businessResponse = await apiService.post(
        "/businesses",
        businessData
      );

      if (businessResponse.success) {
        // Upload images to Cloudinary after business is created successfully
        let logoUrl = null;
        let workUrls = [];

        if (formData.logoFile) {
          const up = await apiService.uploadFile(
            formData.logoFile,
            formData.businessName
          );
          if (up.success) logoUrl = up.url;
        }

        if (formData.workPhotos && formData.workPhotos.length) {
          for (const f of formData.workPhotos) {
            const up = await apiService.uploadFile(f, formData.businessName);
            if (up.success) workUrls.push(up.url);
          }
        }

        // Update business with image URLs
        if (logoUrl || workUrls.length > 0) {
          const updateData = {};
          if (logoUrl) updateData.logo = logoUrl;
          if (workUrls.length > 0) updateData.images = workUrls;

          await apiService.put(
            `/businesses/${businessResponse.data._id}`,
            updateData
          );
        }

        console.log("Business response:", businessResponse);
        // Update user data with business _id
        userData.businessId = businessResponse.data._id;

        // Submit user registration
        console.log("Submitting user data:", userData);
        try {
          if (
            otpVerified &&
            formData.businessEmail &&
            formData.personalPassword
          ) {
            // Register business user with proper role
            const businessUserResponse = await apiService.registerBusiness({
              name:
                `${formData.firstName} ${formData.lastName}`.trim() ||
                formData.businessName,
              email: formData.businessEmail, // Use business email
              phone: formData.personalPhone,
              password: formData.personalPassword,
              businessData: businessResponse.data._id // Pass business ID to link user to business
            });
            
            if (businessUserResponse.success) {
              // Store user session data
              localStorage.setItem('userId', businessUserResponse.data.id);
              localStorage.setItem('userName', `${formData.firstName} ${formData.lastName}`);
              localStorage.setItem('userEmail', formData.businessEmail);
              localStorage.setItem('userPhone', formData.personalPhone);
              localStorage.setItem('userType', businessUserResponse.data.userType || 'Business');
              localStorage.setItem('businessId', businessResponse.data._id);
            }
          } else {
            // Fallback to admin user creation if business registration fails
            await apiService.post("/admin/users", userData);
          }
          // Registration successful - don't auto-login, just show success message
          showAlert(
            "success",
            "Registration Submitted Successfully!",
            "Your business registration has been submitted and is under review. We have sent a confirmation email to your business email address. You will be notified once your application is approved."
          );
          // Clear session storage after successful submission
          clearSessionStorage();
          // Don't redirect - let user stay on the page or navigate away manually
        } catch (e) {
          showAlert(
            "error",
            "User Profile Error",
            e?.message || "Error creating user profile. Please try again."
          );
        }
      } else {
        // Handle specific error types
        if (
          businessResponse.message === "DUPLICATE_EMAIL" ||
          businessResponse.error === "DUPLICATE_EMAIL" ||
          businessResponse.message?.includes("already exists") ||
          businessResponse.message?.includes("duplicate")
        ) {
          const businessName = businessResponse.existingBusiness
            ? ` (${businessResponse.existingBusiness})`
            : "";

          // Set field error for business email
          setFieldErrors({
            businessEmail:
              "A business with this email address is already registered. Please use a different email address.",
          });

          // Navigate to step 1 where the business email field is located
          setCurrentStep(1);
          window.scrollTo(0, 0);

          showAlert(
            "error",
            "Email Already Registered",
            `A business${businessName} with this email address is already registered. Each business can only register once per email address. Please use a different email address.`
          );
          // Personal email duplicate handling removed - only business email is used
        } else {
          showAlert(
            "error",
            "Registration Error",
            businessResponse.message ||
              "Error registering business. Please try again."
          );
        }
      }
    } catch (error) {
      console.error("Error submitting business registration:", error);

      // Handle network or unexpected errors
      if (
        error.response &&
        error.response.data &&
        (error.response.data.message === "DUPLICATE_EMAIL" ||
          error.response.data.error === "DUPLICATE_EMAIL" ||
          error.response.data.message?.includes("already exists") ||
          error.response.data.message?.includes("duplicate"))
      ) {
        const businessName = error.response.data.existingBusiness
          ? ` (${error.response.data.existingBusiness})`
          : "";

        // Set field error for business email
        setFieldErrors({
          businessEmail:
            "A business with this email address is already registered. Please use a different email address.",
        });

        // Navigate to step 1 where the business email field is located
        setCurrentStep(1);
        window.scrollTo(0, 0);

        showAlert(
          "error",
          "Email Already Registered",
          `A business${businessName} with this email address is already registered. Each business can only register once per email address. Please use a different email address.`
        );
        // Personal email duplicate handling removed - only business email is used
      } else {
        showAlert(
          "error",
          "Network Error",
          "Error submitting registration. Please check your internet connection and try again."
        );
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

        <div className="min-h-screen w-full max-w-7xl mx-auto bg-white">
          <div className="px-4 sm:px-0 py-8 lg:py-[70px]">
            {/* Main Title */}
            <h1 className="text-2xl sm:text-3xl lg:text-[40px] font-semibold text-black font-display mb-8 lg:mb-[56px]">
              Join as bureau expert!
            </h1>

            <form className="space-y-8 lg:space-y-[56px]">
              {/* Your full name section required */}
              <div>
                <p className="text-base lg:text-[18px] font-body text-black mb-4 lg:mb-[22px]">
                  Your Full name <span className="text-red-500">*</span>
                </p>
                <div className="flex flex-col sm:flex-row gap-4 lg:gap-[25px]">
                  <div className="w-full sm:w-[310px]">
                    <div
                      className={`h-[46px] bg-white border rounded-[10px] flex items-center px-[12px] ${
                        fieldErrors.firstName
                          ? "border-red-500"
                          : "border-black"
                      }`}
                    >
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        placeholder="First Name"
                        required
                        className="w-full bg-transparent text-base lg:text-[18px] font-light font-body text-black placeholder-black outline-none"
                      />
                    </div>
                    {fieldErrors.firstName && (
                      <p className="text-red-500 text-sm mt-1">
                        {fieldErrors.firstName}
                      </p>
                    )}
                  </div>
                  <div className="w-full sm:w-[310px]">
                    <div
                      className={`h-[46px] bg-white border rounded-[10px] flex items-center px-[12px] ${
                        fieldErrors.lastName ? "border-red-500" : "border-black"
                      }`}
                    >
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        placeholder="Last Name"
                        required
                        className="w-full bg-transparent text-base lg:text-[18px] font-light font-body text-black placeholder-black outline-none"
                      />
                    </div>
                    {fieldErrors.lastName && (
                      <p className="text-red-500 text-sm mt-1">
                        {fieldErrors.lastName}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Your Business Details */}
              <div>
                <h2 className="text-2xl sm:text-3xl lg:text-[40px] font-semibold text-black font-display mb-8 lg:mb-[56px]">
                  Your Business Details
                </h2>

                {/* Full Business Name */}
                <div className="mb-4 lg:mb-[22px]">
                  <p className="text-base lg:text-[18px] font-roboto text-black mb-4 lg:mb-[22px]">
                    Full Business Name <span className="text-red-500">*</span>
                  </p>
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
                  <p className="text-base lg:text-[18px] font-roboto text-black mb-4 lg:mb-[22px]">
                    Business's Contact Details{" "}
                    <span className="text-red-500">*</span>
                  </p>
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
                  <p className="text-base lg:text-[18px] font-roboto text-black mb-4 lg:mb-[22px]">
                    Business Address <span className="text-red-500">*</span>
                  </p>
                  <div className="w-full max-w-[645px] h-[46px] bg-white border border-black rounded-[10px] flex items-center px-[12px] mb-4 lg:mb-[22px]">
                    <input
                      type="text"
                      name="businessAddress"
                      value={formData.businessAddress}
                      onChange={handleInputChange}
                      placeholder="Enter Business Address"
                      required
                      className="w-full bg-transparent text-base lg:text-[18px] font-light font-roboto text-black placeholder-black outline-none"
                    />
                  </div>

                  <p className="text-base lg:text-[18px] font-roboto text-black mb-4 lg:mb-[22px]">
                    Street Address <span className="text-red-500">*</span>
                  </p>
                  <div className="w-full max-w-[645px] h-[46px] bg-white border border-black rounded-[10px] flex items-center px-[12px] mb-8 lg:mb-[56px]">
                    <input
                      type="text"
                      name="streetAddress"
                      value={formData.streetAddress}
                      onChange={handleInputChange}
                      placeholder="Enter Street Address"
                      className="w-full bg-transparent text-base lg:text-[18px] font-light font-roboto text-black placeholder-black outline-none"
                      required
                    />
                  </div>

                  {/* City and Province */}
                  <div className="flex flex-col sm:flex-row gap-4 lg:gap-[25px] mb-4 lg:mb-[22px]">
                    <div className="w-full sm:w-[310px]">
                      <p className="text-base lg:text-[18px] font-roboto text-black mb-4 lg:mb-[22px]">
                        City
                      </p>
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
                      <p className="text-base lg:text-[18px] font-roboto text-black mb-4 lg:mb-[22px]">
                        Province
                      </p>
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
                      <p className="text-base lg:text-[18px] font-roboto text-black mb-4 lg:mb-[22px]">
                        Country
                      </p>
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
                      <p className="text-base lg:text-[18px] font-roboto text-black mb-4 lg:mb-[22px]">
                        Postal Code
                      </p>
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

                {/* Upload business logo required */}
                <div className="mb-8 lg:mb-[56px]">
                  <p className="text-base lg:text-[18px] font-roboto text-black mb-4 lg:mb-[22px]">
                    Upload business logo <span className="text-red-500">*</span>
                  </p>
                  <div className="w-full max-w-[650px] h-[400px] bg-[#F3F3F3] rounded-[10px] relative overflow-hidden border-2 border-dashed border-gray-400 hover:border-gray-600 transition-colors">
                    <label
                      htmlFor="logoFile"
                      className="cursor-pointer w-full h-full flex items-center justify-center"
                    >
                      <input
                        type="file"
                        id="logoFile"
                        name="logoFile"
                        onChange={handleInputChange}
                        accept="image/*"
                        className="hidden"
                        required
                      />
                      {logoPreview ? (
                        <div className="w-full h-full relative group">
                          <img
                            src={logoPreview}
                            alt="Logo Preview"
                            className="w-full h-full object-cover rounded-lg"
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-200 flex items-center justify-center">
                            <span className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 font-medium">
                              Click to change logo
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center">
                          <svg
                            className="mx-auto h-12 w-12 text-gray-400 mb-4"
                            stroke="currentColor"
                            fill="none"
                            viewBox="0 0 48 48"
                          >
                            <path
                              d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                          <span className="text-lg lg:text-[25px] font-extralight font-roboto text-black/50">
                            Drop your logo here or click to browse
                          </span>
                        </div>
                      )}
                    </label>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <button
                    type="button"
                    onClick={handleSelectServices}
                    disabled={!isStep1Valid()}
                    className={`w-full sm:w-[235px] h-[46px] rounded-[10px] flex items-center justify-center ${
                      isStep1Valid()
                        ? "bg-[#AF2638] hover:bg-red-700"
                        : "bg-gray-400 cursor-not-allowed"
                    }`}
                  >
                    <span className="text-base lg:text-[18px] font-semibold font-roboto text-white">
                      Next Page
                    </span>
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
  if (currentStep === 2) {
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

        {/* Loading Overlay */}
        {isTransitioning && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 flex flex-col items-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#AF2638] mb-4"></div>
              <p className="text-lg font-semibold text-gray-700">
                Moving to next step...
              </p>
            </div>
          </div>
        )}

        <div className="min-h-screen w-full max-w-7xl mx-auto bg-white">
          <div className="px-4 sm:px-0 py-8 lg:py-[70px]">
            {/* Main Title */}
            <h1 className="text-2xl sm:text-3xl lg:text-[40px] font-semibold text-black font-roboto mb-8 lg:mb-[56px]">
              Select services your provide and details
            </h1>

            <form
              onSubmit={handleSubmit}
              className="space-y-8 lg:space-y-[56px]"
            >
              {/* Add your services */}
              <div>
                <p className="text-base lg:text-[18px] font-roboto text-black mb-4 lg:mb-[22px]">
                  Add the services that you provide{" "}
                  <span className="text-red-500">*</span>
                </p>

                {/* Service Input */}
                <div className="mb-4">
                  <p className="text-sm font-roboto text-gray-600 mb-2">
                    Enter your services:
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="flex-1">
                      <input
                        type="text"
                        name="newService"
                        value={formData.newService}
                        onChange={handleServiceInputChange}
                        onKeyPress={handleServiceKeyPress}
                        placeholder="e.g., HVAC Repair, Plumbing, Electrical Work"
                        className="w-full h-[46px] bg-white border border-black rounded-[10px] px-[12px] text-base lg:text-[18px] font-light font-roboto text-black placeholder-black/50 outline-none"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={addService}
                      disabled={!formData.newService.trim()}
                      className={`px-6 py-2 rounded-[10px] text-sm font-roboto transition-colors ${
                        !formData.newService.trim()
                          ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                          : "bg-blue-600 text-white hover:bg-blue-700 cursor-pointer"
                      }`}
                    >
                      Add Service
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Press Enter or click "Add Service" to add each service
                  </p>
                </div>

                {/* Selected Services */}
                <div className="w-full max-w-[650px] min-h-[177px] bg-white border border-black rounded-[10px] p-[14px]">
                  {formData.services.length === 0 ? (
                    <div className="flex items-center justify-center h-[140px] text-gray-500 text-center">
                      <p>
                        No services added yet. Enter your services above and
                        click "Add Service".
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-3 lg:gap-[20px]">
                      {formData.services.map((service, index) => (
                        <div
                          key={index}
                          className="min-w-[100px] h-[41px] bg-[#E5E5E5] rounded-[2px] flex items-center justify-between px-3 lg:px-[18px]"
                        >
                          <span className="text-sm lg:text-[18px] font-roboto text-black leading-[27px]">
                            {service}
                          </span>
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
                <h2 className="text-2xl sm:text-3xl lg:text-[40px] font-semibold text-black font-roboto mb-8 lg:mb-[56px]">
                  Additional Business Details
                </h2>

                {/* Business website (optional) */}
                <div className="mb-8 lg:mb-[56px]">
                  <p className="text-base lg:text-[18px] font-roboto text-black mb-4 lg:mb-[22px]">
                    Business website (optional)
                  </p>
                  <div className="w-full max-w-[645px] h-[46px] bg-white border border-black rounded-[10px] flex items-center px-[12px]">
                    <input
                      type="url"
                      name="businessWebsite"
                      value={formData.businessWebsite}
                      onChange={handleInputChange}
                      placeholder="www.yourbusinesswebsite.com"
                      className="w-full bg-transparent text-base lg:text-[18px] font-light font-roboto text-black placeholder-black outline-none"
                    />
                  </div>
                </div>

                {/* Business description */}
                <div className="mb-8 lg:mb-[56px]">
                  <p className="text-base lg:text-[18px] font-roboto text-black mb-4 lg:mb-[22px]">
                    Business description <span className="text-red-500">*</span>
                  </p>
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
                  <p className="text-base lg:text-[18px] font-roboto text-black mb-4 lg:mb-[22px]">
                    Add some picture of previous work you have done (optional)
                  </p>

                  {/* Image Previews - Displayed above the upload container */}
                  {imagePreview.length > 0 && (
                    <div className="mb-4">
                      <div className="flex flex-wrap gap-2 sm:gap-3">
                        {imagePreview.map((src, index) => (
                          <div
                            key={index}
                            className="relative w-16 h-16 sm:w-20 sm:h-20 bg-white border border-gray-300 rounded-lg overflow-hidden group"
                          >
                            <img
                              src={src}
                              alt={`Work Photo ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-200 flex items-center justify-center">
                              <button
                                type="button"
                                onClick={() => removeWorkPhoto(index)}
                                className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 w-5 h-5 sm:w-6 sm:h-6 bg-red-500 text-white rounded-full text-xs hover:bg-red-600 flex items-center justify-center"
                              >
                                ×
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Upload Container */}
                  <div className="w-full max-w-[650px] h-[120px] sm:h-[140px] bg-[#F3F3F3] rounded-[10px] relative overflow-hidden border-2 border-dashed border-gray-400 hover:border-gray-600 transition-colors">
                    <label
                      htmlFor="workPhotos"
                      className="cursor-pointer w-full h-full flex items-center justify-center"
                    >
                      <input
                        type="file"
                        id="workPhotos"
                        name="workPhotos"
                        onChange={handleInputChange}
                        accept="image/*"
                        multiple
                        className="hidden"
                      />

                      <div className="text-center">
                        <svg
                          className="mx-auto h-8 w-8 sm:h-10 sm:w-10 text-gray-400 mb-2 sm:mb-3"
                          stroke="currentColor"
                          fill="none"
                          viewBox="0 0 48 48"
                        >
                          <path
                            d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        <span className="text-sm sm:text-base lg:text-lg font-extralight font-roboto text-black/50">
                          {imagePreview.length > 0
                            ? "Click to add more photos"
                            : "Drop your work photos here or click to browse"}
                        </span>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Operating business hours */}
                <div className="mb-8 lg:mb-[56px]">
                  <p className="text-base lg:text-[18px] font-roboto text-black mb-4 lg:mb-[22px]">
                    Operating business hours
                  </p>

                  {Object.entries(formData.businessHours).map(
                    ([day, hours]) => (
                      <div
                        key={day}
                        className="flex flex-col sm:flex-row items-start sm:items-center gap-3 lg:gap-[19px] mb-3 lg:mb-[14px]"
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-24 text-sm lg:text-[16px] font-medium text-black capitalize">
                            {day}:
                          </span>
                          <select
                            name={`businessHours.${day}.start`}
                            value={hours.start}
                            onChange={handleInputChange}
                            disabled={hours.closed}
                            className="w-[100px] lg:w-[126px] h-[46px] bg-white border border-black rounded-[10px] px-[13px] text-sm lg:text-[16px] font-light font-roboto text-black disabled:bg-gray-100"
                          >
                            {[
                              "6:00 AM",
                              "7:00 AM",
                              "8:00 AM",
                              "9:00 AM",
                              "10:00 AM",
                            ].map((time) => (
                              <option key={time} value={time}>
                                {time}
                              </option>
                            ))}
                          </select>
                          <span className="text-base lg:text-[18px] font-light font-roboto text-black">
                            -
                          </span>
                          <select
                            name={`businessHours.${day}.end`}
                            value={hours.end}
                            onChange={handleInputChange}
                            disabled={hours.closed}
                            className="w-[100px] lg:w-[126px] h-[46px] bg-white border border-black rounded-[10px] px-[13px] text-sm lg:text-[16px] font-light font-roboto text-black disabled:bg-gray-100"
                          >
                            {[
                              "5:00 PM",
                              "6:00 PM",
                              "7:00 PM",
                              "8:00 PM",
                              "9:00 PM",
                              "10:00 PM",
                            ].map((time) => (
                              <option key={time} value={time}>
                                {time}
                              </option>
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
                          <span className="text-sm lg:text-[18px] font-light font-roboto text-black">
                            Closed?
                          </span>
                        </label>
                      </div>
                    )
                  )}
                </div>

                {/* Service radius */}
                <div className="mb-8 lg:mb-[56px]">
                  <p className="text-base lg:text-[18px] font-roboto text-black mb-4 lg:mb-[22px]">
                    Service radius
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 lg:gap-[12px]">
                    <div className="w-full sm:w-[355px] h-[46px] bg-white border border-black rounded-[10px] flex items-center px-[13px]">
                      <input
                        type="text"
                        name="serviceRadius.city"
                        value={formData.serviceRadius.city}
                        onChange={handleInputChange}
                        placeholder="Enter your service city"
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
                  <p className="text-base lg:text-[18px] font-roboto text-black mb-4 lg:mb-[22px]">
                    Do you provide insurance/warranty on your services?
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 lg:gap-[56px] mb-4 lg:mb-[22px]">
                    <label className="flex items-center gap-3 lg:gap-[14px] cursor-pointer">
                      <input
                        type="radio"
                        name="providesInsurance"
                        value="yes"
                        checked={formData.providesInsurance === "yes"}
                        onChange={(e) => handleInsuranceChange(e.target.value)}
                        className="w-[20px] h-[20px] text-[#AF2638] focus:ring-[#AF2638]"
                      />
                      <span className="text-sm lg:text-[18px] font-light font-roboto text-black">
                        Yes, we do provide insurance/warranty
                      </span>
                    </label>
                    <label className="flex items-center gap-3 lg:gap-[14px] cursor-pointer">
                      <input
                        type="radio"
                        name="providesInsurance"
                        value="no"
                        checked={formData.providesInsurance === "no"}
                        onChange={(e) => handleInsuranceChange(e.target.value)}
                        className="w-[20px] h-[20px] text-[#AF2638] focus:ring-[#AF2638]"
                      />
                      <span className="text-sm lg:text-[18px] font-light font-roboto text-black">
                        No, we don't provide it
                      </span>
                    </label>
                  </div>

                  {formData.providesInsurance === "yes" && (
                    <>
                      <p className="text-base lg:text-[18px] font-roboto text-black mb-4 lg:mb-[22px]">
                        Insurance number <span className="text-red-500">*</span>
                      </p>
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
                    </>
                  )}
                </div>

                {/* Payment methods */}
                <div className="mb-8 lg:mb-[56px]">
                  <p className="text-base lg:text-[18px] font-roboto text-black mb-4 lg:mb-[22px]">
                    Payment methods you accept (select all that applies)
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:flex lg:gap-[66px] gap-4">
                    {["Cash", "Debit Card", "Credit Card", "Financing"].map(
                      (method) => {
                        const isChecked = formData.acceptedPayments.includes(method);
                        return (
                          <label
                            key={method}
                            className="flex items-center gap-2 lg:gap-[7px] cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => togglePaymentMethod(method)}
                              className="w-[20px] h-[20px] text-[#AF2638] focus:ring-[#AF2638] rounded"
                            />
                            <span className="text-base lg:text-[18px] font-light font-roboto text-black">
                              {method}
                            </span>
                          </label>
                        );
                      }
                    )}
                  </div>
                </div>

                {/* Google maps profile */}
                <div className="mb-8 lg:mb-[56px]">
                  <p className="text-base lg:text-[18px] font-roboto text-black mb-4 lg:mb-[22px]">
                    Enable your google reviews. Please share your Google profile
                    link from maps.
                  </p>
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
                {/* Your Contact Details */}
                <div>
                  <p className="text-base lg:text-[18px] font-roboto text-black mb-4 lg:mb-[22px]">
                    Your Contact Details
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 lg:gap-[25px]">
                    <div
                      className={`w-full sm:w-[310px] h-[46px] bg-white border rounded-[10px] flex items-center px-[12px] ${
                        formData.personalPhone &&
                        !isValidPhoneNumber(formData.personalPhone)
                          ? "border-red-500"
                          : "border-black"
                      }`}
                    >
                      <input
                        type="tel"
                        name="personalPhone"
                        value={formData.personalPhone}
                        onChange={handleInputChange}
                        placeholder="+1234567890"
                        className="w-full bg-transparent text-base lg:text-[18px] font-light font-roboto text-black placeholder-black outline-none"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={handleSendOtp}
                      disabled={
                        isSendingCode ||
                        resendRemainingMs > 0 ||
                        !isValidPhoneNumber(formData.personalPhone)
                      }
                      className={`px-3 py-2 rounded-md w-full sm:w-[200px] h-[46px] bg-[#213a59] text-white ${
                        resendRemainingMs > 0 ||
                        ((!isValidPhoneNumber(formData.personalPhone) ||
                          formData.personalPhone === "") &&
                          resendRemainingMs > 0)
                          ? "cursor-not-allowed"
                          : ""
                      }`}
                    >
                      {resendRemainingMs > 0
                        ? `Resend in ${formatSeconds(resendRemainingMs)}s`
                        : !isValidPhoneNumber(formData.personalPhone) &&
                          formData.personalPhone
                        ? "Invalid Phone"
                        : "Send OTP"}
                    </button>
                  </div>

                  {formData.personalPhone &&
                    !isValidPhoneNumber(formData.personalPhone) && (
                      <div className="w-full sm:w-[310px] text-red-500 text-sm mt-1">
                        Please enter a valid phone number with country code
                        (e.g., +1234567890)
                      </div>
                    )}

                  {/* OTP + Password */}
                  {otpSentToPhone === formData.personalPhone &&
                    otpSentToPhone !== "" && (
                      <div className="mt-3 mb-3 space-y-3">
                        <div className="flex flex-col sm:flex-row gap-2">
                          <div className="w-full sm:w-[310px] h-[46px] bg-white border border-black rounded-[10px] flex items-center px-[12px]">
                            <input
                              type="text"
                              name="verificationCode"
                              value={formData.verificationCode}
                              onChange={handleInputChange}
                              placeholder="OTP Code"
                              className="w-full bg-transparent text-base lg:text-[18px] font-light font-roboto text-black placeholder-black outline-none"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={handleVerifyOtp}
                            disabled={isVerifying}
                            className={`px-3 py-2 rounded-md text-white ${
                              isVerifying
                                ? "bg-gray-400"
                                : "bg-[#AF2638] hover:bg-red-700"
                            }`}
                          >
                            Verify
                          </button>
                        </div>
                      </div>
                    )}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 mt-10">
                  <button
                    type="button"
                    onClick={() => {
                      setCurrentStep(1);
                      window.scrollTo(0, 0);
                    }}
                    className="w-full sm:w-[200px] h-[46px] rounded-[10px] flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <span className="text-base lg:text-[18px] font-semibold font-roboto">
                      Previous Page
                    </span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </>
    );
  }

  // Step 3 - Password Entry Form
  if (currentStep === 3) {
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

        <div className="min-h-screen w-full max-w-7xl mx-auto bg-white">
          <div className="px-4 sm:px-0 py-8 lg:py-[70px]">
            {/* Main Title */}
            <h1 className="text-2xl sm:text-3xl lg:text-[40px] font-semibold text-black font-roboto mb-8 lg:mb-[56px]">
              Set your password
            </h1>

            <form
              onSubmit={handleSubmit}
              className="space-y-8 lg:space-y-[56px]"
            >
              {/* Password Input */}
              <div>
                <p className="text-base lg:text-[18px] font-roboto text-black mb-4 lg:mb-[22px]">
                  Set your password <span className="text-red-500">*</span>
                </p>
                <div className="w-full max-w-[645px] h-[46px] bg-white border border-black rounded-[10px] flex items-center px-[12px]">
                  <input
                    type="password"
                    name="personalPassword"
                    value={formData.personalPassword}
                    onChange={handleInputChange}
                    placeholder="Set Password"
                    className="w-full bg-transparent text-base lg:text-[18px] font-light font-roboto text-black placeholder-black outline-none"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 mt-10">
                <button
                  type="button"
                  onClick={() => {
                    setCurrentStep(2);
                    window.scrollTo(0, 0);
                  }}
                  className="w-full sm:w-[200px] h-[46px] rounded-[10px] flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <span className="text-base lg:text-[18px] font-semibold font-roboto">
                    Previous Page
                  </span>
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting || !isStep3Valid()}
                  className={`w-full sm:w-[235px] h-[46px] rounded-[10px] flex items-center justify-center ${
                    isSubmitting || !isStep3Valid()
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-[#AF2638] hover:bg-red-700"
                  }`}
                >
                  <span className="text-base lg:text-[18px] font-semibold font-roboto text-white">
                    {isSubmitting ? "Submitting..." : "Submit Your Details"}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </>
    );
  }
};

export default BusinessPosting;

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { generateAndSendOtp, verifyOtp, clearOtp, getResendRemainingMs, formatSeconds } from '../services/otp';
import { showSuccess, showError, showWarning, showInfo } from '../utils/alert';

const ExpertContactForm = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1 = initial form, 2 = verification
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [resendRemainingMs, setResendRemainingMs] = useState(0);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    verificationCode: '',
    password: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSendVerification = (e) => {
    e.preventDefault();
    if (!formData.phone) {
              showWarning('Please enter your phone number.', 'Missing Information');
      return;
    }
    try {
      setIsSendingCode(true);
      const { code } = generateAndSendOtp(formData.phone);
      // Also log directly for clarity (the service logs too)
      // eslint-disable-next-line no-console
      console.log('[OTP] Sent code:', code);
              showSuccess('Verification code sent to your phone number!', 'Code Sent');
      setStep(2);
      setResendRemainingMs(getResendRemainingMs(formData.phone));
    } catch (err) {
      showError('Failed to send verification code. Please try again.', 'Send Failed');
    } finally {
      setIsSendingCode(false);
    }
  };

  const handleVerifyOtp = () => {
    if (!formData.phone || !formData.verificationCode) {
              showWarning('Enter the verification code.', 'Missing Code');
      return;
    }
    setIsVerifying(true);
    const result = verifyOtp(formData.phone, formData.verificationCode);
    if (result.ok) {
      setOtpVerified(true);
      clearOtp(formData.phone);
              showSuccess('Phone verified! Please set your password.', 'Verification Success');
    } else {
      const reason = result.reason === 'EXPIRED' ? 'Code expired.' : result.reason === 'MISMATCH' ? 'Incorrect code.' : 'Invalid code.';
      showError(reason, 'Verification Failed');
    }
    setIsVerifying(false);
  };

  useEffect(() => {
    if (step !== 2) return;
    const t = setInterval(() => {
      setResendRemainingMs(getResendRemainingMs(formData.phone));
    }, 1000);
    return () => clearInterval(t);
  }, [step, formData.phone]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!otpVerified) {
              showWarning('Please verify the OTP first.', 'Verification Required');
      return;
    }
    try {
      // Retrieve draft job saved from JobPosting
      const draft = localStorage.getItem('draftJob');
      const draftJob = draft ? JSON.parse(draft) : null;
      if (!draftJob) {
                  showError('Your job details were not found. Please start again.', 'Missing Job Details');
        navigate('/job');
        return;
      }

      // 1) Register customer (or update) with hashed password in backend
      const api = (await import('../services/api')).default;
      const regRes = await api.registerCustomer({
        name: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
      });
      if (!regRes.success) {
                  showError(regRes.message || 'Error creating account', 'Registration Failed');
        return;
      }

      // 2) Build final payload including contact info
      const jobData = {
        ...draftJob,
        customerInfo: {
          name: formData.fullName,
          email: formData.email,
          phone: formData.phone
        }
      };

      // Persist user session (basic)
      localStorage.setItem('userId', `user_${Date.now()}`);
      localStorage.setItem('userName', formData.fullName);
      localStorage.setItem('userEmail', formData.email);
      localStorage.setItem('userPhone', formData.phone);
      localStorage.setItem('userType', 'customer');

      // 3) Post job now
      const response = await api.post('/jobs', jobData);

      if (response.success) {
        showSuccess('Job posted successfully! You will be contacted by verified experts soon. We are now showing you relevant technicians for your job.', 'Job Posted Successfully');
        // Cleanup draft
        localStorage.removeItem('draftJob');
        
        // Redirect to listing page with search filters based on job requirements
        const searchParams = new URLSearchParams({
          job: draftJob.service || '',
          city: draftJob.city || ''
        });
        
        navigate(`/?${searchParams.toString()}`);
      } else {
        showError('Error posting job: ' + (response.message || 'Unknown error'), 'Job Posting Failed');
      }
    } catch (err) {
      console.error('Error completing job posting:', err);
      showError('Error submitting registration. Please try again.', 'Submission Error');
    }
  };

  return (
    <div className="min-h-screen w-full max-w-[1500px] mx-auto bg-white">
      <div className="px-4 sm:px-8 md:px-16 lg:px-[199px] py-8 lg:py-[70px]">
        {/* Main Title */}
        <h1 className="text-2xl sm:text-3xl lg:text-[40px] font-semibold text-black font-roboto mb-8 lg:mb-[56px]">
          How should expert contact you?
        </h1>

        <form onSubmit={step === 1 ? handleSendVerification : handleSubmit} className="space-y-8 lg:space-y-[56px]">
          {/* Full Name */}
          <div>
            <p className="text-base lg:text-[18px] font-roboto text-black mb-4 lg:mb-[22px]">Your full name</p>
            <div className="w-full max-w-[650px] h-[46px] bg-white border border-black rounded-[10px] flex items-center px-[12px]">
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                placeholder="E.g. John Doe"
                className="w-full bg-transparent text-base lg:text-[18px] font-light font-roboto text-black placeholder-black outline-none"
                required
              />
            </div>
          </div>

          {/* Email Address */}
          <div>
            <p className="text-base lg:text-[18px] font-roboto text-black mb-4 lg:mb-[22px]">Your preferred email address?</p>
            <div className="w-full max-w-[650px] h-[46px] bg-white border border-black rounded-[10px] flex items-center px-[12px]">
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="E.g. johndoe@gmail.com"
                className="w-full bg-transparent text-base lg:text-[18px] font-light font-roboto text-black placeholder-black outline-none"
                required
              />
            </div>
          </div>

          {/* Phone Number */}
          <div>
            <p className="text-base lg:text-[18px] font-roboto text-black mb-4 lg:mb-[22px]">Your preferred phone number?</p>
            <div className="w-full max-w-[650px] h-[46px] bg-white border border-black rounded-[10px] flex items-center px-[12px]">
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="E.g. +1(234) 567-8910"
                className="w-full bg-transparent text-base lg:text-[18px] font-light font-roboto text-black placeholder-black outline-none"
                required
              />
            </div>
          </div>

          {/* Send Verification Code Button (Step 1) */}
          {step === 1 && (
            <div>
              <button
                type="submit"
                className="w-full sm:w-[235px] h-[46px] bg-[#AF2638] rounded-[10px] flex items-center justify-center"
              >
                <span className="text-base lg:text-[18px] font-semibold font-roboto text-white">Send Verification Code</span>
              </button>
            </div>
          )}

          {/* Verification Code (Step 2) */}
          {step === 2 && (
            <>
              <div>
                <p className="text-base lg:text-[18px] font-roboto text-black mb-4 lg:mb-[22px]">
          Enter one-time verification code sent on your phone number.
                </p>
                <div className="w-full max-w-[650px] h-[46px] bg-white border border-black rounded-[10px] flex items-center px-[12px]">
                  <input
                    type="text"
                    name="verificationCode"
                    value={formData.verificationCode}
                    onChange={handleInputChange}
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
            className={`px-4 py-2 rounded-md text-white ${isVerifying ? 'bg-gray-400' : 'bg-[#AF2638] hover:bg-red-700'}`}
          >
            {isVerifying ? 'Verifying...' : 'Verify Code'}
          </button>
          <button
            type="button"
            onClick={handleSendVerification}
            disabled={isSendingCode || resendRemainingMs > 0}
            className={`px-4 py-2 rounded-md border ${resendRemainingMs > 0 ? 'text-gray-400 border-gray-300' : 'text-[#AF2638] border-[#AF2638]'}`}
          >
            {resendRemainingMs > 0 ? `Resend in ${formatSeconds(resendRemainingMs)}s` : 'Resend Code'}
          </button>
        </div>
              </div>

              {/* Password (shown only after OTP verified) */}
              {otpVerified && (
              <div>
                <p className="text-base lg:text-[18px] font-roboto text-black mb-4 lg:mb-[22px]">
                  Choose a new password for your HSB account.
                </p>
                <div className="w-full max-w-[650px] h-[46px] bg-white border border-black rounded-[10px] flex items-center px-[12px]">
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="E.g. password"
                    className="w-full bg-transparent text-base lg:text-[18px] font-light font-roboto text-black placeholder-black outline-none"
                    required
                  />
                </div>
              </div>
              )}

              {/* Submit Button (enabled after OTP verified) */}
              {otpVerified && (
                <div>
                  <button
                    type="submit"
                    className="w-full sm:w-[235px] h-[46px] bg-[#AF2638] rounded-[10px] flex items-center justify-center"
                  >
                    <span className="text-base lg:text-[18px] font-semibold font-roboto text-white">Find Verified Experts</span>
                  </button>
                </div>
              )}

              {/* Terms and Privacy */}
              <div className="max-w-[808px]">
                <p className="text-base lg:text-[18px] font-roboto text-black leading-relaxed">
                  By clicking 'Find Verified Experts', you acknowledge and agree to our{' '}
                  <span className="underline cursor-pointer">Terms of Use</span> and{' '}
                  <span className="underline cursor-pointer">Privacy Policy</span>.
                </p>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
};

export default ExpertContactForm; 
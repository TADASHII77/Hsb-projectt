import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ExpertContactForm = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1 = initial form, 2 = verification
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
    console.log('Sending verification code to:', formData.phone);
    alert('Verification code sent to your phone number!');
    setStep(2);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Contact form submitted:', formData);
    alert('Successfully registered! You will be contacted by verified experts.');
    navigate('/');
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
              </div>

              {/* Password */}
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

              {/* Submit Button */}
              <div>
                <button
                  type="submit"
                  className="w-full sm:w-[235px] h-[46px] bg-[#AF2638] rounded-[10px] flex items-center justify-center"
                >
                  <span className="text-base lg:text-[18px] font-semibold font-roboto text-white">Find Verified Experts</span>
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
            </>
          )}
        </form>
      </div>
    </div>
  );
};

export default ExpertContactForm; 
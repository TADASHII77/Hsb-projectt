import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiService from '../services/api';

const JobPosting = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    service: '',
    postalCode: '',
    city: '',
    description: '',
    startTime: '',
    budget: '',
    images: null,
    customerInfo: {
      name: '',
      email: '',
      phone: ''
    }
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e) => {
    const { name, value, type, files } = e.target;
    
    if (name.startsWith('customerInfo.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        customerInfo: {
          ...prev.customerInfo,
          [field]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'file' ? files[0] : value
      }));
    }
  };

  // Proceed to contact step page
  const handleContinue = () => {
    if (!formData.service || !formData.postalCode || !formData.city || !formData.description) {
      alert('Please fill in service, postal code, city, and description to continue.');
      return;
    }
    // Persist draft job details for next screen
    localStorage.setItem('draftJob', JSON.stringify({
      service: formData.service,
      postalCode: formData.postalCode,
      city: formData.city,
      description: formData.description,
      startTime: formData.startTime,
      budget: formData.budget,
      images: formData.images ? [formData.images.name] : []
    }));
    navigate('/expert-contact');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleContinue();
  };

  return (
    <div className="min-h-screen bg-white">
  
      {/* Main Content */}
      <main className="px-5 md:px-[199px] py-6 md:py-[70px]">
        {/* Title */}
        <h1 className="text-2xl md:text-[40px] font-semibold text-black font-roboto mb-6 md:mb-[56px]">What is your job?</h1>
        
        {/* Subtitle */}
        <p className="text-base md:text-[18px] font-roboto text-black mb-4 md:mb-[22px]">Search for a service to find Bureau Verified Experts near you</p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6 md:space-y-[56px]">
          {/* Service Input */}
          <div>
            <div className="w-full md:w-[650px] h-[46px] bg-white border border-black rounded-[10px] flex items-center px-[12px]">
              <input
                type="text"
                name="service"
                value={formData.service}
                onChange={handleInputChange}
                placeholder="E.g. Install Heat Pump"
                className="w-full bg-transparent text-base md:text-[18px] font-light font-roboto text-black placeholder-black outline-none"
                required
              />
            </div>
          </div>

          {/* Location Section */}
          <div>
            <p className="text-base md:text-[18px] font-roboto text-black mb-4 md:mb-[22px]">What is the city and postal code where this service is needed?</p>
            
            <div className="flex flex-col md:flex-row gap-4 md:gap-[25px]">
              {/* Postal Code */}
              <div className="w-full md:w-[310px] h-[46px] bg-white border border-black rounded-[10px] flex items-center px-[12px]">
                <input
                  type="text"
                  name="postalCode"
                  value={formData.postalCode}
                  onChange={handleInputChange}
                  placeholder="E.g. M9X 2AB"
                  className="w-full bg-transparent text-base md:text-[18px] font-light font-roboto text-black placeholder-black outline-none"
                  required
                />
              </div>

              {/* City */}
              <div className="w-full md:w-[310px] h-[46px] bg-white border border-black rounded-[10px] flex items-center px-[12px]">
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  placeholder="E.g. Delhi"
                  className="w-full bg-transparent text-base md:text-[18px] font-light font-roboto text-black placeholder-black outline-none"
                  required
                />
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <p className="text-base md:text-[18px] font-roboto text-black mb-4 md:mb-[22px]">Please describe what needs to done in detail.</p>
            
            <div className="w-full md:w-[650px] h-[177px] bg-white border border-black rounded-[10px] p-[11px]">
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="E.g. I want to upgrade to a heat pump this summer to control my electricity bill. I have 4 bedroom, and house is 1,500 sq ft."
                className="w-full h-full bg-transparent text-base md:text-[18px] font-light font-roboto text-black placeholder-black outline-none resize-none leading-6 md:leading-[27px]"
                required
              />
            </div>
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
                  value={formData.startTime}
                  onChange={handleInputChange}
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
                  value={formData.budget}
                  onChange={handleInputChange}
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
                  onChange={handleInputChange}
                  accept="image/*"
                  className="hidden"
                  multiple
                />
                <span className="text-lg md:text-[25px] font-extralight font-roboto text-black/50">Drop your files here</span>
              </label>
            </div>
          </div>

          {/* Contact info moved to ExpertContactForm */}

          {/* Continue Button */}
          <div className="pt-6 md:pt-[35px]">
            <button
              type="button"
              onClick={handleContinue}
              disabled={isSubmitting}
              className={`w-full md:w-[235px] h-[46px] rounded-[10px] flex items-center justify-center ${
                isSubmitting 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-[#AF2638] hover:bg-red-700'
              }`}
            >
              <span className="text-base md:text-[18px] font-semibold font-roboto text-white">Continue</span>
            </button>
          </div>
        </form>
      </main>

      {/* Why Post Section */}
      <section className="px-4 md:px-[199px] py-8 md:py-[70px] bg-white">
        <h2 className="text-2xl md:text-[40px] font-semibold text-black font-roboto mb-8 md:mb-[89px] text-center md:text-left">Why Post a Job on Home Service Bureau?</h2>
        
        <div className="flex flex-col md:flex-row gap-6 md:gap-[35px]">
          {/* It's Free to Post */}
          <div className="w-full md:w-[344px] h-auto md:h-[278px] bg-white rounded-[15px] shadow-[3px_5px_13px_3px_rgba(0,0,0,0.25)] p-6 md:p-[34px] flex flex-col">
            <div className="w-[54px] h-[54px] mx-auto mb-4 md:mb-[15px] flex items-center justify-center">
            <svg width="54" height="54" viewBox="0 0 54 54" fill="none" xmlns="http://www.w3.org/2000/svg">
<g clip-path="url(#clip0_64_444)">
<path d="M43.7211 5.41248e-08H29.061C26.3348 5.41248e-08 23.7203 1.08296 21.7926 3.01064C19.8649 4.93833 18.782 7.55283 18.782 10.279V16.1958H24.9392C28.3508 16.1991 31.6217 17.5559 34.034 19.9682C36.4464 22.3805 37.8031 25.6514 37.8064 29.063V35.2202H43.7232C45.0731 35.22 46.4097 34.9538 47.6567 34.437C48.9037 33.9202 50.0367 33.1628 50.991 32.2081C51.9453 31.2534 52.7022 30.1201 53.2185 28.8729C53.7348 27.6257 54.0004 26.289 54.0001 24.9391V10.279C54.0002 8.92909 53.7345 7.59239 53.2179 6.34522C52.7014 5.09806 51.9443 3.96486 50.9898 3.01034C50.0353 2.05582 48.9021 1.29868 47.6549 0.782159C46.4077 0.265641 45.071 -0.000138475 43.7211 5.41248e-08Z" fill="#213A59"/>
<path d="M24.9391 18.7817H10.279C7.55283 18.7817 4.93833 19.8647 3.01065 21.7924C1.08296 23.7201 5.41248e-08 26.3346 5.41248e-08 29.0607V43.7209C-0.000138475 45.0708 0.265641 46.4075 0.782159 47.6546C1.29868 48.9018 2.05582 50.035 3.01034 50.9895C3.96486 51.944 5.09806 52.7012 6.34522 53.2177C7.59239 53.7342 8.92909 54 10.279 53.9999H24.9391C27.6653 53.9999 30.2798 52.9169 32.2075 50.9892C34.1352 49.0615 35.2181 46.447 35.2181 43.7209V29.0607C35.2178 26.3347 34.1348 23.7203 32.2072 21.7927C30.2796 19.8651 27.6652 18.782 24.9391 18.7817ZM26.2807 36.395C26.2807 36.7814 26.2046 37.1641 26.0567 37.5211C25.9088 37.8781 25.6921 38.2025 25.4188 38.4757C25.1456 38.749 24.8212 38.9657 24.4642 39.1136C24.1072 39.2615 23.7246 39.3376 23.3381 39.3376H20.5516V42.1251C20.5516 42.9056 20.2416 43.654 19.6898 44.2059C19.1379 44.7577 18.3895 45.0677 17.6091 45.0677C16.8286 45.0677 16.0802 44.7577 15.5283 44.2059C14.9765 43.654 14.6665 42.9056 14.6665 42.1251V39.3334H11.8789C11.4922 39.3334 11.1092 39.2571 10.7519 39.109C10.3946 38.9608 10.07 38.7437 9.79674 38.47C9.52344 38.1963 9.30678 37.8715 9.15915 37.514C9.01152 37.1565 8.93581 36.7734 8.93637 36.3866C8.93637 35.6062 9.24639 34.8577 9.79823 34.3059C10.3501 33.754 11.0985 33.444 11.8789 33.444H14.6665V30.6617C14.6665 29.8813 14.9765 29.1329 15.5283 28.581C16.0802 28.0292 16.8286 27.7192 17.6091 27.7192C18.3895 27.7192 19.1379 28.0292 19.6898 28.581C20.2416 29.1329 20.5516 29.8813 20.5516 30.6617V33.4482H23.3381C24.1185 33.4482 24.867 33.7582 25.4188 34.3101C25.9707 34.8619 26.2807 35.6104 26.2807 36.3908V36.395Z" fill="#213A59"/>
</g>
<defs>
<clipPath id="clip0_64_444">
<rect width="54" height="54" fill="white"/>
</clipPath>
</defs>
</svg>

            </div>
            <h3 className="text-xl md:text-[30px] font-medium text-black font-roboto text-center mb-3 md:mb-[12px]">It's Free to Post</h3>
            <p className="text-sm md:text-[18px] font-light text-black font-roboto text-center leading-relaxed md:leading-[21.6px]">No fees, no hidden costs. Just post your project, connect with the verified experts, and get it done.</p>
          </div>

          {/* Verified Experts */}
          <div className="w-full md:w-[344px] h-auto md:h-[278px] bg-white rounded-[15px] shadow-[3px_5px_13px_3px_rgba(0,0,0,0.25)] p-6 md:p-[34px] flex flex-col">
            <div className="w-[54px] h-[54px] mx-auto mb-4 md:mb-[15px] flex items-center justify-center">
            <svg width="54" height="54" viewBox="0 0 54 54" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M12.8115 17.52C13.025 20.0737 13.5152 23.5718 14.6244 27.2448C16.9802 35.0448 21.1418 40.5911 27 43.7429C32.8583 40.5911 37.0199 35.0448 39.3755 27.2448C40.4847 23.5721 40.9748 20.074 41.1885 17.52L27 10.4258L12.8115 17.52Z" fill="#213A59"/>
<path d="M50.8205 12.6201C50.791 12.0512 50.4577 11.5421 49.9482 11.2874L27.7075 0.166983C27.2621 -0.0556611 26.7379 -0.0556611 26.2925 0.166983L4.05177 11.2874C3.54225 11.5421 3.20897 12.0512 3.17944 12.6201C3.16257 12.9439 2.7968 20.6534 5.42308 29.6043C6.97705 34.9003 9.26277 39.5258 12.2167 43.3525C15.9393 48.1748 20.7237 51.7222 26.4373 53.8966C26.6186 53.9654 26.8092 53.9999 27 53.9999C27.1908 53.9999 27.3814 53.9654 27.5627 53.8966C33.2762 51.7223 38.0607 48.1748 41.7832 43.3525C44.7372 39.5258 47.0229 34.9002 48.5769 29.6043C51.2032 20.6534 50.8374 12.9439 50.8205 12.6201ZM27.7011 46.9411C27.4802 47.0504 27.24 47.105 27 47.105C26.7599 47.105 26.5197 47.0504 26.2988 46.9411C19.2544 43.4581 14.3074 37.1391 11.5956 28.1597C10.2393 23.6685 9.74962 19.4364 9.5777 16.6772C9.53815 16.0435 9.88135 15.4477 10.4492 15.1638L26.2926 7.24214C26.738 7.0196 27.2622 7.0195 27.7076 7.24214L43.5511 15.1638C44.1189 15.4476 44.4621 16.0436 44.4226 16.6773C44.2506 19.4368 43.7609 23.6689 42.4045 28.1597C39.6925 37.1389 34.7456 43.458 27.7011 46.9411Z" fill="#213A59"/>
</svg>

            </div>
            <h3 className="text-xl md:text-[30px] font-medium text-black font-roboto text-center mb-3 md:mb-[12px]">Verified Experts</h3>
            <p className="text-sm md:text-[18px] font-light text-black font-roboto text-center leading-relaxed md:leading-[21.6px]">We pre-screen all experts so you don't have to. No more wasting time on unreliable contractors</p>
          </div>

          {/* Transparent Reviews */}
          <div className="w-full md:w-[344px] h-auto md:h-[278px] bg-white rounded-[15px] shadow-[3px_5px_13px_3px_rgba(0,0,0,0.25)] p-6 md:p-[25px] flex flex-col">
            <div className="w-[54px] h-[54px] mx-auto mb-4 md:mb-[15px] flex items-center justify-center">
            <svg width="54" height="54" viewBox="0 0 54 54" fill="none" xmlns="http://www.w3.org/2000/svg">
<path fill-rule="evenodd" clip-rule="evenodd" d="M17.5438 3.81836H40.1163C41.4511 3.81836 42.5397 4.907 42.5397 6.24177V19.887C42.5397 21.2218 41.4511 22.3104 40.1163 22.3104H38.8212C38.766 22.3104 38.721 22.3554 38.721 22.4106V28.6991C38.721 28.7401 38.6979 28.7751 38.6601 28.7912C38.6224 28.8073 38.5811 28.7996 38.5516 28.7712L31.8651 22.3385C31.8458 22.3198 31.8225 22.3106 31.7956 22.3106H28.9206C28.8654 22.3106 28.8205 22.2656 28.8205 22.2104V17.5731C28.8205 16.101 27.6225 14.9029 26.1504 14.9029H15.2203C15.1652 14.9029 15.1202 14.858 15.1202 14.8028V6.24177C15.1202 4.907 16.209 3.81836 17.5438 3.81836ZM9.83579 47.2049V35.0579C9.83579 34.7112 9.5497 34.4251 9.20302 34.4251H4.5776C4.23092 34.4251 3.94482 34.7112 3.94482 35.0579V49.5491C3.94482 49.8958 4.23102 50.1819 4.5776 50.1819H9.20302C9.5497 50.1819 9.83579 49.8958 9.83579 49.5491V47.2049ZM11.2375 37.0845V46.8257C11.2375 46.8566 11.2501 46.8831 11.2738 46.9029C11.2977 46.9226 11.3261 46.9299 11.3564 46.9241C12.0113 46.7985 12.6938 46.6633 13.388 46.5257C17.6176 45.6875 21.3552 45.1438 23.3718 45.7294C24.7219 46.1213 25.8016 46.4247 27.3022 46.2608C31.6703 45.7838 33.8592 45.6549 35.8872 44.7282C39.6967 42.9876 42.7589 39.0557 49.5375 32.5271C50.6845 31.4224 49.9044 28.7085 47.4119 30.2754C47.3005 30.3454 47.1979 30.4309 47.0884 30.5069C47.0875 30.5075 47.0866 30.5082 47.0856 30.5089L38.1767 37.1622C38.1442 37.1864 38.1301 37.2252 38.139 37.2647C38.1648 37.3778 38.1625 37.4905 38.1311 37.6055C37.7624 38.9637 36.492 39.9376 35.0688 39.9376H28.1269C27.7398 39.9376 27.4261 39.6238 27.4261 39.2367C27.4261 38.8497 27.7398 38.5359 28.1269 38.5359H35.0688C35.8871 38.5359 36.5521 38.003 36.7863 37.2258C36.7881 37.2201 36.7899 37.2154 36.7925 37.2101L36.8748 37.0447C36.8868 37.0205 36.8887 36.9955 36.8805 36.9697C36.8585 36.9005 36.8477 36.8289 36.8478 36.7575H36.8472C36.8472 35.7807 36.0456 34.9792 35.0689 34.9792H25.9782C25.8438 34.9792 25.7183 34.9413 25.6117 34.8757C25.6091 34.8741 25.6067 34.8728 25.604 34.8714L22.4212 33.28C20.498 32.3184 18.3906 32.4318 16.5789 33.5964L11.2837 37.0005C11.2539 37.0193 11.2375 37.0494 11.2375 37.0845ZM26.1504 16.2177H13.5265C12.78 16.2177 12.1712 16.8265 12.1712 17.5731V25.2043C12.1712 25.9508 12.78 26.5596 13.5265 26.5596H14.2067C14.2618 26.5596 14.3068 26.6045 14.3068 26.6597V30.0296C14.3068 30.0706 14.3299 30.1056 14.3676 30.1217C14.4053 30.1377 14.4465 30.1303 14.4761 30.1019L18.149 26.5874C18.1683 26.5688 18.1914 26.5596 18.2182 26.5596H26.1505C26.897 26.5596 27.5058 25.9508 27.5058 25.2043V17.5731C27.5058 16.8265 26.8969 16.2177 26.1504 16.2177ZM16.9721 22.1214L22.7212 22.0522C23.1067 22.0477 23.4156 21.7315 23.4111 21.3459C23.4065 20.9603 23.0903 20.6515 22.7047 20.656L16.9557 20.7252C16.5701 20.7298 16.2613 21.046 16.2658 21.4315C16.2703 21.8171 16.5865 22.126 16.9721 22.1214ZM19.7877 10.8931L37.8725 10.8239C38.258 10.8239 38.5706 10.5113 38.5706 10.1258C38.5706 9.74022 38.258 9.42766 37.8725 9.42766L19.7877 9.49689C19.4021 9.49689 19.0896 9.80944 19.0896 10.195C19.0896 10.5806 19.4021 10.8931 19.7877 10.8931ZM31.7575 16.9851L37.8779 16.9158C38.2634 16.9128 38.5735 16.5978 38.5705 16.2122C38.5675 15.8267 38.2524 15.5166 37.8669 15.5196L31.7465 15.5888C31.3609 15.5919 31.0509 15.9069 31.0539 16.2925C31.0569 16.6779 31.372 16.9881 31.7575 16.9851Z" fill="#213A59"/>
</svg>

            </div>
            <h3 className="text-xl md:text-[30px] w-max font-medium text-black font-roboto text-center mb-3 md:mb-[12px] mx-auto">Transparent Reviews</h3>
            <p className="text-sm md:text-[18px] font-light text-black font-roboto text-center leading-relaxed md:leading-[21.6px]">See real reviews from other homeowners before you hire & make decision with confidence.</p>
          </div>
        </div>
      </section>

  
    </div>
  );
};

export default JobPosting; 
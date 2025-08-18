export const businessWelcomeTemplate = (businessName) => {
  return {
    subject: "Welcome to Home Service Bureau - Application Under Review",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
        <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #AF2638; margin: 0; font-size: 28px;">Home Service Bureau</h1>
            <p style="color: #666; margin: 10px 0 0 0;">Connecting Quality Services with Happy Customers</p>
          </div>
          
          <div style="border-left: 4px solid #AF2638; padding-left: 20px; margin: 20px 0;">
            <h2 style="color: #333; margin: 0 0 15px 0;">Thank You for Your Interest!</h2>
            <p style="color: #555; line-height: 1.6; margin: 0;">
              Dear <strong>${businessName}</strong>,
            </p>
          </div>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="color: #555; line-height: 1.6; margin: 0 0 15px 0;">
              We're excited that you've chosen to join our platform! Your application has been successfully received and is currently under review by our team.
            </p>
            
            <h3 style="color: #AF2638; margin: 20px 0 10px 0;">What Happens Next?</h3>
            <ul style="color: #555; line-height: 1.6; margin: 0; padding-left: 20px;">
              <li>Our team will review your business details and credentials</li>
              <li>We'll verify your business information and documentation</li>
              <li>You'll receive an email notification once your application is approved</li>
              <li>Upon approval, you'll get access to our business dashboard</li>
            </ul>
          </div>
          
          <div style="background-color: #e8f5e8; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="color: #2d5a2d; margin: 0; font-weight: bold;">
              ⏱️ Review Process: Typically takes 2-3 business days
            </p>
          </div>
          
          <div style="margin: 30px 0;">
            <p style="color: #555; line-height: 1.6; margin: 0 0 15px 0;">
              In the meantime, if you have any questions about your application or our platform, please don't hesitate to reach out to our support team.
            </p>
          </div>
          
          <div style="border-top: 1px solid #eee; padding-top: 20px; margin-top: 30px;">
            <p style="color: #666; margin: 0 0 10px 0;">Best regards,</p>
            <p style="color: #AF2638; font-weight: bold; margin: 0;">The Home Service Bureau Team</p>
            <p style="color: #666; font-size: 12px; margin: 10px 0 0 0;">
              Email: connect@homeservicebureau.org<br>
              Phone: +1 855 8005254
            </p>
          </div>
        </div>
      </div>
    `,
    text: `
      Welcome to Home Service Bureau - Application Under Review
      
      Dear ${businessName},
      
      Thank you for your interest in joining our platform! Your application has been successfully received and is currently under review by our team.
      
      What Happens Next?
      - Our team will review your business details and credentials
      - We'll verify your business information and documentation
      - You'll receive an email notification once your application is approved
      - Upon approval, you'll get access to our business dashboard
      
      Review Process: Typically takes 2-3 business days
      
      If you have any questions, please contact our support team.
      
      Best regards,
      The Home Service Bureau Team
      Email: connect@homeservicebureau.org
      Phone: +1 855 8005254
    `,
  };
};

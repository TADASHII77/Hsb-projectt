export const adminNotificationTemplate = (businessData) => {
  const {
    businessName,
    businessEmail,
    ownerName,
    businessPhone,
    address,
    services,
    description,
    registrationDate
  } = businessData;

  return {
    subject: 'New Business Registration Interest - Home Service Bureau',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
        <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #AF2638; margin: 0; font-size: 28px;">Home Service Bureau</h1>
            <p style="color: #666; margin: 10px 0 0 0;">Admin Notification</p>
          </div>
          
          <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h2 style="color: #856404; margin: 0 0 10px 0;">🚨 New Business Registration Interest</h2>
            <p style="color: #856404; margin: 0; font-weight: bold;">
              A new business has expressed interest in joining our platform and requires review.
            </p>
          </div>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #AF2638; margin: 0 0 15px 0;">Business Details</h3>
            
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; border-bottom: 1px solid #eee; font-weight: bold; color: #333;">Business Name:</td>
                <td style="padding: 8px 0; border-bottom: 1px solid #eee; color: #555;">${businessName}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; border-bottom: 1px solid #eee; font-weight: bold; color: #333;">Owner Name:</td>
                <td style="padding: 8px 0; border-bottom: 1px solid #eee; color: #555;">${ownerName.firstName} ${ownerName.lastName}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; border-bottom: 1px solid #eee; font-weight: bold; color: #333;">Email:</td>
                <td style="padding: 8px 0; border-bottom: 1px solid #eee; color: #555;">${businessEmail}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; border-bottom: 1px solid #eee; font-weight: bold; color: #333;">Phone:</td>
                <td style="padding: 8px 0; border-bottom: 1px solid #eee; color: #555;">${businessPhone}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; border-bottom: 1px solid #eee; font-weight: bold; color: #333;">Address:</td>
                <td style="padding: 8px 0; border-bottom: 1px solid #eee; color: #555;">${address}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; border-bottom: 1px solid #eee; font-weight: bold; color: #333;">Services:</td>
                <td style="padding: 8px 0; border-bottom: 1px solid #eee; color: #555;">${services}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; border-bottom: 1px solid #eee; font-weight: bold; color: #333;">Registration Date:</td>
                <td style="padding: 8px 0; border-bottom: 1px solid #eee; color: #555;">${registrationDate}</td>
              </tr>
            </table>
          </div>
          
          ${description ? `
          <div style="background-color: #e9ecef; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h4 style="color: #495057; margin: 0 0 10px 0;">Business Description:</h4>
            <p style="color: #6c757d; margin: 0; line-height: 1.5;">${description}</p>
          </div>
          ` : ''}
          
          <div style="background-color: #d1ecf1; border: 1px solid #bee5eb; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h4 style="color: #0c5460; margin: 0 0 10px 0;">Action Required:</h4>
            <ul style="color: #0c5460; margin: 0; padding-left: 20px;">
              <li>Review the business details and credentials</li>
              <li>Verify business information and documentation</li>
              <li>Approve or reject the application</li>
              <li>Send notification to the business owner</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.ADMIN_DASHBOARD_URL || '#'}" 
               style="background-color: #AF2638; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Review Application
            </a>
          </div>
          
          <div style="border-top: 1px solid #eee; padding-top: 20px; margin-top: 30px;">
            <p style="color: #666; font-size: 12px; margin: 0;">
              This is an automated notification from the Home Service Bureau platform.<br>
              Please log into your admin dashboard to review this application.
            </p>
          </div>
        </div>
      </div>
    `,
    text: `
      New Business Registration Interest - Home Service Bureau
      
      A new business has expressed interest in joining our platform and requires review.
      
      Business Details:
      - Business Name: ${businessName}
      - Owner Name: ${ownerName.firstName} ${ownerName.lastName}
      - Email: ${businessEmail}
      - Business Phone: ${businessPhone}
      - Address: ${address}
      - Services: ${services}
      - Registration Date: ${registrationDate}
      ${description ? `- Description: ${description}` : ''}
      
      Action Required:
      - Review the business details and credentials
      - Verify business information and documentation
      - Approve or reject the application
      - Send notification to the business owner
      
      Please log into your admin dashboard to review this application.
      
      This is an automated notification from the Home Service Bureau platform.
    `
  };
};

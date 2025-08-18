import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import { businessWelcomeTemplate, adminNotificationTemplate } from '../emailTemplates/index.js';

dotenv.config();

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD // App password for Gmail
      }
    });
  }

  async sendEmail(to, subject, html, text = '') {
    try {
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to,
        subject,
        html,
        text
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log('Email sent successfully:', result.messageId);
      return { success: true, messageId: result.messageId };
    } catch (error) {
      console.error('Error sending email:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send welcome email to business and notification to admin
   * @param {Object} businessData - Business registration data
   * @returns {Object} - Result of email sending operations
   */
  async sendBusinessRegistrationEmails(businessData) {
    const adminEmail = process.env.ADMIN_EMAIL;
    
    if (!adminEmail) {
      console.error('ADMIN_EMAIL environment variable is not set');
      return { success: false, error: 'Admin email not configured' };
    }

    try {
      // Generate email templates
      const businessEmailTemplate = businessWelcomeTemplate(
        businessData.businessName, 
        businessData.businessEmail
      );
      
      const adminEmailTemplate = adminNotificationTemplate(businessData);

      // Send welcome email to business
      const businessEmailResult = await this.sendEmail(
        businessData.businessEmail,
        businessEmailTemplate.subject,
        businessEmailTemplate.html,
        businessEmailTemplate.text
      );

      // Send notification email to admin
      const adminEmailResult = await this.sendEmail(
        adminEmail,
        adminEmailTemplate.subject,
        adminEmailTemplate.html,
        adminEmailTemplate.text
      );

      return {
        success: true,
        results: {
          business: businessEmailResult,
          admin: adminEmailResult
        }
      };
    } catch (error) {
      console.error('Error sending business registration emails:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send welcome email to business only
   * @param {string} businessName - Name of the business
   * @param {string} businessEmail - Email of the business
   * @returns {Object} - Result of email sending operation
   */
  async sendBusinessWelcomeEmail(businessName, businessEmail) {
    try {
      const emailTemplate = businessWelcomeTemplate(businessName, businessEmail);
      
      const result = await this.sendEmail(
        businessEmail,
        emailTemplate.subject,
        emailTemplate.html,
        emailTemplate.text
      );

      return result;
    } catch (error) {
      console.error('Error sending business welcome email:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send notification email to admin only
   * @param {Object} businessData - Business registration data
   * @returns {Object} - Result of email sending operation
   */
  async sendAdminNotificationEmail(businessData) {
    const adminEmail = process.env.ADMIN_EMAIL;
    
    if (!adminEmail) {
      console.error('ADMIN_EMAIL environment variable is not set');
      return { success: false, error: 'Admin email not configured' };
    }

    try {
      const emailTemplate = adminNotificationTemplate(businessData);
      
      const result = await this.sendEmail(
        adminEmail,
        emailTemplate.subject,
        emailTemplate.html,
        emailTemplate.text
      );

      return result;
    } catch (error) {
      console.error('Error sending admin notification email:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send enquiry notification to business
   * @param {Object} business - Business data
   * @param {Object} enquiry - Enquiry data
   * @param {Object} user - User data
   * @returns {Object} - Result of email sending operation
   */
  async sendBusinessEnquiryNotification(business, enquiry, user) {
    try {
      const subject = `New Enquiry from ${user.name}`;
      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #213A59;">New Enquiry Received</h2>
          <p>Hello ${business.name},</p>
          <p>You have received a new enquiry from ${user.name}.</p>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #AF2638; margin-top: 0;">Enquiry Details:</h3>
            <p><strong>Service:</strong> ${enquiry.service.join(', ')}</p>
            <p><strong>Category:</strong> ${enquiry.category}</p>
            <p><strong>Description:</strong> ${enquiry.description}</p>
            <p><strong>Contact Preference:</strong> ${enquiry.contactPreference}</p>
            ${enquiry.additionalNotes ? `<p><strong>Additional Notes:</strong> ${enquiry.additionalNotes}</p>` : ''}
          </div>
          
          <div style="background-color: #e8f4fd; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h4 style="color: #213A59; margin-top: 0;">Customer Information:</h4>
            <p><strong>Name:</strong> ${user.name}</p>
            <p><strong>Email:</strong> ${user.email}</p>
          </div>
          
          <p>Please respond to this enquiry as soon as possible.</p>
          <p>Best regards,<br>Home Service Bureau Team</p>
        </div>
      `;
      
      const result = await this.sendEmail(
        business.email,
        subject,
        html
      );

      return result;
    } catch (error) {
      console.error('Error sending business enquiry notification:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send enquiry confirmation to customer
   * @param {Object} user - User data
   * @param {Object} enquiry - Enquiry data
   * @param {Object} business - Business data
   * @returns {Object} - Result of email sending operation
   */
  async sendCustomerEnquiryConfirmation(user, enquiry, business) {
    try {
      const subject = `Enquiry Confirmation - ${business.name}`;
      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #213A59;">Enquiry Confirmation</h2>
          <p>Hello ${user.name},</p>
          <p>Your enquiry has been successfully sent to <strong>${business.name}</strong>.</p>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #AF2638; margin-top: 0;">Enquiry Summary:</h3>
            <p><strong>Business:</strong> ${business.name}</p>
            <p><strong>Service:</strong> ${enquiry.service.join(', ')}</p>
            <p><strong>Category:</strong> ${enquiry.category}</p>
            <p><strong>Description:</strong> ${enquiry.description}</p>
            <p><strong>Enquiry ID:</strong> ${enquiry._id}</p>
          </div>
          
          <p>The business will contact you within 24-48 hours with their response.</p>
          <p>Thank you for using Home Service Bureau!</p>
          <p>Best regards,<br>Home Service Bureau Team</p>
        </div>
      `;
      
      const result = await this.sendEmail(
        user.email,
        subject,
        html
      );

      return result;
    } catch (error) {
      console.error('Error sending customer enquiry confirmation:', error);
      return { success: false, error: error.message };
    }
  }
}

export default new EmailService(); 
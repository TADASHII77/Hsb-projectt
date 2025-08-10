import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER || '2000rohitmehra@gmail.com',
        pass: process.env.EMAIL_PASSWORD // App password for Gmail
      }
    });
  }

  async sendEmail(to, subject, html, text = '') {
    try {
      const mailOptions = {
        from: process.env.EMAIL_USER || '2000rohitmehra@gmail.com',
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

  async sendQuoteRequestEmails(technicianEmail, customerEmail, technicianName, customerName = 'Customer') {
    const adminEmail = 'mairohitnhihu@gmail.com';
    
    try {
      // Email to business (technician)
      const businessEmailResult = await this.sendEmail(
        technicianEmail,
        'New Quote Request - We Got a Client!',
        `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #AF2638;">We Got a Client!</h2>
          <p>Dear ${technicianName},</p>
          <p>Great news! A potential customer has requested a quote for your services through our platform.</p>
          <p><strong>Customer Details:</strong></p>
          <ul>
            <li>Name: ${customerName}</li>
            <li>Email: ${customerEmail}</li>
          </ul>
          <p>Please reach out to the customer as soon as possible to provide them with a detailed quote.</p>
          <p>Best regards,<br>Home Service Bureau Team</p>
        </div>
        `,
        `We Got a Client! Dear ${technicianName}, A potential customer (${customerName} - ${customerEmail}) has requested a quote for your services. Please reach out to them as soon as possible.`
      );

      // Email to admin
      const adminEmailResult = await this.sendEmail(
        adminEmail,
        'New Quote Request Notification',
        `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #AF2638;">New Quote Request</h2>
          <p>A new quote request has been submitted on the platform.</p>
          <p><strong>Details:</strong></p>
          <ul>
            <li>Customer: ${customerName} (${customerEmail})</li>
            <li>Technician: ${technicianName} (${technicianEmail})</li>
            <li>Timestamp: ${new Date().toLocaleString()}</li>
          </ul>
          <p>Both parties have been notified.</p>
        </div>
        `,
        `New quote request: Customer ${customerName} (${customerEmail}) requested quote from ${technicianName} (${technicianEmail})`
      );

      // Email to customer
      const customerEmailResult = await this.sendEmail(
        customerEmail,
        'Your Quote Request is Under Supervision',
        `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #AF2638;">Quote Request Received</h2>
          <p>Dear ${customerName},</p>
          <p>Thank you for your interest in our services. Your quote request is under supervision.</p>
          <p><strong>Next Steps:</strong></p>
          <ul>
            <li>We have notified ${technicianName} about your request</li>
            <li>You should expect to hear from them within 24 hours</li>
            <li>Our team is monitoring this request to ensure quality service</li>
          </ul>
          <p>If you don't hear back within 24 hours, please contact us directly.</p>
          <p>Best regards,<br>Home Service Bureau Team</p>
        </div>
        `,
        `Dear ${customerName}, Your quote request is under supervision. ${technicianName} has been notified and will contact you within 24 hours.`
      );

      return {
        success: true,
        results: {
          business: businessEmailResult,
          admin: adminEmailResult,
          customer: customerEmailResult
        }
      };
    } catch (error) {
      console.error('Error sending quote request emails:', error);
      return { success: false, error: error.message };
    }
  }
}

export default new EmailService(); 
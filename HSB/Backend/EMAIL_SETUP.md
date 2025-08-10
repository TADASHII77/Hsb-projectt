# Email Setup Guide

## Gmail Configuration

To enable email functionality for quote requests, you need to set up Gmail App Passwords:

### Step 1: Enable 2-Step Verification
1. Go to your Google Account settings: https://myaccount.google.com/
2. Click on "Security" in the left sidebar
3. Under "Signing in to Google", click on "2-Step Verification"
4. Follow the setup process to enable 2-Step Verification

### Step 2: Generate App Password
1. Once 2-Step Verification is enabled, go back to Security settings
2. Under "Signing in to Google", click on "App passwords"
3. Select "Mail" as the app and "Other (Custom name)" as the device
4. Enter "HSB Backend" as the custom name
5. Click "Generate"
6. Copy the 16-character password (it will look like: `abcd efgh ijkl mnop`)

### Step 3: Configure Environment Variables
1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Edit the `.env` file and replace `your_gmail_app_password_here` with the app password you generated:
   ```
   EMAIL_PASSWORD=abcd efgh ijkl mnop
   ```

### Step 4: Update Email Addresses
The system is configured to use these email addresses:
- **Sender Email**: `2000rohitmehra@gmail.com` (configured in EMAIL_USER)
- **Admin Email**: `mairohitnhihu@gmail.com` (configured in ADMIN_EMAIL)

## Email Flow

When a customer clicks "Get a Quote" on a technician:

1. **Business Email** (technician's email): Receives "We got a client!" notification
2. **Admin Email** (`mairohitnhihu@gmail.com`): Receives notification about the new quote request
3. **Customer Email**: Receives "Your request is under supervision" confirmation

## Testing

To test the email functionality:

1. Start the backend server: `npm start`
2. Start the frontend: `npm run dev` (in Frontend directory)
3. Click "Get a Quote" on any technician
4. Fill in the customer form with a valid email address
5. Check all three email inboxes for the respective messages

## Troubleshooting

- **Authentication Error**: Make sure you're using an App Password, not your regular Gmail password
- **Less Secure Apps**: App Passwords bypass the need for "Less secure app access"
- **Rate Limiting**: Gmail has sending limits (100 emails per day for free accounts)

## Production Considerations

For production deployment:
- Consider using a professional email service like SendGrid, Mailgun, or AWS SES
- Set up proper DNS records (SPF, DKIM, DMARC) to avoid spam filters
- Use environment variables for all sensitive configuration
- Implement email queuing for high-volume scenarios 
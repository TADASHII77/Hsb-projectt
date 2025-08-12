# Backend Deployment Instructions

## For Backend-Only Deployment on Vercel

### Setup Steps:

1. **In Vercel Dashboard:**
   - Create new project
   - Import from your GitHub repo
   - **Set Root Directory to: `HSB/Backend`** (very important!)
   - Framework Preset: Other

2. **Environment Variables to Set:**
   ```
   MONGODB_URI=your_mongodb_connection_string
   EMAIL_USER=your_gmail_user
   EMAIL_PASSWORD=your_gmail_app_password  
   CLOUDINARY_CLOUD_NAME=your_cloudinary_name
   CLOUDINARY_API_KEY=your_cloudinary_key
   CLOUDINARY_API_SECRET=your_cloudinary_secret
   NODE_ENV=production
   ```

3. **Deploy**
   - The `vercel.json` in this directory will handle the serverless function setup
   - All API routes will be available at your-domain.vercel.app/*

### Testing After Deploy:
- Visit: `https://your-backend-domain.vercel.app/api/health`
- Should return JSON with success: true

### Important Notes:
- Make sure Root Directory is set to `HSB/Backend` in Vercel project settings
- Do NOT use the root vercel.json for backend-only deployment
- This vercel.json is specifically for backend deployment only

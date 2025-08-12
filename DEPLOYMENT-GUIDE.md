# Vercel Deployment Guide

## Current Setup
- **Frontend**: `https://frontend-two-blush-25.vercel.app` (separate Vercel project)
- **Backend**: `https://hsb-projectt.vercel.app` (separate Vercel project)

## Fixes Applied

### 1. Frontend API Configuration
- Updated `HSB/Frontend/src/services/api.js` to point to the correct backend URL in production
- Now calls `https://hsb-projectt.vercel.app/api/technicians` instead of `/technicians`

### 2. Backend CORS Configuration  
- Updated `HSB/Backend/app.js` to allow your frontend domain
- Now accepts requests from `https://frontend-two-blush-25.vercel.app` and other `*.vercel.app` domains

## Deployment Steps

### Backend (hsb-projectt.vercel.app)
1. Redeploy your backend project on Vercel
2. Ensure these environment variables are set in Vercel dashboard:
   - `MONGODB_URI` (your MongoDB connection string)
   - `EMAIL_USER` (Gmail user for nodemailer)  
   - `EMAIL_PASSWORD` (Gmail app password)
   - `CLOUDINARY_CLOUD_NAME`
   - `CLOUDINARY_API_KEY`
   - `CLOUDINARY_API_SECRET`
   - `NODE_ENV=production`

### Frontend (frontend-two-blush-25.vercel.app)
1. Redeploy your frontend project on Vercel
2. No environment variables needed (API URL is hardcoded for your backend)

## Testing After Deployment

1. **Backend Health Check**: Visit `https://hsb-projectt.vercel.app/api/health`
   - Should return JSON with success: true

2. **Frontend API Calls**: Open browser dev tools on your frontend
   - Network tab should show requests to `https://hsb-projectt.vercel.app/api/...`
   - Should see CORS headers in response: `Access-Control-Allow-Origin`

3. **CORS Test**: Try loading technicians list on frontend
   - Should work without CORS errors

## Alternative: Single Project Deployment

If you want to deploy both frontend and backend in one Vercel project:

1. Use the root `vercel.json` configuration 
2. Deploy from the repository root
3. Frontend will be at your-domain.vercel.app
4. Backend API will be at your-domain.vercel.app/api/*
5. No CORS issues since same-origin

## Troubleshooting

- **Still getting CORS errors?** Check that backend is deployed with latest changes
- **API calls to wrong URL?** Verify frontend is deployed with latest build
- **Environment variables?** Double-check they're set in Vercel dashboard for backend project

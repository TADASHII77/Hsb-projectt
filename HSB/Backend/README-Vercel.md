Deploying HSB Backend on Vercel

Environment variables to set in Vercel project (Settings → Environment Variables):

- MONGODB_URI: your MongoDB connection string (Atlas recommended)
- EMAIL_USER: Gmail user (if using nodemailer Gmail transport)
- EMAIL_PASSWORD: Gmail app password
- CLOUDINARY_CLOUD_NAME
- CLOUDINARY_API_KEY
- CLOUDINARY_API_SECRET
- ALLOWED_ORIGINS: comma-separated list of allowed origins for CORS (e.g. https://your-frontend.vercel.app)

Local development:

- npm install
- npm run dev

Notes:

- serverless.js exports the Express app for Vercel functions
- server.js remains for local development
- connectDB caches the connection to be serverless-friendly


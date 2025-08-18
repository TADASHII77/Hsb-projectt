import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import connectDB from '../config/database.js';
import businessRoutes from './routes/businesses.js';
import adminRoutes from './routes/admin.js';
import authRoutes from './routes/auth.js';
import adminAuthRoutes from './routes/adminAuth.js';
import enquiryRoutes from './routes/enquiries.js';

// Load environment variables
dotenv.config();

// Ensure DB connection (cached in serverless env)
// This will be a no-op on subsequent invocations due to caching in connectDB
connectDB();

const app = express();

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500, // Increased from 100 to 500 for development
  message: 'Too many requests from this IP, please try again later.'
});

// Resolve allowed origins from env to support Vercel domains
function resolveCorsOrigin() {
  const envOrigins = process.env.ALLOWED_ORIGINS || '';
  const list = envOrigins
    .split(',')
    .map(o => o.trim())
    .filter(Boolean);
  
  if (list.length === 0) {
    // In production, allow common Vercel patterns + localhost for dev
    if (process.env.NODE_ENV === 'production' || process.env.VERCEL) {
      return [
        'https://frontend-two-blush-25.vercel.app',
        /^https:\/\/.*\.vercel\.app$/
      ];
    } else {
      // Development fallback
      return [
        'http://localhost:3000',
        'http://localhost:5173',
        'http://127.0.0.1:5173'
      ];
    }
  }
  return list;
}

// Middleware
app.use(helmet());
app.use(limiter);
app.use(cors({
  origin: resolveCorsOrigin(),
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/businesses', businessRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/admin-auth', adminAuthRoutes);
app.use('/api/enquiry', enquiryRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'HSB Backend API is running successfully',
    timestamp: new Date().toISOString()
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to Home Service Bureau API',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      businesses: '/api/businesses',
      businessById: '/api/businesses/:id',
      searchBusinesses: '/api/businesses/search/:query',
      filterBusinesses: '/api/businesses/filter'
    }
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// Global error handler
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  // Avoid logging full stack in production
  if (process.env.NODE_ENV !== 'production') {
    console.error('Global error handler:', err.stack);
  }
  res.status(500).json({
    success: false,
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'production' ? {} : err.message
  });
});

export default app;



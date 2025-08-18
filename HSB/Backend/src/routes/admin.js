import express from 'express';
import Business from '../models/Business.js';
import { User } from '../models/User.js';
import cloudinary from '../services/cloudinary.js';
import multer from 'multer';
import streamifier from 'streamifier';
import { verifyAdminToken } from '../middleware/adminAuth.js';

const router = express.Router();
const upload = multer();

// Apply admin authentication to all routes
router.use(verifyAdminToken);

// Upload to Cloudinary (multipart/form-data)
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });
    const streamUpload = () => new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream({ folder: 'hsb' }, (error, result) => {
        if (result) resolve(result);
        else reject(error);
      });
      streamifier.createReadStream(req.file.buffer).pipe(stream);
    });
    const result = await streamUpload();
    return res.json({ success: true, url: result.secure_url, public_id: result.public_id });
  } catch (err) {
    console.error('Cloudinary upload error:', err);
    return res.status(500).json({ success: false, message: 'Upload failed' });
  }
});

// Middleware for admin authentication (placeholder)
const authenticateAdmin = (req, res, next) => {
  // TODO: Implement proper admin authentication
  // For now, we'll just pass through
  next();
};

// Apply admin authentication to all routes
router.use(authenticateAdmin);

// Dashboard Statistics
router.get('/stats', async (req, res) => {
  try {
    const totalBusinesses = await Business.countDocuments();
    const verifiedBusinesses = await Business.countDocuments({ verified: true });
    const expertBusinesses = await Business.countDocuments({ expert: true });
    
    // Calculate average rating
    const avgRatingResult = await Business.aggregate([
      { $group: { _id: null, avgRating: { $avg: '$rating' } } }
    ]);
    const averageRating = avgRatingResult[0]?.avgRating || 0;

    // Get total reviews
    const totalReviewsResult = await Business.aggregate([
      { $group: { _id: null, totalReviews: { $sum: '$reviews' } } }
    ]);
    const totalReviews = totalReviewsResult[0]?.totalReviews || 0;

    // Category distribution
    const categoryDistribution = await Business.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Top rated businesses
    const topBusinesses = await Business.find()
      .sort({ rating: -1, reviews: -1 })
      .limit(10)
      .select('name rating reviews category verified');

    res.json({
      success: true,
      data: {
        overview: {
          totalBusinesses,
          verifiedBusinesses,
          expertBusinesses,
          averageRating: Math.round(averageRating * 10) / 10,
          totalReviews
        },
        categoryDistribution,
        topBusinesses
      }
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching statistics',
      error: error.message
    });
  }
});

// Get all businesses with admin details
router.get('/businesses', async (req, res) => {
  try {
    const { page = 1, limit = 20, search, category, verified, expert } = req.query;
    
    let query = {};
    
    // Build search query
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { address: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (category) query.category = category;
    if (verified !== undefined) query.verified = verified === 'true';
    if (expert !== undefined) query.expert = expert === 'true';

    const businesses = await Business.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Business.countDocuments(query);

    res.json({
      success: true,
      data: businesses,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching businesses:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching businesses',
      error: error.message
    });
  }
});

// Create new business
router.post('/businesses', async (req, res) => {
  try {
    // Check if the business already exists using email
    const existingBusiness = await Business.findOne({ email: req.body.email });
    if (existingBusiness) {
      return res.status(400).json({
        success: false,
        message: 'Business with this email already exists'
      });
    }

    const businessData = req.body;

    const business = new Business(businessData);
    const savedBusiness = await business.save();
    
    res.status(201).json({
      success: true,
      data: savedBusiness
    });
  } catch (error) {
    console.error('Error creating business:', error);
    res.status(400).json({
      success: false,
      message: 'Error creating business',
      error: error.message
    });
  }
});

// Update business
router.put('/businesses/:id', async (req, res) => {
  try {
    const business = await Business.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!business) {
      return res.status(404).json({
        success: false,
        message: 'Business not found'
      });
    }

    res.json({
      success: true,
      data: business
    });
  } catch (error) {
    console.error('Error updating business:', error);
    res.status(400).json({
      success: false,
      message: 'Error updating business',
      error: error.message
    });
  }
});

// Delete business
router.delete('/businesses/:id', async (req, res) => {
  try {
    const business = await Business.findByIdAndDelete(req.params.id);

    if (!business) {
      return res.status(404).json({
        success: false,
        message: 'Business not found'
      });
    }

    res.json({
      success: true,
      message: 'Business deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting business:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting business',
      error: error.message
    });
  }
});

// Toggle business verification
router.patch('/businesses/:id/verify', async (req, res) => {
  try {
    const business = await Business.findById(req.params.id);

    if (!business) {
      return res.status(404).json({
        success: false,
        message: 'Business not found'
      });
    }

    business.verified = !business.verified;
    await business.save();

    res.json({
      success: true,
      data: business,
      message: `Business ${business.verified ? 'verified' : 'unverified'} successfully`
    });
  } catch (error) {
    console.error('Error toggling verification:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating verification status',
      error: error.message
    });
  }
});

// Analytics endpoints
router.get('/analytics/overview', async (req, res) => {
  try {
    const { timeRange = '30d' } = req.query;
    
    // Mock analytics data - in a real app, this would come from actual user activity tracking
    const analyticsData = {
      totalViews: 12543,
      totalQuotes: 892,
      conversionRate: 7.1,
      averageResponseTime: 2.4,
      performanceData: [
        { period: 'Jan', businesses: 8, quotes: 145, views: 2340 },
        { period: 'Feb', businesses: 9, quotes: 178, views: 2890 },
        { period: 'Mar', businesses: 10, quotes: 203, views: 3120 },
        { period: 'Apr', businesses: 10, quotes: 189, views: 2980 },
        { period: 'May', businesses: 11, quotes: 234, views: 3560 },
        { period: 'Jun', businesses: 10, quotes: 198, views: 3240 }
      ]
    };

    res.json({
      success: true,
      data: analyticsData
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching analytics',
      error: error.message
    });
  }
});

// User management - fetch from MongoDB
router.get('/users', async (req, res) => {
  try {
    const { page = 1, limit = 10, role, status, search } = req.query;

    const filter = {};
    if (role && role !== 'all') filter.role = role;
    if (status && status !== 'all') filter.status = status;
    if (search) {
      filter.$or = [
        { name: new RegExp(search, 'i') },
        { email: new RegExp(search, 'i') }
      ];
    }

    const users = await User.find(filter)
      .select('-businessInfo.businessNumber -businessInfo.licenseNumber') // Hide sensitive info
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const total = await User.countDocuments(filter);

    // Format dates for frontend
    const formattedUsers = users.map(user => ({
      ...user.toObject(),
      joinDate: user.joinDate?.toISOString().split('T')[0] || 'N/A',
      lastActive: user.lastActive ? getTimeAgo(user.lastActive) : 'Never'
    }));

    res.json({
      success: true,
      data: formattedUsers,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalUsers: total
      }
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching users',
      error: error.message
    });
  }
});

// Create new user
router.post('/users', async (req, res) => {
  try {
    const userData = req.body;
    
    // Add detailed logging
    console.log('🔍 POST /admin/users - Received user data:');
    console.log('📋 Full userData:', JSON.stringify(userData, null, 2));
    console.log('📧 Email:', userData.email);
    console.log('👤 Name:', userData.name);
    console.log('📱 Phone:', userData.phone);
    console.log('🏷️ Role:', userData.role);
    
    // Validate required fields manually first
    if (!userData.name) {
      console.log('❌ Missing required field: name');
      return res.status(400).json({
        success: false,
        message: 'Name is required'
      });
    }
    
    if (!userData.email) {
      console.log('❌ Missing required field: email');
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }
    
    console.log('✅ Required fields validation passed');
    
    // Check if user already exists
    console.log('🔍 Checking if user exists with email:', userData.email);
    const existingUser = await User.findOne({ email: userData.email });
    if (existingUser) {
      console.log('❌ User already exists:', existingUser._id);
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }
    
    console.log('✅ No existing user found, creating new user...');

    const newUser = new User(userData);
    console.log('📝 User instance created, attempting to save...');
    
    const savedUser = await newUser.save();
    console.log('✅ User saved successfully:', savedUser._id);

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: savedUser
    });
  } catch (error) {
    console.error('❌ Error creating user:', error);
    console.error('❌ Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    
    // Check for validation errors
    if (error.name === 'ValidationError') {
      console.error('❌ Validation errors:', error.errors);
      const validationErrors = Object.keys(error.errors).map(key => ({
        field: key,
        message: error.errors[key].message
      }));
      
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validationErrors
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error creating user',
      error: error.message
    });
  }
});

// Update user
router.put('/users/:id', async (req, res) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { ...req.body, lastActive: new Date() },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'User updated successfully',
      data: updatedUser
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating user',
      error: error.message
    });
  }
});

// Delete user
router.delete('/users/:id', async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id);

    if (!deletedUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting user',
      error: error.message
    });
  }
});

// Helper function to format time ago
function getTimeAgo(date) {
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} minutes ago`;
  if (diffHours < 24) return `${diffHours} hours ago`;
  if (diffDays < 7) return `${diffDays} days ago`;
  return date.toISOString().split('T')[0];
}

// Bulk operations
router.post('/businesses/bulk-verify', async (req, res) => {
  try {
    const { businessIds, verified } = req.body;

    const result = await Business.updateMany(
      { _id: { $in: businessIds } },
      { verified }
    );

    res.json({
      success: true,
      message: `${result.modifiedCount} businesses updated`,
      data: result
    });
  } catch (error) {
    console.error('Error in bulk verification:', error);
    res.status(500).json({
      success: false,
      message: 'Error in bulk operation',
      error: error.message
    });
  }
});

// Export data
router.get('/export/businesses', async (req, res) => {
  try {
    const businesses = await Business.find().lean();
    
    // Convert to CSV format
    const csvHeaders = ['ID', 'Name', 'Category', 'Rating', 'Reviews', 'Verified', 'Expert', 'Phone', 'Address'];
    const csvRows = businesses.map(business => [
      business._id,
      business.name,
      business.category,
      business.rating,
      business.reviews,
      business.verified,
      business.expert,
      business.phone,
      business.address
    ]);

    const csvContent = [csvHeaders, ...csvRows]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=businesses.csv');
    res.send(csvContent);
  } catch (error) {
    console.error('Error exporting businesses:', error);
    res.status(500).json({
      success: false,
      message: 'Error exporting data',
      error: error.message
    });
  }
});

export default router; 
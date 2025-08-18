import jwt from 'jsonwebtoken';

// Admin credentials from environment variables
const ADMIN_EMAIL_login = process.env.ADMIN_EMAIL_login || 'imadmin@gmail.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'rohti2002aug';
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-for-admin-auth-2024';

// Admin login function
const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // Check credentials
    if (email.toLowerCase() !== ADMIN_EMAIL_login.toLowerCase()) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // For simplicity, we'll do direct password comparison
    // In production, you might want to hash the admin password
    if (password !== ADMIN_PASSWORD) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        email: ADMIN_EMAIL_login,
        role: 'admin',
        isAdmin: true
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Send response
    res.json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: {
          email: ADMIN_EMAIL_login,
          role: 'admin',
          name: 'Administrator'
        }
      }
    });

  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
};

// Middleware to verify admin token
const verifyAdminToken = (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '') || 
                  req.header('x-auth-token') ||
                  req.cookies?.adminToken;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided, access denied'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Check if it's an admin token
    if (!decoded.isAdmin || decoded.email.toLowerCase() !== ADMIN_EMAIL_login.toLowerCase()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }

    // Add admin info to request
    req.admin = decoded;
    next();

  } catch (error) {
    console.error('Token verification error:', error);
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired, please login again'
      });
    }
    
    return res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }
};

// Middleware to check admin session (less strict, for frontend checks)
const checkAdminSession = (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '') || 
                  req.header('x-auth-token') ||
                  req.cookies?.adminToken;

    if (!token) {
      req.isAdmin = false;
      return next();
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    req.isAdmin = decoded.isAdmin && decoded.email.toLowerCase() === ADMIN_EMAIL_login.toLowerCase();
    req.admin = decoded;
    next();

  } catch (error) {
    req.isAdmin = false;
    next();
  }
};

// Admin logout (mainly for clearing cookies if used)
const adminLogout = (req, res) => {
  try {
    // Clear cookie if using cookies
    res.clearCookie('adminToken');
    
    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    console.error('Admin logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Error during logout'
    });
  }
};

// Verify admin status
const verifyAdminStatus = (req, res) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '') || 
                  req.header('x-auth-token') ||
                  req.cookies?.adminToken;

    if (!token) {
      return res.json({
        success: false,
        isAdmin: false,
        message: 'No token provided'
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const isValidAdmin = decoded.isAdmin && decoded.email.toLowerCase() === ADMIN_EMAIL_login.toLowerCase();

    res.json({
      success: true,
      isAdmin: isValidAdmin,
      user: isValidAdmin ? {
        email: decoded.email,
        role: 'admin',
        name: 'Administrator'
      } : null
    });

  } catch (error) {
    res.json({
      success: false,
      isAdmin: false,
      message: 'Invalid or expired token'
    });
  }
};

export {
  adminLogin,
  verifyAdminToken,
  checkAdminSession,
  adminLogout,
  verifyAdminStatus
};

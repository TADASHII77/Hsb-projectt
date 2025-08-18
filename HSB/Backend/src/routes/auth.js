import express from 'express';
import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';
import Business from '../models/Business.js';

const router = express.Router();

// Register or update a customer (sets password)
router.post('/register-customer', async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email and password are required' });
    }

    let user = await User.findOne({ email });

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    if (!user) {
      user = new User({ 
        name, 
        email: email.toLowerCase().trim(), 
        phone, 
        role: 'Customer', 
        password: hash,
        enquiryCount: 3,
        enquiries: []
      });
      await user.save();
    } else {
      res.status(400).json({ success: false, message: 'User already exists' });
    }

        return res.status(200).json({ 
      success: true,
      message: 'Customer registered successfully', 
      data: { 
        id: user._id, 
        name: user.name, 
        email: user.email,
        role: user.role,
        userType: user.userType,
        enquiryCount: user.enquiryCount
      } 
    });
  } catch (err) {
    console.error('Error in register-customer:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Register or update a business (business) (sets password) 
router.post('/register-business', async (req, res) => { 
  try {
    const { name, email, phone, password, businessData } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email and password are required' });
    }

    let business = await Business.findOne({ email });

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    if (!business) {
      business = new Business({ 
        name, 
        email: email.toLowerCase().trim(), 
        phone, 
        password: hash,
        ...businessData
      });
      await business.save();
    } else {
      res.status(400).json({ success: false, message: 'Business already exists' });
    }

    return res.status(200).json({ 
      success: true, 
      message: 'Business registered successfully', 
      data: { 
        id: business._id, 
        name: business.name, 
        email: business.email,
        role: 'Business',
        userType: 'Business'
      } 
    });
  } catch (err) {
    console.error('Error in register-business:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Login - works for both User and Business
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    // Try to find user first (Customer or Admin)
    let user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');
    let isBusiness = false;

    // If not found as user, try as business
    if (!user) {
      user = await Business.findOne({ email: email.toLowerCase().trim() }).select('+password');
      isBusiness = true;
    }

    if (!user || !user.password) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Return user info based on type
    const userData = {
      id: user._id, 
      name: user.name, 
      email: user.email, 
      role: isBusiness ? 'Business' : user.role,
      userType: user.userType
    };

    // Add business-specific fields if it's a business
    if (isBusiness) {
      userData.businessId = user._id;
      userData.verified = user.verified;
      userData.expert = user.expert;
    } else {
      // Add user-specific fields
      userData.enquiryCount = user.enquiryCount;
    }

    return res.status(200).json({ 
      success: true, 
      message: 'Login successful', 
      data: userData 
    });
  } catch (err) {
    console.error('Error in login:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

export default router;

import express from 'express';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';

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
      user = new User({ name, email: email.toLowerCase().trim(), phone, role: 'Customer', passwordHash: hash });
      await user.save();
    } else {
      user.name = name;
      user.phone = phone;
      user.role = 'Customer';
      user.passwordHash = hash;
      await user.save();
    }

    return res.status(200).json({ success: true, message: 'Customer registered successfully', data: { id: user._id, name: user.name, email: user.email } });
  } catch (err) {
    console.error('Error in register-customer:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Register or update a technician (business) (sets password)
router.post('/register-technician', async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email and password are required' });
    }

    let user = await User.findOne({ email });

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    if (!user) {
      user = new User({ name, email: email.toLowerCase().trim(), phone, role: 'Technician', passwordHash: hash });
      await user.save();
    } else {
      user.name = name;
      user.phone = phone;
      user.role = 'Technician';
      user.passwordHash = hash;
      await user.save();
    }

    return res.status(200).json({ success: true, message: 'Technician registered successfully', data: { id: user._id, name: user.name, email: user.email } });
  } catch (err) {
    console.error('Error in register-technician:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+passwordHash');
    if (!user || !user.passwordHash) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // For simplicity, return basic user info. In production, return JWT.
    return res.status(200).json({ success: true, message: 'Login successful', data: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    console.error('Error in login:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

export default router;

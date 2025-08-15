import express from 'express';
import { 
  adminLogin, 
  adminLogout, 
  verifyAdminStatus,
  verifyAdminToken 
} from '../middleware/adminAuth.js';

const router = express.Router();

// Admin login route
router.post('/login', adminLogin);

// Admin logout route
router.post('/logout', adminLogout);

// Verify admin status
router.get('/verify', verifyAdminStatus);

// Protected admin test route
router.get('/test', verifyAdminToken, (req, res) => {
  res.json({
    success: true,
    message: 'Admin access granted',
    admin: req.admin
  });
});

export default router;

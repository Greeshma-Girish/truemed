const express = require('express');
const router = express.Router();
const { verifyPillScan, getScanHistory } = require('../controllers/scanController');
const { protect } = require('../middleware/authMiddleware');

// Verification can be guest, demo, or authenticated user
router.post('/verify', async (req, res, next) => {
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      const token = req.headers.authorization.split(' ')[1];
      if (token && token.startsWith('demo-token')) {
        req.user = { _id: 'usr-demo-1', name: 'DEMO PATIENT', role: 'patient' };
      } else if (token) {
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'truemed_sec_jwt_key_987654321_super_secure_verification_2026');
        const User = require('../models/User');
        req.user = await User.findById(decoded.id).select('-password');
      }
    } catch (err) {
      // Continue gracefully as guest verification without rejecting request
      req.user = null;
    }
  }
  next();
}, verifyPillScan);

router.get('/history', protect, getScanHistory);

module.exports = router;

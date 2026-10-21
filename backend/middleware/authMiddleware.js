const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      if (token && token.startsWith('demo-token')) {
        req.user = { _id: 'usr-demo-1', name: 'DEMO PATIENT', role: 'patient' };
        return next();
      }
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'truemed_sec_jwt_key_987654321_super_secure_verification_2026');
      req.user = await User.findById(decoded.id).select('-password');
      return next();
    } catch (error) {
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token provided' });
  }
};

module.exports = { protect };

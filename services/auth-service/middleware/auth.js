const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Verify JWT token middleware
exports.verifyToken = async (req, res, next) => {
  try {
    // Log the raw authorization header for debugging
    console.log('Auth header:', req.headers.authorization);
    
    // Extract token, handling both "Bearer token" and "token" formats
    let token = req.headers.authorization;
    if (token?.startsWith('Bearer ')) {
      token = token.split(' ')[1];
    }
    
    console.log('Extracted token:', token ? `${token.substring(0, 10)}...` : 'none');
    
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }
    
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      console.log('Token decoded successfully, user ID:', decoded.id);
      
      const user = await User.findById(decoded.id);
      
      if (!user || !user.isActive) {
        console.log('User not found or inactive:', decoded.id);
        return res.status(401).json({ message: 'Invalid or expired token' });
      }
      
      req.user = user;
      next();
    } catch (jwtError) {
      console.error('JWT verification error:', jwtError.message);
      return res.status(401).json({ message: 'Invalid token' });
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(401).json({ message: 'Authentication error' });
  }
};
// Check if user is admin
exports.isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    return next();
  }
  return res.status(403).json({ message: 'Access denied. Admin role required.' });
};

// Check if user is manager or admin
exports.isManagerOrAdmin = (req, res, next) => {
  if (req.user && (req.user.role === 'manager' || req.user.role === 'admin')) {
    return next();
  }
  return res.status(403).json({ message: 'Access denied. Manager or Admin role required.' });
};

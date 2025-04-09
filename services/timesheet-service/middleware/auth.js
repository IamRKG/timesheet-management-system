const axios = require('axios');

const AUTH_SERVICE = process.env.AUTH_SERVICE_URL || 'http://localhost:4001';

// Verify JWT token middleware by calling auth service
exports.verifyToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1] || req.headers.authorization;
    
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }
    
    // Call auth service to validate token and get user
    const response = await axios.get(`${AUTH_SERVICE}/api/users/me`, {
      headers: { Authorization: token }
    });
    
    req.user = response.data;
    next();
  } catch (error) {
    if (error.response?.status === 401) {
      return res.status(401).json({ message: 'Invalid or expired token' });
    }
    return res.status(500).json({ message: 'Authentication service error' });
  }
};

// Check if user is manager or admin
exports.isManagerOrAdmin = (req, res, next) => {
  if (req.user && (req.user.role === 'manager' || req.user.role === 'admin')) {
    return next();
  }
  return res.status(403).json({ message: 'Access denied. Manager or Admin role required.' });
};

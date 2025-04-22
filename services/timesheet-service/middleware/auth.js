const axios = require('axios');

const AUTH_SERVICE = process.env.AUTH_SERVICE_URL || 'http://localhost:4001';

// Verify JWT token middleware by calling auth service
exports.verifyToken = async (req, res, next) => {
  console.log('verifyToken middleware called');
  
  try {
    // Extract token from Authorization header
    let token = req.headers.authorization;
    
    // Log the raw authorization header for debugging
    console.log('Authorization header:', token ? `${token.substring(0, 15)}...` : 'missing');
    
    if (!token) {
      console.log('No token provided in request');
      return res.status(401).json({ message: 'No token provided' });
    }
    
    // Normalize token format - ensure it has 'Bearer ' prefix
    if (!token.startsWith('Bearer ')) {
      token = `Bearer ${token}`;
    }
    
    console.log('Normalized token format:', `${token.substring(0, 15)}...`);
    console.log('Calling auth service to validate token at:', `${AUTH_SERVICE}/api/users/me`);
    
    // Call auth service to validate token and get user
    const response = await axios.get(`${AUTH_SERVICE}/api/users/me`, {
      headers: { Authorization: token }
    });
    
    console.log('Auth service response status:', response.status);
    
    if (!response.data) {
      console.error('Auth service returned empty data');
      return res.status(401).json({ message: 'Invalid token - no user data returned' });
    }
    
    // Log user data for debugging
    console.log('User data received from auth service:', {
      id: response.data._id || response.data.id,
      email: response.data.email,
      role: response.data.role
    });
    
    // Ensure the user object has both _id and id properties for compatibility
    const user = response.data;
    if (user._id && !user.id) {
      user.id = user._id.toString();
    } else if (user.id && !user._id) {
      user._id = user.id;
    }
    
    // Set the user in the request object
    req.user = user;
    console.log('User set in request object with ID:', user._id || user.id);
    
    next();
  } catch (error) {
    console.error('Auth verification error:', error.message);
    
    // Log detailed error information
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', JSON.stringify(error.response.data));
    } else if (error.request) {
      console.error('No response received from auth service');
    } else {
      console.error('Error setting up request:', error.message);
    }
    
    // Return appropriate error responses
    if (error.response?.status === 401) {
      return res.status(401).json({ message: 'Invalid or expired token' });
    } else if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
      console.error('Cannot connect to auth service');
      return res.status(503).json({ message: 'Authentication service unavailable' });
    }
    
    return res.status(500).json({ 
      message: 'Authentication service error',
      details: error.message
    });
  }
};

// Check if user is manager or admin
exports.isManagerOrAdmin = (req, res, next) => {
  console.log('isManagerOrAdmin middleware called');
  
  if (!req.user) {
    console.log('No user in request');
    return res.status(401).json({ message: 'Authentication required' });
  }
  
  console.log('Checking user role:', req.user.role);
  
  if (req.user.role === 'manager' || req.user.role === 'admin') {
    console.log('User has required role');
    return next();
  }
  
  console.log('Access denied - user role not manager or admin');
  return res.status(403).json({ message: 'Access denied. Manager or Admin role required.' });
};
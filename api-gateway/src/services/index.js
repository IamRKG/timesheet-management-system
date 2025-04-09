const axios = require('axios');

const createServices = (req) => {
  // Get auth token from request headers
  const getAuthToken = () => {
    const authHeader = req.headers.authorization || '';
    return authHeader.split(' ')[1] || '';
  };
  
  // Create service instances with base URLs
  const authService = axios.create({
    baseURL: process.env.AUTH_SERVICE_URL || 'http://localhost:4001'
  });
  
  const timesheetService = axios.create({
    baseURL: process.env.TIMESHEET_SERVICE_URL || 'http://localhost:4002'
  });
  
  const notificationService = axios.create({
    baseURL: process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:4004'
  });
  
  return {
    getAuthToken,
    authService,
    timesheetService,
    notificationService
  };
};

module.exports = createServices;

const axios = require('axios');

const createServices = (req) => {
  // Get the auth token from the request headers
  const getAuthToken = () => {
    return req.headers.authorization || '';
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

  // Add response interceptor to log responses
  timesheetService.interceptors.response.use(
    (response) => {
      console.log(`Response from ${response.config.url}:`, JSON.stringify(response.data, null, 2));
      return response;
    },
    (error) => {
      console.error(`Error from timesheet service:`, error.message);
      return Promise.reject(error);
    }
  );

  return {
    getAuthToken,
    authService,
    timesheetService,
    notificationService
  };
};

module.exports = createServices;

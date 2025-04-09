const axios = require('axios');

// Service URLs
const AUTH_SERVICE = process.env.AUTH_SERVICE_URL || 'http://localhost:4001';
const TIMESHEET_SERVICE = process.env.TIMESHEET_SERVICE_URL || 'http://localhost:4002';
const REPORTING_SERVICE = process.env.REPORTING_SERVICE_URL || 'http://localhost:4003';
const NOTIFICATION_SERVICE = process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:4004';

const resolvers = {
  Query: {
    // User queries
    me: async (_, __, { token }) => {
      try {
        const response = await axios.get(`${AUTH_SERVICE}/api/users/me`, {
          headers: { Authorization: token }
        });
        return response.data;
      } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to fetch user data');
      }
    },
    
    user: async (_, { id }, { token }) => {
      try {
        const response = await axios.get(`${AUTH_SERVICE}/api/users/${id}`, {
          headers: { Authorization: token }
        });
        return response.data;
      } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to fetch user');
      }
    },
    
    users: async (_, __, { token }) => {
      try {
        const response = await axios.get(`${AUTH_SERVICE}/api/users`, {
          headers: { Authorization: token }
        });
        return response.data;
      } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to fetch users');
      }
    },
    
    // TimeSheet queries
    timeSheet: async (_, { id }, { token }) => {
      try {
        const response = await axios.get(`${TIMESHEET_SERVICE}/api/timesheets/${id}`, {
          headers: { Authorization: token }
        });
        return response.data;
      } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to fetch timesheet');
      }
    },
    
    myTimeSheets: async (_, { status }, { token }) => {
      try {
        const url = status 
          ? `${TIMESHEET_SERVICE}/api/timesheets/my?status=${status}`
          : `${TIMESHEET_SERVICE}/api/timesheets/my`;
        
        const response = await axios.get(url, {
          headers: { Authorization: token }
        });
        return response.data;
      } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to fetch timesheets');
      }
    },
    
    pendingApprovals: async (_, __, { token }) => {
      try {
        const response = await axios.get(`${TIMESHEET_SERVICE}/api/timesheets/pending-approvals`, {
          headers: { Authorization: token }
        });
        return response.data;
      } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to fetch pending approvals');
      }
    },
    
    // TimeEntry queries
    timeEntry: async (_, { id }, { token }) => {
      try {
        const response = await axios.get(`${TIMESHEET_SERVICE}/api/time-entries/${id}`, {
          headers: { Authorization: token }
        });
        return response.data;
      } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to fetch time entry');
      }
    },
    
    myTimeEntries: async (_, { startDate, endDate }, { token }) => {
      try {
        const response = await axios.get(
          `${TIMESHEET_SERVICE}/api/time-entries/my?startDate=${startDate}&endDate=${endDate}`,
          { headers: { Authorization: token } }
        );
        return response.data;
      } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to fetch time entries');
      }
    },
    
    // Reporting
    departmentReport: async (_, { department, startDate, endDate }, { token }) => {
      try {
        const response = await axios.get(
          `${REPORTING_SERVICE}/api/reports/department?department=${department}&startDate=${startDate}&endDate=${endDate}`,
          { headers: { Authorization: token } }
        );
        return response.data;
      } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to generate department report');
      }
    },
    
    projectReport: async (_, { project, startDate, endDate }, { token }) => {
      try {
        const response = await axios.get(
          `${REPORTING_SERVICE}/api/reports/project?project=${project}&startDate=${startDate}&endDate=${endDate}`,
          { headers: { Authorization: token } }
        );
        return response.data;
      } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to generate project report');
      }
    },
  },
  
  Mutation: {
    // Auth mutations
    register: async (_, { input }) => {
      try {
        const response = await axios.post(`${AUTH_SERVICE}/api/auth/register`, input);
        return response.data;
      } catch (error) {
        throw new Error(error.response?.data?.message || 'Registration failed');
      }
    },
    
    login: async (_, { email, password }) => {
      try {
        const response = await axios.post(`${AUTH_SERVICE}/api/auth/login`, { email, password });
        
        // Validate that the response contains the expected data
        if (!response.data || !response.data.user || !response.data.user.id) {
          console.error('Invalid auth service response:', response.data);
          throw new Error('Authentication service returned invalid data');
        }
        
        return {
          token: response.data.token,
          user: {
            id: response.data.user.id,
            email: response.data.user.email,
            firstName: response.data.user.firstName,
            lastName: response.data.user.lastName,
            role: response.data.user.role,
            department: response.data.user.department,
            createdAt: response.data.user.createdAt,
            updatedAt: response.data.user.updatedAt
          }
        };
      } catch (error) {
        console.error('Login error:', error.response?.data || error.message);
        throw new Error(error.response?.data?.message || 'Login failed');
      }
    },
    
    // TimeEntry mutations
    createTimeEntry: async (_, { input }, { token }) => {
      try {
        const response = await axios.post(
          `${TIMESHEET_SERVICE}/api/time-entries`,
          input,
          { headers: { Authorization: token } }
        );
        return response.data;
      } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to create time entry');
      }
    },
    
    updateTimeEntry: async (_, { id, input }, { token }) => {
      try {
        const response = await axios.put(
          `${TIMESHEET_SERVICE}/api/time-entries/${id}`,
          input,
          { headers: { Authorization: token } }
        );
        return response.data;
      } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to update time entry');
      }
    },
    
    deleteTimeEntry: async (_, { id }, { token }) => {
      try {
        await axios.delete(
          `${TIMESHEET_SERVICE}/api/time-entries/${id}`,
          { headers: { Authorization: token } }
        );
        return true;
      } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to delete time entry');
      }
    },
    
    // TimeSheet mutations
    createTimeSheet: async (_, { weekStarting }, { token }) => {
      try {
        const response = await axios.post(
          `${TIMESHEET_SERVICE}/api/timesheets`,
          { weekStarting },
          { headers: { Authorization: token } }
        );
        return response.data;
      } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to create timesheet');
      }
    },
    
    submitTimeSheet: async (_, { id }, { token }) => {
      try {
        const response = await axios.post(
          `${TIMESHEET_SERVICE}/api/timesheets/${id}/submit`,
          {},
          { headers: { Authorization: token } }
        );
        
        // Notify manager about submission
        try {
          await axios.post(
            `${NOTIFICATION_SERVICE}/api/notifications/timesheet-submitted`,
            { timesheetId: id },
            { headers: { Authorization: token } }
          );
        } catch (notifyError) {
          console.error('Notification failed:', notifyError);
        }
        
        return response.data;
      } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to submit timesheet');
      }
    },
    
    approveTimeSheet: async (_, { id, comments }, { token }) => {
      try {
        const response = await axios.post(
          `${TIMESHEET_SERVICE}/api/timesheets/${id}/approve`,
          { comments },
          { headers: { Authorization: token } }
        );
        
        // Notify employee about approval
        try {
          await axios.post(
            `${NOTIFICATION_SERVICE}/api/notifications/timesheet-approved`,
            { timesheetId: id, comments },
            { headers: { Authorization: token } }
          );
        } catch (notifyError) {
          console.error('Notification failed:', notifyError);
        }
        
        return response.data;
      } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to approve timesheet');
      }
    },
    
    rejectTimeSheet: async (_, { id, comments }, { token }) => {
      try {
        const response = await axios.post(
          `${TIMESHEET_SERVICE}/api/timesheets/${id}/reject`,
          { comments },
          { headers: { Authorization: token } }
        );
        
        // Notify employee about rejection
        try {
          await axios.post(
            `${NOTIFICATION_SERVICE}/api/notifications/timesheet-rejected`,
            { timesheetId: id, comments },
            { headers: { Authorization: token } }
          );
        } catch (notifyError) {
          console.error('Notification failed:', notifyError);
        }
        
        return response.data;
      } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to reject timesheet');
      }
    },
  }
};

module.exports = resolvers;

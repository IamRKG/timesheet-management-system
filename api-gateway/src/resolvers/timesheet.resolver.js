const { ApolloError, AuthenticationError } = require('apollo-server-express');
const { ensureId } = require('../utils/transformers');

// Get a specific timesheet
const timeSheet = async (_, { id }, { user, services }) => {
  try {
    if (!user) {
      throw new AuthenticationError('You must be logged in to view timesheets');
    }
    
    const response = await services.timesheetService.get(`/api/timesheets/${id}`, {
      headers: {
        Authorization: services.getAuthToken()
      }
    });
    
    return ensureId(response.data);
  } catch (error) {
    console.error('Error fetching timesheet:', error);
    throw new ApolloError(
      error.response?.data?.message || 'Failed to fetch timesheet'
    );
  }
};

// Get all timesheets for the current user
const myTimeSheets = async (_, __, { user, services }) => {
  try {
    if (!user) {
      throw new AuthenticationError('You must be logged in to view your timesheets');
    }
    
    const response = await services.timesheetService.get('/api/timesheets/my', {
      headers: {
        Authorization: services.getAuthToken()
      }
    });
    
    return ensureId(response.data);
  } catch (error) {
    console.error('Error fetching timesheets:', error);
    throw new ApolloError(
      error.response?.data?.message || 'Failed to fetch timesheets'
    );
  }
};

// Get all pending timesheets for approval (managers only)
const pendingApprovals = async (_, __, { user, services }) => {
  try {
    if (!user) {
      throw new AuthenticationError('You must be logged in to view pending approvals');
    }
    
    if (user.role !== 'manager' && user.role !== 'admin') {
      throw new AuthenticationError('You must be a manager or admin to view pending approvals');
    }
    
    const response = await services.timesheetService.get('/api/timesheets/pending/approval', {
      headers: {
        Authorization: services.getAuthToken()
      }
    });
    
    return ensureId(response.data);
  } catch (error) {
    console.error('Error fetching pending approvals:', error);
    throw new ApolloError(
      error.response?.data?.message || 'Failed to fetch pending approvals'
    );
  }
};

// Create a new timesheet
const createTimeSheet = async (_, { weekStarting }, { user, services }) => {
  try {
    if (!user) {
      throw new AuthenticationError('You must be logged in to create a timesheet');
    }
    
    const response = await services.timesheetService.post('/api/timesheets', {
      weekStarting
    }, {
      headers: {
        Authorization: services.getAuthToken()
      }
    });
    
    return ensureId(response.data);
  } catch (error) {
    console.error('Error creating timesheet:', error);
    throw new ApolloError(
      error.response?.data?.message || 'Failed to create timesheet'
    );
  }
};

// Submit a timesheet for approval
const submitTimeSheet = async (_, { id }, { user, services }) => {
  try {
    if (!user) {
      throw new AuthenticationError('You must be logged in to submit a timesheet');
    }
    
    const response = await services.timesheetService.post(`/api/timesheets/${id}/submit`, {}, {
      headers: {
        Authorization: services.getAuthToken()
      }
    });
    
    return ensureId(response.data);
  } catch (error) {
    console.error('Error submitting timesheet:', error);
    throw new ApolloError(
      error.response?.data?.message || 'Failed to submit timesheet'
    );
  }
};

// Approve a timesheet
const approveTimeSheet = async (_, { id, comments }, { user, services }) => {
  try {
    if (!user) {
      throw new AuthenticationError('You must be logged in to approve a timesheet');
    }
    
    if (user.role !== 'manager' && user.role !== 'admin') {
      throw new AuthenticationError('You must be a manager or admin to approve timesheets');
    }
    
    const response = await services.timesheetService.post(`/api/timesheets/${id}/approve`, {
      comments
    }, {
      headers: {
        Authorization: services.getAuthToken()
      }
    });
    
    return ensureId(response.data);
  } catch (error) {
    console.error('Error approving timesheet:', error);
    throw new ApolloError(
      error.response?.data?.message || 'Failed to approve timesheet'
    );
  }
};

// Reject a timesheet
const rejectTimeSheet = async (_, { id, comments }, { user, services }) => {
  try {
    if (!user) {
      throw new AuthenticationError('You must be logged in to reject a timesheet');
    }
    
    if (user.role !== 'manager' && user.role !== 'admin') {
      throw new AuthenticationError('You must be a manager or admin to reject timesheets');
    }
    
    const response = await services.timesheetService.post(`/api/timesheets/${id}/reject`, {
      comments
    }, {
      headers: {
        Authorization: services.getAuthToken()
      }
    });
    
    return ensureId(response.data);
  } catch (error) {
    console.error('Error rejecting timesheet:', error);
    throw new ApolloError(
      error.response?.data?.message || 'Failed to reject timesheet'
    );
  }
};

module.exports = {
  Query: {
    timeSheet,
    myTimeSheets,
    pendingApprovals
  },
  Mutation: {
    createTimeSheet,
    submitTimeSheet,
    approveTimeSheet,
    rejectTimeSheet
  }
};

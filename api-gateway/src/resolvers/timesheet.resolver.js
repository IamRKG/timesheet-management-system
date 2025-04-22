const axios = require('axios');
const { ApolloError, AuthenticationError } = require('apollo-server-express');
const { transformMongoDocument } = require('../utils/mongoTransformer');

// Service URLs
const TIMESHEET_SERVICE = process.env.TIMESHEET_SERVICE_URL || 'http://localhost:4002';
const NOTIFICATION_SERVICE = process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:4004';

// TimeSheet queries
const timeSheet = async (_, { id }, { token }) => {
  try {
    if (!token) {
      throw new AuthenticationError('You must be logged in');
    }
    
    const response = await axios.get(`${TIMESHEET_SERVICE}/api/timesheets/${id}`, {
      headers: { Authorization: token }
    });
    
    return transformMongoDocument(response.data);
  } catch (error) {
    throw new ApolloError(
      error.response?.data?.message || 'Failed to fetch timesheet'
    );
  }
};

const myTimeSheets = async (_, { status }, { token }) => {
  try {
    if (!token) {
      throw new AuthenticationError('You must be logged in');
    }
    
    const url = status 
      ? `${TIMESHEET_SERVICE}/api/timesheets/my?status=${status}`
      : `${TIMESHEET_SERVICE}/api/timesheets/my`;
    
    const response = await axios.get(url, {
      headers: { Authorization: token }
    });
    
    return transformMongoDocument(response.data);
  } catch (error) {
    throw new ApolloError(
      error.response?.data?.message || 'Failed to fetch timesheets'
    );
  }
};

const pendingApprovals = async (_, __, { token }) => {
  try {
    if (!token) {
      throw new AuthenticationError('You must be logged in');
    }
    
    const response = await axios.get(`${TIMESHEET_SERVICE}/api/timesheets/pending-approvals`, {
      headers: { Authorization: token }
    });
    
    return transformMongoDocument(response.data);
  } catch (error) {
    throw new ApolloError(
      error.response?.data?.message || 'Failed to fetch pending approvals'
    );
  }
};

// TimeSheet mutations
const createTimeSheet = async (_, { weekStarting }, { token }) => {
  try {
    if (!token) {
      throw new AuthenticationError('You must be logged in');
    }
    
    const response = await axios.post(
      `${TIMESHEET_SERVICE}/api/timesheets`,
      { weekStarting },
      { headers: { Authorization: token } }
    );
    
    return transformMongoDocument(response.data);
  } catch (error) {
    throw new ApolloError(
      error.response?.data?.message || 'Failed to create timesheet'
    );
  }
};

const submitTimeSheet = async (_, { id }, { token }) => {
  try {
    if (!token) {
      throw new AuthenticationError('You must be logged in');
    }
    
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
    
    return transformMongoDocument(response.data);
  } catch (error) {
    throw new ApolloError(
      error.response?.data?.message || 'Failed to submit timesheet'
    );
  }
};

const approveTimeSheet = async (_, { id, comments }, { token }) => {
  try {
    if (!token) {
      throw new AuthenticationError('You must be logged in');
    }
    
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
    
    return transformMongoDocument(response.data);
  } catch (error) {
    throw new ApolloError(
      error.response?.data?.message || 'Failed to approve timesheet'
    );
  }
};

const rejectTimeSheet = async (_, { id, comments }, { token }) => {
  try {
    if (!token) {
      throw new AuthenticationError('You must be logged in');
    }
    
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
    
    return transformMongoDocument(response.data);
  } catch (error) {
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
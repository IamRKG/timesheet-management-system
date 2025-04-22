const axios = require('axios');
const { ApolloError, AuthenticationError } = require('apollo-server-express');
const { transformMongoDocument } = require('../utils/mongoTransformer');

// Service URL
const REPORTING_SERVICE = process.env.REPORTING_SERVICE_URL || 'http://localhost:4003';

// Reporting queries
const departmentReport = async (_, { department, startDate, endDate }, { token }) => {
  try {
    if (!token) {
      throw new AuthenticationError('You must be logged in');
    }
    
    const response = await axios.get(
      `${REPORTING_SERVICE}/api/reports/department?department=${department}&startDate=${startDate}&endDate=${endDate}`,
      { headers: { Authorization: token } }
    );
    
    return transformMongoDocument(response.data);
  } catch (error) {
    throw new ApolloError(
      error.response?.data?.message || 'Failed to generate department report'
    );
  }
};

const projectReport = async (_, { project, startDate, endDate }, { token }) => {
  try {
    if (!token) {
      throw new AuthenticationError('You must be logged in');
    }
    
    const response = await axios.get(
      `${REPORTING_SERVICE}/api/reports/project?project=${project}&startDate=${startDate}&endDate=${endDate}`,
      { headers: { Authorization: token } }
    );
    
    return transformMongoDocument(response.data);
  } catch (error) {
    throw new ApolloError(
      error.response?.data?.message || 'Failed to generate project report'
    );
  }
};

module.exports = {
  Query: {
    departmentReport,
    projectReport
  }
};
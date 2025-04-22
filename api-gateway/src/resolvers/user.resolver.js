const axios = require('axios');
const { ApolloError, AuthenticationError } = require('apollo-server-express');
const { transformMongoDocument } = require('../utils/mongoTransformer');

// Service URL
const AUTH_SERVICE = process.env.AUTH_SERVICE_URL || 'http://localhost:4001';

// User queries
const me = async (_, __, { token }) => {
  try {
    if (!token) {
      throw new AuthenticationError('You must be logged in');
    }
    
    const response = await axios.get(`${AUTH_SERVICE}/api/users/me`, {
      headers: { Authorization: token }
    });
    
    return transformMongoDocument(response.data);
  } catch (error) {
    throw handleError(error, 'Failed to fetch user data', { isAuthError: !token });
  }
};
const user = async (_, { id }, { token }) => {
  try {
    if (!token) {
      throw new AuthenticationError('You must be logged in');
    }
    
    const response = await axios.get(`${AUTH_SERVICE}/api/users/${id}`, {
      headers: { Authorization: token }
    });
    
    return transformMongoDocument(response.data);
  } catch (error) {
    throw new ApolloError(
      error.response?.data?.message || 'Failed to fetch user'
    );
  }
};

const users = async (_, __, { token }) => {
  try {
    if (!token) {
      throw new AuthenticationError('You must be logged in');
    }
    
    const response = await axios.get(`${AUTH_SERVICE}/api/users`, {
      headers: { Authorization: token }
    });
    
    return transformMongoDocument(response.data);
  } catch (error) {
    throw new ApolloError(
      error.response?.data?.message || 'Failed to fetch users'
    );
  }
};

// Auth mutations
const register = async (_, { input }) => {
  try {
    const response = await axios.post(`${AUTH_SERVICE}/api/auth/register`, input);
    return transformMongoDocument(response.data);
  } catch (error) {
    throw new ApolloError(
      error.response?.data?.message || 'Registration failed'
    );
  }
};

const login = async (_, { email, password }) => {
  try {
    const response = await axios.post(`${AUTH_SERVICE}/api/auth/login`, { email, password });
    
    // Validate that the response contains the expected data
    if (!response.data || !response.data.user || !response.data.user.id) {
      console.error('Invalid auth service response:', response.data);
      throw new Error('Authentication service returned invalid data');
    }
    
    return transformMongoDocument(response.data);
  } catch (error) {
    console.error('Login error:', error.response?.data || error.message);
    throw new ApolloError(
      error.response?.data?.message || 'Login failed'
    );
  }
};

// User update mutations
const updateUser = async (_, { id, input }, { token, user }) => {
  try {
    if (!token) {
      throw new AuthenticationError('You must be logged in to update a user profile');
    }

    // Regular users can only update their own data
    if (user.role === 'employee' && user.id !== id) {
      throw new ForbiddenError('Access denied');
    }

    // Only admins can change roles
    const updateData = { ...input };
    if (user.role !== 'admin') {
      delete updateData.role;
    }
    
    const response = await axios.put(
      `${AUTH_SERVICE}/api/users/${id}`,
      updateData,
      { headers: { Authorization: token } }
    );
    
    return transformMongoDocument(response.data);
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw new ApolloError(
      error.response?.data?.message || 'Failed to update user profile'
    );
  }
};const changePassword = async (_, { currentPassword, newPassword }, { token, user }) => {
  try {
    if (!token) {
      throw new AuthenticationError('You must be logged in to change your password');
    }

    // Users can only change their own password
    const response = await axios.put(
      `${AUTH_SERVICE}/api/users/${user.id}/change-password`,
      { currentPassword, newPassword },
      { headers: { Authorization: token } }
    );
    
    return true;
  } catch (error) {
    console.error('Error changing password:', error);
    throw new ApolloError(
      error.response?.data?.message || 'Failed to change password'
    );
  }
};
module.exports = {
  Query: {
    me,
    user,
    users
  },
  Mutation: {
    register,
    login,
    updateUser,
    changePassword
  }
};
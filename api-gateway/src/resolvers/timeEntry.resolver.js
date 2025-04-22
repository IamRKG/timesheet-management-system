const { ApolloError, AuthenticationError } = require('apollo-server-express');
const { transformMongoDocument } = require('../utils/mongoTransformer');

// Resolver for creating a time entry
module.exports.createTimeEntry = async (_, { input }, { user, services }) => {
  try {
    if (!user) {
      throw new AuthenticationError('You must be logged in to create a time entry');
    }
    
    const response = await services.timesheetService.post('/api/time-entries', {
      ...input,
      userId: user.id
    }, {
      headers: {
        Authorization: services.getAuthToken()
      }
    });
    
    return ensureId(response.data);
  } catch (error) {
    console.error('Error creating time entry:', error);
    throw new ApolloError(
      error.response?.data?.message || 'Failed to create time entry'
    );
  }
};
// Get time entries for the current user
const myTimeEntries = async (_, { startDate, endDate }, { user, services }) => {
  // ... existing implementation
};

// Get a specific time entry
const timeEntry = async (_, { id }, { user, services }) => {
  // ... existing implementation
};

// Update a time entry
const updateTimeEntry = async (_, { id, input }, { user, services }) => {
  // ... existing implementation
};

// Delete a time entry
const deleteTimeEntry = async (_, { id }, { user, services }) => {
  // ... existing implementation
};

// Replace the mock implementation with the actual one
const createTimeEntry = async (_, { input }, { user, services }) => {
  try {
    if (!user) {
      throw new AuthenticationError('You must be logged in to create a time entry');
    }
    
    console.log('Creating time entry with input:', input);
    console.log('User:', user);
    
    // Make the request to the timesheet service
    const response = await services.timesheetService.post('/api/time-entries', {
      ...input,
      userId: user.id
    }, {
      headers: {
        Authorization: services.getAuthToken()
      }
    });
    
    // Ensure the response has an id field
    const result = ensureId(response.data);
    
    return result;
  } catch (error) {
    console.error('Error creating time entry:', error);
    throw new ApolloError(
      error.response?.data?.message || error.message || 'Failed to create time entry'
    );
  }
};

module.exports = {
  TimeEntry: {
    // Ensure id is always present
    id: (parent) => {
      if (parent.id) return parent.id;
      if (parent._id) return parent._id.toString();
      console.error('No ID found for TimeEntry:', parent);
      return 'missing-id-' + Date.now(); // Fallback for debugging
    }
  },
  Query: {
    timeEntry,
    myTimeEntries
  },
  Mutation: {
    createTimeEntry, // Use the actual implementation instead of mockCreateTimeEntry
    updateTimeEntry,
    deleteTimeEntry
  }
};
const { ApolloError, AuthenticationError } = require('apollo-server-express');
const { transformMongoDocument } = require('../utils/mongoTransformer');

// Resolver for creating a time entry
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
    
    console.log('Raw response from timesheet service:', JSON.stringify(response.data, null, 2));
    
    // Transform the response using our unified utility
    const result = transformMongoDocument(response.data);
    
    console.log('Processed result with id:', JSON.stringify(result, null, 2));
    
    return result;
  } catch (error) {
    console.error('Error creating time entry:', error);
    if (error.response) {
      console.error('Error response status:', error.response.status);
      console.error('Error response data:', JSON.stringify(error.response.data, null, 2));
    }
    throw new ApolloError(
      error.response?.data?.message || error.message || 'Failed to create time entry'
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

const mockCreateTimeEntry = async (_, { input }) => {
  console.log('Using mock resolver with input:', input);
  
  // Return a hardcoded response with a valid ID and timesheetId
  return {
    id: 'mock-id-' + Date.now(),
    userId: 'mock-user-id',
    date: new Date().toISOString(),
    startTime: input.startTime,
    endTime: input.endTime || '17:00',
    duration: 8,
    project: input.project || 'Mock Project',
    description: input.description || 'Mock Description',
    status: 'draft',
    timesheetId: 'mock-timesheet-id',  // Add this field
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
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
    // Use the real implementation instead of the mock
    createTimeEntry,
    updateTimeEntry,
    deleteTimeEntry
  }
};

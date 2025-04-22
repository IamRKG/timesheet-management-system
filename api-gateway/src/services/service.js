const { transformMongoDocument } = require('../utils/mongoTransformer');

// Use this in your resolvers
const createTimeEntry = async (_, { input }, { user, services }) => {
  try {
    // ... existing code ...
    
    const response = await services.timesheetService.post('/api/time-entries', {
      ...input,
      userId: user.id
    }, {
      headers: {
        Authorization: services.getAuthToken()
      }
    });
    
    return transformMongoDocument(response.data);
  } catch (error) {
    // ... error handling ...
  }
};
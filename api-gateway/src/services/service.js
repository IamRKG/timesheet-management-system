// Add a helper function to transform _id to id
const transformMongoResponse = (data) => {
  if (!data) return null;
  
  if (Array.isArray(data)) {
    return data.map(item => transformMongoResponse(item));
  }
  
  if (typeof data === 'object') {
    const transformed = { ...data };
    if (data._id) {
      transformed.id = data._id;
      delete transformed._id;
    }
    
    // Transform nested objects
    Object.keys(transformed).forEach(key => {
      if (typeof transformed[key] === 'object' && transformed[key] !== null) {
        transformed[key] = transformMongoResponse(transformed[key]);
      }
    });
    
    return transformed;
  }
  
  return data;
};

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
    
    return transformMongoResponse(response.data);
  } catch (error) {
    // ... error handling ...
  }
};

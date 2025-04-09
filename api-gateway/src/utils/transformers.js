/**
 * Transform MongoDB document to GraphQL object
 * Converts _id to id and handles nested objects and arrays
 */
const ensureId = (data) => {
  if (!data) return null;
  
  // Handle arrays
  if (Array.isArray(data)) {
    return data.map(item => ensureId(item));
  }
  
  // Handle plain objects
  if (typeof data === 'object' && data !== null) {
    const result = { ...data };
    
    // Convert _id to id
    if (data._id && !data.id) {
      result.id = data._id.toString();
    }
    
    // If id exists but it's not a string, convert it
    if (result.id && typeof result.id !== 'string') {
      result.id = result.id.toString();
    }
    
    // Process nested objects
    Object.keys(result).forEach(key => {
      if (typeof result[key] === 'object' && result[key] !== null) {
        result[key] = ensureId(result[key]);
      }
    });
    
    return result;
  }
  
  return data;
};

module.exports = {
  ensureId
};

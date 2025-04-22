/**
 * Transform MongoDB document to GraphQL object
 * Converts _id to id and handles nested objects and arrays
 */
const transformMongoDocument = (doc) => {
  if (!doc) return null;
  
  // Handle arrays
  if (Array.isArray(doc)) {
    return doc.map(item => transformMongoDocument(item));
  }
  
  // Handle plain objects
  if (typeof doc === 'object' && doc !== null) {
    const result = { ...doc };
    
    // Convert _id to id
    if (doc._id) {
      result.id = doc._id.toString();
      delete result._id;
    }
    
    // Process nested objects
    Object.keys(result).forEach(key => {
      if (typeof result[key] === 'object' && result[key] !== null) {
        result[key] = transformMongoDocument(result[key]);
      }
    });
    
    return result;
  }
  
  return doc;
};

module.exports = {
  transformMongoDocument
};
/**
 * Transforms MongoDB documents to GraphQL-friendly format
 * - Converts _id to id
 * - Handles nested objects and arrays
 * - Preserves existing id if present
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
    
    // Convert _id to id if _id exists and id doesn't
    if (doc._id && !doc.id) {
      result.id = doc._id.toString();
    }
    
    // Ensure id is a string if it exists
    if (result.id && typeof result.id !== 'string') {
      result.id = result.id.toString();
    }
    
    // Process nested objects
    Object.keys(result).forEach(key => {
      if (key !== '_id' && typeof result[key] === 'object' && result[key] !== null) {
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
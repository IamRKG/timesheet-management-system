/**
 * @deprecated Use mongoTransformer.transformMongoDocument instead
 */
const transformMongoDocument = (doc) => {
  if (!doc) return null;
  
  // Handle arrays
  if (Array.isArray(doc)) {
    return doc.map(item => transformMongoDocument(item));
  }
  
  // Handle plain objects
  if (typeof doc === 'object' && doc !== null) {
    const result = {};
    
    // Convert _id to id
    if (doc._id) {
      result.id = doc._id.toString();
    }
    
    // Copy all other fields
    Object.keys(doc).forEach(key => {
      if (key !== '_id') {
        if (typeof doc[key] === 'object' && doc[key] !== null) {
          result[key] = transformMongoDocument(doc[key]);
        } else {
          result[key] = doc[key];
        }
      }
    });
    
    return result;
  }
  
  return doc;
};
module.exports = {
  transformMongoDocument
};
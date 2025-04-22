const { ApolloError, AuthenticationError, ForbiddenError } = require('apollo-server-express');

/**
 * Standardized error handler for API Gateway resolvers
 * @param {Error} error - The original error
 * @param {string} defaultMessage - Default message if no specific message can be extracted
 * @param {boolean} isAuthError - Whether this is an authentication error
 * @param {boolean} isPermissionError - Whether this is a permission error
 * @param {boolean} logError - Whether to log the error
 */
function handleError(error, defaultMessage, { isAuthError = false, isPermissionError = false, logError = true } = {}) {
  // Extract the most specific error message available
  const errorMessage = error.response?.data?.message || error.message || defaultMessage;
  
  // Log the error if requested
  if (logError) {
    console.error(`API Gateway Error: ${errorMessage}`, error);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', JSON.stringify(error.response.data, null, 2));
    }
  }
  
  // Return the appropriate error type
  if (isAuthError) {
    return new AuthenticationError(errorMessage);
  } else if (isPermissionError) {
    return new ForbiddenError(errorMessage);
  } else {
    return new ApolloError(errorMessage);
  }
}

module.exports = { handleError };
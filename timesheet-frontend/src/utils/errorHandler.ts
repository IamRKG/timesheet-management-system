/**
 * Extracts a user-friendly error message from various error formats
 */
export function extractErrorMessage(error: any): string {
  if (!error) {
    return 'An unknown error occurred';
  }
  
  // GraphQL errors from Apollo
  if (error.graphQLErrors && error.graphQLErrors.length > 0) {
    return error.graphQLErrors[0].message;
  }
  
  // Network errors from Apollo
  if (error.networkError) {
    if (error.networkError.result && error.networkError.result.errors) {
      return error.networkError.result.errors[0].message;
    }
    return error.networkError.message || 'Network error occurred';
  }
  
  // Error response from axios
  if (error.response && error.response.data) {
    if (error.response.data.errors && error.response.data.errors.length > 0) {
      return error.response.data.errors[0].message;
    }
    if (error.response.data.message) {
      return error.response.data.message;
    }
  }
  
  // Standard error object
  if (error.message) {
    return error.message;
  }
  
  // Fallback for unknown error formats
  return 'An unexpected error occurred';
}
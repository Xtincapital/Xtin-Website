// Utility for making authenticated API requests with automatic token refresh

export const makeAuthenticatedRequest = async (url, options: RequestInit = {}) => {
  let token = localStorage.getItem('auth_token');
  
  if (!token) {
    throw new Error('No authentication token found');
  }

  // Add authorization header
  const headers = {
    ...options.headers,
    'Authorization': `Bearer ${token}`,
  };

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    // If token expired, try to refresh and retry
    if (response.status === 401) {
      console.log('Token expired, attempting refresh...');
      
      // Import supabase dynamically to avoid circular dependencies
      const { default: supabase } = await import('../../../supabase');
      
      try {
        const { data: { session }, error } = await supabase.auth.refreshSession();
        if (error) throw error;
        
        if (session?.access_token) {
          // Update localStorage with new token
          localStorage.setItem('auth_token', session.access_token);
          token = session.access_token;
          
          // Retry the request with new token
          const retryResponse = await fetch(url, {
            ...options,
            headers: {
              ...options.headers,
              'Authorization': `Bearer ${token}`,
            },
          });
          
          return retryResponse;
        }
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        // Remove invalid token
        localStorage.removeItem('auth_token');
        throw new Error('Authentication failed. Please login again.');
      }
    }

    return response;
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
};
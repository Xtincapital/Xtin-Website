// Global error handling middleware
export const errorHandler = (err, req, res, next) => {
  console.error('Unhandled error:', err);

  // Don't leak error details in production
  const isDevelopment = process.env.NODE_ENV === 'development';

  // Handle PostgreSQL/Supabase specific error types
  if (err.code === '23505') {
    // Unique violation error
    if (err.message.includes('email')) {
      return res.status(400).json({
        status: 400,
        message: "An account with this email already exists",
        data: null,
      });
    }
    if (err.message.includes('phone_number')) {
      return res.status(400).json({
        status: 400,
        message: "An account with this phone number already exists",
        data: null,
      });
    }
    return res.status(400).json({
      status: 400,
      message: "An account with this information already exists",
      data: null,
    });
  }

  if (err.code === '23503') {
    // Foreign key violation
    return res.status(400).json({
      status: 400,
      message: "Invalid reference - related data not found",
      data: null,
    });
  }

  if (err.code === '23502') {
    // Not null violation
    return res.status(400).json({
      status: 400,
      message: "Required field is missing",
      data: null,
    });
  }

  // Handle Supabase Auth errors
  if (err.message?.includes('Invalid login credentials')) {
    return res.status(401).json({
      status: 401,
      message: "Invalid email or password",
      data: null,
    });
  }

  if (err.message?.includes('User already registered')) {
    return res.status(400).json({
      status: 400,
      message: "An account with this email already exists",
      data: null,
    });
  }

  // Generic error response
  res.status(500).json({
    status: 500,
    message: "Server Error, please try again later.",
    ...(isDevelopment && { error: err.message })
  });
};

// 404 handler for undefined routes
export const notFound = (req, res) => {
  res.status(404).json({
    status: 404,
    message: "Route not found",
    data: null,
  });
};

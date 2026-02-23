exports.errorHandler = (err, req, res, next) => {
  console.error("Error:", err);

  // PostgreSQL errors
  if (err.code === "23505") {
    // Unique violation
    return res.status(409).json({
      success: false,
      message: "Duplicate entry",
      error: err.detail,
    });
  }

  if (err.code === "23503") {
    // Foreign key violation
    return res.status(400).json({
      success: false,
      message: "Invalid reference",
      error: err.detail,
    });
  }

  if (err.code === "23502") {
    // Not null violation
    return res.status(400).json({
      success: false,
      message: "Required field missing",
      error: err.detail,
    });
  }

  // Default error
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal server error",
    error: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
};

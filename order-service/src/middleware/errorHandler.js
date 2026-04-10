const errorHandler = (err, req, res, next) => {
  console.error(`[${new Date().toISOString()}] ERROR:`, err.message);

  // MongoDB validation error
  if (err.name === "ValidationError") {
    return res.status(422).json({
      success: false,
      message: "Du lieu khong hop le",
      errors: Object.values(err.errors).map((e) => ({
        field: e.path,
        message: e.message,
      })),
    });
  }

  // MongoDB duplicate key
  if (err.code === 11000) {
    return res.status(409).json({
      success: false,
      message: "Du lieu da ton tai",
    });
  }

  // MongoDB CastError (sai định dạng ObjectId)
  if (err.name === "CastError") {
    return res.status(400).json({
      success: false,
      message: "ID khong hop le",
    });
  }

  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Loi he thong",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};

module.exports = errorHandler;
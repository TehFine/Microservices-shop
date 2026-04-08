const errorHandler = (err, req, res, next) => {
  console.error(`[${new Date().toISOString()}] ERROR:`, err.message);

  // Prisma unique constraint
  if (err.code === "P2002") {
    return res.status(409).json({
      success: false,
      message: "Email đã được đăng ký",
    });
  }

  // Prisma record not found
  if (err.code === "P2025") {
    return res.status(404).json({
      success: false,
      message: "Không tìm thấy bản ghi",
    });
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    return res.status(401).json({
      success: false,
      message: "Token không hợp lệ",
    });
  }

  if (err.name === "TokenExpiredError") {
    return res.status(401).json({
      success: false,
      message: "Token đã hết hạn",
    });
  }

  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Lỗi hệ thống",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};

module.exports = errorHandler;
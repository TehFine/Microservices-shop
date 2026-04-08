const errorHandler = (err, req, res, next) => {
  console.error(`[${new Date().toISOString()}] ERROR:`, err.message);

  // Prisma: vi phạm unique constraint
  if (err.code === "P2002") {
    return res.status(409).json({
      success: false,
      message: `Giá trị '${err.meta?.target}' đã tồn tại`,
    });
  }

  // Prisma: không tìm thấy record
  if (err.code === "P2025") {
    return res.status(404).json({
      success: false,
      message: "Không tìm thấy bản ghi",
    });
  }

  // Prisma: foreign key constraint
  if (err.code === "P2003") {
    return res.status(400).json({
      success: false,
      message: "ID liên kết không hợp lệ",
    });
  }

  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Lỗi hệ thống",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};

module.exports = errorHandler;
const jwt = require("jsonwebtoken");

// Xác thực token
const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      message: "Chưa đăng nhập — cần Bearer token",
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message:
        error.name === "TokenExpiredError"
          ? "Token đã hết hạn"
          : "Token không hợp lệ",
    });
  }
};

// Phân quyền theo role
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Không có quyền truy cập",
      });
    }
    next();
  };
};

module.exports = { authenticate, authorize };
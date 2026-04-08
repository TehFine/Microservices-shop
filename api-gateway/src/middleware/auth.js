const jwt = require("jsonwebtoken");

const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ success: false, message: "Chưa đăng nhập" });
  }
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    // Truyền thông tin user xuống service phía sau
    req.headers["x-user-id"] = req.user.id;
    req.headers["x-user-role"] = req.user.role;
    next();
  } catch {
    res.status(401).json({ success: false, message: "Token không hợp lệ hoặc đã hết hạn" });
  }
};

module.exports = { authenticate };
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const prisma = new PrismaClient();

// Helper tạo access + refresh token
const generateTokens = (payload) => {
  const accessToken = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "15m",
  });

  const refreshToken = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d",
  });

  return { accessToken, refreshToken };
};

// ─────────────────────────────────────────
// POST /api/auth/register
// ─────────────────────────────────────────
const register = async (req, res, next) => {
  try {
    const { email, password, name } = req.body;

    // Kiểm tra email đã tồn tại
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: "Email đã được đăng ký",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Tạo user mới
    const user = await prisma.user.create({
      data: { email, password: hashedPassword, name },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });

    // Tạo tokens
    const { accessToken, refreshToken } = generateTokens({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    // Lưu refreshToken vào DB
    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken },
    });

    res.status(201).json({
      success: true,
      message: "Đăng ký thành công",
      data: { user, accessToken, refreshToken },
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────
// POST /api/auth/login
// ─────────────────────────────────────────
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Tìm user
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: "Email hoặc mật khẩu không đúng",
      });
    }

    // Kiểm tra password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Email hoặc mật khẩu không đúng",
      });
    }

    // Tạo tokens
    const { accessToken, refreshToken } = generateTokens({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    // Lưu refreshToken
    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken },
    });

    // Trả về user (bỏ password và refreshToken)
    const { password: _, refreshToken: __, ...userSafe } = user;

    res.json({
      success: true,
      message: "Đăng nhập thành công",
      data: { user: userSafe, accessToken, refreshToken },
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────
// POST /api/auth/refresh
// ─────────────────────────────────────────
const refresh = async (req, res, next) => {
  try {
    const { refreshToken: token } = req.body;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Thiếu refresh token",
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Tìm user và kiểm tra refreshToken khớp
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
    });

    if (!user || user.refreshToken !== token) {
      return res.status(401).json({
        success: false,
        message: "Refresh token không hợp lệ",
      });
    }

    // Tạo tokens mới
    const { accessToken, refreshToken: newRefreshToken } = generateTokens({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    // Cập nhật refreshToken mới
    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: newRefreshToken },
    });

    res.json({
      success: true,
      message: "Làm mới token thành công",
      data: { accessToken, refreshToken: newRefreshToken },
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────
// GET /api/auth/me
// ─────────────────────────────────────────
const getMe = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy user",
      });
    }

    res.json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────
// POST /api/auth/logout
// ─────────────────────────────────────────
const logout = async (req, res, next) => {
  try {
    // Xoá refreshToken khỏi DB
    await prisma.user.update({
      where: { id: req.user.id },
      data: { refreshToken: null },
    });

    res.json({ success: true, message: "Đăng xuất thành công" });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────
// PUT /api/auth/change-password
// ─────────────────────────────────────────
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
    });

    // Kiểm tra password hiện tại
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Mật khẩu hiện tại không đúng",
      });
    }

    // Hash password mới
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    await prisma.user.update({
      where: { id: req.user.id },
      data: { password: hashedPassword, refreshToken: null },
    });

    res.json({
      success: true,
      message: "Đổi mật khẩu thành công — vui lòng đăng nhập lại",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { register, login, refresh, getMe, logout, changePassword };
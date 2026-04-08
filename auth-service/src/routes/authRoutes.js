const router = require("express").Router();
const { body, validationResult } = require("express-validator");
const {
  register,
  login,
  refresh,
  getMe,
  logout,
  changePassword,
} = require("../controllers/authController");
const { authenticate } = require("../middleware/authMiddleware");

// Helper validate
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      success: false,
      message: "Du lieu khong hop le",
      errors: errors.array().map((e) => ({
        field: e.path,
        message: e.msg,
      })),
    });
  }
  next();
};

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Xac thuc nguoi dung
 */

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Dang ky tai khoan
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password, name]
 *             properties:
 *               email:
 *                 type: string
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 example: "123456"
 *               name:
 *                 type: string
 *                 example: Nguyen Van A
 *     responses:
 *       201:
 *         description: Dang ky thanh cong
 *       409:
 *         description: Email da ton tai
 *       422:
 *         description: Du lieu khong hop le
 */
router.post(
  "/register",
  [
    body("email").isEmail().withMessage("Email khong hop le"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Mat khau toi thieu 6 ky tu"),
    body("name").notEmpty().withMessage("Ten khong duoc rong"),
    validate,
  ],
  register
);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Dang nhap
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: Dang nhap thanh cong
 *       401:
 *         description: Sai email hoac mat khau
 */
router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Email khong hop le"),
    body("password").notEmpty().withMessage("Mat khau khong duoc rong"),
    validate,
  ],
  login
);

/**
 * @swagger
 * /api/auth/refresh:
 *   post:
 *     summary: Lam moi access token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [refreshToken]
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: Lam moi thanh cong
 *       401:
 *         description: Refresh token khong hop le
 */
router.post("/refresh", refresh);

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Lay thong tin user hien tai
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Thanh cong
 *       401:
 *         description: Chua dang nhap
 */
router.get("/me", authenticate, getMe);

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Dang xuat
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dang xuat thanh cong
 */
router.post("/logout", authenticate, logout);

/**
 * @swagger
 * /api/auth/change-password:
 *   put:
 *     summary: Doi mat khau
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [currentPassword, newPassword]
 *             properties:
 *               currentPassword:
 *                 type: string
 *               newPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Doi mat khau thanh cong
 */
router.put("/change-password", authenticate, changePassword);

module.exports = router;
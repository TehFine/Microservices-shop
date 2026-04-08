const router = require("express").Router();
const { getCategories, createCategory } = require("../controllers/categoryController");
const { categoryValidation } = require("../middleware/validate");

/**
 * @swagger
 * tags:
 *   name: Categories
 *   description: Quản lý danh mục
 */

/**
 * @swagger
 * /api/categories:
 *   get:
 *     summary: Lấy danh sách danh mục
 *     tags: [Categories]
 *     responses:
 *       200:
 *         description: Thành công
 */
router.get("/", getCategories);

/**
 * @swagger
 * /api/categories:
 *   post:
 *     summary: Tạo danh mục mới
 *     tags: [Categories]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name: { type: string, example: "Phụ kiện" }
 *               description: { type: string }
 *     responses:
 *       201:
 *         description: Tạo thành công
 */
router.post("/", categoryValidation, createCategory);

module.exports = router;
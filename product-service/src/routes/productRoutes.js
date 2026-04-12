const router = require("express").Router();
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  uploadProductImage,
  deleteProductImage,
} = require("../controllers/productController");
const { productValidation } = require("../middleware/validate");
const { upload } = require("../config/cloudinary");

/**
 * @swagger
 * tags:
 *   name: Products
 *   description: Quản lý sản phẩm
 */

/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Lấy danh sách sản phẩm
 *     tags: [Products]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *         description: So trang
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *         description: So ban ghi moi trang
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *         description: Tim kiem theo ten
 *       - in: query
 *         name: category
 *         schema: { type: string }
 *         description: Loc theo slug danh muc (vd - mobile, laptop)
 *       - in: query
 *         name: minPrice
 *         schema: { type: number }
 *         description: Gia toi thieu
 *       - in: query
 *         name: maxPrice
 *         schema: { type: number }
 *         description: Gia toi da
 *       - in: query
 *         name: inStock
 *         schema: { type: string, enum: [true, false] }
 *         description: Chi lay san pham con hang
 *       - in: query
 *         name: sortBy
 *         schema: { type: string, enum: [name, price, createdAt], default: createdAt }
 *         description: Sap xep theo truong
 *       - in: query
 *         name: order
 *         schema: { type: string, enum: [asc, desc], default: desc }
 *         description: Chieu sap xep
 *     responses:
 *       200:
 *         description: Thanh cong
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/PaginatedProducts"
 */
router.get("/", getProducts);

/**
 * @swagger
 * /api/products:
 *   post:
 *     summary: Tạo sản phẩm mới
 *     tags: [Products]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, price]
 *             properties:
 *               name: { type: string, example: "Tai nghe Sony WH-1000XM5" }
 *               price: { type: number, example: 8990000 }
 *               description: { type: string }
 *               stock: { type: integer, example: 100 }
 *               categoryId: { type: integer, example: 1 }
 *     responses:
 *       201:
 *         description: Tạo thành công
 *       422:
 *         description: Dữ liệu không hợp lệ
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Error"
 */
router.post("/", productValidation, createProduct);

/**
 * @swagger
 * /api/products/{id}:
 *   get:
 *     summary: Lấy chi tiết sản phẩm theo ID
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Thành công
 *       404:
 *         description: Không tìm thấy
 */
router.get("/:id", getProductById);

/**
 * @swagger
 * /api/products/{id}:
 *   put:
 *     summary: Cập nhật sản phẩm
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string }
 *               price: { type: number }
 *               stock: { type: integer }
 *               description: { type: string }
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 */
router.put("/:id", updateProduct);

/**
 * @swagger
 * /api/products/{id}:
 *   delete:
 *     summary: Ẩn sản phẩm (soft delete)
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Ẩn thành công
 */
router.delete("/:id", deleteProduct);



// Middleware xử lý lỗi upload
const handleUploadError = (err, req, res, next) => {
  if (err.message === "Chi chap nhan file anh JPG, PNG, WEBP") {
    return res.status(400).json({ success: false, message: err.message });
  }
  if (err.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({
      success: false,
      message: "File qua lon, toi da 5MB",
    });
  }
  next(err);
};

/**
 * @swagger
 * /api/products/{id}/image:
 *   post:
 *     summary: Upload anh san pham
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Upload thanh cong
 *       400:
 *         description: File khong hop le
 *       404:
 *         description: Khong tim thay san pham
 */
router.post(
  "/:id/image",
  upload.single("image"),
  handleUploadError,
  uploadProductImage
);

/**
 * @swagger
 * /api/products/{id}/image:
 *   delete:
 *     summary: Xoa anh san pham
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Xoa thanh cong
 */
router.delete("/:id/image", deleteProductImage);

module.exports = router;
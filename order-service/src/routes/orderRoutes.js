const router = require("express").Router();
const {
  createOrder,
  getAllOrders,
  getOrdersByCustomer,
  getOrderById,
  updateOrderStatus,
  cancelOrder,
} = require("../controllers/orderController");

/**
 * @swagger
 * tags:
 *   name: Orders
 *   description: Quản lý đơn hàng
 */

/**
 * @swagger
 * /api/orders:
 *   get:
 *     summary: Lấy tất cả đơn hàng
 *     tags: [Orders]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, confirmed, shipping, delivered, cancelled]
 *     responses:
 *       200:
 *         description: Thành công
 */
router.get("/", getAllOrders);

/**
 * @swagger
 * /api/orders:
 *   post:
 *     summary: Tạo đơn hàng mới
 *     tags: [Orders]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [customerId, customerName, customerEmail, items, shippingAddress]
 *             properties:
 *               customerId: { type: integer, example: 1 }
 *               customerName: { type: string, example: "Nguyễn Văn A" }
 *               customerEmail: { type: string, example: "a@example.com" }
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     productId: { type: integer }
 *                     productName: { type: string }
 *                     price: { type: number }
 *                     quantity: { type: integer }
 *               shippingAddress:
 *                 type: object
 *                 properties:
 *                   street: { type: string }
 *                   district: { type: string }
 *                   city: { type: string }
 *               note: { type: string }
 *     responses:
 *       201:
 *         description: Tạo đơn hàng thành công
 */
router.post("/", createOrder);

/**
 * @swagger
 * /api/orders/customer/{customerId}:
 *   get:
 *     summary: Lấy đơn hàng theo khách hàng
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: customerId
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Thành công
 */
router.get("/customer/:customerId", getOrdersByCustomer);

router.get("/:id", getOrderById);

/**
 * @swagger
 * /api/orders/{id}/status:
 *   patch:
 *     summary: Cập nhật trạng thái đơn hàng
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, confirmed, shipping, delivered, cancelled]
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 */
router.patch("/:id/status", updateOrderStatus);
router.delete("/:id", cancelOrder);

module.exports = router;
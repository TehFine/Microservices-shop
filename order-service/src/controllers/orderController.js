const Order = require("../models/Order");

// POST /api/orders — Tạo đơn hàng
const createOrder = async (req, res, next) => {
  try {
    const { customerId, customerName, customerEmail, items, shippingAddress, note } =
      req.body;

    // Tính subtotal và totalAmount
    const processedItems = items.map((item) => ({
      ...item,
      subtotal: item.price * item.quantity,
    }));
    const totalAmount = processedItems.reduce((sum, i) => sum + i.subtotal, 0);

    const order = await Order.create({
      customerId,
      customerName,
      customerEmail,
      items: processedItems,
      totalAmount,
      shippingAddress,
      note,
    });

    res.status(201).json({
      success: true,
      data: order,
      message: "Tạo đơn hàng thành công",
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/orders — Lấy tất cả đơn hàng (admin)
const getAllOrders = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const filter = status ? { status } : {};

    const [orders, total] = await Promise.all([
      Order.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Order.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: orders,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/orders/customer/:customerId
const getOrdersByCustomer = async (req, res, next) => {
  try {
    const { customerId } = req.params;
    const { page = 1, limit = 10, status } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const filter = { customerId: parseInt(customerId) };
    if (status) filter.status = status;

    const [orders, total] = await Promise.all([
      Order.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Order.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: orders,
      pagination: {
        total,
        page: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/orders/:id
const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy đơn hàng" });
    }
    res.json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/orders/:id/status
const updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy đơn hàng" });
    }

    res.json({ success: true, data: order, message: "Cập nhật trạng thái thành công" });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/orders/:id — Huỷ đơn hàng
const cancelOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy đơn hàng" });
    }

    if (["delivered", "shipping"].includes(order.status)) {
      return res.status(400).json({
        success: false,
        message: "Không thể huỷ đơn hàng đang giao hoặc đã giao",
      });
    }

    order.status = "cancelled";
    await order.save();

    res.json({ success: true, message: "Đã huỷ đơn hàng" });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createOrder,
  getAllOrders,
  getOrdersByCustomer,
  getOrderById,
  updateOrderStatus,
  cancelOrder,
};
const mongoose = require("mongoose");

const OrderItemSchema = new mongoose.Schema(
  {
    productId: { type: Number, required: true },
    productName: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 1 },
    subtotal: { type: Number, required: true },
  },
  { _id: false }
);

const ShippingAddressSchema = new mongoose.Schema(
  {
    street: { type: String, required: true },
    district: { type: String, required: true },
    city: { type: String, required: true },
  },
  { _id: false }
);

const OrderSchema = new mongoose.Schema(
  {
    orderCode: { type: String, unique: true }, // unique: true đã tạo index rồi
    customerId: { type: Number, required: true },
    customerName: { type: String, required: true },
    customerEmail: {
      type: String,
      required: true,
      match: [/^\S+@\S+\.\S+$/, "Email khong hop le"],
    },
    items: {
      type: [OrderItemSchema],
      required: true,
      validate: {
        validator: (v) => v.length > 0,
        message: "Don hang phai co it nhat 1 san pham",
      },
    },
    totalAmount: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ["pending", "confirmed", "shipping", "delivered", "cancelled"],
      default: "pending",
    },
    shippingAddress: { type: ShippingAddressSchema, required: true },
    note: { type: String, default: "" },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Middleware tự sinh orderCode
OrderSchema.pre("save", async function (next) {
  if (!this.orderCode) {
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const count = await mongoose.model("Order").countDocuments();
    this.orderCode = `ORD-${date}-${String(count + 1).padStart(4, "0")}`;
  }
});

// Virtual
OrderSchema.virtual("totalItems").get(function () {
  return this.items.reduce((sum, item) => sum + item.quantity, 0);
});

// Chỉ giữ 2 index này — BỎ orderCode vì unique: true đã tạo rồi
OrderSchema.index({ customerId: 1, createdAt: -1 });
OrderSchema.index({ status: 1 });

module.exports = mongoose.model("Order", OrderSchema);
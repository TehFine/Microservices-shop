const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const swaggerUi = require("swagger-ui-express");
require("dotenv").config();

const orderRoutes = require("./routes/orderRoutes");

const app = express();

// Kết nối MongoDB
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("✅ Kết nối MongoDB thành công"))
  .catch((err) => {
    console.error("❌ Kết nối MongoDB thất bại:", err.message);
    process.exit(1);
  });

app.use(helmet());
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());

// Swagger
const swaggerJsdoc = require("swagger-jsdoc");
const swaggerSpec = swaggerJsdoc({
  definition: {
    openapi: "3.0.0",
    info: { title: "Order Service API", version: "1.0.0" },
    servers: [{ url: "http://localhost:3002" }],
  },
  apis: ["./src/routes/*.js"],
});
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get("/health", (req, res) =>
  res.json({ status: "ok", service: "order-service", db: mongoose.connection.readyState === 1 ? "connected" : "disconnected" })
);

app.use("/api/orders", orderRoutes);

// Error handler MongoDB
app.use((err, req, res, next) => {
  if (err.name === "ValidationError") {
    return res.status(422).json({
      success: false,
      message: "Dữ liệu không hợp lệ",
      errors: Object.values(err.errors).map((e) => ({ field: e.path, message: e.message })),
    });
  }
  if (err.code === 11000) {
    return res.status(409).json({ success: false, message: "Dữ liệu đã tồn tại" });
  }
  res.status(500).json({ success: false, message: err.message });
});

module.exports = app;
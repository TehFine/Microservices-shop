const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./swagger/swagger");
const orderRoutes = require("./routes/orderRoutes");
const errorHandler = require("./middleware/errorHandler");
require("dotenv").config();

const app = express();

// Kết nối MongoDB
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("✅ Ket noi MongoDB thanh cong"))
  .catch((err) => {
    console.error("❌ Ket noi MongoDB that bai:", err.message);
    process.exit(1);
  });

app.use(helmet());
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());

// Swagger UI
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customSiteTitle: "Order Service API Docs",
}));

// Health check
app.get("/health", (req, res) =>
  res.json({
    status: "ok",
    service: process.env.SERVICE_NAME,
    db: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  })
);

app.get("/", (req, res) =>
  res.json({
    service: "Order Service",
    docs: "http://localhost:3002/api-docs",
    health: "http://localhost:3002/health",
  })
);

// Routes
app.use("/api/orders", orderRoutes);

// 404
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route khong ton tai" });
});

// Error handler — PHẢI ĐẶT CUỐI
app.use(errorHandler);

module.exports = app;
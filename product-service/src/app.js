const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./swagger/swagger");
const productRoutes = require("./routes/productRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const errorHandler = require("./middleware/errorHandler");
require("dotenv").config();

const app = express();

// ─── Middleware bảo mật & logging ───────────
app.use(helmet());
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── Swagger UI ─────────────────────────────
app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    swaggerOptions: { persistAuthorization: true },
    customSiteTitle: "Product Service API Docs",
  })
);
app.get("/api-docs.json", (req, res) => res.json(swaggerSpec));

// ─── Health Check ────────────────────────────
app.get("/health", (req, res) =>
  res.json({
    status: "ok",
    service: process.env.SERVICE_NAME,
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  })
);

// ─── Routes ──────────────────────────────────
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);

// ─── 404 Handler ─────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route không tồn tại" });
});

// ─── Global Error Handler (PHẢI ĐẶT CUỐI) ───
app.use(errorHandler);

module.exports = app;
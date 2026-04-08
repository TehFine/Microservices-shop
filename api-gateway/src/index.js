const express = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");
const rateLimit = require("express-rate-limit");
const cors = require("cors");
const helmet = require("helmet");
const { authenticate } = require("./middleware/auth");
require("dotenv").config();

const app = express();

app.use(helmet());
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(",") || "*",
  credentials: true,
}));

// Rate limiting: 100 request / 15 phút / IP
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { success: false, message: "Quá nhiều request, vui lòng thử lại sau" },
});
app.use(limiter);

// Health check
app.get("/health", (req, res) =>
  res.json({ status: "ok", gateway: true, timestamp: new Date().toISOString() })
);

// Proxy helper
const proxy = (target) =>
  createProxyMiddleware({
    target,
    changeOrigin: true,
    on: {
      error: (err, req, res) => {
        console.error("Proxy Error:", err.message);
        res.status(503).json({ success: false, message: "Service tạm thời không khả dụng" });
      },
    },
  });

// ── Routes (công khai) ──────────────────────
app.use("/api/auth", proxy(process.env.AUTH_SERVICE_URL));
app.use("/api/products", proxy(process.env.PRODUCT_SERVICE_URL));

// ── Routes (cần đăng nhập) ──────────────────
app.use("/api/orders", authenticate, proxy(process.env.ORDER_SERVICE_URL));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🌐 API Gateway: http://localhost:${PORT}`);
  console.log(`   Products  → ${process.env.PRODUCT_SERVICE_URL}`);
  console.log(`   Orders    → ${process.env.ORDER_SERVICE_URL}`);
  console.log(`   Auth      → ${process.env.AUTH_SERVICE_URL}`);
});
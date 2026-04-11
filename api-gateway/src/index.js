const express = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");
const rateLimit = require("express-rate-limit");
const cors = require("cors");
const helmet = require("helmet");
const { authenticate } = require("./middleware/auth");
require("dotenv").config();

const app = express();

// Bắt buộc cho Render
app.set("trust proxy", 1);

app.use(helmet());
app.use(cors({
  origin: "*",
  credentials: true,
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { success: false, message: "Qua nhieu request" },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// Health check
app.get("/health", (req, res) =>
  res.json({
    status: "ok",
    gateway: true,
    services: {
      product: process.env.PRODUCT_SERVICE_URL,
      order: process.env.ORDER_SERVICE_URL,
      auth: process.env.AUTH_SERVICE_URL,
    },
    timestamp: new Date().toISOString(),
  })
);

// Proxy helper — thêm on.proxyReq để debug
const createProxy = (target, pathRewrite = {}) =>
  createProxyMiddleware({
    target,
    changeOrigin: true,
    pathRewrite,
    on: {
      proxyReq: (proxyReq, req) => {
        console.log(`[PROXY] ${req.method} ${req.path} → ${target}${req.path}`);
      },
      error: (err, req, res) => {
        console.error(`[PROXY ERROR] ${err.message}`);
        res.status(503).json({
          success: false,
          message: "Service tam thoi khong kha dung",
          error: err.message,
        });
      },
    },
  });

// Routes
app.use("/api/auth", createProxy(process.env.AUTH_SERVICE_URL));
app.use("/api/products", createProxy(process.env.PRODUCT_SERVICE_URL));
app.use("/api/orders", authenticate, createProxy(process.env.ORDER_SERVICE_URL));

// 404
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route khong ton tai" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🌐 API Gateway: http://localhost:${PORT}`);
  console.log(`   Products → ${process.env.PRODUCT_SERVICE_URL}`);
  console.log(`   Orders   → ${process.env.ORDER_SERVICE_URL}`);
  console.log(`   Auth     → ${process.env.AUTH_SERVICE_URL}`);
});
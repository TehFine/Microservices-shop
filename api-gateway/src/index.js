const express = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");
const rateLimit = require("express-rate-limit");
const cors = require("cors");
const helmet = require("helmet");
const { authenticate } = require("./middleware/auth");
require("dotenv").config();

const app = express();

app.set("trust proxy", 1);
app.use(cors({ origin: "*", credentials: true }));
app.use(helmet({ contentSecurityPolicy: false }));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Qua nhieu request" },
});
app.use(limiter);

// Health check
app.get("/health", (req, res) =>
  res.json({
    status: "ok",
    gateway: true,
    services: {
      auth: process.env.AUTH_SERVICE_URL,
      product: process.env.PRODUCT_SERVICE_URL,
      order: process.env.ORDER_SERVICE_URL,
    },
    timestamp: new Date().toISOString(),
  })
);

// ─── Auth routes ─────────────────────────────
app.use(
  "/api/auth",
  createProxyMiddleware({
    target: process.env.AUTH_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: { "^/api/auth": "/api/auth" },
    on: {
      proxyReq: (proxyReq, req) => {
        console.log(`[AUTH] ${req.method} ${req.originalUrl}`);
      },
      error: (err, req, res) => {
        console.error(`[AUTH ERROR] ${err.message}`);
        res.status(503).json({ success: false, message: "Auth service khong kha dung" });
      },
    },
  })
);

// ─── Product routes ───────────────────────────
app.use(
  "/api/products",
  createProxyMiddleware({
    target: process.env.PRODUCT_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: { "^/api/products": "/api/products" },
    on: {
      proxyReq: (proxyReq, req) => {
        console.log(`[PRODUCT] ${req.method} ${req.originalUrl}`);
      },
      error: (err, req, res) => {
        console.error(`[PRODUCT ERROR] ${err.message}`);
        res.status(503).json({ success: false, message: "Product service khong kha dung" });
      },
    },
  })
);

// ─── Order routes (cần auth) ──────────────────
app.use(
  "/api/orders",
  authenticate,
  createProxyMiddleware({
    target: process.env.ORDER_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: { "^/api/orders": "/api/orders" },
    on: {
      proxyReq: (proxyReq, req) => {
        console.log(`[ORDER] ${req.method} ${req.originalUrl}`);
      },
      error: (err, req, res) => {
        console.error(`[ORDER ERROR] ${err.message}`);
        res.status(503).json({ success: false, message: "Order service khong kha dung" });
      },
    },
  })
);

// ─── 404 ─────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route khong ton tai" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🌐 API Gateway: http://localhost:${PORT}`);
  console.log(`   Auth     → ${process.env.AUTH_SERVICE_URL}`);
  console.log(`   Products → ${process.env.PRODUCT_SERVICE_URL}`);
  console.log(`   Orders   → ${process.env.ORDER_SERVICE_URL}`);
});
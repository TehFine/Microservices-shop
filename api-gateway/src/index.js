const express = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");
const rateLimit = require("express-rate-limit");
const cors = require("cors");
const helmet = require("helmet");
const { authenticate } = require("./middleware/auth");
require("dotenv").config();

const app = express();

app.set("trust proxy", 1);

// KHÔNG dùng express.json() ở đây
// Gateway chỉ forward request, không parse body
app.use(cors({ origin: "*", credentials: true }));

app.use(
  helmet({
    contentSecurityPolicy: false, // Tắt để tránh chặn proxy
  })
);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Qua nhieu request" },
});
app.use(limiter);

// ─── Health check ────────────────────────────
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

// ─── Proxy helper ────────────────────────────
const createProxy = (target) =>
  createProxyMiddleware({
    target,
    changeOrigin: true,
    // Giữ nguyên path, không rewrite
    on: {
      proxyReq: (proxyReq, req) => {
        console.log(`[PROXY] ${req.method} ${req.path} → ${target}${req.path}`);
      },
      error: (err, req, res) => {
        console.error(`[PROXY ERROR] ${err.message}`);
        res
          .status(503)
          .json({ success: false, message: "Service khong kha dung" });
      },
    },
  });

// ─── Auth middleware chỉ dùng cho orders ─────
// Không dùng express.json() nhưng authenticate cần đọc header
// nên vẫn hoạt động bình thường

// ─── Routes (thứ tự QUAN TRỌNG) ──────────────
// Đặt proxy TRƯỚC 404 handler
app.use("/api/auth", createProxy(process.env.AUTH_SERVICE_URL));
app.use("/api/products", createProxy(process.env.PRODUCT_SERVICE_URL));
app.use(
  "/api/orders",
  (req, res, next) => {
    // Parse header để authenticate mà không cần express.json()
    authenticate(req, res, next);
  },
  createProxy(process.env.ORDER_SERVICE_URL)
);

// ─── 404 — ĐẶT CUỐI CÙNG ─────────────────────
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
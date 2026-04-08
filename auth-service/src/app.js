const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./swagger/swagger");
const authRoutes = require("./routes/authRoutes");
const errorHandler = require("./middleware/errorHandler");
require("dotenv").config();

const app = express();

app.use(helmet());
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());

// Swagger UI
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customSiteTitle: "Auth Service API Docs",
}));

// Health check
app.get("/health", (req, res) =>
  res.json({
    status: "ok",
    service: process.env.SERVICE_NAME,
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  })
);

app.get("/", (req, res) =>
  res.json({
    service: "Auth Service",
    docs: "http://localhost:3003/api-docs",
    health: "http://localhost:3003/health",
  })
);

// Routes
app.use("/api/auth", authRoutes);

// 404
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route khong ton tai" });
});

// Error handler
app.use(errorHandler);

module.exports = app;
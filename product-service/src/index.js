const app = require("./app");
require("dotenv").config();

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`🚀 Product Service chạy tại http://localhost:${PORT}`);
  console.log(`📚 Swagger UI: http://localhost:${PORT}/api-docs`);
  console.log(`🌍 Môi trường: ${process.env.NODE_ENV}`);
});
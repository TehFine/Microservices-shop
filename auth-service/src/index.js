const app = require("./app");
require("dotenv").config();

const PORT = process.env.PORT || 3003;

app.listen(PORT, () => {
  console.log(`🔐 Auth Service: http://localhost:${PORT}`);
  console.log(`📚 Swagger UI: http://localhost:${PORT}/api-docs`);
  console.log(`🌍 Moi truong: ${process.env.NODE_ENV}`);
});
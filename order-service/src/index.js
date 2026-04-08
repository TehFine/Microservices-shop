const app = require("./app");
const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
  console.log(`🚀 Order Service chạy tại http://localhost:${PORT}`);
  console.log(`📚 Swagger UI: http://localhost:${PORT}/api-docs`);
});
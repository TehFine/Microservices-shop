const swaggerJsdoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Auth Service API",
      version: "1.0.0",
      description: "API xac thuc nguoi dung - tu quan ly, khong dung Supabase Auth",
    },
    servers: [{ url: "http://localhost:3003", description: "Development" }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      schemas: {
        User: {
          type: "object",
          properties: {
            id: { type: "integer", example: 1 },
            email: { type: "string", example: "user@example.com" },
            name: { type: "string", example: "Nguyen Van A" },
            role: { type: "string", enum: ["USER", "ADMIN"] },
            createdAt: { type: "string", format: "date-time" },
          },
        },
      },
    },
  },
  apis: ["./src/routes/*.js"],
};

module.exports = swaggerJsdoc(options);
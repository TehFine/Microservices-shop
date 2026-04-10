const swaggerJsdoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Order Service API",
      version: "1.0.0",
      description: "API quan ly don hang - Lab 2 Microservices",
    },
    servers: [
      { url: "http://localhost:3002", description: "Development" },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      schemas: {
        OrderItem: {
          type: "object",
          properties: {
            productId: { type: "integer", example: 1 },
            productName: { type: "string", example: "iPhone 15 Pro" },
            price: { type: "number", example: 27990000 },
            quantity: { type: "integer", example: 1 },
            subtotal: { type: "number", example: 27990000 },
          },
        },
        Order: {
          type: "object",
          properties: {
            _id: { type: "string", example: "661f1e2d3a4b5c6d7e8f9a0b" },
            orderCode: { type: "string", example: "ORD-20240415-0001" },
            customerId: { type: "integer", example: 1 },
            customerName: { type: "string", example: "Nguyen Van A" },
            customerEmail: { type: "string", example: "a@example.com" },
            items: {
              type: "array",
              items: { $ref: "#/components/schemas/OrderItem" },
            },
            totalAmount: { type: "number", example: 27990000 },
            status: {
              type: "string",
              enum: ["pending", "confirmed", "shipping", "delivered", "cancelled"],
              example: "pending",
            },
            shippingAddress: {
              type: "object",
              properties: {
                street: { type: "string", example: "123 Le Loi" },
                district: { type: "string", example: "Quan 1" },
                city: { type: "string", example: "Ho Chi Minh" },
              },
            },
            createdAt: { type: "string", format: "date-time" },
          },
        },
      },
    },
  },
  apis: ["./src/routes/*.js"],
};

module.exports = swaggerJsdoc(options);
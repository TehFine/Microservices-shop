# 🛍️ Microservices Shop

Hệ thống thương mại điện tử theo kiến trúc **Microservices** sử dụng Node.js + Express.

---

## 🏗️ Kiến trúc

```
Client
  └── API Gateway (3000)
        ├── Product Service (3001) — PostgreSQL + Prisma + Cloudinary + Redis
        ├── Auth Service    (3003) — PostgreSQL + Prisma + JWT
        └── Order Service   (3002) — MongoDB + Mongoose
```

---

## 🚀 URL Production (Render)

| Service | URL |
|---|---|
| API Gateway | https://api-gateway-64tu.onrender.com |
| Product Service | https://product-service-vwo6.onrender.com |
| Auth Service | https://auth-service-1zng.onrender.com |
| Order Service | https://order-service-qj7r.onrender.com |

---

## 📚 Swagger UI

| Service | URL |
|---|---|
| Product | https://product-service-vwo6.onrender.com/api-docs |
| Auth | https://auth-service-1zng.onrender.com/api-docs |
| Order | https://order-service-qj7r.onrender.com/api-docs |

---

## 🛠️ Công nghệ sử dụng

- **Runtime:** Node.js 18+
- **Framework:** Express.js
- **ORM/ODM:** Prisma (PostgreSQL) + Mongoose (MongoDB)
- **Database:** Supabase (PostgreSQL) + MongoDB Atlas
- **Cache:** Redis (ioredis)
- **Upload:** Cloudinary + Multer
- **Auth:** JWT + bcryptjs
- **Docs:** Swagger UI (OpenAPI 3.0)
- **Deploy:** Render
- **Container:** Docker + Docker Compose

---

## ⚙️ Cài đặt và chạy local

### Yêu cầu
- Node.js >= 18
- Docker Desktop

### 1. Clone repo
```bash
git clone https://github.com/YOUR_USERNAME/microservices-shop.git
cd microservices-shop
```

### 2. Tạo file `.env` ở root
```env
PRODUCT_DATABASE_URL="postgresql://..."
AUTH_DATABASE_URL="postgresql://..."
MONGODB_URI="mongodb+srv://..."
JWT_SECRET=your-secret-key
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

### 3. Tạo `.env` trong từng service
Xem file `.env.example` trong mỗi thư mục service.

### 4. Chạy bằng Docker Compose
```bash
docker-compose up -d
```

### 5. Chạy từng service riêng (dev)
```bash
# Terminal 1
cd product-service && npm run dev

# Terminal 2
cd auth-service && npm run dev

# Terminal 3
cd order-service && npm run dev

# Terminal 4
cd api-gateway && npm run dev
```

---

## 📡 API Endpoints

### Auth Service
| Method | Endpoint | Mô tả | Auth |
|---|---|---|---|
| POST | /api/auth/register | Đăng ký tài khoản | Không |
| POST | /api/auth/login | Đăng nhập | Không |
| POST | /api/auth/refresh | Làm mới token | Không |
| GET | /api/auth/me | Thông tin user | Bearer |
| POST | /api/auth/logout | Đăng xuất | Bearer |
| PUT | /api/auth/change-password | Đổi mật khẩu | Bearer |

### Product Service
| Method | Endpoint | Mô tả | Auth |
|---|---|---|---|
| GET | /api/products | Danh sách sản phẩm | Không |
| GET | /api/products/:id | Chi tiết sản phẩm | Không |
| POST | /api/products | Tạo sản phẩm | Không |
| PUT | /api/products/:id | Cập nhật sản phẩm | Không |
| DELETE | /api/products/:id | Ẩn sản phẩm | Không |
| POST | /api/products/:id/image | Upload ảnh | Không |
| DELETE | /api/products/:id/image | Xóa ảnh | Không |
| GET | /api/categories | Danh sách danh mục | Không |
| POST | /api/categories | Tạo danh mục | Không |

### Order Service
| Method | Endpoint | Mô tả | Auth |
|---|---|---|---|
| GET | /api/orders | Tất cả đơn hàng | Bearer |
| POST | /api/orders | Tạo đơn hàng | Bearer |
| GET | /api/orders/:id | Chi tiết đơn hàng | Bearer |
| GET | /api/orders/customer/:id | Đơn hàng theo KH | Bearer |
| PATCH | /api/orders/:id/status | Cập nhật trạng thái | Bearer |
| DELETE | /api/orders/:id | Hủy đơn hàng | Bearer |

---

## 🗂️ Cấu trúc thư mục

```
microservices-shop/
├── api-gateway/
│   └── src/
│       ├── middleware/auth.js
│       └── index.js
├── product-service/
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── seed.js
│   └── src/
│       ├── config/
│       │   ├── cloudinary.js
│       │   └── redis.js
│       ├── controllers/productController.js
│       ├── routes/productRoutes.js
│       ├── middleware/
│       └── swagger/
├── auth-service/
│   ├── prisma/schema.prisma
│   └── src/
│       ├── controllers/authController.js
│       ├── middleware/authMiddleware.js
│       └── routes/authRoutes.js
├── order-service/
│   └── src/
│       ├── models/Order.js
│       ├── controllers/orderController.js
│       └── routes/orderRoutes.js
├── docker-compose.yml
├── .env
└── README.md
```

---

## 🐳 Docker

```bash
# Chạy toàn bộ hệ thống
docker-compose up -d

# Xem logs
docker-compose logs -f

# Dừng hệ thống
docker-compose down

# Build lại service cụ thể
docker-compose up -d --build product-service
```

---

## ✅ Checklist tính năng

- [x] Product Service CRUD + Prisma + PostgreSQL
- [x] Order Service CRUD + Mongoose + MongoDB
- [x] Auth Service JWT tự quản lý (không dùng Supabase Auth)
- [x] API Gateway proxy + rate limiting
- [x] Swagger UI cho cả 3 service
- [x] Pagination, filtering, sorting
- [x] Validation với express-validator
- [x] Soft delete sản phẩm
- [x] Upload ảnh Cloudinary
- [x] Cache Redis 5 phút
- [x] Docker Compose
- [x] Deploy trên Render

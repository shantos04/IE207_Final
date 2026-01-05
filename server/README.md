# 🚀 CraftUI ERP - Backend Server

Node.js + Express + MongoDB API Server cho hệ thống ERP Quản lý Linh Kiện Điện Tử.

## 📁 Cấu trúc thư mục

```
server/
├── config/
│   └── database.js          # MongoDB connection
├── models/
│   ├── User.js              # User schema
│   ├── Product.js           # Product schema
│   └── Order.js             # Order schema
├── controllers/
│   ├── authController.js    # Authentication logic
│   ├── productController.js # Product CRUD
│   └── orderController.js   # Order management
├── routes/
│   ├── authRoutes.js        # Auth endpoints
│   ├── productRoutes.js     # Product endpoints
│   └── orderRoutes.js       # Order endpoints
├── middleware/
│   ├── auth.js              # JWT authentication
│   └── errorHandler.js      # Error handling
├── scripts/
│   └── seed.js              # Database seeding
├── .env                     # Environment variables
├── .env.example             # Example env file
├── package.json             # Dependencies
└── index.js                 # Server entry point
```

## 🛠️ Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB + Mongoose
- **Authentication:** JWT (jsonwebtoken)
- **Security:** Helmet, CORS, Rate Limiting
- **Validation:** express-validator
- **Logging:** Morgan
- **Dev Tools:** Nodemon

## 📦 Installation

### 1. Cài đặt dependencies

```bash
cd server
npm install
```

### 2. Cấu hình Environment Variables

Tạo file `.env` từ `.env.example`:

```bash
cp .env.example .env
```

Cập nhật các giá trị trong `.env`:

```env
PORT=5000
NODE_ENV=development

# MongoDB URI
MONGODB_URI=mongodb://localhost:27017/craftui_erp

# JWT Secret (đổi thành chuỗi ngẫu nhiên phức tạp)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# Frontend URL (để cấu hình CORS)
CLIENT_URL=http://localhost:3000
```

### 3. Cài đặt MongoDB

**Cách 1: MongoDB Local**

- Download MongoDB từ: https://www.mongodb.com/try/download/community
- Cài đặt và chạy MongoDB service
- Default URI: `mongodb://localhost:27017`

**Cách 2: MongoDB Atlas (Cloud)**

1. Tạo tài khoản tại: https://www.mongodb.com/cloud/atlas
2. Tạo cluster miễn phí
3. Lấy connection string
4. Update `MONGODB_URI` trong `.env`

### 4. Seed Database (Optional)

Import dữ liệu mẫu:

```bash
npm run seed
```

Dữ liệu mẫu bao gồm:
- 3 users (admin, manager, staff)
- 5 products

### 5. Start Server

**Development mode (auto-restart):**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

Server sẽ chạy tại: **http://localhost:5000**

## 🔑 API Endpoints

### Authentication (`/api/auth`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/signup` | Đăng ký tài khoản mới | No |
| POST | `/login` | Đăng nhập | No |
| GET | `/me` | Lấy thông tin user hiện tại | Yes |
| POST | `/logout` | Đăng xuất | Yes |

### Products (`/api/products`)

| Method | Endpoint | Description | Auth | Roles |
|--------|----------|-------------|------|-------|
| GET | `/` | Lấy danh sách sản phẩm | Yes | All |
| GET | `/:id` | Lấy chi tiết sản phẩm | Yes | All |
| POST | `/` | Tạo sản phẩm mới | Yes | Admin, Manager |
| PUT | `/:id` | Cập nhật sản phẩm | Yes | Admin, Manager |
| DELETE | `/:id` | Xóa sản phẩm | Yes | Admin |

### Orders (`/api/orders`)

| Method | Endpoint | Description | Auth | Roles |
|--------|----------|-------------|------|-------|
| GET | `/` | Lấy danh sách đơn hàng | Yes | All |
| GET | `/:id` | Lấy chi tiết đơn hàng | Yes | All |
| POST | `/` | Tạo đơn hàng mới | Yes | All |
| PUT | `/:id/status` | Cập nhật trạng thái | Yes | Admin, Manager |
| PUT | `/:id/payment` | Cập nhật thanh toán | Yes | Admin, Manager |
| PUT | `/:id/cancel` | Hủy đơn hàng | Yes | All |

## 📝 API Usage Examples

### 1. Đăng ký

```bash
POST http://localhost:5000/api/auth/signup
Content-Type: application/json

{
  "fullName": "Nguyen Van A",
  "email": "user@example.com",
  "password": "123456"
}
```

### 2. Đăng nhập

```bash
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "admin@craftui.com",
  "password": "admin123"
}
```

Response:
```json
{
  "success": true,
  "message": "Đăng nhập thành công",
  "data": {
    "user": {
      "_id": "...",
      "username": "admin",
      "email": "admin@craftui.com",
      "fullName": "Admin User",
      "role": "admin"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### 3. Lấy danh sách sản phẩm

```bash
GET http://localhost:5000/api/products?page=1&limit=10&category=vi-dieu-khien
Authorization: Bearer YOUR_TOKEN_HERE
```

### 4. Tạo sản phẩm mới

```bash
POST http://localhost:5000/api/products
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json

{
  "productCode": "TEST-001",
  "name": "Sản phẩm test",
  "category": "linh-kien-dien-tu",
  "price": 50000,
  "stock": 100
}
```

### 5. Tạo đơn hàng

```bash
POST http://localhost:5000/api/orders
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json

{
  "customer": {
    "name": "Nguyen Van A",
    "email": "customer@example.com",
    "phone": "0901234567"
  },
  "items": [
    {
      "product": "PRODUCT_ID_HERE",
      "quantity": 2
    }
  ],
  "shippingAddress": "123 Nguyen Trai, Ha Noi",
  "paymentMethod": "cash"
}
```

## 🔒 Authentication

Server sử dụng JWT (JSON Web Token) cho authentication.

### Flow:
1. User login → Server trả về `accessToken`
2. Frontend lưu token vào localStorage
3. Mỗi request sau đó gửi token trong header:
   ```
   Authorization: Bearer <token>
   ```

### Protected Routes:
Tất cả routes (trừ `/auth/signup` và `/auth/login`) đều yêu cầu authentication.

### Role-based Authorization:
- **Admin:** Full access
- **Manager:** Manage products, orders
- **Staff:** View only

## 📊 Database Schemas

### User Schema
```javascript
{
  username: String (unique),
  email: String (unique),
  password: String (hashed),
  fullName: String,
  role: ['admin', 'manager', 'staff'],
  avatar: String,
  phone: String,
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Product Schema
```javascript
{
  productCode: String (unique),
  name: String,
  description: String,
  category: String,
  price: Number,
  stock: Number,
  status: ['in-stock', 'low-stock', 'out-of-stock'],
  supplier: String,
  imageUrl: String,
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Order Schema
```javascript
{
  orderCode: String (auto-generated),
  customer: {
    name: String,
    email: String,
    phone: String
  },
  items: [{
    product: ObjectId (ref: Product),
    productName: String,
    productCode: String,
    quantity: Number,
    price: Number,
    subtotal: Number
  }],
  totalAmount: Number,
  status: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
  paymentStatus: ['unpaid', 'paid', 'refunded'],
  paymentMethod: String,
  shippingAddress: String,
  notes: String,
  createdBy: ObjectId (ref: User),
  createdAt: Date,
  updatedAt: Date
}
```

## 🛡️ Security Features

- **Helmet:** Secure HTTP headers
- **CORS:** Cross-Origin Resource Sharing configured
- **Rate Limiting:** 100 requests per 15 minutes per IP
- **Password Hashing:** bcryptjs with salt rounds
- **JWT:** Secure token-based authentication
- **Input Validation:** express-validator
- **Error Handling:** Centralized error handler

## 🧪 Testing

### Test với cURL

```bash
# Health check
curl http://localhost:5000

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@craftui.com","password":"admin123"}'

# Get products (with token)
curl -X GET http://localhost:5000/api/products \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Test với Postman/Thunder Client

Import collection từ file `server/postman_collection.json` (nếu có)

## 🔧 Troubleshooting

### Lỗi: Cannot connect to MongoDB

**Giải pháp:**
1. Kiểm tra MongoDB service đang chạy
2. Verify `MONGODB_URI` trong `.env`
3. Check firewall/network settings

### Lỗi: Port already in use

**Giải pháp:**
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Linux/Mac
lsof -i :5000
kill -9 <PID>
```

### Lỗi: JWT token invalid

**Giải pháp:**
- Check `JWT_SECRET` khớp giữa client và server
- Verify token chưa expired
- Ensure token format: `Bearer <token>`

## 📚 Useful Scripts

```bash
# Development với auto-reload
npm run dev

# Production
npm start

# Import sample data
npm run seed

# Clear all data
npm run seed -- -d
```

## 🚀 Deployment

### Deploy lên Heroku

1. Install Heroku CLI
2. Create Heroku app
3. Set environment variables
4. Push code

```bash
heroku create craftui-erp-api
heroku config:set JWT_SECRET=your-secret
heroku config:set MONGODB_URI=mongodb+srv://...
git push heroku main
```

### Deploy lên VPS

1. SSH vào server
2. Clone repository
3. Install Node.js và MongoDB
4. Setup PM2 để chạy app 24/7
5. Configure Nginx reverse proxy

## 📞 Support

- Email: support@craftui.com
- Documentation: /docs
- Issues: GitHub Issues

## 📄 License

MIT License - see LICENSE file for details

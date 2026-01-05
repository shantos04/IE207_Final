# 🎉 Backend Server Setup - Hoàn thành!

## ✅ Đã tạo thành công

### 📁 Cấu trúc thư mục Backend

```
server/
├── config/
│   └── database.js          ✅ MongoDB connection
├── models/
│   ├── User.js              ✅ User schema với bcrypt
│   ├── Product.js           ✅ Product schema với auto-status
│   └── Order.js             ✅ Order schema với auto-orderCode
├── controllers/
│   ├── authController.js    ✅ Login, SignUp, GetMe, Logout
│   ├── productController.js ✅ CRUD Products
│   └── orderController.js   ✅ Order management
├── routes/
│   ├── authRoutes.js        ✅ Auth endpoints
│   ├── productRoutes.js     ✅ Product endpoints
│   └── orderRoutes.js       ✅ Order endpoints
├── middleware/
│   ├── auth.js              ✅ JWT authentication & authorization
│   └── errorHandler.js      ✅ Centralized error handling
├── scripts/
│   └── seed.js              ✅ Database seeding script
├── .env                     ✅ Environment variables
├── .env.example             ✅ Example config
├── .gitignore               ✅ Git ignore rules
├── package.json             ✅ Dependencies
├── README.md                ✅ Full documentation
└── index.js                 ✅ Server entry point
```

## 🎯 Tính năng Backend

### 🔐 Authentication
- ✅ JWT-based authentication
- ✅ Password hashing với bcryptjs
- ✅ Role-based authorization (Admin, Manager, Staff)
- ✅ Protected routes middleware

### 📦 API Endpoints

#### Auth (`/api/auth`)
- `POST /signup` - Đăng ký
- `POST /login` - Đăng nhập
- `GET /me` - Lấy user hiện tại (Protected)
- `POST /logout` - Đăng xuất (Protected)

#### Products (`/api/products`)
- `GET /` - Danh sách sản phẩm (Protected)
- `GET /:id` - Chi tiết sản phẩm (Protected)
- `POST /` - Tạo sản phẩm (Admin/Manager)
- `PUT /:id` - Cập nhật sản phẩm (Admin/Manager)
- `DELETE /:id` - Xóa sản phẩm (Admin)

#### Orders (`/api/orders`)
- `GET /` - Danh sách đơn hàng (Protected)
- `GET /:id` - Chi tiết đơn hàng (Protected)
- `POST /` - Tạo đơn hàng (Protected)
- `PUT /:id/status` - Cập nhật trạng thái (Admin/Manager)
- `PUT /:id/payment` - Cập nhật thanh toán (Admin/Manager)
- `PUT /:id/cancel` - Hủy đơn hàng (Protected)

### 🛡️ Security Features
- ✅ Helmet - Secure HTTP headers
- ✅ CORS - Cross-Origin Resource Sharing
- ✅ Rate Limiting - 100 req/15min per IP
- ✅ Input validation
- ✅ Error handling middleware

### 📊 Database Models

#### User Model
- username (unique)
- email (unique)
- password (hashed)
- fullName
- role: admin | manager | staff
- avatar
- phone
- isActive
- timestamps

#### Product Model
- productCode (unique, auto-uppercase)
- name
- description
- category: vi-dieu-khien, cam-bien, dong-co, module-truyen-thong, linh-kien-dien-tu, khac
- price
- stock
- status: in-stock | low-stock | out-of-stock (auto-calculated)
- supplier
- specifications (Map)
- imageUrl
- isActive
- timestamps

#### Order Model
- orderCode (auto-generated: ORD-YYYYMM-0001)
- customer: { name, email, phone }
- items: [{ product, productName, productCode, quantity, price, subtotal }]
- totalAmount (auto-calculated)
- status: pending | processing | shipped | delivered | cancelled
- paymentStatus: unpaid | paid | refunded
- paymentMethod: cash | bank-transfer | credit-card | e-wallet
- shippingAddress
- notes
- createdBy (User reference)
- timestamps

## 🚀 Cách sử dụng

### Bước 1: Cài đặt Dependencies

```bash
cd server
npm install
```

### Bước 2: Cấu hình Environment

File: `server/.env`

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/craftui_erp
JWT_SECRET=your-super-secret-jwt-key-change-this
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:3000
```

**Lưu ý:** Thay đổi `JWT_SECRET` thành chuỗi phức tạp, ngẫu nhiên!

### Bước 3: Cài đặt MongoDB

**Option 1: MongoDB Local**
- Download: https://www.mongodb.com/try/download/community
- Install và start service
- URI: `mongodb://localhost:27017`

**Option 2: MongoDB Atlas (Cloud - Recommended)**
1. Tạo tài khoản: https://www.mongodb.com/cloud/atlas
2. Tạo cluster miễn phí
3. Lấy connection string
4. Update `MONGODB_URI` trong `.env`

### Bước 4: Import Sample Data

```bash
npm run seed
```

Thông tin đăng nhập:
- Admin: admin@craftui.com / admin123
- Manager: manager@craftui.com / manager123
- Staff: staff@craftui.com / staff123

### Bước 5: Start Server

**Development mode:**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

Server chạy tại: **http://localhost:5000**

### Bước 6: Test API

**Health Check:**
```bash
curl http://localhost:5000
```

**Login:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@craftui.com","password":"admin123"}'
```

**Get Products (with token):**
```bash
curl -X GET http://localhost:5000/api/products \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## 🔗 Kết nối Frontend

### Cập nhật authService.ts

File: `src/services/authService.ts`

**Thay đổi từ Mock API sang Real API:**

```typescript
// Login
async login(credentials: LoginCredentials): Promise<AuthResponse> {
  try {
    // ✅ Uncomment this
    const response = await api.post('/auth/login', credentials);
    return response.data.data;
    
    // ❌ Comment this
    // return new Promise((resolve, reject) => { ... });
    
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Đăng nhập thất bại');
  }
}
```

Tương tự cho `signUp()`.

### Kiểm tra .env Frontend

File: `.env` (root project)

```env
VITE_API_URL=http://localhost:5000/api
```

### Restart Frontend

```bash
npm run dev
```

## 📝 API Response Format

Tất cả API responses tuân theo format chuẩn:

**Success:**
```json
{
  "success": true,
  "message": "Thành công",
  "data": { ... }
}
```

**Error:**
```json
{
  "success": false,
  "message": "Lỗi xảy ra"
}
```

## 🧪 Testing

### Với cURL

```bash
# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@craftui.com","password":"admin123"}'

# Lưu token từ response
TOKEN="eyJhbGc..."

# Get products
curl -X GET http://localhost:5000/api/products \
  -H "Authorization: Bearer $TOKEN"

# Create product (Admin/Manager only)
curl -X POST http://localhost:5000/api/products \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "productCode": "TEST-001",
    "name": "Test Product",
    "category": "linh-kien-dien-tu",
    "price": 50000,
    "stock": 100
  }'
```

### Với Postman/Thunder Client

1. Import collection (nếu có)
2. Set base URL: `http://localhost:5000/api`
3. Create environment với `token` variable
4. Test từng endpoint

## 📊 Database Seeding Details

Sau khi chạy `npm run seed`, database sẽ có:

### Users (3)
1. **Admin** - admin@craftui.com / admin123
2. **Manager** - manager@craftui.com / manager123
3. **Staff** - staff@craftui.com / staff123

### Products (5)
1. Arduino Uno R3 - 250,000 VNĐ
2. Raspberry Pi 4 4GB - 1,200,000 VNĐ
3. DHT22 Sensor - 80,000 VNĐ
4. ESP32 DevKit - 150,000 VNĐ
5. Relay 4 Channel - 120,000 VNĐ

## 🔧 Troubleshooting

### Port already in use
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Linux/Mac
lsof -i :5000
kill -9 <PID>
```

### Cannot connect to MongoDB
1. Check MongoDB service đang chạy
2. Verify `MONGODB_URI` trong `.env`
3. Thử MongoDB Atlas nếu local không hoạt động

### CORS Error
Update `CLIENT_URL` trong `server/.env`:
```env
CLIENT_URL=http://localhost:3001
```
(hoặc port mà frontend đang chạy)

### JWT Error
- Check `JWT_SECRET` giống nhau giữa client-server
- Token có thể đã expired (mặc định 7 ngày)
- Format header: `Authorization: Bearer <token>`

## 📚 Next Steps

Sau khi Backend hoạt động:

1. ✅ Test tất cả endpoints với Postman
2. ✅ Update Frontend authService để dùng Real API
3. ⏭️ Tạo productService.ts cho Frontend
4. ⏭️ Tạo orderService.ts cho Frontend
5. ⏭️ Build Products Management Page
6. ⏭️ Build Orders Management Page
7. ⏭️ Add Dashboard Statistics API
8. ⏭️ Add File Upload cho Product Images
9. ⏭️ Deploy Backend (Heroku, Railway, VPS)
10. ⏭️ Deploy Frontend (Vercel, Netlify)

## 🎓 Documentation References

- **Server README:** `server/README.md` - Chi tiết đầy đủ về API
- **Connect Guide:** `docs/CONNECT_FRONTEND_BACKEND.md` - Hướng dẫn kết nối
- **Auth Guide:** `docs/AUTHENTICATION.md` - Authentication flow

## ✨ Summary

Bạn đã có một Backend Server hoàn chỉnh với:
- ✅ RESTful API chuẩn
- ✅ JWT Authentication
- ✅ Role-based Authorization
- ✅ MongoDB Database với 3 Models
- ✅ CRUD operations đầy đủ
- ✅ Security middleware
- ✅ Error handling
- ✅ Sample data seeding
- ✅ Full documentation

**Server sẵn sàng để Frontend kết nối!** 🚀

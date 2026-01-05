# CraftUI - ERP Quản lý Linh Kiện Điện Tử

Ứng dụng ERP hiện đại Full-stack cho quản lý linh kiện điện tử, được xây dựng với MERN Stack.

## 🚀 Công nghệ sử dụng

### Frontend
- **Framework:** React 19
- **Build Tool:** Vite 7
- **Language:** TypeScript
- **Styling:** Tailwind CSS 3.4
- **Icons:** Lucide React
- **Charts:** Recharts
- **Routing:** React Router DOM
- **Form:** React Hook Form + Zod
- **Notifications:** React Hot Toast
- **HTTP Client:** Axios

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB + Mongoose
- **Authentication:** JWT (jsonwebtoken)
- **Security:** Helmet, CORS, Rate Limiting
- **Validation:** express-validator

## 📦 Cài đặt

### Frontend

```bash
# Cài đặt dependencies
npm install

# Chạy development server
npm run dev

# Build cho production
npm run build

# Preview production build
npm run preview
```

### Backend

```bash
# Di chuyển vào thư mục server
cd server

# Cài đặt dependencies
npm install

# Cấu hình .env (copy từ .env.example)
cp .env.example .env

# Import dữ liệu mẫu (optional)
npm run seed

# Chạy development server
npm run dev

# Chạy production server
npm start
```

**Default Ports:**
- Frontend: http://localhost:3000 (hoặc 3001)
- Backend: http://localhost:5000
npm run preview
```

## 🎨 Tính năng

### Authentication (✅ Hoàn thành)
- ✅ Login/Sign Up với validation (React Hook Form + Zod)
- ✅ Protected Routes (chặn truy cập khi chưa đăng nhập)
- ✅ JWT Token management
- ✅ Toast notifications
- ✅ Auto logout khi token hết hạn
- ✅ Mock API cho development

**Thông tin demo:** Email: `admin@craftui.com` | Password: `admin123`

### Dashboard Tổng quan
- ✅ Thống kê doanh thu, đơn hàng, khách hàng
- ✅ Biểu đồ doanh thu theo tháng
- ✅ Bảng đơn hàng gần đây
- ✅ Mini charts cho từng chỉ số

### Layout
- ✅ Sidebar có thể thu gọn
- ✅ Header với tìm kiếm và thông báo
- ✅ User profile với nút Logout
- ✅ Responsive design

## 🏗️ Cấu trúc dự án

```
DoAn/
├── src/                          # Frontend Source Code
│   ├── components/
│   │   ├── layout/
│   │   │   ├── DashboardLayout.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   └── Header.tsx
│   │   ├── dashboard/
│   │   │   ├── StatCard.tsx
│   │   │   ├── RevenueChart.tsx
│   │   │   └── RecentOrdersTable.tsx
│   │   └── auth/
│   │       └── ProtectedRoute.tsx
│   ├── contexts/
│   │   └── AuthContext.tsx
│   ├── services/
│   │   ├── api.ts
│   │   └── authService.ts
│   ├── pages/
│   │   ├── DashboardHome.tsx
│   │   └── AuthPage.tsx
│   ├── types/
│   │   └── index.ts
│   ├── data/
│   │   └── mockData.ts
│   ├── App.tsx
│   └── main.tsx
│
├── server/                       # Backend Source Code
│   ├── config/
│   │   └── database.js           # MongoDB connection
│   ├── models/
│   │   ├── User.js
│   │   ├── Product.js
│   │   └── Order.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── productController.js
│   │   └── orderController.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── productRoutes.js
│   │   └── orderRoutes.js
│   ├── middleware/
│   │   ├── auth.js
│   │   └── errorHandler.js
│   ├── scripts/
│   │   └── seed.js
│   ├── .env
│   ├── package.json
│   └── index.js
│
├── docs/                         # Documentation
│   ├── AUTHENTICATION.md
│   └── CONNECT_FRONTEND_BACKEND.md
│
├── package.json                  # Frontend dependencies
├── vite.config.ts
├── tailwind.config.js
└── README.md
├── data/
│   └── mockData.ts
├── App.tsx
└── main.tsx
```

## 🎯 Roadmap

- [x] ✅ Authentication Module (Login/SignUp/Protected Routes)
- [ ] Trang Quản lý Sản phẩm
- [ ] Trang Quản lý Đơn hàng
- [ ] Trang Quản lý Khách hàng
- [ ] Trang Hóa đơn
- [ ] Trang Báo cáo
- [ ] Backend API Integration
- [ ] Role-based Access Control (RBAC)

## 📚 Documentation

- [Authentication Guide](docs/AUTHENTICATION.md) - Chi tiết về module xác thực
- [Connect Frontend-Backend](docs/CONNECT_FRONTEND_BACKEND.md) - Hướng dẫn kết nối Full-stack
- [Server API Documentation](server/README.md) - API endpoints và usage

## 🔑 Environment Variables

### Frontend (.env)
```bash
VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME=CraftUI ERP
```

### Backend (server/.env)
```bash
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/craftui_erp
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:3000
```

## 👤 Demo Accounts

Sau khi chạy `npm run seed` trong folder server:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@craftui.com | admin123 |
| Manager | manager@craftui.com | manager123 |
| Staff | staff@craftui.com | staff123 |

## 📝 License

MIT

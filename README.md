# ELECSTRIKE - Hệ thống Quản lý Cửa hàng Linh Kiện Điện Tử

Ứng dụng quản lý cửa hàng linh kiện điện tử full-stack hiện đại, được xây dựng với MERN Stack.

## 🚀 Công nghệ sử dụng

### Frontend
- **Framework:** React 19 + TypeScript
- **Build Tool:** Vite 7
- **Styling:** Tailwind CSS 3.4
- **UI Components:** Headless UI, Lucide React
- **Charts:** Recharts
- **Routing:** React Router DOM v6
- **Form Management:** React Hook Form + Zod
- **State Management:** React Context API
- **HTTP Client:** Axios
- **Notifications:** React Hot Toast

### Backend
- **Runtime:** Node.js + Express.js
- **Database:** MongoDB + Mongoose
- **Authentication:** JWT (jsonwebtoken) + bcryptjs
- **Security:** Helmet, CORS, Express Rate Limit
- **Validation:** express-validator
- **File Upload:** Multer
- **Environment:** dotenv

## 📦 Cài đặt và Chạy Dự án

### Yêu cầu hệ thống
- Node.js >= 18.x
- MongoDB >= 6.x
- npm hoặc yarn

### 1. Cài đặt Backend

```bash
# Di chuyển vào thư mục server
cd server

# Cài đặt dependencies
npm install

# Cấu hình biến môi trường
# Tạo file .env từ .env.example và cập nhật thông tin
cp .env.example .env

# Import dữ liệu mẫu (bao gồm tài khoản admin và sản phẩm)
npm run seed

# Chạy server
npm run dev
```

Server sẽ chạy tại: http://localhost:5000

### 2. Cài đặt Frontend

```bash
# Quay về thư mục gốc
cd ..

# Cài đặt dependencies
npm install

# Chạy development server
npm run dev
```

Frontend sẽ chạy tại: http://localhost:3000

## 🎯 Tính năng chính

## 🎯 Tính năng chính

### 🔐 Xác thực & Phân quyền
- Đăng nhập / Đăng ký với validation đầy đủ
- Phân quyền người dùng: Admin, Manager, Staff
- Protected Routes & Route Guards
- JWT Token với refresh mechanism
- Auto logout khi token hết hạn

### 🛍️ Quản lý Sản phẩm
- CRUD sản phẩm với upload hình ảnh
- Phân loại theo danh mục (Vi điều khiển, Cảm biến, Module truyền thông, Động cơ, v.v.)
- Quản lý tồn kho tự động
- Tìm kiếm và lọc sản phẩm
- Import/Export dữ liệu sản phẩm

### 📦 Quản lý Đơn hàng
- Tạo và xử lý đơn hàng
- Theo dõi trạng thái đơn hàng (Pending, Processing, Shipped, Delivered, Cancelled)
- Tự động tạo hóa đơn khi đơn hàng hoàn thành
- Cập nhật tồn kho tự động
- Lịch sử đơn hàng chi tiết

### 👥 Quản lý Khách hàng
- Thông tin khách hàng đầy đủ
- Lịch sử mua hàng
- Phân loại khách hàng (VIP, Thường)
- Tìm kiếm và lọc khách hàng

### 🧾 Quản lý Hóa đơn
- Tự động tạo hóa đơn từ đơn hàng
- In hóa đơn PDF
- Tìm kiếm và lọc hóa đơn
- Đồng bộ dữ liệu hóa đơn

### 📊 Dashboard & Báo cáo
- Thống kê doanh thu theo ngày/tháng/năm
- Biểu đồ doanh thu và đơn hàng
- Top sản phẩm bán chạy
- Thống kê khách hàng
- Cảnh báo tồn kho thấp
- Export báo cáo Excel/PDF

### ⚙️ Cài đặt Hệ thống
- Cấu hình thông tin cửa hàng
- Cài đặt email thông báo
- Cấu hình thanh toán
- Quản lý thuế và phí
- Thiết lập giao diện

### 🏪 Trang Khách hàng (Shop)
- Danh sách sản phẩm với lọc và tìm kiếm
- Xem chi tiết sản phẩm
- Giỏ hàng
- Đặt hàng trực tuyến
- Responsive design

## 🏗️ Cấu trúc dự án

```
IE207_Final/
├── src/                          # Frontend Source Code
│   ├── components/              # React Components
│   │   ├── layout/              # Layout components (Sidebar, Header)
│   │   ├── dashboard/           # Dashboard components
│   │   ├── products/            # Product management components
│   │   ├── orders/              # Order management components
│   │   ├── customers/           # Customer management components
│   │   ├── invoices/            # Invoice components
│   │   └── settings/            # Settings components
│   ├── contexts/                # React Context (Auth, Cart)
│   ├── services/                # API Services
│   ├── pages/                   # Page Components
│   ├── layouts/                 # Layout wrappers
│   ├── types/                   # TypeScript types
│   └── data/                    # Static data & constants
│
├── server/                      # Backend Source Code
│   ├── config/                  # Configuration
│   │   ├── database.js          # MongoDB connection
│   │   └── multer.js            # File upload config
│   ├── models/                  # Mongoose Models
│   │   ├── User.js
│   │   ├── Product.js
│   │   ├── Order.js
│   │   ├── Customer.js
│   │   ├── Invoice.js
│   │   └── Setting.js
│   ├── controllers/             # Route Controllers
│   │   ├── authController.js
│   │   ├── productController.js
│   │   ├── orderController.js
│   │   ├── customerController.js
│   │   ├── invoiceController.js
│   │   ├── dashboardController.js
│   │   ├── analyticsController.js
│   │   ├── settingController.js
│   │   └── userController.js
│   ├── routes/                  # API Routes
│   ├── middleware/              # Express Middleware
│   │   ├── auth.js              # JWT Authentication
│   │   └── errorHandler.js      # Error handling
│   ├── scripts/                 # Utility Scripts
│   │   └── seed.js              # Database seeding
│   ├── seeders/                 # Data Seeders
│   │   └── master.seed.js       # Master seeder
│   ├── uploads/                 # Uploaded files
│   └── index.js                 # Server entry point
│
├── public/                      # Static assets
├── docs/                        # Documentation (deleted)
├── package.json                 # Frontend dependencies
├── vite.config.ts              # Vite configuration
├── tailwind.config.js          # Tailwind CSS config
├── tsconfig.json               # TypeScript config
└── README.md                   # This file
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

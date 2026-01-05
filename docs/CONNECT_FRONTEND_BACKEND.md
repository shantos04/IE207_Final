# 🔗 Hướng dẫn kết nối Frontend với Backend

## Bước 1: Start Backend Server

```bash
# Di chuyển vào thư mục server
cd server

# Cài đặt dependencies (lần đầu)
npm install

# Start server
npm run dev
```

Server sẽ chạy tại: **http://localhost:5000**

## Bước 2: Import dữ liệu mẫu (Optional)

```bash
# Trong thư mục server
npm run seed
```

Thông tin đăng nhập sau khi seed:
- **Admin:** admin@craftui.com / admin123
- **Manager:** manager@craftui.com / manager123
- **Staff:** staff@craftui.com / staff123

## Bước 3: Cập nhật Frontend để sử dụng Real API

### 3.1. Kiểm tra file `.env` trong root project

File: `d:/Workspace/P/DoAn/.env`

```env
VITE_API_URL=http://localhost:5000/api
```

### 3.2. Cập nhật `src/services/authService.ts`

Bỏ comment các dòng Real API và comment lại Mock API:

**File: `src/services/authService.ts`**

```typescript
// Login
async login(credentials: LoginCredentials): Promise<AuthResponse> {
  try {
    // ✅ Real API call (UNCOMMENT THIS)
    const response = await api.post('/auth/login', credentials);
    return response.data.data; // Lấy data từ response.data.data
    
    // ❌ Mock response (COMMENT THIS)
    // return new Promise((resolve, reject) => { ... });
    
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Đăng nhập thất bại');
  }
},

// Sign Up
async signUp(data: SignUpData): Promise<AuthResponse> {
  try {
    // ✅ Real API call (UNCOMMENT THIS)
    const response = await api.post('/auth/signup', data);
    return response.data.data;
    
    // ❌ Mock response (COMMENT THIS)
    // return new Promise((resolve, reject) => { ... });
    
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Đăng ký thất bại');
  }
},
```

### 3.3. Restart Frontend Dev Server

```bash
# Trong thư mục root
npm run dev
```

## Bước 4: Test kết nối

### Test 1: Health Check

Mở browser và truy cập:
```
http://localhost:5000
```

Kết quả mong đợi:
```json
{
  "success": true,
  "message": "CraftUI ERP API Server is running! 🚀",
  "version": "1.0.0",
  "endpoints": {
    "auth": "/api/auth",
    "products": "/api/products",
    "orders": "/api/orders"
  }
}
```

### Test 2: Login từ Frontend

1. Truy cập: http://localhost:3001/login
2. Nhập: admin@craftui.com / admin123
3. Click "Đăng nhập"
4. Kiểm tra:
   - Toast success xuất hiện
   - Redirect về /dashboard
   - User info hiển thị đúng trong Sidebar

### Test 3: Check Network trong DevTools

1. Mở DevTools (F12)
2. Tab Network
3. Login lại
4. Xem request `POST /api/auth/login`:
   - Status: 200 OK
   - Response chứa `accessToken`

## Bước 5: Cấu trúc Response chuẩn từ Backend

Backend trả về format:

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
    "accessToken": "eyJhbGc..."
  }
}
```

Frontend cần access: `response.data.data`

## Bước 6: Tạo service cho Products và Orders

Tương tự như authService, tạo:

### `src/services/productService.ts`

```typescript
import api from './api';

export const productService = {
  async getProducts(params?: any) {
    const response = await api.get('/products', { params });
    return response.data;
  },

  async getProduct(id: string) {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },

  async createProduct(data: any) {
    const response = await api.post('/products', data);
    return response.data;
  },

  async updateProduct(id: string, data: any) {
    const response = await api.put(`/products/${id}`, data);
    return response.data;
  },

  async deleteProduct(id: string) {
    const response = await api.delete(`/products/${id}`);
    return response.data;
  },
};
```

### `src/services/orderService.ts`

```typescript
import api from './api';

export const orderService = {
  async getOrders(params?: any) {
    const response = await api.get('/orders', { params });
    return response.data;
  },

  async getOrder(id: string) {
    const response = await api.get(`/orders/${id}`);
    return response.data;
  },

  async createOrder(data: any) {
    const response = await api.post('/orders', data);
    return response.data;
  },

  async updateOrderStatus(id: string, status: string) {
    const response = await api.put(`/orders/${id}/status`, { status });
    return response.data;
  },

  async cancelOrder(id: string) {
    const response = await api.put(`/orders/${id}/cancel`);
    return response.data;
  },
};
```

## Troubleshooting

### Lỗi: CORS Policy

**Triệu chứng:**
```
Access to XMLHttpRequest at 'http://localhost:5000/api/auth/login' 
from origin 'http://localhost:3001' has been blocked by CORS policy
```

**Giải pháp:**
Cập nhật `CLIENT_URL` trong `server/.env`:
```env
CLIENT_URL=http://localhost:3001
```

### Lỗi: Network Error / ERR_CONNECTION_REFUSED

**Nguyên nhân:** Backend server chưa chạy

**Giải pháp:**
```bash
cd server
npm run dev
```

### Lỗi: 401 Unauthorized

**Nguyên nhân:** Token không được gửi hoặc đã expired

**Giải pháp:**
1. Check localStorage có `accessToken`?
2. Check header: `Authorization: Bearer <token>`
3. Login lại để lấy token mới

### Lỗi: Cannot connect to MongoDB

**Giải pháp:**
1. Check MongoDB đang chạy
2. Check `MONGODB_URI` trong `server/.env`
3. Dùng MongoDB Atlas nếu không có local MongoDB

## Next Steps

Sau khi kết nối thành công:

1. ✅ Update authService để dùng real API
2. ⏭️ Tạo productService và orderService
3. ⏭️ Build trang Products List
4. ⏭️ Build trang Orders Management
5. ⏭️ Add Image Upload cho Products
6. ⏭️ Add Dashboard Statistics từ backend

## Các endpoint có sẵn

### Authentication
- POST `/api/auth/signup` - Đăng ký
- POST `/api/auth/login` - Đăng nhập
- GET `/api/auth/me` - Lấy thông tin user (Protected)
- POST `/api/auth/logout` - Đăng xuất (Protected)

### Products
- GET `/api/products` - Danh sách sản phẩm (Protected)
- GET `/api/products/:id` - Chi tiết sản phẩm (Protected)
- POST `/api/products` - Tạo sản phẩm (Admin/Manager)
- PUT `/api/products/:id` - Cập nhật (Admin/Manager)
- DELETE `/api/products/:id` - Xóa (Admin)

### Orders
- GET `/api/orders` - Danh sách đơn hàng (Protected)
- GET `/api/orders/:id` - Chi tiết đơn hàng (Protected)
- POST `/api/orders` - Tạo đơn hàng (Protected)
- PUT `/api/orders/:id/status` - Cập nhật trạng thái (Admin/Manager)
- PUT `/api/orders/:id/payment` - Cập nhật thanh toán (Admin/Manager)
- PUT `/api/orders/:id/cancel` - Hủy đơn (Protected)

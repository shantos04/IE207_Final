# 🔐 Authentication Module - Hướng dẫn sử dụng

## Tổng quan
Module Authentication đã được tích hợp hoàn chỉnh với các tính năng:
- ✅ Login/Sign Up với validation
- ✅ Protected Routes
- ✅ JWT Token management
- ✅ Toast notifications
- ✅ Auto logout khi token hết hạn

## Thông tin đăng nhập Demo

### Tài khoản mặc định:
- **Email:** admin@craftui.com
- **Password:** admin123

## Cấu trúc Files

```
src/
├── contexts/
│   └── AuthContext.tsx         # Context quản lý authentication state
├── services/
│   ├── api.ts                  # Axios instance với interceptors
│   └── authService.ts          # Authentication API calls
├── components/
│   └── auth/
│       └── ProtectedRoute.tsx  # HOC bảo vệ routes
└── pages/
    └── AuthPage.tsx            # Login/SignUp UI
```

## Validation Rules

### Login Form
- **Email:** Phải đúng định dạng email
- **Password:** Tối thiểu 6 ký tự

### Sign Up Form
- **Full Name:** Tối thiểu 2 ký tự
- **Email:** Phải đúng định dạng email
- **Password:** Tối thiểu 6 ký tự
- **Terms:** Phải đồng ý điều khoản

## Authentication Flow

### 1. Login Process
```typescript
// User submit login form
↓
// Validate với Zod schema
↓
// Call authService.login(credentials)
↓
// Save accessToken + user data vào localStorage
↓
// Update AuthContext state
↓
// Redirect to /dashboard
```

### 2. Protected Route Check
```typescript
// User access protected route
↓
// ProtectedRoute component check isAuthenticated
↓
// If authenticated → Render children
// If not → Redirect to /login
```

### 3. Logout Process
```typescript
// User click Logout button
↓
// Remove accessToken + user từ localStorage
↓
// Clear AuthContext state
↓
// Redirect to /login
```

## API Integration

### Mock API (Development)
Hiện tại sử dụng Mock API responses trong `authService.ts`:
- Login: Chấp nhận `admin@craftui.com` / `admin123`
- Sign Up: Chấp nhận bất kỳ email hợp lệ + password >= 6 ký tự

### Real API (Production)
Để kết nối Backend thực:

1. **Update .env:**
```bash
VITE_API_URL=https://your-api-domain.com/api
```

2. **Uncomment Real API calls trong authService.ts:**
```typescript
// Login
const response = await api.post<AuthResponse>('/auth/login', credentials);
return response.data;
```

3. **Backend API Endpoints cần implement:**
- `POST /api/auth/login` - Body: { email, password }
- `POST /api/auth/signup` - Body: { fullName, email, password }
- `POST /api/auth/logout` - Header: Authorization Bearer token

## Security Features

### 1. Token Storage
- AccessToken lưu trong **localStorage**
- Tự động thêm vào headers mỗi API request

### 2. Auto Interceptors
```typescript
// Request: Thêm token vào header
config.headers.Authorization = `Bearer ${token}`;

// Response: Xử lý 401 Unauthorized
if (error.response?.status === 401) {
  // Auto logout & redirect to login
}
```

### 3. Route Protection
Tất cả routes trong Dashboard đều được bọc trong `<ProtectedRoute>`:
```tsx
<Route
  path="/"
  element={
    <ProtectedRoute>
      <DashboardLayout />
    </ProtectedRoute>
  }
>
  <Route path="dashboard" element={<DashboardHome />} />
</Route>
```

## Sử dụng useAuth Hook

```tsx
import { useAuth } from '../contexts/AuthContext';

function MyComponent() {
  const { user, isAuthenticated, login, logout } = useAuth();

  return (
    <div>
      {isAuthenticated ? (
        <p>Xin chào, {user?.fullName}</p>
      ) : (
        <p>Vui lòng đăng nhập</p>
      )}
    </div>
  );
}
```

## Toast Notifications

Module sử dụng `react-hot-toast`:
```typescript
// Success
toast.success('Đăng nhập thành công!');

// Error
toast.error('Email hoặc mật khẩu không đúng');
```

## Testing Scenarios

### ✅ Test Case 1: Login thành công
1. Truy cập http://localhost:3001
2. Tự động redirect sang /login
3. Nhập: admin@craftui.com / admin123
4. Click "Đăng nhập"
5. Kết quả: Toast success → Redirect /dashboard

### ✅ Test Case 2: Login sai thông tin
1. Nhập email/password sai
2. Click "Đăng nhập"
3. Kết quả: Toast error "Email hoặc mật khẩu không đúng"

### ✅ Test Case 3: Validation errors
1. Nhập email sai format
2. Kết quả: Hiển thị lỗi "Email không hợp lệ"
3. Nhập password < 6 ký tự
4. Kết quả: Hiển thị lỗi "Mật khẩu phải có ít nhất 6 ký tự"

### ✅ Test Case 4: Protected Route
1. Đăng xuất (Logout)
2. Thử truy cập http://localhost:3001/dashboard
3. Kết quả: Auto redirect về /login

### ✅ Test Case 5: Sign Up
1. Click "Đăng ký"
2. Điền form đầy đủ + check "Đồng ý điều khoản"
3. Click "Đăng ký"
4. Kết quả: Toast success → Auto login → Redirect /dashboard

## Troubleshooting

### Lỗi: "Failed to resolve import"
- **Nguyên nhân:** Import path sai
- **Giải pháp:** Kiểm tra relative path `../../contexts/AuthContext`

### Lỗi: Port already in use
- **Nguyên nhân:** Port 3000 đang được sử dụng
- **Giải pháp:** Vite tự động chuyển sang port khác (3001, 3002...)

### User không được redirect sau login
- **Kiểm tra:** Token có được lưu vào localStorage?
- **Kiểm tra:** AuthContext state có được update?
- **Giải pháp:** Mở DevTools → Application → Local Storage

## Next Steps

- [ ] Implement "Remember Me" checkbox
- [ ] Add Password Reset flow
- [ ] Add Email verification
- [ ] Implement Refresh Token rotation
- [ ] Add Two-Factor Authentication (2FA)
- [ ] Social Login integration (Google, Facebook)

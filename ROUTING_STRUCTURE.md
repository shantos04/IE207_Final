# 🗺️ Routing Structure

## Tổng quan cấu trúc Routes

Dự án sử dụng **React Router v6** với cấu trúc Nested Routes để tách biệt rõ ràng giữa giao diện khách hàng (Client) và giao diện quản trị (Admin).

---

## 📋 Cấu trúc Routes

### 1. **Public Auth Routes** (Không có Layout)
Các route dành cho đăng nhập/đăng ký, không sử dụng layout nào.

```
/login          → AuthPage (Đăng nhập)
/auth           → AuthPage (Đăng nhập)
/register       → AuthPage (Đăng ký)
```

### 2. **Client Routes** (ClientLayout)
Giao diện bán hàng cho khách hàng, sử dụng `ClientLayout`.

```
/               → HomePage (Trang chủ)
/shop           → ShopPage (Danh sách sản phẩm)
/product/:id    → ProductDetailPage (Chi tiết sản phẩm)
/cart           → CartPage (Giỏ hàng)
```

**Features:**
- Header với logo, search bar, giỏ hàng (badge số lượng)
- Menu ngang: Trang chủ, Sản phẩm, Giới thiệu, Liên hệ
- Footer 4 cột với thông tin liên hệ và mạng xã hội
- Responsive với mobile menu

### 3. **Admin Routes** (DashboardLayout - Protected)
Giao diện quản trị, được bảo vệ bởi `ProtectedRoute`, sử dụng `DashboardLayout`.

```
/admin                  → Redirect to /admin/dashboard
/admin/dashboard        → DashboardHome (Tổng quan)
/admin/products         → ProductsPage (Quản lý sản phẩm)
/admin/orders           → OrdersPage (Quản lý đơn hàng)
/admin/customers        → CustomersPage (Quản lý khách hàng)
/admin/invoices         → InvoicesPage (Quản lý hóa đơn)
/admin/reports          → ReportsPage (Báo cáo)
/admin/settings         → SettingsPage (Cài đặt)
```

**Features:**
- Sidebar với menu navigation
- Header với user profile
- Protected bởi `ProtectedRoute` (yêu cầu đăng nhập)
- Chỉ admin mới truy cập được

### 4. **Catch All** (404)
```
/*              → Navigate to / (Redirect về trang chủ)
```

---

## 🔐 Authentication Flow

### Login Success Flow:
1. User đăng nhập tại `/login` hoặc `/auth`
2. AuthPage gọi `login()` từ AuthContext
3. Sau khi thành công → `navigate('/admin/dashboard')`
4. ProtectedRoute kiểm tra authentication
5. Nếu authenticated → Hiển thị DashboardLayout + DashboardHome
6. Nếu không → Redirect về `/login`

### Logout Flow:
1. User click nút Đăng xuất (Sidebar hoặc ClientLayout)
2. Gọi `logout()` từ AuthContext
3. Redirect về `/login`

---

## 🎨 Layout Components

### ClientLayout
**Path:** `src/layouts/ClientLayout.tsx`
- Dành cho khách hàng
- Components: Header + Menu + Outlet + Footer
- Không yêu cầu authentication

### DashboardLayout (AdminLayout)
**Path:** `src/components/layout/DashboardLayout.tsx`
- Dành cho admin
- Components: Sidebar + Header + Outlet
- Yêu cầu authentication

---

## 🛡️ Protected Routes

### ProtectedRoute Component
**Path:** `src/components/auth/ProtectedRoute.tsx`

**Logic:**
```typescript
if (isLoading) → Show loading spinner
if (!isAuthenticated) → Navigate to /login with state
if (isAuthenticated) → Render children
```

**Usage:**
```tsx
<Route path="/admin" element={
    <ProtectedRoute>
        <DashboardLayout />
    </ProtectedRoute>
}>
    {/* Nested admin routes */}
</Route>
```

---

## 📦 Context Providers

### AuthProvider
Quản lý authentication state và functions:
- `user`: Current user object
- `isAuthenticated`: Boolean
- `isLoading`: Boolean
- `login(credentials)`: Login function
- `logout()`: Logout function
- `signUp(data)`: Sign up function

### CartProvider
Quản lý shopping cart state:
- `items`: CartItem[]
- `addToCart(item, quantity)`: Add item
- `removeFromCart(id)`: Remove item
- `updateQuantity(id, quantity)`: Update quantity
- `clearCart()`: Clear all items
- `total`: Total price

---

## 🔗 Navigation Links

### Sidebar (Admin)
Tất cả links trong Sidebar có prefix `/admin`:
- `/admin/dashboard`
- `/admin/products`
- `/admin/orders`
- `/admin/customers`
- `/admin/invoices`
- `/admin/reports`
- `/admin/settings`

### ClientLayout Header
- Logo → `/` (Home)
- Trang chủ → `/`
- Sản phẩm → `/shop`
- Giới thiệu → `/about`
- Liên hệ → `/contact`
- Giỏ hàng → `/cart`
- Đăng nhập → `/login`
- Quản trị (admin only) → `/admin`

---

## 🚀 Getting Started

1. **Truy cập giao diện khách hàng:**
   ```
   http://localhost:5173/
   ```

2. **Truy cập giao diện admin:**
   ```
   http://localhost:5173/admin
   ```
   - Nếu chưa đăng nhập → Redirect to `/login`
   - Sau khi login → Vào `/admin/dashboard`

3. **Thông tin đăng nhập mặc định:**
   - Email: `admin@craftui.com`
   - Password: `123456`

---

## 📝 Notes

- Tất cả admin routes đều có prefix `/admin`
- ClientLayout và DashboardLayout hoàn toàn tách biệt
- Cart state được lưu vào localStorage
- Authentication state được lưu vào localStorage
- Mobile responsive cho cả Client và Admin layouts

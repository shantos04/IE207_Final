# 🎫 Quick Reference - Test Accounts

## 🔐 Tài khoản test

### 👤 Khách hàng (Customer) - Storefront
```
📧 Email:     khachhang@craftui.com
🔑 Password:  123456
🎭 Role:      customer
📱 Phone:     0909123456
```

**Sử dụng để:**
- ✅ Test giao diện bán hàng (Storefront)
- ✅ Duyệt sản phẩm
- ✅ Thêm vào giỏ hàng
- ✅ Đặt hàng
- ✅ Xem lịch sử đơn hàng

---

### 👑 Quản trị viên (Admin) - Dashboard
```
📧 Email:     admin@craftui.com
🔑 Password:  123456
🎭 Role:      admin
📱 Phone:     0901234567
```

**Sử dụng để:**
- ✅ Test giao diện quản trị (Admin Dashboard)
- ✅ Quản lý sản phẩm
- ✅ Quản lý đơn hàng
- ✅ Quản lý khách hàng
- ✅ Xem báo cáo & thống kê
- ✅ Cấu hình hệ thống

---

## 🚀 Tạo tài khoản test

```bash
cd server
npm run seed:users
```

---

## 🌐 URL Test

| Giao diện | URL | Account |
|-----------|-----|---------|
| **Trang chủ** | `http://localhost:5173/` | Public |
| **Shop** | `http://localhost:5173/shop` | Public |
| **Giỏ hàng** | `http://localhost:5173/cart` | Public |
| **Đăng nhập (Client)** | `http://localhost:5173/login` | - |
| **Admin Dashboard** | `http://localhost:5173/admin` | admin@craftui.com |
| **Admin Products** | `http://localhost:5173/admin/products` | admin@craftui.com |
| **Admin Orders** | `http://localhost:5173/admin/orders` | admin@craftui.com |

---

## 🔄 Reset tài khoản

Nếu muốn reset hoặc tạo lại:

```bash
# Xóa tất cả users trong database
mongosh
> use ie207_erp
> db.users.deleteMany({})

# Chạy lại seed
cd server
npm run seed:users
```

---

## 📱 Test Flow

### Flow 1: Khách hàng mua hàng
1. Truy cập `http://localhost:5173/`
2. Click "Đăng nhập" → Nhập `khachhang@craftui.com` / `123456`
3. Vào `/shop` → Duyệt sản phẩm
4. Click sản phẩm → Thêm vào giỏ hàng
5. Vào `/cart` → Kiểm tra giỏ hàng
6. Click "Thanh toán" → Hoàn tất đơn hàng

### Flow 2: Admin quản lý
1. Truy cập `http://localhost:5173/admin`
2. Đăng nhập với `admin@craftui.com` / `123456`
3. Vào Dashboard → Xem tổng quan
4. Vào Products → Quản lý sản phẩm
5. Vào Orders → Xem đơn hàng mới
6. Vào Settings → Cấu hình hệ thống

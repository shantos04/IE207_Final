# 👤 Users Seeder

## Mô tả
Script này tạo các tài khoản user mẫu cho hệ thống, bao gồm:
- **Customer Account** (Khách hàng) - để test giao diện Storefront
- **Admin Account** (Quản trị viên) - để test giao diện Admin

## 📋 Thông tin tài khoản

### 🛍️ Khách hàng (Customer)
```
Email:    khachhang@craftui.com
Password: 123456
Role:     customer
Phone:    0909123456
```

### 👑 Quản trị viên (Admin)
```
Email:    admin@craftui.com
Password: 123456
Role:     admin
Phone:    0901234567
```

## 🚀 Cách chạy

### Từ thư mục `server/`:

```bash
# Chạy seed users
npm run seed:users
```

### Hoặc dùng node trực tiếp:

```bash
node seeders/users.seed.js
```

## ⚙️ Yêu cầu

1. **MongoDB** phải đang chạy
2. **Environment variables** đã được cấu hình trong `.env`:
   ```env
   MONGODB_URI=mongodb://localhost:27017/ie207_erp
   ```

## 📝 Lưu ý

- Script sẽ kiểm tra xem user đã tồn tại chưa trước khi tạo
- Nếu user đã tồn tại, script sẽ bỏ qua và không tạo duplicate
- Password được hash bằng bcrypt với salt rounds = 10
- Script tự động disconnect khỏi database sau khi hoàn thành

## 🔧 Cấu trúc User Model

User model bao gồm các trường:
- `username`: String, unique, required
- `email`: String, unique, required
- `password`: String, required (được hash)
- `fullName`: String, required
- `role`: Enum ['admin', 'manager', 'staff', 'customer']
- `phone`: String
- `avatar`: String (URL)
- `isActive`: Boolean (default: true)
- `createdAt`: Date (auto)
- `updatedAt`: Date (auto)

## 🎯 Use Cases

### Test Storefront (Giao diện khách hàng)
1. Đăng nhập với tài khoản `khachhang@craftui.com`
2. Duyệt sản phẩm, thêm vào giỏ hàng
3. Thực hiện checkout
4. Xem lịch sử đơn hàng

### Test Admin Dashboard (Giao diện quản trị)
1. Đăng nhập với tài khoản `admin@craftui.com`
2. Quản lý sản phẩm, đơn hàng, khách hàng
3. Xem báo cáo, thống kê
4. Cấu hình hệ thống

## 🔄 Update User Model

Nếu bạn thêm role 'customer' mới vào User model, script này sẽ tự động sử dụng role đó. User model đã được cập nhật để support:

```javascript
role: {
    type: String,
    enum: ['admin', 'manager', 'staff', 'customer'],
    default: 'staff',
}
```

## 📊 Output mẫu

```
🌱 Starting User Seeding Process...

✅ Đã tạo User Khách hàng thành công:
   📧 Email: khachhang@craftui.com
   🔑 Password: 123456
   👤 Role: customer
   📱 Phone: 0909123456

✅ Đã tạo User Admin thành công:
   📧 Email: admin@craftui.com
   🔑 Password: 123456
   👤 Role: admin
   📱 Phone: 0901234567

✅ User seeding completed successfully!

📋 Summary:
   Total Users: 2
   - Customers: 1
   - Admins: 1
   - Managers: 0
   - Staff: 0

✨ All done! Disconnecting from database...

👋 Database connection closed.
```

## 🐛 Troubleshooting

### Lỗi kết nối MongoDB
```
❌ Error: connect ECONNREFUSED 127.0.0.1:27017
```
**Giải pháp:** Kiểm tra MongoDB đang chạy:
```bash
# Windows
net start MongoDB

# macOS/Linux
sudo systemctl start mongod
```

### Lỗi duplicate key
```
❌ E11000 duplicate key error collection
```
**Giải pháp:** User đã tồn tại trong database. Script sẽ tự động bỏ qua.

### Lỗi validation
```
❌ User validation failed: email: Email không hợp lệ
```
**Giải pháp:** Kiểm tra lại format email trong script.

## 🔗 Related Scripts

- `master.seed.js` - Seed toàn bộ database (bao gồm users, products, orders, etc.)
- `products.seed.js` - Seed sản phẩm
- `orders.seed.js` - Seed đơn hàng
- `settings.seed.js` - Seed cấu hình hệ thống

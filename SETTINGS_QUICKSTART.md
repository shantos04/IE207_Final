# 🚀 Settings Module - Quick Start Guide

## Khởi động nhanh trong 3 bước

### Bước 1: Seed Settings vào Database
```bash
cd server
npm run seed:settings
```

**Output mong đợi:**
```
✅ Settings đã được khởi tạo thành công!
Settings: {
  companyName: 'Công ty TNHH CraftUI',
  logoUrl: 'https://via.placeholder.com/200x80?text=CraftUI+Logo',
  taxCode: '0123456789',
  address: '123 Nguyễn Văn Linh, Quận 7, TP. Hồ Chí Minh',
  phone: '0901234567',
  email: 'contact@craftui.com',
  currency: 'VND'
}
```

---

### Bước 2: Start Server (nếu chưa chạy)
```bash
npm run dev
```

**Server sẽ chạy tại:** `http://localhost:5000`

---

### Bước 3: Test API

#### Option 1: Sử dụng Test HTML Tool (Recommended)
1. Mở file `test-settings-api.html` trong browser
2. Settings sẽ tự động load
3. Test các chức năng:
   - ✅ Xem settings
   - ✅ Update settings (cần admin token)
   - ✅ Update profile (cần user token)
   - ✅ Change password (cần user token)

#### Option 2: Sử dụng cURL
```bash
# 1. Get Settings (Public)
curl http://localhost:5000/api/settings

# 2. Update Settings (Admin only) - Cần token
curl -X PUT http://localhost:5000/api/settings \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"companyName": "New Company Name"}'

# 3. Update Profile (Authenticated)
curl -X PUT http://localhost:5000/api/settings/profile \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"fullName": "John Doe"}'

# 4. Change Password (Authenticated)
curl -X PUT http://localhost:5000/api/settings/change-password \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "currentPassword": "old123",
    "newPassword": "new123456",
    "confirmPassword": "new123456"
  }'
```

---

## 🔑 Lấy Token để Test

### 1. Login để lấy token
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "your-email@example.com",
    "password": "your-password"
  }'
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "data": {
    "user": { ... }
  }
}
```

### 2. Copy token và sử dụng
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 📝 API Endpoints Summary

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| GET | `/api/settings` | Public | - | Lấy system settings |
| PUT | `/api/settings` | Required | Admin | Update system settings |
| PUT | `/api/settings/profile` | Required | Any | Update own profile |
| PUT | `/api/settings/change-password` | Required | Any | Change password |

---

## 🎯 Test Scenarios

### ✅ Scenario 1: Xem Settings (Không cần auth)
```bash
curl http://localhost:5000/api/settings
```
**Expected:** Status 200, trả về settings

---

### ✅ Scenario 2: Admin Update Settings
1. Login với admin account
2. Copy token
3. Update settings:
```bash
curl -X PUT http://localhost:5000/api/settings \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "companyName": "Updated Company",
    "taxCode": "9999999999"
  }'
```
**Expected:** Status 200, settings updated

---

### ✅ Scenario 3: User Update Profile
```bash
curl -X PUT http://localhost:5000/api/settings/profile \
  -H "Authorization: Bearer USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Nguyễn Văn A",
    "phone": "0901234567"
  }'
```
**Expected:** Status 200, profile updated

---

### ✅ Scenario 4: Change Password
```bash
curl -X PUT http://localhost:5000/api/settings/change-password \
  -H "Authorization: Bearer USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "currentPassword": "oldpassword",
    "newPassword": "newpassword123",
    "confirmPassword": "newpassword123"
  }'
```
**Expected:** Status 200, password changed

---

## ⚠️ Common Errors & Solutions

### Error 1: "Chỉ được phép tồn tại một bản ghi cấu hình hệ thống"
**Cause:** Đã có settings trong DB
**Solution:** Bình thường, bỏ qua hoặc xóa settings cũ trong MongoDB

### Error 2: "Vai trò staff không có quyền truy cập"
**Cause:** User không phải Admin
**Solution:** Login với tài khoản Admin hoặc test endpoint khác

### Error 3: "Mật khẩu hiện tại không đúng"
**Cause:** Current password sai
**Solution:** Kiểm tra lại mật khẩu hiện tại

### Error 4: "Token không hợp lệ hoặc đã hết hạn"
**Cause:** Token sai hoặc expired
**Solution:** Login lại để lấy token mới

---

## 🎉 Done!

Module Settings đã sẵn sàng sử dụng! 

**Next step:** Tích hợp Frontend với React/TypeScript

📚 **Đọc thêm:**
- [SETTINGS_MODULE_README.md](server/SETTINGS_MODULE_README.md) - Full documentation
- [SETTINGS_MODULE_COMPLETE.md](SETTINGS_MODULE_COMPLETE.md) - Implementation summary

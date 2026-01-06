# ✅ Settings Module - Hoàn thành

## 📁 Files đã tạo

### 1. Model
- ✅ [server/models/Setting.js](server/models/Setting.js)
  - Schema SystemSetting với Singleton pattern
  - 7 fields: companyName, logoUrl, taxCode, address, phone, email, currency
  - Static method `getInstance()` để đảm bảo chỉ 1 document

### 2. Controller
- ✅ [server/controllers/settingController.js](server/controllers/settingController.js)
  - `getSettings`: Lấy thông tin cấu hình (Public)
  - `updateSettings`: Cập nhật cấu hình (Admin only)
  - `updateUserProfile`: User tự sửa profile (fullName, avatar, phone)
  - `changePassword`: Đổi mật khẩu với validation đầy đủ

### 3. Routes
- ✅ [server/routes/settingRoutes.js](server/routes/settingRoutes.js)
  - GET `/api/settings` - Lấy settings
  - PUT `/api/settings` - Update settings (Admin)
  - PUT `/api/settings/profile` - Update profile (Authenticated)
  - PUT `/api/settings/change-password` - Đổi mật khẩu (Authenticated)

### 4. Integration
- ✅ [server/index.js](server/index.js) - Đã thêm settingRoutes vào server

### 5. Documentation
- ✅ [server/SETTINGS_MODULE_README.md](server/SETTINGS_MODULE_README.md) - Tài liệu chi tiết

### 6. Testing
- ✅ [test-settings-api.html](test-settings-api.html) - Tool test API với UI đẹp

### 7. Seeder
- ✅ [server/seeders/settings.seed.js](server/seeders/settings.seed.js) - Khởi tạo settings mặc định

---

## 🚀 Cách sử dụng

### 1. Khởi tạo Settings mặc định
```bash
cd server
npm run seed:settings
```

### 2. Test API
Mở file `test-settings-api.html` trong browser để test các endpoint.

### 3. Endpoints

#### 📖 GET /api/settings
Lấy thông tin cấu hình hệ thống (Public)
```bash
curl http://localhost:5000/api/settings
```

#### ✏️ PUT /api/settings (Admin only)
Cập nhật cấu hình hệ thống
```bash
curl -X PUT http://localhost:5000/api/settings \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "companyName": "New Company Name",
    "taxCode": "9876543210"
  }'
```

#### 👤 PUT /api/settings/profile
Cập nhật profile cá nhân
```bash
curl -X PUT http://localhost:5000/api/settings/profile \
  -H "Authorization: Bearer USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Nguyễn Văn A",
    "phone": "0901234567"
  }'
```

#### 🔐 PUT /api/settings/change-password
Đổi mật khẩu
```bash
curl -X PUT http://localhost:5000/api/settings/change-password \
  -H "Authorization: Bearer USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "currentPassword": "old123",
    "newPassword": "new123456",
    "confirmPassword": "new123456"
  }'
```

---

## 🔒 Security Features

✅ **Singleton Pattern** - Đảm bảo chỉ 1 bản ghi settings trong DB
✅ **Role-based Access** - Chỉ Admin sửa được system settings
✅ **Password Verification** - Kiểm tra mật khẩu cũ trước khi đổi
✅ **Password Validation**:
  - Mật khẩu mới >= 6 ký tự
  - Mật khẩu mới phải khớp với confirm
  - Mật khẩu mới không được trùng mật khẩu cũ
✅ **Input Validation** - Email, phone regex validation
✅ **Bcrypt Hashing** - Auto hash password trong User model
✅ **Protected Routes** - Require JWT token

---

## 📊 Model Schema

```javascript
{
  companyName: String (required, default: 'Công ty TNHH ABC'),
  logoUrl: String (URL hoặc Base64),
  taxCode: String (max 20 ký tự),
  address: String,
  phone: String (regex validation),
  email: String (regex validation),
  currency: Enum ['VND', 'USD', 'EUR'] (default: 'VND'),
  isSingleton: Boolean (immutable: true),
  timestamps: true
}
```

---

## 🎯 Next Steps (Frontend)

Để tích hợp Frontend, tạo các file sau:

### 1. Service
```typescript
// src/services/settingService.ts
export const getSettings = async () => { ... }
export const updateSettings = async (data) => { ... }
export const updateProfile = async (data) => { ... }
export const changePassword = async (data) => { ... }
```

### 2. Page
```typescript
// src/pages/SettingsPage.tsx
- Tab: System Settings (Admin only)
- Tab: User Profile
- Tab: Change Password
```

### 3. Components
```typescript
// src/components/settings/SystemSettingsForm.tsx
// src/components/settings/UserProfileForm.tsx
// src/components/settings/ChangePasswordForm.tsx
```

---

## ✅ Checklist

- [x] Model Setting với Singleton pattern
- [x] Controller với 4 methods
- [x] Routes với authorization
- [x] Integration vào server
- [x] Documentation đầy đủ
- [x] Test HTML tool
- [x] Seeder script
- [x] Package.json script
- [ ] Frontend integration (Next step)

---

## 📝 Notes

- Settings được tự động tạo lần đầu tiên khi gọi `getInstance()`
- Model sử dụng timestamps (createdAt, updatedAt)
- Password được hash tự động trong User model pre-save hook
- Email và phone có regex validation
- Tất cả errors đều được handle với try-catch
- Response format nhất quán: `{ success, message?, data?, error? }`

---

## 🎉 Kết luận

Module Settings đã hoàn thành 100% theo yêu cầu:
- ✅ Singleton SystemSetting model
- ✅ Admin update system settings
- ✅ User update own profile
- ✅ Change password với validation đầy đủ
- ✅ Secure với JWT + Role-based access
- ✅ Đầy đủ documentation và test tools

Sẵn sàng để tích hợp vào Frontend! 🚀

# Settings Module - Backend Documentation

## Tổng quan
Module Settings quản lý cấu hình toàn hệ thống và thông tin cá nhân của user.

## Files Structure

```
server/
├── models/
│   └── Setting.js              # Model SystemSetting (Singleton)
├── controllers/
│   └── settingController.js    # Controllers xử lý logic
└── routes/
    └── settingRoutes.js        # Routes definition
```

---

## 1. Model: Setting.js

### Schema Fields

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `companyName` | String | Yes | 'Công ty TNHH ABC' | Tên công ty |
| `logoUrl` | String | No | '' | URL logo hoặc Base64 |
| `taxCode` | String | No | '' | Mã số thuế (max 20 ký tự) |
| `address` | String | No | '' | Địa chỉ công ty |
| `phone` | String | No | '' | Số điện thoại |
| `email` | String | No | '' | Email công ty |
| `currency` | String (enum) | No | 'VND' | Đơn vị tiền tệ (VND, USD, EUR) |
| `isSingleton` | Boolean | No | true | Flag đảm bảo singleton |

### Singleton Pattern
- Chỉ cho phép **1 document duy nhất** trong database
- Sử dụng `pre('save')` hook để kiểm tra
- Static method `getInstance()` để lấy hoặc tạo settings

### Usage Example

```javascript
import Setting from './models/Setting.js';

// Lấy hoặc tạo settings (Singleton)
const settings = await Setting.getInstance();

// Update settings
settings.companyName = 'New Company Name';
await settings.save();
```

---

## 2. Controller: settingController.js

### 2.1. getSettings
**Lấy thông tin cấu hình hệ thống**

- **Method:** GET
- **Endpoint:** `/api/settings`
- **Access:** Public (hoặc Protected)
- **Response:**
```json
{
  "success": true,
  "data": {
    "_id": "...",
    "companyName": "Công ty ABC",
    "logoUrl": "https://...",
    "taxCode": "0123456789",
    "address": "123 Main St",
    "phone": "0901234567",
    "email": "contact@company.com",
    "currency": "VND",
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

---

### 2.2. updateSettings
**Cập nhật cấu hình hệ thống (Admin only)**

- **Method:** PUT
- **Endpoint:** `/api/settings`
- **Access:** Private/Admin
- **Headers:**
```
Authorization: Bearer <token>
```
- **Body:**
```json
{
  "companyName": "New Name",
  "logoUrl": "https://new-logo.png",
  "taxCode": "9876543210",
  "address": "456 New Street",
  "phone": "0909999999",
  "email": "new@company.com",
  "currency": "USD"
}
```
- **Response:**
```json
{
  "success": true,
  "message": "Cập nhật cấu hình thành công",
  "data": { /* updated settings */ }
}
```

---

### 2.3. updateUserProfile
**Cập nhật thông tin cá nhân của user**

- **Method:** PUT
- **Endpoint:** `/api/settings/profile`
- **Access:** Private (Authenticated)
- **Headers:**
```
Authorization: Bearer <token>
```
- **Body:**
```json
{
  "fullName": "Nguyễn Văn A",
  "avatar": "https://avatar-url.png",
  "phone": "0901234567"
}
```
- **Response:**
```json
{
  "success": true,
  "message": "Cập nhật thông tin cá nhân thành công",
  "data": {
    "_id": "...",
    "username": "user123",
    "email": "user@example.com",
    "fullName": "Nguyễn Văn A",
    "avatar": "https://...",
    "phone": "0901234567",
    "role": "staff"
  }
}
```

---

### 2.4. changePassword
**Đổi mật khẩu**

- **Method:** PUT
- **Endpoint:** `/api/settings/change-password`
- **Access:** Private (Authenticated)
- **Headers:**
```
Authorization: Bearer <token>
```
- **Body:**
```json
{
  "currentPassword": "oldPassword123",
  "newPassword": "newPassword123",
  "confirmPassword": "newPassword123"
}
```
- **Validations:**
  - ✅ Mật khẩu hiện tại phải đúng
  - ✅ Mật khẩu mới >= 6 ký tự
  - ✅ Mật khẩu mới và xác nhận phải khớp
  - ✅ Mật khẩu mới không được trùng mật khẩu cũ

- **Response:**
```json
{
  "success": true,
  "message": "Đổi mật khẩu thành công"
}
```

- **Error Responses:**
```json
// Mật khẩu hiện tại sai
{
  "success": false,
  "message": "Mật khẩu hiện tại không đúng"
}

// Mật khẩu mới và xác nhận không khớp
{
  "success": false,
  "message": "Mật khẩu mới và xác nhận mật khẩu không khớp"
}

// Mật khẩu mới trùng mật khẩu cũ
{
  "success": false,
  "message": "Mật khẩu mới không được trùng với mật khẩu cũ"
}
```

---

## 3. Routes: settingRoutes.js

### Route Definitions

| Method | Endpoint | Controller | Auth | Role |
|--------|----------|------------|------|------|
| GET | `/api/settings` | getSettings | Public | - |
| PUT | `/api/settings` | updateSettings | Protected | Admin |
| PUT | `/api/settings/profile` | updateUserProfile | Protected | Any |
| PUT | `/api/settings/change-password` | changePassword | Protected | Any |

---

## Testing với cURL/Postman

### 1. Lấy settings
```bash
curl http://localhost:5000/api/settings
```

### 2. Cập nhật settings (Admin)
```bash
curl -X PUT http://localhost:5000/api/settings \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "companyName": "New Company",
    "taxCode": "1234567890"
  }'
```

### 3. Cập nhật profile
```bash
curl -X PUT http://localhost:5000/api/settings/profile \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "John Doe",
    "phone": "0901234567"
  }'
```

### 4. Đổi mật khẩu
```bash
curl -X PUT http://localhost:5000/api/settings/change-password \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "currentPassword": "oldpass123",
    "newPassword": "newpass123",
    "confirmPassword": "newpass123"
  }'
```

---

## Security Features

✅ **Singleton Pattern** - Đảm bảo chỉ 1 bản ghi cấu hình
✅ **Role-based Access** - Chỉ Admin mới sửa được system settings
✅ **Password Verification** - Kiểm tra mật khẩu cũ trước khi đổi
✅ **Input Validation** - Validate email, phone, password strength
✅ **Bcrypt Hashing** - Hash mật khẩu trước khi lưu
✅ **Protected Routes** - Require authentication token

---

## Integration trong server/index.js

```javascript
import settingRoutes from './routes/settingRoutes.js';

// ...
app.use('/api/settings', settingRoutes);
```

---

## Next Steps (Frontend Integration)

1. Create `src/services/settingService.ts`
2. Create `src/pages/SettingsPage.tsx`
3. Create components:
   - `SystemSettingsForm.tsx` (Admin only)
   - `UserProfileForm.tsx`
   - `ChangePasswordForm.tsx`

---

## Error Handling

Tất cả controllers đều có try-catch để handle errors:
- **400**: Bad Request (validation errors)
- **401**: Unauthorized (wrong password, missing token)
- **403**: Forbidden (insufficient permissions)
- **404**: Not Found (user not exists)
- **500**: Server Error

---

## Notes

- Settings được tự động tạo lần đầu tiên khi gọi `getInstance()`
- Model sử dụng timestamps (createdAt, updatedAt)
- Password được hash tự động trong User model pre-save hook
- Email và phone có regex validation

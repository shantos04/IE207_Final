# 🔧 Fix: Lỗi đăng nhập tài khoản khách hàng

## 🐛 Vấn đề

Không đăng nhập được tài khoản khách hàng `khachhang@craftui.com` / `123456`

## 🔍 Nguyên nhân

Password bị **hash 2 lần**:

1. **Lần 1:** Trong seed script với `bcrypt.hashSync('123456', 10)`
2. **Lần 2:** Trong User model với pre-save hook

```javascript
// User Model - Pre-save hook
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt); // ← Hash lại!
    next();
});
```

Khi login, backend chỉ so sánh với password hash 1 lần, nên luôn fail!

## ✅ Giải pháp

### 1. Sửa `users.seed.js`

**Before:**
```javascript
const hashedPassword = bcrypt.hashSync('123456', 10);

const customerUser = new User({
    password: hashedPassword, // ← Hash thủ công
    // ...
});
```

**After:**
```javascript
const customerUser = new User({
    password: '123456', // ← Plain text, để pre-save hook tự hash
    // ...
});
```

### 2. Xóa users cũ

```bash
# Xóa tất cả users cũ (password bị hash sai)
mongosh ie207_erp --eval "db.users.deleteMany({})"
```

### 3. Chạy lại seed

```bash
cd server
npm run seed:users
```

## 🎯 Kết quả

```
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
```

## 🧪 Test Login

### Frontend Test:
1. Vào `http://localhost:5173/login`
2. Nhập:
   - Email: `khachhang@craftui.com`
   - Password: `123456`
3. Click "Đăng nhập"
4. ✅ Thành công → Redirect về `/` (ClientLayout)

### API Test (Postman/cURL):
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "khachhang@craftui.com",
    "password": "123456"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Đăng nhập thành công",
  "data": {
    "user": {
      "_id": "...",
      "username": "khachhang",
      "email": "khachhang@craftui.com",
      "fullName": "Khách Hàng Demo",
      "role": "customer",
      "phone": "0909123456"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6..."
  }
}
```

## 📝 Lưu ý

### ⚠️ Không nên hash password thủ công khi:
- Model có pre-save hook để hash password
- Sử dụng `Model.create()` hoặc `new Model().save()`

### ✅ Nên hash password thủ công khi:
- Sử dụng `Model.insertMany()` (không trigger hooks)
- Update trực tiếp database với `updateOne()`, `findByIdAndUpdate()`

## 🔒 Best Practice

### Seed Script Pattern:

```javascript
// ✅ GOOD - Let pre-save hook hash
const user = new User({
    email: 'user@example.com',
    password: '123456', // Plain text
});
await user.save(); // ← Triggers pre-save hook

// ❌ BAD - Double hashing
const hashedPassword = bcrypt.hashSync('123456', 10);
const user = new User({
    email: 'user@example.com',
    password: hashedPassword, // Already hashed
});
await user.save(); // ← Hash again!

// ✅ GOOD - Manual hash when bulk insert
const users = [
    {
        email: 'user1@example.com',
        password: bcrypt.hashSync('123456', 10),
    },
    {
        email: 'user2@example.com',
        password: bcrypt.hashSync('123456', 10),
    },
];
await User.insertMany(users); // No hooks triggered
```

## ✨ Files Changed

- ✅ `server/seeders/users.seed.js` - Bỏ manual hash
- ✅ Database - Xóa users cũ, tạo lại với password đúng

## 🎉 Done!

Giờ có thể đăng nhập bình thường với:
- 👤 **Customer:** `khachhang@craftui.com` / `123456`
- 👑 **Admin:** `admin@craftui.com` / `123456`

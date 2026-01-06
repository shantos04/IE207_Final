# 🚀 Quick Start - Master Seeding

## Chạy ngay trong 3 bước:

### 1️⃣ Vào thư mục server
```bash
cd server
```

### 2️⃣ Chạy master seed
```bash
npm run seed:master
```

### 3️⃣ Đợi kết quả
Sẽ thấy output như này:
```
✨ MASTER SEEDING COMPLETED!
🔑 Login với: admin@craftui.com / 123456
```

---

## ✅ Đã tạo:
- **1 Admin** - admin@craftui.com / 123456
- **50 Products** - Linh kiện điện tử
- **50 Customers** - Khách hàng VN
- **500 Orders** - Phân bố 3 tháng
- **~350 Invoices** - Cho orders hoàn thành

---

## 🎯 Test ngay:

### Start server:
```bash
npm run dev
```

### Login:
- Email: `admin@craftui.com`
- Password: `123456`

### Xem Dashboard:
- Biểu đồ doanh thu 3 tháng ✅
- Danh sách đơn hàng ✅
- Thống kê tổng quan ✅

---

## ⚠️ Cảnh báo:
**Script sẽ XÓA SẠCH database cũ!**
Chỉ dùng trong môi trường development/test.

---

## 📖 Đọc thêm:
- [MASTER_SEED_README.md](./MASTER_SEED_README.md) - Chi tiết đầy đủ
- Cấu hình số lượng data
- Troubleshooting

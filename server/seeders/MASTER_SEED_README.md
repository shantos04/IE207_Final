# 🌱 Master Seeding Script - Hướng dẫn sử dụng

## Mục đích
Script này tạo dữ liệu test đầy đủ cho hệ thống ERP trong **3 tháng gần nhất**, phù hợp để test biểu đồ báo cáo và analytics.

## Dữ liệu được tạo

### 📊 Tổng quan
- **1 Admin Account** - Để đăng nhập
- **50 Products** - Linh kiện điện tử đa dạng
- **50 Customers** - Khách hàng với tên tiếng Việt
- **500 Orders** - Đơn hàng phân bố trong 90 ngày
- **~350 Invoices** - Hóa đơn cho các đơn hàng hoàn thành
- **1 System Settings** - Cấu hình mặc định

### 📅 Chi tiết Orders (500 đơn)
**Phân phối trạng thái:**
- ✅ **70% Delivered** (~350 đơn) - Đã hoàn thành và có hóa đơn
- ❌ **10% Cancelled** (~50 đơn) - Đã hủy
- ⏳ **10% Pending** (~50 đơn) - Đang chờ xử lý
- 🚚 **5% Confirmed** (~25 đơn) - Đã xác nhận
- 📦 **5% Shipped** (~25 đơn) - Đang giao hàng

**Đặc điểm:**
- ⏰ Ngày tạo: Random trong **90 ngày gần nhất**
- 🕐 Giờ tạo: Peak hours (8h - 22h)
- 💰 Giá trị: 1-5 sản phẩm mỗi đơn
- 👤 Gắn với Customer và User ngẫu nhiên

### 💵 Doanh thu
- Chỉ tính từ orders **Delivered**
- Phân bố đều qua 3 tháng
- Phù hợp để test biểu đồ revenue theo tháng

---

## 🚀 Cách sử dụng

### Bước 1: Chạy script
```bash
cd server
npm run seed:master
```

### Bước 2: Đợi hoàn thành
Script sẽ chạy khoảng 30-60 giây và hiển thị tiến trình:
```
🚀 MASTER SEEDING STARTED...

🧹 Cleaning database...
✅ Database cleaned!

👤 Creating admin user...
✅ Admin created: admin@craftui.com / 123456

📦 Creating 50 products...
✅ Created 50 products!

👥 Creating 50 customers...
✅ Created 50 customers!

📋 Creating 500 orders for last 3 months...
   Created 100/500 orders...
   Created 200/500 orders...
   Created 300/500 orders...
   Created 400/500 orders...
✅ Created 500 orders!

💰 Creating invoices for 350 completed orders...
✅ Created 350 invoices!

⚙️  Creating system settings...
✅ System settings created!

📊 SEEDING SUMMARY:
==========================================
👤 Users:         1
📦 Products:      50
👥 Customers:     50
📋 Orders:        500
   - Delivered:   350
   - Cancelled:   50
   - Pending:     50
   - Others:      50
💰 Invoices:      350
⚙️  Settings:      1
==========================================
💵 Total Revenue: 1,234,567,890 VND
📅 Date Range: 08/10/2025 → 06/01/2026

✨ MASTER SEEDING COMPLETED!

🔑 Login với: admin@craftui.com / 123456
```

### Bước 3: Login và test
1. Start server: `npm run dev`
2. Start frontend: `cd .. && npm run dev`
3. Truy cập: `http://localhost:5173`
4. Login với:
   - **Email:** `admin@craftui.com`
   - **Password:** `123456`

---

## 📈 Test Cases

### 1. Dashboard
- Xem tổng doanh thu, số đơn hàng, khách hàng
- Biểu đồ doanh thu 3 tháng gần nhất
- Danh sách đơn hàng gần đây

### 2. Reports Page
- Revenue chart by month (3 tháng)
- Orders by status (Delivered, Cancelled, Pending...)
- Top products (sản phẩm bán chạy)
- Customer insights

### 3. Orders Page
- Filter theo ngày (sẽ thấy đơn từ 90 ngày trước)
- Filter theo status
- Xem chi tiết đơn hàng

### 4. Invoices Page
- ~350 invoices cho các đơn Delivered
- Filter và search

---

## ⚠️ Lưu ý quan trọng

### 🔴 Script sẽ XÓA SẠCH database cũ!
- Tất cả Users, Products, Orders, Invoices cũ sẽ BỊ XÓA
- Chỉ chạy trong môi trường **development/testing**
- **KHÔNG BAO GIỜ** chạy trong production

### 📊 Phù hợp cho:
- ✅ Test biểu đồ analytics
- ✅ Test filter theo date range
- ✅ Demo hệ thống cho khách hàng
- ✅ Development và debugging
- ✅ Load testing với 500 đơn hàng

### ❌ Không phù hợp cho:
- ❌ Production environment
- ❌ Database có dữ liệu thật cần giữ lại

---

## 🔧 Cấu hình

### Thay đổi số lượng dữ liệu
Mở file `server/seeders/master.seed.js` và sửa:

```javascript
// Dòng ~145: Số lượng Products
for (let i = 0; i < 50; i++) { // Đổi 50 thành số khác

// Dòng ~180: Số lượng Customers
for (let i = 0; i < 50; i++) { // Đổi 50 thành số khác

// Dòng ~215: Số lượng Orders
for (let i = 0; i < 500; i++) { // Đổi 500 thành số khác
```

### Thay đổi phân phối trạng thái
```javascript
// Dòng ~197
const orderStatuses = [
    { status: 'Delivered', weight: 70 },  // 70%
    { status: 'Cancelled', weight: 10 },  // 10%
    { status: 'Pending', weight: 10 },    // 10%
    // Tổng phải = 100%
];
```

### Thay đổi khoảng thời gian
```javascript
// Dòng ~14: Random date function
const daysAgo = Math.floor(Math.random() * 90); // Đổi 90 thành số ngày khác
```

---

## 🐛 Troubleshooting

### Error: Cannot connect to MongoDB
**Fix:** Kiểm tra `.env` file có `MONGODB_URI` đúng
```bash
MONGODB_URI=mongodb://localhost:27017/craftui-erp
```

### Error: Duplicate key error
**Fix:** Database chưa được xóa sạch, chạy lại script hoặc drop collection thủ công

### Script chạy quá chậm
**Normal:** Script tạo 500+ documents, có thể mất 30-60 giây

### Dữ liệu không đúng 3 tháng
**Check:** Xem log `Date Range` ở cuối. Nếu sai, chạy lại script.

---

## 📝 Logic chi tiết

### Random Date Distribution
```javascript
// Mỗi đơn hàng có ngày ngẫu nhiên trong 90 ngày
// Phân phối đều, không bias về ngày nào
const daysAgo = Math.floor(Math.random() * 90);
const date = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);

// Peak hours: 8h-22h (giờ cao điểm mua hàng)
const hour = 8 + Math.floor(Math.random() * 14);
```

### Order Status Logic
```javascript
// Weighted random: 70% Delivered, 10% Cancelled, 20% Others
const getRandomStatus = () => {
    const rand = Math.random() * 100;
    // Cumulative distribution
    if (rand <= 70) return 'Delivered';
    if (rand <= 80) return 'Cancelled';
    // ...
};
```

### Invoice Creation
```javascript
// Chỉ tạo invoice cho orders Delivered
if (status === 'Delivered') {
    completedOrders.push({ order, createdAt });
}

// issueDate = order.createdAt (ngày đơn hàng)
// dueDate = issueDate + 30 days
```

---

## 🎉 Kết quả mong đợi

Sau khi chạy xong, bạn sẽ có:
- ✅ Database sạch với dữ liệu mới
- ✅ 500 orders phân bố đều trong 3 tháng
- ✅ Revenue data phù hợp để vẽ biểu đồ
- ✅ Admin account để login
- ✅ Dữ liệu đa dạng để test các chức năng

**Bây giờ bạn có thể test dashboard và reports với dữ liệu thực tế!** 🚀

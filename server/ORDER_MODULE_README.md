# Order Management Module - Backend

## 📋 Tổng quan

Module quản lý đơn hàng (Order Management) cho hệ thống ERP, bao gồm đầy đủ các tính năng:

- ✅ Tạo đơn hàng mới
- ✅ Xem danh sách đơn hàng (có phân trang và filter)
- ✅ Xem chi tiết đơn hàng
- ✅ Cập nhật trạng thái đơn hàng
- ✅ Cập nhật trạng thái thanh toán
- ✅ Hủy đơn hàng (hoàn trả tồn kho)
- ✅ Tự động tạo mã đơn hàng (ORD-YYYYMM-XXXX)
- ✅ Tự động tính tổng tiền

## 📁 Cấu trúc File

```
server/
├── models/
│   └── Order.js          # Order Schema với các trường đầy đủ
├── controllers/
│   └── orderController.js # CRUD operations cho Order
├── routes/
│   └── orderRoutes.js    # API routes
└── seeders/
    └── orders.seed.js    # Script tạo 50 đơn hàng mẫu
```

## 🗄️ Order Schema

### Các trường chính:

```javascript
{
  orderCode: String,              // Tự động: ORD-202412-0001
  user: ObjectId (ref User),      // Người tạo đơn (required)
  customer: {                     // Thông tin khách hàng
    name: String,
    email: String,
    phone: String
  },
  orderItems: [{                  // Danh sách sản phẩm
    product: ObjectId (ref Product),
    productName: String,
    productCode: String,
    quantity: Number,
    price: Number,
    subtotal: Number             // Tự động tính
  }],
  shippingAddress: {              // Địa chỉ giao hàng
    address: String,
    city: String,
    phone: String
  },
  paymentMethod: String,          // Default: 'COD'
  totalAmount: Number,            // Tự động tính
  totalPrice: Number,             // Tự động tính (đồng bộ với totalAmount)
  status: String,                 // Enum: Draft, Pending, Confirmed, Shipped, Delivered, Cancelled
  paymentStatus: String,          // Enum: unpaid, paid, refunded
  notes: String,
  createdBy: ObjectId (ref User),
  timestamps: true                // createdAt, updatedAt
}
```

### Status Flow (Luồng trạng thái):

```
Draft → Pending → Confirmed → Shipped → Delivered
                     ↓
                 Cancelled
```

## 🚀 API Endpoints

### 1. GET /api/orders

Lấy danh sách đơn hàng (có phân trang và filter)

**Query Parameters:**
- `page` (default: 1)
- `limit` (default: 10)
- `status` (optional): Draft, Pending, Confirmed, Shipped, Delivered, Cancelled
- `paymentStatus` (optional): unpaid, paid, refunded

**Response:**
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "total": 50,
    "page": 1,
    "pages": 5
  }
}
```

### 2. GET /api/orders/:id

Lấy chi tiết một đơn hàng

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "...",
    "orderCode": "ORD-202412-0001",
    "customer": {...},
    "orderItems": [...],
    "totalPrice": 1500000,
    "status": "Confirmed"
  }
}
```

### 3. POST /api/orders

Tạo đơn hàng mới

**Request Body:**
```json
{
  "user": "673c3e1234567890abcdef12",
  "customer": {
    "name": "Nguyễn Văn A",
    "email": "customer@example.com",
    "phone": "0901234567"
  },
  "orderItems": [
    {
      "product": "673c3e1234567890abcdef12",
      "quantity": 2
    }
  ],
  "shippingAddress": {
    "address": "123 Đường ABC",
    "city": "TP. HCM",
    "phone": "0901234567"
  },
  "paymentMethod": "COD",
  "notes": "Giao hàng buổi sáng"
}
```

**Chú ý:**
- Controller sẽ tự động lấy thông tin sản phẩm (name, code, price)
- Tự động kiểm tra tồn kho
- Tự động trừ tồn kho khi tạo đơn
- Tự động tính subtotal và totalAmount

### 4. PUT /api/orders/:id/status

Cập nhật trạng thái đơn hàng

**Request Body:**
```json
{
  "status": "Shipped"
}
```

### 5. PUT /api/orders/:id/payment

Cập nhật trạng thái thanh toán

**Request Body:**
```json
{
  "paymentStatus": "paid"
}
```

### 6. PUT /api/orders/:id/cancel

Hủy đơn hàng

**Chức năng:**
- Đổi status sang "Cancelled"
- Tự động hoàn trả tồn kho sản phẩm
- Không thể hủy đơn đã giao (status = "Delivered")

## 🧪 Testing

### 1. Sử dụng test-order-api.html

Mở file `test-order-api.html` trong trình duyệt để test API trực quan:

```bash
# Mở file trong browser
start test-order-api.html
```

### 2. Seed dữ liệu mẫu

Tạo 50 đơn hàng mẫu:

```bash
cd server
node seeders/orders.seed.js
```

Output sẽ hiển thị:
- Số lượng đơn hàng đã tạo
- Thống kê theo status
- Tổng doanh thu (đơn hàng đã thanh toán)

### 3. Test bằng curl/Postman

#### Lấy danh sách đơn hàng:
```bash
curl http://localhost:5000/api/orders?limit=5&status=Confirmed
```

#### Tạo đơn hàng mới:
```bash
curl -X POST http://localhost:5000/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "user": "673c3e1234567890abcdef12",
    "customer": {
      "name": "Test Customer",
      "email": "test@example.com",
      "phone": "0901234567"
    },
    "orderItems": [{
      "product": "673c3e1234567890abcdef12",
      "quantity": 1
    }],
    "shippingAddress": {
      "address": "123 Test St",
      "city": "HCM",
      "phone": "0901234567"
    },
    "paymentMethod": "COD"
  }'
```

## ⚙️ Configuration

### Authentication

Routes hiện đang **KHÔNG YÊU CẦU** authentication để dễ dàng test.

Để bật authentication trong production:

1. Mở `server/routes/orderRoutes.js`
2. Bỏ comment dòng:
```javascript
// router.use(protect);
```
3. Bỏ comment authorize middleware:
```javascript
router.put('/:id/status', authorize('admin', 'manager'), updateOrderStatus);
```

### CORS

CORS đã được cấu hình trong `server/index.js` để chấp nhận requests từ:
- `http://localhost:3000` (Frontend dev server)
- `http://localhost:5173` (Vite dev server)

## 🔧 Các tính năng đặc biệt

### 1. Auto-generate Order Code

Order code được tự động tạo theo format: `ORD-YYYYMM-XXXX`

Ví dụ: `ORD-202412-0001`, `ORD-202412-0002`...

### 2. Auto-calculate Totals

- `subtotal` của mỗi item = `price × quantity`
- `totalAmount` = tổng tất cả subtotal
- `totalPrice` = đồng bộ với totalAmount

### 3. Stock Management

- Tạo đơn: Tự động trừ tồn kho
- Hủy đơn: Tự động hoàn trả tồn kho
- Kiểm tra tồn kho trước khi tạo đơn

### 4. Population

Các trường được populate tự động:
- `orderItems.product` → Product details
- `user` → User details
- `createdBy` → User details

## 📊 Database Indexes

Đã tạo index cho:
- `orderCode` (unique)
- `status + createdAt` (composite)
- `customer.email`

→ Tăng tốc độ query

## 🐛 Troubleshooting

### Lỗi "User là bắt buộc"

Nếu không dùng authentication, đảm bảo gửi `user` trong request body:

```json
{
  "user": "673c3e1234567890abcdef12",
  ...
}
```

### Lỗi "Không đủ hàng"

Kiểm tra tồn kho sản phẩm:
```bash
curl http://localhost:5000/api/products/:id
```

### Lỗi CORS

Đảm bảo backend đang chạy và CORS đã được cấu hình đúng trong `server/index.js`

## 📝 Notes

- Trường `user` là bắt buộc trong model nhưng controller hỗ trợ cả authenticated và unauthenticated requests
- Status enum sử dụng **PascalCase** (Draft, Pending, ...) để dễ đọc
- Payment status enum sử dụng **lowercase** (unpaid, paid, refunded) theo convention
- Đơn hàng có status "Delivered" không thể bị hủy

## 🎯 Next Steps

1. ✅ Tích hợp với Frontend (React components)
2. ✅ Thêm chức năng export đơn hàng (PDF/Excel)
3. ✅ Thêm notification khi status thay đổi
4. ✅ Thêm order history tracking
5. ✅ Thêm invoice generation

---

**Developed by:** IE207 Team  
**Last Updated:** December 2024

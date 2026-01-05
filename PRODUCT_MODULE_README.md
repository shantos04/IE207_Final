# Module Quản lý Sản phẩm (Product Management)

## ✨ Tính năng đã hoàn thiện

### 1. **Trang Danh sách Sản phẩm** (`ProductsPage.tsx`)
Hiển thị danh sách tất cả sản phẩm với các tính năng:

#### Bảng dữ liệu (Table):
- ✅ **Ảnh sản phẩm**: Hiển thị thumbnail, nếu không có ảnh sẽ hiển thị icon mặc định
- ✅ **Tên linh kiện**: Tên sản phẩm + mô tả ngắn (nếu có)
- ✅ **SKU (productCode)**: Mã sản phẩm duy nhất, hiển thị dạng monospace
- ✅ **Danh mục**: Hiển thị bằng tiếng Việt (Vi điều khiển, Cảm biến, v.v.)
- ✅ **Giá bán**: Format theo định dạng VNĐ
- ✅ **Tồn kho**: Hiển thị số lượng + đơn vị "cái"
- ✅ **Trạng thái**: Badge với màu sắc phù hợp
  - 🟢 Còn hàng (stock >= 10)
  - 🟡 **Sắp hết hàng** (stock < 10 và > 0)
  - 🔴 Hết hàng (stock = 0)

#### Logic Cảnh báo Tồn kho:
- ⚠️ Tự động hiển thị badge màu vàng "Sắp hết hàng" khi `stock < 10`
- Logic được xử lý ở cả backend (Product Model middleware) và frontend

#### Bộ lọc (Filters):
- 🔍 **Tìm kiếm**: Theo tên hoặc mã sản phẩm (search)
- 📦 **Danh mục**: Dropdown filter theo category
- ⚡ **Trạng thái**: Dropdown filter theo stock status
- 📊 **Số lượng hiển thị**: 10, 25, 50, 100 items/page

#### Phân trang (Pagination):
- ✅ Hỗ trợ phân trang với navigation buttons
- ✅ Hiển thị thông tin: "Hiển thị X đến Y trong tổng số Z sản phẩm"
- ✅ Responsive design cho mobile và desktop

#### Thao tác:
- ✏️ **Sửa**: Mở form chỉnh sửa sản phẩm
- 🗑️ **Xóa**: Confirm dialog trước khi xóa

---

### 2. **Form Thêm/Sửa Sản phẩm** (`ProductForm.tsx`)

#### Layout Grid 2 cột (Responsive):
Form được chia thành 2 cột trên desktop, collapse thành 1 cột trên mobile sử dụng Tailwind CSS Grid.

#### **Cột trái - Thông tin cơ bản:**
1. **Mã sản phẩm (SKU)** * - Required
   - Auto uppercase transform
   - Disabled khi edit (không cho sửa)
   - Unique validation ở backend
   
2. **Tên sản phẩm** * - Required
   - Tối đa 255 ký tự
   
3. **Danh mục** * - Required (Select dropdown)
   - Vi điều khiển
   - Cảm biến
   - Động cơ
   - Module truyền thông
   - Linh kiện điện tử
   - Khác
   
4. **Giá bán (VNĐ)** * - Required
   - Number input với step 1000
   - Min = 0 (không cho số âm)
   
5. **Số lượng tồn kho** * - Required
   - Integer input
   - Min = 0
   - Hiển thị thông báo: "Cảnh báo tồn kho thấp khi < 10 sản phẩm"
   
6. **Nhà cung cấp** - Optional
   - Text input

#### **Cột phải - Thông tin bổ sung:**
1. **Mô tả sản phẩm** - Optional
   - Textarea 4 rows
   
2. **Upload Ảnh sản phẩm** - Optional
   - 📤 **Drag & Drop** hoặc click để upload
   - ✅ Validate: Chỉ chấp nhận file ảnh (image/*)
   - ✅ Validate: Kích thước max 2MB
   - 🔄 **Convert sang Base64**: Ảnh được convert ngay trên client
   - 👁️ Preview ảnh trước khi submit
   - ❌ Nút xóa ảnh để chọn lại
   
3. **Trạng thái hoạt động** - Checkbox
   - Default = true
   - Cho phép disable sản phẩm

#### **Section Technical Specifications (Full width):**
- 🔧 **Dynamic key-value inputs** để nhập thông số kỹ thuật
- ➕ Button "Thêm thông số" để add thêm row
- 🗑️ Button xóa từng row (giữ tối thiểu 1 row)
- Grid 2 cột: Key | Value
- **Ví dụ thông số kỹ thuật:**
  - Voltage: 5V
  - Current: 50mA
  - Power: 10W
  - PinCount: 40 pins
  - Temperature: -40 to 80°C
  - Accuracy: ±0.5°C

#### Validation:
- ✅ Required fields validation
- ✅ Number validation (price, stock >= 0)
- ✅ File type và size validation cho ảnh
- ✅ Unique productCode validation ở backend

#### Submit:
- 💾 Gửi dữ liệu dạng JSON với specifications là object
- 🔄 Loading state với spinner
- ✅ Success message sau khi lưu
- ❌ Error handling với thông báo lỗi

---

## 📁 Cấu trúc File

```
src/
├── pages/
│   └── ProductsPage.tsx          # Page chính, quản lý state và routing
├── components/
│   └── products/
│       ├── ProductList.tsx       # Component danh sách + filters
│       └── ProductForm.tsx       # Component form thêm/sửa
├── services/
│   └── productService.ts         # API service layer
└── types/
    └── index.ts                  # TypeScript interfaces (đã update)

server/
├── models/
│   └── Product.js                # Mongoose schema với middleware
├── controllers/
│   └── productController.js     # CRUD operations
├── routes/
│   └── productRoutes.js         # API routes
└── scripts/
    └── seed.js                  # Sample data (đã update)
```

---

## 🚀 Hướng dẫn sử dụng

### 1. Seed dữ liệu mẫu (Backend):

```bash
cd server
npm run seed
```

Sample data bao gồm 8 sản phẩm với:
- Đầy đủ thông tin (name, description, category, price, stock)
- Technical specifications hoàn chỉnh
- Sample images (URLs từ Unsplash)
- Đa dạng trạng thái tồn kho để test logic cảnh báo

### 2. Chạy Backend:

```bash
cd server
npm run dev
```

API sẽ chạy ở `http://localhost:5000`

### 3. Chạy Frontend:

```bash
npm run dev
```

Frontend sẽ chạy ở `http://localhost:5173`

### 4. Truy cập module:

1. Đăng nhập với tài khoản:
   - Admin: `admin@craftui.com` / `admin123`
   
2. Click menu **"Sản phẩm"** trên sidebar

3. Xem danh sách, lọc, tìm kiếm, thêm/sửa/xóa sản phẩm

---

## 🎨 Thiết kế UI/UX

### Màu sắc:
- **Primary**: Blue-600 (#2563eb) - Buttons, active states
- **Success**: Green - Badge "Còn hàng"
- **Warning**: Yellow - Badge "Sắp hết hàng"
- **Danger**: Red - Badge "Hết hàng", Delete button

### Typography:
- **Headers**: 2xl, 3xl font-bold
- **Labels**: sm font-medium
- **Body**: base text
- **SKU**: font-mono

### Spacing:
- Consistent padding: 4, 6 (1rem, 1.5rem)
- Grid gaps: 4, 6
- Section spacing: 6

### Responsive:
- Mobile: 1 column layout
- Tablet+: 2 column grid (md:grid-cols-2)
- Desktop: Full table display

---

## 🔌 API Endpoints

### GET `/api/products`
Query params:
- `page`: số trang (default: 1)
- `limit`: số items/page (default: 10)
- `category`: filter theo danh mục
- `status`: filter theo trạng thái
- `search`: tìm kiếm theo tên hoặc SKU

### GET `/api/products/:id`
Lấy chi tiết một sản phẩm

### POST `/api/products`
Tạo sản phẩm mới (Admin/Manager)

Body:
```json
{
  "productCode": "ESP32-001",
  "name": "ESP32 DevKit",
  "description": "...",
  "category": "module-truyen-thong",
  "price": 150000,
  "stock": 50,
  "supplier": "Espressif",
  "specifications": {
    "Voltage": "3.3V",
    "WiFi": "802.11 b/g/n"
  },
  "imageUrl": "data:image/png;base64,...",
  "isActive": true
}
```

### PUT `/api/products/:id`
Cập nhật sản phẩm (Admin/Manager)

### DELETE `/api/products/:id`
Xóa sản phẩm (Admin only)

---

## ✅ Checklist hoàn thành

- [x] Tạo Product Model với đầy đủ fields
- [x] Middleware tự động cập nhật status theo stock
- [x] API CRUD với phân trang và filters
- [x] Service layer cho API calls
- [x] ProductList component với table, filters, pagination
- [x] ProductForm component với grid 2 cột
- [x] Technical Specs dynamic input
- [x] Upload và convert ảnh sang Base64
- [x] Logic cảnh báo tồn kho (Low Stock Badge)
- [x] Validation đầy đủ (client + server)
- [x] Responsive design với Tailwind CSS
- [x] Hiển thị 100% bằng tiếng Việt
- [x] Routing integration
- [x] Sample data với specifications
- [x] Error handling và loading states
- [x] Accessibility (labels, aria-labels)

---

## 🌟 Highlights

1. ⚡ **Performance**: Sử dụng pagination để tránh load quá nhiều data
2. 🎯 **UX**: Inline editing/adding với form modal-like experience
3. 🖼️ **Image**: Base64 conversion để dễ dàng lưu trữ trong MongoDB
4. 🔍 **Search**: Real-time search với debounce
5. 📱 **Mobile-first**: Responsive trên mọi thiết bị
6. ♿ **Accessible**: Đầy đủ labels, aria-labels cho screen readers
7. 🌐 **i18n ready**: Tất cả text đã dịch sang tiếng Việt

---

## 🐛 Known Issues / Future Improvements

- [ ] Thêm bulk actions (xóa nhiều sản phẩm cùng lúc)
- [ ] Export data ra Excel/CSV
- [ ] Advanced filters (price range, stock range)
- [ ] Image upload to cloud (Cloudinary/S3) thay vì Base64
- [ ] Barcode/QR code generation cho SKU
- [ ] Product variants (size, color)
- [ ] Stock history tracking
- [ ] Low stock email notifications

---

Được phát triển với ❤️ sử dụng React + TypeScript + Tailwind CSS + Node.js + MongoDB

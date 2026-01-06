# Dashboard API Documentation

## Tổng quan
Dashboard API cung cấp số liệu thống kê và dữ liệu biểu đồ cho trang chủ Admin.

---

## 📡 Endpoints

### 1. **GET /api/dashboard/stats**
Lấy thống kê tổng quan cho dashboard

#### Authentication
- **Required:** Yes (Bearer Token)

#### Response
```json
{
  "success": true,
  "data": {
    "counts": {
      "revenue": 123456789,      // Tổng doanh thu (Delivered orders)
      "orders": 500,              // Tổng số đơn hàng
      "products": 50,             // Tổng số sản phẩm
      "customers": 50             // Tổng số khách hàng
    },
    "growth": {
      "revenue": 15.5,            // % tăng trưởng doanh thu so với tháng trước
      "orders": 12.3,             // % tăng trưởng đơn hàng
      "customers": 8.7            // % tăng trưởng khách hàng
    }
  }
}
```

#### Logic:
- **Revenue:** Tổng `totalAmount` của tất cả đơn hàng có `status = 'Delivered'`
- **Growth:** So sánh tháng hiện tại với tháng trước
  - Growth > 0: Tăng trưởng
  - Growth < 0: Giảm
  - Growth = 0: Không đổi

#### Example:
```bash
curl -X GET http://localhost:5000/api/dashboard/stats \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

### 2. **GET /api/dashboard/charts**
Lấy dữ liệu cho các biểu đồ

#### Authentication
- **Required:** Yes (Bearer Token)

#### Response
```json
{
  "success": true,
  "data": {
    "revenueChart": [
      {
        "date": "07/12",          // DD/MM
        "value": 2000000          // Doanh thu ngày đó
      },
      {
        "date": "08/12",
        "value": 3500000
      }
      // ... 30 days
    ],
    "statusChart": [
      {
        "status": "Delivered",
        "count": 350
      },
      {
        "status": "Cancelled",
        "count": 50
      },
      {
        "status": "Pending",
        "count": 50
      }
      // ...
    ],
    "topProducts": [
      {
        "name": "Arduino Uno R3",
        "quantity": 125,
        "revenue": 6250000
      }
      // ... top 10
    ],
    "recentOrders": [
      {
        "_id": "...",
        "orderCode": "ORD000500",
        "customer": {
          "name": "Nguyễn Văn A",
          "email": "customer@example.com",
          "phone": "0901234567"
        },
        "totalAmount": 500000,
        "status": "Delivered",
        "createdAt": "2026-01-06T10:30:00.000Z"
      }
      // ... 10 recent orders
    ]
  }
}
```

#### Details:

**revenueChart:**
- Doanh thu theo ngày trong **30 ngày gần nhất**
- Chỉ tính orders có `status = 'Delivered'`
- Format date: DD/MM
- Nếu ngày nào không có đơn → value = 0

**statusChart:**
- Đếm số lượng đơn theo từng status
- Dùng để vẽ biểu đồ tròn (Pie/Donut chart)

**topProducts:**
- Top 10 sản phẩm bán chạy nhất
- Sắp xếp theo `quantity` (số lượng bán)
- Chỉ tính từ orders Delivered

**recentOrders:**
- 10 đơn hàng gần nhất
- Sắp xếp theo `createdAt` DESC

#### Example:
```bash
curl -X GET http://localhost:5000/api/dashboard/charts \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

### 3. **GET /api/dashboard/revenue-by-month**
Lấy doanh thu theo tháng (dùng cho báo cáo)

#### Authentication
- **Required:** Yes (Bearer Token)

#### Query Parameters
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| months | number | 6 | Số tháng cần lấy |

#### Response
```json
{
  "success": true,
  "data": [
    {
      "month": "10/2025",
      "revenue": 45000000,
      "orders": 120
    },
    {
      "month": "11/2025",
      "revenue": 52000000,
      "orders": 135
    },
    {
      "month": "12/2025",
      "revenue": 48000000,
      "orders": 128
    }
  ]
}
```

#### Example:
```bash
# Lấy 6 tháng gần nhất (default)
curl -X GET http://localhost:5000/api/dashboard/revenue-by-month \
  -H "Authorization: Bearer YOUR_TOKEN"

# Lấy 12 tháng gần nhất
curl -X GET http://localhost:5000/api/dashboard/revenue-by-month?months=12 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 🎨 Frontend Integration

### React/TypeScript Service

```typescript
// src/services/dashboardService.ts
import api from './api';

export interface DashboardStats {
  counts: {
    revenue: number;
    orders: number;
    products: number;
    customers: number;
  };
  growth: {
    revenue: number;
    orders: number;
    customers: number;
  };
}

export interface RevenueChartData {
  date: string;
  value: number;
}

export interface StatusChartData {
  status: string;
  count: number;
}

export interface TopProduct {
  name: string;
  quantity: number;
  revenue: number;
}

export interface DashboardCharts {
  revenueChart: RevenueChartData[];
  statusChart: StatusChartData[];
  topProducts: TopProduct[];
  recentOrders: any[];
}

export const getDashboardStats = async (): Promise<DashboardStats> => {
  const { data } = await api.get('/dashboard/stats');
  return data.data;
};

export const getDashboardCharts = async (): Promise<DashboardCharts> => {
  const { data } = await api.get('/dashboard/charts');
  return data.data;
};

export const getRevenueByMonth = async (months: number = 6) => {
  const { data } = await api.get(`/dashboard/revenue-by-month?months=${months}`);
  return data.data;
};
```

### Usage in Dashboard Component

```tsx
// src/pages/DashboardHome.tsx
import { useEffect, useState } from 'react';
import { getDashboardStats, getDashboardCharts } from '../services/dashboardService';

export default function DashboardHome() {
  const [stats, setStats] = useState(null);
  const [charts, setCharts] = useState(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [statsData, chartsData] = await Promise.all([
        getDashboardStats(),
        getDashboardCharts(),
      ]);
      setStats(statsData);
      setCharts(chartsData);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    }
  };

  return (
    <div>
      {/* Hiển thị stats.counts */}
      {/* Hiển thị stats.growth */}
      {/* Vẽ biểu đồ từ charts.revenueChart */}
      {/* Vẽ biểu đồ từ charts.statusChart */}
    </div>
  );
}
```

---

## 📊 Data Flow

```
Client                Controller               Database
  │                       │                       │
  │ GET /stats            │                       │
  ├──────────────────────►│                       │
  │                       │ Count Orders          │
  │                       ├──────────────────────►│
  │                       │ Count Products        │
  │                       ├──────────────────────►│
  │                       │ Count Customers       │
  │                       ├──────────────────────►│
  │                       │ Aggregate Revenue     │
  │                       ├──────────────────────►│
  │                       │ Calculate Growth      │
  │                       │                       │
  │ ◄──────────────────── │ Return Stats          │
  │                       │                       │
  │ GET /charts           │                       │
  ├──────────────────────►│                       │
  │                       │ Aggregate by Date     │
  │                       ├──────────────────────►│
  │                       │ Group by Status       │
  │                       ├──────────────────────►│
  │                       │ Top Products          │
  │                       ├──────────────────────►│
  │                       │ Recent Orders         │
  │                       ├──────────────────────►│
  │                       │                       │
  │ ◄──────────────────── │ Return Charts Data    │
```

---

## 🧪 Testing

### Test với cURL

```bash
# 1. Login to get token
TOKEN=$(curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@craftui.com","password":"123456"}' | jq -r '.token')

# 2. Test stats endpoint
curl -X GET http://localhost:5000/api/dashboard/stats \
  -H "Authorization: Bearer $TOKEN" | jq

# 3. Test charts endpoint
curl -X GET http://localhost:5000/api/dashboard/charts \
  -H "Authorization: Bearer $TOKEN" | jq

# 4. Test revenue by month
curl -X GET http://localhost:5000/api/dashboard/revenue-by-month?months=3 \
  -H "Authorization: Bearer $TOKEN" | jq
```

### Test với Postman

1. **Login:**
   - Method: POST
   - URL: `http://localhost:5000/api/auth/login`
   - Body: `{"email":"admin@craftui.com","password":"123456"}`
   - Copy token từ response

2. **Get Stats:**
   - Method: GET
   - URL: `http://localhost:5000/api/dashboard/stats`
   - Headers: `Authorization: Bearer YOUR_TOKEN`

3. **Get Charts:**
   - Method: GET
   - URL: `http://localhost:5000/api/dashboard/charts`
   - Headers: `Authorization: Bearer YOUR_TOKEN`

---

## 🔧 Customization

### Thay đổi số ngày trong revenue chart

Edit `dashboardController.js`, line ~169:

```javascript
// Thay 30 thành số ngày mong muốn
const thirtyDaysAgo = new Date();
thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30); // Change 30 here
```

### Thay đổi số top products

Edit `dashboardController.js`, line ~221:

```javascript
{
    $limit: 10, // Change to desired number
}
```

### Thay đổi số recent orders

Edit `dashboardController.js`, line ~238:

```javascript
const recentOrders = await Order.find()
    .sort({ createdAt: -1 })
    .limit(10) // Change to desired number
```

---

## ⚡ Performance

- **Indexing:** Đảm bảo có index trên `createdAt`, `status` trong Order model
- **Caching:** Có thể cache kết quả stats trong 5-10 phút
- **Pagination:** Recent orders đã limit 10, không cần pagination

---

## 🐛 Error Handling

Tất cả endpoints đều có error handling:

```json
{
  "success": false,
  "message": "Lỗi khi lấy thống kê dashboard",
  "error": "Error details..."
}
```

Status codes:
- **200:** Success
- **401:** Unauthorized (missing/invalid token)
- **500:** Server error

---

## ✅ Checklist

Sau khi implement, test các trường hợp:

- [ ] Stats API trả về đúng tổng revenue
- [ ] Growth calculation đúng (so với tháng trước)
- [ ] Revenue chart có đủ 30 ngày
- [ ] Status chart đếm đúng từng status
- [ ] Top products được sắp xếp đúng
- [ ] Recent orders hiển thị mới nhất
- [ ] Authentication hoạt động
- [ ] Error handling đúng

---

## 📝 Notes

- Revenue chỉ tính từ orders có `status = 'Delivered'`
- Growth có thể âm (giảm) hoặc dương (tăng)
- Date format trong chart: DD/MM (không có năm)
- Tất cả số tiền đều là VND
- Timestamps sử dụng UTC

**Status:** ✅ Ready to use!

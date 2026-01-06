# 📊 Dashboard Integration - Real Data Sync

## 📌 Tổng quan

Dashboard đã được refactor để sử dụng **dữ liệu thật** từ Backend API thay vì mock data. Trang Dashboard giờ hiển thị thống kê real-time từ database.

---

## ✅ Những gì đã thay đổi

### 1. **Service Layer mới: `dashboardService.ts`**

File: [`src/services/dashboardService.ts`](../src/services/dashboardService.ts)

**3 API Endpoints:**

```typescript
// 1. Lấy thống kê tổng quan
getDashboardStats() → {
  counts: { revenue, orders, products, customers },
  growth: { revenue, orders, customers }
}

// 2. Lấy dữ liệu biểu đồ
getDashboardCharts() → {
  revenueChart: [{ date, revenue }], // 30 ngày gần nhất
  statusChart: [{ status, count, revenue }],
  topProducts: [...],
  recentOrders: [...] // 10 đơn gần nhất
}

// 3. Lấy doanh thu theo tháng
getRevenueByMonth(months) → [{ month, year, revenue, orderCount }]
```

---

### 2. **DashboardHome.tsx - Refactored**

File: [`src/pages/DashboardHome.tsx`](../src/pages/DashboardHome.tsx)

#### **State Management mới:**

```typescript
const [stats, setStats] = useState<DashboardStats | null>(null);
const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
const [recentOrders, setRecentOrders] = useState<Order[]>([]);
const [isLoading, setIsLoading] = useState(true);      // ✨ Mới
const [error, setError] = useState<string | null>(null); // ✨ Mới
```

#### **Fetching Data:**

```typescript
useEffect(() => {
  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      
      // Gọi 2 API song song
      const [statsResponse, chartsResponse] = await Promise.all([
        getDashboardStats(),
        getDashboardCharts(),
      ]);

      // Xử lý response...
    } catch (err) {
      setError('Không thể tải dữ liệu dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  fetchDashboardData();
}, []);
```

#### **Loading State:**

- Hiển thị **Skeleton UI** khi đang fetch data
- 4 skeleton cards cho stats
- 1 skeleton chart
- 1 skeleton table

#### **Error Handling:**

- Hiển thị message lỗi nếu API fail
- Button "Tải lại" để refresh page

---

### 3. **StatCard.tsx - Growth Color Coding**

File: [`src/components/dashboard/StatCard.tsx`](../src/components/dashboard/StatCard.tsx)

**Enhancement:**

```typescript
const isPositive = change > 0;

// Màu sắc động:
- change > 0: Xanh lá (text-green-500) + TrendingUp icon
- change < 0: Đỏ (text-red-500) + TrendingDown icon
```

**4 Stats Cards:**

1. **Doanh thu** (DollarSign, xanh lá)
2. **Đơn hàng mới** (ShoppingBag, xanh dương)
3. **Khách hàng** (Users, tím)
4. **Sản phẩm** (Package, cam)

---

### 4. **RevenueChart.tsx - 30 Days Chart**

File: [`src/components/dashboard/RevenueChart.tsx`](../src/components/dashboard/RevenueChart.tsx)

**Changes:**

- Đổi từ "Doanh thu theo tháng" → **"Doanh thu 30 ngày"**
- X-axis: `date` thay vì `month`
- Formatter: `formatDate()` → "25/1", "26/1"...
- Data binding: `revenueChart` từ API

---

### 5. **RecentOrdersTable.tsx - Handle Empty Data**

File: [`src/components/dashboard/RecentOrdersTable.tsx`](../src/components/dashboard/RecentOrdersTable.tsx)

**Improvements:**

```typescript
// 1. Status config lowercase
const statusConfig: Record<string, { label: string; color: string }> = {
  draft: { label: 'Nháp', ... },
  pending: { label: 'Chờ xử lý', ... },
  processing: { label: 'Đang xử lý', ... },
  // ...
};

// 2. Safe status rendering
statusConfig[order.status.toLowerCase()]?.label || order.status

// 3. Handle empty items array
{order.items.length > 0 ? (
  <>
    {order.items[0].productName}
    {order.items.length > 1 && <span> +{order.items.length - 1} khác</span>}
  </>
) : (
  <span className="text-gray-400">Không có sản phẩm</span>
)}
```

---

## 🎨 UI/UX Enhancements

### **1. Loading State (Skeleton UI)**

```tsx
<div className="bg-white rounded-lg shadow p-6 animate-pulse">
  <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
  <div className="h-8 bg-gray-200 rounded w-3/4 mb-2"></div>
  <div className="h-3 bg-gray-200 rounded w-1/3"></div>
</div>
```

### **2. Error State**

```tsx
<div className="text-center">
  <div className="text-red-500 text-lg font-semibold mb-2">⚠️ Lỗi</div>
  <div className="text-gray-600">{error}</div>
  <button onClick={() => window.location.reload()}>
    Tải lại
  </button>
</div>
```

### **3. Growth Indicators**

- **Positive:** 🟢 +12.5% (text-green-500)
- **Negative:** 🔴 -5.2% (text-red-500)

---

## 📊 Data Flow

```
┌─────────────────┐
│ DashboardHome   │
│   useEffect()   │
└────────┬────────┘
         │
         ├──────────────┐
         │              │
         ▼              ▼
┌──────────────┐ ┌─────────────────┐
│getDashboard  │ │getDashboard     │
│Stats()       │ │Charts()         │
└──────┬───────┘ └────────┬────────┘
       │                  │
       ▼                  ▼
┌─────────────────────────────────┐
│ Backend: dashboardController.js │
│ - MongoDB Aggregation           │
│ - Growth calculation            │
│ - Date filtering                │
└────────┬────────────────────────┘
         │
         ▼
┌─────────────────┐
│ MongoDB         │
│ - Orders        │
│ - Products      │
│ - Customers     │
└─────────────────┘
```

---

## 🧪 Testing

### **1. Test Dashboard với dữ liệu thật:**

```bash
# 1. Seed data (nếu chưa có)
cd server
npm run seed:master

# 2. Start backend
npm run dev

# 3. Start frontend (terminal mới)
cd ..
npm run dev
```

### **2. Test Cases:**

✅ **Happy Path:**
- Dashboard load thành công
- Hiển thị 4 stat cards với growth
- Chart 30 ngày có data
- Table 10 đơn hàng gần nhất

✅ **Loading State:**
- Refresh page → Thấy skeleton UI
- Loading indicator biến mất sau khi data load

✅ **Error Handling:**
- Tắt backend → Hiển thị error message
- Click "Tải lại" → Reload page

✅ **Growth Colors:**
- Growth > 0 → Màu xanh + icon up
- Growth < 0 → Màu đỏ + icon down

---

## 📦 Dependencies

**No new packages needed!** Sử dụng:
- `recharts` (đã có)
- `lucide-react` (đã có)
- `clsx` (đã có)

---

## 🔧 Configuration

### **API Base URL:**

File: [`src/services/api.ts`](../src/services/api.ts)

```typescript
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
```

### **Environment Variables:**

```env
VITE_API_URL=http://localhost:5000/api
```

---

## 📸 Screenshots

### **Before (Mock Data):**
- Số liệu cố định
- Không có loading state
- Chart dữ liệu giả theo tháng

### **After (Real Data):**
- ✅ Số liệu thật từ DB
- ✅ Skeleton loading
- ✅ Chart 30 ngày thật
- ✅ Growth colors
- ✅ Error handling
- ✅ 10 đơn hàng mới nhất

---

## 🚀 Next Steps (Optional)

### **1. Real-time Updates:**

```typescript
// Polling mỗi 30s
useEffect(() => {
  const interval = setInterval(() => {
    fetchDashboardData();
  }, 30000);
  
  return () => clearInterval(interval);
}, []);
```

### **2. Date Range Filter:**

```typescript
const [dateRange, setDateRange] = useState('30d');

// Gọi API với range
getDashboardCharts({ range: dateRange });
```

### **3. Export Reports:**

```typescript
const exportToPDF = () => {
  // Export dashboard to PDF
};
```

---

## 📚 Related Files

### **Frontend:**
- [`src/services/dashboardService.ts`](../src/services/dashboardService.ts) - API calls
- [`src/pages/DashboardHome.tsx`](../src/pages/DashboardHome.tsx) - Main page
- [`src/components/dashboard/StatCard.tsx`](../src/components/dashboard/StatCard.tsx) - Stats cards
- [`src/components/dashboard/RevenueChart.tsx`](../src/components/dashboard/RevenueChart.tsx) - 30-day chart
- [`src/components/dashboard/RecentOrdersTable.tsx`](../src/components/dashboard/RecentOrdersTable.tsx) - Orders table
- [`src/types/index.ts`](../src/types/index.ts) - TypeScript interfaces

### **Backend:**
- [`server/controllers/dashboardController.js`](../server/controllers/dashboardController.js) - API logic
- [`server/routes/dashboardRoutes.js`](../server/routes/dashboardRoutes.js) - Routes
- [`server/DASHBOARD_API_README.md`](../server/DASHBOARD_API_README.md) - API docs

---

## ✅ Checklist

- [x] Tạo `dashboardService.ts` với 3 API methods
- [x] Refactor `DashboardHome.tsx` để fetch real data
- [x] Thêm loading state với Skeleton UI
- [x] Thêm error handling
- [x] Update `RevenueChart.tsx` cho 30-day chart
- [x] Update `RecentOrdersTable.tsx` handle empty data
- [x] Color code growth rates (green/red)
- [x] Update TypeScript interfaces
- [x] Test với dữ liệu thật
- [x] Write documentation

---

## 🎉 Kết luận

Dashboard đã được **fully integrated** với Backend API! 

**Highlights:**
- ✅ Real-time data từ MongoDB
- ✅ Loading states & Error handling
- ✅ Color-coded growth indicators
- ✅ 30-day revenue chart
- ✅ 10 recent orders
- ✅ No compilation errors
- ✅ TypeScript type-safe

**Ready for production!** 🚀

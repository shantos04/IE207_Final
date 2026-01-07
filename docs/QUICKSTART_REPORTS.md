# 🚀 Quick Start Guide - New Reports Page

## 📝 What's New?

The Reports page now includes **3 comprehensive reporting sections**:
1. 🥧 **Order Status Distribution** (Pie Chart)
2. 📊 **Product Sales Performance** (Progress Bars Table)
3. 💰 **Revenue by Order** (Scrollable Cards)

---

## ⚡ Quick Start (5 minutes)

### Step 1: Start Backend
```bash
cd server
npm start
```
✅ Server should start on `http://localhost:5001`

### Step 2: Start Frontend
```bash
cd ..
npm run dev
```
✅ Frontend should start on `http://localhost:5173`

### Step 3: Navigate to Reports
Open browser → `http://localhost:5173/reports`

---

## 🎯 How to Use

### Filter by Date Range
Click the dropdown at the top right and select:
- **7 ngày qua** - Last 7 days
- **Tháng này** - Current month
- **Năm nay** - Current year

Data will automatically refresh! ⚡

### Export Reports
Click the **"Xuất báo cáo"** button to export (coming soon)

---

## 📊 Understanding the Reports

### 1️⃣ Order Status Distribution (Left Panel)
**What it shows:** Breakdown of orders by status

**How to read:**
- 🟢 **Green** = Completed/Delivered orders
- 🟡 **Yellow** = Pending orders
- 🔴 **Red** = Cancelled orders
- 🔵 **Blue** = Shipped orders
- 🟣 **Purple** = Confirmed orders

**Example:**
```
Hoàn thành: 120 đơn (45.2%)
Chờ xử lý: 80 đơn (30.1%)
Đã hủy: 10 đơn (3.8%)
```

### 2️⃣ Product Sales Performance (Middle Panel)
**What it shows:** Top 10 best-selling products

**Columns:**
- Product name & code
- Total quantity sold
- Revenue generated
- Number of orders

**Progress bar:** Shows relative sales volume
- Longer bar = More units sold
- Helps identify best sellers at a glance

**Example:**
```
Arduino Uno R3 (P1001)
━━━━━━━━━━━━━━━━ 250 sp
45,000,000₫ | 120 đơn
```

### 3️⃣ Revenue by Order (Right Panel)
**What it shows:** Orders sorted by highest value

**Information per order:**
- Order code (#ORD10001)
- Date placed
- Customer name & email
- Total order value (VNĐ)
- Status

**Example:**
```
#ORD10001
55,000,000₫

Nguyễn Văn A
nguyenvana@example.com
─────────────────
✅ Đã giao
```

---

## 💡 Pro Tips

### 📈 Analyzing Trends
1. Start with **"Tháng này"** to see current month performance
2. Check Order Status → Are most orders completing?
3. Check Product Performance → Which products drive revenue?
4. Check High-Value Orders → Who are your VIP customers?

### 🎯 Business Insights
- **High cancellation rate?** → Check product quality/shipping
- **Top products** → Stock up on these!
- **High-value orders** → Focus on these customer segments
- **Pending orders** → Follow up to convert

### 🔄 Refresh Data
Data refreshes automatically when you change the date range.
If you want to see latest data, just switch between date ranges:
```
Tháng này → 7 ngày qua → Tháng này
```

---

## 🎨 UI Features

### Summary Cards (Top Row)
Quick stats at a glance:
- 📊 Total Orders
- 🛒 Products Analyzed
- 📦 Total Quantity Sold
- 💰 Highest Order Value

### Interactive Elements
- ✨ **Hover effects** on all cards
- 📜 **Scrollable** lists (smooth custom scrollbar)
- 🎨 **Color-coded** status indicators
- 📊 **Animated** progress bars

### Responsive Design
Works perfectly on:
- 💻 Desktop (3 columns)
- 📱 Tablet (2 columns)
- 📱 Mobile (1 column, stacked)

---

## 🛠️ Troubleshooting

### "Đang tải dữ liệu..." stays forever
**Problem:** Backend not running or database empty
**Solution:**
1. Check if backend is running on port 5001
2. Check MongoDB connection
3. Run seed script if no data:
   ```bash
   cd server
   node seeders/master.seed.js
   ```

### All cards show "0" or empty
**Problem:** No orders in database for selected date range
**Solution:**
1. Try changing date range to "Năm nay"
2. Check if seed data was created
3. The app will use mock data if no real data exists

### Charts not displaying
**Problem:** JavaScript error or missing dependencies
**Solution:**
1. Open browser console (F12)
2. Check for errors
3. Try refreshing the page
4. Clear browser cache

### API Errors in Console
**Problem:** Backend routes not registered
**Solution:**
1. Restart backend server
2. Check `server/routes/analyticsRoutes.js` has new routes
3. Check `server/index.js` imports analytics routes

---

## 📱 Mobile Experience

The page is fully responsive! On mobile:
- 📊 Cards stack vertically
- 🥧 Pie chart remains readable
- 📜 Tables scroll horizontally if needed
- 👆 Touch-friendly buttons

---

## 🎯 Common Use Cases

### Morning Briefing
Check "Tháng này" to see:
- How many orders yesterday?
- Top selling products this week
- Any cancelled orders to investigate?

### Weekly Review
Check "7 ngày qua" to see:
- Week-over-week performance
- Product trends
- Customer order patterns

### Monthly Report
Check "Tháng này" to see:
- Total monthly revenue
- Best performing products
- VIP customers (high-value orders)

### Year-End Analysis
Check "Năm nay" to see:
- Annual performance
- Yearly best sellers
- Growth trends

---

## 📋 API Endpoints (For Developers)

If you want to access data directly:

```bash
# Order Status Distribution
GET http://localhost:5001/api/analytics/order-status-distribution
?startDate=2026-01-01&endDate=2026-01-31

# Product Sales Performance
GET http://localhost:5001/api/analytics/product-sales-performance
?limit=10&startDate=2026-01-01&endDate=2026-01-31

# Revenue by Order
GET http://localhost:5001/api/analytics/revenue-by-order
?limit=20&startDate=2026-01-01&endDate=2026-01-31
```

---

## 🎉 Success Checklist

Before considering it a success, verify:
- [ ] ✅ All 3 report blocks visible
- [ ] ✅ Pie chart displays with colors
- [ ] ✅ Product progress bars animate
- [ ] ✅ Order cards scroll smoothly
- [ ] ✅ Date range selector works
- [ ] ✅ Numbers format correctly (VNĐ)
- [ ] ✅ Hover effects work
- [ ] ✅ No console errors

---

## 🆘 Need Help?

### Check These First:
1. ✅ Backend running? (`npm start` in server folder)
2. ✅ Frontend running? (`npm run dev` in root)
3. ✅ Database connected? (Check server console)
4. ✅ Browser console? (F12 to check errors)

### Still Issues?
Check documentation:
- 📄 `docs/REPORTS_UPGRADE_COMPLETE.md` - Full documentation
- 🎨 `docs/REPORTS_VISUAL_GUIDE.md` - Design guide
- ✅ `docs/IMPLEMENTATION_CHECKLIST.md` - Technical details

---

## 🚀 Next Steps

Once you're comfortable with the basic usage:
1. Try different date ranges
2. Analyze the data patterns
3. Identify business insights
4. Share findings with team
5. Consider adding more reports

---

**Happy Reporting! 📊**

**Last Updated:** January 6, 2026
**Version:** 1.0.0

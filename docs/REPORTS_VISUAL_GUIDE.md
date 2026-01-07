# 🎨 Visual Design Guide - Reports Page

## Layout Structure

```
┌─────────────────────────────────────────────────────────────────┐
│  📊 Báo cáo Chi tiết                    [7 ngày ▼] [📥 Xuất]   │
│  Phân tích hiệu quả kinh doanh                                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐          │
│  │ 📊 Total │ │ 🛒 Prod  │ │ 📦 Qty   │ │ 💰 Max   │          │
│  │   250    │ │    10    │ │  2,450   │ │ 55M VNĐ  │          │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘          │
│                                                                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────┐┌──────────────────┐┌──────────────────┐ │
│  │  🥧 PIE CHART    ││  📊 PRODUCTS     ││  📄 ORDERS       │ │
│  │                  ││                   ││                   │ │
│  │   ╭─────╮       ││  Arduino ■■■■■■  ││ #ORD10001        │ │
│  │  ╱       ╲      ││  50 sp  [====]   ││ 55,000,000₫      │ │
│  │ │  Status │     ││                   ││ Nguyễn Văn A     │ │
│  │  ╲       ╱      ││  ESP32  ■■■■■    ││ ─────────────    │ │
│  │   ╰─────╯       ││  45 sp  [===]    ││                   │ │
│  │                  ││                   ││ #ORD10002        │ │
│  │ 🟢 Complete 45%  ││  DHT22  ■■■■     ││ 42,000,000₫      │ │
│  │ 🟡 Pending  30%  ││  38 sp  [==]     ││ Trần Thị B       │ │
│  │ 🔴 Cancel   10%  ││                   ││ ─────────────    │ │
│  │ 🔵 Shipped  15%  ││  ...scrollable   ││ ...scrollable    │ │
│  └──────────────────┘└──────────────────┘└──────────────────┘ │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Color Palette

### Status Colors
```
🟢 Success/Completed  → #10B981 (Green)
🟡 Warning/Pending    → #F59E0B (Orange)
🔴 Danger/Cancelled   → #EF4444 (Red)
🔵 Info/Shipped       → #3B82F6 (Blue)
🟣 Purple/Confirmed   → #8B5CF6 (Purple)
```

### UI Colors
```
Background        → #FFFFFF (White)
Border            → #E5E7EB (Gray-200)
Shadow            → rgba(0,0,0,0.1)
Text Primary      → #111827 (Gray-900)
Text Secondary    → #6B7280 (Gray-500)
Hover Background  → #F3F4F6 (Gray-100)
```

---

## Component Styles

### 📊 Summary Cards
```css
background: gradient-to-br
border: 2px solid (matching color)
padding: 24px
border-radius: 16px
shadow: sm

Icon container:
  - size: 48px × 48px
  - border-radius: 12px
  - background: solid color
  - icon: 24px, white
```

### 🥧 Pie Chart Card
```css
Card:
  - bg: white
  - shadow: lg
  - border-radius: 16px
  - padding: 24px

Chart:
  - innerRadius: 70px
  - outerRadius: 110px
  - paddingAngle: 3
  - height: 280px

Legend Item:
  - hover: bg-gray-50
  - padding: 8px
  - border-radius: 8px
  - transition: all 0.2s
```

### 📊 Product Performance Table
```css
Item Card:
  - bg: gray-50
  - hover: gray-100
  - padding: 12px
  - border-radius: 12px
  - margin-bottom: 12px

Progress Bar:
  - height: 10px (h-2.5)
  - background: gray-200
  - fill: gradient(green-400 → green-600)
  - border-radius: full
  - transition: width 0.3s ease
```

### 📄 Order Revenue Cards
```css
Card:
  - bg: gradient(gray-50 → white)
  - border: 1px gray-200
  - hover: shadow-md + border-purple-200
  - padding: 16px
  - border-radius: 12px
  - transition: all 0.2s

Price Display:
  - font-size: 18px (text-lg)
  - font-weight: bold
  - color: purple-600

Status Badge:
  - bg: green-100
  - color: green-700
  - padding: 4px 10px
  - border-radius: full
  - font-size: 12px
```

---

## Typography Scale

```
Page Title       → text-3xl (30px) font-bold
Section Title    → text-lg (18px) font-bold
Card Value       → text-3xl (30px) font-bold
Card Value Small → text-2xl (24px) font-bold
Label            → text-sm (14px) font-medium
Small Text       → text-xs (12px) regular
Tiny Text        → text-xs (12px) text-gray-500
```

---

## Spacing System

```
Between sections    → space-y-6 (24px)
Between cards       → gap-6 (24px)
Card padding        → p-6 (24px)
Card inner spacing  → space-y-3 (12px)
Small spacing       → gap-2 (8px)
Tiny spacing        → gap-1 (4px)
```

---

## Responsive Breakpoints

```css
/* Mobile First */
grid-cols-1           /* < 768px */
md:grid-cols-2        /* ≥ 768px */
lg:grid-cols-3        /* ≥ 1024px */
lg:grid-cols-4        /* ≥ 1024px (stats) */

/* Main Report Grid */
Mobile:   1 column (stack)
Tablet:   1 column (stack)
Desktop:  3 equal columns
```

---

## Animation & Transitions

```css
/* Hover Effects */
transition-colors → 150ms
transition-all    → 200ms
transition-shadow → 200ms

/* Progress Bar */
transition: width 300ms ease

/* Pie Chart */
Built-in Recharts animations
```

---

## Custom Scrollbar

```css
/* Width */
::-webkit-scrollbar {
  width: 6px;
}

/* Track */
::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 10px;
}

/* Thumb */
::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 10px;
}

/* Thumb Hover */
::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}
```

---

## Icon Usage

```
TrendingUp      → Total Orders
ShoppingCart    → Products
Package         → Quantity
DollarSign      → Revenue
PieChartIcon    → Status Distribution
BarChart3       → Product Performance
FileText        → Order Details
Calendar        → Date Selector
Download        → Export Button
```

---

## Data Formatting

### Currency (VNĐ)
```typescript
// Full format
formatCurrency(55000000)
// Output: "55.000.000 ₫"

// Used in:
- Order revenue display
- Product revenue display
- Summary cards
```

### Date
```typescript
// Vietnamese format
formatDate("2026-01-05T10:30:00.000Z")
// Output: "05/01/2026"

// Used in:
- Order date display
```

### Percentage
```typescript
// One decimal place
percentage.toFixed(1)
// Output: "45.2"

// Used in:
- Pie chart labels
- Status distribution
```

---

## Loading States

### Skeleton Loading
```
┌────────────────────────────────────┐
│ ▓▓▓▓▓▓▓▓▓▓ (title skeleton)       │
│ ▓▓▓▓▓▓▓▓ (subtitle skeleton)      │
│                                     │
│ ┌─────┐ ┌─────┐ ┌─────┐           │
│ │▓▓▓▓▓│ │▓▓▓▓▓│ │▓▓▓▓▓│           │
│ └─────┘ └─────┘ └─────┘           │
└────────────────────────────────────┘

Animation: pulse (animate-pulse)
```

---

## Accessibility

### Color Contrast Ratios
```
Text on White:
- Gray-900: 17.4:1 ✅ (Excellent)
- Gray-700: 8.4:1  ✅ (Good)
- Gray-500: 4.7:1  ✅ (Good)

Colored Text:
- Green-600: 4.8:1 ✅
- Purple-600: 5.2:1 ✅
- Blue-600: 5.1:1 ✅
```

### Focus States
```css
focus:outline-none
focus:ring-2
focus:ring-blue-500
```

---

## Best Practices Applied

✅ **Consistent Spacing** - Using Tailwind's spacing scale
✅ **Visual Hierarchy** - Clear heading levels and sizing
✅ **Hover Feedback** - All interactive elements have hover states
✅ **Loading States** - Skeleton UI while fetching
✅ **Error Handling** - Graceful fallback to mock data
✅ **Responsive Design** - Mobile-first approach
✅ **Color Psychology** - Green=success, Red=danger, etc.
✅ **Clean Layout** - Grid system for organization
✅ **Smooth Animations** - 200-300ms transitions
✅ **Custom Scrollbars** - Consistent with design system

---

## Component Hierarchy

```
ReportsPage
├── Header Section
│   ├── Title + Subtitle
│   └── Actions (Date Selector + Export)
│
├── Summary Stats Row (4 cards)
│   ├── Total Orders
│   ├── Products Analyzed
│   ├── Total Quantity Sold
│   └── Highest Revenue
│
└── Main Reports Grid (3 columns)
    ├── Block 1: Order Status (Pie Chart)
    │   ├── Chart Component
    │   └── Legend List
    │
    ├── Block 2: Product Performance (Table)
    │   └── Product Items (with progress bars)
    │
    └── Block 3: Revenue by Order (List)
        └── Order Cards (scrollable)
```

---

**Design System:** CraftUI-inspired
**Framework:** React + TypeScript + Tailwind CSS
**Charts:** Recharts
**Icons:** Lucide React

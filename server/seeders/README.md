# 🌱 Seeders Directory

Chứa các script để tạo dữ liệu test cho database.

## 📁 Files

### Main Scripts
- **master.seed.js** ⭐ - Master seeding (tất cả dữ liệu, 3 tháng)
- products.seed.js - Chỉ tạo products
- orders.seed.js - Chỉ tạo orders
- settings.seed.js - Chỉ tạo system settings

### Documentation
- **SEEDING_COMPLETE.md** - Summary & checklist
- **MASTER_SEED_README.md** - Full documentation
- **QUICKSTART.md** - Quick start (3 bước)
- **ARCHITECTURE.md** - Visual diagrams

---

## 🚀 Quick Commands

```bash
# Master seeding - Tất cả dữ liệu (Recommended)
npm run seed:master

# Individual seeders
npm run seed:products
npm run seed:settings
```

---

## 📊 Master Seed Creates:

| Item | Count | Notes |
|------|-------|-------|
| Admin | 1 | admin@craftui.com / 123456 |
| Products | 50 | Electronic components |
| Customers | 50 | Vietnamese data |
| Orders | 500 | 3 months distribution |
| Invoices | ~350 | For completed orders |
| Settings | 1 | System config |

**Time Range:** Last 90 days (3 months)

---

## ⚠️ Important

🔴 **master.seed.js sẽ XÓA SẠCH database!**
- Chỉ dùng trong development/test
- KHÔNG chạy trong production
- Backup data trước khi chạy

---

## 📖 Documentation

1. **Quick Start:** Read [QUICKSTART.md](./QUICKSTART.md)
2. **Full Guide:** Read [MASTER_SEED_README.md](./MASTER_SEED_README.md)
3. **Architecture:** Read [ARCHITECTURE.md](./ARCHITECTURE.md)
4. **Summary:** Read [SEEDING_COMPLETE.md](./SEEDING_COMPLETE.md)

---

## 🎯 Use Cases

Perfect for testing:
- ✅ Dashboard analytics
- ✅ Revenue charts (3 months)
- ✅ Order management
- ✅ Reports & statistics
- ✅ Date range filtering
- ✅ Status filtering

---

## 🔧 Customization

Edit `master.seed.js` to change:
- Number of products, customers, orders
- Date range (default: 90 days)
- Status distribution (default: 70% Delivered)
- Peak hours (default: 8AM-10PM)

See [MASTER_SEED_README.md](./MASTER_SEED_README.md#-cấu-hình) for details.

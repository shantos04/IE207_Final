# 🚀 Quick Start Guide

## Start cả Frontend + Backend

### Terminal 1: Backend Server

```bash
cd server
npm install          # Lần đầu tiên
npm run seed         # Import data mẫu (optional)
npm run dev          # Start server
```

✅ Backend: http://localhost:5000

### Terminal 2: Frontend Dev Server

```bash
# Ở thư mục root (DoAn)
npm install          # Lần đầu tiên
npm run dev          # Start frontend
```

✅ Frontend: http://localhost:3000 (hoặc 3001)

## Đăng nhập

### Demo Accounts (sau khi seed)

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@craftui.com | admin123 |
| Manager | manager@craftui.com | manager123 |
| Staff | staff@craftui.com | staff123 |

## Kiểm tra kết nối

1. Mở browser: http://localhost:3000
2. Login với admin@craftui.com / admin123
3. Vào Dashboard
4. Check Network tab trong DevTools:
   - Thấy request đến `http://localhost:5000/api/auth/login`
   - Response status 200 OK

## Cấu trúc Project

```
DoAn/
├── src/              # Frontend (React + TypeScript)
├── server/           # Backend (Node.js + Express)
├── docs/             # Documentation
├── package.json      # Frontend deps
└── README.md         # Main docs
```

## Troubleshooting

### Backend không chạy?
- Check MongoDB đang chạy
- Check port 5000 không bị chiếm
- Xem log trong terminal

### Frontend không connect backend?
- Check `.env` có `VITE_API_URL=http://localhost:5000/api`
- Check authService.ts đã uncomment Real API
- Check CORS trong `server/.env`

### Login không được?
- Check Backend đang chạy
- Check đã seed data chưa (`npm run seed`)
- Check username/password đúng

## Các lệnh hữu ích

```bash
# Backend
cd server
npm run dev          # Development mode với nodemon
npm start            # Production mode
npm run seed         # Import sample data
npm run seed -- -d   # Xóa tất cả data

# Frontend
npm run dev          # Start dev server
npm run build        # Build production
npm run preview      # Preview production build
```

## Documentation

- **Full Setup:** [server/SETUP_COMPLETE.md](server/SETUP_COMPLETE.md)
- **API Docs:** [server/README.md](server/README.md)
- **Connect Guide:** [docs/CONNECT_FRONTEND_BACKEND.md](docs/CONNECT_FRONTEND_BACKEND.md)
- **Auth Guide:** [docs/AUTHENTICATION.md](docs/AUTHENTICATION.md)

---

**Happy Coding! 🎉**

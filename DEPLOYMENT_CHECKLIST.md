# ✅ Vercel Deployment Checklist

## Pre-Deployment
- [ ] Code đã hoàn thiện và test kỹ trên localhost
- [ ] Đã có tài khoản GitHub
- [ ] Đã có tài khoản Vercel (sign up với GitHub)
- [ ] Đã có tài khoản MongoDB Atlas

## MongoDB Atlas Setup
- [ ] Tạo Free Cluster trên MongoDB Atlas
- [ ] Tạo Database User (username + password)
- [ ] Whitelist IP: 0.0.0.0/0
- [ ] Copy connection string

## GitHub Setup
- [ ] Push code lên GitHub repository
  ```bash
  git init
  git add .
  git commit -m "Ready for deployment"
  git remote add origin https://github.com/YOUR-USERNAME/IE207_Final.git
  git push -u origin main
  ```

## Deploy Backend (server/)
- [ ] Vào Vercel Dashboard > New Project
- [ ] Import GitHub repository
- [ ] Root Directory: `server`
- [ ] Framework: Other
- [ ] Environment Variables:
  - [ ] NODE_ENV=production
  - [ ] PORT=5000
  - [ ] MONGODB_URI=(paste từ MongoDB Atlas)
  - [ ] JWT_SECRET=(tạo bằng: `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`)
  - [ ] JWT_EXPIRES_IN=7d
- [ ] Click Deploy
- [ ] Copy backend URL (vd: https://ie207-backend.vercel.app)

## Deploy Frontend (root/)
- [ ] Vào Vercel Dashboard > New Project
- [ ] Import GitHub repository (lần 2)
- [ ] Root Directory: (để trống - root folder)
- [ ] Framework: Vite
- [ ] Build Command: npm run build
- [ ] Output Directory: dist
- [ ] Environment Variables:
  - [ ] VITE_API_URL=(paste backend URL + /api)
  - [ ] VITE_GOOGLE_CLIENT_ID=441951236178-43vdni7tql04el9gjd73b0q7fbojrh6f.apps.googleusercontent.com
- [ ] Click Deploy
- [ ] Copy frontend URL (vd: https://ie207-final.vercel.app)

## Google OAuth Setup
- [ ] Vào Google Cloud Console
- [ ] Edit OAuth Client ID
- [ ] Authorized JavaScript origins:
  - [ ] Thêm frontend URL (https://ie207-final.vercel.app)
- [ ] Save

## Post-Deployment Testing
- [ ] Mở frontend URL
- [ ] Test đăng nhập với: admin@craftui.com / 123456
- [ ] Test Google Login
- [ ] Test các chức năng chính:
  - [ ] Xem sản phẩm
  - [ ] Thêm vào giỏ hàng
  - [ ] Đặt hàng
  - [ ] Admin dashboard
  - [ ] Quản lý sản phẩm

## Troubleshooting
- [ ] Nếu lỗi CORS: Check backend CORS config
- [ ] Nếu lỗi API: Check backend logs trong Vercel
- [ ] Nếu lỗi MongoDB: Verify connection string và IP whitelist
- [ ] Nếu lỗi Google OAuth: Verify authorized origins

## Optional - Custom Domain
- [ ] Mua domain (Namecheap, GoDaddy, etc.)
- [ ] Trong Vercel: Settings > Domains > Add
- [ ] Configure DNS theo hướng dẫn Vercel
- [ ] Update Google OAuth với domain mới

---

## Quick Reference

**Backend URL Structure:**
```
https://ie207-backend.vercel.app/api/auth/login
https://ie207-backend.vercel.app/api/products
https://ie207-backend.vercel.app/api/orders
```

**Frontend .env:**
```
VITE_API_URL=https://ie207-backend.vercel.app/api
VITE_GOOGLE_CLIENT_ID=your-client-id
```

**Backend .env:**
```
NODE_ENV=production
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/ie207_erp
JWT_SECRET=generated-secret-key
JWT_EXPIRES_IN=7d
CLIENT_URL=https://ie207-final.vercel.app
```

---

## 🎉 Done!

Website live tại:
- Frontend: https://ie207-final.vercel.app
- Backend: https://ie207-backend.vercel.app

Share link với giảng viên và bạn bè! 🚀

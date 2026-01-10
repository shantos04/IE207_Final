# 🚀 Hướng Dẫn Deploy Lên Vercel

## 📋 Chuẩn Bị

### 1. Tạo Tài Khoản
- Đăng ký tại: https://vercel.com
- Login bằng GitHub (khuyến nghị)

### 2. Push Code Lên GitHub
```bash
# Khởi tạo git (nếu chưa có)
git init
git add .
git commit -m "Initial commit - Ready for deployment"

# Tạo repo trên GitHub và push
git remote add origin https://github.com/your-username/IE207_Final.git
git branch -M main
git push -u origin main
```

---

## 🗄️ BƯỚC 1: Setup MongoDB Atlas (Database)

1. Vào https://www.mongodb.com/cloud/atlas
2. Đăng ký/Đăng nhập
3. **Create New Cluster** (chọn FREE tier)
4. **Database Access**: Create user với username/password
5. **Network Access**: Add IP `0.0.0.0/0` (cho phép tất cả)
6. **Connect**: Copy connection string
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/ie207_erp?retryWrites=true&w=majority
   ```

---

## 🔧 BƯỚC 2: Deploy Backend

### 2.1. Truy cập Vercel Dashboard
1. Vào https://vercel.com/dashboard
2. Click **"Add New"** > **"Project"**
3. **Import Git Repository** của bạn

### 2.2. Configure Backend
1. **Root Directory**: Chọn `server`
2. **Framework Preset**: Other
3. **Build Command**: `npm install` (để trống hoặc dùng default)
4. **Output Directory**: Để trống
5. **Install Command**: `npm install`

### 2.3. Environment Variables (Quan trọng!)
Click **"Environment Variables"** và thêm:

```bash
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/ie207_erp
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-2024
JWT_EXPIRES_IN=7d
```

**Tạo JWT_SECRET ngẫu nhiên:**
```bash
# Chạy lệnh này để tạo secret key an toàn
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 2.4. Deploy
- Click **"Deploy"**
- Đợi 2-3 phút
- Copy URL backend: `https://ie207-backend.vercel.app`

---

## 🎨 BƯỚC 3: Deploy Frontend

### 3.1. Import Lại Project
1. Click **"Add New"** > **"Project"**
2. Import lại repository (hoặc tạo project mới)

### 3.2. Configure Frontend
1. **Root Directory**: Để ở root (không chọn thư mục con)
2. **Framework Preset**: Vite
3. **Build Command**: `npm run build`
4. **Output Directory**: `dist`
5. **Install Command**: `npm install`

### 3.3. Environment Variables
```bash
VITE_API_URL=https://ie207-backend.vercel.app/api
VITE_GOOGLE_CLIENT_ID=441951236178-43vdni7tql04el9gjd73b0q7fbojrh6f.apps.googleusercontent.com
```

**Lưu ý:** Thay `ie207-backend.vercel.app` bằng URL backend thực tế của bạn

### 3.4. Deploy
- Click **"Deploy"**
- Đợi 2-3 phút
- Copy URL frontend: `https://ie207-final.vercel.app`

---

## 🔐 BƯỚC 4: Cấu Hình Google OAuth

1. Vào https://console.cloud.google.com/apis/credentials
2. Tìm Client ID của bạn
3. **Edit** > **Authorized JavaScript origins**
4. Thêm:
   ```
   https://ie207-final.vercel.app
   https://your-custom-domain.vercel.app
   ```
5. **Authorized redirect URIs**: (không cần thiết cho Google Sign-In button)
6. **Save**

---

## 🔄 BƯỚC 5: Update CORS Trên Backend

Backend cần cho phép frontend domain. Vercel sẽ tự động deploy lại khi bạn push code mới:

**File `server/index.js` - Update CORS:**
```javascript
app.use(cors({
    origin: [
        'http://localhost:5173',
        'https://ie207-final.vercel.app',
        'https://*.vercel.app'  // Cho phép tất cả subdomain Vercel
    ],
    credentials: true
}));
```

Push changes:
```bash
git add .
git commit -m "Update CORS for Vercel deployment"
git push
```

Vercel sẽ tự động deploy lại!

---

## ✅ BƯỚC 6: Test Website

1. Mở URL frontend: `https://ie207-final.vercel.app`
2. Thử đăng nhập:
   - Email: `admin@craftui.com`
   - Password: `123456`
3. Kiểm tra các chức năng:
   - ✅ Login/Logout
   - ✅ Trang chủ
   - ✅ Sản phẩm
   - ✅ Giỏ hàng
   - ✅ Admin dashboard (nếu là admin)

---

## 🛠️ Troubleshooting

### Lỗi: "Failed to fetch"
- Kiểm tra CORS đã đúng chưa
- Verify backend URL trong frontend `.env`

### Lỗi: "MongoDB connection failed"
- Kiểm tra MongoDB Atlas connection string
- Verify Network Access whitelist: `0.0.0.0/0`
- Check username/password không có ký tự đặc biệt

### Lỗi: "Google OAuth not allowed"
- Thêm domain Vercel vào Google Console
- Check VITE_GOOGLE_CLIENT_ID đúng chưa

### Backend không chạy
- Check logs trong Vercel Dashboard > Deployment > Logs
- Verify environment variables đã set đúng

---

## 📱 Custom Domain (Optional)

1. Trong Vercel Dashboard > Project Settings
2. **Domains** > **Add Domain**
3. Nhập domain của bạn (vd: `myshop.com`)
4. Vercel sẽ hướng dẫn cấu hình DNS

---

## 🔄 Auto Deploy

Vercel tự động deploy khi bạn push code:
```bash
git add .
git commit -m "Update features"
git push
```

Vercel detect changes và deploy tự động! 🎉

---

## 📊 Monitor

- **Analytics**: Vercel Dashboard > Analytics
- **Logs**: Deployment > Functions > Logs
- **Performance**: Speed Insights

---

## 💰 Chi Phí

✅ **FREE Forever:**
- Frontend hosting
- Backend (Serverless Functions)
- Bandwidth: 100GB/month
- Build time: 6,000 minutes/month

**Đủ cho dự án sinh viên và demo!** 🎓

---

## 🆘 Support

- Vercel Docs: https://vercel.com/docs
- MongoDB Atlas: https://docs.atlas.mongodb.com/
- Nếu cần trợ giúp: hỏi tôi! 😊

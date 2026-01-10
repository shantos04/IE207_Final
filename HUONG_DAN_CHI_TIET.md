# 🚀 HƯỚNG DẪN DEPLOY CHI TIẾT TỪNG BƯỚC

---

## 📋 BƯỚC 1: PUSH CODE LÊN GITHUB (10 phút)

### 1.1. Tạo Repository Trên GitHub

1. **Truy cập:** https://github.com
2. **Đăng nhập** vào tài khoản GitHub của bạn
3. Click nút **"+"** ở góc trên bên phải
4. Chọn **"New repository"**

### 1.2. Điền Thông Tin Repository

```
Repository name: IE207_Final
Description: IE207 E-commerce Project (tùy chọn)
☑️ Public (hoặc Private nếu bạn muốn)
☐ Add a README file (KHÔNG chọn - vì đã có sẵn)
☐ Add .gitignore (KHÔNG chọn - vì đã có sẵn)
☐ Choose a license (tùy chọn)
```

5. Click **"Create repository"**

### 1.3. Copy Commands Và Push Code

Sau khi tạo xong, GitHub sẽ hiển thị hướng dẫn. Copy URL repository của bạn:

**URL có dạng:** `https://github.com/YOUR-USERNAME/IE207_Final.git`

### 1.4. Mở Terminal/PowerShell Tại Thư Mục Project

**Windows:**
- Mở thư mục `D:\Workspace\P\IE207_Final`
- Shift + Right Click trong thư mục
- Chọn **"Open PowerShell window here"** hoặc **"Open in Terminal"**

**Hoặc trong VS Code:**
- Mở terminal: `Ctrl + ~` hoặc `View > Terminal`

### 1.5. Chạy Các Lệnh Git

```bash
# 1. Khởi tạo Git (nếu chưa có)
git init

# 2. Thêm tất cả files
git add .

# 3. Commit code
git commit -m "Initial commit - Ready for Vercel deployment"

# 4. Kết nối với GitHub (THAY YOUR-USERNAME bằng username GitHub của bạn)
git remote add origin https://github.com/YOUR-USERNAME/IE207_Final.git

# 5. Đổi tên branch thành main
git branch -M main

# 6. Push code lên GitHub
git push -u origin main
```

**Lưu ý:** 
- Nếu GitHub yêu cầu đăng nhập, nhập username và Personal Access Token (không phải password)
- Tạo token tại: https://github.com/settings/tokens

### 1.6. Verify

- Reload trang GitHub repository
- Bạn sẽ thấy tất cả files đã được upload

✅ **Hoàn thành BƯỚC 1!**

---

## 🗄️ BƯỚC 2: SETUP MONGODB ATLAS (10 phút)

### 2.1. Đăng Ký/Đăng Nhập MongoDB Atlas

1. **Truy cập:** https://www.mongodb.com/cloud/atlas
2. Click **"Try Free"** hoặc **"Sign In"** (nếu đã có tài khoản)
3. Đăng ký bằng:
   - Email (khuyến nghị)
   - Google Account
   - GitHub Account

### 2.2. Tạo Organization (Lần Đầu)

Nếu là lần đầu sử dụng:
1. Điền **Organization Name:** `IE207 Project` (hoặc tên bạn muốn)
2. Click **"Next"**
3. Chọn **"I'm learning MongoDB"** hoặc phù hợp với mục đích
4. Click **"Finish"**

### 2.3. Tạo Free Cluster

1. Trong dashboard, click **"+ Create"** hoặc **"Build a Database"**

2. **Chọn Deployment Option:**
   - ✅ Chọn **"M0 Shared"** (FREE tier)
   - Click **"Create Deployment"** hoặc **"Create"**

3. **Configure Cluster:**
   ```
   Cloud Provider: AWS (hoặc Google Cloud)
   Region: Chọn gần nhất (vd: Singapore, Hong Kong, Tokyo)
   Cluster Name: IE207Cluster (hoặc tên bạn muốn)
   ```

4. Click **"Create Deployment"** hoặc **"Create Cluster"**

5. **Đợi 3-5 phút** để cluster được tạo (có loading bar)

### 2.4. Tạo Database User (QUAN TRỌNG!)

Một popup sẽ hiện ra yêu cầu tạo user:

```
Username: ie207admin (hoặc tên bạn muốn - KHÔNG có ký tự đặc biệt)
Password: Click "Autogenerate Secure Password" 
         HOẶC tự tạo: IE207Pass2024 (phải từ 8 ký tự)

⚠️ LƯU LẠI USERNAME VÀ PASSWORD! Bạn sẽ cần nó sau!
```

Click **"Create Database User"**

**Nếu popup không hiện:**
1. Menu bên trái > **"Database Access"**
2. Click **"+ ADD NEW DATABASE USER"**
3. **Authentication Method:** Password
4. Điền username và password như trên
5. **Database User Privileges:** Atlas admin (hoặc Read and write to any database)
6. Click **"Add User"**

### 2.5. Whitelist IP Address (Cho Phép Truy Cập)

Trong popup hoặc:
1. Menu bên trái > **"Network Access"**
2. Click **"+ ADD IP ADDRESS"**

3. Một popup hiện ra:
   - Click **"ALLOW ACCESS FROM ANYWHERE"**
   - IP sẽ tự động điền: `0.0.0.0/0`
   - Comment: `Vercel deployment - allow all`

4. Click **"Confirm"**

**Đợi 1-2 phút** để IP được active (có thể thấy status "Pending" → "Active")

### 2.6. Lấy Connection String (QUAN TRỌNG!)

1. Quay lại **"Database"** (menu bên trái hoặc top tab)
2. Tìm cluster vừa tạo (IE207Cluster)
3. Click nút **"Connect"**

4. Trong popup, chọn:
   - ✅ **"Drivers"** (hoặc "Connect your application")

5. Chọn:
   ```
   Driver: Node.js
   Version: 5.5 or later (hoặc latest)
   ```

6. **Copy connection string:**
   ```
   mongodb+srv://<username>:<password>@ie207cluster.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```

7. **QUAN TRỌNG - Chỉnh sửa connection string:**
   ```
   mongodb+srv://ie207admin:IE207Pass2024@ie207cluster.xxxxx.mongodb.net/ie207_erp?retryWrites=true&w=majority
   ```
   
   Thay:
   - `<username>` → username của bạn (vd: `ie207admin`)
   - `<password>` → password của bạn (vd: `IE207Pass2024`)
   - Thêm `/ie207_erp` trước dấu `?` (tên database)

8. **LƯU connection string này vào Notepad!** Bạn sẽ dùng nó ở bước deploy backend!

### 2.7. Verify (Tùy chọn)

Click **"Browse Collections"** > **"Add My Own Data"**:
```
Database name: ie207_erp
Collection name: test
```

Click **"Create"** - Database đã sẵn sàng!

✅ **Hoàn thành BƯỚC 2!**

**Checklist:**
- ✅ Cluster đã tạo và status "Active"
- ✅ Database user đã tạo
- ✅ IP 0.0.0.0/0 đã whitelist
- ✅ Connection string đã lưu

---

## 🔧 BƯỚC 3: DEPLOY BACKEND LÊN VERCEL (10 phút)

### 3.1. Truy Cập Vercel

1. **Mở:** https://vercel.com
2. Click **"Sign Up"** hoặc **"Log In"**
3. **Đăng nhập bằng GitHub** (khuyến nghị - để import repo dễ hơn)
   - Click **"Continue with GitHub"**
   - Authorize Vercel truy cập GitHub

### 3.2. Tạo Project Mới Cho Backend

1. Trong Vercel Dashboard, click **"Add New..."** (nút trên cùng)
2. Chọn **"Project"**

### 3.3. Import Repository

1. Vercel sẽ hiển thị list các repository GitHub của bạn
2. Tìm repository **"IE207_Final"**
3. Click **"Import"** bên cạnh repository đó

### 3.4. Configure Project - BACKEND

**Quan trọng: Cấu hình đúng cho backend!**

1. **Project Name:** `ie207-backend` (hoặc tên bạn muốn)

2. **Framework Preset:** 
   - Chọn **"Other"** (không phải Vite, Next.js, etc.)

3. **Root Directory:** 
   - ⚠️ **ĐÂY LÀ PHẦN QUAN TRỌNG!**
   - Click **"Edit"** hoặc toggle
   - Chọn thư mục **"server"**
   - Hoặc nhập: `server`

4. **Build and Output Settings:**
   ```
   Build Command: (để trống hoặc npm install)
   Output Directory: (để trống)
   Install Command: npm install
   ```

### 3.5. Environment Variables (QUAN TRỌNG!)

Click **"Environment Variables"** để mở rộng

**Thêm từng biến sau (click "Add Another" để thêm tiếp):**

#### Variable 1: NODE_ENV
```
Key:   NODE_ENV
Value: production
```

#### Variable 2: PORT
```
Key:   PORT
Value: 5000
```

#### Variable 3: MONGODB_URI
```
Key:   MONGODB_URI
Value: mongodb+srv://ie207admin:IE207Pass2024@ie207cluster.xxxxx.mongodb.net/ie207_erp?retryWrites=true&w=majority
```
**⚠️ Paste connection string từ BƯỚC 2.6!**

#### Variable 4: JWT_SECRET

**Tạo JWT Secret Key:**
1. Mở terminal mới (hoặc tab mới trong VS Code terminal)
2. Chạy lệnh:
   ```bash
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
   ```
3. Copy chuỗi random được tạo ra (dạng: `a3f5b8c2d9e1f4g7h0i2j5k8l1m4n7o0p3q6r9s2t5u8v1w4x7y0z3...`)

```
Key:   JWT_SECRET
Value: (paste chuỗi vừa tạo)
```

#### Variable 5: JWT_EXPIRES_IN
```
Key:   JWT_EXPIRES_IN
Value: 7d
```

#### Variable 6: CLIENT_URL (sẽ update sau)
```
Key:   CLIENT_URL
Value: http://localhost:5173
```
*Chúng ta sẽ update lại sau khi deploy frontend*

**Tổng cộng: 6 environment variables**

### 3.6. Deploy Backend!

1. Kiểm tra lại:
   - ✅ Root Directory: `server`
   - ✅ 6 Environment Variables đã thêm
   - ✅ Framework: Other

2. Click **"Deploy"**

3. **Đợi 2-3 phút** - Vercel sẽ:
   - Install dependencies
   - Build project
   - Deploy lên serverless functions

### 3.7. Lấy Backend URL

Sau khi deploy xong:

1. Vercel sẽ hiển thị **"Congratulations!"** với confetti 🎉
2. Click **"Visit"** hoặc copy URL hiển thị

**Backend URL của bạn sẽ có dạng:**
```
https://ie207-backend.vercel.app
```

3. **Test Backend:**
   - Mở URL: `https://ie207-backend.vercel.app/api/products`
   - Nếu thấy JSON response hoặc `{"message":"..."}` → Backend hoạt động!

4. **⚠️ LƯU URL NÀY! Bạn sẽ dùng nó cho frontend!**

### 3.8. Seed Database (Tùy chọn - Chạy Local)

Backend đã live nhưng database trống. Cách đơn giản nhất:

**Option A: Chạy seed script local (khuyến nghị)**

1. Trong terminal VS Code, update file `server/.env` với MONGODB_URI từ Atlas
2. Chạy:
   ```bash
   cd server
   npm run seed:users
   npm run seed:products
   npm run seed:orders
   ```

**Option B: Chạy trên Vercel (advanced - có thể skip)**
- Cần tạo serverless function riêng cho seeding

✅ **Hoàn thành BƯỚC 3 - Backend đã live!**

**Checklist:**
- ✅ Backend deployed thành công
- ✅ Backend URL đã lưu
- ✅ Database đã seed dữ liệu test

---

## 🎨 BƯỚC 4: DEPLOY FRONTEND LÊN VERCEL (10 phút)

### 4.1. Tạo Project Mới Cho Frontend

1. Quay lại Vercel Dashboard: https://vercel.com/dashboard
2. Click **"Add New..."** > **"Project"** (lần 2)

### 4.2. Import Repository (Lần 2)

1. Tìm lại repository **"IE207_Final"**
2. Click **"Import"** (import lần 2 cùng 1 repo nhưng config khác)

### 4.3. Configure Project - FRONTEND

**Khác với backend, lần này để root folder:**

1. **Project Name:** `ie207-frontend` (hoặc `ie207-final`)

2. **Framework Preset:** 
   - ⚠️ **Chọn "Vite"** (Vercel tự detect được)
   - Nếu không tự detect, chọn manually

3. **Root Directory:** 
   - ⚠️ **ĐỂ TRỐNG!** (không chọn thư mục con)
   - Hoặc chọn **"." (root)**

4. **Build and Output Settings:**
   ```
   Build Command: npm run build
   Output Directory: dist
   Install Command: npm install
   Development Command: npm run dev
   ```

### 4.4. Environment Variables (QUAN TRỌNG!)

Click **"Environment Variables"**

**Thêm 2 biến:**

#### Variable 1: VITE_API_URL
```
Key:   VITE_API_URL
Value: https://ie207-backend.vercel.app/api
```
**⚠️ Thay `ie207-backend.vercel.app` bằng backend URL thực tế của bạn từ BƯỚC 3.7**
**⚠️ Nhớ thêm `/api` ở cuối!**

#### Variable 2: VITE_GOOGLE_CLIENT_ID
```
Key:   VITE_GOOGLE_CLIENT_ID
Value: 441951236178-43vdni7tql04el9gjd73b0q7fbojrh6f.apps.googleusercontent.com
```

**Tổng cộng: 2 environment variables**

### 4.5. Deploy Frontend!

1. Kiểm tra lại:
   - ✅ Root Directory: (empty/root)
   - ✅ Framework: Vite
   - ✅ Build Command: npm run build
   - ✅ Output: dist
   - ✅ 2 Environment Variables đã thêm

2. Click **"Deploy"**

3. **Đợi 2-3 phút** - Vercel sẽ:
   - Install dependencies (React, Vite, etc.)
   - Run `npm run build`
   - Deploy static files

### 4.6. Lấy Frontend URL

Sau khi deploy xong:

1. Vercel hiển thị **"Congratulations!"** 🎉
2. Click **"Visit"** hoặc copy URL

**Frontend URL của bạn sẽ có dạng:**
```
https://ie207-final.vercel.app
hoặc
https://ie207-frontend.vercel.app
```

3. **⚠️ LƯU URL NÀY!**

### 4.7. Test Website

1. **Mở frontend URL** trong browser
2. **Kiểm tra giao diện:**
   - Trang chủ load đúng không?
   - Sản phẩm hiển thị không? (nếu đã seed)
   - Header có nút "Đăng nhập" không?

3. **Test Đăng Nhập:**
   ```
   Email: admin@craftui.com
   Password: 123456
   ```

4. **Nếu login thành công:**
   - ✅ Redirect đến /admin/dashboard (với admin)
   - ✅ Header hiển thị avatar/tên user
   - ✅ Có thể logout

5. **Nếu login fail:**
   - Mở Developer Tools (F12)
   - Tab "Console" - xem lỗi gì
   - Tab "Network" - check request đến backend có status 200 không
   - Thường lỗi: CORS, Backend URL sai, hoặc database chưa seed

### 4.8. Update Backend CLIENT_URL (Quan trọng!)

Quay lại backend để update CORS:

1. Vào Vercel Dashboard
2. Chọn project **backend** (ie207-backend)
3. **Settings** > **Environment Variables**
4. Tìm `CLIENT_URL`
5. Click **Edit** (icon bút chì)
6. Update value:
   ```
   https://ie207-final.vercel.app
   ```
   (frontend URL thực tế của bạn)
7. Click **Save**

8. **Redeploy backend:**
   - Tab **Deployments**
   - Click **...** (three dots) ở deployment mới nhất
   - Click **"Redeploy"**
   - Đợi 1-2 phút

✅ **Hoàn thành BƯỚC 4 - Frontend đã live!**

**Checklist:**
- ✅ Frontend deployed thành công
- ✅ Website có thể mở được
- ✅ Backend CLIENT_URL đã update
- ✅ Login hoạt động

---

## 🔐 BƯỚC 5: CẤU HÌNH GOOGLE OAUTH (5 phút)

### 5.1. Truy Cập Google Cloud Console

1. **Mở:** https://console.cloud.google.com
2. Đăng nhập bằng Google Account

### 5.2. Chọn/Tạo Project

Nếu bạn đã có Client ID trong `.env`:

1. Top bar > Click project name dropdown
2. Tìm project có Client ID: `441951236178-...`
3. Click chọn project đó

**Hoặc nếu chưa có:**
1. Top bar > **"Select a project"**
2. Click **"NEW PROJECT"**
3. Project name: `IE207 OAuth`
4. Click **"Create"**

### 5.3. Vào Credentials Page

1. Menu bên trái (☰) > **"APIs & Services"** > **"Credentials"**
2. Hoặc search "Credentials" ở top search bar

### 5.4. Tìm OAuth 2.0 Client ID

1. Trong phần **"OAuth 2.0 Client IDs"**
2. Tìm Client ID với:
   ```
   Client ID: 441951236178-43vdni7tql04el9gjd73b0q7fbojrh6f.apps.googleusercontent.com
   ```
3. Click vào **tên** của Client ID (vd: "Web client 1")

**Hoặc nếu chưa có Client ID:**
1. Click **"+ CREATE CREDENTIALS"** > **"OAuth client ID"**
2. Application type: **"Web application"**
3. Name: `IE207 Web Client`
4. Sau đó làm theo bước 5.5

### 5.5. Configure Authorized Origins

**Trong trang Edit OAuth Client:**

1. Tìm phần **"Authorized JavaScript origins"**

2. Click **"+ ADD URI"**

3. Thêm **frontend URL của bạn:**
   ```
   https://ie207-final.vercel.app
   ```
   (không có trailing slash `/`)

4. **Optional - Thêm localhost để test:**
   - Click **"+ ADD URI"** lần nữa
   - Thêm: `http://localhost:5173`

5. **Tổng cộng bạn sẽ có ít nhất 2 URIs:**
   ```
   https://ie207-final.vercel.app
   http://localhost:5173
   ```

### 5.6. Save Changes

1. Scroll xuống dưới
2. Click **"SAVE"**
3. Đợi vài giây để Google cập nhật

### 5.7. Test Google Login

1. **Quay lại frontend website**
2. **Mở trang login:** `https://ie207-final.vercel.app/auth`
3. **Click nút "Continue with Google"**

**Nếu thành công:**
- ✅ Popup Google login hiện ra
- ✅ Chọn tài khoản Google
- ✅ Website redirect về trang chủ hoặc dashboard
- ✅ Header hiển thị avatar Google

**Nếu lỗi "origin not allowed":**
- Check lại URL trong Authorized origins có đúng không
- Không có typo, trailing slash
- Đợi 1-2 phút để Google sync

### 5.8. Verify

Test cả 2:
- ✅ Login bằng email/password: `admin@craftui.com` / `123456`
- ✅ Login bằng Google

✅ **Hoàn thành BƯỚC 5 - Google OAuth đã cấu hình!**

---

## 🎉 HOÀN THÀNH! WEBSITE ĐÃ LIVE!

### 🌐 URLs Của Bạn:

```
🎨 Frontend: https://ie207-final.vercel.app
🔧 Backend:  https://ie207-backend.vercel.app
📊 Database: MongoDB Atlas Cluster
```

### ✅ Checklist Cuối Cùng:

- ✅ Code đã push lên GitHub
- ✅ MongoDB Atlas đã setup
- ✅ Backend deployed và hoạt động
- ✅ Frontend deployed và hiển thị đẹp
- ✅ Login bằng email/password hoạt động
- ✅ Google OAuth hoạt động
- ✅ Database đã có dữ liệu test

### 🧪 Test Toàn Bộ Chức Năng:

1. **Trang chủ:**
   - Hiển thị banner, featured products
   - Navigation hoạt động

2. **Đăng nhập:**
   - Email: `admin@craftui.com` / `123456`
   - Google OAuth

3. **Khách hàng (Customer):**
   - Login: `khachhang@craftui.com` / `123456`
   - Xem sản phẩm
   - Thêm vào giỏ hàng
   - Checkout

4. **Admin:**
   - Login: `admin@craftui.com`
   - Vào `/admin/dashboard`
   - Quản lý sản phẩm
   - Xem báo cáo

---

## 🔄 Update Code Sau Deploy

Khi bạn sửa code và muốn deploy lại:

```bash
# 1. Save code trong VS Code

# 2. Add và commit
git add .
git commit -m "Update features"

# 3. Push lên GitHub
git push

# 4. Vercel tự động deploy!
```

**Vercel sẽ:**
- Detect GitHub push
- Auto rebuild và redeploy
- Trong 2-3 phút có version mới

---

## 🆘 Troubleshooting (Xử Lý Lỗi)

### Lỗi 1: "Failed to fetch" / "Network Error"

**Nguyên nhân:** Frontend không connect được Backend

**Fix:**
1. Check `VITE_API_URL` trong Vercel frontend settings
2. Phải có `/api` ở cuối: `https://backend.vercel.app/api`
3. Backend phải deploy thành công
4. Test backend trực tiếp: `https://backend.vercel.app/api/products`

### Lỗi 2: "CORS policy blocked"

**Nguyên nhân:** Backend chưa cho phép frontend domain

**Fix:**
1. File `server/index.js` đã có config CORS cho `*.vercel.app`
2. Check Backend `CLIENT_URL` environment variable
3. Redeploy backend sau khi update

### Lỗi 3: "MongoDB connection failed"

**Nguyên nhân:** Connection string sai hoặc IP chưa whitelist

**Fix:**
1. Verify `MONGODB_URI` trong backend environment variables
2. Check username/password có ký tự đặc biệt không (URL encode nếu có)
3. MongoDB Atlas > Network Access > check IP `0.0.0.0/0` active
4. Test connection string bằng MongoDB Compass

### Lỗi 4: "Google OAuth origin not allowed"

**Nguyên nhân:** Frontend URL chưa thêm vào Google Console

**Fix:**
1. Google Cloud Console > Credentials > OAuth Client
2. Authorized JavaScript origins > Add frontend URL
3. Không có trailing slash: ✅ `https://site.com` ❌ `https://site.com/`
4. Đợi 1-2 phút sau khi save

### Lỗi 5: Backend deployment failed

**Nguyên nhân:** Syntax error, missing dependencies, hoặc config sai

**Fix:**
1. Vercel Dashboard > Backend project > Deployments
2. Click failed deployment > View logs
3. Đọc error message (thường ở cuối)
4. Common issues:
   - Root Directory phải là `server`
   - Missing environment variables
   - Syntax error trong code

### Lỗi 6: "Cannot GET /" trên backend

**Nguyên nhân:** Bình thường! Backend là API, không có homepage

**Check:**
- Backend URL + `/api/products` phải có response
- Nếu có `{"success": false}` hoặc `[]` → OK
- Nếu error 500 → check logs

---

## 📚 Resources Hữu Ích

- **Vercel Docs:** https://vercel.com/docs
- **MongoDB Atlas Docs:** https://docs.atlas.mongodb.com
- **Google OAuth Setup:** https://developers.google.com/identity/protocols/oauth2
- **Vite Deployment:** https://vitejs.dev/guide/static-deploy.html

---

## 💡 Tips & Best Practices

1. **Environment Variables:**
   - KHÔNG commit file `.env` lên GitHub
   - Dùng `.env.example` để template
   - Mỗi môi trường có config riêng

2. **Git Workflow:**
   - Commit thường xuyên với message rõ ràng
   - Tạo branch cho features mới
   - Test kỹ trước khi push

3. **Monitoring:**
   - Check Vercel Analytics để xem traffic
   - Monitor MongoDB Atlas usage (free tier: 512MB)
   - Review Vercel deployment logs khi có lỗi

4. **Security:**
   - JWT_SECRET phải random và dài
   - Không share connection string public
   - Enable 2FA cho GitHub, Vercel, MongoDB

5. **Performance:**
   - Vercel Edge Network tự động optimize
   - MongoDB Atlas index tự động cho queries
   - Vite build optimized production bundle

---

## 🎓 Dành Cho Báo Cáo

**Thông tin để ghi vào báo cáo:**

```
Deployment Information:
- Frontend: Vercel (Static Site)
- Backend: Vercel (Serverless Functions)
- Database: MongoDB Atlas (Free Tier)
- Storage: Vercel Edge Network
- CDN: Cloudflare (via Vercel)
- SSL: Automatic HTTPS (Let's Encrypt)

Tech Stack:
- Frontend: React 19 + Vite + TypeScript + TailwindCSS
- Backend: Node.js + Express + MongoDB
- Authentication: JWT + Google OAuth
- Deployment: CI/CD with Vercel GitHub Integration

URLs:
- Production: https://ie207-final.vercel.app
- API: https://ie207-backend.vercel.app/api
- Repository: https://github.com/YOUR-USERNAME/IE207_Final
```

---

## 📸 Screenshot Checklist

**Screenshots cần có cho báo cáo:**

1. GitHub repository homepage
2. MongoDB Atlas cluster dashboard
3. Vercel dashboard với 2 projects (backend + frontend)
4. Website trang chủ
5. Website trang login
6. Admin dashboard
7. Google Cloud Console - OAuth Client
8. Vercel deployment logs (successful)

---

**🎉 CHÚC MỪNG! BẠN ĐÃ DEPLOY THÀNH CÔNG!**

Nếu gặp bất kỳ vấn đề nào, đọc phần Troubleshooting hoặc hỏi tôi nhé! 😊

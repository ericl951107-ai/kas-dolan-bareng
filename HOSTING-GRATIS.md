# 🚀 Panduan Hosting Gratis - Kas Dolan Bareng

Panduan lengkap untuk hosting website ini **100% GRATIS** menggunakan Vercel dan Railway.

---

## 🎯 Platform yang Digunakan

- **Frontend**: [Vercel](https://vercel.com) - GRATIS selamanya
- **Backend + Database**: [Railway](https://railway.app) - $5 credit gratis/bulan (cukup untuk 1 project kecil)

**Total Biaya: Rp 0,-** ✨

---

## 📋 Yang Dibutuhkan

- ✅ Akun GitHub (gratis) - [github.com](https://github.com)
- ✅ Akun Vercel (gratis) - [vercel.com](https://vercel.com)
- ✅ Akun Railway (gratis) - [railway.app](https://railway.app)
- ✅ Email aktif
- ⏱️ Waktu: 15-20 menit

---

## 🔧 STEP 1: Persiapan Repository

### 1.1 Install Git (jika belum ada)

```bash
# Cek apakah Git sudah terinstall
git --version

# Jika belum, install:
# macOS:
brew install git

# Atau download: https://git-scm.com/downloads
```

### 1.2 Initialize Git & Push ke GitHub

```bash
# Masuk ke folder proyek
cd /Users/otr1/Downloads/kas-dolan-bareng

# Initialize Git
git init

# Add semua files
git add .

# Commit
git commit -m "Initial commit - Kas Dolan Bareng"

# Buat repository di GitHub:
# 1. Buka https://github.com/new
# 2. Repository name: kas-dolan-bareng
# 3. Public atau Private (pilih Public)
# 4. JANGAN centang "Initialize with README"
# 5. Click "Create repository"

# Connect ke GitHub (ganti YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/kas-dolan-bareng.git
git branch -M main
git push -u origin main
```

**✅ Checkpoint**: Repository sudah ada di GitHub!

---

## 🚂 STEP 2: Deploy Backend ke Railway

### 2.1 Persiapan Backend untuk Railway

Buat file baru di folder backend:

```bash
# File: backend/.gitignore
node_modules/
.env
*.log
```

```bash
# File: backend/Procfile (tidak wajib, tapi recommended)
web: npm start
```

### 2.2 Update backend/package.json

Pastikan ada script `start`:

```json
{
  "scripts": {
    "start": "node src/server.js",
    "dev": "nodemon src/server.js"
  }
}
```

### 2.3 Deploy ke Railway

**A. Signup Railway**
1. Buka [railway.app](https://railway.app)
2. Click **"Start a New Project"** atau **"Login with GitHub"**
3. Authorize Railway untuk akses GitHub

**B. Create New Project**
1. Dashboard → Click **"New Project"**
2. Pilih **"Deploy from GitHub repo"**
3. Pilih repository **`kas-dolan-bareng`**
4. Railway akan detect Node.js project

**C. Setup Database**
1. Di project dashboard, click **"New"** → **"Database"** → **"Add PostgreSQL"**
2. Database akan otomatis dibuat
3. Click database → Tab **"Variables"**
4. Copy **`DATABASE_URL`** (akan dipakai nanti)

**D. Configure Backend Service**
1. Click service backend Anda
2. Tab **"Settings"**:
   - **Root Directory**: `backend`
   - **Build Command**: (kosongkan, default npm install)
   - **Start Command**: `npm start`
   
3. Tab **"Variables"** → Add variables:
   ```
   NODE_ENV=production
   PORT=5000
   DATABASE_URL=[paste dari PostgreSQL]
   JWT_SECRET=[generate random string panjang]
   FRONTEND_URL=https://kas-dolan-bareng.vercel.app
   ```

   **Generate JWT_SECRET**:
   ```bash
   # Run di terminal local:
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
   # Copy hasilnya
   ```

4. Click **"Deploy"**

**E. Run Database Migration**
1. Di Railway, click PostgreSQL database
2. Tab **"Connect"** → Copy **"PostgreSQL Connection URL"**
3. Di terminal local:
   ```bash
   # Install psql jika belum ada (macOS):
   brew install postgresql
   
   # Run migration (ganti URL dengan punya Anda):
   psql [POSTGRESQL_URL] < /Users/otr1/Downloads/kas-dolan-bareng/backend/database/schema.sql
   ```

**F. Get Backend URL**
1. Click backend service
2. Tab **"Settings"** → **"Networking"**
3. Click **"Generate Domain"**
4. Copy URL (contoh: `kas-dolan-bareng-production.up.railway.app`)

**✅ Checkpoint**: Backend sudah live di Railway! Test dengan:
```bash
curl https://your-backend-url.up.railway.app/health
```

---

## ⚡ STEP 3: Deploy Frontend ke Vercel

### 3.1 Update Frontend Configuration

**A. Update API URL**

Buat file baru `frontend/.env.production`:

```env
VITE_API_URL=https://your-backend-url.up.railway.app/api
```

Ganti `your-backend-url.up.railway.app` dengan URL Railway Anda.

**B. Commit perubahan**
```bash
git add .
git commit -m "Add production config"
git push origin main
```

### 3.2 Deploy ke Vercel

**A. Signup Vercel**
1. Buka [vercel.com](https://vercel.com)
2. Click **"Sign Up"** → **"Continue with GitHub"**
3. Authorize Vercel

**B. Import Project**
1. Dashboard → Click **"Add New..."** → **"Project"**
2. Import repository **`kas-dolan-bareng`**
3. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   
4. **Environment Variables** → Add:
   ```
   Name: VITE_API_URL
   Value: https://your-backend-url.up.railway.app/api
   ```

5. Click **"Deploy"**

**C. Wait for Deployment** (2-3 menit)

**D. Get Your Website URL**
- Setelah deploy selesai, Vercel akan kasih URL
- Contoh: `https://kas-dolan-bareng.vercel.app`

**✅ Checkpoint**: Website sudah live! Buka URL dan test login!

---

## 🔧 STEP 4: Update CORS di Backend

Karena frontend sudah punya URL production, update CORS:

### 4.1 Update backend/src/server.js

Edit file ini di local, lalu push ke GitHub:

```javascript
// Update bagian cors:
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}))
```

### 4.2 Push Update

```bash
git add .
git commit -m "Update CORS for production"
git push origin main
```

Railway akan auto-deploy perubahan (tunggu 2-3 menit).

---

## 🎉 SELESAI! Website Sudah Live!

### 🌐 URL Website Anda:
- **Frontend**: `https://kas-dolan-bareng.vercel.app` (atau custom domain Vercel)
- **Backend API**: `https://your-backend.up.railway.app`

### 🔐 Login:
- Email: `admin@kasdolan.com`
- Password: `admin123`

**⚠️ PENTING**: Ganti password default setelah login!

---

## 📱 Custom Domain (OPSIONAL)

### Untuk Frontend (Vercel)

Jika punya domain sendiri (misal: `kasku.com`):

1. Vercel Dashboard → Project Settings → **Domains**
2. Add domain: `kasku.com` atau `kas.kasku.com`
3. Update DNS di domain provider:
   ```
   Type: CNAME
   Name: @ (untuk root) atau kas (untuk subdomain)
   Value: cname.vercel-dns.com
   ```
4. Wait 5-10 menit untuk propagasi DNS

### Untuk Backend (Railway)

1. Railway → Backend Service → **Settings** → **Networking**
2. **Custom Domain** → Add: `api.kasku.com`
3. Update DNS:
   ```
   Type: CNAME
   Name: api
   Value: [Railway provided CNAME]
   ```

---

## 🔄 Auto-Deploy (CI/CD)

Sudah otomatis! Setiap kali push ke GitHub:
- ✅ Railway auto-deploy backend
- ✅ Vercel auto-deploy frontend

```bash
# Make changes
git add .
git commit -m "Update feature"
git push origin main

# Tunggu 2-3 menit, website otomatis update!
```

---

## 📊 Monitoring

### Railway Dashboard
- Logs: Real-time logs backend & database
- Metrics: CPU, RAM, Network usage
- Database: Query performance

### Vercel Dashboard
- Analytics: Page views, visitors
- Logs: Build logs dan function logs
- Performance: Core Web Vitals

---

## 💰 Biaya & Limits

### Vercel (GRATIS Selamanya)
- ✅ Unlimited deployments
- ✅ 100GB bandwidth/bulan
- ✅ 100 builds/hari
- ✅ SSL Certificate gratis
- ✅ Custom domain gratis

### Railway (FREE TIER)
- ✅ $5 credit gratis/bulan
- ✅ Cukup untuk 1 hobby project
- ✅ 500MB database PostgreSQL
- ✅ Estimasi usage: $3-5/bulan
- ⚠️ Jika habis, bisa upgrade $5/bulan

**Jika traffic tinggi**: Upgrade Railway ke $5/bulan (masih sangat murah!)

---

## 🛡️ Security Checklist

Setelah deploy, pastikan:

- [ ] Ganti password default admin
- [ ] JWT_SECRET di Railway aman (random & panjang)
- [ ] Environment variables tidak di-commit ke Git
- [ ] Database backup diatur (Railway auto-backup)
- [ ] HTTPS enabled (otomatis di Vercel & Railway)
- [ ] CORS dikonfigurasi dengan benar

---

## 🐛 Troubleshooting

### Frontend tidak bisa akses API (CORS Error)

**Solusi**:
1. Cek `FRONTEND_URL` di Railway environment variables
2. Format: `https://your-app.vercel.app` (no trailing slash)
3. Redeploy backend di Railway

### Database connection failed

**Solusi**:
1. Copy `DATABASE_URL` dari Railway PostgreSQL
2. Paste ke backend environment variables
3. Pastikan format: `postgresql://user:pass@host:port/db`

### 500 Server Error

**Solusi**:
1. Railway → Backend service → **Logs**
2. Lihat error message
3. Biasanya: missing environment variable atau database issue

### Build failed di Vercel

**Solusi**:
1. Vercel → Deployment → **Logs**
2. Lihat error message
3. Biasanya: wrong directory atau missing dependencies
4. Pastikan Root Directory = `frontend`

---

## 📞 Butuh Bantuan?

1. **Check Logs**:
   - Vercel: Dashboard → Deployment → Logs
   - Railway: Dashboard → Service → Logs

2. **Test API**:
   ```bash
   # Health check
   curl https://your-backend.up.railway.app/health
   
   # Login test
   curl -X POST https://your-backend.up.railway.app/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"admin@kasdolan.com","password":"admin123"}'
   ```

3. **Community**:
   - Railway Discord: [discord.gg/railway](https://discord.gg/railway)
   - Vercel Discord: [vercel.com/discord](https://vercel.com/discord)

---

## 🎓 Video Tutorial (Jika Butuh Visual)

### Railway:
- [Railway Quick Start](https://docs.railway.app/getting-started)
- [Deploy Node.js](https://docs.railway.app/guides/nodejs)

### Vercel:
- [Deploy React App](https://vercel.com/guides/deploying-react-with-vercel)
- [Environment Variables](https://vercel.com/docs/environment-variables)

---

## ✅ Checklist Deploy

### Sebelum Deploy:
- [ ] Repository sudah di GitHub
- [ ] File `.env` tidak di-commit (ada di `.gitignore`)
- [ ] Backend `package.json` ada script `start`

### Railway:
- [ ] Project created
- [ ] PostgreSQL database added
- [ ] Environment variables set
- [ ] Database migration run
- [ ] Backend deployed & URL copied

### Vercel:
- [ ] Project imported
- [ ] Root directory = `frontend`
- [ ] Environment variable `VITE_API_URL` set
- [ ] Deployed successfully

### Final:
- [ ] Website bisa diakses
- [ ] Login berhasil
- [ ] Dashboard muncul data
- [ ] API calls berhasil (no CORS error)
- [ ] Password default diganti

---

## 🎉 Selamat!

Website **Kas Dolan Bareng** Anda sekarang sudah **LIVE** dan bisa diakses dari mana saja! 🚀

Share link ke teman-teman:
```
https://your-app.vercel.app
```

---

**Need help? Email: support@kasdolanbareng.com**

**Jangan lupa ⭐ star repository di GitHub jika bermanfaat!**

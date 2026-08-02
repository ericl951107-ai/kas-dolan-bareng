# 🔐 Panduan Environment Variables

Dokumen ini menjelaskan semua environment variables yang digunakan dalam proyek.

---

## 📁 File Locations

```
kas-dolan-bareng/
├── backend/.env          ← Backend environment variables
└── frontend/.env         ← Frontend environment variables (optional)
```

---

## 🔧 Backend Environment Variables

### Lokasi: `backend/.env`

```env
# ============================================
# SERVER CONFIGURATION
# ============================================
PORT=5000
NODE_ENV=development

# ============================================
# DATABASE CONFIGURATION
# ============================================
# Format: postgresql://username:password@host:port/database
# Example: postgresql://postgres:mypassword@localhost:5432/kas_dolan_bareng

DATABASE_URL=postgresql://postgres:password@localhost:5432/kas_dolan_bareng

# ============================================
# JWT AUTHENTICATION
# ============================================
# PENTING: Ganti dengan random string yang sangat panjang dan aman!
# Generate: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

JWT_SECRET=change-this-to-very-long-secure-random-string-min-64-characters
JWT_EXPIRE=7d

# ============================================
# CLOUDINARY (OPTIONAL - untuk upload gambar)
# ============================================
# Daftar gratis di: https://cloudinary.com
# Dashboard → Account Details → API Keys

CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=your-api-secret-here

# ============================================
# MIDTRANS (OPTIONAL - untuk payment gateway)
# ============================================
# Daftar di: https://midtrans.com
# Dashboard → Settings → Access Keys

MIDTRANS_SERVER_KEY=your-server-key
MIDTRANS_CLIENT_KEY=your-client-key
MIDTRANS_IS_PRODUCTION=false

# ============================================
# EMAIL NOTIFICATION (OPTIONAL - future feature)
# ============================================
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# ============================================
# FRONTEND URL (untuk CORS)
# ============================================
FRONTEND_URL=http://localhost:3000
```

---

## 🎨 Frontend Environment Variables

### Lokasi: `frontend/.env`

```env
# ============================================
# API CONFIGURATION
# ============================================
# Development: http://localhost:5000/api
# Production: https://your-api-domain.com/api

VITE_API_URL=http://localhost:5000/api

# ============================================
# APP CONFIGURATION (OPTIONAL)
# ============================================
VITE_APP_NAME=Kas Dolan Bareng
VITE_APP_VERSION=1.0.0
```

---

## 📝 Penjelasan Detail

### PORT
- **Default**: `5000`
- **Deskripsi**: Port untuk backend server
- **Tips**: Ganti jika port 5000 sudah digunakan

### NODE_ENV
- **Values**: `development`, `production`, `test`
- **Default**: `development`
- **Deskripsi**: Environment mode
- **Tips**: 
  - `development`: Untuk local development (error detail muncul)
  - `production`: Untuk production (error tersembunyi)

### DATABASE_URL
- **Format**: `postgresql://username:password@host:port/database`
- **Deskripsi**: Connection string PostgreSQL
- **Contoh**:
  ```
  Local: postgresql://postgres:mypass@localhost:5432/kas_dolan_bareng
  Railway: postgresql://user:pass@server.railway.app:5432/railway
  Heroku: postgres://user:pass@server.amazonaws.com:5432/dbname
  ```
- **Tips**: 
  - Ganti `password` dengan password PostgreSQL Anda
  - Untuk production, gunakan connection string dari hosting provider

### JWT_SECRET
- **PENTING**: Harus diganti dengan random string yang panjang!
- **Minimum**: 64 karakter
- **Generate**:
  ```bash
  # Node.js
  node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
  
  # OpenSSL
  openssl rand -hex 64
  
  # Online (kurang aman)
  https://randomkeygen.com/
  ```
- **⚠️ Warning**: Jangan commit JWT_SECRET ke Git!

### JWT_EXPIRE
- **Format**: `7d`, `24h`, `30m`
- **Default**: `7d` (7 hari)
- **Deskripsi**: Durasi token valid
- **Tips**: 
  - Development: `30d` (1 bulan)
  - Production: `7d` atau `1d` (lebih aman)

### CLOUDINARY_*
- **Optional**: Ya (tapi recommended)
- **Untuk**: Upload gambar bukti pembayaran
- **Gratis**: 10GB storage, 25 credits/month
- **Setup**:
  1. Daftar di [cloudinary.com](https://cloudinary.com)
  2. Dashboard → Account Details
  3. Copy Cloud Name, API Key, API Secret
- **Alternative**: Simpan file lokal di folder `uploads/`

### MIDTRANS_*
- **Optional**: Ya
- **Untuk**: Payment gateway real (QRIS, transfer, e-wallet)
- **Setup**:
  1. Daftar di [midtrans.com](https://midtrans.com)
  2. Verifikasi akun (KTP, NPWP)
  3. Dashboard → Settings → Access Keys
  4. Copy Server Key dan Client Key
- **Tips**: 
  - Gunakan Sandbox mode untuk testing
  - `IS_PRODUCTION=false` untuk development

### FRONTEND_URL
- **Deskripsi**: URL frontend untuk CORS
- **Development**: `http://localhost:3000`
- **Production**: `https://your-domain.com`
- **Tips**: Update saat deploy ke production

---

## 🔒 Security Best Practices

### ✅ DO's
✅ Generate random JWT_SECRET yang panjang (min 64 char)
✅ Gunakan `.env` file (tidak di-commit ke Git)
✅ Gunakan environment variables di hosting (Vercel, Railway)
✅ Rotate secrets secara berkala (6-12 bulan)
✅ Gunakan different secrets untuk dev dan production
✅ Backup `.env` file di tempat aman (password manager)

### ❌ DON'Ts
❌ Jangan commit `.env` ke Git
❌ Jangan share `.env` di public
❌ Jangan gunakan default/weak secrets
❌ Jangan hardcode credentials di code
❌ Jangan simpan secrets di frontend code
❌ Jangan gunakan production secrets di development

---

## 🌍 Environment Setup per Platform

### Local Development

**Backend `.env`:**
```env
PORT=5000
NODE_ENV=development
DATABASE_URL=postgresql://postgres:password@localhost:5432/kas_dolan_bareng
JWT_SECRET=dev-secret-change-in-production-min-64-chars-xxxxxxxxxxxxxxxxxx
JWT_EXPIRE=30d
FRONTEND_URL=http://localhost:3000
```

**Frontend `.env`:**
```env
VITE_API_URL=http://localhost:5000/api
```

---

### Railway Production

**Backend Environment Variables** (di Railway dashboard):
```
NODE_ENV=production
DATABASE_URL=[Auto-filled by Railway PostgreSQL]
JWT_SECRET=[Your secure production secret]
JWT_EXPIRE=7d
FRONTEND_URL=https://your-app.vercel.app
CLOUDINARY_CLOUD_NAME=[Your cloudinary]
CLOUDINARY_API_KEY=[Your key]
CLOUDINARY_API_SECRET=[Your secret]
```

**Frontend `.env.production`:**
```env
VITE_API_URL=https://your-api.up.railway.app/api
```

---

### Vercel (Frontend Only)

Di Vercel dashboard → Settings → Environment Variables:
```
VITE_API_URL=https://your-api.up.railway.app/api
```

---

### Render Production

**Backend Environment Variables** (di Render dashboard):
```
NODE_ENV=production
DATABASE_URL=[Copy from Render PostgreSQL]
JWT_SECRET=[Your secure secret]
JWT_EXPIRE=7d
FRONTEND_URL=https://your-app.vercel.app
```

---

## 🧪 Testing Different Environments

### Check Current Environment

```javascript
// Backend
console.log('Environment:', process.env.NODE_ENV)
console.log('Database:', process.env.DATABASE_URL)

// Frontend
console.log('API URL:', import.meta.env.VITE_API_URL)
```

### Override for Testing

```bash
# Run dengan environment berbeda
NODE_ENV=production npm start

# Run dengan port berbeda
PORT=5001 npm start

# Multiple overrides
PORT=5001 NODE_ENV=test npm start
```

---

## 🔄 Migration Between Environments

### From Development to Production

1. **Generate Production Secrets**
```bash
# JWT Secret
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

2. **Update Environment Variables**
- Railway/Render: Dashboard → Environment Variables
- Vercel: Settings → Environment Variables

3. **Update Frontend API URL**
```env
VITE_API_URL=https://your-production-api.com/api
```

4. **Redeploy**
```bash
git push origin main  # Auto-deploy via CI/CD
```

---

## 📋 Environment Checklist

### Before First Run
- [ ] Copy `.env.example` to `.env`
- [ ] Update `DATABASE_URL` dengan credentials PostgreSQL
- [ ] Generate dan set `JWT_SECRET` yang aman
- [ ] (Optional) Setup Cloudinary credentials
- [ ] Test connection ke database
- [ ] Test API dengan Postman/cURL

### Before Production Deploy
- [ ] Generate production `JWT_SECRET` (berbeda dari dev)
- [ ] Set `NODE_ENV=production`
- [ ] Setup production database URL
- [ ] Update `FRONTEND_URL` ke production URL
- [ ] Setup monitoring & logging
- [ ] Enable SSL/HTTPS
- [ ] Test semua endpoints
- [ ] Backup production `.env`

---

## 🆘 Troubleshooting

### Error: "Database connection failed"
**Solusi:**
1. Cek PostgreSQL service running
2. Verify `DATABASE_URL` format correct
3. Test connection: `psql [DATABASE_URL]`
4. Check firewall/network rules

### Error: "JWT malformed"
**Solusi:**
1. Cek `JWT_SECRET` sama di semua services
2. Clear browser localStorage
3. Re-login untuk get new token

### Error: "CORS blocked"
**Solusi:**
1. Cek `FRONTEND_URL` di backend `.env`
2. Update CORS config di `server.js`
3. Verify frontend URL match exactly (no trailing slash)

### Error: "Cloudinary upload failed"
**Solusi:**
1. Verify Cloudinary credentials
2. Check internet connection
3. Verify file size < 5MB
4. Check Cloudinary quota/limits

---

## 📚 Resources

- [PostgreSQL Connection Strings](https://www.postgresql.org/docs/current/libpq-connect.html#LIBPQ-CONNSTRING)
- [JWT Best Practices](https://jwt.io/introduction)
- [Cloudinary Documentation](https://cloudinary.com/documentation)
- [Midtrans Documentation](https://docs.midtrans.com/)
- [Vite Env Variables](https://vitejs.dev/guide/env-and-mode.html)

---

**⚠️ Remember**: 
- Never commit `.env` files
- Use different secrets for dev and prod
- Rotate secrets regularly
- Backup your environment configs

---

**Need help?** Check [FAQ.md](FAQ.md) or open an issue!

# 🚀 Panduan Deployment

Panduan untuk deploy website "Kas Dolan Bareng" ke production.

## 📋 Pilihan Platform

### Recommended Setup
- **Frontend**: Vercel (Gratis, cepat, CI/CD otomatis)
- **Backend**: Railway atau Render (Gratis dengan database PostgreSQL)
- **Database**: PostgreSQL di Railway/Render atau Supabase

---

## 🎯 Deploy ke Vercel + Railway

### 1. Deploy Backend ke Railway

**a. Persiapan**
```bash
cd backend
git init
git add .
git commit -m "Initial commit"
```

**b. Deploy**
1. Buka [railway.app](https://railway.app)
2. Login dengan GitHub
3. Click "New Project" → "Deploy from GitHub repo"
4. Pilih repository Anda
5. Railway akan otomatis detect Node.js

**c. Setup Database**
1. Di dashboard Railway, click "New" → "Database" → "PostgreSQL"
2. Database akan otomatis dibuat
3. Copy `DATABASE_URL` dari tab Variables

**d. Set Environment Variables**
Di Railway dashboard, tambahkan variables:
```
NODE_ENV=production
PORT=5000
JWT_SECRET=your-production-secret-key-very-long-and-secure
JWT_EXPIRE=7d
CLOUDINARY_CLOUD_NAME=your-cloudinary-name
CLOUDINARY_API_KEY=your-cloudinary-key
CLOUDINARY_API_SECRET=your-cloudinary-secret
```

**e. Run Database Migration**
Di Railway dashboard:
1. Buka tab "PostgreSQL"
2. Click "Connect" → Copy connection URL
3. Di local terminal:
```bash
psql YOUR_DATABASE_URL < backend/database/schema.sql
```

**f. Get Backend URL**
- Railway akan provide URL seperti: `https://your-app.up.railway.app`
- Simpan URL ini untuk frontend

### 2. Deploy Frontend ke Vercel

**a. Update API URL**
```bash
cd frontend
# Edit .env atau buat .env.production
echo "VITE_API_URL=https://your-backend-url.up.railway.app/api" > .env.production
```

**b. Deploy**
```bash
npm install -g vercel
vercel
```

Follow prompts:
- Set up and deploy? **Y**
- Which scope? Pilih account Anda
- Link to existing project? **N**
- Project name? `kas-dolan-bareng`
- Directory? `./`
- Override settings? **N**

**c. Production Deploy**
```bash
vercel --prod
```

Your site will be live at: `https://kas-dolan-bareng.vercel.app`

---

## 🔧 Deploy ke Render (Alternative)

### Backend + Database di Render

**1. Create Web Service**
1. Buka [render.com](https://render.com)
2. New → Web Service → Connect repository
3. Settings:
   - Name: `kas-dolan-bareng-api`
   - Environment: `Node`
   - Build Command: `cd backend && npm install`
   - Start Command: `cd backend && npm start`

**2. Create PostgreSQL Database**
1. New → PostgreSQL
2. Name: `kas-dolan-bareng-db`
3. Copy "Internal Database URL"

**3. Environment Variables**
Di Web Service dashboard, tambahkan:
```
DATABASE_URL=[Paste Internal Database URL]
NODE_ENV=production
JWT_SECRET=your-secure-secret
```

**4. Run Migration**
```bash
# Connect dan run schema
psql [Database External URL] < backend/database/schema.sql
```

---

## 🌐 Custom Domain

### Vercel (Frontend)
1. Di Vercel dashboard → Settings → Domains
2. Add domain: `kas.yourdomain.com`
3. Update DNS di domain provider:
   ```
   Type: CNAME
   Name: kas
   Value: cname.vercel-dns.com
   ```

### Railway (Backend)
1. Di Railway dashboard → Settings
2. Generate Domain atau Add Custom Domain
3. Update DNS:
   ```
   Type: CNAME
   Name: api.kas
   Value: your-app.up.railway.app
   ```

---

## 🔒 Security Checklist

Sebelum production, pastikan:

- [ ] Ganti semua password default
- [ ] JWT_SECRET menggunakan random string panjang (min 64 karakter)
- [ ] Environment variables tidak di-commit ke Git
- [ ] CORS dikonfigurasi hanya untuk domain production
- [ ] Rate limiting diaktifkan (tambahkan express-rate-limit)
- [ ] HTTPS digunakan (otomatis di Vercel/Railway)
- [ ] Database backup diatur
- [ ] Error messages tidak expose sensitive info

**Update CORS di backend/src/server.js**:
```javascript
app.use(cors({
  origin: process.env.FRONTEND_URL || 'https://kas-dolan-bareng.vercel.app',
  credentials: true
}))
```

---

## 📊 Monitoring & Logs

### Railway
- Logs: Dashboard → Logs tab
- Metrics: Dashboard → Metrics tab

### Vercel
- Logs: Dashboard → Deployment → Logs
- Analytics: Dashboard → Analytics

### Database Backup
```bash
# Backup PostgreSQL
pg_dump -h hostname -U username -d kas_dolan_bareng > backup.sql

# Restore
psql -h hostname -U username -d kas_dolan_bareng < backup.sql
```

---

## 🔄 CI/CD

### Auto Deploy on Git Push

**Railway**:
- Otomatis deploy setiap push ke main branch

**Vercel**:
- Otomatis deploy setiap push ke main branch
- Preview deployment untuk setiap pull request

**Setup Git Hooks** (Optional):
```bash
# .git/hooks/pre-push
#!/bin/bash
npm test
npm run lint
```

---

## 💰 Estimasi Biaya

### Free Tier (Recommended untuk mulai)
- **Vercel**: Unlimited deployments, 100GB bandwidth/bulan
- **Railway**: $5 credit gratis/bulan (cukup untuk hobby project)
- **Render**: 750 jam gratis/bulan
- **Supabase**: 500MB database gratis

### Paid (Jika traffic tinggi)
- **Vercel Pro**: $20/bulan
- **Railway**: Pay as you go (~$5-20/bulan)
- **Render**: $7/bulan (web service) + $7/bulan (database)

---

## 🧪 Testing Production

```bash
# Test backend
curl https://your-backend-url.up.railway.app/health

# Test API
curl https://your-backend-url.up.railway.app/api/dashboard/stats \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 📱 Progressive Web App (PWA)

Untuk membuat website bisa di-install di HP:

**1. Tambahkan manifest.json di frontend**:
```json
{
  "name": "Kas Dolan Bareng",
  "short_name": "Kas Dolan",
  "description": "Kelola kas bersama dengan transparan",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#22c55e",
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

**2. Register service worker di frontend/src/main.jsx**:
```javascript
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js')
}
```

---

## 🆘 Troubleshooting Production

**Build Failed**:
- Check Node.js version (use v18)
- Clear cache: `npm cache clean --force`
- Check environment variables

**Database Connection Error**:
- Verify DATABASE_URL is correct
- Check database is running
- Verify firewall/network rules

**CORS Error**:
- Update CORS origin in backend
- Check VITE_API_URL in frontend

**500 Server Error**:
- Check logs di platform dashboard
- Verify all environment variables
- Check database migrations

---

## 📞 Production Support

Jika ada masalah:
1. Check logs di dashboard platform
2. Verify environment variables
3. Test API endpoints dengan cURL
4. Check database connection
5. Review error messages

---

Selamat! Website Anda sekarang live di internet! 🎉

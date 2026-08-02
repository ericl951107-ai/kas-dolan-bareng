# 💰 Kas Dolan Bareng

Website modern untuk mengelola uang kas bersama dengan transparansi penuh. Semua anggota dapat melihat pemasukan, pengeluaran, dan saldo secara real-time.

## ✨ Fitur Utama

### 🏠 Dashboard
- Menampilkan total saldo, anggota, pemasukan, dan pengeluaran
- Grafik tren kas 7 hari terakhir
- Riwayat transaksi terbaru
- Visualisasi data dengan chart interaktif

### 👥 Manajemen Anggota
- Profil lengkap setiap anggota (foto, nama, email, total kontribusi)
- Status pembayaran real-time
- Riwayat pembayaran per anggota
- Papan peringkat anggota paling aktif

### 💳 Sistem Pembayaran
- Bebas tentukan nominal iuran
- Generate QR Code otomatis untuk pembayaran
- Integrasi pembayaran digital (QRIS)
- Transfer bank manual dengan panduan
- Riwayat pembayaran detail

### 📊 Transparansi Total
- Semua transaksi tercatat dan dapat dilihat semua anggota
- Nama penyetor, nominal, tanggal, dan tujuan penggunaan
- Log aktivitas lengkap
- Export laporan ke PDF dan Excel

### 💸 Pengeluaran
- Admin dapat mencatat pengeluaran
- Upload bukti pembayaran
- Kategorisasi pengeluaran
- Keterangan detail untuk setiap pengeluaran

### 📈 Statistik & Analisis
- Grafik tren bulanan
- Diagram kategori pengeluaran
- Pertumbuhan saldo dari waktu ke waktu
- Visualisasi data yang mudah dipahami

### 🎨 Fitur Tambahan
- Mode gelap dan terang
- Notifikasi pembayaran
- Berbagi link undangan grup
- Export laporan PDF & Excel
- Desain responsif untuk mobile dan desktop
- Animasi smooth dan modern

## 🛠️ Teknologi yang Digunakan

### Frontend
- **React 18** - Library UI modern
- **Tailwind CSS** - Styling utility-first
- **React Router** - Navigation
- **Recharts** - Visualisasi data
- **Axios** - HTTP client
- **Zustand** - State management
- **React Hot Toast** - Notifikasi
- **QRCode.react** - Generate QR Code
- **jsPDF & XLSX** - Export laporan

### Backend
- **Node.js & Express** - Server framework
- **PostgreSQL** - Database
- **JWT** - Authentication
- **Bcrypt** - Password hashing
- **Multer** - File upload
- **Cloudinary** - Cloud storage untuk gambar
- **QRCode** - Generate QR payment

## 📦 Instalasi

### Prerequisites
- Node.js (v18 atau lebih baru)
- PostgreSQL (v14 atau lebih baru)
- npm atau yarn

### 1. Clone Repository
```bash
cd /Users/otr1/Downloads/kas-dolan-bareng
```

### 2. Setup Database

**Install PostgreSQL** (jika belum ada):
```bash
# macOS with Homebrew
brew install postgresql
brew services start postgresql

# Atau download dari https://www.postgresql.org/download/
```

**Buat Database**:
```bash
# Masuk ke PostgreSQL
psql postgres

# Jalankan schema SQL
\i backend/database/schema.sql

# Keluar
\q
```

### 3. Setup Backend

```bash
cd backend

# Install dependencies
npm install

# Copy file environment
cp .env.example .env

# Edit .env dan sesuaikan konfigurasi
nano .env
```

**Konfigurasi .env**:
```env
PORT=5000
NODE_ENV=development

# Database URL (sesuaikan username dan password)
DATABASE_URL=postgresql://username:password@localhost:5432/kas_dolan_bareng

# JWT Secret (ganti dengan random string)
JWT_SECRET=your-very-secure-random-secret-key-change-this
JWT_EXPIRE=7d

# Cloudinary (opsional untuk upload gambar)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

**Jalankan Backend**:
```bash
npm run dev
```

Backend akan berjalan di `http://localhost:5000`

### 4. Setup Frontend

```bash
cd ../frontend

# Install dependencies
npm install

# Buat file .env (opsional)
echo "VITE_API_URL=http://localhost:5000/api" > .env

# Jalankan development server
npm run dev
```

Frontend akan berjalan di `http://localhost:3000`

## 🚀 Menjalankan Aplikasi

### Development Mode

**Terminal 1 - Backend**:
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend**:
```bash
cd frontend
npm run dev
```

Buka browser dan akses `http://localhost:3000`

### Production Build

**Build Frontend**:
```bash
cd frontend
npm run build
```

**Run Backend Production**:
```bash
cd backend
npm start
```

## 👤 Akun Default

Setelah setup database, gunakan akun berikut untuk login:

**Admin**:
- Email: `admin@kasdolan.com`
- Password: `admin123`

**Member**:
- Email: `budi@email.com`
- Password: `admin123`

> ⚠️ **Penting**: Ganti password default setelah login pertama!

## 📱 Struktur Peran

1. **Administrator**
   - Akses penuh ke semua fitur
   - Dapat mengelola anggota
   - Dapat menambah/hapus pengeluaran
   
2. **Bendahara**
   - Verifikasi pembayaran
   - Kelola pengeluaran
   - Akses laporan lengkap

3. **Anggota**
   - Lihat dashboard dan statistik
   - Bayar iuran
   - Lihat riwayat pribadi

## 🎨 Desain & UI

Website ini menggunakan desain modern minimalis dengan:
- Warna utama: Hijau (#22c55e)
- Mode gelap/terang
- Animasi smooth
- Layout responsif untuk semua device
- Icon dari React Icons (Feather Icons)

## 🔒 Keamanan

- Password di-hash menggunakan bcrypt
- Autentikasi dengan JWT tokens
- Protected routes di frontend dan backend
- Validasi input di semua endpoint
- File upload yang aman

## 📝 API Endpoints

### Authentication
- `POST /api/auth/register` - Daftar akun baru
- `POST /api/auth/login` - Login

### Dashboard
- `GET /api/dashboard/stats` - Statistik umum
- `GET /api/dashboard/chart-data` - Data chart

### Members
- `GET /api/members` - Daftar semua anggota
- `GET /api/members/:id` - Detail anggota

### Transactions
- `GET /api/transactions` - Semua transaksi
- `GET /api/transactions/recent` - Transaksi terbaru
- `GET /api/transactions/member/:id` - Transaksi per anggota

### Payments
- `POST /api/payments/generate-qr` - Generate QR pembayaran
- `POST /api/payments/direct` - Pembayaran langsung

### Expenses
- `GET /api/expenses` - Semua pengeluaran
- `POST /api/expenses` - Tambah pengeluaran (Admin only)
- `DELETE /api/expenses/:id` - Hapus pengeluaran (Admin only)

### Statistics
- `GET /api/statistics` - Data statistik lengkap

### Users
- `GET /api/users/profile` - Profil user
- `PUT /api/users/profile` - Update profil

> Semua endpoint (kecuali auth) memerlukan header `Authorization: Bearer <token>`

## 🌐 Deployment

### Deploy ke Vercel (Frontend)

```bash
cd frontend
npm install -g vercel
vercel
```

### Deploy ke Heroku (Backend + Database)

```bash
cd backend

# Login ke Heroku
heroku login

# Buat app
heroku create kas-dolan-bareng-api

# Tambah PostgreSQL
heroku addons:create heroku-postgresql:hobby-dev

# Deploy
git add .
git commit -m "Deploy to Heroku"
git push heroku main

# Set environment variables
heroku config:set JWT_SECRET=your-secret-key
heroku config:set NODE_ENV=production
```

## 🤝 Kontribusi

Proyek ini dibuat untuk memudahkan pengelolaan kas bersama. Silakan fork dan kembangkan sesuai kebutuhan!

## 📄 Lisensi

MIT License - Bebas digunakan untuk keperluan pribadi maupun komersial.

## 💡 Tips Penggunaan

1. **Backup Data**: Export laporan secara berkala
2. **Verifikasi Pembayaran**: Pastikan bendahara verifikasi semua pembayaran
3. **Transparansi**: Gunakan fitur komentar untuk diskusi terbuka
4. **Notifikasi**: Aktifkan notifikasi untuk update real-time
5. **Mobile**: Website fully responsive, bisa diakses dari HP

## 🐛 Troubleshooting

**Database Connection Error**:
```bash
# Cek PostgreSQL service
brew services list
brew services restart postgresql
```

**Port Already in Use**:
```bash
# Ganti port di .env file
PORT=5001
```

**Module Not Found**:
```bash
# Hapus node_modules dan reinstall
rm -rf node_modules package-lock.json
npm install
```

## 📞 Support

Jika ada pertanyaan atau issue, silakan buka issue di repository ini.

---

Dibuat dengan ❤️ menggunakan React, Node.js, dan PostgreSQL

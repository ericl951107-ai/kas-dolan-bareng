# 🚀 Panduan Instalasi Cepat

## Persiapan

Pastikan sudah terinstall:
- Node.js v18+ ([Download](https://nodejs.org/))
- PostgreSQL v14+ ([Download](https://www.postgresql.org/download/))

## Langkah-langkah

### 1. Setup Database

```bash
# Buka PostgreSQL
psql postgres

# Jalankan perintah ini satu per satu:
CREATE DATABASE kas_dolan_bareng;
\c kas_dolan_bareng
\i backend/database/schema.sql
\q
```

### 2. Setup Backend

```bash
cd backend
npm install
cp .env.example .env
```

Edit file `.env`:
```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/kas_dolan_bareng
JWT_SECRET=ganti-dengan-random-string-panjang-dan-aman
```

Ganti `password` dengan password PostgreSQL Anda.

### 3. Setup Frontend

```bash
cd ../frontend
npm install
```

### 4. Jalankan Aplikasi

**Opsi 1 - Run dari root (Recommended)**:
```bash
cd ..
npm install
npm run dev
```

**Opsi 2 - Run manual di 2 terminal**:

Terminal 1:
```bash
cd backend
npm run dev
```

Terminal 2:
```bash
cd frontend
npm run dev
```

### 5. Buka Browser

Buka `http://localhost:3000` dan login dengan:
- Email: `admin@kasdolan.com`
- Password: `admin123`

## ✅ Selesai!

Website sudah siap digunakan. Jangan lupa ganti password default!

## ⚠️ Troubleshooting

**Error: database "kas_dolan_bareng" does not exist**
```bash
createdb kas_dolan_bareng
```

**Error: Port 5000 already in use**
- Edit `backend/.env` dan ganti `PORT=5001`

**Error: connection refused PostgreSQL**
```bash
# macOS
brew services start postgresql

# Linux
sudo service postgresql start

# Windows
# Start PostgreSQL service dari Services
```

## 📱 Akses dari HP

1. Cek IP komputer: `ipconfig getifaddr en0` (macOS) atau `ipconfig` (Windows)
2. Buka di HP: `http://IP-ANDA:3000`
3. Pastikan HP dan komputer dalam jaringan yang sama

## 🔄 Update

```bash
git pull
npm run install:all
```

## 📚 Dokumentasi Lengkap

Lihat [README.md](README.md) untuk dokumentasi lengkap.

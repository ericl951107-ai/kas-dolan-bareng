# ⚡ Quick Start Guide - Kas Dolan Bareng

Panduan super cepat untuk mulai menggunakan aplikasi dalam 5 menit!

## 📋 Prasyarat (1 menit)

Pastikan terinstall:
- ✅ Node.js v18+ ([Download](https://nodejs.org/))
- ✅ PostgreSQL v14+ ([Download](https://www.postgresql.org/download/))

## 🚀 Setup (3 menit)

### 1. Database
```bash
# Buat database
createdb kas_dolan_bareng

# Import schema
psql kas_dolan_bareng < backend/database/schema.sql
```

### 2. Backend
```bash
cd backend
npm install
cp .env.example .env
# Edit .env: ganti DATABASE_URL dan JWT_SECRET
npm run dev
```

### 3. Frontend
```bash
# Terminal baru
cd frontend
npm install
npm run dev
```

## 🎉 Selesai!

Buka browser: `http://localhost:3000`

Login dengan:
- **Email**: admin@kasdolan.com
- **Password**: admin123

## 📚 Dokumentasi Lengkap

- [README.md](README.md) - Overview lengkap
- [INSTALL.md](INSTALL.md) - Panduan instalasi detail
- [API.md](API.md) - Dokumentasi API
- [DEPLOYMENT.md](DEPLOYMENT.md) - Deploy ke production
- [FAQ.md](FAQ.md) - Pertanyaan umum
- [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md) - Struktur proyek

## ⚠️ Catatan Penting

1. **Ganti password default** setelah login pertama
2. **Backup database** secara berkala
3. **Jangan commit file `.env`** ke Git

## 🆘 Butuh Bantuan?

Lihat [FAQ.md](FAQ.md) atau buka issue di GitHub.

---

**Happy Coding! 🎉**

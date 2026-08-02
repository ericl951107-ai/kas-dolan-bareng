# ❓ FAQ - Pertanyaan yang Sering Ditanyakan

## 🚀 Instalasi & Setup

### Q: Bagaimana cara install website ini?
**A:** Ikuti langkah di [INSTALL.md](INSTALL.md). Secara ringkas:
1. Install Node.js dan PostgreSQL
2. Setup database dengan menjalankan `schema.sql`
3. Install dependencies frontend dan backend
4. Jalankan kedua server

### Q: Apakah harus pakai PostgreSQL? Bisa pakai MySQL?
**A:** Saat ini hanya support PostgreSQL. Untuk MySQL, perlu modifikasi query di semua routes karena syntax berbeda.

### Q: Berapa minimum spesifikasi komputer untuk development?
**A:**
- RAM: Minimum 4GB, Recommended 8GB
- Storage: 2GB free space
- OS: Windows 10/11, macOS, atau Linux

### Q: Error "PORT already in use", solusinya?
**A:** 
```bash
# Ganti port di backend/.env
PORT=5001

# Atau matikan proses yang menggunakan port 5000
# macOS/Linux:
lsof -ti:5000 | xargs kill -9

# Windows:
netstat -ano | findstr :5000
taskkill /PID [PID_NUMBER] /F
```

---

## 💰 Fitur Pembayaran

### Q: Apakah QR Code yang di-generate bisa langsung digunakan untuk bayar?
**A:** QR Code saat ini hanya untuk tracking internal. Untuk integrasi pembayaran real (GoPay, OVO, Dana), perlu:
1. Daftar ke payment gateway (contoh: Midtrans)
2. Dapatkan API key
3. Integrate dengan backend (sudah ada placeholder di code)

### Q: Bagaimana cara setup Midtrans untuk pembayaran real?
**A:**
1. Daftar di [Midtrans](https://midtrans.com)
2. Dapatkan Server Key dan Client Key
3. Tambahkan di backend `.env`:
```env
MIDTRANS_SERVER_KEY=your-key
MIDTRANS_CLIENT_KEY=your-key
```
4. Uncomment Midtrans code di `backend/src/routes/payments.js`

### Q: Apakah bisa bayar dengan QRIS sungguhan?
**A:** Ya, setelah integrasi dengan payment gateway seperti Midtrans yang support QRIS.

### Q: Bagaimana cara verifikasi pembayaran manual?
**A:** 
1. Login sebagai Admin atau Bendahara
2. Buka halaman "Riwayat"
3. Cari pembayaran dengan status "pending"
4. Klik tombol "Verifikasi" (fitur ini bisa ditambahkan)

---

## 👥 Manajemen Anggota

### Q: Bagaimana cara menambah anggota baru?
**A:** 
1. Anggota daftar sendiri via halaman Register
2. Atau admin bisa invite via link di halaman Settings

### Q: Bagaimana cara mengubah role anggota (member ke admin)?
**A:** Saat ini via database langsung:
```sql
UPDATE users SET role = 'admin' WHERE email = 'email@example.com';
```
Atau tambahkan UI untuk admin di halaman Settings.

### Q: Apakah anggota bisa keluar dari grup?
**A:** Bisa ditambahkan fitur "Leave Group" di halaman Profile. Saat ini bisa via:
```sql
DELETE FROM users WHERE id = [user_id];
```

### Q: Berapa maksimal jumlah anggota?
**A:** Tidak ada limit di code. Tergantung kapasitas database dan server.

---

## 💸 Pengeluaran

### Q: Siapa saja yang bisa menambah pengeluaran?
**A:** Hanya user dengan role `admin` atau `bendahara`.

### Q: Bagaimana cara upload bukti pembayaran?
**A:** 
1. Login sebagai Admin/Bendahara
2. Halaman Pengeluaran → Tambah Pengeluaran
3. Upload gambar (max 5MB)
4. Gambar akan disimpan di Cloudinary

### Q: Apakah wajib upload bukti pembayaran?
**A:** Tidak wajib, tapi sangat direkomendasikan untuk transparansi.

### Q: Bagaimana kalau tidak ada akun Cloudinary?
**A:** Bisa:
1. Daftar gratis di [Cloudinary](https://cloudinary.com) (10GB free)
2. Atau modifikasi code untuk simpan lokal di folder `uploads/`

---

## 📊 Laporan & Statistik

### Q: Format apa saja yang support untuk export laporan?
**A:** Saat ini support PDF dan Excel (XLSX).

### Q: Apakah bisa auto-send laporan bulanan via email?
**A:** Belum ada fitur ini. Bisa ditambahkan dengan:
1. Install nodemailer
2. Setup cron job untuk kirim otomatis tiap bulan

### Q: Bagaimana cara custom periode laporan?
**A:** Di halaman History, gunakan filter "Dari Tanggal" dan "Sampai Tanggal".

---

## 🔒 Keamanan

### Q: Apakah data pembayaran aman?
**A:** Ya:
- Password di-hash dengan bcrypt
- JWT untuk authentication
- HTTPS untuk production (Vercel/Railway otomatis)
- No sensitive data di frontend localStorage (hanya token)

### Q: Bagaimana cara ganti password?
**A:** Tambahkan endpoint di backend:
```javascript
// backend/src/routes/users.js
router.put('/password', auth, async (req, res) => {
  const { oldPassword, newPassword } = req.body
  // Verify old password
  // Hash new password
  // Update database
})
```

### Q: Apakah admin bisa lihat password user lain?
**A:** Tidak. Password di-hash dan tidak bisa di-decrypt.

---

## 🎨 Kustomisasi

### Q: Bagaimana cara ganti warna tema dari hijau ke warna lain?
**A:** Edit `frontend/tailwind.config.js`:
```javascript
colors: {
  primary: {
    500: '#your-color', // Ganti semua nilai primary
    600: '#your-darker-color',
  }
}
```

### Q: Bagaimana cara ganti logo?
**A:** 
1. Replace file di `frontend/public/logo.png`
2. Update di `Sidebar.jsx` component

### Q: Apakah bisa multi-bahasa (Indonesia & Inggris)?
**A:** Saat ini hanya Bahasa Indonesia. Untuk multi-bahasa:
1. Install `react-i18next`
2. Buat file translations
3. Wrap semua text dengan `t('key')`

---

## 📱 Mobile & PWA

### Q: Apakah ada aplikasi mobile?
**A:** Website ini responsive dan bisa diakses via mobile browser. Untuk native app bisa pakai React Native.

### Q: Bagaimana cara install sebagai PWA di HP?
**A:** 
1. Buka website di browser (Chrome/Safari)
2. Click menu → "Add to Home Screen"
3. Icon app akan muncul di home screen

### Q: Apakah bisa offline?
**A:** Tidak, karena perlu koneksi internet untuk sinkronisasi data real-time.

---

## 🚀 Deployment

### Q: Platform mana yang paling murah untuk hosting?
**A:** 
- **Gratis**: Railway ($5 credit/bulan), Render (750 jam/bulan), Vercel
- **Berbayar**: Railway (~$5-10/bulan), Heroku ($7/bulan)

### Q: Apakah bisa hosting di shared hosting biasa?
**A:** Tidak recommended. Butuh Node.js support dan PostgreSQL. Lebih baik pakai cloud platform.

### Q: Berapa biaya per bulan kalau sudah production?
**A:** Estimasi:
- Small group (<50 users): $0-10/bulan (free tier)
- Medium (100-500 users): $20-50/bulan
- Large (1000+ users): $100+/bulan

### Q: Bagaimana cara backup data?
**A:**
```bash
# Backup database
pg_dump database_url > backup-$(date +%Y%m%d).sql

# Restore
psql database_url < backup-20260802.sql
```

Setup auto-backup harian via cron job.

---

## 🐛 Troubleshooting

### Q: Error "Cannot find module ..."?
**A:**
```bash
# Delete and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Q: Frontend bisa akses tapi API error 401?
**A:** 
- Cek token di localStorage (browser DevTools → Application → Local Storage)
- Cek JWT_SECRET di backend `.env` sama dengan saat generate token
- Cek expiry token (default 7 hari)

### Q: Database connection error?
**A:**
1. Cek PostgreSQL service running
2. Cek DATABASE_URL correct di `.env`
3. Test connection: `psql [DATABASE_URL]`

### Q: Upload gambar error?
**A:**
- Cek Cloudinary credentials di `.env`
- Cek file size (max 5MB)
- Cek file type (only images)

---

## 💡 Best Practices

### Q: Seberapa sering harus backup data?
**A:** Recommended:
- Harian: Auto backup via cron
- Mingguan: Manual backup download
- Bulanan: Archive backup ke external storage

### Q: Kapan harus ganti JWT_SECRET?
**A:** 
- Saat initial setup (ganti dari default)
- Jika ada security breach
- Setiap 6-12 bulan (optional)

### Q: Tips untuk keamanan data?
**A:**
1. Gunakan HTTPS (otomatis di Vercel/Railway)
2. Update dependencies rutin
3. Backup data berkala
4. Monitor logs untuk suspicious activity
5. Rate limit API endpoints (anti brute force)

---

## 📞 Masih Ada Pertanyaan?

- **Buka issue** di GitHub repository
- **Email**: support@kasdolanbareng.com
- **Dokumentasi**: Baca [README.md](README.md)

---

**Last Updated**: Agustus 2026

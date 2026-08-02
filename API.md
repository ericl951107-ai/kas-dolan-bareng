# 📡 API Documentation

Base URL: `http://localhost:5000/api`

## Authentication

Semua endpoint (kecuali `/auth/register` dan `/auth/login`) memerlukan JWT token di header:
```
Authorization: Bearer YOUR_JWT_TOKEN
```

---

## 🔐 Auth Endpoints

### Register
```http
POST /auth/register
Content-Type: application/json

{
  "name": "Ahmad Fauzan",
  "nickname": "Fauzan",
  "email": "fauzan@email.com",
  "password": "password123"
}
```

**Response**:
```json
{
  "message": "Pendaftaran berhasil",
  "user": {
    "id": 1,
    "name": "Ahmad Fauzan",
    "nickname": "Fauzan",
    "email": "fauzan@email.com",
    "role": "member",
    "joined_at": "2026-08-02T12:00:00.000Z"
  }
}
```

### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "fauzan@email.com",
  "password": "password123"
}
```

**Response**:
```json
{
  "message": "Login berhasil",
  "user": {
    "id": 1,
    "name": "Ahmad Fauzan",
    "nickname": "Fauzan",
    "email": "fauzan@email.com",
    "role": "member",
    "avatar": null,
    "joinedAt": "2026-08-02T12:00:00.000Z",
    "totalContribution": 0
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

## 📊 Dashboard Endpoints

### Get Stats
```http
GET /dashboard/stats
Authorization: Bearer TOKEN
```

**Response**:
```json
{
  "totalBalance": 5000000,
  "totalIncome": 8000000,
  "totalExpenses": 3000000,
  "totalMembers": 15
}
```

### Get Chart Data
```http
GET /dashboard/chart-data
Authorization: Bearer TOKEN
```

**Response**:
```json
[
  {
    "date": "26/07",
    "income": 500000,
    "expenses": 200000
  },
  {
    "date": "27/07",
    "income": 750000,
    "expenses": 350000
  }
]
```

---

## 👥 Members Endpoints

### Get All Members
```http
GET /members
Authorization: Bearer TOKEN
```

**Response**:
```json
[
  {
    "id": 1,
    "name": "Ahmad Fauzan",
    "nickname": "Fauzan",
    "email": "fauzan@email.com",
    "avatar": null,
    "role": "member",
    "total_contribution": 500000,
    "payment_status": "paid",
    "joined_at": "2026-08-02T12:00:00.000Z"
  }
]
```

### Get Member Detail
```http
GET /members/:id
Authorization: Bearer TOKEN
```

---

## 💰 Transactions Endpoints

### Get All Transactions
```http
GET /transactions?type=all&startDate=2026-01-01&endDate=2026-12-31
Authorization: Bearer TOKEN
```

**Query Parameters**:
- `type`: `all`, `income`, `expense`
- `startDate`: Format YYYY-MM-DD
- `endDate`: Format YYYY-MM-DD

**Response**:
```json
[
  {
    "id": 1,
    "user_id": 1,
    "type": "income",
    "amount": 100000,
    "description": "Iuran Kas Bulan Agustus",
    "category": null,
    "method": "qris",
    "receipt": null,
    "status": "completed",
    "created_at": "2026-08-02T12:00:00.000Z",
    "user_name": "Ahmad Fauzan",
    "nickname": "Fauzan"
  }
]
```

### Get Recent Transactions
```http
GET /transactions/recent?limit=10
Authorization: Bearer TOKEN
```

### Get Member Transactions
```http
GET /transactions/member/:id
Authorization: Bearer TOKEN
```

---

## 💳 Payments Endpoints

### Generate QR Code
```http
POST /payments/generate-qr
Authorization: Bearer TOKEN
Content-Type: application/json

{
  "amount": 100000,
  "description": "Iuran Kas Bulan Agustus"
}
```

**Response**:
```json
{
  "transactionId": "KAS17228640001",
  "qrString": "{\"transactionId\":\"KAS17228640001\",\"amount\":100000,\"merchantId\":\"KAS_DOLAN_BARENG\",\"userId\":1}",
  "qrCodeUrl": "data:image/png;base64,iVBORw0KGgoAAAANS...",
  "expiresIn": 3600
}
```

### Direct Payment
```http
POST /payments/direct
Authorization: Bearer TOKEN
Content-Type: application/json

{
  "amount": 100000,
  "description": "Iuran Kas Bulan Agustus",
  "method": "transfer"
}
```

**Response**:
```json
{
  "message": "Pembayaran berhasil",
  "transaction": {
    "id": 1,
    "user_id": 1,
    "type": "income",
    "amount": 100000,
    "description": "Iuran Kas Bulan Agustus",
    "method": "transfer",
    "status": "completed"
  }
}
```

---

## 💸 Expenses Endpoints

### Get All Expenses
```http
GET /expenses
Authorization: Bearer TOKEN
```

**Response**:
```json
[
  {
    "id": 1,
    "title": "Beli Snack untuk Acara",
    "amount": 250000,
    "category": "Konsumsi",
    "description": "Snack untuk 50 orang",
    "receipt": "https://cloudinary.com/...",
    "created_by": 1,
    "created_by_name": "Admin",
    "created_at": "2026-08-02T12:00:00.000Z"
  }
]
```

### Create Expense (Admin Only)
```http
POST /expenses
Authorization: Bearer TOKEN
Content-Type: multipart/form-data

title: Beli Snack untuk Acara
amount: 250000
category: Konsumsi
description: Snack untuk 50 orang
receipt: [FILE]
```

### Delete Expense (Admin Only)
```http
DELETE /expenses/:id
Authorization: Bearer TOKEN
```

---

## 📈 Statistics Endpoints

### Get Statistics
```http
GET /statistics
Authorization: Bearer TOKEN
```

**Response**:
```json
{
  "monthlyTrend": [
    {
      "month": "Jul 2026",
      "income": 5000000,
      "expenses": 2000000
    }
  ],
  "expensesByCategory": [
    {
      "name": "Konsumsi",
      "value": 1500000
    },
    {
      "name": "Transport",
      "value": 500000
    }
  ],
  "balanceGrowth": [
    {
      "date": "01/08",
      "balance": 3000000
    },
    {
      "date": "02/08",
      "balance": 3500000
    }
  ]
}
```

---

## 👤 Users Endpoints

### Get Profile
```http
GET /users/profile
Authorization: Bearer TOKEN
```

**Response**:
```json
{
  "id": 1,
  "name": "Ahmad Fauzan",
  "nickname": "Fauzan",
  "email": "fauzan@email.com",
  "avatar": null,
  "role": "member",
  "total_contribution": 500000,
  "payment_status": "paid",
  "joined_at": "2026-08-02T12:00:00.000Z"
}
```

### Update Profile
```http
PUT /users/profile
Authorization: Bearer TOKEN
Content-Type: application/json

{
  "name": "Ahmad Fauzan Updated",
  "nickname": "Fauzan"
}
```

---

## 🔒 Roles & Permissions

### Admin
- Akses semua endpoint
- Dapat menambah/hapus pengeluaran
- Dapat mengubah role user lain

### Bendahara
- Dapat mengelola pengeluaran
- Dapat verifikasi pembayaran
- Akses laporan lengkap

### Member
- Dapat melihat dashboard dan statistik
- Dapat melakukan pembayaran
- Dapat melihat profil sendiri

---

## ⚠️ Error Responses

### 400 Bad Request
```json
{
  "message": "Email sudah terdaftar"
}
```

### 401 Unauthorized
```json
{
  "message": "Unauthorized - Please authenticate"
}
```

### 403 Forbidden
```json
{
  "message": "Forbidden - Admin access required"
}
```

### 404 Not Found
```json
{
  "message": "Anggota tidak ditemukan"
}
```

### 500 Server Error
```json
{
  "message": "Server error"
}
```

---

## 🧪 Testing dengan cURL

### Register
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","nickname":"Test","email":"test@email.com","password":"test123"}'
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@email.com","password":"test123"}'
```

### Get Stats (dengan token)
```bash
curl http://localhost:5000/api/dashboard/stats \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## 📚 Postman Collection

Import collection ini ke Postman untuk testing yang lebih mudah:

```json
{
  "info": {
    "name": "Kas Dolan Bareng API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Auth",
      "item": [
        {
          "name": "Register",
          "request": {
            "method": "POST",
            "url": "{{base_url}}/auth/register",
            "body": {
              "mode": "raw",
              "raw": "{\n  \"name\": \"Test User\",\n  \"nickname\": \"Test\",\n  \"email\": \"test@email.com\",\n  \"password\": \"test123\"\n}"
            }
          }
        },
        {
          "name": "Login",
          "request": {
            "method": "POST",
            "url": "{{base_url}}/auth/login",
            "body": {
              "mode": "raw",
              "raw": "{\n  \"email\": \"test@email.com\",\n  \"password\": \"test123\"\n}"
            }
          }
        }
      ]
    }
  ],
  "variable": [
    {
      "key": "base_url",
      "value": "http://localhost:5000/api"
    }
  ]
}
```

Simpan sebagai `kas-dolan-bareng.postman_collection.json` dan import ke Postman.

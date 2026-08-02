# 📁 Struktur Proyek Kas Dolan Bareng

## 🗂️ Root Directory
```
kas-dolan-bareng/
├── frontend/              # React Frontend Application
├── backend/               # Node.js Backend API
├── README.md              # Dokumentasi utama
├── INSTALL.md             # Panduan instalasi cepat
├── API.md                 # Dokumentasi API
├── DEPLOYMENT.md          # Panduan deployment
├── PROJECT_STRUCTURE.md   # Struktur proyek (file ini)
├── LICENSE                # MIT License
├── .gitignore            # Git ignore rules
└── package.json          # Root package untuk run semua services
```

## 🎨 Frontend Structure

```
frontend/
├── public/               # Static assets
├── src/
│   ├── components/       # Reusable components
│   │   ├── Layout.jsx
│   │   ├── Header.jsx
│   │   ├── Sidebar.jsx
│   │   └── ProtectedRoute.jsx
│   │
│   ├── pages/           # Page components
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   ├── Dashboard.jsx
│   │   ├── Members.jsx
│   │   ├── MemberDetail.jsx
│   │   ├── Payment.jsx
│   │   ├── History.jsx
│   │   ├── Expenses.jsx
│   │   ├── Statistics.jsx
│   │   ├── Settings.jsx
│   │   └── Profile.jsx
│   │
│   ├── store/           # State management (Zustand)
│   │   ├── authStore.js
│   │   └── themeStore.js
│   │
│   ├── utils/           # Utility functions
│   │   ├── api.js       # Axios configuration
│   │   └── formatters.js # Currency & date formatters
│   │
│   ├── App.jsx          # Main App component
│   ├── main.jsx         # Entry point
│   └── index.css        # Global styles (Tailwind)
│
├── index.html           # HTML template
├── package.json         # Frontend dependencies
├── vite.config.js       # Vite configuration
├── tailwind.config.js   # Tailwind CSS configuration
├── postcss.config.js    # PostCSS configuration
└── .env.example         # Environment variables example
```

## ⚙️ Backend Structure

```
backend/
├── src/
│   ├── config/          # Configuration files
│   │   ├── database.js  # PostgreSQL connection
│   │   └── cloudinary.js # Cloudinary config
│   │
│   ├── middleware/      # Express middleware
│   │   ├── auth.js      # JWT authentication
│   │   └── upload.js    # File upload (Multer)
│   │
│   ├── routes/          # API routes
│   │   ├── auth.js      # Authentication routes
│   │   ├── users.js     # User management
│   │   ├── members.js   # Members endpoints
│   │   ├── transactions.js # Transactions
│   │   ├── payments.js  # Payment processing
│   │   ├── expenses.js  # Expenses management
│   │   ├── dashboard.js # Dashboard stats
│   │   └── statistics.js # Statistics data
│   │
│   └── server.js        # Express server entry point
│
├── database/
│   └── schema.sql       # PostgreSQL database schema
│
├── package.json         # Backend dependencies
└── .env.example         # Environment variables example
```

## 📊 Database Schema

### Tables
- **users** - Menyimpan data anggota
- **transactions** - Menyimpan semua transaksi (pemasukan & pengeluaran)
- **expenses** - Detail pengeluaran dengan bukti
- **payment_qr_codes** - QR code untuk pembayaran
- **activity_logs** - Log aktivitas untuk audit trail

### Relationships
```
users (1) ──< (N) transactions
users (1) ──< (N) expenses
users (1) ──< (N) payment_qr_codes
users (1) ──< (N) activity_logs
```

## 🔌 API Endpoints Overview

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login

### Dashboard
- `GET /api/dashboard/stats` - Get overview statistics
- `GET /api/dashboard/chart-data` - Get chart data

### Members
- `GET /api/members` - List all members
- `GET /api/members/:id` - Get member detail

### Transactions
- `GET /api/transactions` - Get all transactions with filters
- `GET /api/transactions/recent` - Get recent transactions
- `GET /api/transactions/member/:id` - Get member transactions

### Payments
- `POST /api/payments/generate-qr` - Generate QR code
- `POST /api/payments/direct` - Direct payment

### Expenses
- `GET /api/expenses` - Get all expenses
- `POST /api/expenses` - Create expense (Admin only)
- `DELETE /api/expenses/:id` - Delete expense (Admin only)

### Statistics
- `GET /api/statistics` - Get comprehensive statistics

### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile

## 🎯 Key Features Implementation

### 1. Authentication & Authorization
- **File**: `backend/src/middleware/auth.js`
- JWT-based authentication
- Role-based access control (Admin, Bendahara, Member)

### 2. Real-time Dashboard
- **Files**: `frontend/src/pages/Dashboard.jsx`, `backend/src/routes/dashboard.js`
- Live statistics
- Interactive charts with Recharts

### 3. Payment System
- **Files**: `frontend/src/pages/Payment.jsx`, `backend/src/routes/payments.js`
- QR Code generation
- Multiple payment methods (QRIS, Transfer)

### 4. Transaction History
- **Files**: `frontend/src/pages/History.jsx`, `backend/src/routes/transactions.js`
- Filterable transaction list
- Export to PDF & Excel

### 5. Expenses Management
- **Files**: `frontend/src/pages/Expenses.jsx`, `backend/src/routes/expenses.js`
- Receipt upload to Cloudinary
- Category-based expenses

### 6. Statistics & Analytics
- **Files**: `frontend/src/pages/Statistics.jsx`, `backend/src/routes/statistics.js`
- Monthly trends
- Category breakdown
- Balance growth visualization

### 7. Theme System
- **File**: `frontend/src/store/themeStore.js`
- Dark/Light mode toggle
- Persisted in localStorage

### 8. State Management
- **Files**: `frontend/src/store/*.js`
- Zustand for global state
- Persistent auth state

## 📦 Dependencies

### Frontend Core
- **react** - UI library
- **react-router-dom** - Routing
- **tailwindcss** - Styling
- **vite** - Build tool

### Frontend Features
- **recharts** - Charts & graphs
- **axios** - HTTP client
- **zustand** - State management
- **react-hot-toast** - Notifications
- **qrcode.react** - QR generation
- **jspdf** - PDF export
- **xlsx** - Excel export

### Backend Core
- **express** - Web framework
- **pg** - PostgreSQL client
- **jsonwebtoken** - JWT auth
- **bcryptjs** - Password hashing

### Backend Features
- **multer** - File upload
- **cloudinary** - Cloud storage
- **qrcode** - QR generation
- **cors** - CORS handling
- **dotenv** - Environment config

## 🔐 Security Features

1. **Password Security**
   - Bcrypt hashing (10 rounds)
   - No plain text passwords stored

2. **JWT Authentication**
   - Secure token generation
   - Token expiration (7 days default)
   - Authorization middleware

3. **File Upload Security**
   - File type validation
   - File size limits (5MB)
   - Secure cloud storage

4. **API Security**
   - Protected routes
   - Role-based access control
   - Input validation

## 🚀 Development Workflow

### Local Development
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

### Production Build
```bash
# Build frontend
cd frontend
npm run build

# Start backend
cd backend
npm start
```

## 📈 Scalability Considerations

### Current Setup (Good for < 1000 users)
- Single server deployment
- Direct PostgreSQL connection
- Session-based auth

### Future Enhancements (for growth)
- Redis for caching & session management
- Load balancer for horizontal scaling
- CDN for static assets
- Message queue for async tasks
- Microservices architecture

## 🧪 Testing Strategy

### Recommended Tests
```
frontend/src/__tests__/
├── components/
│   ├── Layout.test.jsx
│   └── Header.test.jsx
├── pages/
│   ├── Dashboard.test.jsx
│   └── Payment.test.jsx
└── utils/
    └── formatters.test.js

backend/src/__tests__/
├── routes/
│   ├── auth.test.js
│   └── payments.test.js
└── middleware/
    └── auth.test.js
```

### Testing Tools
- **Frontend**: Vitest + React Testing Library
- **Backend**: Jest + Supertest
- **E2E**: Playwright or Cypress

## 📚 Additional Resources

- **Main Docs**: [README.md](README.md)
- **Quick Start**: [INSTALL.md](INSTALL.md)
- **API Reference**: [API.md](API.md)
- **Deployment**: [DEPLOYMENT.md](DEPLOYMENT.md)

## 🤝 Contributing

Untuk berkontribusi:
1. Fork repository
2. Buat branch fitur (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push ke branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📞 Support

Jika ada pertanyaan:
- Buka issue di GitHub
- Email: support@kasdolanbareng.com
- Dokumentasi: Lihat README.md

---

**Dibuat dengan ❤️ menggunakan React, Node.js, PostgreSQL, dan Tailwind CSS**

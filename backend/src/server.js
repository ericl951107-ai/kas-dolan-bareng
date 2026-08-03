import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import { runMigrations } from './config/database.js'
import authRoutes from './routes/auth.js'
import userRoutes from './routes/users.js'
import memberRoutes from './routes/members.js'
import transactionRoutes from './routes/transactions.js'
import paymentRoutes from './routes/payments.js'
import expenseRoutes from './routes/expenses.js'
import dashboardRoutes from './routes/dashboard.js'
import statisticsRoutes from './routes/statistics.js'
import settingsRoutes from './routes/settings.js'
import targetsRoutes from './routes/targets.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}))

app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))
app.use('/uploads', express.static(path.join(__dirname, '../uploads')))

app.use('/api/auth', authRoutes)
app.use('/api/users', userRoutes)
app.use('/api/members', memberRoutes)
app.use('/api/transactions', transactionRoutes)
app.use('/api/payments', paymentRoutes)
app.use('/api/expenses', expenseRoutes)
app.use('/api/dashboard', dashboardRoutes)
app.use('/api/statistics', statisticsRoutes)
app.use('/api/settings', settingsRoutes)
app.use('/api/targets', targetsRoutes)

app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' })
})

app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error'
  })
})

// Start server and run migrations
app.listen(PORT, async () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`)
  await runMigrations()
})

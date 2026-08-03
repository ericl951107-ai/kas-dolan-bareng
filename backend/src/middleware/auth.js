import jwt from 'jsonwebtoken'
import pool from '../config/database.js'

export const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '')
    if (!token) throw new Error('No token')

    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    
    // Fetch fresh user data from DB to get latest role
    const result = await pool.query(
      'SELECT id, email, role, name, nickname, avatar, is_verified FROM users WHERE id = $1',
      [decoded.id]
    )
    
    if (result.rows.length === 0) throw new Error('User not found')
    
    req.user = result.rows[0]
    next()
  } catch (error) {
    res.status(401).json({ message: 'Tidak terautentikasi' })
  }
}

// Admin only
export const adminOnly = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Hanya admin yang bisa mengakses fitur ini' })
  }
  next()
}

// Admin or Bendahara
export const adminOrBendahara = (req, res, next) => {
  if (req.user.role !== 'admin' && req.user.role !== 'bendahara') {
    return res.status(403).json({ message: 'Hanya admin/bendahara yang bisa mengakses fitur ini' })
  }
  next()
}

// Any authenticated user (member, bendahara, admin)
export const memberAuth = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Tidak terautentikasi' })
  }
  next()
}

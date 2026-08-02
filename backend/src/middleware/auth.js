import jwt from 'jsonwebtoken'

export const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '')

    if (!token) {
      throw new Error()
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = decoded
    next()
  } catch (error) {
    res.status(401).json({ message: 'Unauthorized - Please authenticate' })
  }
}

export const adminOnly = async (req, res, next) => {
  if (req.user.role !== 'admin' && req.user.role !== 'bendahara') {
    return res.status(403).json({ message: 'Forbidden - Admin access required' })
  }
  next()
}

// Admin only middleware
const adminAuth = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Tidak terautentikasi' })
  }
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Akses ditolak. Hanya admin.' })
  }
  next()
}

// Admin or Bendahara middleware
export const adminOrBendaharaAuth = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Tidak terautentikasi' })
  }
  if (req.user.role !== 'admin' && req.user.role !== 'bendahara') {
    return res.status(403).json({ message: 'Akses ditolak. Hanya admin/bendahara.' })
  }
  next()
}

export default adminAuth

const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authMiddleware = async (req, res, next) => {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ error: 'Unauthorized: Token missing' });
  const token = header.split(' ')[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(payload.id);
    if (!user) return res.status(401).json({ error: 'Unauthorized: User not found' });
    if (user.banned) return res.status(403).json({ error: 'Account banned' });
    req.user = { id: user._id, email: user.email, role: user.role, banned: user.banned };
    next();
  } catch (e) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden: Admin access required' });
  }
  next();
};

const requireModeratorOrAdmin = (req, res, next) => {
  if (!req.user) return res.status(401).end();
  const role = req.user.role;
  if (role !== 'admin' && role !== 'moderator') {
    return res.status(403).json({ error: 'Forbidden: Moderator or Admin access required' });
  }
  next();
};

module.exports = { authMiddleware, requireAdmin, requireModeratorOrAdmin };

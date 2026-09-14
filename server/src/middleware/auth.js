const jwt = require('jsonwebtoken');
const { db } = require('../db');

const JWT_SECRET = process.env.JWT_SECRET || 'calories_super_secret_key_2026';

async function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Vui lòng đăng nhập để tiếp tục' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await db.getAsync('SELECT id, username, full_name, created_at FROM users WHERE id = ?', [decoded.userId]);

    if (!user) {
      return res.status(401).json({ error: 'Tài khoản không tồn tại hoặc phiên đăng nhập đã hết hạn' });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Phiên đăng nhập không hợp lệ hoặc đã hết hạn' });
  }
}

module.exports = {
  authenticateToken,
  JWT_SECRET,
};


const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { db } = require('../db');
const { authenticateToken, JWT_SECRET } = require('../middleware/auth');
const { computeFullProfileStats, checkNeedsWeeklyWeightUpdate } = require('../utils/calculator');

const router = express.Router();

// Helper to generate JWT token
function generateToken(userId) {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
}

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const {
      username,
      password,
      full_name,
      gender = 'male',
      age = 25,
      height = 170,
      weight = 65,
      target_weight = 65,
      activity_level = 'moderate',
      goal = 'maintain',
      custom_calorie_target = null,
    } = req.body;

    if (!username || !password || !full_name) {
      return res.status(400).json({ error: 'Vui lòng điền đầy đủ tên đăng nhập, mật khẩu và họ tên' });
    }

    if (username.trim().length < 3) {
      return res.status(400).json({ error: 'Tên đăng nhập phải có ít nhất 3 ký tự' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Mật khẩu phải có ít nhất 6 ký tự' });
    }

    // Check if username already exists
    const existing = await db.getAsync('SELECT id FROM users WHERE LOWER(username) = LOWER(?)', [username.trim()]);
    if (existing) {
      return res.status(409).json({
        error: 'Tài khoản đã tồn tại! Vui lòng đăng nhập với tài khoản này hoặc sử dụng tên đăng nhập khác.',
        exists: true,
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    // Insert user
    const userResult = await db.runAsync(
      'INSERT INTO users (username, password_hash, full_name) VALUES (?, ?, ?)',
      [username.trim(), password_hash, full_name.trim()]
    );
    const userId = userResult.lastID;

    // Insert health profile with initial last_weight_updated_at
    await db.runAsync(
      `INSERT INTO health_profiles 
       (user_id, gender, age, height, weight, target_weight, activity_level, goal, custom_calorie_target, last_weight_updated_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
      [
        userId,
        gender,
        parseInt(age, 10) || 25,
        parseFloat(height) || 170,
        parseFloat(weight) || 65,
        parseFloat(target_weight) || 65,
        activity_level,
        goal,
        custom_calorie_target ? parseFloat(custom_calorie_target) : null,
      ]
    );

    // Log initial weight into weight_history
    const today = new Date().toISOString().split('T')[0];
    await db.runAsync(
      'INSERT INTO weight_history (user_id, weight, date) VALUES (?, ?, ?)',
      [userId, parseFloat(weight) || 65, today]
    );

    // Fetch newly created profile
    const profile = await db.getAsync('SELECT * FROM health_profiles WHERE user_id = ?', [userId]);
    const computedStats = computeFullProfileStats(profile);
    const token = generateToken(userId);

    return res.status(201).json({
      message: 'Đăng ký tài khoản và thiết lập hồ sơ sức khỏe thành công!',
      token,
      user: {
        id: userId,
        username: username.trim(),
        full_name: full_name.trim(),
      },
      profile,
      computedStats,
      needsWeeklyWeightUpdate: false,
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ error: 'Đã xảy ra lỗi máy chủ khi đăng ký tài khoản' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu' });
    }

    const user = await db.getAsync('SELECT * FROM users WHERE LOWER(username) = LOWER(?)', [username.trim()]);
    if (!user) {
      return res.status(404).json({
        error: 'Tài khoản không tồn tại. Nếu bạn chưa có hồ sơ, vui lòng chọn "Đăng ký tài khoản mới".',
        notFound: true,
      });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Mật khẩu không chính xác. Vui lòng thử lại!' });
    }

    // Get health profile
    let profile = await db.getAsync('SELECT * FROM health_profiles WHERE user_id = ?', [user.id]);
    if (!profile) {
      // Auto-create default profile if missing
      await db.runAsync('INSERT INTO health_profiles (user_id) VALUES (?)', [user.id]);
      profile = await db.getAsync('SELECT * FROM health_profiles WHERE user_id = ?', [user.id]);
    }

    const computedStats = computeFullProfileStats(profile);
    const needsWeeklyWeightUpdate = checkNeedsWeeklyWeightUpdate(profile.last_weight_updated_at);
    const token = generateToken(user.id);

    return res.json({
      message: `Chào mừng trở lại, ${user.full_name}!`,
      token,
      user: {
        id: user.id,
        username: user.username,
        full_name: user.full_name,
      },
      profile,
      computedStats,
      needsWeeklyWeightUpdate,
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Đã xảy ra lỗi máy chủ khi đăng nhập' });
  }
});

// GET /api/auth/me
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const profile = await db.getAsync('SELECT * FROM health_profiles WHERE user_id = ?', [req.user.id]);
    const computedStats = profile ? computeFullProfileStats(profile) : null;
    const needsWeeklyWeightUpdate = profile ? checkNeedsWeeklyWeightUpdate(profile.last_weight_updated_at) : false;

    return res.json({
      user: req.user,
      profile,
      computedStats,
      needsWeeklyWeightUpdate,
    });
  } catch (error) {
    console.error('Auth check error:', error);
    return res.status(500).json({ error: 'Không thể tải thông tin tài khoản' });
  }
});

module.exports = router;

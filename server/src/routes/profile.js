const express = require('express');
const { db } = require('../db');
const { authenticateToken } = require('../middleware/auth');
const {
  calculateBMR,
  calculateTDEE,
  calculateTargetCalories,
  calculateBMI,
  calculateMacros,
  calculateRecommendedWater,
  computeFullProfileStats,
  checkNeedsWeeklyWeightUpdate,
} = require('../utils/calculator');

const router = express.Router();

// All profile endpoints require authentication
router.use(authenticateToken);

// GET /api/profile
router.get('/', async (req, res) => {
  try {
    let profile = await db.getAsync('SELECT * FROM health_profiles WHERE user_id = ?', [req.user.id]);
    if (!profile) {
      await db.runAsync('INSERT INTO health_profiles (user_id) VALUES (?)', [req.user.id]);
      profile = await db.getAsync('SELECT * FROM health_profiles WHERE user_id = ?', [req.user.id]);
    }

    const computedStats = computeFullProfileStats(profile);
    const needsWeeklyWeightUpdate = checkNeedsWeeklyWeightUpdate(profile.last_weight_updated_at);

    return res.json({ profile, computedStats, needsWeeklyWeightUpdate });
  } catch (error) {
    console.error('Error getting profile:', error);
    return res.status(500).json({ error: 'Không thể lấy thông tin hồ sơ sức khỏe' });
  }
});

// PUT /api/profile
router.put('/', async (req, res) => {
  try {
    const {
      gender,
      age,
      height,
      weight,
      target_weight,
      activity_level,
      goal,
      custom_calorie_target,
    } = req.body;

    await db.runAsync(
      `UPDATE health_profiles SET 
        gender = COALESCE(?, gender),
        age = COALESCE(?, age),
        height = COALESCE(?, height),
        weight = COALESCE(?, weight),
        target_weight = COALESCE(?, target_weight),
        activity_level = COALESCE(?, activity_level),
        goal = COALESCE(?, goal),
        custom_calorie_target = ?,
        updated_at = CURRENT_TIMESTAMP
       WHERE user_id = ?`,
      [
        gender,
        age ? parseInt(age, 10) : null,
        height ? parseFloat(height) : null,
        weight ? parseFloat(weight) : null,
        target_weight ? parseFloat(target_weight) : null,
        activity_level,
        goal,
        custom_calorie_target !== undefined ? (custom_calorie_target ? parseFloat(custom_calorie_target) : null) : null,
        req.user.id,
      ]
    );

    // If weight was updated, log into weight_history
    if (weight) {
      const today = new Date().toISOString().split('T')[0];
      await db.runAsync('INSERT INTO weight_history (user_id, weight, date) VALUES (?, ?, ?)', [
        req.user.id,
        parseFloat(weight),
        today,
      ]);
    }

    const updatedProfile = await db.getAsync('SELECT * FROM health_profiles WHERE user_id = ?', [req.user.id]);
    const computedStats = computeFullProfileStats(updatedProfile);
    const needsWeeklyWeightUpdate = checkNeedsWeeklyWeightUpdate(updatedProfile.last_weight_updated_at);

    return res.json({
      message: 'Hồ sơ sức khỏe đã được cập nhật thành công!',
      profile: updatedProfile,
      computedStats,
      needsWeeklyWeightUpdate,
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    return res.status(500).json({ error: 'Không thể cập nhật hồ sơ sức khỏe' });
  }
});

// PUT /api/profile/weekly-weight
// Specifically for weekly Monday weight update requirement
router.put('/weekly-weight', async (req, res) => {
  try {
    const { weight } = req.body;
    const w = parseFloat(weight);

    if (isNaN(w) || w < 30 || w > 250) {
      return res.status(400).json({ error: 'Vui lòng nhập cân nặng hợp lệ (30kg - 250kg)' });
    }

    const today = new Date().toISOString().split('T')[0];

    // Update weight & last_weight_updated_at timestamp in health_profiles
    await db.runAsync(
      `UPDATE health_profiles SET 
        weight = ?,
        last_weight_updated_at = CURRENT_TIMESTAMP,
        updated_at = CURRENT_TIMESTAMP
       WHERE user_id = ?`,
      [w, req.user.id]
    );

    // Record into weight_history
    await db.runAsync(
      'INSERT INTO weight_history (user_id, weight, date) VALUES (?, ?, ?)',
      [req.user.id, w, today]
    );

    const updatedProfile = await db.getAsync('SELECT * FROM health_profiles WHERE user_id = ?', [req.user.id]);
    const computedStats = computeFullProfileStats(updatedProfile);

    return res.json({
      message: 'Đã cập nhật cân nặng tuần mới thành công! Các chỉ số calo và TDEE đã được tính toán lại.',
      profile: updatedProfile,
      computedStats,
      needsWeeklyWeightUpdate: false,
    });
  } catch (error) {
    console.error('Error updating weekly weight:', error);
    return res.status(500).json({ error: 'Không thể cập nhật cân nặng tuần mới' });
  }
});

// GET /api/profile/weight-history
router.get('/weight-history', async (req, res) => {
  try {
    const history = await db.allAsync(
      'SELECT * FROM weight_history WHERE user_id = ? ORDER BY id DESC LIMIT 20',
      [req.user.id]
    );
    return res.json({ history });
  } catch (error) {
    console.error('Error fetching weight history:', error);
    return res.status(500).json({ error: 'Không thể tải lịch sử cân nặng' });
  }
});

// POST /api/profile/simulate
// Test different scenarios without saving
router.post('/simulate', (req, res) => {
  try {
    const { gender = 'male', age = 25, height = 170, weight = 65, activity_level = 'moderate', goal = 'maintain' } = req.body;

    const bmr = calculateBMR(gender, weight, height, age);
    const tdee = calculateTDEE(bmr, activity_level);
    const targetCalories = calculateTargetCalories(tdee, goal);
    const bmiInfo = calculateBMI(weight, height);
    const macros = calculateMacros(targetCalories);
    const water = calculateRecommendedWater(weight);

    return res.json({
      simulation: {
        bmr,
        tdee,
        targetCalories,
        bmi: bmiInfo.bmi,
        bmiStatus: bmiInfo.status,
        bmiColor: bmiInfo.color,
        macros,
        water,
      },
    });
  } catch (error) {
    console.error('Simulation error:', error);
    return res.status(500).json({ error: 'Lỗi khi tính toán mô phỏng' });
  }
});

module.exports = router;

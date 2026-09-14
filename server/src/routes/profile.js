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
    return res.json({ profile, computedStats });
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

    const updatedProfile = await db.getAsync('SELECT * FROM health_profiles WHERE user_id = ?', [req.user.id]);
    const computedStats = computeFullProfileStats(updatedProfile);

    return res.json({
      message: 'Hồ sơ sức khỏe đã được cập nhật thành công!',
      profile: updatedProfile,
      computedStats,
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    return res.status(500).json({ error: 'Không thể cập nhật hồ sơ sức khỏe' });
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

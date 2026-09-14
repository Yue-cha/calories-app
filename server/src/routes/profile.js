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

// Helper to compute ISO week number and user-friendly week label
function getWeekDetails(dateStr) {
  const date = new Date(dateStr);
  const target = new Date(date.valueOf());
  const dayNr = (date.getDay() + 6) % 7;
  target.setDate(target.getDate() - dayNr + 3);
  const firstThursday = target.valueOf();
  target.setMonth(0, 1);
  if (target.getDay() !== 4) {
    target.setMonth(0, 1 + ((4 - target.getDay()) + 7) % 7);
  }
  const weekNo = 1 + Math.ceil((firstThursday - target) / 604800000);
  const d = String(date.getDate()).padStart(2, '0');
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const weekLabel = `Tuần ${weekNo} (${d}/${m})`;
  return {
    weekNo,
    weekNumber: weekNo,
    label: weekLabel,
    weekLabel,
    shortLabel: `T${weekNo}`,
    formattedDate: `${d}/${m}/${date.getFullYear()}`,
  };
}

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
// Enhanced for weekly comparison and bar chart visualization
router.get('/weight-history', async (req, res) => {
  try {
    let rawHistory = await db.allAsync(
      'SELECT * FROM weight_history WHERE user_id = ? ORDER BY date ASC, id ASC',
      [req.user.id]
    );

    let profile = await db.getAsync('SELECT * FROM health_profiles WHERE user_id = ?', [req.user.id]);

    // If no records yet, seed with initial profile weight
    if (rawHistory.length === 0 && profile) {
      const today = new Date().toISOString().split('T')[0];
      await db.runAsync(
        'INSERT INTO weight_history (user_id, weight, date) VALUES (?, ?, ?)',
        [req.user.id, profile.weight, today]
      );
      rawHistory = await db.allAsync(
        'SELECT * FROM weight_history WHERE user_id = ? ORDER BY date ASC, id ASC',
        [req.user.id]
      );
    }

    // Process entries with week details and diff compared to previous entry
    const entries = rawHistory.map((item, index) => {
      const weekInfo = getWeekDetails(item.date);
      const prev = index > 0 ? rawHistory[index - 1] : null;
      const diff = prev ? parseFloat((item.weight - prev.weight).toFixed(1)) : 0;

      return {
        id: item.id,
        weight: item.weight,
        date: item.date,
        createdAt: item.created_at,
        diff,
        weekInfo,
      };
    });

    const initialWeight = entries.length > 0 ? entries[0].weight : (profile?.weight || 65);
    const currentWeight = entries.length > 0 ? entries[entries.length - 1].weight : (profile?.weight || 65);
    const targetWeight = profile?.target_weight || 65;
    const totalChange = parseFloat((currentWeight - initialWeight).toFixed(1));
    const remainingToTarget = parseFloat(Math.abs(currentWeight - targetWeight).toFixed(1));

    return res.json({
      entries,
      summary: {
        initialWeight,
        currentWeight,
        targetWeight,
        totalChange,
        remainingToTarget,
        totalEntries: entries.length,
        goal: profile?.goal || 'maintain',
      },
    });
  } catch (error) {
    console.error('Error fetching weight history:', error);
    return res.status(500).json({ error: 'Không thể tải lịch sử so sánh cân nặng' });
  }
});

// POST /api/profile/weight-history
// Manually add or log a weight for a given date/week
router.post('/weight-history', async (req, res) => {
  try {
    const { weight, date } = req.body;
    const w = parseFloat(weight);

    if (isNaN(w) || w < 30 || w > 250) {
      return res.status(400).json({ error: 'Vui lòng nhập cân nặng hợp lệ (30kg - 250kg)' });
    }

    const targetDate = date || new Date().toISOString().split('T')[0];

    const result = await db.runAsync(
      'INSERT INTO weight_history (user_id, weight, date) VALUES (?, ?, ?)',
      [req.user.id, w, targetDate]
    );

    // Update profile if this is the newest date
    const latest = await db.getAsync(
      'SELECT weight FROM weight_history WHERE user_id = ? ORDER BY date DESC, id DESC LIMIT 1',
      [req.user.id]
    );
    if (latest) {
      await db.runAsync(
        'UPDATE health_profiles SET weight = ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?',
        [latest.weight, req.user.id]
      );
    }

    const updatedProfile = await db.getAsync('SELECT * FROM health_profiles WHERE user_id = ?', [req.user.id]);
    const computedStats = computeFullProfileStats(updatedProfile);

    return res.status(201).json({
      message: 'Đã lưu cân nặng thành công!',
      id: result.lastID,
      profile: updatedProfile,
      computedStats,
    });
  } catch (error) {
    console.error('Error adding weight entry:', error);
    return res.status(500).json({ error: 'Không thể lưu cân nặng' });
  }
});

// DELETE /api/profile/weight-history/:id
router.delete('/weight-history/:id', async (req, res) => {
  try {
    const entryId = req.params.id;
    const entry = await db.getAsync(
      'SELECT * FROM weight_history WHERE id = ? AND user_id = ?',
      [entryId, req.user.id]
    );

    if (!entry) {
      return res.status(404).json({ error: 'Bản ghi cân nặng không tồn tại' });
    }

    await db.runAsync('DELETE FROM weight_history WHERE id = ?', [entryId]);

    // Re-sync profile weight to latest remaining entry
    const latest = await db.getAsync(
      'SELECT weight FROM weight_history WHERE user_id = ? ORDER BY date DESC, id DESC LIMIT 1',
      [req.user.id]
    );
    if (latest) {
      await db.runAsync(
        'UPDATE health_profiles SET weight = ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?',
        [latest.weight, req.user.id]
      );
    }

    const updatedProfile = await db.getAsync('SELECT * FROM health_profiles WHERE user_id = ?', [req.user.id]);
    const computedStats = computeFullProfileStats(updatedProfile);

    return res.json({
      message: 'Đã xóa bản ghi cân nặng thành công!',
      profile: updatedProfile,
      computedStats,
    });
  } catch (error) {
    console.error('Error deleting weight entry:', error);
    return res.status(500).json({ error: 'Không thể xóa bản ghi cân nặng' });
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

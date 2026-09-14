const express = require('express');
const { db } = require('../db');
const { authenticateToken } = require('../middleware/auth');
const { computeFullProfileStats } = require('../utils/calculator');

const router = express.Router();

router.use(authenticateToken);

// GET /api/meals/presets - Common Vietnamese foods presets
router.get('/presets', async (req, res) => {
  try {
    const q = req.query.q ? `%${req.query.q.trim()}%` : null;
    let presets;
    if (q) {
      presets = await db.allAsync('SELECT * FROM food_presets WHERE name LIKE ? ORDER BY name ASC', [q]);
    } else {
      presets = await db.allAsync('SELECT * FROM food_presets ORDER BY category, name ASC');
    }
    return res.json({ presets });
  } catch (error) {
    console.error('Error fetching presets:', error);
    return res.status(500).json({ error: 'Không thể tải danh mục món ăn gợi ý' });
  }
});

// GET /api/meals?date=YYYY-MM-DD
router.get('/', async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const date = req.query.date || today;

    // Fetch user profile for targets
    let profile = await db.getAsync('SELECT * FROM health_profiles WHERE user_id = ?', [req.user.id]);
    if (!profile) {
      await db.runAsync('INSERT INTO health_profiles (user_id) VALUES (?)', [req.user.id]);
      profile = await db.getAsync('SELECT * FROM health_profiles WHERE user_id = ?', [req.user.id]);
    }
    const profileStats = computeFullProfileStats(profile);
    const targetCalories = profileStats.targetCalories;

    // Fetch meals for date
    const meals = await db.allAsync(
      'SELECT * FROM meal_logs WHERE user_id = ? AND date = ? ORDER BY id DESC',
      [req.user.id, date]
    );

    // Calculate totals
    let consumedCalories = 0;
    let consumedProtein = 0;
    let consumedCarbs = 0;
    let consumedFat = 0;

    const grouped = {
      breakfast: [],
      lunch: [],
      dinner: [],
      snack: [],
    };

    meals.forEach((m) => {
      consumedCalories += parseFloat(m.calories) || 0;
      consumedProtein += parseFloat(m.protein) || 0;
      consumedCarbs += parseFloat(m.carbs) || 0;
      consumedFat += parseFloat(m.fat) || 0;

      if (grouped[m.meal_type]) {
        grouped[m.meal_type].push(m);
      } else {
        grouped.snack.push(m);
      }
    });

    consumedCalories = Math.round(consumedCalories);
    consumedProtein = Math.round(consumedProtein);
    consumedCarbs = Math.round(consumedCarbs);
    consumedFat = Math.round(consumedFat);

    const remainingCalories = targetCalories - consumedCalories;
    const remainingProtein = Math.max(0, profileStats.macros.protein - consumedProtein);
    const remainingCarbs = Math.max(0, profileStats.macros.carbs - consumedCarbs);
    const remainingFat = Math.max(0, profileStats.macros.fat - consumedFat);

    return res.json({
      date,
      meals,
      grouped,
      summary: {
        targetCalories,
        consumedCalories,
        remainingCalories,
        percentage: targetCalories > 0 ? Math.min(200, Math.round((consumedCalories / targetCalories) * 100)) : 0,
        macros: {
          consumed: {
            protein: consumedProtein,
            carbs: consumedCarbs,
            fat: consumedFat,
          },
          target: profileStats.macros,
          remaining: {
            protein: remainingProtein,
            carbs: remainingCarbs,
            fat: remainingFat,
          },
        },
      },
    });
  } catch (error) {
    console.error('Error fetching meals:', error);
    return res.status(500).json({ error: 'Không thể tải dữ liệu bữa ăn' });
  }
});

// POST /api/meals
router.post('/', async (req, res) => {
  try {
    const {
      date,
      meal_type = 'breakfast',
      food_name,
      calories,
      protein = 0,
      carbs = 0,
      fat = 0,
    } = req.body;

    if (!food_name || food_name.trim() === '') {
      return res.status(400).json({ error: 'Vui lòng nhập tên món ăn' });
    }

    const cal = parseFloat(calories);
    if (isNaN(cal) || cal < 0) {
      return res.status(400).json({ error: 'Vui lòng nhập lượng calo hợp lệ (>= 0)' });
    }

    const today = new Date().toISOString().split('T')[0];
    const targetDate = date || today;

    const result = await db.runAsync(
      `INSERT INTO meal_logs (user_id, date, meal_type, food_name, calories, protein, carbs, fat)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        req.user.id,
        targetDate,
        meal_type,
        food_name.trim(),
        cal,
        parseFloat(protein) || 0,
        parseFloat(carbs) || 0,
        parseFloat(fat) || 0,
      ]
    );

    const createdMeal = await db.getAsync('SELECT * FROM meal_logs WHERE id = ?', [result.lastID]);

    return res.status(201).json({
      message: 'Đã thêm món ăn thành công!',
      meal: createdMeal,
    });
  } catch (error) {
    console.error('Error adding meal:', error);
    return res.status(500).json({ error: 'Không thể thêm món ăn' });
  }
});

// DELETE /api/meals/:id
router.delete('/:id', async (req, res) => {
  try {
    const mealId = req.params.id;
    const meal = await db.getAsync('SELECT * FROM meal_logs WHERE id = ? AND user_id = ?', [mealId, req.user.id]);

    if (!meal) {
      return res.status(404).json({ error: 'Món ăn không tồn tại hoặc bạn không có quyền xóa' });
    }

    await db.runAsync('DELETE FROM meal_logs WHERE id = ?', [mealId]);

    return res.json({ message: 'Đã xóa món ăn thành công!' });
  } catch (error) {
    console.error('Error deleting meal:', error);
    return res.status(500).json({ error: 'Không thể xóa món ăn' });
  }
});

module.exports = router;


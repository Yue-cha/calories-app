const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = path.resolve(__dirname, '../../calories.db');
const db = new sqlite3.Database(DB_PATH);

// Promise-based wrappers for sqlite3
db.runAsync = function (sql, params = []) {
  return new Promise((resolve, reject) => {
    this.run(sql, params, function (err) {
      if (err) return reject(err);
      resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
};

db.getAsync = function (sql, params = []) {
  return new Promise((resolve, reject) => {
    this.get(sql, params, (err, row) => {
      if (err) return reject(err);
      resolve(row);
    });
  });
};

db.allAsync = function (sql, params = []) {
  return new Promise((resolve, reject) => {
    this.all(sql, params, (err, rows) => {
      if (err) return reject(err);
      resolve(rows);
    });
  });
};

async function initDB() {
  await db.runAsync('PRAGMA foreign_keys = ON;');

  // Users table
  await db.runAsync(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      full_name TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Health profiles table
  await db.runAsync(`
    CREATE TABLE IF NOT EXISTS health_profiles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      gender TEXT NOT NULL DEFAULT 'male',
      age INTEGER NOT NULL DEFAULT 25,
      height REAL NOT NULL DEFAULT 170,
      weight REAL NOT NULL DEFAULT 65,
      target_weight REAL NOT NULL DEFAULT 65,
      activity_level TEXT NOT NULL DEFAULT 'moderate',
      goal TEXT NOT NULL DEFAULT 'maintain',
      custom_calorie_target REAL DEFAULT NULL,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Meal logs table
  await db.runAsync(`
    CREATE TABLE IF NOT EXISTS meal_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      date TEXT NOT NULL,
      meal_type TEXT NOT NULL,
      food_name TEXT NOT NULL,
      calories REAL NOT NULL,
      protein REAL DEFAULT 0,
      carbs REAL DEFAULT 0,
      fat REAL DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Food presets table for quick auto-suggestions
  await db.runAsync(`
    CREATE TABLE IF NOT EXISTS food_presets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      calories REAL NOT NULL,
      protein REAL DEFAULT 0,
      carbs REAL DEFAULT 0,
      fat REAL DEFAULT 0,
      category TEXT DEFAULT 'Chung'
    )
  `);

  // Populate food presets if empty
  const count = await db.getAsync('SELECT COUNT(*) as count FROM food_presets');
  if (count.count === 0) {
    const defaultPresets = [
      { name: 'Phở bò tái chín', calories: 480, protein: 28, carbs: 65, fat: 12, category: 'Bữa chính' },
      { name: 'Phở gà', calories: 430, protein: 26, carbs: 62, fat: 9, category: 'Bữa chính' },
      { name: 'Bún chả Hà Nội', calories: 550, protein: 32, carbs: 68, fat: 16, category: 'Bữa chính' },
      { name: 'Bánh mì thịt chả', calories: 420, protein: 18, carbs: 55, fat: 14, category: 'Bữa sáng / Nhanh' },
      { name: 'Cơm tấm sườn nướng', calories: 620, protein: 30, carbs: 75, fat: 22, category: 'Bữa chính' },
      { name: 'Cơm tấm sườn bì chả', calories: 780, protein: 36, carbs: 85, fat: 32, category: 'Bữa chính' },
      { name: 'Bún bò Huế', calories: 520, protein: 31, carbs: 62, fat: 15, category: 'Bữa chính' },
      { name: '1 Bát cơm trắng (150g)', calories: 195, protein: 4, carbs: 44, fat: 0.4, category: 'Nguyên liệu' },
      { name: '1 Quả trứng luộc', calories: 78, protein: 6.3, carbs: 0.6, fat: 5.3, category: 'Nguyên liệu' },
      { name: '1 Quả trứng ốp la', calories: 95, protein: 6.3, carbs: 0.6, fat: 7.2, category: 'Bữa sáng' },
      { name: 'Ức gà áp chảo (150g)', calories: 245, protein: 46, carbs: 0, fat: 5.5, category: 'Bổ sung Protein' },
      { name: 'Thịt bò xào rau củ', calories: 350, protein: 32, carbs: 12, fat: 18, category: 'Bữa chính' },
      { name: 'Salad rau củ sốt mè rang', calories: 160, protein: 3, carbs: 14, fat: 11, category: 'Ăn kèm / Nhẹ' },
      { name: 'Sữa chua không đường', calories: 65, protein: 4, carbs: 6, fat: 3.5, category: 'Bữa phụ' },
      { name: 'Chuối tiêu (1 quả vừa)', calories: 105, protein: 1.3, carbs: 27, fat: 0.3, category: 'Trái cây' },
      { name: '1 Quả táo vừa', calories: 95, protein: 0.5, carbs: 25, fat: 0.3, category: 'Trái cây' },
      { name: 'Cà phê đen không đường', calories: 5, protein: 0.3, carbs: 0, fat: 0, category: 'Đồ uống' },
      { name: 'Cà phê sữa đá', calories: 180, protein: 3, carbs: 28, fat: 6, category: 'Đồ uống' },
      { name: 'Trà sữa trân châu (1 ly)', calories: 450, protein: 2, carbs: 80, fat: 14, category: 'Đồ uống' },
      { name: 'Khoai lang luộc (1 củ 150g)', calories: 130, protein: 2.5, carbs: 30, fat: 0.2, category: 'Tinh bột chậm' },
    ];

    for (const item of defaultPresets) {
      await db.runAsync(
        'INSERT INTO food_presets (name, calories, protein, carbs, fat, category) VALUES (?, ?, ?, ?, ?, ?)',
        [item.name, item.calories, item.protein, item.carbs, item.fat, item.category]
      );
    }
  }

  console.log('Database initialized successfully at', DB_PATH);
}

module.exports = {
  db,
  initDB,
};

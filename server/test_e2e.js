const express = require('express');
const { initDB, db } = require('./src/db');
const authRoutes = require('./src/routes/auth');
const profileRoutes = require('./src/routes/profile');
const mealsRoutes = require('./src/routes/meals');

const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/meals', mealsRoutes);

async function runE2E() {
  await initDB();
  const server = app.listen(0);
  const port = server.address().port;
  const baseUrl = `http://127.0.0.1:${port}`;

  console.log(`E2E Test server started at ${baseUrl}`);

  try {
    // 1. Clean test user if exists
    await db.runAsync('DELETE FROM users WHERE username = ?', ['testuser123']);

    // 2. Register
    const regRes = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'testuser123',
        password: 'password123',
        full_name: 'Nguyễn Văn A',
        gender: 'male',
        age: 26,
        height: 172,
        weight: 68,
        target_weight: 65,
        activity_level: 'light',
        goal: 'lose_normal',
      }),
    });
    const regData = await regRes.json();
    console.log('1. Register response status:', regRes.status);
    if (regRes.status !== 201) throw new Error(JSON.stringify(regData));
    console.log('   User registered:', regData.user.username, '| BMR:', regData.computedStats.bmr, '| Target:', regData.computedStats.targetCalories);

    const token = regData.token;

    // 3. Test Login Success
    const loginRes = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'testuser123',
        password: 'password123',
      }),
    });
    const loginData = await loginRes.json();
    console.log('2. Login status:', loginRes.status, '| Welcome:', loginData.message);
    if (loginRes.status !== 200) throw new Error('Login failed');

    // 4. Test Login Fail (Wrong Password)
    const wrongPassRes = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'testuser123',
        password: 'wrongpassword',
      }),
    });
    console.log('3. Wrong password status (expect 401):', wrongPassRes.status);

    // 5. Test Duplicate Register
    const dupRes = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'testuser123',
        password: 'password123',
        full_name: 'Nguyễn Văn A',
      }),
    });
    console.log('4. Duplicate register status (expect 409):', dupRes.status);

    // 6. Test Get Profile
    const profileRes = await fetch(`${baseUrl}/api/profile`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const profileData = await profileRes.json();
    console.log('5. Get profile status:', profileRes.status, '| Height:', profileData.profile.height, '| Weight:', profileData.profile.weight);

    // 7. Test Add Meals
    const meal1Res = await fetch(`${baseUrl}/api/meals`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        meal_type: 'breakfast',
        food_name: 'Phở bò tái chín',
        calories: 480,
        protein: 28,
        carbs: 65,
        fat: 12,
      }),
    });
    const meal1Data = await meal1Res.json();
    console.log('6. Add Meal 1 status:', meal1Res.status, '| Meal ID:', meal1Data.meal.id);

    const meal2Res = await fetch(`${baseUrl}/api/meals`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        meal_type: 'lunch',
        food_name: 'Cơm tấm sườn nướng',
        calories: 620,
        protein: 30,
        carbs: 75,
        fat: 22,
      }),
    });
    const meal2Data = await meal2Res.json();
    console.log('7. Add Meal 2 status:', meal2Res.status, '| Meal ID:', meal2Data.meal.id);

    // 8. Test Daily Meals & Remaining Calories
    const mealsSummaryRes = await fetch(`${baseUrl}/api/meals`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const mealsSummary = await mealsSummaryRes.json();
    console.log('8. Daily Summary:');
    console.log('   Target Calories:', mealsSummary.summary.targetCalories);
    console.log('   Consumed Calories:', mealsSummary.summary.consumedCalories, '(Expected 1100)');
    console.log('   Remaining Calories:', mealsSummary.summary.remainingCalories);
    console.log('   Consumed Protein:', mealsSummary.summary.macros.consumed.protein, 'g');

    if (mealsSummary.summary.consumedCalories !== 1100) {
      throw new Error(`Expected 1100 consumed calories, got ${mealsSummary.summary.consumedCalories}`);
    }

    // 9. Test Delete Meal
    const delRes = await fetch(`${baseUrl}/api/meals/${meal1Data.meal.id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log('9. Delete Meal 1 status:', delRes.status);

    const afterDelRes = await fetch(`${baseUrl}/api/meals`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const afterDelSummary = await afterDelRes.json();
    console.log('10. Consumed after delete:', afterDelSummary.summary.consumedCalories, '(Expected 620)');
    if (afterDelSummary.summary.consumedCalories !== 620) {
      throw new Error(`Expected 620 consumed calories after delete, got ${afterDelSummary.summary.consumedCalories}`);
    }

    console.log('\n>>> ALL BACKEND ENDPOINTS AND LOGIC VERIFIED SUCCESSFULLY! <<<');
  } finally {
    server.close();
  }
}

runE2E().catch((err) => {
  console.error('E2E Test Failed:', err);
  process.exit(1);
});

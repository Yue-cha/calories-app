const express = require('express');
const { initDB, db } = require('./src/db');
const authRoutes = require('./src/routes/auth');
const profileRoutes = require('./src/routes/profile');
const mealsRoutes = require('./src/routes/meals');
const { getMondayOfCurrentWeek, checkNeedsWeeklyWeightUpdate } = require('./src/utils/calculator');

async function testWeeklyLogic() {
  console.log('=== 1. Testing Monday Calculation & Weekly Weight Check ===');

  // Case A: Ref date is Wednesday 2026-09-16
  const wedDate = new Date('2026-09-16T10:00:00Z');
  const mondayA = getMondayOfCurrentWeek(wedDate);
  console.log('Wednesday ref:', wedDate.toISOString(), '-> Monday:', mondayA.toISOString().split('T')[0]);
  if (mondayA.toISOString().split('T')[0] !== '2026-09-14') {
    throw new Error('Monday calculation failed for Wednesday');
  }

  // Case B: Ref date is Monday 2026-09-14 at 08:00
  const monDate = new Date('2026-09-14T08:00:00Z');
  const mondayB = getMondayOfCurrentWeek(monDate);
  console.log('Monday ref:', monDate.toISOString(), '-> Monday:', mondayB.toISOString().split('T')[0]);
  if (mondayB.toISOString().split('T')[0] !== '2026-09-14') {
    throw new Error('Monday calculation failed for Monday');
  }

  // Case C: Ref date is Sunday 2026-09-20 (end of week)
  const sunDate = new Date('2026-09-20T22:00:00Z');
  const mondayC = getMondayOfCurrentWeek(sunDate);
  console.log('Sunday ref:', sunDate.toISOString(), '-> Monday:', mondayC.toISOString().split('T')[0]);
  if (mondayC.toISOString().split('T')[0] !== '2026-09-14') {
    throw new Error('Monday calculation failed for Sunday');
  }

  // Check needsWeeklyWeightUpdate
  // If last updated was Sunday 2026-09-13 (previous week) and now is Monday 2026-09-14
  const needUpdate1 = checkNeedsWeeklyWeightUpdate('2026-09-13T23:59:00Z', new Date('2026-09-14T01:00:00Z'));
  console.log('Last updated Sunday, now Monday 01:00 -> needsWeeklyWeightUpdate:', needUpdate1, '(Expected true)');
  if (!needUpdate1) throw new Error('Expected true for Sunday to Monday transition');

  // If last updated was Monday 2026-09-14 02:00, and now is Monday 2026-09-14 10:00
  const needUpdate2 = checkNeedsWeeklyWeightUpdate('2026-09-14T02:00:00Z', new Date('2026-09-14T10:00:00Z'));
  console.log('Last updated Monday 02:00, now Monday 10:00 -> needsWeeklyWeightUpdate:', needUpdate2, '(Expected false)');
  if (needUpdate2) throw new Error('Expected false for same Monday');

  console.log('=== 2. Testing Weekly Weight Endpoint & Database ===');
  await initDB();

  const app = express();
  app.use(express.json());
  app.use('/api/auth', authRoutes);
  app.use('/api/profile', profileRoutes);
  app.use('/api/meals', mealsRoutes);

  const server = app.listen(0);
  const port = server.address().port;
  const baseUrl = `http://127.0.0.1:${port}`;

  try {
    // Register test user
    await db.runAsync('DELETE FROM users WHERE username = ?', ['weeklyuser']);
    const regRes = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'weeklyuser',
        password: 'password123',
        full_name: 'Weekly Tester',
        weight: 70,
        height: 175,
        age: 28,
        gender: 'male',
      }),
    });
    const regData = await regRes.json();
    const token = regData.token;
    console.log('User registered, initial weight 70kg, BMR:', regData.computedStats.bmr);

    // Update weight via PUT /api/profile/weekly-weight (new week weight: 68.5kg)
    const updateWeightRes = await fetch(`${baseUrl}/api/profile/weekly-weight`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ weight: 68.5 }),
    });
    const updateWeightData = await updateWeightRes.json();
    console.log('Weekly weight updated:', updateWeightData.message);
    console.log('New weight:', updateWeightData.profile.weight, '| New BMR:', updateWeightData.computedStats.bmr);
    console.log('needsWeeklyWeightUpdate:', updateWeightData.needsWeeklyWeightUpdate);

    if (updateWeightData.profile.weight !== 68.5) {
      throw new Error('Weight was not updated to 68.5');
    }

    // Check history
    const historyRes = await fetch(`${baseUrl}/api/profile/weight-history`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const historyData = await historyRes.json();
    console.log('Weight history records count:', historyData.history.length);
    if (historyData.history.length === 0) throw new Error('Weight history empty');

    // Test midnight / date-based reset
    console.log('=== 3. Testing Midnight Calorie Reset Behavior ===');
    // Log food for yesterday (2026-09-13)
    await fetch(`${baseUrl}/api/meals`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        date: '2026-09-13',
        food_name: 'Bún bò Huế',
        calories: 520,
      }),
    });

    // Check meals for yesterday
    const resYest = await fetch(`${baseUrl}/api/meals?date=2026-09-13`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const dataYest = await resYest.json();
    console.log('Yesterday consumed calories:', dataYest.summary.consumedCalories, '(Expected 520)');

    // Check meals for today (2026-09-14 - after midnight reset)
    const resToday = await fetch(`${baseUrl}/api/meals?date=2026-09-14`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const dataToday = await resToday.json();
    console.log('Today consumed calories (auto-reset):', dataToday.summary.consumedCalories, '(Expected 0)');
    console.log('Today remaining calories:', dataToday.summary.remainingCalories, '== Target:', dataToday.summary.targetCalories);

    if (dataToday.summary.consumedCalories !== 0) {
      throw new Error('Expected 0 consumed calories for today');
    }

    console.log('\n>>> ALL WEEKLY WEIGHT & MIDNIGHT RESET TESTS PASSED! <<<');
  } finally {
    server.close();
  }
}

testWeeklyLogic().catch((err) => {
  console.error('Test Failed:', err);
  process.exit(1);
});


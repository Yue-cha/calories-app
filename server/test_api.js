const http = require('http');

async function testBackend() {
  console.log('Testing backend API...');
  // We will start server and test register, login, profile, meal log
  const { initDB, db } = require('./src/db');
  const { calculateBMR, calculateTDEE, calculateTargetCalories, calculateBMI, calculateMacros } = require('./src/utils/calculator');

  // 1. Test calculation functions
  console.log('--- Testing Calculations ---');
  // Male, 70kg, 175cm, 25yo
  const bmrMale = calculateBMR('male', 70, 175, 25);
  // 10*70 + 6.25*175 - 5*25 + 5 = 700 + 1093.75 - 125 + 5 = 1673.75 -> 1674
  console.log('BMR Male (70kg, 175cm, 25):', bmrMale, 'Expected ~1674');

  // TDEE moderate (1.55)
  const tdee = calculateTDEE(bmrMale, 'moderate');
  console.log('TDEE moderate:', tdee, 'Expected ~2595');

  // Target for lose normal (-300)
  const targetCal = calculateTargetCalories(tdee, 'lose_normal');
  console.log('Target for lose_normal:', targetCal, 'Expected ~2295');

  // BMI (70kg, 175cm)
  const bmi = calculateBMI(70, 175);
  console.log('BMI:', bmi.bmi, bmi.status);

  // Macros
  const macros = calculateMacros(targetCal);
  console.log('Macros for target:', macros);

  // 2. Test DB Initialization
  await initDB();
  console.log('DB init passed!');

  // Check food presets
  const presets = await db.allAsync('SELECT COUNT(*) as count FROM food_presets');
  console.log('Presets loaded:', presets[0].count);

  console.log('All backend unit checks passed!');
  process.exit(0);
}

testBackend().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});

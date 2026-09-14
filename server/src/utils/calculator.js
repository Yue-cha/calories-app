/**
 * Utility functions for health & nutrition calculations
 * Standard Mifflin-St Jeor equation
 */

const ACTIVITY_MULTIPLIERS = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
};

const GOAL_ADJUSTMENTS = {
  lose_fast: -500,
  lose_normal: -300,
  maintain: 0,
  gain_normal: 300,
  gain_fast: 500,
};

function calculateBMR(gender, weightKg, heightCm, age) {
  const w = parseFloat(weightKg);
  const h = parseFloat(heightCm);
  const a = parseInt(age, 10);

  if (!w || !h || !a) return 0;

  if (gender === 'female') {
    return Math.round(10 * w + 6.25 * h - 5 * a - 161);
  }
  // Default to male
  return Math.round(10 * w + 6.25 * h - 5 * a + 5);
}

function calculateTDEE(bmr, activityLevel) {
  const multiplier = ACTIVITY_MULTIPLIERS[activityLevel] || 1.2;
  return Math.round(bmr * multiplier);
}

function calculateTargetCalories(tdee, goal) {
  const adjustment = GOAL_ADJUSTMENTS[goal] || 0;
  const target = tdee + adjustment;
  // Safety minimum calories (at least 1200 for women / 1500 for men safe baseline)
  return Math.max(1200, Math.round(target));
}

function calculateBMI(weightKg, heightCm) {
  const w = parseFloat(weightKg);
  const h = parseFloat(heightCm) / 100;
  if (!w || !h || h <= 0) return { bmi: 0, status: 'Chưa xác định' };

  const bmi = parseFloat((w / (h * h)).toFixed(1));
  let status = 'Bình thường';
  let color = 'emerald';

  if (bmi < 18.5) {
    status = 'Thiếu cân';
    color = 'blue';
  } else if (bmi < 24.9) {
    status = 'Bình thường';
    color = 'emerald';
  } else if (bmi < 29.9) {
    status = 'Thừa cân';
    color = 'amber';
  } else {
    status = 'Béo phì';
    color = 'rose';
  }

  return { bmi, status, color };
}

function calculateMacros(targetCalories) {
  const calories = parseFloat(targetCalories) || 2000;

  // 25% Protein, 50% Carbs, 25% Fat
  const proteinCalories = calories * 0.25;
  const carbCalories = calories * 0.50;
  const fatCalories = calories * 0.25;

  return {
    protein: Math.round(proteinCalories / 4), // grams
    carbs: Math.round(carbCalories / 4),      // grams
    fat: Math.round(fatCalories / 9),         // grams
  };
}

function calculateRecommendedWater(weightKg) {
  const w = parseFloat(weightKg) || 60;
  return parseFloat((w * 0.035).toFixed(1)); // Liters per day
}

function computeFullProfileStats(profile) {
  const bmr = calculateBMR(profile.gender, profile.weight, profile.height, profile.age);
  const tdee = calculateTDEE(bmr, profile.activity_level);
  const targetCalories = profile.custom_calorie_target || calculateTargetCalories(tdee, profile.goal);
  const bmiInfo = calculateBMI(profile.weight, profile.height);
  const macros = calculateMacros(targetCalories);
  const water = calculateRecommendedWater(profile.weight);

  return {
    bmr,
    tdee,
    targetCalories,
    bmi: bmiInfo.bmi,
    bmiStatus: bmiInfo.status,
    bmiColor: bmiInfo.color,
    macros,
    water,
  };
}

module.exports = {
  calculateBMR,
  calculateTDEE,
  calculateTargetCalories,
  calculateBMI,
  calculateMacros,
  calculateRecommendedWater,
  computeFullProfileStats,
  ACTIVITY_MULTIPLIERS,
  GOAL_ADJUSTMENTS,
};

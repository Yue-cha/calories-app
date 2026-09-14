import React from 'react';
import {
  Flame,
  TrendingDown,
  TrendingUp,
  Award,
  AlertTriangle,
  CheckCircle2,
  Utensils,
  Droplet,
} from 'lucide-react';

export default function CalorieOverview({ summary, computedStats, onAddMealClick }) {
  if (!summary) return null;

  const { targetCalories, consumedCalories, remainingCalories, percentage, macros } = summary;
  const isOver = remainingCalories < 0;
  const isPerfect = remainingCalories === 0 && consumedCalories > 0;

  // Percentage capped for progress bar
  const progressWidth = Math.min(100, Math.max(0, percentage));

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/80 dark:border-slate-800 transition-colors">
      {/* Main Calorie Calculation Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
        {/* Metric 1: Target */}
        <div className="flex items-center space-x-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60">
          <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 flex items-center justify-center shrink-0">
            <Flame className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400 tracking-wider">
              Mục Tiêu Trong Ngày
            </span>
            <div className="text-2xl font-black text-slate-800 dark:text-white">
              {targetCalories} <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">kcal</span>
            </div>
            <span className="text-[11px] text-slate-400 dark:text-slate-500">Theo thể trạng cá nhân</span>
          </div>
        </div>

        {/* Metric 2: Consumed (Đã nạp) */}
        <div className="flex items-center space-x-4 p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/40">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 flex items-center justify-center shrink-0">
            <Utensils className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold uppercase text-amber-700 dark:text-amber-400 tracking-wider">
              Đã Nạp Vào
            </span>
            <div className="text-2xl font-black text-amber-900 dark:text-amber-200">
              {consumedCalories} <span className="text-sm font-semibold text-amber-700 dark:text-amber-400">kcal</span>
            </div>
            <span className="text-[11px] text-amber-600 dark:text-amber-400 font-medium">
              Đạt {percentage}% mục tiêu
            </span>
          </div>
        </div>

        {/* Metric 3: Remaining (Lượng dinh dưỡng cần lại) */}
        <div
          className={`flex items-center space-x-4 p-4 rounded-2xl border transition-all ${
            isOver
              ? 'bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-900/50'
              : 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900/50'
          }`}
        >
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
              isOver
                ? 'bg-rose-100 dark:bg-rose-900/50 text-rose-700 dark:text-rose-300'
                : 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300'
            }`}
          >
            {isOver ? <AlertTriangle className="w-6 h-6" /> : <Award className="w-6 h-6" />}
          </div>
          <div>
            <span
              className={`text-xs font-bold uppercase tracking-wider ${
                isOver ? 'text-rose-700 dark:text-rose-400' : 'text-emerald-700 dark:text-emerald-400'
              }`}
            >
              {isOver ? 'Vượt Quá Calo' : 'Còn Lại Cần Nạp'}
            </span>
            <div
              className={`text-2xl font-black ${
                isOver ? 'text-rose-900 dark:text-rose-200' : 'text-emerald-900 dark:text-emerald-200'
              }`}
            >
              {Math.abs(remainingCalories)}{' '}
              <span className={`text-sm font-semibold ${isOver ? 'text-rose-700 dark:text-rose-400' : 'text-emerald-700 dark:text-emerald-400'}`}>
                kcal
              </span>
            </div>
            <span className={`text-[11px] font-medium ${isOver ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
              {isOver ? 'Hãy giảm khẩu phần bữa sau' : 'Năng lượng còn lại cho ngày'}
            </span>
          </div>
        </div>
      </div>

      {/* Visual Calorie Progress Bar */}
      <div className="mt-8 space-y-2">
        <div className="flex justify-between items-center text-xs font-bold">
          <div className="flex items-center space-x-2 text-slate-700 dark:text-slate-300">
            <span>Tiến độ calo hàng ngày</span>
            {isOver && (
              <span className="bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 text-[10px] px-2 py-0.5 rounded-full uppercase">
                Vượt mức {Math.abs(remainingCalories)} kcal
              </span>
            )}
            {isPerfect && (
              <span className="bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[10px] px-2 py-0.5 rounded-full uppercase flex items-center space-x-1">
                <CheckCircle2 className="w-3 h-3" />
                <span>Hoàn thành hoàn hảo</span>
              </span>
            )}
          </div>
          <span className="text-slate-500 dark:text-slate-400 font-semibold">
            {consumedCalories} / {targetCalories} kcal ({percentage}%)
          </span>
        </div>

        <div className="w-full h-4 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-200 dark:border-slate-700">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              isOver
                ? 'bg-gradient-to-r from-amber-500 to-rose-500'
                : 'bg-gradient-to-r from-emerald-500 to-teal-500'
            }`}
            style={{ width: `${progressWidth}%` }}
          />
        </div>
      </div>

      {/* Macronutrient Distribution Bar */}
      {macros && (
        <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Protein */}
          <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-3.5 border border-slate-200/60 dark:border-slate-700/60">
            <div className="flex justify-between items-center text-xs mb-1.5">
              <span className="font-bold text-slate-700 dark:text-slate-200 flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 inline-block"></span>
                <span>Chất đạm (Protein)</span>
              </span>
              <span className="text-indigo-700 dark:text-indigo-400 font-extrabold text-xs">
                {macros.consumed.protein} / {macros.target.protein}g
              </span>
            </div>
            <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-500 rounded-full transition-all"
                style={{
                  width: `${Math.min(100, Math.round((macros.consumed.protein / (macros.target.protein || 1)) * 100))}%`,
                }}
              />
            </div>
            <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 flex justify-between">
              <span>Còn lại: {macros.remaining.protein}g</span>
              <span>4 kcal/g</span>
            </div>
          </div>

          {/* Carbs */}
          <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-3.5 border border-slate-200/60 dark:border-slate-700/60">
            <div className="flex justify-between items-center text-xs mb-1.5">
              <span className="font-bold text-slate-700 dark:text-slate-200 flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block"></span>
                <span>Tinh bột (Carbs)</span>
              </span>
              <span className="text-amber-700 dark:text-amber-400 font-extrabold text-xs">
                {macros.consumed.carbs} / {macros.target.carbs}g
              </span>
            </div>
            <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-amber-500 rounded-full transition-all"
                style={{
                  width: `${Math.min(100, Math.round((macros.consumed.carbs / (macros.target.carbs || 1)) * 100))}%`,
                }}
              />
            </div>
            <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 flex justify-between">
              <span>Còn lại: {macros.remaining.carbs}g</span>
              <span>4 kcal/g</span>
            </div>
          </div>

          {/* Fat */}
          <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-3.5 border border-slate-200/60 dark:border-slate-700/60">
            <div className="flex justify-between items-center text-xs mb-1.5">
              <span className="font-bold text-slate-700 dark:text-slate-200 flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block"></span>
                <span>Chất béo (Fat)</span>
              </span>
              <span className="text-rose-700 dark:text-rose-400 font-extrabold text-xs">
                {macros.consumed.fat} / {macros.target.fat}g
              </span>
            </div>
            <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-rose-500 rounded-full transition-all"
                style={{
                  width: `${Math.min(100, Math.round((macros.consumed.fat / (macros.target.fat || 1)) * 100))}%`,
                }}
              />
            </div>
            <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 flex justify-between">
              <span>Còn lại: {macros.remaining.fat}g</span>
              <span>9 kcal/g</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

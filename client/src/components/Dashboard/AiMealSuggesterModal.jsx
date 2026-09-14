import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
  Sparkles,
  X,
  ArrowLeft,
  Clock,
  ChefHat,
  Flame,
  CheckCircle2,
  AlertCircle,
  Plus,
  RefreshCw,
  Info,
  Check,
  Utensils,
  BookOpen,
} from 'lucide-react';

export default function AiMealSuggesterModal({
  isOpen,
  onClose,
  mealType = 'lunch',
  mealLabel = 'Bữa Trưa',
  date,
  remainingCalories = 500,
  onMealAdded,
}) {
  const { profile, computedStats } = useAuth();
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [selectedDish, setSelectedDish] = useState(null); // null = Level 1 (List), object = Level 2 (Detail)
  const [error, setError] = useState('');
  const [addingMeal, setAddingMeal] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const fetchSuggestions = useCallback(async () => {
    setLoading(true);
    setError('');
    setSelectedDish(null);
    try {
      const res = await api.getAiMealSuggestions({
        mealType,
        remainingCalories: remainingCalories || 500,
        goal: profile?.goal || 'maintain',
        targetCalories: computedStats?.targetCalories || 2000,
      });
      setSuggestions(res.suggestions || []);
    } catch (err) {
      console.error('Error getting AI suggestions:', err);
      setError(err.message || 'Không thể tải gợi ý món ăn lúc này');
    } finally {
      setLoading(false);
    }
  }, [mealType, remainingCalories, profile?.goal, computedStats?.targetCalories]);

  useEffect(() => {
    if (isOpen) {
      fetchSuggestions();
      setSuccessMsg('');
    }
  }, [isOpen, fetchSuggestions]);

  if (!isOpen) return null;

  // Add the chosen dish to the user's meal log
  const handleConfirmAddMeal = async (dish) => {
    setAddingMeal(true);
    setError('');
    try {
      await api.addMeal({
        date: date || new Date().toISOString().split('T')[0],
        meal_type: mealType,
        food_name: dish.name,
        calories: dish.calories,
        protein: dish.protein || 0,
        carbs: dish.carbs || 0,
        fat: dish.fat || 0,
      });

      setSuccessMsg(`Đã thêm món "${dish.name}" vào ${mealLabel}!`);
      if (onMealAdded) onMealAdded();

      setTimeout(() => {
        setSuccessMsg('');
        setSelectedDish(null);
        onClose();
      }, 1300);
    } catch (err) {
      setError(err.message || 'Lỗi khi thêm món vào bữa ăn');
    } finally {
      setAddingMeal(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh] transition-colors">
        
        {/* ======================================================== */}
        {/* MODAL HEADER                                             */}
        {/* ======================================================== */}
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 dark:from-emerald-900 dark:via-teal-900 dark:to-emerald-950 px-6 py-4 text-white flex items-center justify-between shrink-0 shadow-sm">
          <div className="flex items-center space-x-3">
            {selectedDish ? (
              <button
                onClick={() => setSelectedDish(null)}
                title="Quay lại danh sách gợi ý"
                className="p-1.5 bg-white/20 hover:bg-white/30 rounded-xl transition cursor-pointer text-white flex items-center space-x-1 text-xs font-bold"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Quay lại</span>
              </button>
            ) : (
              <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center text-amber-300">
                <Sparkles className="w-5 h-5" />
              </div>
            )}
            <div>
              <h3 className="text-base font-extrabold flex items-center space-x-2">
                <span>{selectedDish ? 'Chi Tiết Món Ăn & Cách Nấu' : `Gợi Ý Món Ăn Từ AI - ${mealLabel}`}</span>
              </h3>
              <p className="text-[11px] text-emerald-100">
                {selectedDish
                  ? selectedDish.name
                  : `Ngân sách calo ước tính: ~${Math.max(100, Math.round(remainingCalories))} kcal`}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-white/80 hover:text-white hover:bg-white/20 rounded-xl transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Global Error or Success notification */}
        {error && (
          <div className="m-4 p-3 bg-rose-50 dark:bg-rose-950/80 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-semibold rounded-2xl flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="m-4 p-3.5 bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-bold rounded-2xl flex items-center space-x-2 shadow-xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* ======================================================== */}
        {/* MODAL BODY (SCROLLABLE)                                  */}
        {/* ======================================================== */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4 text-left">
          {loading ? (
            <div className="py-16 flex flex-col items-center justify-center space-y-3 text-slate-400">
              <div className="w-10 h-10 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-xs font-bold text-slate-600 dark:text-slate-300">
                AI đang tính toán và lựa chọn món ăn phù hợp nhất...
              </p>
              <p className="text-[11px] text-slate-400">Đang chuẩn bị danh sách nguyên liệu và công thức nấu</p>
            </div>
          ) : selectedDish ? (
            /* ======================================================== */
            /* LEVEL 2: DETAILED DISH POPUP (RECIPE, INGREDIENTS, MACROS)*/
            /* ======================================================== */
            <div className="space-y-6 animate-in fade-in zoom-in-95 duration-200">
              {/* Dish Title & Meta */}
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-1.5">
                  {selectedDish.tags?.map((tag, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold text-[10px]"
                    >
                      {tag}
                    </span>
                  ))}
                  {selectedDish.prepTime && (
                    <span className="flex items-center space-x-1 text-[11px] text-slate-400 dark:text-slate-500 font-medium">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{selectedDish.prepTime}</span>
                    </span>
                  )}
                  {selectedDish.difficulty && (
                    <span className="flex items-center space-x-1 text-[11px] text-slate-400 dark:text-slate-500 font-medium">
                      <ChefHat className="w-3.5 h-3.5" />
                      <span>Độ khó: {selectedDish.difficulty}</span>
                    </span>
                  )}
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                  {selectedDish.name}
                </h2>
              </div>

              {/* Nutrition Breakdown Grid (5 Cards) */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                <div className="bg-amber-50/70 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-900/60 rounded-2xl p-3 text-center">
                  <span className="text-[10px] uppercase font-bold text-amber-700 dark:text-amber-400 tracking-wider">
                    Năng Lượng
                  </span>
                  <div className="text-lg font-black text-amber-800 dark:text-amber-300 font-mono">
                    {selectedDish.calories} <span className="text-xs font-semibold">kcal</span>
                  </div>
                </div>

                <div className="bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-900/60 rounded-2xl p-3 text-center">
                  <span className="text-[10px] uppercase font-bold text-emerald-700 dark:text-emerald-400 tracking-wider">
                    Đạm / Protein
                  </span>
                  <div className="text-lg font-black text-emerald-800 dark:text-emerald-300 font-mono">
                    {selectedDish.protein} <span className="text-xs font-semibold">g</span>
                  </div>
                </div>

                <div className="bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-900/60 rounded-2xl p-3 text-center">
                  <span className="text-[10px] uppercase font-bold text-blue-700 dark:text-blue-400 tracking-wider">
                    Tinh Bột / Carb
                  </span>
                  <div className="text-lg font-black text-blue-800 dark:text-blue-300 font-mono">
                    {selectedDish.carbs} <span className="text-xs font-semibold">g</span>
                  </div>
                </div>

                <div className="bg-rose-50/70 dark:bg-rose-950/40 border border-rose-200/80 dark:border-rose-900/60 rounded-2xl p-3 text-center">
                  <span className="text-[10px] uppercase font-bold text-rose-700 dark:text-rose-400 tracking-wider">
                    Chất Béo / Fat
                  </span>
                  <div className="text-lg font-black text-rose-800 dark:text-rose-300 font-mono">
                    {selectedDish.fat} <span className="text-xs font-semibold">g</span>
                  </div>
                </div>

                <div className="col-span-2 sm:col-span-1 bg-teal-50/70 dark:bg-teal-950/40 border border-teal-200/80 dark:border-teal-900/60 rounded-2xl p-3 text-center">
                  <span className="text-[10px] uppercase font-bold text-teal-700 dark:text-teal-400 tracking-wider">
                    Chất Xơ
                  </span>
                  <div className="text-lg font-black text-teal-800 dark:text-teal-300 font-mono">
                    {selectedDish.fiber || 5} <span className="text-xs font-semibold">g</span>
                  </div>
                </div>
              </div>

              {/* Nutrition Benefit Note */}
              {selectedDish.whyGood && (
                <div className="p-3.5 bg-emerald-50/90 dark:bg-emerald-950/50 border border-emerald-200/80 dark:border-emerald-800/70 rounded-2xl flex items-start space-x-2.5 text-xs text-emerald-900 dark:text-emerald-200">
                  <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Lời khuyên dinh dưỡng từ AI: </span>
                    <span className="text-emerald-800 dark:text-emerald-300">{selectedDish.whyGood}</span>
                  </div>
                </div>
              )}

              {/* Ingredients List with exact quantities */}
              <div className="bg-slate-50 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700/80 rounded-2xl p-4 sm:p-5">
                <h4 className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider mb-3 flex items-center space-x-1.5">
                  <Utensils className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Nguyên Liệu Cần Chuẩn Bị ({selectedDish.ingredients?.length || 0} mục)</span>
                </h4>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {selectedDish.ingredients?.map((item, idx) => (
                    <li
                      key={idx}
                      className="flex items-center space-x-2 bg-white dark:bg-slate-900/90 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-medium"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Step-by-Step Cooking Instructions */}
              <div className="bg-slate-50 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700/80 rounded-2xl p-4 sm:p-5">
                <h4 className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider mb-3 flex items-center space-x-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Hướng Dẫn Chế Biến Từng Bước</span>
                </h4>
                <div className="space-y-2.5">
                  {selectedDish.instructions?.map((step, idx) => (
                    <div
                      key={idx}
                      className="bg-white dark:bg-slate-900/90 p-3 rounded-xl border border-slate-100 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-200 flex items-start space-x-3"
                    >
                      <span className="w-5 h-5 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <p className="leading-relaxed flex-1 m-0">{step}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* ======================================================== */
            /* LEVEL 1: LIST OF SUGGESTED DISH CARDS                    */
            /* ======================================================== */
            <div className="space-y-3.5">
              <div className="flex items-center justify-between pb-1">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Chọn 1 món để xem công thức & nguyên liệu chi tiết:
                </span>
                <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                  {suggestions.length} món gợi ý
                </span>
              </div>

              {suggestions.map((dish, index) => (
                <div
                  key={index}
                  onClick={() => setSelectedDish(dish)}
                  className="bg-white dark:bg-slate-800/90 hover:bg-emerald-50/40 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700 hover:border-emerald-300 dark:hover:border-emerald-600 rounded-2xl p-4 transition-all duration-200 cursor-pointer shadow-xs hover:shadow-md group flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      {dish.tags?.slice(0, 2).map((tag, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-[10px] font-bold"
                        >
                          {tag}
                        </span>
                      ))}
                      {dish.prepTime && (
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 flex items-center space-x-0.5">
                          <Clock className="w-3 h-3" />
                          <span>{dish.prepTime}</span>
                        </span>
                      )}
                    </div>

                    <h4 className="text-sm sm:text-base font-extrabold text-slate-800 dark:text-white group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition">
                      {dish.name}
                    </h4>

                    <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">
                      {dish.whyGood}
                    </p>
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100 dark:border-slate-700">
                    <div className="text-left sm:text-right">
                      <span className="text-base font-black text-emerald-700 dark:text-emerald-400 font-mono">
                        {dish.calories} <span className="text-xs font-semibold">kcal</span>
                      </span>
                      <div className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">
                        P: {dish.protein}g | C: {dish.carbs}g | F: {dish.fat}g
                      </div>
                    </div>

                    <button
                      type="button"
                      className="mt-1 px-3 py-1 bg-emerald-50 dark:bg-emerald-950/60 group-hover:bg-emerald-600 text-emerald-700 dark:text-emerald-300 group-hover:text-white rounded-xl text-xs font-bold transition flex items-center space-x-1 cursor-pointer"
                    >
                      <span>Xem công thức</span>
                      <span>&rarr;</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ======================================================== */}
        {/* MODAL FOOTER (ACTION BUTTONS)                            */}
        {/* ======================================================== */}
        <div className="p-4 sm:p-5 bg-slate-50 dark:bg-slate-900/90 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0 transition-colors">
          {selectedDish ? (
            /* Controls for Level 2 (Detail popup) */
            <>
              {/* NÚT QUAY LẠI DANH SÁCH THEO YÊU CẦU CỦA NGƯỜI DÙNG */}
              <button
                type="button"
                onClick={() => setSelectedDish(null)}
                className="px-4 py-2.5 bg-slate-200/80 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-bold text-xs transition cursor-pointer flex items-center space-x-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Quay Lại Danh Sách Món</span>
              </button>

              {/* NÚT XÁC NHẬN THÊM MÓN */}
              <button
                type="button"
                disabled={addingMeal || !!successMsg}
                onClick={() => handleConfirmAddMeal(selectedDish)}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-md shadow-emerald-600/20 transition disabled:opacity-50 cursor-pointer flex items-center space-x-1.5"
              >
                {addingMeal ? (
                  <span className="inline-block animate-spin rounded-full h-3.5 w-3.5 border-2 border-white border-t-transparent" />
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Chọn & Thêm Vào Bữa Ăn</span>
                  </>
                )}
              </button>
            </>
          ) : (
            /* Controls for Level 1 (List of suggestions) */
            <>
              <button
                type="button"
                onClick={fetchSuggestions}
                disabled={loading}
                className="px-4 py-2.5 bg-slate-200/80 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-bold text-xs transition cursor-pointer flex items-center space-x-1.5 disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                <span>Đổi Loạt Món Khác</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl font-bold text-xs transition cursor-pointer"
              >
                Đóng
              </button>
            </>
          )}
        </div>

      </div>
    </div>
  );
}


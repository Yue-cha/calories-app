import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import {
  Plus,
  Trash2,
  Coffee,
  Sun,
  Moon,
  Cookie,
  Search,
  Check,
  Sparkles,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

const MEAL_TYPES = [
  { key: 'breakfast', label: 'Bữa Sáng', icon: Coffee, color: 'text-amber-600 bg-amber-50 border-amber-200' },
  { key: 'lunch', label: 'Bữa Trưa', icon: Sun, color: 'text-orange-600 bg-orange-50 border-orange-200' },
  { key: 'dinner', label: 'Bữa Tối', icon: Moon, color: 'text-indigo-600 bg-indigo-50 border-indigo-200' },
  { key: 'snack', label: 'Bữa Phụ / Ăn Vặt', icon: Cookie, color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
];

export default function MealTracker({ date, groupedMeals, onMealChanged }) {
  const [activeFormType, setActiveFormType] = useState('breakfast');
  const [showAddForm, setShowAddForm] = useState(false);
  const [loadingAdd, setLoadingAdd] = useState(false);

  // Manual entry form state
  const [mealForm, setMealForm] = useState({
    food_name: '',
    calories: '',
    protein: '',
    carbs: '',
    fat: '',
  });

  // Presets and search
  const [presets, setPresets] = useState([]);
  const [searchPreset, setSearchPreset] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Tất cả');

  useEffect(() => {
    api.getFoodPresets()
      .then((data) => setPresets(data.presets || []))
      .catch((err) => console.error('Presets error:', err));
  }, []);

  const handleSelectPreset = (preset) => {
    setMealForm({
      food_name: preset.name,
      calories: preset.calories.toString(),
      protein: (preset.protein || '').toString(),
      carbs: (preset.carbs || '').toString(),
      fat: (preset.fat || '').toString(),
    });
  };

  const handleQuickAddPreset = async (preset, mealType) => {
    try {
      await api.addMeal({
        date,
        meal_type: mealType,
        food_name: preset.name,
        calories: preset.calories,
        protein: preset.protein,
        carbs: preset.carbs,
        fat: preset.fat,
      });
      onMealChanged();
    } catch (err) {
      alert(err.message || 'Lỗi khi thêm món');
    }
  };

  const handleAddMealSubmit = async (e) => {
    e.preventDefault();
    if (!mealForm.food_name || !mealForm.calories) {
      alert('Vui lòng nhập tên món và lượng calo');
      return;
    }

    setLoadingAdd(true);
    try {
      await api.addMeal({
        date,
        meal_type: activeFormType,
        food_name: mealForm.food_name,
        calories: mealForm.calories,
        protein: mealForm.protein || 0,
        carbs: mealForm.carbs || 0,
        fat: mealForm.fat || 0,
      });
      setMealForm({ food_name: '', calories: '', protein: '', carbs: '', fat: '' });
      setShowAddForm(false);
      onMealChanged();
    } catch (err) {
      alert(err.message || 'Lỗi khi thêm món');
    } finally {
      setLoadingAdd(false);
    }
  };

  const handleDeleteMeal = async (mealId) => {
    if (!confirm('Bạn có chắc chắn muốn xóa món ăn này?')) return;
    try {
      await api.deleteMeal(mealId);
      onMealChanged();
    } catch (err) {
      alert(err.message || 'Lỗi khi xóa món');
    }
  };

  const filteredPresets = presets.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(searchPreset.toLowerCase());
    const matchesCat = selectedCategory === 'Tất cả' || p.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const categories = ['Tất cả', ...new Set(presets.map((p) => p.category).filter(Boolean))];

  return (
    <div className="space-y-6">
      {/* Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm">
        <div>
          <h2 className="text-lg font-bold text-slate-800 m-0">Nhật Ký Dinh Dưỡng Hàng Ngày</h2>
          <p className="text-xs text-slate-500 font-medium">
            Ghi lại các món ăn trong ngày để hệ thống tự động trừ vào lượng calo còn lại
          </p>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="inline-flex items-center justify-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-2xl font-bold text-xs shadow-md shadow-emerald-600/20 transition cursor-pointer"
        >
          {showAddForm ? (
            <>
              <ChevronUp className="w-4 h-4" />
              <span>Đóng biểu mẫu</span>
            </>
          ) : (
            <>
              <Plus className="w-4 h-4" />
              <span>+ Nhập Món Ăn Mới</span>
            </>
          )}
        </button>
      </div>

      {/* MANUAL ENTRY MODAL / DRAWER */}
      {showAddForm && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-emerald-200 shadow-lg animate-in fade-in duration-200">
          <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-100">
            <div className="flex items-center space-x-2">
              <span className="w-2 h-6 bg-emerald-500 rounded-full inline-block"></span>
              <h3 className="font-bold text-slate-800 text-base">Thêm Món Ăn Vào Thực Đơn</h3>
            </div>
            <span className="text-xs text-slate-400">Chọn bữa ăn tương ứng</span>
          </div>

          {/* Select Meal Type Pills */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-6">
            {MEAL_TYPES.map((type) => {
              const Icon = type.icon;
              const isSelected = activeFormType === type.key;
              return (
                <button
                  key={type.key}
                  type="button"
                  onClick={() => setActiveFormType(type.key)}
                  className={`flex items-center space-x-2.5 p-3 rounded-2xl border text-xs font-bold transition cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-600/20'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{type.label}</span>
                </button>
              );
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Form: Manual Input */}
            <form onSubmit={handleAddMealSubmit} className="lg:col-span-7 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Tên món ăn / đồ uống *
                </label>
                <input
                  type="text"
                  required
                  value={mealForm.food_name}
                  onChange={(e) => setMealForm({ ...mealForm, food_name: e.target.value })}
                  placeholder="Ví dụ: Phở bò, Cơm sườn, 1 ly Sữa đậu nành..."
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-bold text-amber-700 uppercase tracking-wider mb-1">
                    Calo (kcal) *
                  </label>
                  <input
                    type="number"
                    step="1"
                    min="0"
                    required
                    value={mealForm.calories}
                    onChange={(e) => setMealForm({ ...mealForm, calories: e.target.value })}
                    placeholder="vd: 450"
                    className="w-full px-3 py-2.5 bg-amber-50/50 border border-amber-200 rounded-xl text-slate-800 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Đạm / Protein (g)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    value={mealForm.protein}
                    onChange={(e) => setMealForm({ ...mealForm, protein: e.target.value })}
                    placeholder="vd: 25"
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Tinh bột / Carb (g)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    value={mealForm.carbs}
                    onChange={(e) => setMealForm({ ...mealForm, carbs: e.target.value })}
                    placeholder="vd: 60"
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Béo / Fat (g)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    value={mealForm.fat}
                    onChange={(e) => setMealForm({ ...mealForm, fat: e.target.value })}
                    placeholder="vd: 12"
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center space-x-3">
                <button
                  type="submit"
                  disabled={loadingAdd}
                  className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl shadow-md shadow-emerald-600/30 flex items-center justify-center space-x-2 transition cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Xác Nhận Thêm Vào Bữa Ăn</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-5 py-3 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-2xl text-xs font-semibold cursor-pointer"
                >
                  Hủy
                </button>
              </div>
            </form>

            {/* Right Form: Quick Vietnamese Food Suggestions */}
            <div className="lg:col-span-5 bg-slate-50 rounded-2xl p-4 border border-slate-200/80">
              <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-700 mb-2.5">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>Gợi ý món ăn phổ biến (Bấm để điền nhanh)</span>
              </div>

              {/* Search input for presets */}
              <div className="relative mb-3">
                <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  value={searchPreset}
                  onChange={(e) => setSearchPreset(e.target.value)}
                  placeholder="Tìm món: phở, cơm, trứng, ức gà..."
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Presets List */}
              <div className="max-h-56 overflow-y-auto space-y-1.5 pr-1">
                {filteredPresets.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-4">Không tìm thấy món phù hợp</p>
                ) : (
                  filteredPresets.map((preset) => (
                    <div
                      key={preset.id}
                      onClick={() => handleSelectPreset(preset)}
                      className="flex items-center justify-between p-2 rounded-xl bg-white hover:bg-emerald-50/70 border border-slate-200/60 hover:border-emerald-300 transition cursor-pointer group"
                    >
                      <div className="text-left">
                        <div className="text-xs font-semibold text-slate-800 group-hover:text-emerald-900">
                          {preset.name}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          P: {preset.protein}g | C: {preset.carbs}g | F: {preset.fat}g
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-extrabold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-lg">
                          {preset.calories} kcal
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Grouped Meals List */}
      <div className="space-y-4">
        {MEAL_TYPES.map((type) => {
          const Icon = type.icon;
          const meals = groupedMeals[type.key] || [];
          const totalCal = meals.reduce((sum, m) => sum + (parseFloat(m.calories) || 0), 0);

          return (
            <div
              key={type.key}
              className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-sm overflow-hidden"
            >
              {/* Category Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center space-x-3">
                  <div className={`p-2.5 rounded-2xl border ${type.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 text-sm m-0">{type.label}</h3>
                    <span className="text-[11px] text-slate-400 font-medium">
                      {meals.length} món đã ghi nhận
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="text-right">
                    <span className="text-xs font-black text-slate-800">{Math.round(totalCal)}</span>
                    <span className="text-[10px] text-slate-400 ml-1">kcal</span>
                  </div>
                  <button
                    onClick={() => {
                      setActiveFormType(type.key);
                      setShowAddForm(true);
                      window.scrollTo({ top: 200, behavior: 'smooth' });
                    }}
                    title="Thêm món vào bữa này"
                    className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-xl transition cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Meal Items */}
              {meals.length === 0 ? (
                <div className="py-6 text-center text-slate-400 text-xs">
                  Chưa có món ăn nào trong {type.label.toLowerCase()}.
                </div>
              ) : (
                <div className="divide-y divide-slate-100 mt-2">
                  {meals.map((meal) => (
                    <div
                      key={meal.id}
                      className="py-3 flex items-center justify-between hover:bg-slate-50/80 px-2 rounded-xl transition group"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                        <div>
                          <div className="text-xs font-bold text-slate-800">{meal.food_name}</div>
                          <div className="text-[11px] text-slate-400 space-x-2">
                            <span>{meal.calories} kcal</span>
                            {meal.protein > 0 && <span>• Đạm: {meal.protein}g</span>}
                            {meal.carbs > 0 && <span>• Carb: {meal.carbs}g</span>}
                            {meal.fat > 0 && <span>• Béo: {meal.fat}g</span>}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-black text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg">
                          +{meal.calories} kcal
                        </span>
                        <button
                          onClick={() => handleDeleteMeal(meal.id)}
                          title="Xóa món ăn"
                          className="p-1.5 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}


import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import {
  X,
  User,
  Scale,
  Ruler,
  Activity,
  Target,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

export default function ProfileModal({ isOpen, onClose }) {
  const { user, profile, refreshProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    gender: 'male',
    age: 25,
    height: 170,
    weight: 65,
    target_weight: 65,
    activity_level: 'moderate',
    goal: 'maintain',
    custom_calorie_target: '',
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        gender: profile.gender || 'male',
        age: profile.age || 25,
        height: profile.height || 170,
        weight: profile.weight || 65,
        target_weight: profile.target_weight || 65,
        activity_level: profile.activity_level || 'moderate',
        goal: profile.goal || 'maintain',
        custom_calorie_target: profile.custom_calorie_target || '',
      });
    }
  }, [profile, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);
    try {
      await api.updateProfile(formData);
      await refreshProfile();
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 1200);
    } catch (err) {
      alert(err.message || 'Lỗi cập nhật hồ sơ');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden">
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-5 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white m-0">Hồ Sơ Sức Khỏe Cá Nhân</h3>
              <p className="text-[11px] text-slate-400">{user?.full_name} (@{user?.username})</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-white/10 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-left">
          {success && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-2xl flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Cập nhật hồ sơ thành công! Đang đồng bộ dữ liệu...</span>
            </div>
          )}

          {/* Gender & Age */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Giới tính
              </label>
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, gender: 'male' })}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold border transition cursor-pointer ${
                    formData.gender === 'male'
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-800'
                      : 'border-slate-200 text-slate-600'
                  }`}
                >
                  Nam ♂
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, gender: 'female' })}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold border transition cursor-pointer ${
                    formData.gender === 'female'
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-800'
                      : 'border-slate-200 text-slate-600'
                  }`}
                >
                  Nữ ♀
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Tuổi
              </label>
              <input
                type="number"
                min="10"
                max="100"
                required
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Height, Weight, Target Weight */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Chiều cao (cm)
              </label>
              <input
                type="number"
                step="0.5"
                min="100"
                max="250"
                required
                value={formData.height}
                onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Cân nặng (kg)
              </label>
              <input
                type="number"
                step="0.1"
                min="30"
                max="250"
                required
                value={formData.weight}
                onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Mục tiêu (kg)
              </label>
              <input
                type="number"
                step="0.1"
                min="30"
                max="250"
                required
                value={formData.target_weight}
                onChange={(e) => setFormData({ ...formData, target_weight: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Activity Level */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Mức độ vận động
            </label>
            <select
              value={formData.activity_level}
              onChange={(e) => setFormData({ ...formData, activity_level: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="sedentary">Ít vận động (văn phòng) [x1.2]</option>
              <option value="light">Vận động nhẹ (1-3 ngày/tuần) [x1.375]</option>
              <option value="moderate">Vận động vừa (3-5 ngày/tuần) [x1.55]</option>
              <option value="active">Nhiều vận động (6-7 ngày/tuần) [x1.725]</option>
              <option value="very_active">Rất năng động (vận động viên) [x1.9]</option>
            </select>
          </div>

          {/* Goal */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Mục tiêu thể chất
            </label>
            <select
              value={formData.goal}
              onChange={(e) => setFormData({ ...formData, goal: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="lose_fast">Giảm cân nhanh (-500 kcal/ngày)</option>
              <option value="lose_normal">Giảm cân an toàn (-300 kcal/ngày)</option>
              <option value="maintain">Duy trì cân nặng (Giữ dáng)</option>
              <option value="gain_normal">Tăng cân an toàn (+300 kcal/ngày)</option>
              <option value="gain_fast">Tăng cân nhanh (+500 kcal/ngày)</option>
            </select>
          </div>

          {/* Custom calorie override */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
              Tùy chỉnh mức calo mục tiêu (để trống nếu muốn hệ thống tự tính)
            </label>
            <input
              type="number"
              placeholder="Để trống để tự tính tự động"
              value={formData.custom_calorie_target}
              onChange={(e) => setFormData({ ...formData, custom_calorie_target: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Submit */}
          <div className="pt-3 flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 border border-slate-200 text-slate-700 font-bold rounded-2xl hover:bg-slate-50 text-xs cursor-pointer"
            >
              Đóng
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl shadow-lg shadow-emerald-600/30 text-xs transition cursor-pointer disabled:opacity-50"
            >
              {loading ? 'Đang lưu...' : 'Lưu Thay Đổi'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


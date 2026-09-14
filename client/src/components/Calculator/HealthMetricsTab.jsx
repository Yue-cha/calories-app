import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import {
  Activity,
  Flame,
  Scale,
  Ruler,
  Droplets,
  Heart,
  Target,
  Sparkles,
  RefreshCw,
  CheckCircle2,
  HelpCircle,
} from 'lucide-react';

export default function HealthMetricsTab() {
  const { profile, computedStats, refreshProfile } = useAuth();

  // Simulation state initialized with current profile
  const [simForm, setSimForm] = useState({
    gender: profile?.gender || 'male',
    age: profile?.age || 25,
    height: profile?.height || 170,
    weight: profile?.weight || 65,
    activity_level: profile?.activity_level || 'moderate',
    goal: profile?.goal || 'maintain',
  });

  const [simResult, setSimResult] = useState(null);
  const [applying, setApplying] = useState(false);
  const [applySuccess, setApplySuccess] = useState(false);

  // Instant calculation for simulation
  const calculateSimStats = () => {
    const w = parseFloat(simForm.weight) || 65;
    const h = parseFloat(simForm.height) || 170;
    const a = parseInt(simForm.age, 10) || 25;

    // BMR
    const bmr = Math.round(
      simForm.gender === 'female'
        ? 10 * w + 6.25 * h - 5 * a - 161
        : 10 * w + 6.25 * h - 5 * a + 5
    );

    // TDEE
    const mults = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      active: 1.725,
      very_active: 1.9,
    };
    const tdee = Math.round(bmr * (mults[simForm.activity_level] || 1.2));

    // Goal target
    const diffs = {
      lose_fast: -500,
      lose_normal: -300,
      maintain: 0,
      gain_normal: 300,
      gain_fast: 500,
    };
    const targetCalories = Math.max(1200, Math.round(tdee + (diffs[simForm.goal] || 0)));

    // BMI
    const hm = h / 100;
    const bmi = parseFloat((w / (hm * hm)).toFixed(1));
    let bmiStatus = 'Bình thường';
    let bmiColor = 'emerald';
    if (bmi < 18.5) {
      bmiStatus = 'Thiếu cân';
      bmiColor = 'blue';
    } else if (bmi < 24.9) {
      bmiStatus = 'Bình thường';
      bmiColor = 'emerald';
    } else if (bmi < 29.9) {
      bmiStatus = 'Thừa cân';
      bmiColor = 'amber';
    } else {
      bmiStatus = 'Béo phì';
      bmiColor = 'rose';
    }

    // Macros
    const protein = Math.round((targetCalories * 0.25) / 4);
    const carbs = Math.round((targetCalories * 0.5) / 4);
    const fat = Math.round((targetCalories * 0.25) / 9);

    // Water
    const water = parseFloat((w * 0.035).toFixed(1));

    return {
      bmr,
      tdee,
      targetCalories,
      bmi,
      bmiStatus,
      bmiColor,
      macros: { protein, carbs, fat },
      water,
    };
  };

  const activeStats = simResult || (computedStats || calculateSimStats());

  const handleApplyToProfile = async () => {
    setApplying(true);
    setApplySuccess(false);
    try {
      await api.updateProfile(simForm);
      await refreshProfile();
      setApplySuccess(true);
      setTimeout(() => setApplySuccess(false), 3000);
    } catch (err) {
      alert(err.message || 'Lỗi cập nhật hồ sơ');
    } finally {
      setApplying(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Introduction Card */}
      <div className="bg-gradient-to-r from-emerald-700 via-teal-700 to-slate-800 rounded-3xl p-6 sm:p-8 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur px-3 py-1 rounded-full text-xs font-semibold text-emerald-200 mb-3">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Tiêu Chuẩn Khoa Học Mifflin - St Jeor</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mb-2">
            Tính Toán Năng Lượng & Chỉ Số Cơ Thể
          </h2>
          <p className="text-emerald-100 text-xs sm:text-sm leading-relaxed">
            Dựa trên các chỉ số sinh trắc học cá nhân gồm cân nặng, chiều cao, độ tuổi và mức độ vận động,
            hệ thống tính toán chính xác mức năng lượng cơ thể tiêu thụ tự nhiên và thiết lập lượng calo mục tiêu mỗi ngày.
          </p>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* BMR Card */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Chỉ số BMR</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-black text-slate-800">
              {activeStats.bmr} <span className="text-sm font-semibold text-slate-400">kcal</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Năng lượng tối thiểu cần để duy trì sự sống khi nghỉ ngơi.
            </p>
          </div>
        </div>

        {/* TDEE Card */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Chỉ số TDEE</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-black text-amber-700">
              {activeStats.tdee} <span className="text-sm font-semibold text-slate-400">kcal</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Tổng calo tiêu hao mỗi ngày (BMR + Vận động thể chất).
            </p>
          </div>
        </div>

        {/* BMI Card */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Chỉ số BMI</span>
            <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
              <Scale className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline space-x-2">
              <span className="text-3xl font-black text-slate-800">{activeStats.bmi}</span>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                {activeStats.bmiStatus}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Chỉ số khối cơ thể (chuẩn thể trạng châu Á 18.5 - 24.9).
            </p>
          </div>
        </div>

        {/* Water Card */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Nước khuyến nghị</span>
            <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
              <Droplets className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-black text-sky-700">
              {activeStats.water} <span className="text-sm font-semibold text-slate-400">Lít/ngày</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Mức nước tối ưu để cơ thể trao đổi chất tốt nhất.
            </p>
          </div>
        </div>
      </div>

      {/* INTERACTIVE WHAT-IF SIMULATOR */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm">
        <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-100">
          <div className="flex items-center space-x-2.5">
            <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
            <div>
              <h3 className="text-base font-bold text-slate-800 m-0">Công Cụ Thử Nghiệm & Tùy Chỉnh Chỉ Số</h3>
              <p className="text-xs text-slate-400">
                Thay đổi các chỉ số bên dưới để xem sự thay đổi calo ngay lập tức
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              setSimForm({
                gender: profile?.gender || 'male',
                age: profile?.age || 25,
                height: profile?.height || 170,
                weight: profile?.weight || 65,
                activity_level: profile?.activity_level || 'moderate',
                goal: profile?.goal || 'maintain',
              });
              setSimResult(null);
            }}
            className="text-xs text-slate-500 hover:text-emerald-700 flex items-center space-x-1 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Đặt lại theo hồ sơ</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Controls */}
          <div className="md:col-span-7 space-y-5 text-left">
            {/* Gender and Age */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Giới tính
                </label>
                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={() => {
                      const updated = { ...simForm, gender: 'male' };
                      setSimForm(updated);
                    }}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold border transition cursor-pointer ${
                      simForm.gender === 'male'
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    Nam ♂
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const updated = { ...simForm, gender: 'female' };
                      setSimForm(updated);
                    }}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold border transition cursor-pointer ${
                      simForm.gender === 'female'
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    Nữ ♀
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Tuổi ({simForm.age})
                </label>
                <input
                  type="range"
                  min="15"
                  max="80"
                  value={simForm.age}
                  onChange={(e) => setSimForm({ ...simForm, age: parseInt(e.target.value, 10) })}
                  className="w-full accent-emerald-600 cursor-pointer"
                />
              </div>
            </div>

            {/* Height Slider */}
            <div>
              <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                <span className="uppercase tracking-wider">Chiều cao</span>
                <span className="text-emerald-700">{simForm.height} cm</span>
              </div>
              <input
                type="range"
                min="130"
                max="210"
                step="1"
                value={simForm.height}
                onChange={(e) => setSimForm({ ...simForm, height: parseFloat(e.target.value) })}
                className="w-full accent-emerald-600 cursor-pointer"
              />
            </div>

            {/* Weight Slider */}
            <div>
              <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                <span className="uppercase tracking-wider">Cân nặng</span>
                <span className="text-emerald-700">{simForm.weight} kg</span>
              </div>
              <input
                type="range"
                min="35"
                max="140"
                step="0.5"
                value={simForm.weight}
                onChange={(e) => setSimForm({ ...simForm, weight: parseFloat(e.target.value) })}
                className="w-full accent-emerald-600 cursor-pointer"
              />
            </div>

            {/* Activity Level */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Mức độ vận động
              </label>
              <select
                value={simForm.activity_level}
                onChange={(e) => setSimForm({ ...simForm, activity_level: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="sedentary">Ít vận động (làm việc văn phòng, ít đi lại) [x1.2]</option>
                <option value="light">Vận động nhẹ (tập luyện nhẹ 1-3 ngày/tuần) [x1.375]</option>
                <option value="moderate">Vận động vừa (tập thể dục 3-5 ngày/tuần) [x1.55]</option>
                <option value="active">Nhiều vận động (tập thể thao nặng 6-7 ngày/tuần) [x1.725]</option>
                <option value="very_active">Rất nặng (vận động viên, tập 2 lần/ngày) [x1.9]</option>
              </select>
            </div>

            {/* Goal */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Mục tiêu
              </label>
              <select
                value={simForm.goal}
                onChange={(e) => setSimForm({ ...simForm, goal: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="lose_fast">Giảm cân nhanh (-500 kcal/ngày)</option>
                <option value="lose_normal">Giảm cân an toàn (-300 kcal/ngày)</option>
                <option value="maintain">Duy trì cân nặng hiện tại (Giữ dáng)</option>
                <option value="gain_normal">Tăng cân an toàn (+300 kcal/ngày)</option>
                <option value="gain_fast">Tăng cân nhanh (+500 kcal/ngày)</option>
              </select>
            </div>
          </div>

          {/* Results preview & Apply */}
          <div className="md:col-span-5 bg-gradient-to-b from-slate-50 to-emerald-50/40 rounded-3xl p-6 border border-emerald-200/80 flex flex-col justify-between">
            <div>
              <div className="text-xs font-bold text-emerald-800 uppercase tracking-wider mb-4">
                Kết Quả Tính Toán Tương Ứng
              </div>

              {(() => {
                const s = calculateSimStats();
                return (
                  <div className="space-y-4">
                    <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                      <span className="text-[11px] text-slate-400 font-bold uppercase">Mục tiêu Calo mới</span>
                      <div className="text-3xl font-black text-emerald-700">
                        {s.targetCalories} <span className="text-sm font-semibold text-slate-500">kcal/ngày</span>
                      </div>
                      <span className="text-[11px] text-slate-500">
                        {simForm.goal.includes('lose')
                          ? 'Mức thâm hụt calo giúp giảm mỡ hiệu quả'
                          : simForm.goal.includes('gain')
                          ? 'Mức calo thặng dư hỗ trợ xây dựng cơ bắp'
                          : 'Mức calo cân bằng để duy trì thể trạng'}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center text-xs">
                      <div className="bg-white p-2.5 rounded-xl border border-slate-100">
                        <span className="text-[10px] text-indigo-600 font-bold">Đạm</span>
                        <div className="font-extrabold text-slate-800">{s.macros.protein}g</div>
                      </div>
                      <div className="bg-white p-2.5 rounded-xl border border-slate-100">
                        <span className="text-[10px] text-amber-600 font-bold">Carb</span>
                        <div className="font-extrabold text-slate-800">{s.macros.carbs}g</div>
                      </div>
                      <div className="bg-white p-2.5 rounded-xl border border-slate-100">
                        <span className="text-[10px] text-rose-600 font-bold">Béo</span>
                        <div className="font-extrabold text-slate-800">{s.macros.fat}g</div>
                      </div>
                    </div>

                    <div className="text-xs text-slate-500 space-y-1 pt-2">
                      <div className="flex justify-between">
                        <span>BMR tương ứng:</span>
                        <span className="font-bold text-slate-700">{s.bmr} kcal</span>
                      </div>
                      <div className="flex justify-between">
                        <span>TDEE tiêu thụ:</span>
                        <span className="font-bold text-slate-700">{s.tdee} kcal</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Chỉ số BMI:</span>
                        <span className="font-bold text-emerald-700">{s.bmi} ({s.bmiStatus})</span>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>

            <div className="pt-6">
              {applySuccess && (
                <div className="mb-3 p-2.5 bg-emerald-100 border border-emerald-300 rounded-xl text-xs font-bold text-emerald-800 flex items-center space-x-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                  <span>Đã lưu thành công vào hồ sơ sức khỏe!</span>
                </div>
              )}

              <button
                type="button"
                onClick={handleApplyToProfile}
                disabled={applying}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl shadow-md shadow-emerald-600/30 flex items-center justify-center space-x-2 transition cursor-pointer disabled:opacity-50"
              >
                {applying ? (
                  <span className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                ) : (
                  <>
                    <Target className="w-4 h-4" />
                    <span>Áp Dụng Vào Hồ Sơ Cá Nhân Của Tôi</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


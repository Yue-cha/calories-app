import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  User,
  Lock,
  Flame,
  Scale,
  Ruler,
  Activity,
  Target,
  Heart,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Sparkles,
} from 'lucide-react';

export default function AuthModal() {
  const { login, register } = useAuth();
  const [isLoginView, setIsLoginView] = useState(true);
  const [registerStep, setRegisterStep] = useState(1); // 1: Account info, 2: Health profile
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Login form state
  const [loginForm, setLoginForm] = useState({
    username: '',
    password: '',
  });

  // Register form state
  const [regForm, setRegForm] = useState({
    username: '',
    password: '',
    full_name: '',
    gender: 'male',
    age: 25,
    height: 170,
    weight: 65,
    target_weight: 65,
    activity_level: 'moderate',
    goal: 'maintain',
  });

  // Quick live BMR & TDEE calculation preview for registration step 2
  const previewBmr = Math.round(
    regForm.gender === 'female'
      ? 10 * Number(regForm.weight) + 6.25 * Number(regForm.height) - 5 * Number(regForm.age) - 161
      : 10 * Number(regForm.weight) + 6.25 * Number(regForm.height) - 5 * Number(regForm.age) + 5
  );

  const actMultipliers = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    very_active: 1.9,
  };

  const previewTdee = Math.round(previewBmr * (actMultipliers[regForm.activity_level] || 1.2));

  const goalDiff = {
    lose_fast: -500,
    lose_normal: -300,
    maintain: 0,
    gain_normal: 300,
    gain_fast: 500,
  }[regForm.goal] || 0;

  const previewTarget = Math.max(1200, previewTdee + goalDiff);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(loginForm.username, loginForm.password);
    } catch (err) {
      setError(err.message || 'Đăng nhập không thành công');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(regForm);
    } catch (err) {
      setError(err.message || 'Đăng ký không thành công');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 transition-all duration-300">
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 px-8 py-8 text-white relative">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center shadow-inner">
              <Flame className="w-7 h-7 text-amber-300 fill-amber-300" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white m-0">CaloTrack</h1>
              <p className="text-emerald-100 text-xs font-medium">Hệ Thống Quản Lý Dinh Dưỡng & Hồ Sơ Thể Trạng</p>
            </div>
          </div>

          <div className="mt-4 flex items-center space-x-2 text-xs text-emerald-100 bg-white/10 rounded-xl px-3 py-2">
            <Sparkles className="w-4 h-4 text-amber-300 shrink-0" />
            <span>Xác thực danh tính trước khi sử dụng hệ thống tính toán và theo dõi calo hàng ngày.</span>
          </div>

          {/* Toggle Tab Login / Register */}
          <div className="mt-6 flex bg-emerald-900/40 p-1 rounded-2xl backdrop-blur-sm border border-emerald-500/30">
            <button
              type="button"
              onClick={() => {
                setIsLoginView(true);
                setError('');
              }}
              className={`flex-1 py-2.5 text-sm font-semibold rounded-xl transition-all cursor-pointer ${
                isLoginView
                  ? 'bg-white text-emerald-900 shadow-md'
                  : 'text-emerald-100 hover:text-white'
              }`}
            >
              Đã có hồ sơ (Đăng nhập)
            </button>
            <button
              type="button"
              onClick={() => {
                setIsLoginView(false);
                setError('');
              }}
              className={`flex-1 py-2.5 text-sm font-semibold rounded-xl transition-all cursor-pointer ${
                !isLoginView
                  ? 'bg-white text-emerald-900 shadow-md'
                  : 'text-emerald-100 hover:text-white'
              }`}
            >
              Tạo hồ sơ mới (Đăng ký)
            </button>
          </div>
        </div>

        {/* Form Body */}
        <div className="p-8">
          {error && (
            <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-start space-x-3 text-rose-700 text-sm">
              <AlertCircle className="w-5 h-5 shrink-0 text-rose-500 mt-0.5" />
              <div>
                <p className="font-semibold">Thông báo</p>
                <p>{error}</p>
              </div>
            </div>
          )}

          {/* VIEW 1: ĐĂNG NHẬP */}
          {isLoginView ? (
            <form onSubmit={handleLoginSubmit} className="space-y-5">
              <div className="text-left">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Tên đăng nhập
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <User className="w-5 h-5" />
                  </div>
                  <input
                    type="text"
                    required
                    value={loginForm.username}
                    onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
                    placeholder="Nhập tên đăng nhập của bạn"
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
                  />
                </div>
              </div>

              <div className="text-left">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Mật khẩu
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-5 h-5" />
                  </div>
                  <input
                    type="password"
                    required
                    value={loginForm.password}
                    onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                    placeholder="Nhập mật khẩu"
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl shadow-lg shadow-emerald-600/30 flex items-center justify-center space-x-2 transition disabled:opacity-50 cursor-pointer"
                >
                  {loading ? (
                    <span className="inline-block animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                  ) : (
                    <>
                      <span>Đăng Nhập & Tải Hồ Sơ</span>
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </div>

              <div className="text-center pt-3 text-xs text-slate-500">
                Chưa có hồ sơ sức khỏe cá nhân?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setIsLoginView(false);
                    setError('');
                  }}
                  className="text-emerald-600 font-bold hover:underline cursor-pointer"
                >
                  Tạo tài khoản & thiết lập hồ sơ ngay
                </button>
              </div>
            </form>
          ) : (
            /* VIEW 2: ĐĂNG KÝ + KHỞI TẠO HỒ SƠ */
            <form onSubmit={handleRegisterSubmit} className="space-y-6">
              {/* Stepper indicators */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center space-x-2">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                      registerStep === 1 ? 'bg-emerald-600 text-white' : 'bg-emerald-100 text-emerald-700'
                    }`}
                  >
                    1
                  </div>
                  <span className={`text-xs font-bold ${registerStep === 1 ? 'text-slate-800' : 'text-slate-400'}`}>
                    Tài khoản
                  </span>
                </div>
                <div className="w-12 h-0.5 bg-slate-200"></div>
                <div className="flex items-center space-x-2">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                      registerStep === 2 ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    2
                  </div>
                  <span className={`text-xs font-bold ${registerStep === 2 ? 'text-slate-800' : 'text-slate-400'}`}>
                    Hồ sơ thể trạng
                  </span>
                </div>
              </div>

              {/* STEP 1: THÔNG TIN TÀI KHOẢN */}
              {registerStep === 1 && (
                <div className="space-y-4 text-left">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Họ và tên
                    </label>
                    <input
                      type="text"
                      required
                      value={regForm.full_name}
                      onChange={(e) => setRegForm({ ...regForm, full_name: e.target.value })}
                      placeholder="Ví dụ: Nguyễn Văn A"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Tên đăng nhập
                    </label>
                    <input
                      type="text"
                      required
                      value={regForm.username}
                      onChange={(e) => setRegForm({ ...regForm, username: e.target.value })}
                      placeholder="Ít nhất 3 ký tự (vd: nguyenvana)"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Mật khẩu
                    </label>
                    <input
                      type="password"
                      required
                      value={regForm.password}
                      onChange={(e) => setRegForm({ ...regForm, password: e.target.value })}
                      placeholder="Tối thiểu 6 ký tự"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div className="pt-3">
                    <button
                      type="button"
                      onClick={() => {
                        if (!regForm.full_name || !regForm.username || !regForm.password) {
                          setError('Vui lòng điền đầy đủ họ tên, tên đăng nhập và mật khẩu');
                          return;
                        }
                        if (regForm.password.length < 6) {
                          setError('Mật khẩu cần tối thiểu 6 ký tự');
                          return;
                        }
                        setError('');
                        setRegisterStep(2);
                      }}
                      className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl flex items-center justify-center space-x-2 transition cursor-pointer"
                    >
                      <span>Tiếp theo: Thiết lập hồ sơ thể trạng</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 2: THIẾT LẬP HỒ SƠ THỂ TRẠNG */}
              {registerStep === 2 && (
                <div className="space-y-4 text-left">
                  {/* Gender and Age */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Giới tính
                      </label>
                      <div className="flex space-x-2">
                        <button
                          type="button"
                          onClick={() => setRegForm({ ...regForm, gender: 'male' })}
                          className={`flex-1 py-2 rounded-xl text-xs font-bold border transition cursor-pointer ${
                            regForm.gender === 'male'
                              ? 'bg-emerald-50 border-emerald-500 text-emerald-800'
                              : 'border-slate-200 text-slate-600'
                          }`}
                        >
                          Nam ♂
                        </button>
                        <button
                          type="button"
                          onClick={() => setRegForm({ ...regForm, gender: 'female' })}
                          className={`flex-1 py-2 rounded-xl text-xs font-bold border transition cursor-pointer ${
                            regForm.gender === 'female'
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
                        value={regForm.age}
                        onChange={(e) => setRegForm({ ...regForm, age: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
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
                        value={regForm.height}
                        onChange={(e) => setRegForm({ ...regForm, height: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
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
                        value={regForm.weight}
                        onChange={(e) => setRegForm({ ...regForm, weight: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
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
                        value={regForm.target_weight}
                        onChange={(e) => setRegForm({ ...regForm, target_weight: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  </div>

                  {/* Activity Level */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Mức độ vận động hàng tuần
                    </label>
                    <select
                      value={regForm.activity_level}
                      onChange={(e) => setRegForm({ ...regForm, activity_level: e.target.value })}
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs"
                    >
                      <option value="sedentary">Ít vận động (làm việc văn phòng, không tập thể dục) [x1.2]</option>
                      <option value="light">Vận động nhẹ (tập luyện nhẹ 1-3 ngày/tuần) [x1.375]</option>
                      <option value="moderate">Vận động vừa (tập luyện vừa 3-5 ngày/tuần) [x1.55]</option>
                      <option value="active">Vận động nhiều (tập thể thao 6-7 ngày/tuần) [x1.725]</option>
                      <option value="very_active">Rất năng động (vận động viên, công việc nặng) [x1.9]</option>
                    </select>
                  </div>

                  {/* Goal */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Mục tiêu thể chất
                    </label>
                    <select
                      value={regForm.goal}
                      onChange={(e) => setRegForm({ ...regForm, goal: e.target.value })}
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs"
                    >
                      <option value="lose_fast">Giảm cân nhanh (-500 kcal/ngày)</option>
                      <option value="lose_normal">Giảm cân an toàn (-300 kcal/ngày)</option>
                      <option value="maintain">Duy trì cân nặng hiện tại (Giữ dáng)</option>
                      <option value="gain_normal">Tăng cân an toàn (+300 kcal/ngày)</option>
                      <option value="gain_fast">Tăng cân & cơ nhanh (+500 kcal/ngày)</option>
                    </select>
                  </div>

                  {/* Live Calculation Preview Card */}
                  <div className="bg-emerald-50/80 border border-emerald-200 rounded-2xl p-3.5 flex items-center justify-between">
                    <div>
                      <div className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">
                        Chỉ số dự kiến của bạn
                      </div>
                      <div className="text-xs text-emerald-700 mt-0.5">
                        BMR: <span className="font-bold">{previewBmr}</span> kcal | TDEE: <span className="font-bold">{previewTdee}</span> kcal
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] text-emerald-600 font-semibold">Mục tiêu calo/ngày</div>
                      <div className="text-lg font-extrabold text-emerald-900">{previewTarget} <span className="text-xs font-normal">kcal</span></div>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex space-x-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setRegisterStep(1)}
                      className="px-4 py-3 border border-slate-200 text-slate-700 rounded-2xl hover:bg-slate-50 font-semibold text-xs flex items-center space-x-1 cursor-pointer"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>Quay lại</span>
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl shadow-lg shadow-emerald-600/30 flex items-center justify-center space-x-2 transition disabled:opacity-50 cursor-pointer"
                    >
                      {loading ? (
                        <span className="inline-block animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                      ) : (
                        <>
                          <CheckCircle2 className="w-5 h-5" />
                          <span>Lưu Hồ Sơ & Bắt Đầu Sử Dụng</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </form>
          )}
        </div>
      </div>
    </div>
  );
}


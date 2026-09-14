import React from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Flame,
  User,
  Calendar,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Sliders,
  Sparkles,
} from 'lucide-react';

export default function Navbar({
  selectedDate,
  onDateChange,
  onOpenProfile,
  activeTab,
  setActiveTab,
}) {
  const { user, profile, computedStats, logout } = useAuth();

  const handlePrevDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() - 1);
    onDateChange(d.toISOString().split('T')[0]);
  };

  const handleNextDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + 1);
    onDateChange(d.toISOString().split('T')[0]);
  };

  const isToday = selectedDate === new Date().toISOString().split('T')[0];

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
              <Flame className="w-6 h-6 fill-amber-300 text-amber-300" />
            </div>
            <div>
              <div className="font-extrabold text-lg text-slate-800 tracking-tight flex items-center space-x-1">
                <span>CaloTrack</span>
                <span className="text-[10px] uppercase font-bold bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded-full">
                  Pro
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">Quản lý Calo & Thể Trạng</p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="hidden md:flex items-center bg-slate-100 p-1 rounded-2xl border border-slate-200/80">
            <button
              onClick={() => setActiveTab('tracker')}
              className={`px-4 py-1.5 text-xs font-bold rounded-xl transition cursor-pointer ${
                activeTab === 'tracker'
                  ? 'bg-white text-emerald-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              🥗 Nhật Ký Dinh Dưỡng
            </button>
            <button
              onClick={() => setActiveTab('calculator')}
              className={`px-4 py-1.5 text-xs font-bold rounded-xl transition cursor-pointer ${
                activeTab === 'calculator'
                  ? 'bg-white text-emerald-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              🧮 Tính Chỉ Số Cơ Thể (BMR/TDEE)
            </button>
          </div>

          {/* Date Selector & User Menu */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Date Navigator (visible in tracker tab) */}
            {activeTab === 'tracker' && (
              <div className="flex items-center bg-slate-100 rounded-xl p-1 border border-slate-200 text-xs">
                <button
                  onClick={handlePrevDay}
                  title="Ngày trước"
                  className="p-1 hover:bg-white rounded-lg text-slate-600 transition cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <div className="px-2 font-semibold text-slate-700 flex items-center space-x-1">
                  <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{isToday ? 'Hôm nay' : selectedDate}</span>
                </div>
                <button
                  onClick={handleNextDay}
                  title="Ngày sau"
                  className="p-1 hover:bg-white rounded-lg text-slate-600 transition cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Profile Action Button */}
            <button
              onClick={onOpenProfile}
              title="Xem và chỉnh sửa hồ sơ thể trạng"
              className="flex items-center space-x-2 bg-emerald-50 hover:bg-emerald-100/80 text-emerald-800 px-3 py-1.5 rounded-xl border border-emerald-200/80 text-xs font-semibold transition cursor-pointer"
            >
              <User className="w-3.5 h-3.5" />
              <span className="hidden sm:inline font-bold">{user?.full_name || user?.username}</span>
              {profile && (
                <span className="hidden lg:inline text-[11px] bg-emerald-200/70 text-emerald-900 px-1.5 py-0.5 rounded-md">
                  {profile.weight} kg
                </span>
              )}
            </button>

            {/* Logout button */}
            <button
              onClick={logout}
              title="Đăng xuất khỏi hệ thống"
              className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Mobile Tab Switcher */}
        <div className="flex md:hidden border-t border-slate-100 py-2 space-x-2">
          <button
            onClick={() => setActiveTab('tracker')}
            className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition cursor-pointer ${
              activeTab === 'tracker'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600'
            }`}
          >
            🥗 Nhật Ký Dinh Dưỡng
          </button>
          <button
            onClick={() => setActiveTab('calculator')}
            className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition cursor-pointer ${
              activeTab === 'calculator'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600'
            }`}
          >
            🧮 Tính Calo & Thể Trạng
          </button>
        </div>
      </div>
    </header>
  );
}


import React from 'react';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from './ThemeToggle';
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
    <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
              <Flame className="w-6 h-6 fill-amber-300 text-amber-300" />
            </div>
            <div>
              <div className="font-extrabold text-lg text-slate-800 dark:text-white tracking-tight flex items-center space-x-1">
                <span>CaloTrack</span>
                <span className="text-[10px] uppercase font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 px-1.5 py-0.5 rounded-full">
                  Pro
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Quản lý Calo & Thể Trạng</p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="hidden md:flex items-center bg-slate-100 dark:bg-slate-800/80 p-1 rounded-2xl border border-slate-200/80 dark:border-slate-700">
            <button
              onClick={() => setActiveTab('tracker')}
              className={`px-4 py-1.5 text-xs font-bold rounded-xl transition cursor-pointer ${
                activeTab === 'tracker'
                  ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              🥗 Nhật Ký Dinh Dưỡng
            </button>
            <button
              onClick={() => setActiveTab('calculator')}
              className={`px-4 py-1.5 text-xs font-bold rounded-xl transition cursor-pointer ${
                activeTab === 'calculator'
                  ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              🧮 Tính Chỉ Số Cơ Thể (BMR/TDEE)
            </button>
          </div>

          {/* Date Selector, Theme Toggle & User Menu */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Date Navigator (visible in tracker tab) */}
            {activeTab === 'tracker' && (
              <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-xl p-1 border border-slate-200 dark:border-slate-700 text-xs">
                <button
                  onClick={handlePrevDay}
                  title="Ngày trước"
                  className="p-1 hover:bg-white dark:hover:bg-slate-700 rounded-lg text-slate-600 dark:text-slate-300 transition cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <div className="px-2 font-semibold text-slate-700 dark:text-slate-200 flex items-center space-x-1">
                  <Calendar className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>{isToday ? 'Hôm nay' : selectedDate}</span>
                </div>
                <button
                  onClick={handleNextDay}
                  title="Ngày sau"
                  className="p-1 hover:bg-white dark:hover:bg-slate-700 rounded-lg text-slate-600 dark:text-slate-300 transition cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Dark Mode Theme Toggle */}
            <ThemeToggle />

            {/* Profile Action Button */}
            <button
              onClick={onOpenProfile}
              title="Xem và chỉnh sửa hồ sơ thể trạng"
              className="flex items-center space-x-2 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100/80 dark:hover:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300 px-3 py-1.5 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 text-xs font-semibold transition cursor-pointer"
            >
              <User className="w-3.5 h-3.5" />
              <span className="hidden sm:inline font-bold">{user?.full_name || user?.username}</span>
              {profile && (
                <span className="hidden lg:inline text-[11px] bg-emerald-200/70 dark:bg-emerald-800/60 text-emerald-900 dark:text-emerald-100 px-1.5 py-0.5 rounded-md">
                  {profile.weight} kg
                </span>
              )}
            </button>

            {/* Logout button */}
            <button
              onClick={logout}
              title="Đăng xuất khỏi hệ thống"
              className="p-2 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Mobile Tab Switcher */}
        <div className="flex md:hidden border-t border-slate-100 dark:border-slate-800 py-2 space-x-2">
          <button
            onClick={() => setActiveTab('tracker')}
            className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition cursor-pointer ${
              activeTab === 'tracker'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
            }`}
          >
            🥗 Nhật Ký Dinh Dưỡng
          </button>
          <button
            onClick={() => setActiveTab('calculator')}
            className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition cursor-pointer ${
              activeTab === 'calculator'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
            }`}
          >
            🧮 Tính Calo & Thể Trạng
          </button>
        </div>
      </div>
    </header>
  );
}

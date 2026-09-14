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
  RotateCcw,
} from 'lucide-react';

export default function Navbar({
  selectedDate,
  onDateChange,
  onOpenProfile,
  activeTab,
  setActiveTab,
}) {
  const { user, profile, logout } = useAuth();

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

  const handleToday = () => {
    onDateChange(new Date().toISOString().split('T')[0]);
  };

  const isToday = selectedDate === new Date().toISOString().split('T')[0];

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          
          {/* ======================================================== */}
          {/* GÓC BÊN TRÁI: Icon & Tên phần mềm                        */}
          {/* ======================================================== */}
          <div className="flex items-center space-x-3 shrink-0">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
              <Flame className="w-6 h-6 fill-amber-300 text-amber-300" />
            </div>
            <div>
              <div className="font-extrabold text-lg text-slate-800 dark:text-white tracking-tight flex items-center space-x-1.5">
                <span>CaloTrack</span>
                <span className="text-[10px] uppercase font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 px-1.5 py-0.5 rounded-full">
                  Pro
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium hidden sm:block">
                Quản lý Calo & Thể Trạng
              </p>
            </div>
          </div>

          {/* ======================================================== */}
          {/* PHẦN Ở GIỮA: Chọn tính năng & Nút chọn ngày              */}
          {/* ======================================================== */}
          <div className="hidden md:flex items-center justify-center flex-1 mx-2 lg:mx-6 space-x-3 lg:space-x-4">
            {/* Nhóm các tab chọn tính năng */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-800/90 p-1 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-xs">
              <button
                onClick={() => setActiveTab('tracker')}
                className={`px-3 lg:px-4 py-1.5 text-xs font-bold rounded-xl transition cursor-pointer flex items-center space-x-1.5 ${
                  activeTab === 'tracker'
                    ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-xs ring-1 ring-black/5 dark:ring-white/10'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <span>🥗</span>
                <span>Nhật Ký <span className="hidden xl:inline">Dinh Dưỡng</span></span>
              </button>

              <button
                onClick={() => setActiveTab('weight')}
                className={`px-3 lg:px-4 py-1.5 text-xs font-bold rounded-xl transition cursor-pointer flex items-center space-x-1.5 ${
                  activeTab === 'weight'
                    ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-xs ring-1 ring-black/5 dark:ring-white/10'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <span>📊</span>
                <span>So Sánh Cân Nặng</span>
              </button>

              <button
                onClick={() => setActiveTab('calculator')}
                className={`px-3 lg:px-4 py-1.5 text-xs font-bold rounded-xl transition cursor-pointer flex items-center space-x-1.5 ${
                  activeTab === 'calculator'
                    ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-xs ring-1 ring-black/5 dark:ring-white/10'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <span>🧮</span>
                <span>Tính Chỉ Số <span className="hidden xl:inline">Cơ Thể</span></span>
              </button>
            </div>

            {/* Nút chọn ngày (Hiển thị khi ở tab Nhật ký dinh dưỡng) */}
            {activeTab === 'tracker' && (
              <div className="flex items-center bg-slate-100 dark:bg-slate-800/90 rounded-2xl p-1 border border-slate-200/80 dark:border-slate-700/80 shadow-xs text-xs animate-in fade-in duration-200">
                <button
                  onClick={handlePrevDay}
                  title="Ngày trước"
                  className="p-1 hover:bg-white dark:hover:bg-slate-700 rounded-xl text-slate-600 dark:text-slate-300 transition cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <div className="px-2.5 font-bold text-slate-700 dark:text-slate-200 flex items-center space-x-1.5 font-mono">
                  <Calendar className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>{isToday ? 'Hôm nay' : selectedDate}</span>
                </div>
                <button
                  onClick={handleNextDay}
                  title="Ngày sau"
                  className="p-1 hover:bg-white dark:hover:bg-slate-700 rounded-xl text-slate-600 dark:text-slate-300 transition cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>

                {!isToday && (
                  <button
                    onClick={handleToday}
                    title="Quay về ngày hôm nay"
                    className="ml-1 px-1.5 py-0.5 bg-emerald-100 hover:bg-emerald-200 dark:bg-emerald-950 dark:hover:bg-emerald-900 text-emerald-800 dark:text-emerald-300 rounded-lg text-[10px] font-bold transition flex items-center space-x-0.5 cursor-pointer"
                  >
                    <RotateCcw className="w-2.5 h-2.5" />
                    <span>Nay</span>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* ======================================================== */}
          {/* GÓC BÊN PHẢI: Nút chỉnh Theme, Tài khoản, Đăng xuất      */}
          {/* ======================================================== */}
          <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
            {/* Nút chỉnh Theme (Sáng / Tối / Tự động) */}
            <ThemeToggle />

            {/* Tài khoản người dùng */}
            <button
              onClick={onOpenProfile}
              title="Xem và chỉnh sửa hồ sơ thể trạng"
              className="flex items-center space-x-2 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100/80 dark:hover:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300 px-3 py-1.5 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 text-xs font-semibold transition cursor-pointer shadow-xs"
            >
              <User className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span className="hidden sm:inline font-bold">{user?.full_name || user?.username}</span>
              {profile && (
                <span className="hidden lg:inline text-[11px] bg-emerald-200/70 dark:bg-emerald-800/60 text-emerald-900 dark:text-emerald-100 px-1.5 py-0.5 rounded-md font-mono font-bold">
                  {profile.weight} kg
                </span>
              )}
            </button>

            {/* Biểu tượng out tài khoản (Đăng xuất) */}
            <button
              onClick={logout}
              title="Đăng xuất khỏi tài khoản"
              className="p-2 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

        </div>

        {/* ======================================================== */}
        {/* MOBILE MENU: Hiển thị trên điện thoại và màn hình nhỏ     */}
        {/* ======================================================== */}
        <div className="flex md:hidden flex-col border-t border-slate-100 dark:border-slate-800 py-2 space-y-2">
          {/* Hàng chọn tính năng trên Mobile */}
          <div className="flex items-center space-x-1.5">
            <button
              onClick={() => setActiveTab('tracker')}
              className={`flex-1 py-1.5 text-[11px] font-bold rounded-xl transition cursor-pointer text-center ${
                activeTab === 'tracker'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
              }`}
            >
              🥗 Nhật Ký
            </button>
            <button
              onClick={() => setActiveTab('weight')}
              className={`flex-1 py-1.5 text-[11px] font-bold rounded-xl transition cursor-pointer text-center ${
                activeTab === 'weight'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
              }`}
            >
              📊 Cân Nặng
            </button>
            <button
              onClick={() => setActiveTab('calculator')}
              className={`flex-1 py-1.5 text-[11px] font-bold rounded-xl transition cursor-pointer text-center ${
                activeTab === 'calculator'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
              }`}
            >
              🧮 Thể Trạng
            </button>
          </div>

          {/* Hàng chọn ngày trên Mobile (khi ở tab Nhật ký) */}
          {activeTab === 'tracker' && (
            <div className="flex items-center justify-between bg-slate-100 dark:bg-slate-800/90 rounded-xl p-1 border border-slate-200/80 dark:border-slate-700/80 text-xs">
              <button
                onClick={handlePrevDay}
                className="p-1 hover:bg-white dark:hover:bg-slate-700 rounded-lg text-slate-600 dark:text-slate-300 transition"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <div className="font-bold text-slate-700 dark:text-slate-200 flex items-center space-x-1.5 font-mono text-xs">
                <Calendar className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>{isToday ? 'Hôm nay' : selectedDate}</span>
                {!isToday && (
                  <button
                    onClick={handleToday}
                    className="ml-1 px-1.5 py-0.5 bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 rounded text-[10px] font-bold"
                  >
                    Nay
                  </button>
                )}
              </div>
              <button
                onClick={handleNextDay}
                className="p-1 hover:bg-white dark:hover:bg-slate-700 rounded-lg text-slate-600 dark:text-slate-300 transition"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

      </div>
    </header>
  );
}

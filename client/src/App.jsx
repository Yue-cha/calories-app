import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from './context/AuthContext';
import { api } from './services/api';
import Navbar from './components/Navbar';
import AuthModal from './components/Auth/AuthModal';
import CalorieOverview from './components/Dashboard/CalorieOverview';
import MealTracker from './components/Dashboard/MealTracker';
import HealthMetricsTab from './components/Calculator/HealthMetricsTab';
import ProfileModal from './components/Profile/ProfileModal';
import WeeklyWeightModal from './components/Profile/WeeklyWeightModal';
import { Flame, Sparkles, Moon, Scale, X, CheckCircle2 } from 'lucide-react';

export default function App() {
  const { isAuthenticated, loading, computedStats, needsWeeklyWeightUpdate, refreshProfile } = useAuth();
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [activeTab, setActiveTab] = useState('tracker'); // 'tracker' | 'calculator'
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [showWeeklyWeightModal, setShowWeeklyWeightModal] = useState(false);
  const [midnightAlert, setMidnightAlert] = useState(null);

  const currentDateRef = useRef(new Date().toISOString().split('T')[0]);

  // Open weekly weight modal automatically if required
  useEffect(() => {
    if (needsWeeklyWeightUpdate) {
      setShowWeeklyWeightModal(true);
    }
  }, [needsWeeklyWeightUpdate]);

  // Meals data for selected date
  const [mealsData, setMealsData] = useState({
    date: selectedDate,
    meals: [],
    grouped: { breakfast: [], lunch: [], dinner: [], snack: [] },
    summary: null,
  });
  const [loadingMeals, setLoadingMeals] = useState(false);

  const fetchMeals = useCallback(async (targetDate = selectedDate) => {
    if (!isAuthenticated) return;
    setLoadingMeals(true);
    try {
      const data = await api.getMeals(targetDate);
      setMealsData(data);
    } catch (err) {
      console.error('Error fetching meals:', err);
    } finally {
      setLoadingMeals(false);
    }
  }, [isAuthenticated, selectedDate]);

  useEffect(() => {
    fetchMeals(selectedDate);
  }, [fetchMeals, selectedDate]);

  // MIDNIGHT RESET WATCHER:
  // Automatically detects when the clock passes 12:00 midnight (00:00)
  // Resets consumed calories for the day and triggers weekly weight check on Monday
  useEffect(() => {
    if (!isAuthenticated) return;

    const checkDateTransition = () => {
      const nowTodayStr = new Date().toISOString().split('T')[0];
      if (nowTodayStr !== currentDateRef.current) {
        console.log('🌙 Midnight passed! Auto-resetting daily calories from', currentDateRef.current, 'to', nowTodayStr);
        currentDateRef.current = nowTodayStr;
        setSelectedDate(nowTodayStr);
        fetchMeals(nowTodayStr);
        refreshProfile();

        setMidnightAlert('Đã bước sang ngày mới (sau 00:00)! Lượng calo nạp trong ngày đã được tự động làm mới về 0 kcal.');
        setTimeout(() => setMidnightAlert(null), 10000);
      }
    };

    // Calculate time until next midnight
    const now = new Date();
    const nextMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 1);
    const msUntilMidnight = Math.max(1000, nextMidnight.getTime() - now.getTime());

    const midnightTimeout = setTimeout(() => {
      checkDateTransition();
    }, msUntilMidnight);

    // Periodic safety interval check (every 30 seconds)
    const interval = setInterval(checkDateTransition, 30000);

    return () => {
      clearTimeout(midnightTimeout);
      clearInterval(interval);
    };
  }, [isAuthenticated, fetchMeals, refreshProfile]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white">
        <div className="w-16 h-16 rounded-3xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center mb-4 animate-bounce">
          <Flame className="w-8 h-8 text-emerald-400 fill-emerald-400" />
        </div>
        <p className="text-sm font-semibold text-slate-300">Đang khởi tạo hệ thống CaloTrack...</p>
      </div>
    );
  }

  // Not authenticated: Must go through Login / Profile Creation screen
  if (!isAuthenticated) {
    return <AuthModal />;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col transition-colors duration-200">
      {/* Navigation */}
      <Navbar
        selectedDate={selectedDate}
        onDateChange={setSelectedDate}
        onOpenProfile={() => setIsProfileOpen(true)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* MIDNIGHT RESET ALERT BANNER */}
      {midnightAlert && (
        <div className="bg-indigo-900 text-white px-4 py-3 shadow-md flex items-center justify-between text-xs sm:text-sm animate-in slide-in-from-top duration-300">
          <div className="max-w-6xl mx-auto w-full flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Moon className="w-4 h-4 text-amber-300 fill-amber-300 shrink-0" />
              <span className="font-semibold">{midnightAlert}</span>
            </div>
            <button
              onClick={() => setMidnightAlert(null)}
              className="p-1 hover:bg-white/20 rounded-lg transition ml-4"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* WEEKLY WEIGHT UPDATE REMINDER BANNER (Visible on Monday or when required) */}
      {needsWeeklyWeightUpdate && (
        <div className="bg-amber-500 text-white px-4 py-2.5 shadow-md flex items-center justify-between text-xs sm:text-sm">
          <div className="max-w-6xl mx-auto w-full flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Scale className="w-4 h-4 shrink-0" />
              <span className="font-bold">
                Bắt đầu tuần mới! Hãy cập nhật cân nặng tuần này để hệ thống tính toán lại mức calo chuẩn xác nhất.
              </span>
            </div>
            <button
              onClick={() => setShowWeeklyWeightModal(true)}
              className="bg-white text-amber-900 px-3 py-1 rounded-xl text-xs font-extrabold hover:bg-amber-50 transition shadow-sm ml-4 cursor-pointer"
            >
              Cập nhật ngay
            </button>
          </div>
        </div>
      )}

      {/* Main Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {activeTab === 'tracker' ? (
          <>
            {/* Feature 2: Calorie Overview & Remaining Calculation */}
            <CalorieOverview
              summary={mealsData.summary}
              computedStats={computedStats}
            />

            {/* Feature 2: Meal Tracker & Manual Entry */}
            <MealTracker
              date={selectedDate}
              groupedMeals={mealsData.grouped}
              onMealChanged={() => fetchMeals(selectedDate)}
            />
          </>
        ) : (
          /* Feature 1: Body Metrics & Scientific Calorie Calculator */
          <HealthMetricsTab />
        )}
      </main>

      {/* Health Profile Edit Modal */}
      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => {
          setIsProfileOpen(false);
          fetchMeals(selectedDate);
        }}
      />

      {/* WEEKLY MONDAY WEIGHT PROMPT MODAL */}
      <WeeklyWeightModal
        isOpen={showWeeklyWeightModal}
        onClose={() => {
          setShowWeeklyWeightModal(false);
          fetchMeals(selectedDate);
        }}
      />

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-6 text-center text-xs text-slate-400 dark:text-slate-500 transition-colors">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>CaloTrack &copy; 2026 - Quản lý calo & dinh dưỡng chuẩn khoa học.</span>
          <span className="flex items-center space-x-1">
            <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
            <span>Tự động làm mới calo sau 00:00 & Cập nhật cân nặng mỗi Thứ Hai</span>
          </span>
        </div>
      </footer>
    </div>
  );
}

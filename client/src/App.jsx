import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from './context/AuthContext';
import { api } from './services/api';
import Navbar from './components/Navbar';
import AuthModal from './components/Auth/AuthModal';
import CalorieOverview from './components/Dashboard/CalorieOverview';
import MealTracker from './components/Dashboard/MealTracker';
import HealthMetricsTab from './components/Calculator/HealthMetricsTab';
import ProfileModal from './components/Profile/ProfileModal';
import { Flame, Sparkles } from 'lucide-react';

export default function App() {
  const { isAuthenticated, loading, computedStats } = useAuth();
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [activeTab, setActiveTab] = useState('tracker'); // 'tracker' | 'calculator'
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Meals data for selected date
  const [mealsData, setMealsData] = useState({
    date: selectedDate,
    meals: [],
    grouped: { breakfast: [], lunch: [], dinner: [], snack: [] },
    summary: null,
  });
  const [loadingMeals, setLoadingMeals] = useState(false);

  const fetchMeals = useCallback(async () => {
    if (!isAuthenticated) return;
    setLoadingMeals(true);
    try {
      const data = await api.getMeals(selectedDate);
      setMealsData(data);
    } catch (err) {
      console.error('Error fetching meals:', err);
    } finally {
      setLoadingMeals(false);
    }
  }, [isAuthenticated, selectedDate]);

  useEffect(() => {
    fetchMeals();
  }, [fetchMeals]);

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
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Navigation */}
      <Navbar
        selectedDate={selectedDate}
        onDateChange={setSelectedDate}
        onOpenProfile={() => setIsProfileOpen(true)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

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
              onMealChanged={fetchMeals}
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
          fetchMeals();
        }}
      />

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-400">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>CaloTrack &copy; 2026 - Quản lý calo & dinh dưỡng chuẩn khoa học.</span>
          <span className="flex items-center space-x-1">
            <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
            <span>Công thức tính Mifflin - St Jeor</span>
          </span>
        </div>
      </footer>
    </div>
  );
}

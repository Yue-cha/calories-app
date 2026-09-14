import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import {
  Scale,
  Calendar,
  Plus,
  TrendingDown,
  TrendingUp,
  Minus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Target,
  BarChart3,
  Award,
  Sparkles,
  ChevronRight,
  Info,
  X,
  Layers,
} from 'lucide-react';

export default function WeeklyWeightChart() {
  const { profile, refreshProfile } = useAuth();
  const [data, setData] = useState({ entries: [], summary: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [hoveredEntry, setHoveredEntry] = useState(null);
  const [viewMode, setViewMode] = useState('weekly'); // 'weekly' (1 bar/week) | 'all' (every log)

  // Add weight modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [inputWeight, setInputWeight] = useState(profile?.weight ? profile.weight.toString() : '65');
  const [inputDate, setInputDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [submitting, setSubmitting] = useState(false);
  const [actionMsg, setActionMsg] = useState('');

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.getWeightHistory();
      setData(res);
      if (res.summary?.currentWeight) {
        setInputWeight(res.summary.currentWeight.toString());
      }
    } catch (err) {
      console.error('Error fetching weight history:', err);
      setError(err.message || 'Không thể tải lịch sử cân nặng');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const handleAddWeight = async (e) => {
    e.preventDefault();
    const w = parseFloat(inputWeight);
    if (isNaN(w) || w < 30 || w > 250) {
      setError('Vui lòng nhập cân nặng hợp lệ từ 30kg đến 250kg');
      return;
    }

    setSubmitting(true);
    try {
      await api.addWeightEntry({ weight: w, date: inputDate });
      await fetchHistory();
      await refreshProfile();
      setActionMsg('Đã ghi nhận cân nặng thành công!');
      setTimeout(() => {
        setActionMsg('');
        setIsAddModalOpen(false);
      }, 1200);
    } catch (err) {
      setError(err.message || 'Lỗi khi lưu cân nặng');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteEntry = async (id, weekLabel) => {
    if (!window.confirm(`Bạn có chắc muốn xóa bản ghi cân nặng của ${weekLabel}?`)) return;
    try {
      await api.deleteWeightEntry(id);
      await fetchHistory();
      await refreshProfile();
      setActionMsg('Đã xóa bản ghi cân nặng');
      setTimeout(() => setActionMsg(''), 2500);
    } catch (err) {
      alert(err.message || 'Không thể xóa bản ghi');
    }
  };

  const { entries = [], summary } = data;
  const initialWeight = summary?.initialWeight ?? (profile?.weight || 65);
  const currentWeight = summary?.currentWeight ?? (profile?.weight || 65);
  const targetWeight = summary?.targetWeight ?? (profile?.target_weight || 65);
  const totalChange = summary?.totalChange ?? 0;
  const remainingToTarget = summary?.remainingToTarget ?? Math.abs(currentWeight - targetWeight);

  // Filter or group entries based on viewMode ('weekly' vs 'all')
  const displayedEntries = useMemo(() => {
    if (viewMode === 'all') return entries;

    // Group by week (keep the latest entry for each ISO week)
    const map = new Map();
    for (const e of entries) {
      const key = `${e.weekInfo?.weekNumber || 0}_${e.weekInfo?.formattedDate?.slice(-4) || ''}`;
      map.set(key, e);
    }
    const list = Array.from(map.values());
    return list.map((item, index) => {
      const prev = index > 0 ? list[index - 1] : null;
      const diff = prev ? parseFloat((item.weight - prev.weight).toFixed(1)) : 0;
      return { ...item, diff };
    });
  }, [entries, viewMode]);

  // SVG Chart Dimensions & Math
  const chartWidth = Math.max(600, displayedEntries.length * 95 + 100);
  const chartHeight = 320;
  const padding = { top: 50, right: 40, bottom: 55, left: 55 };
  const innerWidth = chartWidth - padding.left - padding.right;
  const innerHeight = chartHeight - padding.top - padding.bottom;

  // Find min and max for scaling
  const allWeights = [
    ...displayedEntries.map((e) => e.weight),
    targetWeight,
  ].filter(Boolean);

  const minWeightRaw = allWeights.length > 0 ? Math.min(...allWeights) : 60;
  const maxWeightRaw = allWeights.length > 0 ? Math.max(...allWeights) : 70;
  const yMin = Math.max(20, Math.floor(minWeightRaw - 2));
  const yMax = Math.ceil(maxWeightRaw + 3);
  const yRange = yMax - yMin || 1;

  const getY = (w) => {
    const ratio = (w - yMin) / yRange;
    return padding.top + innerHeight - ratio * innerHeight;
  };

  // Grid steps (approx 4-5 ticks)
  const tickStep = yRange <= 6 ? 1 : yRange <= 15 ? 2 : Math.ceil(yRange / 5);
  const ticks = [];
  for (let t = yMin; t <= yMax; t += tickStep) {
    ticks.push(t);
  }

  // Calculate Bar Positions
  const barSlotWidth = displayedEntries.length > 0 ? innerWidth / displayedEntries.length : innerWidth;
  const barWidth = Math.min(48, Math.max(28, barSlotWidth * 0.52));

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 dark:from-emerald-900 dark:via-teal-900 dark:to-emerald-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-emerald-600/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 transition-colors">
        <div className="space-y-2">
          <div className="inline-flex items-center space-x-2 bg-white/20 dark:bg-black/30 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-emerald-100">
            <BarChart3 className="w-4 h-4 text-amber-300" />
            <span>Theo Dõi & So Sánh Cân Nặng Hằng Tuần</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            So Sánh Cân Nặng Mỗi Tuần
          </h2>
          <p className="text-sm text-emerald-100 max-w-2xl leading-relaxed">
            Hệ thống tự động lưu số cân nặng sau mỗi tuần mới để vẽ biểu đồ hình cột so sánh,
            giúp bạn thấy rõ tốc độ tăng hoặc giảm cân qua từng chặng đường.
          </p>
        </div>

        <button
          onClick={() => {
            setInputWeight(currentWeight.toString());
            setInputDate(new Date().toISOString().split('T')[0]);
            setIsAddModalOpen(true);
          }}
          className="shrink-0 flex items-center space-x-2 bg-white text-emerald-800 hover:bg-emerald-50 dark:bg-emerald-500 dark:text-white dark:hover:bg-emerald-400 px-5 py-3 rounded-2xl font-bold text-sm shadow-lg shadow-black/10 transition cursor-pointer"
        >
          <Plus className="w-5 h-5" />
          <span>Ghi Nhận Cân Nặng Tuần Này</span>
        </button>
      </div>

      {/* Global Success Banner */}
      {actionMsg && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-sm font-bold rounded-2xl flex items-center space-x-3 shadow-sm animate-in slide-in-from-top duration-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>{actionMsg}</span>
        </div>
      )}

      {/* 4 Summary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Initial Weight */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 shadow-sm transition-colors">
          <div className="flex items-center justify-between text-slate-400 dark:text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Cân Nặng Ban Đầu</span>
            <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300">
              <Scale className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-white font-mono">
            {initialWeight} <span className="text-sm font-semibold text-slate-400">kg</span>
          </div>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
            {entries.length > 0 ? entries[0].weekInfo?.weekLabel || entries[0].date : 'Bắt đầu hành trình'}
          </p>
        </div>

        {/* Current Weight */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 shadow-sm transition-colors">
          <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Hiện Tại (Tuần Này)</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 flex items-center justify-center">
              <Scale className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-700 dark:text-emerald-400 font-mono">
            {currentWeight} <span className="text-sm font-semibold text-emerald-500">kg</span>
          </div>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
            {entries.length > 0 ? entries[entries.length - 1].weekInfo?.weekLabel || 'Mới nhất' : 'Hôm nay'}
          </p>
        </div>

        {/* Total Change */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 shadow-sm transition-colors">
          <div className="flex items-center justify-between text-slate-400 dark:text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Tổng Thay Đổi</span>
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
              totalChange < 0
                ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400'
                : totalChange > 0
                ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
            }`}>
              {totalChange < 0 ? <TrendingDown className="w-4 h-4" /> : totalChange > 0 ? <TrendingUp className="w-4 h-4" /> : <Minus className="w-4 h-4" />}
            </div>
          </div>
          <div className={`text-2xl sm:text-3xl font-black font-mono ${
            totalChange < 0
              ? 'text-emerald-600 dark:text-emerald-400'
              : totalChange > 0
              ? 'text-amber-600 dark:text-amber-400'
              : 'text-slate-700 dark:text-slate-200'
          }`}>
            {totalChange > 0 ? `+${totalChange}` : totalChange} <span className="text-sm font-semibold text-slate-400">kg</span>
          </div>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
            {totalChange < 0 ? 'Đã giảm so với ban đầu' : totalChange > 0 ? 'Đã tăng so với ban đầu' : 'Cân nặng ổn định'}
          </p>
        </div>

        {/* Target Weight */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 shadow-sm transition-colors">
          <div className="flex items-center justify-between text-teal-600 dark:text-teal-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Mục Tiêu</span>
            <div className="w-8 h-8 rounded-xl bg-teal-50 dark:bg-teal-950/60 flex items-center justify-center">
              <Target className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-teal-700 dark:text-teal-400 font-mono">
            {targetWeight} <span className="text-sm font-semibold text-teal-500">kg</span>
          </div>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
            {remainingToTarget === 0 ? '🎉 Đạt mục tiêu hoàn hảo!' : `Còn cách mục tiêu ${remainingToTarget} kg`}
          </p>
        </div>
      </div>

      {/* Main Bar Chart Section */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm transition-colors">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="text-lg font-extrabold text-slate-800 dark:text-white flex items-center space-x-2">
              <BarChart3 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <span>Biểu Đồ Hình Cột So Sánh Cân Nặng Mỗi Tuần</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Số cân nặng cụ thể được thể hiện rõ ràng trên đỉnh mỗi cột để bạn dễ dàng theo dõi chi tiết.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 sm:gap-5 text-xs">
            {/* View Mode Toggle */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
              <button
                onClick={() => setViewMode('weekly')}
                className={`px-3 py-1 rounded-lg font-bold transition cursor-pointer ${
                  viewMode === 'weekly'
                    ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-xs'
                    : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                Mỗi tuần 1 cột
              </button>
              <button
                onClick={() => setViewMode('all')}
                className={`px-3 py-1 rounded-lg font-bold transition cursor-pointer ${
                  viewMode === 'all'
                    ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-xs'
                    : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                Tất cả mốc đo
              </button>
            </div>

            {/* Legend */}
            <div className="flex items-center space-x-3.5">
              <div className="flex items-center space-x-1.5">
                <span className="w-3 h-3 rounded bg-emerald-500 inline-block" />
                <span className="text-slate-600 dark:text-slate-400 font-medium">Giảm cân</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-3 h-3 rounded bg-amber-500 inline-block" />
                <span className="text-slate-600 dark:text-slate-400 font-medium">Tăng cân</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-3 h-0.5 border-t-2 border-dashed border-teal-500 inline-block" />
                <span className="text-slate-600 dark:text-slate-400 font-medium">Mục tiêu ({targetWeight}kg)</span>
              </div>
            </div>
          </div>
        </div>

        {/* SVG Bar Chart */}
        {loading ? (
          <div className="h-64 flex flex-col items-center justify-center text-slate-400">
            <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin mb-3" />
            <span className="text-xs font-semibold">Đang tổng hợp dữ liệu biểu đồ...</span>
          </div>
        ) : displayedEntries.length === 0 ? (
          <div className="py-16 text-center text-slate-400 space-y-3">
            <Scale className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-600" />
            <p className="text-sm font-bold text-slate-600 dark:text-slate-300">
              Chưa có dữ liệu lịch sử cân nặng
            </p>
            <p className="text-xs max-w-sm mx-auto text-slate-400">
              Bấm nút "Ghi nhận cân nặng tuần này" để bắt đầu theo dõi tiến độ so sánh của bạn.
            </p>
          </div>
        ) : (
          <div className="relative pt-6 overflow-x-auto">
            <svg
              viewBox={`0 0 ${chartWidth} ${chartHeight}`}
              className="w-full min-w-[600px] h-[320px] select-none"
            >
              {/* Definitions for Gradients and Shadows */}
              <defs>
                <linearGradient id="barGradientEmerald" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" />
                  <stop offset="100%" stopColor="#059669" />
                </linearGradient>
                <linearGradient id="barGradientAmber" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f59e0b" />
                  <stop offset="100%" stopColor="#d97706" />
                </linearGradient>
                <linearGradient id="barGradientTeal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#14b8a6" />
                  <stop offset="100%" stopColor="#0d9488" />
                </linearGradient>
              </defs>

              {/* Horizontal Gridlines & Y-Axis Labels */}
              {ticks.map((t) => {
                const y = getY(t);
                return (
                  <g key={t}>
                    <line
                      x1={padding.left}
                      y1={y}
                      x2={chartWidth - padding.right}
                      y2={y}
                      stroke="currentColor"
                      className="text-slate-200/80 dark:text-slate-800"
                      strokeWidth="1"
                      strokeDasharray="4 4"
                    />
                    <text
                      x={padding.left - 10}
                      y={y + 4}
                      textAnchor="end"
                      fill="currentColor"
                      className="text-slate-400 dark:text-slate-500 text-[11px] font-mono font-medium"
                    >
                      {t} kg
                    </text>
                  </g>
                );
              })}

              {/* Target Weight Dashed Reference Line */}
              {targetWeight >= yMin && targetWeight <= yMax && (
                <g>
                  <line
                    x1={padding.left}
                    y1={getY(targetWeight)}
                    x2={chartWidth - padding.right}
                    y2={getY(targetWeight)}
                    stroke="#0d9488"
                    strokeWidth="2"
                    strokeDasharray="6 4"
                  />
                  <text
                    x={chartWidth - padding.right}
                    y={getY(targetWeight) - 6}
                    textAnchor="end"
                    fill="currentColor"
                    className="text-teal-600 dark:text-teal-400 text-[10px] font-bold"
                  >
                    Mục tiêu: {targetWeight} kg
                  </text>
                </g>
              )}

              {/* Weekly Bars & Detailed Values */}
              {displayedEntries.map((item, idx) => {
                const slotCenterX = padding.left + idx * barSlotWidth + barSlotWidth / 2;
                const barX = slotCenterX - barWidth / 2;
                const barTopY = getY(item.weight);
                const barBottomY = getY(yMin);
                const barHeight = Math.max(8, barBottomY - barTopY);

                const isDecreased = item.diff < 0;
                const isIncreased = item.diff > 0;
                const fillGradient = isIncreased
                  ? 'url(#barGradientAmber)'
                  : isDecreased
                  ? 'url(#barGradientEmerald)'
                  : 'url(#barGradientTeal)';

                const isHovered = hoveredEntry?.id === item.id;

                return (
                  <g
                    key={item.id}
                    className="cursor-pointer transition-all duration-200"
                    onMouseEnter={() => setHoveredEntry(item)}
                    onMouseLeave={() => setHoveredEntry(null)}
                  >
                    {/* Hover highlight column */}
                    {isHovered && (
                      <rect
                        x={slotCenterX - barSlotWidth / 2 + 4}
                        y={padding.top}
                        width={barSlotWidth - 8}
                        height={innerHeight}
                        className="fill-slate-100/60 dark:fill-slate-800/40"
                        rx="8"
                      />
                    )}

                    {/* The Bar */}
                    <rect
                      x={barX}
                      y={barTopY}
                      width={barWidth}
                      height={barHeight}
                      rx="6"
                      fill={fillGradient}
                      className="transition-all duration-200"
                      filter={isHovered ? 'drop-shadow(0px 6px 12px rgba(16, 185, 129, 0.35))' : undefined}
                      opacity={isHovered ? 1 : 0.94}
                    />

                    {/* Exact Weight on TOP of each bar (MANDATORY REQUIREMENT) */}
                    <text
                      x={slotCenterX}
                      y={barTopY - 10}
                      textAnchor="middle"
                      fill="currentColor"
                      className="text-slate-900 dark:text-white font-mono font-black text-[13px]"
                    >
                      {item.weight} kg
                    </text>

                    {/* Diff Tag / Indicator above bar (if diff exists) */}
                    {item.diff !== 0 && (
                      <g>
                        <rect
                          x={slotCenterX - 22}
                          y={barTopY - 32}
                          width="44"
                          height="16"
                          rx="4"
                          className={
                            isDecreased
                              ? 'fill-emerald-100 dark:fill-emerald-950/80 stroke-emerald-300 dark:stroke-emerald-700'
                              : 'fill-amber-100 dark:fill-amber-950/80 stroke-amber-300 dark:stroke-amber-700'
                          }
                          strokeWidth="1"
                        />
                        <text
                          x={slotCenterX}
                          y={barTopY - 20}
                          textAnchor="middle"
                          fill="currentColor"
                          className={`text-[9px] font-bold ${
                            isDecreased
                              ? 'text-emerald-700 dark:text-emerald-300'
                              : 'text-amber-700 dark:text-amber-300'
                          }`}
                        >
                          {item.diff > 0 ? `+${item.diff}` : item.diff} kg
                        </text>
                      </g>
                    )}

                    {/* X-Axis Labels: Week and Date below each bar */}
                    <text
                      x={slotCenterX}
                      y={chartHeight - padding.bottom + 20}
                      textAnchor="middle"
                      fill="currentColor"
                      className="text-slate-800 dark:text-slate-200 font-bold text-[11px]"
                    >
                      {item.weekInfo?.shortLabel || `T${idx + 1}`}
                    </text>
                    <text
                      x={slotCenterX}
                      y={chartHeight - padding.bottom + 34}
                      textAnchor="middle"
                      fill="currentColor"
                      className="text-slate-400 dark:text-slate-500 text-[10px]"
                    >
                      {item.date ? item.date.slice(5) : ''}
                    </text>
                  </g>
                );
              })}

              {/* Baseline */}
              <line
                x1={padding.left}
                y1={chartHeight - padding.bottom}
                x2={chartWidth - padding.right}
                y2={chartHeight - padding.bottom}
                stroke="currentColor"
                className="text-slate-200 dark:text-slate-700"
                strokeWidth="1.5"
              />
            </svg>

            {/* Floating details tooltip on hover */}
            {hoveredEntry && (
              <div className="absolute top-2 right-6 bg-slate-900 text-white dark:bg-slate-800 dark:text-slate-100 text-xs px-3 py-2 rounded-xl shadow-xl pointer-events-none flex items-center space-x-3 border border-slate-700">
                <span className="font-bold">{hoveredEntry.weekInfo?.weekLabel || hoveredEntry.date}</span>
                <span className="text-slate-400">|</span>
                <span className="font-extrabold text-emerald-400 font-mono">{hoveredEntry.weight} kg</span>
                {hoveredEntry.diff !== 0 && (
                  <span className={hoveredEntry.diff < 0 ? 'text-emerald-300 font-bold' : 'text-amber-300 font-bold'}>
                    ({hoveredEntry.diff > 0 ? `+${hoveredEntry.diff}` : hoveredEntry.diff} kg)
                  </span>
                )}
              </div>
            )}
          </div>
        )}

        {/* Tip for weekly comparison */}
        {displayedEntries.length === 1 && (
          <div className="mt-6 p-4 bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/60 rounded-2xl flex items-start space-x-3 text-xs text-emerald-900 dark:text-emerald-200">
            <Sparkles className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Đã lưu mốc cân nặng tuần đầu tiên!</span>
              <p className="mt-0.5 text-emerald-700 dark:text-emerald-300">
                Sau khi bắt đầu mỗi tuần mới (sau 00:00 Thứ Hai), hệ thống sẽ lưu số cân nặng mới và hiển thị cột tiếp theo
                để so sánh mức tăng giảm. Bạn cũng có thể bấm nút <b>"Ghi nhận cân nặng tuần này"</b> ở trên để nhập bổ sung
                dữ liệu các tuần trước đó.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* History Comparison Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm transition-colors">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-extrabold text-slate-800 dark:text-white">
              Bảng Chi Tiết Cân Nặng Các Tuần
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Danh sách chi tiết số liệu từng tuần và mức độ thay đổi
            </p>
          </div>
          <span className="text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-3 py-1 rounded-xl">
            {entries.length} mốc ghi nhận
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">
                <th className="py-3 px-4">Tuần / Giai Đoạn</th>
                <th className="py-3 px-4">Ngày Ghi Nhận</th>
                <th className="py-3 px-4">Cân Nặng (kg)</th>
                <th className="py-3 px-4">Thay Đổi So Với Tuần Trước</th>
                <th className="py-3 px-4">Trạng Thái</th>
                <th className="py-3 px-4 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {entries.map((item, idx) => (
                <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                  <td className="py-3 px-4 font-bold text-slate-800 dark:text-white flex items-center space-x-2">
                    <span className="w-6 h-6 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-bold text-[10px]">
                      {idx + 1}
                    </span>
                    <span>{item.weekInfo?.weekLabel || `Tuần ${idx + 1}`}</span>
                  </td>
                  <td className="py-3 px-4 text-slate-500 dark:text-slate-400 font-mono">
                    {item.date}
                  </td>
                  <td className="py-3 px-4 font-extrabold text-slate-900 dark:text-white font-mono text-sm">
                    {item.weight} kg
                  </td>
                  <td className="py-3 px-4">
                    {item.diff < 0 && (
                      <span className="inline-flex items-center text-emerald-600 dark:text-emerald-400 font-bold">
                        <TrendingDown className="w-3.5 h-3.5 mr-1" />
                        {item.diff} kg
                      </span>
                    )}
                    {item.diff > 0 && (
                      <span className="inline-flex items-center text-amber-600 dark:text-amber-400 font-bold">
                        <TrendingUp className="w-3.5 h-3.5 mr-1" />
                        +{item.diff} kg
                      </span>
                    )}
                    {item.diff === 0 && (
                      <span className="inline-flex items-center text-slate-400 dark:text-slate-500 font-medium">
                        <Minus className="w-3.5 h-3.5 mr-1" />
                        0 kg (Tuần đầu / Giữ cân)
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    {item.diff < 0 ? (
                      <span className="px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-semibold text-[10px]">
                        Giảm cân
                      </span>
                    ) : item.diff > 0 ? (
                      <span className="px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 font-semibold text-[10px]">
                        Tăng cân
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-semibold text-[10px]">
                        Duy trì
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right">
                    {entries.length > 1 && (
                      <button
                        onClick={() => handleDeleteEntry(item.id, item.weekInfo?.weekLabel || item.date)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition cursor-pointer"
                        title="Xóa mốc cân nặng này"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Manual / Past Week Entry Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden">
            <div className="bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-800 dark:to-teal-800 px-6 py-5 text-white flex items-center justify-between">
              <div>
                <h4 className="text-lg font-bold">Ghi Nhận Cân Nặng</h4>
                <p className="text-xs text-emerald-100">Nhập cân nặng cho tuần này hoặc tuần trước</p>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 text-white/80 hover:text-white rounded-lg hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddWeight} className="p-6 space-y-4">
              {error && (
                <div className="p-3 bg-rose-50 dark:bg-rose-950 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-semibold rounded-xl flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Ngày ghi nhận
                </label>
                <input
                  type="date"
                  required
                  value={inputDate}
                  onChange={(e) => setInputDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium text-sm focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Số cân nặng (kg)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.1"
                    min="30"
                    max="250"
                    required
                    autoFocus
                    value={inputWeight}
                    onChange={(e) => setInputWeight(e.target.value)}
                    placeholder="Ví dụ: 65.5"
                    className="w-full pl-4 pr-12 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-black text-lg focus:ring-2 focus:ring-emerald-500"
                  />
                  <span className="absolute right-4 top-3.5 text-slate-400 font-bold text-sm">kg</span>
                </div>
              </div>

              <div className="pt-3 flex space-x-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-bold text-xs transition"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-md shadow-emerald-600/20 transition disabled:opacity-50"
                >
                  {submitting ? 'Đang Lưu...' : 'Lưu Vào Biểu Đồ'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}


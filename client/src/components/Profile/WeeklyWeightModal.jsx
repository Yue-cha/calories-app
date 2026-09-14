import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Scale,
  Calendar,
  Sparkles,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Minus,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

export default function WeeklyWeightModal({ isOpen, onClose }) {
  const { profile, submitWeeklyWeight } = useAuth();
  const [weight, setWeight] = useState(profile?.weight ? profile.weight.toString() : '65');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const previousWeight = profile?.weight ? parseFloat(profile.weight) : 65;
  const currentNum = parseFloat(weight);
  const diff = !isNaN(currentNum) ? parseFloat((currentNum - previousWeight).toFixed(1)) : 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const w = parseFloat(weight);

    if (isNaN(w) || w < 30 || w > 250) {
      setError('Vui lòng nhập cân nặng hợp lệ từ 30kg đến 250kg');
      return;
    }

    setLoading(true);
    try {
      const res = await submitWeeklyWeight(w);
      setSuccessMsg(res.message || 'Cập nhật cân nặng tuần mới thành công!');
      setTimeout(() => {
        setSuccessMsg('');
        if (onClose) onClose();
      }, 1500);
    } catch (err) {
      setError(err.message || 'Lỗi khi cập nhật cân nặng');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden">
        {/* Header with Weekly Accent */}
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 px-6 py-6 text-white text-left relative">
          <div className="flex items-center space-x-2 text-xs font-bold text-emerald-100 uppercase tracking-wider mb-2">
            <Calendar className="w-4 h-4 text-amber-300" />
            <span>Đầu Tuần Mới (Sau 00:00 Thứ Hai)</span>
          </div>

          <h3 className="text-xl font-extrabold text-white tracking-tight flex items-center space-x-2">
            <span>Cập Nhật Cân Nặng Tuần Mới</span>
          </h3>

          <p className="text-xs text-emerald-50 mt-1 leading-relaxed">
            Hệ thống yêu cầu cập nhật lại cân nặng vào mỗi đầu tuần để tính toán lại chính xác chỉ số
            BMR, TDEE và nhu cầu calo tối ưu cho bạn.
          </p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 text-left">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-2xl flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-2xl flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Previous vs Current Weight comparison card */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 flex items-center justify-between">
            <div>
              <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">
                Cân nặng tuần trước
              </span>
              <div className="text-xl font-bold text-slate-700">{previousWeight} kg</div>
            </div>

            <div className="text-right">
              <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">
                Chênh lệch
              </span>
              <div className="flex items-center space-x-1 justify-end">
                {diff > 0 && (
                  <span className="text-xs font-extrabold text-amber-600 flex items-center">
                    <TrendingUp className="w-3.5 h-3.5 mr-0.5" /> +{diff} kg
                  </span>
                )}
                {diff < 0 && (
                  <span className="text-xs font-extrabold text-emerald-600 flex items-center">
                    <TrendingDown className="w-3.5 h-3.5 mr-0.5" /> {diff} kg
                  </span>
                )}
                {diff === 0 && (
                  <span className="text-xs font-bold text-slate-500 flex items-center">
                    <Minus className="w-3.5 h-3.5 mr-0.5" /> 0 kg
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Main Input: Only Weight (kg) */}
          <div>
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
              Nhập cân nặng hiện tại của bạn (kg) *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Scale className="w-5 h-5 text-emerald-600" />
              </div>
              <input
                type="number"
                step="0.1"
                min="30"
                max="250"
                required
                autoFocus
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder="Ví dụ: 64.5"
                className="w-full pl-11 pr-14 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 text-lg font-black focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
              />
              <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-slate-400 font-bold text-sm">
                kg
              </div>
            </div>
            <p className="text-[11px] text-slate-400 mt-1.5">
              💡 Lời khuyên: Hãy cân vào buổi sáng sau khi thức dậy và đi vệ sinh để có số đo chuẩn nhất.
            </p>
          </div>

          {/* Submit Action */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading || !!successMsg}
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl shadow-lg shadow-emerald-600/30 flex items-center justify-center space-x-2 transition disabled:opacity-50 cursor-pointer text-sm"
            >
              {loading ? (
                <span className="inline-block animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
              ) : (
                <>
                  <span>Xác Nhận & Cập Nhật Chỉ Số Tuần Mới</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


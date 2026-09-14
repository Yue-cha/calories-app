import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon, Laptop, Check } from 'lucide-react';

export default function ThemeToggle() {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const options = [
    { key: 'light', label: 'Sáng (Light)', icon: Sun },
    { key: 'dark', label: 'Tối (Dark)', icon: Moon },
    { key: 'system', label: 'Tự động (Hệ thống)', icon: Laptop },
  ];

  const CurrentIcon = theme === 'system' ? Laptop : resolvedTheme === 'dark' ? Moon : Sun;

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        title={`Giao diện: ${theme === 'system' ? 'Tự động theo hệ thống' : theme === 'dark' ? 'Tối' : 'Sáng'}`}
        className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-slate-200/70 dark:hover:bg-slate-700 transition cursor-pointer flex items-center justify-center"
      >
        <CurrentIcon className="w-4 h-4" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
          <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Chế độ hiển thị
          </div>
          {options.map((opt) => {
            const Icon = opt.icon;
            const isSelected = theme === opt.key;
            return (
              <button
                key={opt.key}
                onClick={() => {
                  setTheme(opt.key);
                  setIsOpen(false);
                }}
                className={`w-full px-3 py-2 text-xs font-semibold flex items-center justify-between transition cursor-pointer ${
                  isSelected
                    ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/80'
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <Icon className="w-4 h-4" />
                  <span>{opt.label}</span>
                </div>
                {isSelected && <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}


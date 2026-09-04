import React from 'react';
import { Calendar as CalendarIcon, Filter, Sun, Moon } from 'lucide-react';
import { useGate } from '../../context/GateContext';
import { formatFullDateHeader } from '../../utils/dateUtils';

export const TopBar: React.FC = () => {
  const { subjects, selectedSubjectId, setSelectedSubjectId, activeTab, theme, toggleTheme } = useGate();
  const currentDateStr = formatFullDateHeader();

  // Determine if subject selector is helpful on this view
  const showSubjectSelector = activeTab !== 'dashboard';

  return (
    <header className="sticky top-0 z-30 bg-white/80 dark:bg-[#161617]/80 backdrop-blur-md border-b border-[#e5e5ea] dark:border-[#333336] px-4 sm:px-8 py-3 flex items-center justify-between gap-4 transition-colors">
      {/* App branding for mobile and title */}
      <div className="flex items-center gap-3">
        <div className="md:hidden w-8 h-8 rounded-lg bg-[#0071e3] dark:bg-[#2997ff] flex items-center justify-center font-bold text-white dark:text-black text-xs shadow-xs">
          GP
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-lg font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] tracking-tight">
              GATE Prep
            </h2>
            <span className="hidden sm:inline-block text-[11px] px-2.5 py-0.5 rounded-full bg-[#f5f5f7] dark:bg-[#2c2c2e] text-[#86868b] dark:text-[#a1a1a6] font-medium border border-[#e5e5ea] dark:border-[#3a3a3c]">
              CSE 2026
            </span>
          </div>
        </div>
      </div>

      {/* Center / Right tools: Date, Theme Toggle & Subject Selector */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        {/* Current Date */}
        <div className="hidden sm:flex items-center gap-1.5 text-xs font-medium text-[#86868b] dark:text-[#a1a1a6] bg-[#f5f5f7] dark:bg-[#2c2c2e] px-3 py-1.5 rounded-full border border-[#e5e5ea] dark:border-[#3a3a3c]">
          <CalendarIcon className="w-3.5 h-3.5 text-[#86868b] dark:text-[#a1a1a6]" />
          <span>{currentDateStr}</span>
        </div>

        {/* Optional Subject Filter */}
        {showSubjectSelector && (
          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-[#86868b] dark:text-[#a1a1a6] hidden sm:block" />
            <select
              id="topbar-subject-select"
              aria-label="Filter by subject"
              value={selectedSubjectId}
              onChange={(e) => setSelectedSubjectId(e.target.value)}
              className="text-xs sm:text-sm font-medium bg-[#f5f5f7] dark:bg-[#2c2c2e] border border-[#e5e5ea] dark:border-[#3a3a3c] rounded-full px-3 py-1.5 text-[#1d1d1f] dark:text-[#f5f5f7] focus:outline-none focus:ring-2 focus:ring-[#0071e3] dark:focus:ring-[#2997ff] cursor-pointer max-w-[140px] sm:max-w-[210px] truncate"
            >
              <option value="all">All Subjects</option>
              {subjects.map((sub) => (
                <option key={sub.id} value={sub.id}>
                  {sub.code ? `${sub.code} - ${sub.name}` : sub.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Apple Theme Switcher Button */}
        <button
          id="btn-theme-toggle"
          onClick={toggleTheme}
          aria-label={theme === 'dark' ? 'Switch to Classic White Theme' : 'Switch to Classic Dark Theme'}
          title={theme === 'dark' ? 'Switch to Classic White Theme' : 'Switch to Classic Dark Theme'}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#f5f5f7] dark:bg-[#2c2c2e] hover:bg-[#e5e5ea] dark:hover:bg-[#3a3a3c] border border-[#e5e5ea] dark:border-[#3a3a3c] text-[#1d1d1f] dark:text-[#f5f5f7] text-xs font-medium transition-all cursor-pointer shadow-2xs"
        >
          {theme === 'dark' ? (
            <>
              <Sun className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden md:inline">Light</span>
            </>
          ) : (
            <>
              <Moon className="w-3.5 h-3.5 text-[#0071e3]" />
              <span className="hidden md:inline">Dark</span>
            </>
          )}
        </button>
      </div>
    </header>
  );
};


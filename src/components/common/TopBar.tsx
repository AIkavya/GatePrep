import React from 'react';
import { Calendar as CalendarIcon, Filter, Sun, Moon, LogOut, User, Database } from 'lucide-react';
import { useGate } from '../../context/GateContext';
import { useAuth } from '../../context/AuthContext';
import { formatFullDateHeader } from '../../utils/dateUtils';

export const TopBar: React.FC = () => {
  const { subjects, selectedSubjectId, setSelectedSubjectId, activeTab, theme, toggleTheme, syncStatus } = useGate();
  const { user, logout } = useAuth();
  const currentDateStr = formatFullDateHeader();

  // Determine if subject selector is helpful on this view
  const showSubjectSelector = activeTab !== 'dashboard';

  return (
    <header className="sticky top-0 z-30 bg-white/80 dark:bg-[#161617]/80 backdrop-blur-md border-b border-[#e5e5ea] dark:border-[#333336] px-3 sm:px-6 lg:px-8 py-2.5 sm:py-3 flex items-center justify-between gap-2 sm:gap-4 transition-colors">
      {/* App branding for mobile and title */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        <div className="md:hidden w-7 h-7 rounded-lg bg-[#0071e3] dark:bg-[#2997ff] flex items-center justify-center font-bold text-white dark:text-black text-xs shadow-xs">
          GP
        </div>
        <div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <h2 className="text-sm sm:text-base lg:text-lg font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] tracking-tight truncate">
              GATE Prep
            </h2>
            <span className="hidden sm:inline-block text-[11px] px-2.5 py-0.5 rounded-full bg-[#f5f5f7] dark:bg-[#2c2c2e] text-[#86868b] dark:text-[#a1a1a6] font-medium border border-[#e5e5ea] dark:border-[#333336]">
              CSE
            </span>
          </div>
        </div>
      </div>

      {/* Center / Right tools: Date, Theme Toggle & Subject Selector */}
      <div className="flex items-center gap-1.5 sm:gap-3 min-w-0">
        {/* Current Date */}
        <div className="hidden lg:flex items-center gap-1.5 text-xs font-medium text-[#86868b] dark:text-[#a1a1a6] bg-[#f5f5f7] dark:bg-[#2c2c2e] px-3 py-1.5 rounded-full border border-[#e5e5ea] dark:border-[#3a3a3c]">
          <CalendarIcon className="w-3.5 h-3.5 text-[#86868b] dark:text-[#a1a1a6]" />
          <span>{currentDateStr}</span>
        </div>

        {/* Database Sync indicator */}
        <div
          title={`SQLite DB: ${syncStatus}`}
          className="flex items-center gap-1 text-[11px] text-[#86868b] dark:text-[#a1a1a6] bg-[#f5f5f7] dark:bg-[#2c2c2e] px-2 sm:px-2.5 py-1 rounded-full border border-[#e5e5ea] dark:border-[#3a3a3c]"
        >
          <Database className="w-3 h-3 text-[#0071e3] dark:text-[#2997ff]" />
          <span className="hidden sm:inline capitalize">{syncStatus}</span>
        </div>

        {/* Optional Subject Filter */}
        {showSubjectSelector && (
          <div className="flex items-center gap-1 min-w-0">
            <Filter className="w-3.5 h-3.5 text-[#86868b] dark:text-[#a1a1a6] hidden sm:block" />
            <select
              id="topbar-subject-select"
              aria-label="Filter by subject"
              value={selectedSubjectId}
              onChange={(e) => setSelectedSubjectId(e.target.value)}
              className="text-xs sm:text-sm font-medium bg-[#f5f5f7] dark:bg-[#2c2c2e] border border-[#e5e5ea] dark:border-[#3a3a3c] rounded-full px-2 sm:px-3 py-1.5 text-[#1d1d1f] dark:text-[#f5f5f7] focus:outline-none focus:ring-2 focus:ring-[#0071e3] dark:focus:ring-[#2997ff] cursor-pointer max-w-[100px] xs:max-w-[130px] sm:max-w-[200px] truncate"
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
          className="flex items-center justify-center gap-1.5 p-2 sm:px-3 sm:py-1.5 rounded-full bg-[#f5f5f7] dark:bg-[#2c2c2e] hover:bg-[#e5e5ea] dark:hover:bg-[#3a3a3c] border border-[#e5e5ea] dark:border-[#3a3a3c] text-[#1d1d1f] dark:text-[#f5f5f7] text-xs font-medium transition-all cursor-pointer shadow-2xs shrink-0"
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

        {/* Mobile User logout */}
        <div className="md:hidden flex items-center shrink-0">
          <button
            onClick={logout}
            title={`Signed in as ${user?.username}. Click to sign out.`}
            className="p-1.5 rounded-full bg-[#f5f5f7] dark:bg-[#2c2c2e] text-[#86868b] hover:text-[#ff3b30] border border-[#e5e5ea] dark:border-[#3a3a3c]"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
};


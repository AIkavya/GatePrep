import React from 'react';
import {
  LayoutDashboard,
  BookOpen,
  RotateCcw,
  FileQuestion,
  Calendar as CalendarIcon,
  Library,
  RotateCw,
  Award,
  Sun,
  Moon,
} from 'lucide-react';
import { useGate } from '../../context/GateContext';
import { TabType } from '../../types';

export const Sidebar: React.FC = () => {
  const { activeTab, setActiveTab, revisions, resetDemoData, theme, setTheme } = useGate();

  // Count revisions that need attention today (due today or overdue)
  const dueCount = revisions.filter(
    (r) => r.status === 'due_today' || r.status === 'overdue'
  ).length;

  const navItems: { id: TabType; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'learning', label: 'Learning', icon: BookOpen },
    { id: 'revision', label: 'Revision', icon: RotateCcw },
    { id: 'pyq', label: 'PYQ', icon: FileQuestion },
    { id: 'calendar', label: 'Calendar', icon: CalendarIcon },
    { id: 'subjects', label: 'Subjects', icon: Library },
    { id: 'exams', label: 'Exams & Tests', icon: Award },
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 bg-white dark:bg-[#161617] text-[#1d1d1f] dark:text-[#f5f5f7] border-r border-[#e5e5ea] dark:border-[#333336] shrink-0 transition-colors">
      {/* Brand Header */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-[#e5e5ea] dark:border-[#333336]">
        <div className="w-9 h-9 rounded-xl bg-[#0071e3] dark:bg-[#2997ff] flex items-center justify-center font-bold text-white dark:text-black tracking-wider text-sm shadow-xs">
          GP
        </div>
        <div>
          <h1 className="font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] tracking-tight leading-none text-base">
            GATE Prep
          </h1>
          <p className="text-[11px] text-[#86868b] dark:text-[#a1a1a6] mt-1 font-medium">CSE Focus Engine</p>
        </div>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              id={`nav-${item.id}`}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-[#0071e3] dark:bg-[#2997ff] text-white dark:text-black shadow-xs'
                  : 'text-[#424245] hover:text-[#1d1d1f] hover:bg-[#f5f5f7] dark:text-[#a1a1a6] dark:hover:text-[#f5f5f7] dark:hover:bg-[#242426]'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`w-4 h-4 ${
                    isActive ? 'text-white dark:text-black' : 'text-[#86868b] dark:text-[#86868b]'
                  }`}
                />
                <span>{item.label}</span>
              </div>
              {item.id === 'revision' && dueCount > 0 && (
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                    isActive
                      ? 'bg-white text-[#0071e3] dark:bg-black dark:text-[#2997ff]'
                      : 'bg-[#ff3b30] text-white animate-pulse'
                  }`}
                >
                  {dueCount}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Theme Segmented Switcher in Sidebar */}
      <div className="px-4 py-2">
        <div className="p-1 rounded-xl bg-[#f5f5f7] dark:bg-[#242426] border border-[#e5e5ea] dark:border-[#333336] flex items-center gap-1">
          <button
            id="sidebar-theme-light"
            onClick={() => setTheme('light')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              theme === 'light'
                ? 'bg-white text-[#1d1d1f] shadow-xs'
                : 'text-[#86868b] hover:text-[#1d1d1f]'
            }`}
          >
            <Sun className="w-3.5 h-3.5 text-amber-500" />
            <span>Classic Light</span>
          </button>
          <button
            id="sidebar-theme-dark"
            onClick={() => setTheme('dark')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              theme === 'dark'
                ? 'bg-[#161617] text-white shadow-xs'
                : 'text-[#86868b] hover:text-[#f5f5f7]'
            }`}
          >
            <Moon className="w-3.5 h-3.5 text-[#2997ff]" />
            <span>Classic Dark</span>
          </button>
        </div>
      </div>

      {/* Study Guidance Box */}
      <div className="p-4 mx-3 mb-4 rounded-2xl bg-[#f5f5f7] dark:bg-[#1d1d1f] border border-[#e5e5ea] dark:border-[#333336] text-xs">
        <p className="font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] mb-1">Daily Objective</p>
        <p className="text-[#86868b] dark:text-[#a1a1a6] leading-relaxed">
          Clear today&apos;s revisions first, then proceed to top-priority learning chapters.
        </p>
        <button
          id="btn-reset-demo"
          onClick={() => {
            if (window.confirm('Reset all data to default GATE CSE sample data?')) {
              resetDemoData();
            }
          }}
          className="mt-3 flex items-center gap-1.5 text-[#86868b] hover:text-[#0071e3] dark:hover:text-[#2997ff] transition-colors text-[11px] font-medium"
        >
          <RotateCw className="w-3 h-3" />
          <span>Reset sample data</span>
        </button>
      </div>
    </aside>
  );
};

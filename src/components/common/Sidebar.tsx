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
  LogOut,
  User,
  Database,
  Trash2,
  Download,
} from 'lucide-react';
import { useGate } from '../../context/GateContext';
import { useAuth } from '../../context/AuthContext';
import { TabType } from '../../types';

export const Sidebar: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    revisions,
    subjects,
    theme,
    setTheme,
    syncStatus,
    resetFreshWorkspace,
    importSyllabusTemplate,
  } = useGate();
  const { user, logout } = useAuth();

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
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
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

      {/* User and Database Status Card */}
      <div className="p-3 mx-3 mb-3 rounded-2xl bg-[#f5f5f7] dark:bg-[#1d1d1f] border border-[#e5e5ea] dark:border-[#333336]">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 rounded-full bg-[#0071e3]/10 dark:bg-[#2997ff]/20 text-[#0071e3] dark:text-[#2997ff] flex items-center justify-center font-bold text-xs shrink-0">
              <User className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] truncate">
                {user?.username || 'User'}
              </p>
              <div className="flex items-center gap-1 text-[10px] text-[#86868b] dark:text-[#a1a1a6]">
                <Database className="w-2.5 h-2.5 text-[#0071e3] dark:text-[#2997ff]" />
                <span>
                  {syncStatus === 'saving'
                    ? 'Saving to DB...'
                    : syncStatus === 'error'
                    ? 'Sync Error'
                    : 'SQLite Synced'}
                </span>
              </div>
            </div>
          </div>
          <button
            id="btn-sidebar-logout"
            onClick={logout}
            title="Sign out"
            aria-label="Sign out"
            className="p-1.5 rounded-lg text-[#86868b] hover:text-[#ff3b30] hover:bg-white dark:hover:bg-[#2c2c2e] transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Database Quick Actions */}
        <div className="pt-2 border-t border-[#e5e5ea] dark:border-[#333336] flex items-center justify-between text-[11px]">
          {subjects.length === 0 ? (
            <button
              id="btn-sidebar-import-template"
              onClick={importSyllabusTemplate}
              className="flex items-center gap-1 text-[#0071e3] dark:text-[#2997ff] hover:underline font-medium"
            >
              <Download className="w-3 h-3" />
              <span>Load GATE Template</span>
            </button>
          ) : (
            <button
              id="btn-sidebar-reset-fresh"
              onClick={() => {
                if (window.confirm('Reset workspace to a fresh clean state with 0 items?')) {
                  resetFreshWorkspace();
                }
              }}
              className="flex items-center gap-1 text-[#86868b] hover:text-[#ff3b30] transition-colors"
            >
              <Trash2 className="w-3 h-3" />
              <span>Clean Workspace</span>
            </button>
          )}

          <button
            id="btn-sidebar-reseed"
            onClick={() => {
              if (window.confirm('Reload standard GATE CSE syllabus template?')) {
                importSyllabusTemplate();
              }
            }}
            title="Reload standard GATE template"
            className="text-[#86868b] hover:text-[#1d1d1f] dark:hover:text-white"
          >
            <RotateCw className="w-3 h-3" />
          </button>
        </div>
      </div>
    </aside>
  );
};

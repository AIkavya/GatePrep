import React from 'react';
import {
  LayoutDashboard,
  BookOpen,
  RotateCcw,
  FileQuestion,
  Calendar as CalendarIcon,
  Library,
  Award,
} from 'lucide-react';
import { useGate } from '../../context/GateContext';
import { TabType } from '../../types';

export const MobileNav: React.FC = () => {
  const { activeTab, setActiveTab, revisions } = useGate();
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
    { id: 'exams', label: 'Exams', icon: Award },
  ];

  return (
    <nav
      aria-label="Mobile navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#161617]/95 backdrop-blur-md border-t border-[#e5e5ea] dark:border-[#333336] px-1 sm:px-3 pt-1.5 pb-[max(0.375rem,env(safe-area-inset-bottom))] shadow-lg transition-colors"
    >
      <div className="flex items-center justify-between sm:justify-around overflow-x-auto no-scrollbar gap-0.5 sm:gap-1 max-w-lg mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              id={`mobile-nav-${item.id}`}
              onClick={() => setActiveTab(item.id)}
              className={`flex-1 min-w-[48px] max-w-[72px] flex flex-col items-center justify-center py-1 px-1 rounded-xl relative transition-all min-h-[44px] ${
                isActive
                  ? 'text-[#0071e3] dark:text-[#2997ff] font-semibold bg-blue-50/70 dark:bg-blue-950/40'
                  : 'text-[#86868b] hover:text-[#1d1d1f] dark:hover:text-[#f5f5f7]'
              }`}
            >
              <div className="relative flex items-center justify-center">
                <Icon className={`w-4 h-4 sm:w-5 sm:h-5 transition-transform ${isActive ? 'scale-110' : ''}`} />
                {item.id === 'revision' && dueCount > 0 && (
                  <span className="absolute -top-1.5 -right-2 min-w-[15px] h-[15px] px-1 rounded-full bg-[#ff3b30] text-white text-[9px] font-bold flex items-center justify-center shadow-xs">
                    {dueCount > 99 ? '99+' : dueCount}
                  </span>
                )}
              </div>
              <span className="text-[10px] leading-tight mt-1 truncate max-w-full text-center">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

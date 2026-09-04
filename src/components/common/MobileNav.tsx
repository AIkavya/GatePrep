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
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/85 dark:bg-[#161617]/85 backdrop-blur-md border-t border-[#e5e5ea] dark:border-[#333336] px-2 py-1 shadow-sm transition-colors">
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              id={`mobile-nav-${item.id}`}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center py-1.5 px-2 relative transition-colors ${
                isActive
                  ? 'text-[#0071e3] dark:text-[#2997ff] font-semibold'
                  : 'text-[#86868b] hover:text-[#1d1d1f] dark:hover:text-[#f5f5f7]'
              }`}
            >
              <div className="relative">
                <Icon className="w-5 h-5" />
                {item.id === 'revision' && dueCount > 0 && (
                  <span className="absolute -top-1 -right-2 w-4 h-4 rounded-full bg-[#ff3b30] text-white text-[9px] font-bold flex items-center justify-center">
                    {dueCount}
                  </span>
                )}
              </div>
              <span className="text-[10px] mt-0.5">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

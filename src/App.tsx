import React from 'react';
import { GateProvider, useGate } from './context/GateContext';
import { Sidebar } from './components/common/Sidebar';
import { MobileNav } from './components/common/MobileNav';
import { TopBar } from './components/common/TopBar';
import { DashboardPage } from './components/dashboard/DashboardPage';
import { LearningPage } from './components/learning/LearningPage';
import { RevisionPage } from './components/revision/RevisionPage';
import { PyqPage } from './components/pyq/PyqPage';
import { CalendarPage } from './components/calendar/CalendarPage';
import { SubjectsPage } from './components/subjects/SubjectsPage';
import { ExamsPage } from './components/exams/ExamsPage';

const AppContent: React.FC = () => {
  const { activeTab } = useGate();

  return (
    <div className="flex h-screen bg-[#fbfbfd] dark:bg-[#000000] font-sans text-[#1d1d1f] dark:text-[#f5f5f7] overflow-hidden transition-colors">
      {/* Left Sidebar (Desktop) */}
      <Sidebar />

      {/* Main App Layout */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-[#fbfbfd] dark:bg-[#000000]">
        {/* Sticky Top Bar */}
        <TopBar />

        {/* Scrollable Main Stage */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-8 pb-20 md:pb-8 bg-[#fbfbfd] dark:bg-[#000000]">
          <div className="max-w-6xl mx-auto">
            {activeTab === 'dashboard' && <DashboardPage />}
            {activeTab === 'learning' && <LearningPage />}
            {activeTab === 'revision' && <RevisionPage />}
            {activeTab === 'pyq' && <PyqPage />}
            {activeTab === 'calendar' && <CalendarPage />}
            {activeTab === 'subjects' && <SubjectsPage />}
            {activeTab === 'exams' && <ExamsPage />}
          </div>
        </main>

        {/* Bottom Navigation (Mobile) */}
        <MobileNav />
      </div>
    </div>
  );
};

export default function App() {
  return (
    <GateProvider>
      <AppContent />
    </GateProvider>
  );
}

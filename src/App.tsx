import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
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
import { AuthScreen } from './components/auth/AuthScreen';

const AppContent: React.FC = () => {
  const { activeTab, isInitialized } = useGate();
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#f5f5f7] dark:bg-[#000000] text-[#1d1d1f] dark:text-[#f5f5f7]">
        <div className="w-10 h-10 border-3 border-[#0071e3] dark:border-[#2997ff] border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm font-medium text-[#86868b] dark:text-[#a1a1a6]">Loading your workspace...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthScreen />;
  }

  return (
    <div className="flex h-screen bg-[#fbfbfd] dark:bg-[#000000] font-sans text-[#1d1d1f] dark:text-[#f5f5f7] overflow-hidden transition-colors">
      {/* Left Sidebar (Desktop) */}
      <Sidebar />

      {/* Main App Layout */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-[#fbfbfd] dark:bg-[#000000]">
        {/* Sticky Top Bar */}
        <TopBar />

        {/* Scrollable Main Stage */}
        <main className="flex-1 overflow-y-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 pb-24 md:pb-8 bg-[#fbfbfd] dark:bg-[#000000]">
          <div className="max-w-6xl mx-auto w-full">
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
    <AuthProvider>
      <GateProvider>
        <AppContent />
      </GateProvider>
    </AuthProvider>
  );
}

import React, { useState } from 'react';
import {
  BookOpen,
  RotateCcw,
  FileQuestion,
  Calendar,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Layers,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import { useGate } from '../../context/GateContext';
import { formatDateDisplay, getTodayDateString } from '../../utils/dateUtils';
import { Modal } from '../common/Modal';

export const DashboardPage: React.FC = () => {
  const {
    subjects,
    chapters,
    revisions,
    pyqs,
    setActiveTab,
    setSelectedSubjectId,
    completeRevision,
    updateChapterProgress,
    completeChapter,
    rescheduleRevision,
    importSyllabusTemplate,
  } = useGate();

  const today = getTodayDateString();

  // Reschedule modal state
  const [rescheduleRevId, setRescheduleRevId] = useState<string | null>(null);
  const [newDueDate, setNewDueDate] = useState<string>(today);

  // Quick progress update modal
  const [progressModalChapId, setProgressModalChapId] = useState<string | null>(null);
  const [tempProgress, setTempProgress] = useState<number>(0);

  // 1. Current Learning: Highest priority chapter that is 'in_progress', or top 'not_started'
  const activeChapters = [...chapters].sort((a, b) => b.priority - a.priority);
  const currentChapter =
    activeChapters.find((c) => c.status === 'in_progress') ||
    activeChapters.find((c) => c.status === 'not_started') ||
    null;
  const currentSubject = currentChapter
    ? subjects.find((s) => s.id === currentChapter.subjectId)
    : null;

  // 2. Today's Revisions: status === 'due_today' or 'overdue'
  const todayRevisions = revisions.filter(
    (r) => r.status === 'due_today' || r.status === 'overdue'
  );

  // 3. Today's Recommended PYQs: PYQs for current chapter or today's revision chapters that are not attempted or wrong
  const targetChapterIds = [
    ...(currentChapter ? [currentChapter.id] : []),
    ...todayRevisions.map((r) => r.chapterId),
  ];
  const todayPyqs = pyqs.filter(
    (p) => targetChapterIds.includes(p.chapterId) && p.status !== 'correct'
  );
  const totalUnsolvedInTarget = todayPyqs.length;
  const primaryPyqChapter = currentChapter || (todayRevisions.length > 0 ? chapters.find(c => c.id === todayRevisions[0].chapterId) : null);
  const primaryPyqSubject = primaryPyqChapter ? subjects.find(s => s.id === primaryPyqChapter.subjectId) : null;

  // 4. Upcoming Revisions: status === 'upcoming', sorted by dueDate
  const upcomingRevisions = revisions
    .filter((r) => r.status === 'upcoming')
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
    .slice(0, 4);

  // 5. High-level counts
  const totalSubjects = subjects.length;
  const totalChapters = chapters.length;
  const completedChaptersCount = chapters.filter((c) => c.status === 'completed').length;
  const attemptedPyqsCount = pyqs.filter((p) => p.status !== 'not_attempted').length;
  const correctPyqsCount = pyqs.filter((p) => p.status === 'correct').length;
  const accuracyPct = attemptedPyqsCount > 0 ? Math.round((correctPyqsCount / attemptedPyqsCount) * 100) : 0;

  const handleOpenReschedule = (revId: string, currentDue: string) => {
    setRescheduleRevId(revId);
    setNewDueDate(currentDue);
  };

  const handleSaveReschedule = () => {
    if (rescheduleRevId && newDueDate) {
      rescheduleRevision(rescheduleRevId, newDueDate);
      setRescheduleRevId(null);
    }
  };

  const handleOpenProgressModal = (chap: typeof currentChapter) => {
    if (!chap) return;
    setProgressModalChapId(chap.id);
    setTempProgress(chap.progress);
  };

  const handleSaveProgressModal = () => {
    if (progressModalChapId) {
      if (tempProgress >= 100) {
        completeChapter(progressModalChapId);
      } else {
        updateChapterProgress(progressModalChapId, tempProgress);
      }
      setProgressModalChapId(null);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Apple Keynote Style Focus Banner */}
      <div className="bg-[#161617] text-white rounded-2xl p-5 sm:p-7 shadow-sm border border-[#333336] relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-2 text-[#2997ff] text-xs font-semibold tracking-wider uppercase mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Today&apos;s Study Priority</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#f5f5f7] tracking-tight">
            What should I study or revise for GATE today?
          </h1>
          <p className="text-[#a1a1a6] text-sm mt-1.5 max-w-2xl leading-relaxed">
            {todayRevisions.length > 0
              ? `You have ${todayRevisions.length} revision ${
                  todayRevisions.length === 1 ? 'task' : 'tasks'
                } due today. Clear active revisions first to reinforce retention, then advance ${
                  currentChapter ? `${currentChapter.name}` : 'your learning queue'
                }.`
              : `All revisions are up to date! Continue active learning on ${
                  currentChapter ? `${currentChapter.name}` : 'your target subject'
                }.`}
          </p>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 mt-6 pt-5 border-t border-[#333336]">
            <div className="bg-[#1c1c1e]/60 sm:bg-transparent p-2 sm:p-0 rounded-xl">
              <p className="text-[#86868b] text-[11px] sm:text-xs font-medium">Subjects</p>
              <p className="text-lg sm:text-2xl font-bold text-white mt-0.5">{totalSubjects}</p>
            </div>
            <div className="bg-[#1c1c1e]/60 sm:bg-transparent p-2 sm:p-0 rounded-xl">
              <p className="text-[#86868b] text-[11px] sm:text-xs font-medium">Chapters Done</p>
              <p className="text-lg sm:text-2xl font-bold text-white mt-0.5 truncate">
                {completedChaptersCount}{' '}
                <span className="text-xs font-normal text-[#86868b]">/ {totalChapters}</span>
              </p>
            </div>
            <div className="bg-[#1c1c1e]/60 sm:bg-transparent p-2 sm:p-0 rounded-xl">
              <p className="text-[#86868b] text-[11px] sm:text-xs font-medium">Revisions Due</p>
              <p
                className={`text-lg sm:text-2xl font-bold mt-0.5 ${
                  todayRevisions.length > 0 ? 'text-[#ff453a]' : 'text-[#30d158]'
                }`}
              >
                {todayRevisions.length}
              </p>
            </div>
            <div className="bg-[#1c1c1e]/60 sm:bg-transparent p-2 sm:p-0 rounded-xl">
              <p className="text-[#86868b] text-[11px] sm:text-xs font-medium">PYQ Attempted</p>
              <p className="text-lg sm:text-2xl font-bold text-white mt-0.5 truncate">
                {attemptedPyqsCount}{' '}
                <span className="text-xs font-normal text-[#30d158]">({accuracyPct}%)</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Fresh Workspace Welcome Banner (Displayed if user has 0 subjects) */}
      {totalSubjects === 0 && (
        <div className="bg-white dark:bg-[#161617] rounded-2xl p-4 sm:p-6 border border-[#e5e5ea] dark:border-[#333336] shadow-2xs">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-sm sm:text-base font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">
                Fresh Workspace (0 data)
              </h3>
              <p className="text-xs text-[#86868b] dark:text-[#a1a1a6] mt-1 max-w-xl leading-relaxed">
                Your account has started with a clean slate backed by SQLite. You can build your custom curriculum from scratch, or instantly load the standard GATE Computer Science &amp; IT syllabus template with 10+ core subjects and chapters.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2 shrink-0 w-full sm:w-auto">
              <button
                id="btn-fresh-add-subject"
                onClick={() => setActiveTab('subjects')}
                className="flex-1 sm:flex-initial text-center px-4 py-2 bg-[#0071e3] dark:bg-[#2997ff] text-white dark:text-black text-xs font-semibold rounded-full shadow-2xs hover:opacity-90 transition-all cursor-pointer min-h-[38px]"
              >
                + Add First Subject
              </button>
              <button
                id="btn-fresh-load-template"
                onClick={importSyllabusTemplate}
                className="flex-1 sm:flex-initial text-center px-4 py-2 bg-[#f5f5f7] dark:bg-[#2c2c2e] hover:bg-[#e5e5ea] dark:hover:bg-[#3a3a3c] text-[#1d1d1f] dark:text-[#f5f5f7] border border-[#e5e5ea] dark:border-[#3a3a3c] text-xs font-semibold rounded-full shadow-2xs transition-all cursor-pointer min-h-[38px]"
              >
                Load GATE CS Template
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Focus Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 1. CURRENT LEARNING */}
        <div className="bg-white dark:bg-[#161617] rounded-2xl border border-[#e5e5ea] dark:border-[#333336] p-5 sm:p-6 shadow-2xs flex flex-col justify-between transition-colors">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#e5e5ea] dark:border-[#333336]">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-[#0071e3] dark:text-[#2997ff] flex items-center justify-center">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-xs font-semibold text-[#86868b] dark:text-[#a1a1a6] uppercase tracking-wider">
                    Current Learning
                  </h2>
                </div>
              </div>
              <button
                id="btn-goto-learning"
                onClick={() => setActiveTab('learning')}
                className="text-xs font-medium text-[#0071e3] dark:text-[#2997ff] hover:underline flex items-center gap-1"
              >
                <span>View Queue</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {currentChapter ? (
              <div className="mt-4 space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span
                      className="inline-block text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full text-white mb-1.5"
                      style={{ backgroundColor: currentSubject?.color || '#0071e3' }}
                    >
                      {currentSubject?.code || currentSubject?.name}
                    </span>
                    <h3 className="text-lg font-bold text-[#1d1d1f] dark:text-[#f5f5f7] leading-snug">
                      {currentChapter.name}
                    </h3>
                    <p className="text-xs text-[#86868b] dark:text-[#a1a1a6] mt-1 line-clamp-2">
                      {currentChapter.notes || 'Priority active chapter in study queue.'}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#f5f5f7] dark:bg-[#2c2c2e] text-[#1d1d1f] dark:text-[#f5f5f7] border border-[#e5e5ea] dark:border-[#3a3a3c]">
                      Priority {currentChapter.priority}
                    </span>
                  </div>
                </div>

                {/* Progress Bar & percentage */}
                <div className="bg-[#f5f5f7] dark:bg-[#1d1d1f] rounded-xl p-3 border border-[#e5e5ea] dark:border-[#333336]">
                  <div className="flex items-center justify-between text-xs font-semibold mb-1.5 text-[#1d1d1f] dark:text-[#f5f5f7]">
                    <span>Progress</span>
                    <span>{currentChapter.progress}% complete</span>
                  </div>
                  <div className="w-full h-2 bg-[#e5e5ea] dark:bg-[#2c2c2e] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#0071e3] dark:bg-[#2997ff] rounded-full transition-all duration-300"
                      style={{ width: `${currentChapter.progress}%` }}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-8 text-center text-[#86868b] dark:text-[#a1a1a6] text-sm">
                No active chapters in the learning queue.
              </div>
            )}
          </div>

          {currentChapter && (
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 mt-5 pt-4 border-t border-[#e5e5ea] dark:border-[#333336]">
              <button
                id="btn-update-progress"
                onClick={() => handleOpenProgressModal(currentChapter)}
                className="flex-1 py-2 px-3 text-xs font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] bg-[#f5f5f7] dark:bg-[#2c2c2e] hover:bg-[#e5e5ea] dark:hover:bg-[#3a3a3c] rounded-full border border-[#e5e5ea] dark:border-[#3a3a3c] transition-colors text-center min-h-[38px] flex items-center justify-center"
              >
                Update Progress
              </button>
              <button
                id="btn-mark-chapter-complete"
                onClick={() => completeChapter(currentChapter.id)}
                className="flex-1 py-2 px-3 text-xs font-semibold text-white dark:text-black bg-[#0071e3] hover:bg-[#0077ed] dark:bg-[#2997ff] dark:hover:bg-[#40a9ff] rounded-full transition-colors flex items-center justify-center gap-1.5 min-h-[38px]"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Mark Completed</span>
              </button>
            </div>
          )}
        </div>

        {/* 2. TODAY'S REVISION */}
        <div className="bg-white dark:bg-[#161617] rounded-2xl border border-[#e5e5ea] dark:border-[#333336] p-5 sm:p-6 shadow-2xs flex flex-col justify-between transition-colors">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#e5e5ea] dark:border-[#333336]">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-red-50 dark:bg-red-950/50 text-[#ff3b30] dark:text-[#ff453a] flex items-center justify-center">
                  <RotateCcw className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-xs font-semibold text-[#86868b] dark:text-[#a1a1a6] uppercase tracking-wider">
                    Today&apos;s Revision
                  </h2>
                </div>
              </div>
              <button
                id="btn-goto-revision"
                onClick={() => setActiveTab('revision')}
                className="text-xs font-medium text-[#0071e3] dark:text-[#2997ff] hover:underline flex items-center gap-1"
              >
                <span>View All ({revisions.length})</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="mt-3 space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
              {todayRevisions.length > 0 ? (
                todayRevisions.map((rev) => {
                  const sub = subjects.find((s) => s.id === rev.subjectId);
                  const chap = chapters.find((c) => c.id === rev.chapterId);
                  const isOverdue = rev.status === 'overdue';

                  return (
                    <div
                      key={rev.id}
                      className={`p-3 rounded-xl border flex flex-col xs:flex-row xs:items-center justify-between gap-2.5 ${
                        isOverdue
                          ? 'bg-red-50/70 border-red-200/80 dark:bg-red-950/40 dark:border-red-900/60'
                          : 'bg-[#f5f5f7] border-[#e5e5ea] dark:bg-[#1d1d1f] dark:border-[#333336]'
                      }`}
                    >
                      <div className="flex items-start gap-2.5 min-w-0">
                        <span
                          className={`w-2.5 h-2.5 rounded-full mt-1 shrink-0 ${
                            isOverdue ? 'bg-[#ff3b30] dark:bg-[#ff453a] animate-pulse' : 'bg-[#ff9500]'
                          }`}
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-xs font-bold text-[#1d1d1f] dark:text-[#f5f5f7]">
                              {sub?.code || sub?.name}
                            </span>
                            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-white dark:bg-[#2c2c2e] text-[#1d1d1f] dark:text-[#f5f5f7] border border-[#e5e5ea] dark:border-[#3a3a3c]">
                              Rev {rev.revisionNumber}
                            </span>
                            {isOverdue && (
                              <span className="text-[10px] font-bold text-[#ff3b30] dark:text-[#ff453a] uppercase">
                                Overdue
                              </span>
                            )}
                          </div>
                          <p className="text-sm font-medium text-[#1d1d1f] dark:text-[#f5f5f7] leading-snug mt-0.5 truncate">
                            {chap?.name || 'Chapter'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0 self-end xs:self-auto">
                        <button
                          id={`btn-complete-rev-${rev.id}`}
                          onClick={() => completeRevision(rev.id)}
                          className="px-3 py-1.5 text-xs font-semibold rounded-full bg-[#34c759] hover:bg-[#30d158] text-white transition-colors flex items-center gap-1"
                          title="Mark Revision Complete"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Done</span>
                        </button>
                        <button
                          onClick={() => handleOpenReschedule(rev.id, rev.dueDate)}
                          className="px-2.5 py-1.5 text-[11px] font-medium rounded-full bg-white dark:bg-[#2c2c2e] hover:bg-[#e5e5ea] dark:hover:bg-[#3a3a3c] text-[#86868b] dark:text-[#a1a1a6] border border-[#e5e5ea] dark:border-[#3a3a3c] transition-colors"
                          title="Reschedule"
                        >
                          Delay
                        </button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="py-8 text-center text-[#86868b] dark:text-[#a1a1a6] text-sm flex flex-col items-center justify-center gap-1">
                  <CheckCircle2 className="w-7 h-7 text-[#34c759] dark:text-[#30d158]" />
                  <span className="font-medium text-[#1d1d1f] dark:text-[#f5f5f7] mt-1">
                    No revisions due today!
                  </span>
                  <span className="text-xs text-[#86868b] dark:text-[#a1a1a6]">
                    Spaced repetition queue is clear for today.
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#e5e5ea] dark:border-[#333336] text-xs text-[#86868b] dark:text-[#a1a1a6] flex items-center justify-between">
            <span>Completed revisions automatically schedule the next repetition.</span>
          </div>
        </div>
      </div>

      {/* Secondary Row: Today's PYQ & Upcoming Schedule */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 3. TODAY'S PYQ PRACTICE */}
        <div className="bg-white dark:bg-[#161617] rounded-2xl border border-[#e5e5ea] dark:border-[#333336] p-5 sm:p-6 shadow-2xs transition-colors">
          <div className="flex items-center justify-between pb-3 border-b border-[#e5e5ea] dark:border-[#333336]">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-purple-50 dark:bg-purple-950/50 text-[#af52de] dark:text-[#bf5af2] flex items-center justify-center">
                <FileQuestion className="w-4 h-4" />
              </div>
              <h2 className="text-xs font-semibold text-[#86868b] dark:text-[#a1a1a6] uppercase tracking-wider">
                Today&apos;s PYQ
              </h2>
            </div>
            <button
              id="btn-goto-pyq"
              onClick={() => {
                if (primaryPyqSubject) {
                  setSelectedSubjectId(primaryPyqSubject.id);
                }
                setActiveTab('pyq');
              }}
              className="text-xs font-medium text-[#0071e3] dark:text-[#2997ff] hover:underline flex items-center gap-1"
            >
              <span>Solve Questions</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="mt-4">
            {primaryPyqChapter ? (
              <div className="p-4 rounded-xl bg-[#f5f5f7] dark:bg-[#1d1d1f] border border-[#e5e5ea] dark:border-[#333336] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="min-w-0">
                  <span className="text-[11px] font-bold text-[#86868b] dark:text-[#a1a1a6] uppercase tracking-wider">
                    Recommended Focus
                  </span>
                  <h3 className="text-sm sm:text-base font-bold text-[#1d1d1f] dark:text-[#f5f5f7] mt-0.5 truncate">
                    {primaryPyqSubject?.code || primaryPyqSubject?.name} — {primaryPyqChapter.name}
                  </h3>
                  <p className="text-xs text-[#86868b] dark:text-[#a1a1a6] mt-1 line-clamp-2">
                    {totalUnsolvedInTarget > 0
                      ? `${totalUnsolvedInTarget} questions remaining for this topic`
                      : 'Sample GATE questions ready for practice'}
                  </p>
                </div>
                <button
                  id="btn-solve-today-pyq"
                  onClick={() => {
                    if (primaryPyqSubject) {
                      setSelectedSubjectId(primaryPyqSubject.id);
                    }
                    setActiveTab('pyq');
                  }}
                  className="px-4 py-2 rounded-full bg-[#0071e3] hover:bg-[#0077ed] dark:bg-[#2997ff] dark:hover:bg-[#40a9ff] text-white dark:text-black text-xs font-semibold transition-colors shrink-0 shadow-xs self-start sm:self-auto min-h-[36px]"
                >
                  Start Practice
                </button>
              </div>
            ) : (
              <div className="py-6 text-center text-[#86868b] dark:text-[#a1a1a6] text-sm">
                No active chapters selected for today.
              </div>
            )}

            {/* Quick PYQ stats breakdown */}
            <div className="grid grid-cols-3 gap-2 mt-4 text-center">
              <div className="p-2.5 rounded-xl bg-[#f5f5f7] dark:bg-[#1d1d1f] border border-[#e5e5ea] dark:border-[#333336]">
                <p className="text-[11px] text-[#86868b] dark:text-[#a1a1a6] font-medium">Total Questions</p>
                <p className="text-base font-bold text-[#1d1d1f] dark:text-[#f5f5f7] mt-0.5">{pyqs.length}</p>
              </div>
              <div className="p-2.5 rounded-xl bg-[#f5f5f7] dark:bg-[#1d1d1f] border border-[#e5e5ea] dark:border-[#333336]">
                <p className="text-[11px] text-[#86868b] dark:text-[#a1a1a6] font-medium">Correct</p>
                <p className="text-base font-bold text-[#34c759] dark:text-[#30d158] mt-0.5">{correctPyqsCount}</p>
              </div>
              <div className="p-2.5 rounded-xl bg-[#f5f5f7] dark:bg-[#1d1d1f] border border-[#e5e5ea] dark:border-[#333336]">
                <p className="text-[11px] text-[#86868b] dark:text-[#a1a1a6] font-medium">Accuracy</p>
                <p className="text-base font-bold text-[#0071e3] dark:text-[#2997ff] mt-0.5">{accuracyPct}%</p>
              </div>
            </div>
          </div>
        </div>

        {/* 4. UPCOMING REVISIONS */}
        <div className="bg-white dark:bg-[#161617] rounded-2xl border border-[#e5e5ea] dark:border-[#333336] p-5 sm:p-6 shadow-2xs transition-colors">
          <div className="flex items-center justify-between pb-3 border-b border-[#e5e5ea] dark:border-[#333336]">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-[#34c759] dark:text-[#30d158] flex items-center justify-center">
                <Calendar className="w-4 h-4" />
              </div>
              <h2 className="text-xs font-semibold text-[#86868b] dark:text-[#a1a1a6] uppercase tracking-wider">
                Upcoming Schedule
              </h2>
            </div>
            <button
              id="btn-goto-calendar"
              onClick={() => setActiveTab('calendar')}
              className="text-xs font-medium text-[#0071e3] dark:text-[#2997ff] hover:underline flex items-center gap-1"
            >
              <span>View Calendar</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="mt-4 space-y-2.5">
            {upcomingRevisions.length > 0 ? (
              upcomingRevisions.map((rev) => {
                const sub = subjects.find((s) => s.id === rev.subjectId);
                const chap = chapters.find((c) => c.id === rev.chapterId);
                const displayDate = formatDateDisplay(rev.dueDate);

                return (
                  <div
                    key={rev.id}
                    className="p-3 rounded-xl bg-[#f5f5f7] dark:bg-[#1d1d1f] border border-[#e5e5ea] dark:border-[#333336] flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-semibold text-[#0071e3] dark:text-[#2997ff] mr-2">{displayDate}</span>
                      <span className="font-medium text-[#1d1d1f] dark:text-[#f5f5f7]">
                        {sub?.code || sub?.name} — {chap?.name} Revision {rev.revisionNumber}
                      </span>
                    </div>
                    <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-white dark:bg-[#2c2c2e] text-[#86868b] dark:text-[#a1a1a6] border border-[#e5e5ea] dark:border-[#3a3a3c] shrink-0">
                      {rev.dueDate}
                    </span>
                  </div>
                );
              })
            ) : (
              <div className="py-6 text-center text-[#86868b] dark:text-[#a1a1a6] text-xs">
                No future revisions currently scheduled. Mark chapters as completed to populate spaced repetition.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Reschedule Modal */}
      <Modal
        isOpen={rescheduleRevId !== null}
        onClose={() => setRescheduleRevId(null)}
        title="Reschedule Revision"
        subtitle="Choose a new date for this revision task"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-[#1d1d1f] dark:text-[#f5f5f7] mb-1">
              New Due Date
            </label>
            <input
              type="date"
              value={newDueDate}
              onChange={(e) => setNewDueDate(e.target.value)}
              className="w-full bg-[#f5f5f7] dark:bg-[#2c2c2e] border border-[#e5e5ea] dark:border-[#3a3a3c] text-[#1d1d1f] dark:text-[#f5f5f7] rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-[#0071e3] dark:focus:ring-[#2997ff] focus:outline-none"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={() => setRescheduleRevId(null)}
              className="px-4 py-2 text-xs font-semibold text-[#86868b] dark:text-[#a1a1a6] hover:bg-[#f5f5f7] dark:hover:bg-[#2c2c2e] rounded-full"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveReschedule}
              className="px-4 py-2 text-xs font-semibold text-white dark:text-black bg-[#0071e3] hover:bg-[#0077ed] dark:bg-[#2997ff] dark:hover:bg-[#40a9ff] rounded-full shadow-xs"
            >
              Save New Date
            </button>
          </div>
        </div>
      </Modal>

      {/* Progress Slider Modal */}
      <Modal
        isOpen={progressModalChapId !== null}
        onClose={() => setProgressModalChapId(null)}
        title="Update Learning Progress"
        subtitle={currentChapter ? `${currentChapter.name}` : ''}
      >
        <div className="space-y-5">
          <div>
            <div className="flex justify-between text-sm font-semibold mb-2 text-[#1d1d1f] dark:text-[#f5f5f7]">
              <span>Chapter Progress</span>
              <span>{tempProgress}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={tempProgress}
              onChange={(e) => setTempProgress(Number(e.target.value))}
              className="w-full accent-[#0071e3] dark:accent-[#2997ff] cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-[#86868b] dark:text-[#a1a1a6] mt-1">
              <span>0% (Not Started)</span>
              <span>50%</span>
              <span>100% (Completed)</span>
            </div>
          </div>

          <div className="flex gap-2">
            {[25, 50, 75, 100].map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setTempProgress(preset)}
                className={`flex-1 py-1.5 text-xs font-medium rounded-full border transition-all ${
                  tempProgress === preset
                    ? 'bg-[#0071e3] text-white border-[#0071e3] dark:bg-[#2997ff] dark:text-black dark:border-[#2997ff]'
                    : 'bg-[#f5f5f7] dark:bg-[#2c2c2e] text-[#1d1d1f] dark:text-[#f5f5f7] border-[#e5e5ea] dark:border-[#3a3a3c] hover:border-[#d2d2d7]'
                }`}
              >
                {preset}%
              </button>
            ))}
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-[#e5e5ea] dark:border-[#38383a]">
            <button
              onClick={() => setProgressModalChapId(null)}
              className="px-4 py-2 text-xs font-semibold text-[#86868b] dark:text-[#a1a1a6] hover:bg-[#f5f5f7] dark:hover:bg-[#2c2c2e] rounded-full"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveProgressModal}
              className="px-4 py-2 text-xs font-semibold text-white dark:text-black bg-[#0071e3] hover:bg-[#0077ed] dark:bg-[#2997ff] dark:hover:bg-[#40a9ff] rounded-full shadow-xs"
            >
              Save Progress
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

import React, { useState } from 'react';
import {
  RotateCcw,
  CheckCircle2,
  Calendar,
  Clock,
  Settings,
  AlertTriangle,
  ChevronRight,
  Sliders,
  SkipForward,
  Filter,
  Plus,
  ArrowUp,
  ArrowDown,
  Play,
  Trash2,
  Edit2,
  Check,
  ListOrdered,
  CalendarDays,
} from 'lucide-react';
import { useGate } from '../../context/GateContext';
import { Revision } from '../../types';
import { formatDateDisplay, getTodayDateString, formatShortDate } from '../../utils/dateUtils';
import { RevisionStatusBadge } from '../common/Badge';
import { Modal } from '../common/Modal';

export const RevisionPage: React.FC = () => {
  const {
    subjects,
    chapters,
    revisions,
    revisionSettings,
    updateRevisionSettings,
    selectedSubjectId,
    setSelectedSubjectId,
    addRevision,
    updateRevision,
    deleteRevision,
    completeRevision,
    rescheduleRevision,
    skipRevision,
    adjustRevisionPriority,
    updateRevisionProgress,
    startRevision,
  } = useGate();

  const today = getTodayDateString();

  // Top view mode: 'queue' (Learning-like priority stack) vs 'schedule' (Date-based views)
  const [viewMode, setViewMode] = useState<'queue' | 'schedule'>('queue');
  const [activeFilterTab, setActiveFilterTab] = useState<'today' | 'upcoming' | 'overdue' | 'history'>('today');

  // Add / Edit Revision Modal state
  const [isRevisionModalOpen, setIsRevisionModalOpen] = useState(false);
  const [editingRevId, setEditingRevId] = useState<string | null>(null);
  const [formSubjectId, setFormSubjectId] = useState<string>(
    selectedSubjectId !== 'all' ? selectedSubjectId : subjects[0]?.id || ''
  );
  const [formChapterId, setFormChapterId] = useState<string>('');
  const [formRevNumber, setFormRevNumber] = useState<number>(1);
  const [formDueDate, setFormDueDate] = useState<string>(today);
  const [formPriority, setFormPriority] = useState<number>(10);
  const [formProgress, setFormProgress] = useState<number>(0);
  const [formNotes, setFormNotes] = useState<string>('');

  // Inline progress adjustment
  const [inlineProgressId, setInlineProgressId] = useState<string | null>(null);
  const [inlineProgressValue, setInlineProgressValue] = useState<number>(0);

  // Reschedule modal
  const [rescheduleRevId, setRescheduleRevId] = useState<string | null>(null);
  const [newDueDate, setNewDueDate] = useState<string>(today);

  // Settings modal
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [tempRev1, setTempRev1] = useState(revisionSettings.rev1Days);
  const [tempRev2, setTempRev2] = useState(revisionSettings.rev2Days);
  const [tempRev3, setTempRev3] = useState(revisionSettings.rev3Days);

  // Filter revisions by subject
  const subjectFilteredRevisions = revisions.filter((r) =>
    selectedSubjectId === 'all' ? true : r.subjectId === selectedSubjectId
  );

  // Active revisions (not completed, not skipped) sorted by priority (highest first)
  const activeQueue = subjectFilteredRevisions
    .filter((r) => r.status !== 'completed' && r.status !== 'skipped')
    .sort((a, b) => (b.priority || 10) - (a.priority || 10));

  const completedRevisions = subjectFilteredRevisions
    .filter((r) => r.status === 'completed')
    .sort((a, b) => (b.completedDate || '').localeCompare(a.completedDate || ''));

  // CURRENT Top Priority revision in queue
  const currentRevision = activeQueue[0] || null;
  const currentSubject = currentRevision
    ? subjects.find((s) => s.id === currentRevision.subjectId)
    : null;
  const currentChapter = currentRevision
    ? chapters.find((c) => c.id === currentRevision.chapterId)
    : null;

  // UP NEXT in queue
  const upNextRevisions = activeQueue.slice(1);

  // Categorize for schedule view
  const dueTodayRevisions = subjectFilteredRevisions.filter((r) => r.status === 'due_today');
  const overdueRevisions = subjectFilteredRevisions.filter((r) => r.status === 'overdue');
  const todayCombined = [...overdueRevisions, ...dueTodayRevisions];

  const upcomingRevisions = subjectFilteredRevisions
    .filter((r) => r.status === 'upcoming')
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate));

  const historyRevisions = subjectFilteredRevisions
    .filter((r) => r.status === 'completed' || r.status === 'skipped')
    .sort((a, b) => (b.completedDate || b.dueDate).localeCompare(a.completedDate || a.dueDate));

  // Available chapters for the selected subject in form
  const formChapters = chapters.filter((c) => c.subjectId === formSubjectId);

  const handleOpenAddRevision = () => {
    setEditingRevId(null);
    const subId = selectedSubjectId !== 'all' ? selectedSubjectId : subjects[0]?.id || '';
    setFormSubjectId(subId);
    const availableChaps = chapters.filter((c) => c.subjectId === subId);
    setFormChapterId(availableChaps[0]?.id || '');
    setFormRevNumber(1);
    setFormDueDate(today);
    setFormPriority(activeQueue.length > 0 ? Math.max(...activeQueue.map((r) => r.priority || 10)) + 1 : 10);
    setFormProgress(0);
    setFormNotes('');
    setIsRevisionModalOpen(true);
  };

  const handleOpenEditRevision = (rev: Revision) => {
    setEditingRevId(rev.id);
    setFormSubjectId(rev.subjectId);
    setFormChapterId(rev.chapterId);
    setFormRevNumber(rev.revisionNumber);
    setFormDueDate(rev.dueDate);
    setFormPriority(rev.priority || 10);
    setFormProgress(rev.progress || 0);
    setFormNotes(rev.notes || '');
    setIsRevisionModalOpen(true);
  };

  const handleSaveRevision = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formSubjectId || !formChapterId || !formDueDate) return;

    if (editingRevId) {
      updateRevision(editingRevId, {
        subjectId: formSubjectId,
        chapterId: formChapterId,
        revisionNumber: Number(formRevNumber),
        dueDate: formDueDate,
        priority: Number(formPriority),
        progress: Number(formProgress),
        notes: formNotes.trim(),
      });
    } else {
      addRevision({
        subjectId: formSubjectId,
        chapterId: formChapterId,
        revisionNumber: Number(formRevNumber),
        dueDate: formDueDate,
        priority: Number(formPriority),
        progress: Number(formProgress),
        notes: formNotes.trim(),
        status: 'upcoming',
      });
    }

    setIsRevisionModalOpen(false);
  };

  const handleOpenReschedule = (rev: Revision) => {
    setRescheduleRevId(rev.id);
    setNewDueDate(rev.dueDate);
  };

  const handleSaveReschedule = () => {
    if (rescheduleRevId && newDueDate) {
      rescheduleRevision(rescheduleRevId, newDueDate);
      setRescheduleRevId(null);
    }
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateRevisionSettings({
      rev1Days: Number(tempRev1),
      rev2Days: Number(tempRev2),
      rev3Days: Number(tempRev3),
    });
    setIsSettingsOpen(false);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#161617] p-5 rounded-2xl border border-[#e5e5ea] dark:border-[#333336] shadow-2xs transition-colors">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-[#1d1d1f] dark:text-[#f5f5f7] tracking-tight">Revision Management</h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full font-medium bg-red-50 dark:bg-red-950/40 text-[#ff3b30] dark:text-[#ff453a] border border-red-200/80 dark:border-red-800/60">
              Manual Scheduling
            </span>
          </div>
          <p className="text-xs text-[#86868b] dark:text-[#a1a1a6] mt-1">
            Prioritize active revisions, adjust progress, and schedule targeted review sessions without auto-scheduling.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            id="btn-add-revision-schedule"
            onClick={handleOpenAddRevision}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#0071e3] hover:bg-[#0077ed] dark:bg-[#2997ff] dark:hover:bg-[#40a9ff] text-white dark:text-black text-xs font-semibold rounded-full transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Add Revision</span>
          </button>

          <button
            id="btn-revision-settings"
            onClick={() => {
              setTempRev1(revisionSettings.rev1Days);
              setTempRev2(revisionSettings.rev2Days);
              setTempRev3(revisionSettings.rev3Days);
              setIsSettingsOpen(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-[#f5f5f7] dark:bg-[#2c2c2e] hover:bg-[#e5e5ea] dark:hover:bg-[#3a3a3c] text-[#1d1d1f] dark:text-[#f5f5f7] text-xs font-semibold rounded-full border border-[#e5e5ea] dark:border-[#3a3a3c] transition-colors"
            title="Custom Interval Presets"
          >
            <Settings className="w-4 h-4" />
            <span className="hidden sm:inline">Intervals</span>
          </button>
        </div>
      </div>

      {/* Subject Filter Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
        <button
          onClick={() => setSelectedSubjectId('all')}
          className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors border ${
            selectedSubjectId === 'all'
              ? 'bg-[#1d1d1f] text-white dark:bg-white dark:text-black border-transparent shadow-2xs'
              : 'bg-white dark:bg-[#161617] text-[#86868b] dark:text-[#a1a1a6] border-[#e5e5ea] dark:border-[#333336] hover:bg-[#f5f5f7] dark:hover:bg-[#2c2c2e]'
          }`}
        >
          All Subjects ({revisions.length})
        </button>
        {subjects.map((s) => {
          const count = revisions.filter((r) => r.subjectId === s.id).length;
          const isSelected = selectedSubjectId === s.id;
          return (
            <button
              key={s.id}
              onClick={() => setSelectedSubjectId(s.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors border ${
                isSelected
                  ? 'bg-[#0071e3] text-white dark:bg-[#2997ff] dark:text-black border-transparent shadow-2xs'
                  : 'bg-white dark:bg-[#161617] text-[#86868b] dark:text-[#a1a1a6] border-[#e5e5ea] dark:border-[#333336] hover:bg-[#f5f5f7] dark:hover:bg-[#2c2c2e]'
              }`}
            >
              {s.code || s.name} ({count})
            </button>
          );
        })}
      </div>

      {/* Top View Mode Switcher: Priority Queue vs Date Schedule */}
      <div className="flex items-center justify-between border-b border-[#e5e5ea] dark:border-[#333336] pb-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode('queue')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
              viewMode === 'queue'
                ? 'bg-blue-50 dark:bg-blue-950/40 text-[#0071e3] dark:text-[#2997ff] border border-blue-200/80 dark:border-blue-800/60'
                : 'text-[#86868b] dark:text-[#a1a1a6] hover:bg-[#f5f5f7] dark:hover:bg-[#2c2c2e]'
            }`}
          >
            <ListOrdered className="w-4 h-4" />
            <span>Priority Queue ({activeQueue.length})</span>
          </button>

          <button
            onClick={() => setViewMode('schedule')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
              viewMode === 'schedule'
                ? 'bg-blue-50 dark:bg-blue-950/40 text-[#0071e3] dark:text-[#2997ff] border border-blue-200/80 dark:border-blue-800/60'
                : 'text-[#86868b] dark:text-[#a1a1a6] hover:bg-[#f5f5f7] dark:hover:bg-[#2c2c2e]'
            }`}
          >
            <CalendarDays className="w-4 h-4" />
            <span>Due Date Schedule ({todayCombined.length} Due)</span>
          </button>
        </div>

        <div className="text-xs text-[#86868b] dark:text-[#a1a1a6] hidden sm:block">
          {completedRevisions.length} revisions completed
        </div>
      </div>

      {/* ===================== VIEW 1: PRIORITY QUEUE (LEARNING-LIKE INTERFACE) ===================== */}
      {viewMode === 'queue' && (
        <div className="space-y-6">
          {/* CURRENT TOP REVISION HERO CARD */}
          {currentRevision ? (
            <div className="bg-white dark:bg-[#161617] rounded-2xl border border-[#e5e5ea] dark:border-[#333336] p-5 sm:p-6 shadow-2xs relative overflow-hidden transition-colors">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-[#ff3b30] text-white">
                    CURRENT REVISION FOCUS
                  </span>
                  <span
                    className="text-xs font-bold px-2.5 py-0.5 rounded-full text-white"
                    style={{ backgroundColor: currentSubject?.color || '#ff3b30' }}
                  >
                    {currentSubject?.code || currentSubject?.name || 'Subject'}
                  </span>
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-red-50 dark:bg-red-950/40 text-[#ff3b30] dark:text-[#ff453a] border border-red-200/80 dark:border-red-800/60">
                    Rev {currentRevision.revisionNumber}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-[#86868b] dark:text-[#a1a1a6]">
                    Due: {formatShortDate(currentRevision.dueDate)}
                  </span>
                  <RevisionStatusBadge status={currentRevision.status} />
                </div>
              </div>

              <div className="mb-4">
                <h2 className="text-xl sm:text-2xl font-bold text-[#1d1d1f] dark:text-[#f5f5f7] mb-1">
                  {currentChapter?.name || 'Unknown Chapter'}
                </h2>
                {currentRevision.notes ? (
                  <p className="text-xs text-[#86868b] dark:text-[#a1a1a6] max-w-2xl">{currentRevision.notes}</p>
                ) : (
                  <p className="text-xs text-[#86868b] dark:text-[#a1a1a6] italic">No notes attached to this revision.</p>
                )}
              </div>

              {/* Progress Slider and Actions */}
              <div className="bg-[#f5f5f7] dark:bg-[#1d1d1f] p-4 rounded-xl border border-[#e5e5ea] dark:border-[#333336] space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-[#86868b] dark:text-[#a1a1a6]">Revision Progress</span>
                  <span className="font-bold text-[#ff3b30] dark:text-[#ff453a] text-sm">
                    {currentRevision.progress || 0}%
                  </span>
                </div>

                <div className="w-full bg-[#e5e5ea] dark:bg-[#2c2c2e] h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-[#ff3b30] h-full rounded-full transition-all duration-300"
                    style={{ width: `${currentRevision.progress || 0}%` }}
                  />
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-2">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <button
                      onClick={() =>
                        updateRevisionProgress(
                          currentRevision.id,
                          Math.min(100, (currentRevision.progress || 0) + 25)
                        )
                      }
                      className="px-3 py-1 text-xs font-semibold bg-white dark:bg-[#2c2c2e] border border-[#e5e5ea] dark:border-[#3a3a3c] text-[#ff3b30] dark:text-[#ff453a] hover:opacity-80 rounded-full transition-colors min-h-[32px]"
                    >
                      +25% Progress
                    </button>
                    <button
                      onClick={() =>
                        updateRevisionProgress(
                          currentRevision.id,
                          Math.min(100, (currentRevision.progress || 0) + 50)
                        )
                      }
                      className="px-3 py-1 text-xs font-semibold bg-white dark:bg-[#2c2c2e] border border-[#e5e5ea] dark:border-[#3a3a3c] text-[#ff3b30] dark:text-[#ff453a] hover:opacity-80 rounded-full transition-colors min-h-[32px]"
                    >
                      +50% Progress
                    </button>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    <button
                      onClick={() => handleOpenEditRevision(currentRevision)}
                      className="p-1.5 text-[#86868b] dark:text-[#a1a1a6] hover:text-[#1d1d1f] dark:hover:text-[#f5f5f7] hover:bg-[#e5e5ea] dark:hover:bg-[#2c2c2e] rounded-full transition-colors"
                      title="Edit Revision"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => completeRevision(currentRevision.id)}
                      className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-full transition-colors shadow-xs min-h-[36px]"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Mark Revision Complete</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-[#161617] rounded-2xl border border-dashed border-[#e5e5ea] dark:border-[#333336] p-8 text-center transition-colors">
              <RotateCcw className="w-10 h-10 text-[#86868b] mx-auto mb-2" />
              <h3 className="text-base font-bold text-[#1d1d1f] dark:text-[#f5f5f7]">No active revisions in queue</h3>
              <p className="text-xs text-[#86868b] dark:text-[#a1a1a6] mt-1 max-w-md mx-auto">
                All scheduled revisions are complete or none are added yet. Click below to schedule a revision topic.
              </p>
              <button
                onClick={handleOpenAddRevision}
                className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-[#0071e3] hover:bg-[#0077ed] dark:bg-[#2997ff] dark:hover:bg-[#40a9ff] text-white dark:text-black text-xs font-semibold rounded-full transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Schedule Revision</span>
              </button>
            </div>
          )}

          {/* UP NEXT IN QUEUE */}
          {upNextRevisions.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-[#1d1d1f] dark:text-[#f5f5f7] uppercase tracking-wider flex items-center gap-2">
                  <span>Up Next in Queue</span>
                  <span className="text-xs text-[#86868b] dark:text-[#a1a1a6] font-normal">
                    ({upNextRevisions.length} upcoming topics)
                  </span>
                </h3>
              </div>

              <div className="space-y-2.5">
                {upNextRevisions.map((rev) => {
                  const sub = subjects.find((s) => s.id === rev.subjectId);
                  const chap = chapters.find((c) => c.id === rev.chapterId);
                  const isInlineOpen = inlineProgressId === rev.id;

                  return (
                    <div
                      key={rev.id}
                      className="bg-white dark:bg-[#161617] rounded-2xl border border-[#e5e5ea] dark:border-[#333336] p-4 shadow-2xs hover:border-[#86868b]/40 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                    >
                      <div className="flex items-start sm:items-center gap-3">
                        {/* Priority adjust controls */}
                        <div className="flex flex-col items-center justify-center p-1 bg-[#f5f5f7] dark:bg-[#2c2c2e] rounded-xl border border-[#e5e5ea] dark:border-[#3a3a3c]">
                          <button
                            onClick={() => adjustRevisionPriority(rev.id, 1)}
                            className="p-1 text-[#86868b] hover:text-[#1d1d1f] dark:hover:text-[#f5f5f7]"
                            title="Increase Priority"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <span className="text-xs font-bold text-[#1d1d1f] dark:text-[#f5f5f7] px-1">
                            {rev.priority || 10}
                          </span>
                          <button
                            onClick={() => adjustRevisionPriority(rev.id, -1)}
                            className="p-1 text-[#86868b] hover:text-[#1d1d1f] dark:hover:text-[#f5f5f7]"
                            title="Decrease Priority"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div>
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <span
                              className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white"
                              style={{ backgroundColor: sub?.color || '#ff3b30' }}
                            >
                              {sub?.code || sub?.name || 'Subject'}
                            </span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-50 dark:bg-red-950/40 text-[#ff3b30] dark:text-[#ff453a] border border-red-200/80 dark:border-red-800/60">
                              Rev {rev.revisionNumber}
                            </span>
                            <h4 className="text-sm font-bold text-[#1d1d1f] dark:text-[#f5f5f7]">{chap?.name}</h4>
                          </div>

                          <div className="flex flex-wrap items-center gap-3 text-xs text-[#86868b] dark:text-[#a1a1a6]">
                            <span>Due: {formatShortDate(rev.dueDate)}</span>
                            <span>•</span>
                            <span>Progress: {rev.progress || 0}%</span>
                            {rev.notes && (
                              <>
                                <span>•</span>
                                <span className="italic max-w-xs truncate">{rev.notes}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right side controls */}
                      <div className="flex items-center gap-2 self-end md:self-center">
                        {isInlineOpen ? (
                          <div className="flex items-center gap-1.5 bg-[#f5f5f7] dark:bg-[#2c2c2e] p-1.5 rounded-xl border border-[#e5e5ea] dark:border-[#3a3a3c] animate-in fade-in">
                            <input
                              type="range"
                              min="0"
                              max="100"
                              value={inlineProgressValue}
                              onChange={(e) => setInlineProgressValue(Number(e.target.value))}
                              className="w-24 accent-[#ff3b30]"
                            />
                            <span className="text-xs font-bold w-9 text-[#1d1d1f] dark:text-[#f5f5f7]">
                              {inlineProgressValue}%
                            </span>
                            <button
                              onClick={() => {
                                updateRevisionProgress(rev.id, inlineProgressValue);
                                setInlineProgressId(null);
                              }}
                              className="p-1 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded-full"
                              title="Save Progress"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              setInlineProgressId(rev.id);
                              setInlineProgressValue(rev.progress || 0);
                            }}
                            className="px-3 py-1.5 text-xs font-semibold bg-[#f5f5f7] dark:bg-[#2c2c2e] hover:bg-[#e5e5ea] dark:hover:bg-[#3a3a3c] text-[#1d1d1f] dark:text-[#f5f5f7] rounded-full transition-colors"
                          >
                            Update Progress
                          </button>
                        )}

                        <button
                          onClick={() => completeRevision(rev.id)}
                          className="flex items-center gap-1 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 text-xs font-bold rounded-full transition-colors border border-emerald-200/80 dark:border-emerald-800/60"
                          title="Complete Revision"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Done</span>
                        </button>

                        <button
                          onClick={() => handleOpenEditRevision(rev)}
                          className="p-1.5 text-[#86868b] dark:text-[#a1a1a6] hover:text-[#1d1d1f] dark:hover:text-[#f5f5f7] hover:bg-[#e5e5ea] dark:hover:bg-[#2c2c2e] rounded-full transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => {
                            if (window.confirm('Delete this scheduled revision?')) {
                              deleteRevision(rev.id);
                            }
                          }}
                          className="p-1.5 text-[#86868b] dark:text-[#a1a1a6] hover:text-[#ff3b30] dark:hover:text-[#ff453a] hover:bg-red-50 dark:hover:bg-red-950/40 rounded-full transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ===================== VIEW 2: BY DUE DATE SCHEDULE ===================== */}
      {viewMode === 'schedule' && (
        <div className="space-y-4">
          {/* Sub tabs for date filters */}
          <div className="flex items-center gap-2 border-b border-[#e5e5ea] dark:border-[#333336] text-xs sm:text-sm font-semibold overflow-x-auto pb-1">
            <button
              onClick={() => setActiveFilterTab('today')}
              className={`pb-2 border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap ${
                activeFilterTab === 'today'
                  ? 'border-[#ff3b30] text-[#ff3b30] dark:border-[#ff453a] dark:text-[#ff453a]'
                  : 'border-transparent text-[#86868b] dark:text-[#a1a1a6] hover:text-[#1d1d1f] dark:hover:text-[#f5f5f7]'
              }`}
            >
              <span>Today&apos;s Revision</span>
              {todayCombined.length > 0 && (
                <span className="px-2 py-0.5 rounded-full text-xs bg-[#ff3b30] text-white font-bold">
                  {todayCombined.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveFilterTab('upcoming')}
              className={`pb-2 border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap ${
                activeFilterTab === 'upcoming'
                  ? 'border-[#0071e3] text-[#0071e3] dark:border-[#2997ff] dark:text-[#2997ff]'
                  : 'border-transparent text-[#86868b] dark:text-[#a1a1a6] hover:text-[#1d1d1f] dark:hover:text-[#f5f5f7]'
              }`}
            >
              <span>Upcoming</span>
              <span className="px-2 py-0.5 rounded-full text-xs bg-[#f5f5f7] dark:bg-[#2c2c2e] text-[#1d1d1f] dark:text-[#f5f5f7] font-medium">
                {upcomingRevisions.length}
              </span>
            </button>

            <button
              onClick={() => setActiveFilterTab('overdue')}
              className={`pb-2 border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap ${
                activeFilterTab === 'overdue'
                  ? 'border-[#ff3b30] text-[#ff3b30] dark:border-[#ff453a] dark:text-[#ff453a]'
                  : 'border-transparent text-[#86868b] dark:text-[#a1a1a6] hover:text-[#1d1d1f] dark:hover:text-[#f5f5f7]'
              }`}
            >
              <span>Overdue</span>
              {overdueRevisions.length > 0 && (
                <span className="px-2 py-0.5 rounded-full text-xs bg-red-50 dark:bg-red-950/40 text-[#ff3b30] dark:text-[#ff453a] font-bold border border-red-200/80 dark:border-red-800/60">
                  {overdueRevisions.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveFilterTab('history')}
              className={`pb-2 border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap ${
                activeFilterTab === 'history'
                  ? 'border-[#0071e3] text-[#0071e3] dark:border-[#2997ff] dark:text-[#2997ff]'
                  : 'border-transparent text-[#86868b] dark:text-[#a1a1a6] hover:text-[#1d1d1f] dark:hover:text-[#f5f5f7]'
              }`}
            >
              <span>Completed History</span>
              <span className="px-2 py-0.5 rounded-full text-xs bg-[#f5f5f7] dark:bg-[#2c2c2e] text-[#1d1d1f] dark:text-[#f5f5f7] font-medium">
                {historyRevisions.length}
              </span>
            </button>
          </div>

          {activeFilterTab === 'today' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {todayCombined.length > 0 ? (
                todayCombined.map((rev) => {
                  const sub = subjects.find((s) => s.id === rev.subjectId);
                  const chap = chapters.find((c) => c.id === rev.chapterId);
                  const isOverdue = rev.status === 'overdue';

                  return (
                    <div
                      key={rev.id}
                      className={`rounded-2xl p-5 border shadow-2xs flex flex-col justify-between transition-all ${
                        isOverdue
                          ? 'bg-red-50/40 dark:bg-red-950/20 border-red-200/80 dark:border-red-800/50'
                          : 'bg-white dark:bg-[#161617] border-[#e5e5ea] dark:border-[#333336] hover:border-[#86868b]/40'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <div className="flex items-center gap-2">
                            <span
                              className="text-xs font-bold px-2.5 py-0.5 rounded-full text-white"
                              style={{ backgroundColor: sub?.color || '#0071e3' }}
                            >
                              {sub?.code || sub?.name}
                            </span>
                            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-red-50 dark:bg-red-950/40 text-[#ff3b30] dark:text-[#ff453a] border border-red-200/80 dark:border-red-800/60">
                              Rev {rev.revisionNumber}
                            </span>
                          </div>
                          <RevisionStatusBadge status={rev.status} />
                        </div>

                        <h3 className="text-base font-bold text-[#1d1d1f] dark:text-[#f5f5f7]">{chap?.name}</h3>
                        <p className="text-xs text-[#86868b] dark:text-[#a1a1a6] mt-1">Due: {formatDateDisplay(rev.dueDate)}</p>
                      </div>

                      <div className="flex items-center justify-between gap-2 mt-4 pt-3 border-t border-[#e5e5ea] dark:border-[#333336]">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleOpenReschedule(rev)}
                            className="text-xs text-[#86868b] dark:text-[#a1a1a6] hover:text-[#1d1d1f] dark:hover:text-[#f5f5f7] font-semibold px-2.5 py-1 rounded-full hover:bg-[#f5f5f7] dark:hover:bg-[#2c2c2e] transition-colors"
                          >
                            Reschedule
                          </button>
                          <button
                            onClick={() => skipRevision(rev.id)}
                            className="text-xs text-[#86868b] dark:text-[#a1a1a6] hover:text-[#1d1d1f] dark:hover:text-[#f5f5f7] font-medium px-2.5 py-1 rounded-full hover:bg-[#f5f5f7] dark:hover:bg-[#2c2c2e] transition-colors"
                          >
                            Skip
                          </button>
                        </div>

                        <button
                          onClick={() => completeRevision(rev.id)}
                          className="flex items-center gap-1 px-4 py-1.5 bg-[#ff3b30] hover:bg-red-600 text-white text-xs font-semibold rounded-full transition-colors shadow-xs"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Mark Done</span>
                        </button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="col-span-2 py-10 text-center bg-white dark:bg-[#161617] rounded-2xl border border-[#e5e5ea] dark:border-[#333336] text-[#86868b] dark:text-[#a1a1a6] text-xs">
                  No revisions due today! Keep up the momentum.
                </div>
              )}
            </div>
          )}

          {activeFilterTab === 'upcoming' && (
            <div className="space-y-2">
              {upcomingRevisions.length > 0 ? (
                upcomingRevisions.map((rev) => {
                  const sub = subjects.find((s) => s.id === rev.subjectId);
                  const chap = chapters.find((c) => c.id === rev.chapterId);
                  return (
                    <div
                      key={rev.id}
                      className="bg-white dark:bg-[#161617] rounded-2xl border border-[#e5e5ea] dark:border-[#333336] p-4 flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className="font-bold px-2 py-0.5 rounded-full text-white text-[11px]"
                          style={{ backgroundColor: sub?.color || '#0071e3' }}
                        >
                          {sub?.code || sub?.name}
                        </span>
                        <div>
                          <span className="font-bold text-[#1d1d1f] dark:text-[#f5f5f7]">{chap?.name}</span>
                          <span className="ml-2 text-[#ff3b30] dark:text-[#ff453a] font-semibold">Rev {rev.revisionNumber}</span>
                          <span className="ml-2 text-[#86868b] dark:text-[#a1a1a6] font-medium">Due {formatDateDisplay(rev.dueDate)}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleOpenReschedule(rev)}
                          className="px-3 py-1 text-[#86868b] dark:text-[#a1a1a6] hover:text-[#1d1d1f] dark:hover:text-[#f5f5f7] hover:bg-[#f5f5f7] dark:hover:bg-[#2c2c2e] rounded-full font-semibold transition-colors"
                        >
                          Reschedule
                        </button>
                        <button
                          onClick={() => completeRevision(rev.id)}
                          className="px-3.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-full transition-colors"
                        >
                          Done
                        </button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="py-8 text-center bg-white dark:bg-[#161617] rounded-2xl border border-[#e5e5ea] dark:border-[#333336] text-[#86868b] dark:text-[#a1a1a6] text-xs">
                  No upcoming revisions found.
                </div>
              )}
            </div>
          )}

          {activeFilterTab === 'overdue' && (
            <div className="space-y-2">
              {overdueRevisions.length > 0 ? (
                overdueRevisions.map((rev) => {
                  const sub = subjects.find((s) => s.id === rev.subjectId);
                  const chap = chapters.find((c) => c.id === rev.chapterId);
                  return (
                    <div
                      key={rev.id}
                      className="bg-red-50/40 dark:bg-red-950/20 rounded-2xl border border-red-200/80 dark:border-red-800/60 p-4 flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className="font-bold px-2.5 py-0.5 rounded-full text-white text-[11px]"
                          style={{ backgroundColor: sub?.color || '#ff3b30' }}
                        >
                          {sub?.code || sub?.name}
                        </span>
                        <div>
                          <span className="font-bold text-[#1d1d1f] dark:text-[#f5f5f7]">{chap?.name}</span>
                          <span className="ml-2 text-[#ff3b30] dark:text-[#ff453a] font-semibold">Rev {rev.revisionNumber}</span>
                          <span className="ml-2 text-[#86868b] dark:text-[#a1a1a6] font-medium">Overdue since {formatDateDisplay(rev.dueDate)}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleOpenReschedule(rev)}
                          className="px-3 py-1 bg-white dark:bg-[#2c2c2e] border border-[#e5e5ea] dark:border-[#3a3a3c] text-[#1d1d1f] dark:text-[#f5f5f7] hover:bg-[#f5f5f7] dark:hover:bg-[#3a3a3c] rounded-full font-semibold transition-colors"
                        >
                          Reschedule
                        </button>
                        <button
                          onClick={() => completeRevision(rev.id)}
                          className="px-3.5 py-1 bg-[#ff3b30] hover:bg-red-600 text-white font-semibold rounded-full transition-colors"
                        >
                          Done
                        </button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="py-8 text-center bg-white dark:bg-[#161617] rounded-2xl border border-[#e5e5ea] dark:border-[#333336] text-[#86868b] dark:text-[#a1a1a6] text-xs">
                  Zero overdue revisions. Fantastic work!
                </div>
              )}
            </div>
          )}

          {activeFilterTab === 'history' && (
            <div className="space-y-2">
              {historyRevisions.length > 0 ? (
                historyRevisions.map((rev) => {
                  const sub = subjects.find((s) => s.id === rev.subjectId);
                  const chap = chapters.find((c) => c.id === rev.chapterId);
                  return (
                    <div
                      key={rev.id}
                      className="bg-white dark:bg-[#161617] rounded-2xl border border-[#e5e5ea] dark:border-[#333336] p-4 flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        <div>
                          <span className="font-bold text-[#1d1d1f] dark:text-[#f5f5f7]">{chap?.name}</span>
                          <span className="ml-2 text-[#86868b] dark:text-[#a1a1a6] font-medium">
                            {sub?.code} • Rev {rev.revisionNumber}
                          </span>
                          <span className="ml-2 text-[#86868b] dark:text-[#a1a1a6]">
                            Completed on {formatDateDisplay(rev.completedDate || rev.dueDate)}
                          </span>
                        </div>
                      </div>
                      <RevisionStatusBadge status={rev.status} />
                    </div>
                  );
                })
              ) : (
                <div className="py-8 text-center bg-white dark:bg-[#161617] rounded-2xl border border-[#e5e5ea] dark:border-[#333336] text-[#86868b] dark:text-[#a1a1a6] text-xs">
                  No past revisions logged yet.
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ===================== ADD / EDIT REVISION MODAL ===================== */}
      <Modal
        isOpen={isRevisionModalOpen}
        onClose={() => setIsRevisionModalOpen(false)}
        title={editingRevId ? 'Edit Revision Schedule' : 'Schedule Revision Topic'}
        subtitle="Manually add a revision task to your queue"
      >
        <form onSubmit={handleSaveRevision} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] mb-1">
              Subject *
            </label>
            <select
              value={formSubjectId}
              onChange={(e) => {
                setFormSubjectId(e.target.value);
                const firstChap = chapters.find((c) => c.subjectId === e.target.value);
                setFormChapterId(firstChap ? firstChap.id : '');
              }}
              className="w-full bg-[#f5f5f7] dark:bg-[#2c2c2e] border border-[#e5e5ea] dark:border-[#3a3a3c] text-[#1d1d1f] dark:text-[#f5f5f7] rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-[#0071e3] focus:outline-none"
              required
            >
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.code})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] mb-1">
              Chapter / Topic *
            </label>
            <select
              value={formChapterId}
              onChange={(e) => setFormChapterId(e.target.value)}
              className="w-full bg-[#f5f5f7] dark:bg-[#2c2c2e] border border-[#e5e5ea] dark:border-[#3a3a3c] text-[#1d1d1f] dark:text-[#f5f5f7] rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-[#0071e3] focus:outline-none"
              required
            >
              {formChapters.length > 0 ? (
                formChapters.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} (Priority {c.priority})
                  </option>
                ))
              ) : (
                <option value="">No chapters available for this subject</option>
              )}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] mb-1">
                Revision Number
              </label>
              <select
                value={formRevNumber}
                onChange={(e) => setFormRevNumber(Number(e.target.value))}
                className="w-full bg-[#f5f5f7] dark:bg-[#2c2c2e] border border-[#e5e5ea] dark:border-[#3a3a3c] text-[#1d1d1f] dark:text-[#f5f5f7] rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-[#0071e3] focus:outline-none"
              >
                <option value={1}>Revision 1 (Rev 1)</option>
                <option value={2}>Revision 2 (Rev 2)</option>
                <option value={3}>Revision 3 (Rev 3)</option>
                <option value={4}>Revision 4 (Rev 4)</option>
                <option value={5}>Revision 5 (Rev 5)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] mb-1">
                Target Due Date
              </label>
              <input
                type="date"
                value={formDueDate}
                onChange={(e) => setFormDueDate(e.target.value)}
                className="w-full bg-[#f5f5f7] dark:bg-[#2c2c2e] border border-[#e5e5ea] dark:border-[#3a3a3c] text-[#1d1d1f] dark:text-[#f5f5f7] rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-[#0071e3] focus:outline-none"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] mb-1">
                Priority in Queue (1-20)
              </label>
              <input
                type="number"
                min="1"
                max="20"
                value={formPriority}
                onChange={(e) => setFormPriority(Number(e.target.value))}
                className="w-full bg-[#f5f5f7] dark:bg-[#2c2c2e] border border-[#e5e5ea] dark:border-[#3a3a3c] text-[#1d1d1f] dark:text-[#f5f5f7] rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-[#0071e3] focus:outline-none"
                required
              />
              <span className="text-[10px] text-[#86868b] dark:text-[#a1a1a6]">Higher number = top priority</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] mb-1">
                Initial Progress (%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={formProgress}
                onChange={(e) => setFormProgress(Number(e.target.value))}
                className="w-full bg-[#f5f5f7] dark:bg-[#2c2c2e] border border-[#e5e5ea] dark:border-[#3a3a3c] text-[#1d1d1f] dark:text-[#f5f5f7] rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-[#0071e3] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] mb-1">
              Revision Notes / Formulas to Check
            </label>
            <textarea
              value={formNotes}
              onChange={(e) => setFormNotes(e.target.value)}
              rows={2}
              placeholder="e.g. Focus on cycle stealing, serializability theorems, edge cases"
              className="w-full bg-[#f5f5f7] dark:bg-[#2c2c2e] border border-[#e5e5ea] dark:border-[#3a3a3c] text-[#1d1d1f] dark:text-[#f5f5f7] rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-[#0071e3] focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-[#e5e5ea] dark:border-[#333336]">
            <button
              type="button"
              onClick={() => setIsRevisionModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-[#86868b] dark:text-[#a1a1a6] hover:bg-[#f5f5f7] dark:hover:bg-[#2c2c2e] rounded-full"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white dark:text-black bg-[#0071e3] hover:bg-[#0077ed] dark:bg-[#2997ff] dark:hover:bg-[#40a9ff] rounded-full shadow-xs"
            >
              {editingRevId ? 'Save Changes' : 'Add to Revision Queue'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Reschedule Date Modal */}
      <Modal
        isOpen={rescheduleRevId !== null}
        onClose={() => setRescheduleRevId(null)}
        title="Reschedule Revision"
        subtitle="Set a new due date for this revision task"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] mb-1">
              New Due Date
            </label>
            <input
              type="date"
              value={newDueDate}
              onChange={(e) => setNewDueDate(e.target.value)}
              className="w-full bg-[#f5f5f7] dark:bg-[#2c2c2e] border border-[#e5e5ea] dark:border-[#3a3a3c] text-[#1d1d1f] dark:text-[#f5f5f7] rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-[#0071e3] focus:outline-none"
              required
            />
          </div>
          <div className="flex justify-end gap-2 pt-2 border-t border-[#e5e5ea] dark:border-[#333336]">
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
              Update Due Date
            </button>
          </div>
        </div>
      </Modal>

      {/* Customize Revision Intervals Settings Modal */}
      <Modal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        title="Customize Default Intervals"
        subtitle="Adjust preset intervals for reference"
      >
        <form onSubmit={handleSaveSettings} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] mb-1">
              Revision 1 Interval (Days)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="1"
                max="60"
                value={tempRev1}
                onChange={(e) => setTempRev1(Number(e.target.value))}
                className="w-full bg-[#f5f5f7] dark:bg-[#2c2c2e] border border-[#e5e5ea] dark:border-[#3a3a3c] text-[#1d1d1f] dark:text-[#f5f5f7] rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-[#0071e3] focus:outline-none"
                required
              />
              <span className="text-xs font-medium text-[#86868b] dark:text-[#a1a1a6] shrink-0">days</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] mb-1">
              Revision 2 Interval (Days)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="1"
                max="90"
                value={tempRev2}
                onChange={(e) => setTempRev2(Number(e.target.value))}
                className="w-full bg-[#f5f5f7] dark:bg-[#2c2c2e] border border-[#e5e5ea] dark:border-[#3a3a3c] text-[#1d1d1f] dark:text-[#f5f5f7] rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-[#0071e3] focus:outline-none"
                required
              />
              <span className="text-xs font-medium text-[#86868b] dark:text-[#a1a1a6] shrink-0">days</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] mb-1">
              Revision 3 Interval (Days)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="1"
                max="180"
                value={tempRev3}
                onChange={(e) => setTempRev3(Number(e.target.value))}
                className="w-full bg-[#f5f5f7] dark:bg-[#2c2c2e] border border-[#e5e5ea] dark:border-[#3a3a3c] text-[#1d1d1f] dark:text-[#f5f5f7] rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-[#0071e3] focus:outline-none"
                required
              />
              <span className="text-xs font-medium text-[#86868b] dark:text-[#a1a1a6] shrink-0">days</span>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-[#e5e5ea] dark:border-[#333336]">
            <button
              type="button"
              onClick={() => setIsSettingsOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-[#86868b] dark:text-[#a1a1a6] hover:bg-[#f5f5f7] dark:hover:bg-[#2c2c2e] rounded-full"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white dark:text-black bg-[#0071e3] hover:bg-[#0077ed] dark:bg-[#2997ff] dark:hover:bg-[#40a9ff] rounded-full shadow-xs"
            >
              Save Presets
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

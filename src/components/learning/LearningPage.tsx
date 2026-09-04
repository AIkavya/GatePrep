import React, { useState } from 'react';
import {
  Plus,
  ArrowUp,
  ArrowDown,
  CheckCircle2,
  Play,
  Trash2,
  Edit2,
  BookOpen,
  Filter,
  Check,
  RotateCcw,
} from 'lucide-react';
import { useGate } from '../../context/GateContext';
import { Chapter, ChapterStatus } from '../../types';
import { StatusBadge } from '../common/Badge';
import { Modal } from '../common/Modal';

export const LearningPage: React.FC = () => {
  const {
    subjects,
    chapters,
    selectedSubjectId,
    setSelectedSubjectId,
    addChapter,
    updateChapter,
    deleteChapter,
    startChapter,
    updateChapterProgress,
    completeChapter,
    adjustChapterPriority,
  } = useGate();

  const [activeTabStatus, setActiveTabStatus] = useState<'active' | 'completed'>('active');

  // Modal for Add/Edit Chapter
  const [isChapterModalOpen, setIsChapterModalOpen] = useState(false);
  const [editingChapterId, setEditingChapterId] = useState<string | null>(null);

  // Form states
  const [formSubjectId, setFormSubjectId] = useState<string>(
    selectedSubjectId !== 'all' ? selectedSubjectId : subjects[0]?.id || ''
  );
  const [formName, setFormName] = useState('');
  const [formPriority, setFormPriority] = useState(10);
  const [formProgress, setFormProgress] = useState(0);
  const [formStatus, setFormStatus] = useState<ChapterStatus>('not_started');
  const [formNotes, setFormNotes] = useState('');

  // Quick progress adjustment state
  const [inlineProgressId, setInlineProgressId] = useState<string | null>(null);
  const [inlineProgressValue, setInlineProgressValue] = useState<number>(0);

  // Filter chapters by selected subject
  const subjectFilteredChapters = chapters.filter((c) =>
    selectedSubjectId === 'all' ? true : c.subjectId === selectedSubjectId
  );

  // Separate into active vs completed
  const activeChapters = subjectFilteredChapters
    .filter((c) => c.status !== 'completed')
    .sort((a, b) => b.priority - a.priority);

  const completedChapters = subjectFilteredChapters
    .filter((c) => c.status === 'completed')
    .sort((a, b) => (b.completedAt || '').localeCompare(a.completedAt || ''));

  // CURRENT chapter is the top priority in active chapters
  const currentChapter = activeChapters[0] || null;
  const currentSubject = currentChapter
    ? subjects.find((s) => s.id === currentChapter.subjectId)
    : null;

  // UP NEXT chapters
  const upNextChapters = activeChapters.slice(1);

  const handleOpenAdd = () => {
    setEditingChapterId(null);
    setFormSubjectId(selectedSubjectId !== 'all' ? selectedSubjectId : subjects[0]?.id || '');
    setFormName('');
    setFormPriority(activeChapters.length > 0 ? Math.max(...activeChapters.map(c => c.priority)) + 1 : 10);
    setFormProgress(0);
    setFormStatus('not_started');
    setFormNotes('');
    setIsChapterModalOpen(true);
  };

  const handleOpenEdit = (chap: Chapter) => {
    setEditingChapterId(chap.id);
    setFormSubjectId(chap.subjectId);
    setFormName(chap.name);
    setFormPriority(chap.priority);
    setFormProgress(chap.progress);
    setFormStatus(chap.status);
    setFormNotes(chap.notes || '');
    setIsChapterModalOpen(true);
  };

  const handleSaveChapter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formSubjectId) return;

    if (editingChapterId) {
      updateChapter(editingChapterId, {
        subjectId: formSubjectId,
        name: formName.trim(),
        priority: Number(formPriority),
        progress: Number(formProgress),
        status: formStatus,
        notes: formNotes.trim(),
      });
    } else {
      addChapter({
        subjectId: formSubjectId,
        name: formName.trim(),
        priority: Number(formPriority),
        progress: Number(formProgress),
        status: formProgress > 0 ? 'in_progress' : formStatus,
        notes: formNotes.trim(),
      });
    }

    setIsChapterModalOpen(false);
  };

  const selectedSubjectObj = subjects.find((s) => s.id === selectedSubjectId);

  return (
    <div className="space-y-6 pb-12">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#161617] p-5 rounded-2xl border border-[#e5e5ea] dark:border-[#333336] shadow-2xs transition-colors">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-[#1d1d1f] dark:text-[#f5f5f7] tracking-tight">Active Learning Queue</h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full font-medium bg-blue-50 dark:bg-blue-950/40 text-[#0071e3] dark:text-[#2997ff] border border-blue-200/80 dark:border-blue-800/60">
              Priority Stack
            </span>
          </div>
          <p className="text-xs text-[#86868b] dark:text-[#a1a1a6] mt-1">
            Highest priority chapters remain at the top. Completed chapters automatically enter the Spaced Revision queue.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            id="btn-add-chapter"
            onClick={handleOpenAdd}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#0071e3] hover:bg-[#0077ed] dark:bg-[#2997ff] dark:hover:bg-[#40a9ff] text-white dark:text-black text-xs font-semibold rounded-full transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Add Chapter</span>
          </button>
        </div>
      </div>

      {/* Subject Filter Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
        <button
          onClick={() => setSelectedSubjectId('all')}
          className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors border ${
            selectedSubjectId === 'all'
              ? 'bg-[#1d1d1f] text-white border-[#1d1d1f] dark:bg-[#f5f5f7] dark:text-black dark:border-[#f5f5f7]'
              : 'bg-white dark:bg-[#161617] text-[#86868b] dark:text-[#a1a1a6] border-[#e5e5ea] dark:border-[#333336] hover:text-[#1d1d1f] dark:hover:text-[#f5f5f7]'
          }`}
        >
          All Subjects ({chapters.length})
        </button>
        {subjects.map((s) => {
          const count = chapters.filter((c) => c.subjectId === s.id).length;
          const isSelected = selectedSubjectId === s.id;
          return (
            <button
              key={s.id}
              onClick={() => setSelectedSubjectId(s.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors border ${
                isSelected
                  ? 'bg-[#0071e3] text-white border-[#0071e3] dark:bg-[#2997ff] dark:text-black dark:border-[#2997ff]'
                  : 'bg-white dark:bg-[#161617] text-[#86868b] dark:text-[#a1a1a6] border-[#e5e5ea] dark:border-[#333336] hover:text-[#1d1d1f] dark:hover:text-[#f5f5f7]'
              }`}
            >
              {s.code || s.name} ({count})
            </button>
          );
        })}
      </div>

      {/* Toggle between Active Study Stack and Completed History */}
      <div className="flex items-center gap-6 border-b border-[#e5e5ea] dark:border-[#333336]">
        <button
          onClick={() => setActiveTabStatus('active')}
          className={`pb-2.5 text-xs font-semibold border-b-2 transition-colors ${
            activeTabStatus === 'active'
              ? 'border-[#0071e3] text-[#0071e3] dark:border-[#2997ff] dark:text-[#2997ff]'
              : 'border-transparent text-[#86868b] dark:text-[#a1a1a6] hover:text-[#1d1d1f] dark:hover:text-[#f5f5f7]'
          }`}
        >
          Active Priority Queue ({activeChapters.length})
        </button>
        <button
          onClick={() => setActiveTabStatus('completed')}
          className={`pb-2.5 text-xs font-semibold border-b-2 transition-colors ${
            activeTabStatus === 'completed'
              ? 'border-[#0071e3] text-[#0071e3] dark:border-[#2997ff] dark:text-[#2997ff]'
              : 'border-transparent text-[#86868b] dark:text-[#a1a1a6] hover:text-[#1d1d1f] dark:hover:text-[#f5f5f7]'
          }`}
        >
          Completed History ({completedChapters.length})
        </button>
      </div>

      {activeTabStatus === 'active' ? (
        <div className="space-y-6">
          {/* CURRENT CHAPTER DISPLAY */}
          <div className="bg-white dark:bg-[#161617] rounded-2xl border-2 border-[#0071e3]/80 dark:border-[#2997ff]/80 p-5 sm:p-6 shadow-sm relative overflow-hidden transition-colors">
            <div className="absolute top-0 right-0 bg-[#0071e3] dark:bg-[#2997ff] text-white dark:text-black text-[11px] font-bold px-3 py-1 rounded-bl-xl uppercase tracking-wider">
              Top of Queue
            </div>

            <div className="text-xs font-bold text-[#0071e3] dark:text-[#2997ff] uppercase tracking-wider mb-2">
              CURRENT FOCUS
            </div>

            {currentChapter ? (
              <div>
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <span
                        className="text-xs font-bold px-2.5 py-0.5 rounded-full text-white"
                        style={{ backgroundColor: currentSubject?.color || '#0071e3' }}
                      >
                        {currentSubject?.code || currentSubject?.name}
                      </span>
                      <StatusBadge status={currentChapter.status} />
                      <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#f5f5f7] dark:bg-[#2c2c2e] text-[#1d1d1f] dark:text-[#f5f5f7] border border-[#e5e5ea] dark:border-[#3a3a3c]">
                        Priority {currentChapter.priority}
                      </span>
                    </div>

                    <h2 className="text-xl font-bold text-[#1d1d1f] dark:text-[#f5f5f7] leading-tight">
                      {currentChapter.name}
                    </h2>
                    {currentChapter.notes && (
                      <p className="text-xs text-[#86868b] dark:text-[#a1a1a6] mt-1.5 max-w-2xl bg-[#f5f5f7] dark:bg-[#1d1d1f] p-2.5 rounded-xl border border-[#e5e5ea] dark:border-[#333336]">
                        {currentChapter.notes}
                      </p>
                    )}
                  </div>

                  {/* Priority Adjusters for Current */}
                  <div className="flex items-center gap-1.5 self-start bg-[#f5f5f7] dark:bg-[#2c2c2e] p-1.5 rounded-xl border border-[#e5e5ea] dark:border-[#3a3a3c]">
                    <span className="text-[11px] font-semibold text-[#86868b] dark:text-[#a1a1a6] px-1">Priority:</span>
                    <button
                      onClick={() => adjustChapterPriority(currentChapter.id, -1)}
                      className="p-1 rounded hover:bg-[#e5e5ea] dark:hover:bg-[#3a3a3c] text-[#86868b] dark:text-[#a1a1a6]"
                      title="Decrease priority"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                    <span className="font-bold text-xs px-1 text-[#1d1d1f] dark:text-[#f5f5f7]">
                      {currentChapter.priority}
                    </span>
                    <button
                      onClick={() => adjustChapterPriority(currentChapter.id, 1)}
                      className="p-1 rounded hover:bg-[#e5e5ea] dark:hover:bg-[#3a3a3c] text-[#86868b] dark:text-[#a1a1a6]"
                      title="Increase priority"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Progress bar and control */}
                <div className="mt-5 bg-[#f5f5f7] dark:bg-[#1d1d1f] rounded-xl p-4 border border-[#e5e5ea] dark:border-[#333336]">
                  <div className="flex items-center justify-between text-xs font-bold text-[#1d1d1f] dark:text-[#f5f5f7] mb-2">
                    <span>Learning Progress</span>
                    <span>{currentChapter.progress}%</span>
                  </div>
                  <div className="w-full h-2.5 bg-[#e5e5ea] dark:bg-[#2c2c2e] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#0071e3] dark:bg-[#2997ff] rounded-full transition-all duration-300"
                      style={{ width: `${currentChapter.progress}%` }}
                    />
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3 mt-4">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {[0, 25, 50, 75, 90].map((val) => (
                        <button
                          key={val}
                          onClick={() => updateChapterProgress(currentChapter.id, val)}
                          className={`px-3 py-1 text-xs font-semibold rounded-full border transition-colors ${
                            currentChapter.progress === val
                              ? 'bg-[#0071e3] text-white border-[#0071e3] dark:bg-[#2997ff] dark:text-black dark:border-[#2997ff]'
                              : 'bg-white dark:bg-[#2c2c2e] text-[#1d1d1f] dark:text-[#f5f5f7] border-[#e5e5ea] dark:border-[#3a3a3c] hover:bg-[#f5f5f7] dark:hover:bg-[#3a3a3c]'
                          }`}
                        >
                          {val}%
                        </button>
                      ))}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleOpenEdit(currentChapter)}
                        className="px-3 py-1.5 text-[#86868b] dark:text-[#a1a1a6] hover:text-[#1d1d1f] dark:hover:text-[#f5f5f7] hover:bg-[#e5e5ea] dark:hover:bg-[#2c2c2e] rounded-full transition-colors text-xs flex items-center gap-1 font-medium"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>

                      <button
                        id="btn-complete-current-chap"
                        onClick={() => completeChapter(currentChapter.id)}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-full transition-colors flex items-center gap-1.5 shadow-xs"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Mark as Completed</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-8 text-center text-[#86868b] dark:text-[#a1a1a6] text-xs">
                No active chapters in this subject queue. Click &quot;Add Chapter&quot; above to begin.
              </div>
            )}
          </div>

          {/* UP NEXT QUEUE */}
          <div className="bg-white dark:bg-[#161617] rounded-2xl border border-[#e5e5ea] dark:border-[#333336] p-5 shadow-2xs transition-colors">
            <div className="flex items-center justify-between pb-3 border-b border-[#e5e5ea] dark:border-[#333336]">
              <h3 className="text-xs font-bold text-[#1d1d1f] dark:text-[#f5f5f7] uppercase tracking-wide">
                UP NEXT ({upNextChapters.length})
              </h3>
              <span className="text-xs text-[#86868b] dark:text-[#a1a1a6]">
                Sorted by priority (highest first)
              </span>
            </div>

            <div className="mt-3 divide-y divide-[#e5e5ea] dark:divide-[#333336]">
              {upNextChapters.length > 0 ? (
                upNextChapters.map((chap, index) => {
                  const sub = subjects.find((s) => s.id === chap.subjectId);

                  return (
                    <div
                      key={chap.id}
                      className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#f5f5f7]/60 dark:hover:bg-[#1d1d1f]/60 px-2 rounded-xl transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <span className="w-6 h-6 rounded-full bg-[#f5f5f7] dark:bg-[#2c2c2e] text-[#86868b] dark:text-[#a1a1a6] text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                          {index + 1}
                        </span>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span
                              className="text-[11px] font-bold px-2 py-0.5 rounded-full text-white"
                              style={{ backgroundColor: sub?.color || '#0071e3' }}
                            >
                              {sub?.code || sub?.name}
                            </span>
                            <h4 className="text-sm font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">{chap.name}</h4>
                            <StatusBadge status={chap.status} />
                          </div>
                          {chap.notes && (
                            <p className="text-xs text-[#86868b] dark:text-[#a1a1a6] mt-1 line-clamp-1">
                              {chap.notes}
                            </p>
                          )}
                          <div className="flex items-center gap-2 mt-1.5 text-xs text-[#86868b] dark:text-[#a1a1a6]">
                            <span>Progress: {chap.progress}%</span>
                            <div className="w-20 h-1.5 bg-[#e5e5ea] dark:bg-[#2c2c2e] rounded-full overflow-hidden">
                              <div
                                className="h-full bg-[#0071e3] dark:bg-[#2997ff] rounded-full"
                                style={{ width: `${chap.progress}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Controls: Priority, Start, Complete, Edit, Delete */}
                      <div className="flex items-center gap-2 self-end sm:self-center">
                        {/* Priority Box */}
                        <div className="flex items-center gap-1 bg-[#f5f5f7] dark:bg-[#2c2c2e] px-2.5 py-1 rounded-full text-xs">
                          <span className="text-[11px] text-[#86868b] dark:text-[#a1a1a6]">P:</span>
                          <span className="font-bold text-[#1d1d1f] dark:text-[#f5f5f7]">{chap.priority}</span>
                          <div className="flex flex-col ml-1">
                            <button
                              onClick={() => adjustChapterPriority(chap.id, 1)}
                              className="hover:text-[#0071e3] dark:hover:text-[#2997ff]"
                              title="Increase priority"
                            >
                              <ArrowUp className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => adjustChapterPriority(chap.id, -1)}
                              className="hover:text-[#0071e3] dark:hover:text-[#2997ff]"
                              title="Decrease priority"
                            >
                              <ArrowDown className="w-3 h-3" />
                            </button>
                          </div>
                        </div>

                        {chap.status === 'not_started' && (
                          <button
                            onClick={() => startChapter(chap.id)}
                            className="px-3 py-1 text-xs font-semibold rounded-full bg-blue-50 dark:bg-blue-950/40 text-[#0071e3] dark:text-[#2997ff] hover:bg-blue-100 dark:hover:bg-blue-900/40 border border-blue-200/80 dark:border-blue-800/60 transition-colors flex items-center gap-1"
                          >
                            <Play className="w-3 h-3" />
                            <span>Start</span>
                          </button>
                        )}

                        <button
                          onClick={() => completeChapter(chap.id)}
                          className="px-3 py-1 text-xs font-semibold rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 border border-emerald-200/80 dark:border-emerald-800/60 transition-colors flex items-center gap-1"
                          title="Mark Complete"
                        >
                          <Check className="w-3 h-3" />
                          <span>Complete</span>
                        </button>

                        <button
                          onClick={() => handleOpenEdit(chap)}
                          className="p-1.5 text-[#86868b] dark:text-[#a1a1a6] hover:text-[#1d1d1f] dark:hover:text-[#f5f5f7] hover:bg-[#e5e5ea] dark:hover:bg-[#2c2c2e] rounded-full transition-colors"
                          title="Edit Chapter"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => {
                            if (window.confirm(`Delete chapter "${chap.name}"?`)) {
                              deleteChapter(chap.id);
                            }
                          }}
                          className="p-1.5 text-[#86868b] dark:text-[#a1a1a6] hover:text-[#ff3b30] dark:hover:text-[#ff453a] hover:bg-red-50 dark:hover:bg-red-950/40 rounded-full transition-colors"
                          title="Delete Chapter"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="py-6 text-center text-[#86868b] dark:text-[#a1a1a6] text-xs">
                  No other active chapters remaining in the queue.
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* COMPLETED CHAPTERS HISTORY */
        <div className="bg-white dark:bg-[#161617] rounded-2xl border border-[#e5e5ea] dark:border-[#333336] p-5 shadow-2xs transition-colors">
          <div className="flex items-center justify-between pb-3 border-b border-[#e5e5ea] dark:border-[#333336] mb-3">
            <h3 className="text-xs font-bold text-[#1d1d1f] dark:text-[#f5f5f7] uppercase tracking-wide">
              Completed Chapters ({completedChapters.length})
            </h3>
            <span className="text-xs text-[#86868b] dark:text-[#a1a1a6]">
              All completed chapters are managed in the Revision spaced-repetition system
            </span>
          </div>

          <div className="divide-y divide-[#e5e5ea] dark:divide-[#333336]">
            {completedChapters.length > 0 ? (
              completedChapters.map((chap) => {
                const sub = subjects.find((s) => s.id === chap.subjectId);
                return (
                  <div
                    key={chap.id}
                    className="py-3 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      <div>
                        <div className="flex items-center gap-2">
                          <span
                            className="text-[11px] font-bold px-2 py-0.5 rounded-full text-white"
                            style={{ backgroundColor: sub?.color || '#0071e3' }}
                          >
                            {sub?.code || sub?.name}
                          </span>
                          <span className="font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">{chap.name}</span>
                        </div>
                        <p className="text-[11px] text-[#86868b] dark:text-[#a1a1a6] mt-0.5">
                          Completed on: {chap.completedAt || 'Recently'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          // Move back to in_progress
                          updateChapter(chap.id, { status: 'in_progress', progress: 80 });
                        }}
                        className="px-3 py-1 text-[#1d1d1f] dark:text-[#f5f5f7] hover:bg-[#f5f5f7] dark:hover:bg-[#2c2c2e] rounded-full border border-[#e5e5ea] dark:border-[#3a3a3c] text-[11px] flex items-center gap-1 transition-colors"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>Reopen</span>
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm(`Delete chapter "${chap.name}"?`)) {
                            deleteChapter(chap.id);
                          }
                        }}
                        className="p-1 text-[#86868b] hover:text-[#ff3b30] dark:hover:text-[#ff453a] rounded-full transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-8 text-center text-[#86868b] dark:text-[#a1a1a6] text-xs">
                No chapters marked completed yet. Complete a chapter above to initiate automated revisions!
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add / Edit Chapter Modal */}
      <Modal
        isOpen={isChapterModalOpen}
        onClose={() => setIsChapterModalOpen(false)}
        title={editingChapterId ? 'Edit Chapter' : 'Add Chapter to Queue'}
        subtitle="Chapters are prioritized and ordered dynamically in the study queue"
      >
        <form onSubmit={handleSaveChapter} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] mb-1">Subject</label>
            <select
              value={formSubjectId}
              onChange={(e) => setFormSubjectId(e.target.value)}
              className="w-full bg-[#f5f5f7] dark:bg-[#2c2c2e] border border-[#e5e5ea] dark:border-[#3a3a3c] text-[#1d1d1f] dark:text-[#f5f5f7] rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-[#0071e3] focus:outline-none"
              required
            >
              {subjects.map((sub) => (
                <option key={sub.id} value={sub.id}>
                  {sub.code ? `${sub.code} — ${sub.name}` : sub.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] mb-1">
              Chapter / Topic Name
            </label>
            <input
              type="text"
              placeholder="e.g. Transactions & Concurrency Control"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              className="w-full bg-[#f5f5f7] dark:bg-[#2c2c2e] border border-[#e5e5ea] dark:border-[#3a3a3c] text-[#1d1d1f] dark:text-[#f5f5f7] rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-[#0071e3] focus:outline-none"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] mb-1">
                Priority (1-20, higher = first)
              </label>
              <input
                type="number"
                min="1"
                max="20"
                value={formPriority}
                onChange={(e) => setFormPriority(Number(e.target.value))}
                className="w-full bg-[#f5f5f7] dark:bg-[#2c2c2e] border border-[#e5e5ea] dark:border-[#3a3a3c] text-[#1d1d1f] dark:text-[#f5f5f7] rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-[#0071e3] focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] mb-1">
                Progress ({formProgress}%)
              </label>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={formProgress}
                onChange={(e) => setFormProgress(Number(e.target.value))}
                className="w-full accent-[#0071e3] dark:accent-[#2997ff] mt-2"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] mb-1">Status</label>
            <select
              value={formStatus}
              onChange={(e) => setFormStatus(e.target.value as ChapterStatus)}
              className="w-full bg-[#f5f5f7] dark:bg-[#2c2c2e] border border-[#e5e5ea] dark:border-[#3a3a3c] text-[#1d1d1f] dark:text-[#f5f5f7] rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-[#0071e3] focus:outline-none"
            >
              <option value="not_started">Not Started</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed (Triggers Revision 1)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] mb-1">
              Study Notes / Key Highlights
            </label>
            <textarea
              rows={3}
              placeholder="Important theorems, recurring GATE questions, formulas..."
              value={formNotes}
              onChange={(e) => setFormNotes(e.target.value)}
              className="w-full bg-[#f5f5f7] dark:bg-[#2c2c2e] border border-[#e5e5ea] dark:border-[#3a3a3c] text-[#1d1d1f] dark:text-[#f5f5f7] rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-[#0071e3] focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-[#e5e5ea] dark:border-[#333336]">
            <button
              type="button"
              onClick={() => setIsChapterModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-[#86868b] dark:text-[#a1a1a6] hover:bg-[#f5f5f7] dark:hover:bg-[#2c2c2e] rounded-full transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white dark:text-black bg-[#0071e3] hover:bg-[#0077ed] dark:bg-[#2997ff] dark:hover:bg-[#40a9ff] rounded-full shadow-xs transition-colors"
            >
              {editingChapterId ? 'Save Changes' : 'Add to Queue'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

import React, { useState } from 'react';
import {
  Plus,
  ArrowUp,
  ArrowDown,
  CheckCircle2,
  Play,
  Trash2,
  Edit2,
  FileQuestion,
  Check,
  RotateCcw,
  Target,
} from 'lucide-react';
import { useGate } from '../../context/GateContext';
import { PyqQueueItem, PyqQueueStatus } from '../../types';
import { StatusBadge } from '../common/Badge';
import { Modal } from '../common/Modal';

export const PyqQueueView: React.FC = () => {
  const {
    subjects,
    chapters,
    pyqQueue,
    selectedSubjectId,
    addPyqQueueItem,
    updatePyqQueueItem,
    deletePyqQueueItem,
    startPyqQueueItem,
    completePyqQueueItem,
    adjustPyqQueuePriority,
    updatePyqQueueProgress,
  } = useGate();

  const [activeTabStatus, setActiveTabStatus] = useState<'active' | 'completed'>('active');

  // Modal state for Add/Edit PYQ practice goal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);

  // Form states
  const [formSubjectId, setFormSubjectId] = useState<string>(
    selectedSubjectId !== 'all' ? selectedSubjectId : subjects[0]?.id || ''
  );
  const [formChapterId, setFormChapterId] = useState<string>('');
  const [formPriority, setFormPriority] = useState<number>(10);
  const [formTargetQuestions, setFormTargetQuestions] = useState<number>(20);
  const [formSolvedQuestions, setFormSolvedQuestions] = useState<number>(0);
  const [formNotes, setFormNotes] = useState<string>('');

  // Inline progress adjustment
  const [inlineItemId, setInlineItemId] = useState<string | null>(null);
  const [inlineSolvedCount, setInlineSolvedCount] = useState<number>(0);

  // Filter by selected subject
  const subjectFilteredItems = pyqQueue.filter((item) =>
    selectedSubjectId === 'all' ? true : item.subjectId === selectedSubjectId
  );

  // Separate active vs completed
  const activeItems = subjectFilteredItems
    .filter((item) => item.status !== 'completed')
    .sort((a, b) => (b.priority || 10) - (a.priority || 10));

  const completedItems = subjectFilteredItems
    .filter((item) => item.status === 'completed')
    .sort((a, b) => (b.completedAt || '').localeCompare(a.completedAt || ''));

  // CURRENT Top Priority Item in Queue
  const currentItem = activeItems[0] || null;
  const currentSubject = currentItem ? subjects.find((s) => s.id === currentItem.subjectId) : null;
  const currentChapter = currentItem ? chapters.find((c) => c.id === currentItem.chapterId) : null;

  // UP NEXT in queue
  const upNextItems = activeItems.slice(1);

  // Available chapters for the selected subject in form
  const formChapters = chapters.filter((c) => c.subjectId === formSubjectId);

  const handleOpenAdd = () => {
    setEditingItemId(null);
    const subId = selectedSubjectId !== 'all' ? selectedSubjectId : subjects[0]?.id || '';
    setFormSubjectId(subId);
    const availableChaps = chapters.filter((c) => c.subjectId === subId);
    setFormChapterId(availableChaps[0]?.id || '');
    setFormPriority(activeItems.length > 0 ? Math.max(...activeItems.map((i) => i.priority || 10)) + 1 : 10);
    setFormTargetQuestions(20);
    setFormSolvedQuestions(0);
    setFormNotes('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: PyqQueueItem) => {
    setEditingItemId(item.id);
    setFormSubjectId(item.subjectId);
    setFormChapterId(item.chapterId);
    setFormPriority(item.priority || 10);
    setFormTargetQuestions(item.targetQuestions || 20);
    setFormSolvedQuestions(item.solvedQuestions || 0);
    setFormNotes(item.notes || '');
    setIsModalOpen(true);
  };

  const handleSaveItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formSubjectId || !formChapterId) return;

    const target = Math.max(1, Number(formTargetQuestions) || 20);
    const solved = Math.min(target, Math.max(0, Number(formSolvedQuestions) || 0));
    const progress = Math.round((solved / target) * 100);

    if (editingItemId) {
      updatePyqQueueItem(editingItemId, {
        subjectId: formSubjectId,
        chapterId: formChapterId,
        priority: Number(formPriority),
        targetQuestions: target,
        solvedQuestions: solved,
        progress,
        status: progress === 100 ? 'completed' : progress > 0 ? 'in_progress' : 'not_started',
        notes: formNotes.trim(),
      });
    } else {
      addPyqQueueItem({
        subjectId: formSubjectId,
        chapterId: formChapterId,
        priority: Number(formPriority),
        targetQuestions: target,
        solvedQuestions: solved,
        progress,
        status: progress === 100 ? 'completed' : progress > 0 ? 'in_progress' : 'not_started',
        notes: formNotes.trim(),
      });
    }

    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner and Quick Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#161617] p-5 rounded-2xl border border-[#e5e5ea] dark:border-[#333336] shadow-2xs transition-colors">
        <div>
          <h2 className="text-sm font-bold text-[#1d1d1f] dark:text-[#f5f5f7] tracking-tight flex items-center gap-2">
            <Target className="w-4 h-4 text-[#af52de]" />
            <span>PYQ Practice Stack</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full font-medium bg-purple-50 dark:bg-purple-950/40 text-[#af52de] border border-purple-200/80 dark:border-purple-800/60">
              {activeItems.length} Active Targets
            </span>
          </h2>
          <p className="text-xs text-[#86868b] dark:text-[#a1a1a6] mt-1">
            Organize chapter-wise PYQ solving goals with targeted question counts and priority queues.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-1.5 px-4 py-2 bg-[#0071e3] hover:bg-[#0077ed] dark:bg-[#2997ff] dark:hover:bg-[#40a9ff] text-white dark:text-black text-xs font-semibold rounded-full transition-colors shadow-xs self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Practice Target</span>
        </button>
      </div>

      {/* Tabs: Active Queue vs Completed */}
      <div className="flex items-center gap-2 border-b border-[#e5e5ea] dark:border-[#333336] text-xs sm:text-sm font-semibold">
        <button
          onClick={() => setActiveTabStatus('active')}
          className={`pb-2.5 border-b-2 flex items-center gap-2 transition-colors ${
            activeTabStatus === 'active'
              ? 'border-[#0071e3] dark:border-[#2997ff] text-[#0071e3] dark:text-[#2997ff]'
              : 'border-transparent text-[#86868b] dark:text-[#a1a1a6] hover:text-[#1d1d1f] dark:hover:text-[#f5f5f7]'
          }`}
        >
          <span>Priority Queue</span>
          <span className="px-2 py-0.5 rounded-full text-xs bg-blue-100 dark:bg-blue-950/50 text-[#0071e3] dark:text-[#2997ff]">
            {activeItems.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTabStatus('completed')}
          className={`pb-2.5 border-b-2 flex items-center gap-2 transition-colors ${
            activeTabStatus === 'completed'
              ? 'border-[#0071e3] dark:border-[#2997ff] text-[#0071e3] dark:text-[#2997ff]'
              : 'border-transparent text-[#86868b] dark:text-[#a1a1a6] hover:text-[#1d1d1f] dark:hover:text-[#f5f5f7]'
          }`}
        >
          <span>Completed Goals</span>
          <span className="px-2 py-0.5 rounded-full text-xs bg-[#f5f5f7] dark:bg-[#2c2c2e] text-[#86868b] dark:text-[#a1a1a6]">
            {completedItems.length}
          </span>
        </button>
      </div>

      {/* Active Tab View */}
      {activeTabStatus === 'active' ? (
        <div className="space-y-6">
          {/* CURRENT TOP TARGET HERO CARD */}
          {currentItem ? (
            <div className="bg-white dark:bg-[#161617] rounded-2xl border border-[#e5e5ea] dark:border-[#333336] p-5 sm:p-6 shadow-2xs relative overflow-hidden transition-colors">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-[#0071e3] dark:bg-[#2997ff] text-white dark:text-black">
                    CURRENT PRACTICE FOCUS
                  </span>
                  <span
                    className="text-xs font-bold px-2.5 py-0.5 rounded-full text-white"
                    style={{ backgroundColor: currentSubject?.color || '#0071e3' }}
                  >
                    {currentSubject?.code || currentSubject?.name}
                  </span>
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#f5f5f7] dark:bg-[#2c2c2e] text-[#1d1d1f] dark:text-[#f5f5f7]">
                    Priority: {currentItem.priority}
                  </span>
                </div>

                <StatusBadge status={currentItem.status} />
              </div>

              <div className="mb-4">
                <h3 className="text-xl sm:text-2xl font-bold text-[#1d1d1f] dark:text-[#f5f5f7] mb-1">
                  {currentChapter?.name || 'Unknown Chapter'}
                </h3>
                {currentItem.notes ? (
                  <p className="text-xs text-[#86868b] dark:text-[#a1a1a6] max-w-2xl">{currentItem.notes}</p>
                ) : (
                  <p className="text-xs text-[#86868b] dark:text-[#a1a1a6] italic">Target: Solve standard GATE questions for this topic.</p>
                )}
              </div>

              {/* Progress & Quick Solver Actions */}
              <div className="bg-[#f5f5f7] dark:bg-[#1d1d1f] p-4 rounded-xl border border-[#e5e5ea] dark:border-[#333336] space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-[#86868b] dark:text-[#a1a1a6]">Solved Questions:</span>
                    <span className="font-bold text-[#0071e3] dark:text-[#2997ff] text-sm">
                      {currentItem.solvedQuestions} / {currentItem.targetQuestions}
                    </span>
                  </div>
                  <span className="font-bold text-[#1d1d1f] dark:text-[#f5f5f7] text-sm">{currentItem.progress}%</span>
                </div>

                <div className="w-full bg-[#e5e5ea] dark:bg-[#2c2c2e] h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-[#0071e3] dark:bg-[#2997ff] h-full rounded-full transition-all duration-300"
                    style={{ width: `${currentItem.progress}%` }}
                  />
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => {
                        const newSolved = Math.min(currentItem.targetQuestions, currentItem.solvedQuestions + 1);
                        const newProg = Math.round((newSolved / currentItem.targetQuestions) * 100);
                        updatePyqQueueProgress(currentItem.id, newProg, newSolved);
                      }}
                      className="px-3 py-1 text-xs font-semibold bg-white dark:bg-[#2c2c2e] border border-[#e5e5ea] dark:border-[#3a3a3c] text-[#0071e3] dark:text-[#2997ff] hover:opacity-80 rounded-full transition-colors"
                    >
                      +1 Solved
                    </button>
                    <button
                      onClick={() => {
                        const newSolved = Math.min(currentItem.targetQuestions, currentItem.solvedQuestions + 5);
                        const newProg = Math.round((newSolved / currentItem.targetQuestions) * 100);
                        updatePyqQueueProgress(currentItem.id, newProg, newSolved);
                      }}
                      className="px-3 py-1 text-xs font-semibold bg-white dark:bg-[#2c2c2e] border border-[#e5e5ea] dark:border-[#3a3a3c] text-[#0071e3] dark:text-[#2997ff] hover:opacity-80 rounded-full transition-colors"
                    >
                      +5 Solved
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    {currentItem.status === 'not_started' && (
                      <button
                        onClick={() => startPyqQueueItem(currentItem.id)}
                        className="flex items-center gap-1 px-3.5 py-1.5 bg-[#0071e3] dark:bg-[#2997ff] text-white dark:text-black text-xs font-semibold rounded-full hover:opacity-90 transition-colors"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Start Session</span>
                      </button>
                    )}

                    <button
                      onClick={() => handleOpenEdit(currentItem)}
                      className="p-1.5 text-[#86868b] dark:text-[#a1a1a6] hover:text-[#1d1d1f] dark:hover:text-[#f5f5f7] hover:bg-[#e5e5ea] dark:hover:bg-[#2c2c2e] rounded-full transition-colors"
                      title="Edit Goal"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => completePyqQueueItem(currentItem.id)}
                      className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-full transition-colors shadow-xs"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Target Completed</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-[#161617] rounded-2xl border border-dashed border-[#e5e5ea] dark:border-[#333336] p-8 text-center transition-colors">
              <FileQuestion className="w-10 h-10 text-[#86868b] mx-auto mb-2" />
              <h3 className="text-base font-bold text-[#1d1d1f] dark:text-[#f5f5f7]">No active PYQ practice targets</h3>
              <p className="text-xs text-[#86868b] dark:text-[#a1a1a6] mt-1 max-w-md mx-auto">
                Add a target to set a question goal for any chapter and track your practice progress.
              </p>
              <button
                onClick={handleOpenAdd}
                className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-[#0071e3] hover:bg-[#0077ed] dark:bg-[#2997ff] dark:hover:bg-[#40a9ff] text-white dark:text-black text-xs font-semibold rounded-full transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Create Practice Target</span>
              </button>
            </div>
          )}

          {/* UP NEXT LIST */}
          {upNextItems.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-[#1d1d1f] dark:text-[#f5f5f7] uppercase tracking-wider flex items-center gap-2">
                  <span>Up Next in Queue</span>
                  <span className="text-xs text-[#86868b] dark:text-[#a1a1a6] font-normal">
                    ({upNextItems.length} queued practice sessions)
                  </span>
                </h4>
              </div>

              <div className="space-y-2.5">
                {upNextItems.map((item) => {
                  const sub = subjects.find((s) => s.id === item.subjectId);
                  const chap = chapters.find((c) => c.id === item.chapterId);
                  const isInline = inlineItemId === item.id;

                  return (
                    <div
                      key={item.id}
                      className="bg-white dark:bg-[#161617] rounded-2xl border border-[#e5e5ea] dark:border-[#333336] p-4 shadow-2xs hover:border-[#86868b]/40 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                    >
                      <div className="flex items-start sm:items-center gap-3">
                        {/* Priority adjust arrows */}
                        <div className="flex flex-col items-center justify-center p-1 bg-[#f5f5f7] dark:bg-[#2c2c2e] rounded-xl border border-[#e5e5ea] dark:border-[#3a3a3c]">
                          <button
                            onClick={() => adjustPyqQueuePriority(item.id, 1)}
                            className="p-1 text-[#86868b] hover:text-[#1d1d1f] dark:hover:text-[#f5f5f7]"
                            title="Increase Priority"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <span className="text-xs font-bold text-[#1d1d1f] dark:text-[#f5f5f7] px-1">
                            {item.priority}
                          </span>
                          <button
                            onClick={() => adjustPyqQueuePriority(item.id, -1)}
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
                              style={{ backgroundColor: sub?.color || '#0071e3' }}
                            >
                              {sub?.code || sub?.name}
                            </span>
                            <h5 className="text-sm font-bold text-[#1d1d1f] dark:text-[#f5f5f7]">{chap?.name}</h5>
                            <StatusBadge status={item.status} />
                          </div>

                          <div className="flex flex-wrap items-center gap-3 text-xs text-[#86868b] dark:text-[#a1a1a6]">
                            <span>
                              Target: {item.solvedQuestions}/{item.targetQuestions} solved
                            </span>
                            <span>•</span>
                            <span>Progress: {item.progress}%</span>
                            {item.notes && (
                              <>
                                <span>•</span>
                                <span className="italic max-w-xs truncate">{item.notes}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right controls */}
                      <div className="flex items-center gap-2 self-end md:self-center">
                        {isInline ? (
                          <div className="flex items-center gap-1.5 bg-[#f5f5f7] dark:bg-[#2c2c2e] p-1.5 rounded-xl border border-[#e5e5ea] dark:border-[#3a3a3c]">
                            <input
                              type="number"
                              min="0"
                              max={item.targetQuestions}
                              value={inlineSolvedCount}
                              onChange={(e) => setInlineSolvedCount(Number(e.target.value))}
                              className="w-14 px-2 py-0.5 text-xs bg-white dark:bg-[#1d1d1f] border border-[#e5e5ea] dark:border-[#3a3a3c] rounded-lg text-[#1d1d1f] dark:text-[#f5f5f7]"
                            />
                            <span className="text-xs text-[#86868b] dark:text-[#a1a1a6]">/ {item.targetQuestions}</span>
                            <button
                              onClick={() => {
                                const newProg = Math.round((inlineSolvedCount / item.targetQuestions) * 100);
                                updatePyqQueueProgress(item.id, newProg, inlineSolvedCount);
                                setInlineItemId(null);
                              }}
                              className="p-1 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded-full"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              setInlineItemId(item.id);
                              setInlineSolvedCount(item.solvedQuestions);
                            }}
                            className="px-3 py-1.5 text-xs font-semibold bg-[#f5f5f7] dark:bg-[#2c2c2e] hover:bg-[#e5e5ea] dark:hover:bg-[#3a3a3c] text-[#1d1d1f] dark:text-[#f5f5f7] rounded-full transition-colors"
                          >
                            Update Solved
                          </button>
                        )}

                        {item.status === 'not_started' && (
                          <button
                            onClick={() => startPyqQueueItem(item.id)}
                            className="p-2 text-[#0071e3] dark:text-[#2997ff] hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded-full transition-colors"
                            title="Start Practice"
                          >
                            <Play className="w-4 h-4 fill-current" />
                          </button>
                        )}

                        <button
                          onClick={() => completePyqQueueItem(item.id)}
                          className="flex items-center gap-1 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 text-xs font-bold rounded-full border border-emerald-200/80 dark:border-emerald-800/60 transition-colors"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Done</span>
                        </button>

                        <button
                          onClick={() => handleOpenEdit(item)}
                          className="p-1.5 text-[#86868b] dark:text-[#a1a1a6] hover:text-[#1d1d1f] dark:hover:text-[#f5f5f7] hover:bg-[#e5e5ea] dark:hover:bg-[#2c2c2e] rounded-full transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => {
                            if (window.confirm('Delete this PYQ practice target?')) {
                              deletePyqQueueItem(item.id);
                            }
                          }}
                          className="p-1.5 text-[#86868b] dark:text-[#a1a1a6] hover:text-[#ff3b30] dark:hover:text-[#ff453a] hover:bg-red-50 dark:hover:bg-red-950/40 rounded-full transition-colors"
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
      ) : (
        /* Completed History */
        <div className="space-y-2.5">
          {completedItems.length > 0 ? (
            completedItems.map((item) => {
              const sub = subjects.find((s) => s.id === item.subjectId);
              const chap = chapters.find((c) => c.id === item.chapterId);
              return (
                <div
                  key={item.id}
                  className="bg-white dark:bg-[#161617] rounded-2xl border border-[#e5e5ea] dark:border-[#333336] p-4 flex items-center justify-between gap-3 text-xs transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <div>
                      <span className="font-bold text-[#1d1d1f] dark:text-[#f5f5f7]">{chap?.name}</span>
                      <span className="ml-2 text-[#86868b] dark:text-[#a1a1a6] font-medium">
                        {sub?.code} • {item.solvedQuestions}/{item.targetQuestions} PYQs Solved
                      </span>
                      {item.completedAt && (
                        <span className="ml-2 text-[#86868b] dark:text-[#a1a1a6]">Completed on {item.completedAt}</span>
                      )}
                    </div>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200/80 dark:border-emerald-800/60">
                    100% Solved
                  </span>
                </div>
              );
            })
          ) : (
            <div className="py-8 text-center bg-white dark:bg-[#161617] rounded-2xl border border-[#e5e5ea] dark:border-[#333336] text-[#86868b] dark:text-[#a1a1a6] text-xs transition-colors">
              No completed practice goals yet.
            </div>
          )}
        </div>
      )}

      {/* Modal for Add / Edit Practice Goal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingItemId ? 'Edit PYQ Practice Target' : 'Create PYQ Practice Target'}
        subtitle="Set a question target and queue priority for this chapter"
      >
        <form onSubmit={handleSaveItem} className="space-y-4">
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
              className="w-full bg-[#f5f5f7] dark:bg-[#2c2c2e] border border-[#e5e5ea] dark:border-[#3a3a3c] text-[#1d1d1f] dark:text-[#f5f5f7] rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-[#0071e3] focus:outline-none"
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
              className="w-full bg-[#f5f5f7] dark:bg-[#2c2c2e] border border-[#e5e5ea] dark:border-[#3a3a3c] text-[#1d1d1f] dark:text-[#f5f5f7] rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-[#0071e3] focus:outline-none"
              required
            >
              {formChapters.length > 0 ? (
                formChapters.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
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
                Priority (1-20)
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
                Target Questions
              </label>
              <input
                type="number"
                min="1"
                max="200"
                value={formTargetQuestions}
                onChange={(e) => setFormTargetQuestions(Number(e.target.value))}
                className="w-full bg-[#f5f5f7] dark:bg-[#2c2c2e] border border-[#e5e5ea] dark:border-[#3a3a3c] text-[#1d1d1f] dark:text-[#f5f5f7] rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-[#0071e3] focus:outline-none"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] mb-1">
              Already Solved Questions
            </label>
            <input
              type="number"
              min="0"
              max={formTargetQuestions}
              value={formSolvedQuestions}
              onChange={(e) => setFormSolvedQuestions(Number(e.target.value))}
              className="w-full bg-[#f5f5f7] dark:bg-[#2c2c2e] border border-[#e5e5ea] dark:border-[#3a3a3c] text-[#1d1d1f] dark:text-[#f5f5f7] rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-[#0071e3] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] mb-1">
              Session Goal / Notes
            </label>
            <textarea
              value={formNotes}
              onChange={(e) => setFormNotes(e.target.value)}
              rows={2}
              placeholder="e.g. Solve all 2-mark GATE questions from 2019 to 2024"
              className="w-full bg-[#f5f5f7] dark:bg-[#2c2c2e] border border-[#e5e5ea] dark:border-[#3a3a3c] text-[#1d1d1f] dark:text-[#f5f5f7] rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-[#0071e3] focus:outline-none font-sans"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-[#e5e5ea] dark:border-[#333336]">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-[#86868b] dark:text-[#a1a1a6] hover:bg-[#f5f5f7] dark:hover:bg-[#2c2c2e] rounded-full transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white dark:text-black bg-[#0071e3] hover:bg-[#0077ed] dark:bg-[#2997ff] dark:hover:bg-[#40a9ff] rounded-full shadow-xs transition-colors"
            >
              {editingItemId ? 'Save Changes' : 'Add to Practice Queue'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

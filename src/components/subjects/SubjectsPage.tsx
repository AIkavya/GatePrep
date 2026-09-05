import React, { useState } from 'react';
import {
  Plus,
  BookOpen,
  CheckCircle2,
  FileQuestion,
  RotateCcw,
  Trash2,
  Edit2,
  Layers,
  ChevronDown,
  ChevronUp,
  Award,
  Check,
  ArrowRight,
  HelpCircle,
  Hash,
  Clock,
  Sparkles,
  RefreshCw,
} from 'lucide-react';
import { useGate } from '../../context/GateContext';
import { Subject, Chapter } from '../../types';
import { StatusBadge } from '../common/Badge';
import { Modal } from '../common/Modal';

export const SubjectsPage: React.FC = () => {
  const {
    subjects,
    chapters,
    pyqs,
    revisions,
    exams,
    addSubject,
    updateSubject,
    deleteSubject,
    getChapterRevisionCount,
    getChapterPyqStats,
    getSubjectRevisionCount,
    getSubjectEntirePyqCount,
    getSubjectTestsCount,
    addChapter,
    updateChapter,
    deleteChapter,
    updateChapterMetrics,
    updateChapterProgress,
    setSelectedSubjectId,
    setActiveTab,
  } = useGate();

  // Subject Modal
  const [isSubjectModalOpen, setIsSubjectModalOpen] = useState(false);
  const [editingSubjectId, setEditingSubjectId] = useState<string | null>(null);
  const [formName, setFormName] = useState('');
  const [formCode, setFormCode] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formColor, setFormColor] = useState('#2563eb');
  const [formTotalRevisionsCount, setFormTotalRevisionsCount] = useState<number>(0);
  const [formEntirePyqSolvedCount, setFormEntirePyqSolvedCount] = useState<number>(0);
  const [formSubjectTestsCount, setFormSubjectTestsCount] = useState<number>(0);

  // Add Chapter to Subject Modal
  const [isAddChapterModalOpen, setIsAddChapterModalOpen] = useState(false);
  const [targetSubjectId, setTargetSubjectId] = useState<string>('');
  const [newChapterName, setNewChapterName] = useState('');
  const [newChapterPriority, setNewChapterPriority] = useState(10);
  const [newChapterNotes, setNewChapterNotes] = useState('');

  // Chapter Details & Counters Modal (When clicking a chapter tab/row)
  const [selectedChapterForDetails, setSelectedChapterForDetails] = useState<Chapter | null>(null);
  const [editingChapterName, setEditingChapterName] = useState<string>('');
  const [editingRevCount, setEditingRevCount] = useState<number>(0);
  const [editingPyqSolvedCount, setEditingPyqSolvedCount] = useState<number>(0);
  const [editingPyqFullCyclesCount, setEditingPyqFullCyclesCount] = useState<number>(0);

  // Expanded subject view
  const [expandedSubjectId, setExpandedSubjectId] = useState<string | null>(subjects[0]?.id || null);

  const colors = [
    { label: 'Blue', value: '#2563eb' },
    { label: 'Emerald', value: '#059669' },
    { label: 'Purple', value: '#7c3aed' },
    { label: 'Orange', value: '#ea580c' },
    { label: 'Cyan', value: '#0891b2' },
    { label: 'Amber', value: '#d97706' },
    { label: 'Indigo', value: '#4f46e5' },
    { label: 'Pink', value: '#db2777' },
    { label: 'Slate', value: '#64748b' },
  ];

  const handleOpenAddSubject = () => {
    setEditingSubjectId(null);
    setFormName('');
    setFormCode('');
    setFormDescription('');
    setFormColor('#2563eb');
    setFormTotalRevisionsCount(0);
    setFormEntirePyqSolvedCount(0);
    setFormSubjectTestsCount(0);
    setIsSubjectModalOpen(true);
  };

  const handleOpenEditSubject = (s: Subject) => {
    setEditingSubjectId(s.id);
    setFormName(s.name);
    setFormCode(s.code);
    setFormDescription(s.description || '');
    setFormColor(s.color || '#2563eb');
    setFormTotalRevisionsCount(s.totalRevisionsCount ?? getSubjectRevisionCount(s.id).completed);
    setFormEntirePyqSolvedCount(s.entirePyqSolvedCount ?? 0);
    setFormSubjectTestsCount(s.subjectTestsCount ?? getSubjectTestsCount(s.id));
    setIsSubjectModalOpen(true);
  };

  const handleSaveSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    if (editingSubjectId) {
      updateSubject(editingSubjectId, {
        name: formName.trim(),
        code: formCode.trim().toUpperCase() || formName.trim().slice(0, 4).toUpperCase(),
        description: formDescription.trim(),
        color: formColor,
        totalRevisionsCount: Math.max(0, Number(formTotalRevisionsCount)),
        entirePyqSolvedCount: Math.max(0, Number(formEntirePyqSolvedCount)),
        subjectTestsCount: Math.max(0, Number(formSubjectTestsCount)),
      });
    } else {
      const created = addSubject({
        name: formName.trim(),
        code: formCode.trim().toUpperCase() || formName.trim().slice(0, 4).toUpperCase(),
        description: formDescription.trim(),
        color: formColor,
        totalRevisionsCount: Math.max(0, Number(formTotalRevisionsCount)),
        entirePyqSolvedCount: Math.max(0, Number(formEntirePyqSolvedCount)),
        subjectTestsCount: Math.max(0, Number(formSubjectTestsCount)),
      });
      setExpandedSubjectId(created.id);
    }

    setIsSubjectModalOpen(false);
  };

  const handleOpenAddChapter = (subjectId: string) => {
    setTargetSubjectId(subjectId);
    setNewChapterName('');
    const subChaps = chapters.filter((c) => c.subjectId === subjectId);
    setNewChapterPriority(subChaps.length > 0 ? Math.max(...subChaps.map((c) => c.priority)) + 1 : 10);
    setNewChapterNotes('');
    setIsAddChapterModalOpen(true);
  };

  const handleSaveNewChapter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChapterName.trim() || !targetSubjectId) return;

    addChapter({
      subjectId: targetSubjectId,
      name: newChapterName.trim(),
      priority: Number(newChapterPriority),
      progress: 0,
      status: 'not_started',
      notes: newChapterNotes.trim(),
      revisionCount: 0,
      pyqsSolvedCount: 0,
      pyqFullCyclesCount: 0,
    });

    setIsAddChapterModalOpen(false);
  };

  const handleOpenChapterDetails = (chap: Chapter) => {
    setSelectedChapterForDetails(chap);
    setEditingChapterName(chap.name);
    const revCount = getChapterRevisionCount(chap.id);
    const pyqStats = getChapterPyqStats(chap.id);
    setEditingRevCount(revCount);
    setEditingPyqSolvedCount(pyqStats.solved);
    setEditingPyqFullCyclesCount(pyqStats.fullCycles);
  };

  const handleSaveChapterMetrics = () => {
    if (!selectedChapterForDetails) return;

    const trimmedName = editingChapterName.trim();
    if (trimmedName && trimmedName !== selectedChapterForDetails.name) {
      updateChapter(selectedChapterForDetails.id, { name: trimmedName });
    }

    updateChapterMetrics(selectedChapterForDetails.id, {
      revisionCount: editingRevCount,
      pyqsSolvedCount: editingPyqSolvedCount,
      pyqFullCyclesCount: editingPyqFullCyclesCount,
    });

    // Update local copy
    setSelectedChapterForDetails((prev) =>
      prev
        ? {
            ...prev,
            name: trimmedName || prev.name,
            revisionCount: editingRevCount,
            pyqsSolvedCount: editingPyqSolvedCount,
            pyqFullCyclesCount: editingPyqFullCyclesCount,
          }
        : null
    );
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#161617] p-5 rounded-2xl border border-[#e5e5ea] dark:border-[#333336] shadow-2xs transition-colors">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-[#1d1d1f] dark:text-[#f5f5f7] tracking-tight">GATE CSE Syllabus &amp; Subjects</h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full font-medium bg-blue-50 dark:bg-blue-950/40 text-[#0071e3] dark:text-[#2997ff] border border-blue-200/80 dark:border-blue-800/60">
              {subjects.length} Subjects
            </span>
          </div>
          <p className="text-xs text-[#86868b] dark:text-[#a1a1a6] mt-1">
            Click any chapter below to track completed revisions, solved PYQs, and full completion cycles.
          </p>
        </div>

        <button
          id="btn-add-new-subject"
          onClick={handleOpenAddSubject}
          className="flex items-center gap-1.5 px-4 py-2 bg-[#0071e3] hover:bg-[#0077ed] dark:bg-[#2997ff] dark:hover:bg-[#40a9ff] text-white dark:text-black text-xs font-semibold rounded-full transition-colors shadow-xs self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Subject</span>
        </button>
      </div>

      {/* Subjects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {subjects.map((sub) => {
          const subChapters = chapters.filter((c) => c.subjectId === sub.id);
          const completedCount = subChapters.filter((c) => c.status === 'completed').length;
          const totalChapters = subChapters.length;
          const subRevStats = getSubjectRevisionCount(sub.id);
          const entirePyqSolved = getSubjectEntirePyqCount(sub.id);
          const subjectTests = getSubjectTestsCount(sub.id);
          const progressPct = totalChapters > 0 ? Math.round((completedCount / totalChapters) * 100) : 0;
          const isExpanded = expandedSubjectId === sub.id;

          return (
            <div
              key={sub.id}
              className="bg-white dark:bg-[#161617] rounded-2xl border border-[#e5e5ea] dark:border-[#333336] p-5 shadow-2xs flex flex-col justify-between hover:border-[#d2d2d7] dark:hover:border-[#424245] transition-colors"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2 min-w-0 pr-1">
                    <span
                      className="text-xs font-bold px-2.5 py-0.5 rounded-full text-white shrink-0"
                      style={{ backgroundColor: sub.color || '#0071e3' }}
                    >
                      {sub.code || sub.name}
                    </span>
                    <h2 className="text-base font-bold text-[#1d1d1f] dark:text-[#f5f5f7] leading-snug truncate">{sub.name}</h2>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      id={`btn-edit-subject-${sub.id}`}
                      onClick={() => handleOpenEditSubject(sub)}
                      className="p-1.5 text-[#86868b] hover:text-[#1d1d1f] dark:hover:text-[#f5f5f7] hover:bg-[#f5f5f7] dark:hover:bg-[#2c2c2e] rounded-full transition-colors"
                      title="Edit Subject"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        if (
                          window.confirm(
                            `Delete "${sub.name}" and all its chapters, revisions, and PYQs?`
                          )
                        ) {
                          deleteSubject(sub.id);
                        }
                      }}
                      className="p-1.5 text-[#86868b] hover:text-[#ff3b30] dark:hover:text-[#ff453a] hover:bg-red-50 dark:hover:bg-red-950/40 rounded-full transition-colors"
                      title="Delete Subject"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {sub.description && (
                  <p className="text-xs text-[#86868b] dark:text-[#a1a1a6] mt-1 line-clamp-2 leading-relaxed">
                    {sub.description}
                  </p>
                )}

                {/* Progress bar */}
                <div className="mt-4 pt-3 border-t border-[#e5e5ea] dark:border-[#333336]">
                  <div className="flex justify-between text-xs font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] mb-1.5">
                    <span>Syllabus Completion</span>
                    <span>{progressPct}%</span>
                  </div>
                  <div className="w-full h-2 bg-[#e5e5ea] dark:bg-[#2c2c2e] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{
                        width: `${progressPct}%`,
                        backgroundColor: sub.color || '#0071e3',
                      }}
                    />
                  </div>
                </div>

                {/* Subject Metrics Grid (Revisions, Entire PYQs, Tests Given) */}
                <div className="grid grid-cols-3 gap-2 mt-4 text-center text-xs">
                  <div className="p-2 bg-red-50/50 dark:bg-red-950/30 rounded-xl border border-red-100 dark:border-red-900/40" title="Total completed revisions of this subject">
                    <span className="block text-[10px] text-[#ff3b30] dark:text-[#ff453a] font-medium">Revisions Done</span>
                    <span className="font-bold text-red-800 dark:text-red-300 text-sm">
                      {subRevStats.completed}
                    </span>
                  </div>
                  <div className="p-2 bg-purple-50/50 dark:bg-purple-950/30 rounded-xl border border-purple-100 dark:border-purple-900/40" title="Times entirely solved all PYQs of this subject">
                    <span className="block text-[10px] text-[#af52de] dark:text-[#bf5af2] font-medium">PYQ Sweeps</span>
                    <span className="font-bold text-purple-800 dark:text-purple-300 text-sm">{entirePyqSolved}x</span>
                  </div>
                  <div className="p-2 bg-amber-50/50 dark:bg-amber-950/30 rounded-xl border border-amber-100 dark:border-amber-900/40" title="Full length or subject tests attempted for this subject">
                    <span className="block text-[10px] text-[#ff9500] font-medium">Tests Given</span>
                    <span className="font-bold text-amber-800 dark:text-amber-300 text-sm">{subjectTests}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between gap-2 mt-5 pt-3 border-t border-[#e5e5ea] dark:border-[#333336]">
                <button
                  id={`btn-toggle-chapters-${sub.id}`}
                  onClick={() => setExpandedSubjectId(isExpanded ? null : sub.id)}
                  className="text-xs font-semibold text-[#86868b] dark:text-[#a1a1a6] hover:text-[#1d1d1f] dark:hover:text-[#f5f5f7] flex items-center gap-1 transition-colors"
                >
                  <span>{isExpanded ? 'Hide Chapters' : `View Chapters (${totalChapters})`}</span>
                  {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleOpenAddChapter(sub.id)}
                    className="p-1.5 text-xs text-[#0071e3] dark:text-[#2997ff] hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded-full font-semibold flex items-center gap-1 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Topic</span>
                  </button>

                  <button
                    onClick={() => {
                      setSelectedSubjectId(sub.id);
                      setActiveTab('learning');
                    }}
                    className="px-3 py-1 text-xs bg-[#f5f5f7] dark:bg-[#2c2c2e] hover:bg-[#e5e5ea] dark:hover:bg-[#3a3a3c] text-[#1d1d1f] dark:text-[#f5f5f7] font-semibold rounded-full border border-[#e5e5ea] dark:border-[#3a3a3c] transition-colors"
                  >
                    Study
                  </button>
                </div>
              </div>

              {/* Expanded Chapters Drawer with Chapter Details Click Action */}
              {isExpanded && (
                <div className="mt-4 pt-3 border-t border-[#e5e5ea] dark:border-[#333336] space-y-2 max-h-[300px] overflow-y-auto pr-1 animate-in fade-in duration-150">
                  <div className="text-[11px] text-[#86868b] dark:text-[#a1a1a6] font-medium flex items-center justify-between pb-1">
                    <span>Click any chapter to view &amp; update metrics:</span>
                  </div>
                  {subChapters.length > 0 ? (
                    subChapters.map((chap) => {
                      const chapRevCount = getChapterRevisionCount(chap.id);
                      const chapPyqStats = getChapterPyqStats(chap.id);
                      return (
                        <div
                          key={chap.id}
                          id={`chapter-card-${chap.id}`}
                          onClick={() => handleOpenChapterDetails(chap)}
                          className="p-2.5 rounded-xl bg-[#f5f5f7] dark:bg-[#1d1d1f] hover:bg-blue-50/50 dark:hover:bg-blue-950/30 border border-[#e5e5ea] dark:border-[#333336] hover:border-blue-300 dark:hover:border-blue-800/60 transition-all cursor-pointer group"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="truncate pr-2 min-w-0 flex-1">
                              <span className="font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] group-hover:text-[#0071e3] dark:group-hover:text-[#2997ff] transition-colors text-xs block truncate">
                                {chap.name}
                              </span>
                              <div className="flex flex-wrap items-center gap-1.5 mt-1 text-[11px]">
                                <span className="text-[#86868b] dark:text-[#a1a1a6]">P{chap.priority}</span>
                                <span className="text-[#86868b] dark:text-[#a1a1a6]">•</span>
                                <span className="text-[#1d1d1f] dark:text-[#f5f5f7] font-medium">{chap.progress}% learned</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                              <StatusBadge status={chap.status} />
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleOpenChapterDetails(chap);
                                }}
                                className="p-1 text-[#86868b] hover:text-[#0071e3] dark:hover:text-[#2997ff] hover:bg-white dark:hover:bg-[#2c2c2e] rounded-full transition-colors"
                                title="Edit Chapter Name & Metrics"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (
                                    window.confirm(
                                      `Delete chapter "${chap.name}"? This will also remove any associated revisions and PYQs.`
                                    )
                                  ) {
                                    deleteChapter(chap.id);
                                  }
                                }}
                                className="p-1 text-[#86868b] hover:text-[#ff3b30] dark:hover:text-[#ff453a] hover:bg-red-50 dark:hover:bg-red-950/40 rounded-full transition-colors"
                                title="Delete Chapter"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          {/* Chapter Metric Badges */}
                          <div className="flex items-center gap-1.5 mt-2 pt-1.5 border-t border-[#e5e5ea] dark:border-[#333336] text-[10px]">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-50 text-[#ff3b30] font-medium border border-red-200/70 dark:bg-red-950/40 dark:text-[#ff453a] dark:border-red-800/60">
                              <RotateCcw className="w-2.5 h-2.5" />
                              {chapRevCount} revs
                            </span>
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 text-[#0071e3] font-medium border border-blue-200/70 dark:bg-blue-950/40 dark:text-[#2997ff] dark:border-blue-800/60">
                              <FileQuestion className="w-2.5 h-2.5" />
                              {chapPyqStats.solved} PYQs
                            </span>
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-purple-50 text-[#af52de] font-medium border border-purple-200/70 dark:bg-purple-950/40 dark:text-[#bf5af2] dark:border-purple-800/60">
                              <CheckCircle2 className="w-2.5 h-2.5" />
                              {chapPyqStats.fullCycles} cycles
                            </span>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-4 text-[#86868b] dark:text-[#a1a1a6] text-xs">
                      No chapters yet. Click &quot;Add Topic&quot; to add chapters to this subject.
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Chapter Details & Metrics Update Modal (When chapter is clicked) */}
      {selectedChapterForDetails && (
        <Modal
          isOpen={Boolean(selectedChapterForDetails)}
          onClose={() => setSelectedChapterForDetails(null)}
          title={selectedChapterForDetails.name}
          subtitle={`Subject: ${
            subjects.find((s) => s.id === selectedChapterForDetails.subjectId)?.name || 'GATE Subject'
          }`}
        >
          <div className="space-y-5">
            {/* Chapter Name Input */}
            <div>
              <label className="block text-xs font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] mb-1">
                Chapter / Topic Name
              </label>
              <input
                type="text"
                value={editingChapterName}
                onChange={(e) => setEditingChapterName(e.target.value)}
                className="w-full bg-[#f5f5f7] dark:bg-[#2c2c2e] border border-[#e5e5ea] dark:border-[#3a3a3c] text-[#1d1d1f] dark:text-[#f5f5f7] rounded-xl px-3 py-2 text-sm font-bold focus:ring-2 focus:ring-[#0071e3] focus:outline-none"
                placeholder="Enter chapter name"
                required
              />
            </div>

            {/* Chapter Learning Status & Progress Header */}
            <div className="p-3 bg-[#f5f5f7] dark:bg-[#1d1d1f] rounded-xl border border-[#e5e5ea] dark:border-[#333336] flex items-center justify-between">
              <div>
                <span className="text-xs text-[#86868b] dark:text-[#a1a1a6] font-medium">Learning Progress</span>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-sm font-bold text-[#1d1d1f] dark:text-[#f5f5f7]">
                    {selectedChapterForDetails.progress}% Completed
                  </span>
                  <StatusBadge status={selectedChapterForDetails.status} />
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => {
                    const next = Math.min(100, selectedChapterForDetails.progress + 25);
                    updateChapterProgress(selectedChapterForDetails.id, next);
                    setSelectedChapterForDetails((prev) => (prev ? { ...prev, progress: next } : null));
                  }}
                  className="px-3 py-1 text-xs font-semibold bg-white dark:bg-[#2c2c2e] hover:bg-[#e5e5ea] dark:hover:bg-[#3a3a3c] text-[#1d1d1f] dark:text-[#f5f5f7] rounded-full border border-[#e5e5ea] dark:border-[#3a3a3c] transition-colors"
                >
                  +25%
                </button>
                <button
                  type="button"
                  onClick={() => {
                    updateChapterProgress(selectedChapterForDetails.id, 100);
                    setSelectedChapterForDetails((prev) =>
                      prev ? { ...prev, progress: 100, status: 'completed' } : null
                    );
                  }}
                  className="px-3 py-1 text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-400 rounded-full border border-emerald-200/80 dark:border-emerald-800/60 transition-colors"
                >
                  Mark 100%
                </button>
              </div>
            </div>

            {/* Metric 1: Revision Count Taken */}
            <div className="p-3.5 bg-red-50/40 dark:bg-red-950/20 rounded-xl border border-red-100 dark:border-red-900/40 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-red-100 dark:bg-red-950 text-[#ff3b30] dark:text-[#ff453a] flex items-center justify-center">
                    <RotateCcw className="w-4 h-4" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-[#1d1d1f] dark:text-[#f5f5f7] block">
                      Revisions Taken of Chapter
                    </label>
                    <span className="text-[11px] text-[#86868b] dark:text-[#a1a1a6]">
                      Total times you have comprehensively revised this chapter
                    </span>
                  </div>
                </div>
                <span className="text-base font-bold text-[#ff3b30] dark:text-[#ff453a] font-mono">
                  {editingRevCount} revs
                </span>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setEditingRevCount((prev) => Math.max(0, prev - 1))}
                  className="w-8 h-8 rounded-lg bg-white dark:bg-[#2c2c2e] border border-[#e5e5ea] dark:border-[#3a3a3c] text-[#1d1d1f] dark:text-[#f5f5f7] font-bold hover:bg-[#f5f5f7] dark:hover:bg-[#3a3a3c] flex items-center justify-center text-sm"
                >
                  -
                </button>
                <input
                  type="number"
                  min="0"
                  value={editingRevCount}
                  onChange={(e) => setEditingRevCount(Math.max(0, parseInt(e.target.value) || 0))}
                  className="flex-1 bg-white dark:bg-[#242426] border border-[#e5e5ea] dark:border-[#3a3a3c] text-[#1d1d1f] dark:text-[#f5f5f7] rounded-xl px-3 py-1.5 text-center font-bold text-sm focus:ring-2 focus:ring-[#0071e3] focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setEditingRevCount((prev) => prev + 1)}
                  className="w-8 h-8 rounded-lg bg-[#ff3b30] text-white font-bold hover:bg-red-600 flex items-center justify-center text-sm"
                >
                  +
                </button>
              </div>
            </div>

            {/* Metric 2: Solved PYQs Count */}
            <div className="p-3.5 bg-blue-50/40 dark:bg-blue-950/20 rounded-xl border border-blue-100 dark:border-blue-900/40 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-950 text-[#0071e3] dark:text-[#2997ff] flex items-center justify-center">
                    <FileQuestion className="w-4 h-4" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-[#1d1d1f] dark:text-[#f5f5f7] block">
                      PYQs Solved
                    </label>
                    <span className="text-[11px] text-[#86868b] dark:text-[#a1a1a6]">
                      Total previous GATE questions solved for this chapter
                    </span>
                  </div>
                </div>
                <span className="text-base font-bold text-[#0071e3] dark:text-[#2997ff] font-mono">
                  {editingPyqSolvedCount} solved
                </span>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setEditingPyqSolvedCount((prev) => Math.max(0, prev - 1))}
                  className="w-8 h-8 rounded-lg bg-white dark:bg-[#2c2c2e] border border-[#e5e5ea] dark:border-[#3a3a3c] text-[#1d1d1f] dark:text-[#f5f5f7] font-bold hover:bg-[#f5f5f7] dark:hover:bg-[#3a3a3c] flex items-center justify-center text-sm"
                >
                  -
                </button>
                <input
                  type="number"
                  min="0"
                  value={editingPyqSolvedCount}
                  onChange={(e) => setEditingPyqSolvedCount(Math.max(0, parseInt(e.target.value) || 0))}
                  className="flex-1 bg-white dark:bg-[#242426] border border-[#e5e5ea] dark:border-[#3a3a3c] text-[#1d1d1f] dark:text-[#f5f5f7] rounded-xl px-3 py-1.5 text-center font-bold text-sm focus:ring-2 focus:ring-[#0071e3] focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setEditingPyqSolvedCount((prev) => prev + 1)}
                  className="w-8 h-8 rounded-lg bg-[#0071e3] dark:bg-[#2997ff] text-white dark:text-black font-bold hover:bg-[#0077ed] flex items-center justify-center text-sm"
                >
                  +
                </button>
                <button
                  type="button"
                  onClick={() => setEditingPyqSolvedCount((prev) => prev + 5)}
                  className="px-2.5 py-1.5 rounded-lg bg-blue-100 dark:bg-blue-950/50 text-[#0071e3] dark:text-[#2997ff] font-bold text-xs hover:bg-blue-200 dark:hover:bg-blue-900/60"
                >
                  +5
                </button>
              </div>
            </div>

            {/* Metric 3: Completely Solved PYQ Cycles */}
            <div className="p-3.5 bg-purple-50/40 dark:bg-purple-950/20 rounded-xl border border-purple-100 dark:border-purple-900/40 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-purple-100 dark:bg-purple-950 text-[#af52de] dark:text-[#bf5af2] flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-[#1d1d1f] dark:text-[#f5f5f7] block">
                      Times Entirely Solved All PYQs
                    </label>
                    <span className="text-[11px] text-[#86868b] dark:text-[#a1a1a6]">
                      Full completion rounds of all chapter GATE PYQs (e.g. Round 1, 2)
                    </span>
                  </div>
                </div>
                <span className="text-base font-bold text-[#af52de] dark:text-[#bf5af2] font-mono">
                  {editingPyqFullCyclesCount} rounds
                </span>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setEditingPyqFullCyclesCount((prev) => Math.max(0, prev - 1))}
                  className="w-8 h-8 rounded-lg bg-white dark:bg-[#2c2c2e] border border-[#e5e5ea] dark:border-[#3a3a3c] text-[#1d1d1f] dark:text-[#f5f5f7] font-bold hover:bg-[#f5f5f7] dark:hover:bg-[#3a3a3c] flex items-center justify-center text-sm"
                >
                  -
                </button>
                <input
                  type="number"
                  min="0"
                  value={editingPyqFullCyclesCount}
                  onChange={(e) =>
                    setEditingPyqFullCyclesCount(Math.max(0, parseInt(e.target.value) || 0))
                  }
                  className="flex-1 bg-white dark:bg-[#242426] border border-[#e5e5ea] dark:border-[#3a3a3c] text-[#1d1d1f] dark:text-[#f5f5f7] rounded-xl px-3 py-1.5 text-center font-bold text-sm focus:ring-2 focus:ring-[#0071e3] focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setEditingPyqFullCyclesCount((prev) => prev + 1)}
                  className="w-8 h-8 rounded-lg bg-[#af52de] text-white font-bold hover:bg-purple-600 flex items-center justify-center text-sm"
                >
                  +
                </button>
              </div>
            </div>

            {/* Navigation, Delete and Save Actions */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-[#e5e5ea] dark:border-[#333336]">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    if (
                      window.confirm(
                        `Are you sure you want to delete chapter "${selectedChapterForDetails.name}"? This will also remove associated revisions and PYQs.`
                      )
                    ) {
                      deleteChapter(selectedChapterForDetails.id);
                      setSelectedChapterForDetails(null);
                    }
                  }}
                  className="px-3 py-1.5 text-xs font-semibold text-[#ff3b30] hover:bg-red-50 dark:hover:bg-red-950/40 rounded-full border border-red-200 dark:border-red-900/60 flex items-center gap-1 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Chapter</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedSubjectId(selectedChapterForDetails.subjectId);
                    setSelectedChapterForDetails(null);
                    setActiveTab('learning');
                  }}
                  className="px-3.5 py-1.5 text-xs font-semibold bg-[#f5f5f7] dark:bg-[#2c2c2e] hover:bg-[#e5e5ea] dark:hover:bg-[#3a3a3c] text-[#1d1d1f] dark:text-[#f5f5f7] rounded-full border border-[#e5e5ea] dark:border-[#3a3a3c] transition-colors"
                >
                  Study
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedChapterForDetails(null)}
                  className="px-4 py-1.5 text-xs font-semibold text-[#86868b] dark:text-[#a1a1a6] hover:bg-[#f5f5f7] dark:hover:bg-[#2c2c2e] rounded-full"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  id="btn-save-chapter-metrics"
                  onClick={() => {
                    handleSaveChapterMetrics();
                    setSelectedChapterForDetails(null);
                  }}
                  className="px-4 py-1.5 text-xs font-semibold text-white dark:text-black bg-[#0071e3] hover:bg-[#0077ed] dark:bg-[#2997ff] dark:hover:bg-[#40a9ff] rounded-full shadow-xs flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Save Changes</span>
                </button>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Add / Edit Subject Modal */}
      <Modal
        isOpen={isSubjectModalOpen}
        onClose={() => setIsSubjectModalOpen(false)}
        title={editingSubjectId ? 'Edit Subject & Metrics' : 'Add GATE Subject'}
        subtitle="Configure subject details, revision counts, PYQ sweep rounds, and tests given."
      >
        <form onSubmit={handleSaveSubject} className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] mb-1">
                Subject Name
              </label>
              <input
                type="text"
                placeholder="e.g. Operating Systems"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                className="w-full bg-[#f5f5f7] dark:bg-[#2c2c2e] border border-[#e5e5ea] dark:border-[#3a3a3c] text-[#1d1d1f] dark:text-[#f5f5f7] rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-[#0071e3] focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] mb-1">
                Code / Abbr
              </label>
              <input
                type="text"
                placeholder="e.g. OS"
                value={formCode}
                onChange={(e) => setFormCode(e.target.value)}
                className="w-full bg-[#f5f5f7] dark:bg-[#2c2c2e] border border-[#e5e5ea] dark:border-[#3a3a3c] text-[#1d1d1f] dark:text-[#f5f5f7] rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-[#0071e3] focus:outline-none uppercase"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] mb-1">
              Description / GATE Syllabus Scope
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Processes, CPU Scheduling, Synchronization, Memory Management, File Systems..."
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
              className="w-full bg-[#f5f5f7] dark:bg-[#2c2c2e] border border-[#e5e5ea] dark:border-[#3a3a3c] text-[#1d1d1f] dark:text-[#f5f5f7] rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-[#0071e3] focus:outline-none"
            />
          </div>

          {/* Subject Metrics Counters in Edit Modal */}
          <div className="p-3.5 bg-[#f5f5f7] dark:bg-[#1d1d1f] rounded-xl border border-[#e5e5ea] dark:border-[#333336] space-y-3">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#1d1d1f] dark:text-[#f5f5f7]">
              <Sparkles className="w-3.5 h-3.5 text-[#0071e3] dark:text-[#2997ff]" />
              <span>Subject-Level Tracking Counters</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Option 1: Total Revision of Subject Count */}
              <div>
                <label className="block text-[11px] font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] mb-1">
                  Total Revisions of Subject
                </label>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min="0"
                    id="input-subject-total-revisions"
                    value={formTotalRevisionsCount}
                    onChange={(e) =>
                      setFormTotalRevisionsCount(Math.max(0, parseInt(e.target.value) || 0))
                    }
                    className="w-full bg-white dark:bg-[#242426] border border-[#e5e5ea] dark:border-[#3a3a3c] rounded-xl px-2.5 py-1.5 text-xs font-bold text-[#1d1d1f] dark:text-[#f5f5f7] focus:ring-2 focus:ring-[#0071e3] focus:outline-none"
                  />
                </div>
                <span className="text-[10px] text-[#86868b] dark:text-[#a1a1a6] mt-0.5 block">Overall revisions done</span>
              </div>

              {/* Option 2: Total Times Entirely Solved All PYQs of Subject Count */}
              <div>
                <label className="block text-[11px] font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] mb-1">
                  Entire PYQs Solved Rounds
                </label>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min="0"
                    id="input-subject-entire-pyqs"
                    value={formEntirePyqSolvedCount}
                    onChange={(e) =>
                      setFormEntirePyqSolvedCount(Math.max(0, parseInt(e.target.value) || 0))
                    }
                    className="w-full bg-white dark:bg-[#242426] border border-[#e5e5ea] dark:border-[#3a3a3c] rounded-xl px-2.5 py-1.5 text-xs font-bold text-[#1d1d1f] dark:text-[#f5f5f7] focus:ring-2 focus:ring-[#0071e3] focus:outline-none"
                  />
                </div>
                <span className="text-[10px] text-[#86868b] dark:text-[#a1a1a6] mt-0.5 block">Times 100% PYQs solved</span>
              </div>

              {/* Option 3: Total Times Given Full Length / Subject Test of Subject Count */}
              <div>
                <label className="block text-[11px] font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] mb-1">
                  Tests Given of Subject
                </label>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min="0"
                    id="input-subject-tests-count"
                    value={formSubjectTestsCount}
                    onChange={(e) =>
                      setFormSubjectTestsCount(Math.max(0, parseInt(e.target.value) || 0))
                    }
                    className="w-full bg-white dark:bg-[#242426] border border-[#e5e5ea] dark:border-[#3a3a3c] rounded-xl px-2.5 py-1.5 text-xs font-bold text-[#1d1d1f] dark:text-[#f5f5f7] focus:ring-2 focus:ring-[#0071e3] focus:outline-none"
                  />
                </div>
                <span className="text-[10px] text-[#86868b] dark:text-[#a1a1a6] mt-0.5 block">Full length / subject tests</span>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] mb-1.5">
              Subject Color Theme
            </label>
            <div className="flex items-center gap-2">
              {colors.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setFormColor(c.value)}
                  className={`w-7 h-7 rounded-full transition-transform ${
                    formColor === c.value ? 'ring-2 ring-offset-2 ring-[#0071e3] dark:ring-[#2997ff] scale-110' : ''
                  }`}
                  style={{ backgroundColor: c.value }}
                  title={c.label}
                />
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-[#e5e5ea] dark:border-[#333336]">
            <button
              type="button"
              onClick={() => setIsSubjectModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-[#86868b] dark:text-[#a1a1a6] hover:bg-[#f5f5f7] dark:hover:bg-[#2c2c2e] rounded-full"
            >
              Cancel
            </button>
            <button
              type="submit"
              id="btn-save-subject-submit"
              className="px-4 py-2 text-xs font-semibold text-white dark:text-black bg-[#0071e3] hover:bg-[#0077ed] dark:bg-[#2997ff] dark:hover:bg-[#40a9ff] rounded-full shadow-xs"
            >
              {editingSubjectId ? 'Save Changes & Counts' : 'Create Subject'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Add Chapter directly to Subject Modal */}
      <Modal
        isOpen={isAddChapterModalOpen}
        onClose={() => setIsAddChapterModalOpen(false)}
        title="Add Chapter to Subject"
        subtitle={subjects.find((s) => s.id === targetSubjectId)?.name}
      >
        <form onSubmit={handleSaveNewChapter} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] mb-1">
              Chapter / Topic Name
            </label>
            <input
              type="text"
              placeholder="e.g. Memory Management & Paging"
              value={newChapterName}
              onChange={(e) => setNewChapterName(e.target.value)}
              className="w-full bg-[#f5f5f7] dark:bg-[#2c2c2e] border border-[#e5e5ea] dark:border-[#3a3a3c] text-[#1d1d1f] dark:text-[#f5f5f7] rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-[#0071e3] focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] mb-1">
              Priority in Learning Queue (1 - 20)
            </label>
            <input
              type="number"
              min="1"
              max="20"
              value={newChapterPriority}
              onChange={(e) => setNewChapterPriority(Number(e.target.value))}
              className="w-full bg-[#f5f5f7] dark:bg-[#2c2c2e] border border-[#e5e5ea] dark:border-[#3a3a3c] text-[#1d1d1f] dark:text-[#f5f5f7] rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-[#0071e3] focus:outline-none"
              required
            />
            <p className="text-[11px] text-[#86868b] dark:text-[#a1a1a6] mt-1">
              Higher numbers place this chapter closer to the top of the active learning queue.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] mb-1">
              Notes / Sub-topics
            </label>
            <textarea
              rows={2}
              placeholder="Multi-level paging, TLB hit ratio calculations, inverted page tables..."
              value={newChapterNotes}
              onChange={(e) => setNewChapterNotes(e.target.value)}
              className="w-full bg-[#f5f5f7] dark:bg-[#2c2c2e] border border-[#e5e5ea] dark:border-[#3a3a3c] text-[#1d1d1f] dark:text-[#f5f5f7] rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-[#0071e3] focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-[#e5e5ea] dark:border-[#333336]">
            <button
              type="button"
              onClick={() => setIsAddChapterModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-[#86868b] dark:text-[#a1a1a6] hover:bg-[#f5f5f7] dark:hover:bg-[#2c2c2e] rounded-full"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white dark:text-black bg-[#0071e3] hover:bg-[#0077ed] dark:bg-[#2997ff] dark:hover:bg-[#40a9ff] rounded-full shadow-xs"
            >
              Add Chapter
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};


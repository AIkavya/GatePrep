import React, { useState } from 'react';
import {
  Plus,
  Filter,
  Check,
  X,
  RotateCcw,
  Eye,
  EyeOff,
  Trash2,
  Edit2,
  FileQuestion,
  Search,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ListOrdered,
  BookOpen,
} from 'lucide-react';
import { useGate } from '../../context/GateContext';
import { PYQ, PyqDifficulty, PyqStatus } from '../../types';
import { DifficultyBadge, PyqStatusBadge } from '../common/Badge';
import { Modal } from '../common/Modal';
import { PyqQueueView } from './PyqQueueView';

export const PyqPage: React.FC = () => {
  const {
    subjects,
    chapters,
    pyqs,
    selectedSubjectId,
    setSelectedSubjectId,
    addPyq,
    updatePyq,
    deletePyq,
    updatePyqStatus,
  } = useGate();

  // Mode: 'queue' (Learning-like priority practice queue) vs 'bank' (Original PYQ Question Bank)
  const [pyqViewMode, setPyqViewMode] = useState<'queue' | 'bank'>('queue');

  // Filters for Question Bank
  const [filterChapterId, setFilterChapterId] = useState<string>('all');
  const [filterYear, setFilterYear] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterDifficulty, setFilterDifficulty] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Revealed explanations map
  const [revealedIds, setRevealedIds] = useState<Record<string, boolean>>({});

  // Modal for Add / Edit
  const [isPyqModalOpen, setIsPyqModalOpen] = useState(false);
  const [editingPyqId, setEditingPyqId] = useState<string | null>(null);

  // Form states
  const [formSubjectId, setFormSubjectId] = useState<string>(
    selectedSubjectId !== 'all' ? selectedSubjectId : subjects[0]?.id || ''
  );
  const [formChapterId, setFormChapterId] = useState<string>('');
  const [formYear, setFormYear] = useState<number>(2024);
  const [formQuestionNumber, setFormQuestionNumber] = useState<string>('Q.1');
  const [formQuestion, setFormQuestion] = useState<string>('');
  const [formAnswer, setFormAnswer] = useState<string>('');
  const [formExplanation, setFormExplanation] = useState<string>('');
  const [formDifficulty, setFormDifficulty] = useState<PyqDifficulty>('medium');
  const [formStatus, setFormStatus] = useState<PyqStatus>('not_attempted');

  // Chapters available for the selected subject
  const availableChapters = chapters.filter((c) =>
    selectedSubjectId === 'all' ? true : c.subjectId === selectedSubjectId
  );

  // Form available chapters
  const formChapters = chapters.filter((c) => c.subjectId === formSubjectId);

  // Filtered PYQs
  const filteredPyqs = pyqs.filter((p) => {
    if (selectedSubjectId !== 'all' && p.subjectId !== selectedSubjectId) return false;
    if (filterChapterId !== 'all' && p.chapterId !== filterChapterId) return false;
    if (filterYear !== 'all' && String(p.year) !== filterYear) return false;
    if (filterStatus !== 'all' && p.status !== filterStatus) return false;
    if (filterDifficulty !== 'all' && p.difficulty !== filterDifficulty) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchText = (p.question + ' ' + (p.answer || '') + ' ' + p.questionNumber).toLowerCase();
      if (!matchText.includes(q)) return false;
    }
    return true;
  });

  // Calculate Statistics for selected subject (or all)
  const currentSubjectObj = subjects.find((s) => s.id === selectedSubjectId);
  const statPyqs = pyqs.filter((p) =>
    selectedSubjectId === 'all' ? true : p.subjectId === selectedSubjectId
  );
  const totalCount = statPyqs.length;
  const attemptedCount = statPyqs.filter((p) => p.status !== 'not_attempted').length;
  const correctCount = statPyqs.filter((p) => p.status === 'correct').length;
  const wrongCount = statPyqs.filter((p) => p.status === 'wrong').length;
  const accuracyPct = attemptedCount > 0 ? ((correctCount / attemptedCount) * 100).toFixed(1) : '0.0';

  // Chapter-level progress for current subject
  const targetChaptersForStats = selectedSubjectId === 'all'
    ? chapters.slice(0, 8)
    : chapters.filter((c) => c.subjectId === selectedSubjectId);

  const toggleReveal = (id: string) => {
    setRevealedIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleOpenAdd = () => {
    setEditingPyqId(null);
    const subId = selectedSubjectId !== 'all' ? selectedSubjectId : subjects[0]?.id || '';
    setFormSubjectId(subId);
    const firstChap = chapters.find((c) => c.subjectId === subId);
    setFormChapterId(firstChap ? firstChap.id : '');
    setFormYear(2024);
    setFormQuestionNumber(`Q.${statPyqs.length + 1}`);
    setFormQuestion('');
    setFormAnswer('');
    setFormExplanation('');
    setFormDifficulty('medium');
    setFormStatus('not_attempted');
    setIsPyqModalOpen(true);
  };

  const handleOpenEdit = (p: PYQ) => {
    setEditingPyqId(p.id);
    setFormSubjectId(p.subjectId);
    setFormChapterId(p.chapterId);
    setFormYear(p.year);
    setFormQuestionNumber(p.questionNumber);
    setFormQuestion(p.question);
    setFormAnswer(p.answer || '');
    setFormExplanation(p.explanation || '');
    setFormDifficulty(p.difficulty);
    setFormStatus(p.status);
    setIsPyqModalOpen(true);
  };

  const handleSavePyq = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formQuestion.trim() || !formSubjectId || !formChapterId) return;

    if (editingPyqId) {
      updatePyq(editingPyqId, {
        subjectId: formSubjectId,
        chapterId: formChapterId,
        year: Number(formYear),
        questionNumber: formQuestionNumber.trim(),
        question: formQuestion.trim(),
        answer: formAnswer.trim(),
        explanation: formExplanation.trim(),
        difficulty: formDifficulty,
        status: formStatus,
      });
    } else {
      addPyq({
        subjectId: formSubjectId,
        chapterId: formChapterId,
        year: Number(formYear),
        questionNumber: formQuestionNumber.trim(),
        question: formQuestion.trim(),
        answer: formAnswer.trim(),
        explanation: formExplanation.trim(),
        difficulty: formDifficulty,
        status: formStatus,
      });
    }

    setIsPyqModalOpen(false);
  };

  // Unique years in database
  const allYears = Array.from(new Set(pyqs.map((p) => p.year))).sort((a, b) => b - a);

  return (
    <div className="space-y-6 pb-12">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#161617] p-5 rounded-2xl border border-[#e5e5ea] dark:border-[#333336] shadow-2xs transition-colors">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-[#1d1d1f] dark:text-[#f5f5f7] tracking-tight">GATE CSE PYQs</h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full font-medium bg-purple-50 dark:bg-purple-950/40 text-[#af52de] border border-purple-200/80 dark:border-purple-800/60">
              Practice & Archive
            </span>
          </div>
          <p className="text-xs text-[#86868b] dark:text-[#a1a1a6] mt-1">
            Separately manage your priority practice queue and query past GATE questions.
          </p>
        </div>

        {pyqViewMode === 'bank' && (
          <button
            id="btn-add-pyq"
            onClick={handleOpenAdd}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#0071e3] hover:bg-[#0077ed] dark:bg-[#2997ff] dark:hover:bg-[#40a9ff] text-white dark:text-black text-xs font-semibold rounded-full transition-colors shadow-xs self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Add PYQ Question</span>
          </button>
        )}
      </div>

      {/* Mode Switcher: Practice Queue vs Question Bank */}
      <div className="flex items-center gap-2 border-b border-[#e5e5ea] dark:border-[#333336] pb-3">
        <button
          onClick={() => setPyqViewMode('queue')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold transition-colors ${
            pyqViewMode === 'queue'
              ? 'bg-[#0071e3] dark:bg-[#2997ff] text-white dark:text-black shadow-xs'
              : 'bg-white dark:bg-[#161617] text-[#86868b] dark:text-[#a1a1a6] border border-[#e5e5ea] dark:border-[#333336] hover:text-[#1d1d1f] dark:hover:text-[#f5f5f7]'
          }`}
        >
          <ListOrdered className="w-4 h-4" />
          <span>Practice Queue (Learning Flow)</span>
        </button>

        <button
          onClick={() => setPyqViewMode('bank')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold transition-colors ${
            pyqViewMode === 'bank'
              ? 'bg-[#0071e3] dark:bg-[#2997ff] text-white dark:text-black shadow-xs'
              : 'bg-white dark:bg-[#161617] text-[#86868b] dark:text-[#a1a1a6] border border-[#e5e5ea] dark:border-[#333336] hover:text-[#1d1d1f] dark:hover:text-[#f5f5f7]'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Question Bank & Archive ({pyqs.length})</span>
        </button>
      </div>

      {/* Subject Selector Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
        <button
          onClick={() => {
            setSelectedSubjectId('all');
            setFilterChapterId('all');
          }}
          className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors border ${
            selectedSubjectId === 'all'
              ? 'bg-[#1d1d1f] text-white border-[#1d1d1f] dark:bg-[#f5f5f7] dark:text-black dark:border-[#f5f5f7]'
              : 'bg-white dark:bg-[#161617] text-[#86868b] dark:text-[#a1a1a6] border-[#e5e5ea] dark:border-[#333336] hover:text-[#1d1d1f] dark:hover:text-[#f5f5f7]'
          }`}
        >
          All Subjects
        </button>
        {subjects.map((s) => {
          const isSelected = selectedSubjectId === s.id;
          return (
            <button
              key={s.id}
              onClick={() => {
                setSelectedSubjectId(s.id);
                setFilterChapterId('all');
              }}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors border ${
                isSelected
                  ? 'bg-[#0071e3] text-white border-[#0071e3] dark:bg-[#2997ff] dark:text-black dark:border-[#2997ff]'
                  : 'bg-white dark:bg-[#161617] text-[#86868b] dark:text-[#a1a1a6] border-[#e5e5ea] dark:border-[#333336] hover:text-[#1d1d1f] dark:hover:text-[#f5f5f7]'
              }`}
            >
              {s.code || s.name}
            </button>
          );
        })}
      </div>

      {/* Conditional Rendering based on Mode */}
      {pyqViewMode === 'queue' ? (
        /* 1. LEARNING-LIKE PRACTICE QUEUE INTERFACE */
        <PyqQueueView />
      ) : (
        /* 2. ORIGINAL QUESTION BANK INTERFACE (PRESERVED 100%) */
        <>
          {/* Stats Summary & Chapter Breakdown Card */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Overall Subject Stats */}
            <div className="bg-white dark:bg-[#161617] rounded-2xl border border-[#e5e5ea] dark:border-[#333336] p-5 shadow-2xs flex flex-col justify-between transition-colors">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-[#e5e5ea] dark:border-[#333336]">
                  <span className="text-xs font-bold text-[#86868b] dark:text-[#a1a1a6] uppercase tracking-wide">
                    {currentSubjectObj ? currentSubjectObj.name : 'All Subjects Summary'}
                  </span>
                  <span className="text-xs font-semibold text-[#0071e3] dark:text-[#2997ff]">
                    {accuracyPct}% Accuracy
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 mt-4">
                  <div className="p-3 bg-[#f5f5f7] dark:bg-[#1d1d1f] rounded-xl border border-[#e5e5ea] dark:border-[#333336]">
                    <p className="text-[11px] text-[#86868b] dark:text-[#a1a1a6] font-medium">Total Questions</p>
                    <p className="text-xl font-bold text-[#1d1d1f] dark:text-[#f5f5f7] mt-0.5">{totalCount}</p>
                  </div>
                  <div className="p-3 bg-[#f5f5f7] dark:bg-[#1d1d1f] rounded-xl border border-[#e5e5ea] dark:border-[#333336]">
                    <p className="text-[11px] text-[#86868b] dark:text-[#a1a1a6] font-medium">Attempted</p>
                    <p className="text-xl font-bold text-[#1d1d1f] dark:text-[#f5f5f7] mt-0.5">{attemptedCount}</p>
                  </div>
                  <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200/70 dark:border-emerald-800/60">
                    <p className="text-[11px] text-emerald-700 dark:text-emerald-400 font-medium">Correct</p>
                    <p className="text-xl font-bold text-emerald-700 dark:text-emerald-400 mt-0.5">{correctCount}</p>
                  </div>
                  <div className="p-3 bg-red-50 dark:bg-red-950/40 rounded-xl border border-red-200/70 dark:border-red-800/60">
                    <p className="text-[11px] text-[#ff3b30] dark:text-[#ff453a] font-medium">Wrong / Missed</p>
                    <p className="text-xl font-bold text-[#ff3b30] dark:text-[#ff453a] mt-0.5">{wrongCount}</p>
                  </div>
                </div>
              </div>

              {/* Progress bar */}
              <div className="mt-4 pt-3 border-t border-[#e5e5ea] dark:border-[#333336]">
                <div className="flex justify-between text-xs text-[#86868b] dark:text-[#a1a1a6] mb-1">
                  <span>Coverage</span>
                  <span className="font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">
                    {totalCount > 0 ? Math.round((attemptedCount / totalCount) * 100) : 0}%
                  </span>
                </div>
                <div className="w-full h-2 bg-[#e5e5ea] dark:bg-[#2c2c2e] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#0071e3] dark:bg-[#2997ff] rounded-full transition-all duration-300"
                    style={{
                      width: `${totalCount > 0 ? (attemptedCount / totalCount) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Chapter Breakdown Matrix */}
            <div className="lg:col-span-2 bg-white dark:bg-[#161617] rounded-2xl border border-[#e5e5ea] dark:border-[#333336] p-5 shadow-2xs transition-colors">
              <div className="flex items-center justify-between pb-3 border-b border-[#e5e5ea] dark:border-[#333336]">
                <span className="text-xs font-bold text-[#86868b] dark:text-[#a1a1a6] uppercase tracking-wide">
                  Chapter-wise PYQ Breakdown
                </span>
                <span className="text-xs text-[#86868b] dark:text-[#a1a1a6]">
                  {targetChaptersForStats.length} chapters
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4 max-h-[160px] overflow-y-auto pr-1">
                {targetChaptersForStats.map((c) => {
                  const chPyqs = pyqs.filter((p) => p.chapterId === c.id);
                  const chSolved = chPyqs.filter((p) => p.status === 'correct').length;
                  const chTotal = chPyqs.length;
                  const chPct = chTotal > 0 ? Math.round((chSolved / chTotal) * 100) : 0;

                  return (
                    <div
                      key={c.id}
                      onClick={() => setFilterChapterId(filterChapterId === c.id ? 'all' : c.id)}
                      className={`p-2.5 rounded-xl border text-xs cursor-pointer transition-colors ${
                        filterChapterId === c.id
                          ? 'border-[#0071e3] dark:border-[#2997ff] bg-blue-50/50 dark:bg-blue-950/40'
                          : 'border-[#e5e5ea] dark:border-[#333336] bg-[#f5f5f7] dark:bg-[#1d1d1f] hover:bg-[#e5e5ea]/60 dark:hover:bg-[#2c2c2e]'
                      }`}
                    >
                      <div className="flex justify-between font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] mb-1 truncate">
                        <span className="truncate">{c.name}</span>
                        <span className="text-[#86868b] dark:text-[#a1a1a6] shrink-0 ml-2">
                          {chSolved}/{chTotal}
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-[#e5e5ea] dark:bg-[#2c2c2e] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#0071e3] dark:bg-[#2997ff] rounded-full transition-all duration-300"
                          style={{ width: `${chPct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Filtering and Search Toolbar */}
          <div className="bg-white dark:bg-[#161617] p-4 rounded-2xl border border-[#e5e5ea] dark:border-[#333336] space-y-3 shadow-2xs transition-colors">
            <div className="flex flex-col md:flex-row gap-3">
              {/* Search input */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-[#86868b] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search questions by keyword, formula, or concept..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-[#f5f5f7] dark:bg-[#2c2c2e] border border-[#e5e5ea] dark:border-[#3a3a3c] text-[#1d1d1f] dark:text-[#f5f5f7] rounded-xl focus:ring-2 focus:ring-[#0071e3] focus:outline-none"
                />
              </div>

              {/* Chapter filter dropdown */}
              <select
                value={filterChapterId}
                onChange={(e) => setFilterChapterId(e.target.value)}
                className="text-xs border border-[#e5e5ea] dark:border-[#3a3a3c] rounded-xl px-3 py-2 bg-[#f5f5f7] dark:bg-[#2c2c2e] text-[#1d1d1f] dark:text-[#f5f5f7] focus:ring-2 focus:ring-[#0071e3] focus:outline-none"
              >
                <option value="all">All Chapters</option>
                {availableChapters.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>

              {/* Year filter dropdown */}
              <select
                value={filterYear}
                onChange={(e) => setFilterYear(e.target.value)}
                className="text-xs border border-[#e5e5ea] dark:border-[#3a3a3c] rounded-xl px-3 py-2 bg-[#f5f5f7] dark:bg-[#2c2c2e] text-[#1d1d1f] dark:text-[#f5f5f7] focus:ring-2 focus:ring-[#0071e3] focus:outline-none"
              >
                <option value="all">All Years</option>
                {allYears.map((yr) => (
                  <option key={yr} value={String(yr)}>
                    GATE {yr}
                  </option>
                ))}
              </select>

              {/* Status filter dropdown */}
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="text-xs border border-[#e5e5ea] dark:border-[#3a3a3c] rounded-xl px-3 py-2 bg-[#f5f5f7] dark:bg-[#2c2c2e] text-[#1d1d1f] dark:text-[#f5f5f7] focus:ring-2 focus:ring-[#0071e3] focus:outline-none"
              >
                <option value="all">All Statuses</option>
                <option value="not_attempted">Not Attempted</option>
                <option value="correct">Correct</option>
                <option value="wrong">Wrong</option>
                <option value="skipped">Skipped</option>
              </select>

              {/* Difficulty filter dropdown */}
              <select
                value={filterDifficulty}
                onChange={(e) => setFilterDifficulty(e.target.value)}
                className="text-xs border border-[#e5e5ea] dark:border-[#3a3a3c] rounded-xl px-3 py-2 bg-[#f5f5f7] dark:bg-[#2c2c2e] text-[#1d1d1f] dark:text-[#f5f5f7] focus:ring-2 focus:ring-[#0071e3] focus:outline-none"
              >
                <option value="all">All Difficulties</option>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
          </div>

          {/* Questions List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs text-[#86868b] dark:text-[#a1a1a6] px-1">
              <span>Showing {filteredPyqs.length} questions</span>
            </div>

            {filteredPyqs.length > 0 ? (
              filteredPyqs.map((p) => {
                const sub = subjects.find((s) => s.id === p.subjectId);
                const chap = chapters.find((c) => c.id === p.chapterId);
                const isRevealed = !!revealedIds[p.id];

                return (
                  <div
                    key={p.id}
                    className="bg-white dark:bg-[#161617] rounded-2xl border border-[#e5e5ea] dark:border-[#333336] p-5 shadow-2xs hover:border-[#86868b]/40 transition-colors"
                  >
                    {/* Question Header */}
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-3 pb-2.5 border-b border-[#e5e5ea] dark:border-[#333336]">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className="text-[11px] font-bold px-2.5 py-0.5 rounded-full text-white"
                          style={{ backgroundColor: sub?.color || '#0071e3' }}
                        >
                          {sub?.code || sub?.name}
                        </span>
                        <span className="text-xs font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">
                          {chap?.name}
                        </span>
                        <span className="text-xs font-bold text-[#0071e3] dark:text-[#2997ff] bg-blue-50 dark:bg-blue-950/40 px-2.5 py-0.5 rounded-full border border-blue-200/80 dark:border-blue-800/60">
                          GATE {p.year} ({p.questionNumber})
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <DifficultyBadge difficulty={p.difficulty} />
                        <PyqStatusBadge status={p.status} />

                        <div className="flex items-center gap-1 ml-2">
                          <button
                            onClick={() => handleOpenEdit(p)}
                            className="p-1.5 text-[#86868b] dark:text-[#a1a1a6] hover:text-[#1d1d1f] dark:hover:text-[#f5f5f7] hover:bg-[#e5e5ea] dark:hover:bg-[#2c2c2e] rounded-full transition-colors"
                            title="Edit PYQ"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm('Delete this PYQ?')) {
                                deletePyq(p.id);
                              }
                            }}
                            className="p-1.5 text-[#86868b] dark:text-[#a1a1a6] hover:text-[#ff3b30] dark:hover:text-[#ff453a] hover:bg-red-50 dark:hover:bg-red-950/40 rounded-full transition-colors"
                            title="Delete PYQ"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Question Body */}
                    <div className="text-[#1d1d1f] dark:text-[#f5f5f7] text-xs sm:text-sm font-normal leading-relaxed whitespace-pre-line">
                      {p.question}
                    </div>

                    {/* Reveal Answer / Solution Box */}
                    {isRevealed && (
                      <div className="mt-4 p-4 rounded-xl bg-[#f5f5f7] dark:bg-[#1d1d1f] border border-[#e5e5ea] dark:border-[#333336] text-xs animate-in fade-in duration-150 space-y-2">
                        {p.answer && (
                          <div>
                            <span className="font-bold text-[#1d1d1f] dark:text-[#f5f5f7] block mb-0.5">Answer:</span>
                            <div className="font-mono text-emerald-700 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1 rounded-full inline-block border border-emerald-200/80 dark:border-emerald-800/60">
                              {p.answer}
                            </div>
                          </div>
                        )}
                        {p.explanation && (
                          <div>
                            <span className="font-bold text-[#1d1d1f] dark:text-[#f5f5f7] block mb-0.5">Explanation & Method:</span>
                            <p className="text-[#86868b] dark:text-[#a1a1a6] whitespace-pre-line leading-relaxed">
                              {p.explanation}
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Question Action Controls */}
                    <div className="flex flex-wrap items-center justify-between gap-3 mt-4 pt-3 border-t border-[#e5e5ea] dark:border-[#333336]">
                      {/* Reveal Toggle */}
                      <button
                        onClick={() => toggleReveal(p.id)}
                        className="flex items-center gap-1.5 text-xs text-[#0071e3] dark:text-[#2997ff] hover:opacity-80 font-semibold transition-colors"
                      >
                        {isRevealed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        <span>{isRevealed ? 'Hide Solution' : 'View Answer & Solution'}</span>
                      </button>

                      {/* Status Marking Buttons */}
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] text-[#86868b] dark:text-[#a1a1a6] font-medium mr-1 hidden sm:inline">
                          Mark as:
                        </span>
                        <button
                          onClick={() => updatePyqStatus(p.id, 'correct')}
                          className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 transition-colors ${
                            p.status === 'correct'
                              ? 'bg-emerald-600 text-white'
                              : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 border border-emerald-200/80 dark:border-emerald-800/60'
                          }`}
                        >
                          <Check className="w-3 h-3" />
                          <span>Correct</span>
                        </button>

                        <button
                          onClick={() => updatePyqStatus(p.id, 'wrong')}
                          className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 transition-colors ${
                            p.status === 'wrong'
                              ? 'bg-[#ff3b30] text-white'
                              : 'bg-red-50 dark:bg-red-950/40 text-[#ff3b30] dark:text-[#ff453a] hover:bg-red-100 dark:hover:bg-red-900/40 border border-red-200/80 dark:border-red-800/60'
                          }`}
                        >
                          <X className="w-3 h-3" />
                          <span>Wrong</span>
                        </button>

                        <button
                          onClick={() => updatePyqStatus(p.id, 'skipped')}
                          className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 transition-colors ${
                            p.status === 'skipped'
                              ? 'bg-[#1d1d1f] dark:bg-[#f5f5f7] text-white dark:text-black'
                              : 'bg-[#f5f5f7] dark:bg-[#2c2c2e] text-[#86868b] dark:text-[#a1a1a6] hover:text-[#1d1d1f] dark:hover:text-[#f5f5f7]'
                          }`}
                        >
                          <span>Skip</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="bg-white dark:bg-[#161617] rounded-2xl border border-[#e5e5ea] dark:border-[#333336] p-12 text-center text-[#86868b] dark:text-[#a1a1a6] text-xs">
                No PYQ questions matched your filters.
              </div>
            )}
          </div>
        </>
      )}

      {/* Add / Edit Question Modal */}
      <Modal
        isOpen={isPyqModalOpen}
        onClose={() => setIsPyqModalOpen(false)}
        title={editingPyqId ? 'Edit PYQ Question' : 'Add GATE PYQ'}
        subtitle="Contribute or log a question into the archive"
      >
        <form onSubmit={handleSavePyq} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
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
                Chapter *
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
                  <option value="">No chapters found</option>
                )}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] mb-1">
                GATE Year *
              </label>
              <input
                type="number"
                min="1990"
                max="2030"
                value={formYear}
                onChange={(e) => setFormYear(Number(e.target.value))}
                className="w-full bg-[#f5f5f7] dark:bg-[#2c2c2e] border border-[#e5e5ea] dark:border-[#3a3a3c] text-[#1d1d1f] dark:text-[#f5f5f7] rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-[#0071e3] focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] mb-1">
                Question No.
              </label>
              <input
                type="text"
                placeholder="e.g. Q.14"
                value={formQuestionNumber}
                onChange={(e) => setFormQuestionNumber(e.target.value)}
                className="w-full bg-[#f5f5f7] dark:bg-[#2c2c2e] border border-[#e5e5ea] dark:border-[#3a3a3c] text-[#1d1d1f] dark:text-[#f5f5f7] rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-[#0071e3] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] mb-1">
                Difficulty
              </label>
              <select
                value={formDifficulty}
                onChange={(e) => setFormDifficulty(e.target.value as PyqDifficulty)}
                className="w-full bg-[#f5f5f7] dark:bg-[#2c2c2e] border border-[#e5e5ea] dark:border-[#3a3a3c] text-[#1d1d1f] dark:text-[#f5f5f7] rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-[#0071e3] focus:outline-none"
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] mb-1">
              Question Statement *
            </label>
            <textarea
              value={formQuestion}
              onChange={(e) => setFormQuestion(e.target.value)}
              rows={3}
              placeholder="Paste or type question text..."
              className="w-full bg-[#f5f5f7] dark:bg-[#2c2c2e] border border-[#e5e5ea] dark:border-[#3a3a3c] text-[#1d1d1f] dark:text-[#f5f5f7] rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-[#0071e3] focus:outline-none font-sans"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] mb-1">
                Correct Answer / Key
              </label>
              <input
                type="text"
                placeholder="e.g. Option B or 4.5"
                value={formAnswer}
                onChange={(e) => setFormAnswer(e.target.value)}
                className="w-full bg-[#f5f5f7] dark:bg-[#2c2c2e] border border-[#e5e5ea] dark:border-[#3a3a3c] text-[#1d1d1f] dark:text-[#f5f5f7] rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-[#0071e3] focus:outline-none font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] mb-1">
                Initial Status
              </label>
              <select
                value={formStatus}
                onChange={(e) => setFormStatus(e.target.value as PyqStatus)}
                className="w-full bg-[#f5f5f7] dark:bg-[#2c2c2e] border border-[#e5e5ea] dark:border-[#3a3a3c] text-[#1d1d1f] dark:text-[#f5f5f7] rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-[#0071e3] focus:outline-none"
              >
                <option value="not_attempted">Not Attempted</option>
                <option value="correct">Correct</option>
                <option value="wrong">Wrong</option>
                <option value="skipped">Skipped</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] mb-1">
              Solution & Key Concepts
            </label>
            <textarea
              value={formExplanation}
              onChange={(e) => setFormExplanation(e.target.value)}
              rows={3}
              placeholder="Explain derivations, formulas, or pitfalls..."
              className="w-full bg-[#f5f5f7] dark:bg-[#2c2c2e] border border-[#e5e5ea] dark:border-[#3a3a3c] text-[#1d1d1f] dark:text-[#f5f5f7] rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-[#0071e3] focus:outline-none font-sans"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-[#e5e5ea] dark:border-[#333336]">
            <button
              type="button"
              onClick={() => setIsPyqModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-[#86868b] dark:text-[#a1a1a6] hover:bg-[#f5f5f7] dark:hover:bg-[#2c2c2e] rounded-full transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white dark:text-black bg-[#0071e3] hover:bg-[#0077ed] dark:bg-[#2997ff] dark:hover:bg-[#40a9ff] rounded-full shadow-xs transition-colors"
            >
              {editingPyqId ? 'Update Question' : 'Save Question'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

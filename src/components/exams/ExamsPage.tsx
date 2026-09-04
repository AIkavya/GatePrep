import React, { useState, useMemo } from 'react';
import {
  Award,
  Plus,
  Search,
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  AlertTriangle,
  Flame,
  TrendingUp,
  BarChart2,
  Trash2,
  Edit2,
  ArrowRight,
  Sparkles,
  Check,
  Target,
} from 'lucide-react';
import { useGate } from '../../context/GateContext';
import { Exam, ExamType, ExamStatus } from '../../types';
import { Modal } from '../common/Modal';
import {
  getTodayDateString,
  formatDateDisplay,
  getDaysInMonth,
  getFirstDayOfMonth,
} from '../../utils/dateUtils';

export const ExamsPage: React.FC = () => {
  const {
    exams,
    subjects,
    addExam,
    updateExam,
    deleteExam,
    setActiveTab,
  } = useGate();

  // View state: 'records' (cards list), 'calendar' (exam-specific calendar), 'topics' (weak & strong topics breakdown)
  const [activeView, setActiveView] = useState<'records' | 'calendar' | 'topics'>('records');

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterSubjectId, setFilterSubjectId] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('date_desc');

  // Calendar navigation state
  const today = getTodayDateString();
  const [calYear, setCalYear] = useState<number>(() => new Date().getFullYear());
  const [calMonth, setCalMonth] = useState<number>(() => new Date().getMonth()); // 0-indexed
  const [selectedCalDate, setSelectedCalDate] = useState<string>(today);

  // Modal & Form state
  const [isExamModalOpen, setIsExamModalOpen] = useState(false);
  const [editingExamId, setEditingExamId] = useState<string | null>(null);

  const [formTitle, setFormTitle] = useState('');
  const [formType, setFormType] = useState<ExamType>('full_length');
  const [formSubjectId, setFormSubjectId] = useState<string>('');
  const [formDate, setFormDate] = useState(today);
  const [formDuration, setFormDuration] = useState<number>(180);
  const [formTotalMarks, setFormTotalMarks] = useState<number>(100);
  const [formObtainedMarks, setFormObtainedMarks] = useState<number>(65);
  const [formStatus, setFormStatus] = useState<ExamStatus>('completed');
  const [formTimeTaken, setFormTimeTaken] = useState<number>(170);
  const [formTotalQuestions, setFormTotalQuestions] = useState<number>(65);
  const [formAttemptedQuestions, setFormAttemptedQuestions] = useState<number>(58);
  const [formCorrectQuestions, setFormCorrectQuestions] = useState<number>(50);
  const [formWrongQuestions, setFormWrongQuestions] = useState<number>(8);
  const [formNegativeMarks, setFormNegativeMarks] = useState<number>(5.33);
  const [formWeakTopics, setFormWeakTopics] = useState<string>('');
  const [formStrongTopics, setFormStrongTopics] = useState<string>('');
  const [formNotes, setFormNotes] = useState<string>('');

  // Open modal to add new exam
  const handleOpenAddExam = (prefilledDate?: string) => {
    setEditingExamId(null);
    setFormTitle('');
    setFormType('full_length');
    setFormSubjectId(subjects[0]?.id || '');
    setFormDate(prefilledDate || today);
    setFormDuration(180);
    setFormTotalMarks(100);
    setFormObtainedMarks(65);
    setFormStatus('completed');
    setFormTimeTaken(170);
    setFormTotalQuestions(65);
    setFormAttemptedQuestions(58);
    setFormCorrectQuestions(50);
    setFormWrongQuestions(8);
    setFormNegativeMarks(5.33);
    setFormWeakTopics('');
    setFormStrongTopics('');
    setFormNotes('');
    setIsExamModalOpen(true);
  };

  // Open modal to edit existing exam
  const handleOpenEditExam = (exam: Exam) => {
    setEditingExamId(exam.id);
    setFormTitle(exam.title);
    setFormType(exam.examType);
    setFormSubjectId(exam.subjectId || subjects[0]?.id || '');
    setFormDate(exam.date);
    setFormDuration(exam.durationMinutes);
    setFormTotalMarks(exam.totalMarks);
    setFormObtainedMarks(exam.obtainedMarks ?? 0);
    setFormStatus(exam.status);
    setFormTimeTaken(exam.timeTakenMinutes ?? exam.durationMinutes);
    setFormTotalQuestions(exam.totalQuestions ?? 65);
    setFormAttemptedQuestions(exam.attemptedQuestions ?? 0);
    setFormCorrectQuestions(exam.correctQuestions ?? 0);
    setFormWrongQuestions(exam.wrongQuestions ?? 0);
    setFormNegativeMarks(exam.negativeMarks ?? 0);
    setFormWeakTopics((exam.weakTopics || []).join(', '));
    setFormStrongTopics((exam.strongTopics || []).join(', '));
    setFormNotes(exam.notes || '');
    setIsExamModalOpen(true);
  };

  // Handle Type Change to adjust standard duration and total marks defaults
  const handleTypeChange = (newType: ExamType) => {
    setFormType(newType);
    if (newType === 'full_length') {
      setFormTotalMarks(100);
      setFormDuration(180);
      setFormTotalQuestions(65);
    } else if (newType === 'subject_test') {
      setFormTotalMarks(50);
      setFormDuration(60);
      setFormTotalQuestions(33);
    } else {
      setFormTotalMarks(25);
      setFormDuration(30);
      setFormTotalQuestions(15);
    }
  };

  // Live Auto-Calculations
  const livePercentage =
    formTotalMarks > 0 ? ((formObtainedMarks / formTotalMarks) * 100).toFixed(1) : '0';
  const liveAccuracy =
    formAttemptedQuestions > 0
      ? ((formCorrectQuestions / formAttemptedQuestions) * 100).toFixed(1)
      : null;

  // Save Exam Record
  const handleSaveExam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) return;

    const parsedWeakTopics = formWeakTopics
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);
    const parsedStrongTopics = formStrongTopics
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const calculatedPercentage =
      formTotalMarks > 0 ? Number(((formObtainedMarks / formTotalMarks) * 100).toFixed(2)) : 0;
    const calculatedAccuracy =
      formAttemptedQuestions > 0
        ? Number(((formCorrectQuestions / formAttemptedQuestions) * 100).toFixed(2))
        : undefined;

    const examPayload = {
      title: formTitle.trim(),
      examType: formType,
      subjectId: formType === 'full_length' ? undefined : (formSubjectId as any) || undefined,
      date: formDate,
      durationMinutes: Number(formDuration),
      totalMarks: Number(formTotalMarks),
      obtainedMarks: formStatus === 'completed' ? Number(formObtainedMarks) : 0,
      percentage: formStatus === 'completed' ? calculatedPercentage : undefined,
      accuracy: formStatus === 'completed' ? calculatedAccuracy : undefined,
      status: formStatus,
      timeTakenMinutes: formStatus === 'completed' && formTimeTaken ? Number(formTimeTaken) : undefined,
      totalQuestions: formTotalQuestions ? Number(formTotalQuestions) : undefined,
      attemptedQuestions: formAttemptedQuestions ? Number(formAttemptedQuestions) : undefined,
      correctQuestions: formCorrectQuestions ? Number(formCorrectQuestions) : undefined,
      wrongQuestions: formWrongQuestions ? Number(formWrongQuestions) : undefined,
      negativeMarks: formNegativeMarks ? Number(formNegativeMarks) : undefined,
      weakTopics: parsedWeakTopics,
      strongTopics: parsedStrongTopics,
      notes: formNotes.trim(),
    };

    if (editingExamId) {
      updateExam(editingExamId, examPayload);
    } else {
      addExam(examPayload);
    }

    setIsExamModalOpen(false);
  };

  // Filter & Sort Logic
  const filteredExams = useMemo(() => {
    return exams
      .filter((exam) => {
        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchesTitle = exam.title.toLowerCase().includes(q);
          const subName =
            subjects.find((s) => s.id === exam.subjectId)?.name.toLowerCase() || '';
          const matchesSubject = subName.includes(q);
          const matchesWeak = (exam.weakTopics || []).some((t) => t.toLowerCase().includes(q));
          const matchesStrong = (exam.strongTopics || []).some((t) => t.toLowerCase().includes(q));
          const matchesNotes = (exam.notes || '').toLowerCase().includes(q);
          if (!matchesTitle && !matchesSubject && !matchesWeak && !matchesStrong && !matchesNotes) {
            return false;
          }
        }

        // Filter Type
        if (filterType !== 'all' && exam.examType !== filterType) {
          return false;
        }

        // Filter Subject
        if (filterSubjectId !== 'all' && exam.subjectId !== filterSubjectId) {
          return false;
        }

        // Filter Status
        if (filterStatus !== 'all' && exam.status !== filterStatus) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'date_desc') return b.date.localeCompare(a.date);
        if (sortBy === 'date_asc') return a.date.localeCompare(b.date);
        if (sortBy === 'score_desc') return (b.obtainedMarks ?? 0) - (a.obtainedMarks ?? 0);
        if (sortBy === 'score_asc') return (a.obtainedMarks ?? 0) - (b.obtainedMarks ?? 0);
        if (sortBy === 'accuracy_desc') return (b.accuracy ?? 0) - (a.accuracy ?? 0);
        return 0;
      });
  }, [exams, searchQuery, filterType, filterSubjectId, filterStatus, sortBy, subjects]);

  // High-level Metrics Calculation
  const completedExams = useMemo(() => exams.filter((e) => e.status === 'completed'), [exams]);
  const scheduledExams = useMemo(() => exams.filter((e) => e.status === 'scheduled'), [exams]);
  const fullLengthExams = useMemo(
    () => completedExams.filter((e) => e.examType === 'full_length'),
    [completedExams]
  );
  const subjectExams = useMemo(
    () => completedExams.filter((e) => e.examType === 'subject_test'),
    [completedExams]
  );

  const avgPercentage = useMemo(() => {
    if (completedExams.length === 0) return 0;
    const sum = completedExams.reduce((acc, e) => {
      const p = e.percentage ?? (e.totalMarks > 0 ? (e.obtainedMarks / e.totalMarks) * 100 : 0);
      return acc + p;
    }, 0);
    return Math.round(sum / completedExams.length);
  }, [completedExams]);

  const avgAccuracy = useMemo(() => {
    const withAccuracy = completedExams.filter((e) => e.accuracy !== undefined);
    if (withAccuracy.length === 0) return 0;
    const sum = withAccuracy.reduce((acc, e) => acc + (e.accuracy ?? 0), 0);
    return Math.round(sum / withAccuracy.length);
  }, [completedExams]);

  const highestScore = useMemo(() => {
    if (fullLengthExams.length === 0) return completedExams[0]?.obtainedMarks ?? 0;
    return Math.max(...fullLengthExams.map((e) => e.obtainedMarks ?? 0));
  }, [fullLengthExams, completedExams]);

  // Aggregate Weak and Strong Topics across all exams
  const topicAnalytics = useMemo(() => {
    const weakMap: Record<string, { count: number; examTitles: string[] }> = {};
    const strongMap: Record<string, { count: number; examTitles: string[] }> = {};

    completedExams.forEach((exam) => {
      (exam.weakTopics || []).forEach((topic) => {
        const key = topic.trim();
        if (!key) return;
        if (!weakMap[key]) weakMap[key] = { count: 0, examTitles: [] };
        weakMap[key].count += 1;
        weakMap[key].examTitles.push(exam.title);
      });

      (exam.strongTopics || []).forEach((topic) => {
        const key = topic.trim();
        if (!key) return;
        if (!strongMap[key]) strongMap[key] = { count: 0, examTitles: [] };
        strongMap[key].count += 1;
        strongMap[key].examTitles.push(exam.title);
      });
    });

    const sortedWeak = Object.entries(weakMap).sort((a, b) => b[1].count - a[1].count);
    const sortedStrong = Object.entries(strongMap).sort((a, b) => b[1].count - a[1].count);

    return { weak: sortedWeak, strong: sortedStrong };
  }, [completedExams]);

  // Calendar view helper computations
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const daysInMonth = getDaysInMonth(calYear, calMonth);
  const firstDay = getFirstDayOfMonth(calYear, calMonth);

  const prevMonth = () => {
    if (calMonth === 0) {
      setCalMonth(11);
      setCalYear(calYear - 1);
    } else {
      setCalMonth(calMonth - 1);
    }
  };

  const nextMonth = () => {
    if (calMonth === 11) {
      setCalMonth(0);
      setCalYear(calYear + 1);
    } else {
      setCalMonth(calMonth + 1);
    }
  };

  const jumpToToday = () => {
    const d = new Date();
    setCalYear(d.getFullYear());
    setCalMonth(d.getMonth());
    setSelectedCalDate(today);
  };

  // Selected date exams in Calendar view
  const selectedDateExams = useMemo(() => {
    return exams.filter((e) => e.date === selectedCalDate);
  }, [exams, selectedCalDate]);

  return (
    <div className="space-y-6 pb-16">
      {/* Top Banner & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#161617] p-5 rounded-2xl border border-[#e5e5ea] dark:border-[#333336] shadow-2xs transition-colors">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-[#1d1d1f] dark:text-[#f5f5f7] tracking-tight">GATE Exams &amp; Mock Tests</h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full font-medium bg-blue-50 dark:bg-blue-950/40 text-[#0071e3] dark:text-[#2997ff] border border-blue-200/80 dark:border-blue-800/60 flex items-center gap-1">
              <Award className="w-3.5 h-3.5" />
              {exams.length} Records
            </span>
          </div>
          <p className="text-xs text-[#86868b] dark:text-[#a1a1a6] mt-1">
            Track full length mock tests, subject tests, accuracy, automatic percentage calculations, and weak topic diagnostics.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            id="btn-add-exam"
            onClick={() => handleOpenAddExam()}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#0071e3] hover:bg-[#0077ed] dark:bg-[#2997ff] dark:hover:bg-[#40a9ff] text-white dark:text-black text-xs font-semibold rounded-full transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Add Exam Data</span>
          </button>
        </div>
      </div>

      {/* KPI Performance Highlights */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-[#161617] p-4 rounded-2xl border border-[#e5e5ea] dark:border-[#333336] shadow-2xs transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#86868b] dark:text-[#a1a1a6]">Tests Attempted</span>
            <span className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-950/50 text-[#0071e3] dark:text-[#2997ff] flex items-center justify-center">
              <Award className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-[#1d1d1f] dark:text-[#f5f5f7]">{completedExams.length}</span>
            <span className="text-xs text-[#86868b] dark:text-[#a1a1a6] font-medium">({scheduledExams.length} scheduled)</span>
          </div>
          <div className="text-[11px] text-[#86868b] dark:text-[#a1a1a6] mt-1 flex items-center gap-1">
            <span>{fullLengthExams.length} Full Length</span>
            <span>•</span>
            <span>{subjectExams.length} Subject Tests</span>
          </div>
        </div>

        <div className="bg-white dark:bg-[#161617] p-4 rounded-2xl border border-[#e5e5ea] dark:border-[#333336] shadow-2xs transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#86868b] dark:text-[#a1a1a6]">Avg. Score %</span>
            <span className="w-8 h-8 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-[#1d1d1f] dark:text-[#f5f5f7]">{avgPercentage}%</span>
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold font-mono">Calculated</span>
          </div>
          <div className="text-[11px] text-[#86868b] dark:text-[#a1a1a6] mt-1">
            Across all attempted mock examinations
          </div>
        </div>

        <div className="bg-white dark:bg-[#161617] p-4 rounded-2xl border border-[#e5e5ea] dark:border-[#333336] shadow-2xs transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#86868b] dark:text-[#a1a1a6]">Avg. Accuracy</span>
            <span className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-950/50 text-[#0071e3] dark:text-[#2997ff] flex items-center justify-center">
              <Target className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-[#1d1d1f] dark:text-[#f5f5f7]">{avgAccuracy > 0 ? `${avgAccuracy}%` : 'N/A'}</span>
            <span className="text-xs text-[#0071e3] dark:text-[#2997ff] font-semibold font-mono">Hit Ratio</span>
          </div>
          <div className="text-[11px] text-[#86868b] dark:text-[#a1a1a6] mt-1">
            Correct / Attempted question precision
          </div>
        </div>

        <div className="bg-white dark:bg-[#161617] p-4 rounded-2xl border border-[#e5e5ea] dark:border-[#333336] shadow-2xs transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#86868b] dark:text-[#a1a1a6]">Highest FLT Score</span>
            <span className="w-8 h-8 rounded-full bg-amber-50 dark:bg-amber-950/50 text-[#ff9500] flex items-center justify-center">
              <Flame className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-[#1d1d1f] dark:text-[#f5f5f7]">{highestScore}</span>
            <span className="text-xs text-[#86868b] dark:text-[#a1a1a6] font-medium">/ 100</span>
          </div>
          <div className="text-[11px] text-[#ff9500] font-semibold mt-1">
            Full Length Mock Benchmark
          </div>
        </div>
      </div>

      {/* Main View Mode Selector (Apple Pill Switcher) */}
      <div className="inline-flex p-1 bg-[#f5f5f7] dark:bg-[#1d1d1f] rounded-full border border-[#e5e5ea] dark:border-[#333336]">
        <button
          id="tab-view-records"
          onClick={() => setActiveView('records')}
          className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
            activeView === 'records'
              ? 'bg-white dark:bg-[#2c2c2e] text-[#1d1d1f] dark:text-[#f5f5f7] shadow-xs'
              : 'text-[#86868b] dark:text-[#a1a1a6] hover:text-[#1d1d1f] dark:hover:text-[#f5f5f7]'
          }`}
        >
          <BarChart2 className="w-3.5 h-3.5" />
          <span>Test Records &amp; Analysis</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-[#e5e5ea] dark:bg-[#3a3a3c] text-[#1d1d1f] dark:text-[#f5f5f7]">
            {filteredExams.length}
          </span>
        </button>

        <button
          id="tab-view-calendar"
          onClick={() => setActiveView('calendar')}
          className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
            activeView === 'calendar'
              ? 'bg-white dark:bg-[#2c2c2e] text-[#1d1d1f] dark:text-[#f5f5f7] shadow-xs'
              : 'text-[#86868b] dark:text-[#a1a1a6] hover:text-[#1d1d1f] dark:hover:text-[#f5f5f7]'
          }`}
        >
          <CalendarIcon className="w-3.5 h-3.5" />
          <span>Exam Calendar</span>
        </button>

        <button
          id="tab-view-topics"
          onClick={() => setActiveView('topics')}
          className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
            activeView === 'topics'
              ? 'bg-white dark:bg-[#2c2c2e] text-[#1d1d1f] dark:text-[#f5f5f7] shadow-xs'
              : 'text-[#86868b] dark:text-[#a1a1a6] hover:text-[#1d1d1f] dark:hover:text-[#f5f5f7]'
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5 text-[#ff3b30] dark:text-[#ff453a]" />
          <span>Weak &amp; Strong Topics</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-red-100 dark:bg-red-950/60 text-[#ff3b30] dark:text-[#ff453a] font-bold">
            {topicAnalytics.weak.length}
          </span>
        </button>
      </div>

      {/* VIEW 1: TEST RECORDS & ANALYSIS (CARDS / LIST VIEW) */}
      {activeView === 'records' && (
        <div className="space-y-4">
          {/* Search and Filters Bar */}
          <div className="bg-white dark:bg-[#161617] p-4 rounded-2xl border border-[#e5e5ea] dark:border-[#333336] flex flex-wrap items-center justify-between gap-3 shadow-2xs">
            {/* Search Input */}
            <div className="relative flex-1 min-w-[240px]">
              <Search className="w-4 h-4 text-[#86868b] dark:text-[#a1a1a6] absolute left-3 top-2.5" />
              <input
                type="text"
                id="search-exams-input"
                placeholder="Search exam title, subject, weak/strong topics, or notes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-1.5 bg-[#f5f5f7] dark:bg-[#2c2c2e] border border-[#e5e5ea] dark:border-[#3a3a3c] text-[#1d1d1f] dark:text-[#f5f5f7] rounded-xl text-xs focus:ring-2 focus:ring-[#0071e3] focus:outline-none"
              />
            </div>

            {/* Filter by Exam Type */}
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-[#86868b] dark:text-[#a1a1a6] font-medium">Type:</span>
              <select
                id="filter-exam-type"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="border border-[#e5e5ea] dark:border-[#3a3a3c] rounded-xl px-2.5 py-1 text-xs text-[#1d1d1f] dark:text-[#f5f5f7] bg-[#f5f5f7] dark:bg-[#2c2c2e] focus:outline-none focus:ring-2 focus:ring-[#0071e3]"
              >
                <option value="all">All Types</option>
                <option value="full_length">Full Length Mock (FLT)</option>
                <option value="subject_test">Subject Test</option>
                <option value="topic_test">Topic Test</option>
              </select>
            </div>

            {/* Filter by Subject */}
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-[#86868b] dark:text-[#a1a1a6] font-medium">Subject:</span>
              <select
                id="filter-exam-subject"
                value={filterSubjectId}
                onChange={(e) => setFilterSubjectId(e.target.value)}
                className="border border-[#e5e5ea] dark:border-[#3a3a3c] rounded-xl px-2.5 py-1 text-xs text-[#1d1d1f] dark:text-[#f5f5f7] bg-[#f5f5f7] dark:bg-[#2c2c2e] focus:outline-none focus:ring-2 focus:ring-[#0071e3] max-w-[150px] truncate"
              >
                <option value="all">All Subjects</option>
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.code} - {s.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Filter by Status */}
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-[#86868b] dark:text-[#a1a1a6] font-medium">Status:</span>
              <select
                id="filter-exam-status"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="border border-[#e5e5ea] dark:border-[#3a3a3c] rounded-xl px-2.5 py-1 text-xs text-[#1d1d1f] dark:text-[#f5f5f7] bg-[#f5f5f7] dark:bg-[#2c2c2e] focus:outline-none focus:ring-2 focus:ring-[#0071e3]"
              >
                <option value="all">All</option>
                <option value="completed">Completed</option>
                <option value="scheduled">Scheduled</option>
              </select>
            </div>

            {/* Sort Order */}
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-[#86868b] dark:text-[#a1a1a6] font-medium">Sort:</span>
              <select
                id="sort-exams-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="border border-[#e5e5ea] dark:border-[#3a3a3c] rounded-xl px-2.5 py-1 text-xs text-[#1d1d1f] dark:text-[#f5f5f7] bg-[#f5f5f7] dark:bg-[#2c2c2e] focus:outline-none focus:ring-2 focus:ring-[#0071e3]"
              >
                <option value="date_desc">Newest Date</option>
                <option value="date_asc">Oldest Date</option>
                <option value="score_desc">Highest Marks</option>
                <option value="score_asc">Lowest Marks</option>
                <option value="accuracy_desc">Highest Accuracy</option>
              </select>
            </div>
          </div>

          {/* Exam Cards Grid */}
          {filteredExams.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredExams.map((exam) => {
                const sub = subjects.find((s) => s.id === exam.subjectId);
                const isCompleted = exam.status === 'completed';
                const pct =
                  exam.percentage ??
                  (exam.totalMarks > 0 ? Math.round((exam.obtainedMarks / exam.totalMarks) * 100) : 0);

                // Color based on performance
                const scoreBadgeBg =
                  pct >= 70
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200/80 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800/60'
                    : pct >= 55
                    ? 'bg-blue-50 text-[#0071e3] border-blue-200/80 dark:bg-blue-950/40 dark:text-[#2997ff] dark:border-blue-800/60'
                    : pct >= 40
                    ? 'bg-amber-50 text-amber-700 border-amber-200/80 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800/60'
                    : 'bg-red-50 text-[#ff3b30] border-red-200/80 dark:bg-red-950/40 dark:text-[#ff453a] dark:border-red-800/60';

                return (
                  <div
                    key={exam.id}
                    id={`exam-card-${exam.id}`}
                    className="bg-white dark:bg-[#161617] rounded-2xl border border-[#e5e5ea] dark:border-[#333336] p-5 shadow-2xs flex flex-col justify-between hover:border-[#d2d2d7] dark:hover:border-[#424245] transition-all space-y-4"
                  >
                    <div>
                      {/* Top Header Row */}
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <span
                              className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full tracking-wider ${
                                exam.examType === 'full_length'
                                  ? 'bg-purple-100 dark:bg-purple-950/50 text-purple-800 dark:text-purple-300'
                                  : exam.examType === 'subject_test'
                                  ? 'bg-blue-100 dark:bg-blue-950/50 text-[#0071e3] dark:text-[#2997ff]'
                                  : 'bg-teal-100 dark:bg-teal-950/50 text-teal-800 dark:text-teal-300'
                              }`}
                            >
                              {exam.examType === 'full_length'
                                ? 'Full Length Mock (FLT)'
                                : exam.examType === 'subject_test'
                                ? 'Subject Test'
                                : 'Topic Test'}
                            </span>

                            {sub && (
                              <span
                                className="text-[10px] font-bold px-2.5 py-0.5 rounded-full text-white"
                                style={{ backgroundColor: sub.color || '#0071e3' }}
                              >
                                {sub.code || sub.name}
                              </span>
                            )}

                            <span
                              className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                                isCompleted
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200/80 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800/60'
                                  : 'bg-[#f5f5f7] text-[#86868b] border-[#e5e5ea] dark:bg-[#2c2c2e] dark:text-[#a1a1a6] dark:border-[#3a3a3c]'
                              }`}
                            >
                              {isCompleted ? 'Completed' : 'Scheduled'}
                            </span>
                          </div>

                          <h3 className="text-base font-bold text-[#1d1d1f] dark:text-[#f5f5f7] leading-snug">
                            {exam.title}
                          </h3>

                          <div className="flex items-center gap-3 text-xs text-[#86868b] dark:text-[#a1a1a6] mt-1">
                            <span className="flex items-center gap-1">
                              <CalendarIcon className="w-3.5 h-3.5 text-[#86868b] dark:text-[#a1a1a6]" />
                              {formatDateDisplay(exam.date)}
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5 text-[#86868b] dark:text-[#a1a1a6]" />
                              {exam.durationMinutes} mins
                              {exam.timeTakenMinutes && ` (took ${exam.timeTakenMinutes}m)`}
                            </span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1">
                          <button
                            id={`btn-edit-exam-${exam.id}`}
                            onClick={() => handleOpenEditExam(exam)}
                            className="p-1.5 text-[#86868b] hover:text-[#1d1d1f] dark:hover:text-[#f5f5f7] hover:bg-[#f5f5f7] dark:hover:bg-[#2c2c2e] rounded-full transition-colors"
                            title="Edit Exam Data"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            id={`btn-delete-exam-${exam.id}`}
                            onClick={() => {
                              if (window.confirm(`Delete record "${exam.title}"?`)) {
                                deleteExam(exam.id);
                              }
                            }}
                            className="p-1.5 text-[#86868b] hover:text-[#ff3b30] dark:hover:text-[#ff453a] hover:bg-red-50 dark:hover:bg-red-950/40 rounded-full transition-colors"
                            title="Delete Exam Data"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Marks and Score Breakdown Banner */}
                      {isCompleted ? (
                        <div className="mt-4 p-3.5 rounded-xl bg-[#f5f5f7] dark:bg-[#1d1d1f] border border-[#e5e5ea] dark:border-[#333336] flex flex-wrap items-center justify-between gap-3">
                          <div>
                            <span className="text-[10px] text-[#86868b] dark:text-[#a1a1a6] font-semibold uppercase tracking-wider block">
                              Marks Obtained
                            </span>
                            <div className="flex items-baseline gap-1.5 mt-0.5">
                              <span className="text-xl font-extrabold text-[#1d1d1f] dark:text-[#f5f5f7] font-mono">
                                {exam.obtainedMarks}
                              </span>
                              <span className="text-xs text-[#86868b] dark:text-[#a1a1a6] font-medium">
                                / {exam.totalMarks}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {/* Percentage Pill */}
                            <div className={`px-3 py-1 rounded-xl border font-bold text-xs ${scoreBadgeBg}`}>
                              <span className="text-[10px] block opacity-80 uppercase tracking-tight">Score</span>
                              <span>{pct}%</span>
                            </div>

                            {/* Accuracy Pill */}
                            {exam.accuracy !== undefined && (
                              <div className="px-3 py-1 rounded-xl border bg-blue-50 text-[#0071e3] border-blue-200/80 dark:bg-blue-950/40 dark:text-[#2997ff] dark:border-blue-800/60 font-bold text-xs">
                                <span className="text-[10px] block opacity-80 uppercase tracking-tight">Accuracy</span>
                                <span>{exam.accuracy}%</span>
                              </div>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="mt-4 p-3.5 rounded-xl bg-amber-50/50 dark:bg-amber-950/30 border border-amber-200/70 dark:border-amber-900/50 text-amber-800 dark:text-amber-300 text-xs flex items-center justify-between">
                          <span>Test scheduled on {formatDateDisplay(exam.date)}</span>
                          <button
                            onClick={() => handleOpenEditExam(exam)}
                            className="px-3 py-1 bg-[#ff9500] hover:bg-amber-600 text-white font-semibold rounded-full text-xs transition-colors"
                          >
                            Enter Marks Scored
                          </button>
                        </div>
                      )}

                      {/* Detailed Question breakdown chips if available */}
                      {isCompleted && exam.totalQuestions !== undefined && (
                        <div className="flex flex-wrap items-center gap-2 mt-3 text-[11px] text-[#1d1d1f] dark:text-[#f5f5f7]">
                          <span className="px-2.5 py-0.5 bg-[#f5f5f7] dark:bg-[#2c2c2e] rounded-full border border-[#e5e5ea] dark:border-[#3a3a3c]">
                            Attempted: <strong>{exam.attemptedQuestions ?? '-'}</strong>/{exam.totalQuestions}
                          </span>
                          <span className="px-2.5 py-0.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 rounded-full font-medium border border-emerald-200/80 dark:border-emerald-800/60">
                            Correct: <strong>{exam.correctQuestions ?? '-'}</strong>
                          </span>
                          <span className="px-2.5 py-0.5 bg-red-50 dark:bg-red-950/40 text-[#ff3b30] dark:text-[#ff453a] rounded-full font-medium border border-red-200/80 dark:border-red-800/60">
                            Wrong: <strong>{exam.wrongQuestions ?? '-'}</strong>
                          </span>
                          {exam.negativeMarks !== undefined && exam.negativeMarks > 0 && (
                            <span className="px-2.5 py-0.5 bg-red-100 dark:bg-red-950/60 text-red-800 dark:text-red-300 rounded-full font-semibold">
                              Negative: -{exam.negativeMarks}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Strong Topics */}
                      {exam.strongTopics && exam.strongTopics.length > 0 && (
                        <div className="mt-3">
                          <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1 uppercase tracking-wider mb-1">
                            <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                            Strong Topics Mastered:
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {exam.strongTopics.map((topic, idx) => (
                              <span
                                key={idx}
                                className="px-2.5 py-0.5 text-[11px] bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 font-medium rounded-full border border-emerald-200/70 dark:border-emerald-800/60"
                              >
                                {topic}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Weak Topics */}
                      {exam.weakTopics && exam.weakTopics.length > 0 && (
                        <div className="mt-3">
                          <span className="text-[10px] font-bold text-[#ff3b30] dark:text-[#ff453a] flex items-center gap-1 uppercase tracking-wider mb-1">
                            <AlertTriangle className="w-3 h-3 text-[#ff3b30] dark:text-[#ff453a]" />
                            Weak Topics / Lost Marks:
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {exam.weakTopics.map((topic, idx) => (
                              <span
                                key={idx}
                                className="px-2.5 py-0.5 text-[11px] bg-red-50 dark:bg-red-950/40 text-[#ff3b30] dark:text-[#ff453a] font-medium rounded-full border border-red-200/70 dark:border-red-800/60"
                              >
                                {topic}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Observations / Notes */}
                      {exam.notes && (
                        <div className="mt-3 text-xs text-[#86868b] dark:text-[#a1a1a6] bg-[#f5f5f7] dark:bg-[#1d1d1f] p-3 rounded-xl border border-[#e5e5ea] dark:border-[#333336] italic">
                          &quot;{exam.notes}&quot;
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 bg-white dark:bg-[#161617] rounded-2xl border border-[#e5e5ea] dark:border-[#333336] p-6 space-y-3">
              <Award className="w-10 h-10 text-[#86868b] dark:text-[#a1a1a6] mx-auto opacity-50" />
              <h3 className="text-sm font-bold text-[#1d1d1f] dark:text-[#f5f5f7]">No Exams Match Your Filters</h3>
              <p className="text-xs text-[#86868b] dark:text-[#a1a1a6] max-w-sm mx-auto">
                Try clearing your search query or adjusting the type and subject filter criteria.
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setFilterType('all');
                  setFilterSubjectId('all');
                  setFilterStatus('all');
                }}
                className="px-4 py-1.5 text-xs font-semibold text-[#0071e3] dark:text-[#2997ff] hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded-full transition-colors"
              >
                Reset Filters
              </button>
            </div>
          )}
        </div>
      )}

      {/* VIEW 2: EXAM-SPECIFIC CALENDAR VIEW */}
      {activeView === 'calendar' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-[#161617] p-5 rounded-2xl border border-[#e5e5ea] dark:border-[#333336] shadow-2xs">
            {/* Calendar Controls */}
            <div className="flex items-center justify-between gap-4 mb-5">
              <div className="flex items-center gap-2">
                <button
                  id="btn-exam-cal-prev"
                  onClick={prevMonth}
                  className="p-1.5 text-[#86868b] dark:text-[#a1a1a6] hover:bg-[#f5f5f7] dark:hover:bg-[#2c2c2e] rounded-full transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <h2 className="text-base font-bold text-[#1d1d1f] dark:text-[#f5f5f7] w-44 text-center">
                  {monthNames[calMonth]} {calYear}
                </h2>
                <button
                  id="btn-exam-cal-next"
                  onClick={nextMonth}
                  className="p-1.5 text-[#86868b] dark:text-[#a1a1a6] hover:bg-[#f5f5f7] dark:hover:bg-[#2c2c2e] rounded-full transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={jumpToToday}
                  className="px-3.5 py-1.5 text-xs font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] bg-[#f5f5f7] dark:bg-[#2c2c2e] hover:bg-[#e5e5ea] dark:hover:bg-[#3a3a3c] rounded-full border border-[#e5e5ea] dark:border-[#3a3a3c] transition-colors"
                >
                  Today
                </button>
                <button
                  onClick={() => handleOpenAddExam(selectedCalDate)}
                  className="px-4 py-1.5 text-xs font-semibold text-white dark:text-black bg-[#0071e3] hover:bg-[#0077ed] dark:bg-[#2997ff] dark:hover:bg-[#40a9ff] rounded-full flex items-center gap-1 shadow-xs transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Schedule Test on Date</span>
                </button>
              </div>
            </div>

            {/* Calendar Day-of-Week Headers */}
            <div className="grid grid-cols-7 text-center font-bold text-[#86868b] dark:text-[#a1a1a6] text-xs mb-2">
              <span>Sun</span>
              <span>Mon</span>
              <span>Tue</span>
              <span>Wed</span>
              <span>Thu</span>
              <span>Fri</span>
              <span>Sat</span>
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1 sm:gap-2">
              {/* Empty leading days */}
              {Array.from({ length: firstDay }).map((_, i) => (
                <div key={`empty-${i}`} className="h-20 sm:h-24 bg-[#f5f5f7]/40 dark:bg-[#1d1d1f]/40 rounded-xl border border-transparent" />
              ))}

              {/* Month days */}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const dayNum = i + 1;
                const mStr = String(calMonth + 1).padStart(2, '0');
                const dStr = String(dayNum).padStart(2, '0');
                const dateKey = `${calYear}-${mStr}-${dStr}`;

                const dayExams = exams.filter((e) => e.date === dateKey);
                const isToday = dateKey === today;
                const isSelected = dateKey === selectedCalDate;

                return (
                  <div
                    key={dateKey}
                    onClick={() => setSelectedCalDate(dateKey)}
                    className={`h-20 sm:h-24 p-1.5 sm:p-2 rounded-xl border flex flex-col justify-between transition-all cursor-pointer ${
                      isSelected
                        ? 'border-[#0071e3] dark:border-[#2997ff] ring-2 ring-[#0071e3]/20 dark:ring-[#2997ff]/20 bg-blue-50/30 dark:bg-blue-950/20'
                        : isToday
                        ? 'border-blue-300 dark:border-blue-700 bg-[#f5f5f7] dark:bg-[#1d1d1f]'
                        : 'border-[#e5e5ea] dark:border-[#333336] bg-white dark:bg-[#161617] hover:border-[#d2d2d7] dark:hover:border-[#424245]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-xs font-bold leading-none ${
                          isToday ? 'text-[#0071e3] dark:text-[#2997ff]' : 'text-[#1d1d1f] dark:text-[#f5f5f7]'
                        }`}
                      >
                        {dayNum}
                      </span>
                      {dayExams.length > 0 && (
                        <span className="w-2 h-2 rounded-full bg-[#0071e3] dark:bg-[#2997ff] shrink-0" />
                      )}
                    </div>

                    {/* Day Exam Badges */}
                    <div className="space-y-1 overflow-y-auto max-h-12 sm:max-h-14 mt-1">
                      {dayExams.map((ex) => (
                        <div
                          key={ex.id}
                          className={`text-[9px] sm:text-[10px] px-1.5 py-0.5 rounded-full truncate font-medium ${
                            ex.examType === 'full_length'
                              ? 'bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300'
                              : 'bg-blue-100 dark:bg-blue-950/60 text-[#0071e3] dark:text-[#2997ff]'
                          }`}
                          title={`${ex.title} - ${ex.status === 'completed' ? `${ex.obtainedMarks}/${ex.totalMarks}` : 'Scheduled'}`}
                        >
                          {ex.title}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Selected Date Details Panel */}
          <div className="bg-white dark:bg-[#161617] p-5 rounded-2xl border border-[#e5e5ea] dark:border-[#333336] shadow-2xs">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#e5e5ea] dark:border-[#333336]">
              <div className="flex items-center gap-2">
                <CalendarIcon className="w-4 h-4 text-[#0071e3] dark:text-[#2997ff]" />
                <h3 className="text-sm font-bold text-[#1d1d1f] dark:text-[#f5f5f7]">
                  Exams on {formatDateDisplay(selectedCalDate)}
                </h3>
              </div>
              <button
                onClick={() => handleOpenAddExam(selectedCalDate)}
                className="text-xs font-semibold text-[#0071e3] dark:text-[#2997ff] hover:opacity-80 flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Test on this Date</span>
              </button>
            </div>

            {selectedDateExams.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {selectedDateExams.map((ex) => (
                  <div
                    key={ex.id}
                    className="p-3.5 bg-[#f5f5f7] dark:bg-[#1d1d1f] rounded-xl border border-[#e5e5ea] dark:border-[#333336] flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-[#e5e5ea] dark:bg-[#2c2c2e] text-[#1d1d1f] dark:text-[#f5f5f7]">
                          {ex.examType === 'full_length' ? 'FLT' : 'Subject'}
                        </span>
                        <span className="font-bold text-xs text-[#1d1d1f] dark:text-[#f5f5f7]">{ex.title}</span>
                      </div>
                      <div className="text-[11px] text-[#86868b] dark:text-[#a1a1a6] mt-1">
                        {ex.status === 'completed' ? (
                          <span className="font-semibold text-emerald-700 dark:text-emerald-400">
                            Score: {ex.obtainedMarks}/{ex.totalMarks} ({ex.percentage}%) • {ex.durationMinutes}m
                          </span>
                        ) : (
                          <span className="text-[#ff9500] font-medium">Scheduled test</span>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => handleOpenEditExam(ex)}
                      className="px-3 py-1 bg-white dark:bg-[#2c2c2e] hover:bg-[#e5e5ea] dark:hover:bg-[#3a3a3c] text-[#1d1d1f] dark:text-[#f5f5f7] text-xs font-semibold rounded-full border border-[#e5e5ea] dark:border-[#3a3a3c] transition-colors"
                    >
                      Edit
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-[#86868b] dark:text-[#a1a1a6] py-3 text-center">
                No mock tests or exams logged on this date. Click &quot;Schedule Test on Date&quot; to add one.
              </p>
            )}
          </div>
        </div>
      )}

      {/* VIEW 3: WEAK & STRONG TOPICS ANALYSIS */}
      {activeView === 'topics' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Weak Topics Card */}
          <div className="bg-white dark:bg-[#161617] p-5 rounded-2xl border border-red-200/80 dark:border-red-900/50 shadow-2xs">
            <div className="flex items-center justify-between pb-3 border-b border-red-100 dark:border-red-900/40 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-950 text-[#ff3b30] dark:text-[#ff453a] flex items-center justify-center font-bold">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#1d1d1f] dark:text-[#f5f5f7]">
                    Weak Topics Diagnostic
                  </h3>
                  <p className="text-[11px] text-[#86868b] dark:text-[#a1a1a6]">
                    Topics where questions were missed or negative marks were incurred
                  </p>
                </div>
              </div>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-red-50 text-[#ff3b30] dark:bg-red-950/40 dark:text-[#ff453a] border border-red-200/70 dark:border-red-800/60">
                {topicAnalytics.weak.length} Topics
              </span>
            </div>

            {topicAnalytics.weak.length > 0 ? (
              <div className="space-y-2.5">
                {topicAnalytics.weak.map(([topic, data]) => (
                  <div
                    key={topic}
                    className="p-3 rounded-xl bg-red-50/30 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 flex items-center justify-between"
                  >
                    <div>
                      <span className="text-xs font-bold text-[#1d1d1f] dark:text-[#f5f5f7] block">{topic}</span>
                      <span className="text-[10px] text-[#86868b] dark:text-[#a1a1a6]">
                        Appeared in: {data.examTitles.slice(0, 2).join(', ')}
                        {data.examTitles.length > 2 && ` +${data.examTitles.length - 2} more`}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-[#ff3b30] dark:text-[#ff453a] font-mono bg-red-100 dark:bg-red-950/60 px-2.5 py-0.5 rounded-full">
                        {data.count} {data.count === 1 ? 'test' : 'tests'}
                      </span>
                      <button
                        onClick={() => {
                          setActiveTab('revision');
                        }}
                        className="p-1.5 text-[#86868b] hover:text-[#0071e3] dark:hover:text-[#2997ff] hover:bg-white dark:hover:bg-[#2c2c2e] rounded-full transition-colors"
                        title="Go to Revision to schedule this topic"
                      >
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-[#86868b] dark:text-[#a1a1a6] text-xs">
                No weak topics logged yet. Add exam data with weak topics to see diagnostics.
              </div>
            )}
          </div>

          {/* Strong Topics Card */}
          <div className="bg-white dark:bg-[#161617] p-5 rounded-2xl border border-emerald-200/80 dark:border-emerald-900/50 shadow-2xs">
            <div className="flex items-center justify-between pb-3 border-b border-emerald-100 dark:border-emerald-900/40 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 flex items-center justify-center font-bold">
                  <Check className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#1d1d1f] dark:text-[#f5f5f7]">
                    Strong Topics Mastered
                  </h3>
                  <p className="text-[11px] text-[#86868b] dark:text-[#a1a1a6]">
                    High accuracy areas delivering consistent positive score
                  </p>
                </div>
              </div>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200/70 dark:border-emerald-800/60">
                {topicAnalytics.strong.length} Topics
              </span>
            </div>

            {topicAnalytics.strong.length > 0 ? (
              <div className="space-y-2.5">
                {topicAnalytics.strong.map(([topic, data]) => (
                  <div
                    key={topic}
                    className="p-3 rounded-xl bg-emerald-50/30 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-between"
                  >
                    <div>
                      <span className="text-xs font-bold text-[#1d1d1f] dark:text-[#f5f5f7] block">{topic}</span>
                      <span className="text-[10px] text-[#86868b] dark:text-[#a1a1a6]">
                        Verified in: {data.examTitles.slice(0, 2).join(', ')}
                        {data.examTitles.length > 2 && ` +${data.examTitles.length - 2} more`}
                      </span>
                    </div>

                    <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 font-mono bg-emerald-100 dark:bg-emerald-950/60 px-2.5 py-0.5 rounded-full">
                      {data.count} {data.count === 1 ? 'test' : 'tests'}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-[#86868b] dark:text-[#a1a1a6] text-xs">
                No strong topics logged yet. Add exam data with strong topics to verify strengths.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add / Edit Exam Modal */}
      <Modal
        isOpen={isExamModalOpen}
        onClose={() => setIsExamModalOpen(false)}
        title={editingExamId ? 'Edit Exam Data & Analytics' : 'Log / Schedule Exam'}
        subtitle="Record your test marks, duration, accuracy, questions breakdown, and topic mastery."
      >
        <form onSubmit={handleSaveExam} className="space-y-4">
          {/* Title & Exam Type */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] mb-1">
                Exam / Mock Test Title
              </label>
              <input
                type="text"
                placeholder="e.g. Made Easy FLT Mock 03 or DBMS Subject Test"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                className="w-full bg-[#f5f5f7] dark:bg-[#2c2c2e] border border-[#e5e5ea] dark:border-[#3a3a3c] text-[#1d1d1f] dark:text-[#f5f5f7] rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-[#0071e3] focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] mb-1">
                Exam Type
              </label>
              <select
                value={formType}
                onChange={(e) => handleTypeChange(e.target.value as ExamType)}
                className="w-full bg-[#f5f5f7] dark:bg-[#2c2c2e] border border-[#e5e5ea] dark:border-[#3a3a3c] text-[#1d1d1f] dark:text-[#f5f5f7] rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-[#0071e3] focus:outline-none"
              >
                <option value="full_length">Full Length Mock (FLT)</option>
                <option value="subject_test">Subject Test</option>
                <option value="topic_test">Topic Test</option>
              </select>
            </div>
          </div>

          {/* Subject (if Subject or Topic test) & Date & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {formType !== 'full_length' && (
              <div>
                <label className="block text-xs font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] mb-1">
                  Target Subject
                </label>
                <select
                  value={formSubjectId}
                  onChange={(e) => setFormSubjectId(e.target.value)}
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
            )}

            <div>
              <label className="block text-xs font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] mb-1">
                Exam Date
              </label>
              <input
                type="date"
                value={formDate}
                onChange={(e) => setFormDate(e.target.value)}
                className="w-full bg-[#f5f5f7] dark:bg-[#2c2c2e] border border-[#e5e5ea] dark:border-[#3a3a3c] text-[#1d1d1f] dark:text-[#f5f5f7] rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-[#0071e3] focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] mb-1">
                Exam Status
              </label>
              <select
                value={formStatus}
                onChange={(e) => setFormStatus(e.target.value as ExamStatus)}
                className="w-full bg-[#f5f5f7] dark:bg-[#2c2c2e] border border-[#e5e5ea] dark:border-[#3a3a3c] text-[#1d1d1f] dark:text-[#f5f5f7] rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-[#0071e3] focus:outline-none"
              >
                <option value="completed">Completed (Has Marks)</option>
                <option value="scheduled">Scheduled / Upcoming</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] mb-1">
                Allocated Duration (min)
              </label>
              <input
                type="number"
                min="10"
                value={formDuration}
                onChange={(e) => setFormDuration(Math.max(1, parseInt(e.target.value) || 0))}
                className="w-full bg-[#f5f5f7] dark:bg-[#2c2c2e] border border-[#e5e5ea] dark:border-[#3a3a3c] text-[#1d1d1f] dark:text-[#f5f5f7] rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-[#0071e3] focus:outline-none"
                required
              />
            </div>
          </div>

          {/* Marks & Live Automatic Calculations */}
          {formStatus === 'completed' && (
            <div className="p-3.5 bg-[#f5f5f7] dark:bg-[#1d1d1f] rounded-xl border border-[#e5e5ea] dark:border-[#333336] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#1d1d1f] dark:text-[#f5f5f7] flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#0071e3] dark:text-[#2997ff]" />
                  Marks &amp; Automatic Calculations
                </span>

                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 dark:bg-blue-950/60 text-[#0071e3] dark:text-[#2997ff] font-mono">
                    {livePercentage}% Score
                  </span>
                  {liveAccuracy && (
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 dark:bg-blue-950/60 text-[#0071e3] dark:text-[#2997ff] font-mono">
                      {liveAccuracy}% Accuracy
                    </span>
                  )}
                </div>
              </div>

              {/* Total Marks & Obtained Marks & Time Taken */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] mb-1">
                    Total Marks
                  </label>
                  <input
                    type="number"
                    step="any"
                    min="1"
                    id="input-exam-total-marks"
                    value={formTotalMarks}
                    onChange={(e) => setFormTotalMarks(parseFloat(e.target.value) || 0)}
                    className="w-full bg-white dark:bg-[#242426] border border-[#e5e5ea] dark:border-[#3a3a3c] rounded-xl px-3 py-1.5 text-sm font-bold text-[#1d1d1f] dark:text-[#f5f5f7] focus:ring-2 focus:ring-[#0071e3] focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] mb-1">
                    Obtained Marks (opt Marks)
                  </label>
                  <input
                    type="number"
                    step="any"
                    id="input-exam-obtained-marks"
                    value={formObtainedMarks}
                    onChange={(e) => setFormObtainedMarks(parseFloat(e.target.value) || 0)}
                    className="w-full bg-white dark:bg-[#242426] border border-[#e5e5ea] dark:border-[#3a3a3c] rounded-xl px-3 py-1.5 text-sm font-bold text-[#0071e3] dark:text-[#2997ff] focus:ring-2 focus:ring-[#0071e3] focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] mb-1">
                    Time Taken (min)
                  </label>
                  <input
                    type="number"
                    value={formTimeTaken}
                    onChange={(e) => setFormTimeTaken(parseInt(e.target.value) || 0)}
                    className="w-full bg-white dark:bg-[#242426] border border-[#e5e5ea] dark:border-[#3a3a3c] rounded-xl px-3 py-1.5 text-sm text-[#1d1d1f] dark:text-[#f5f5f7] focus:ring-2 focus:ring-[#0071e3] focus:outline-none"
                  />
                </div>
              </div>

              {/* Questions Breakdown */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-2 border-t border-[#e5e5ea] dark:border-[#333336]">
                <div>
                  <label className="block text-[10px] text-[#86868b] dark:text-[#a1a1a6] font-semibold mb-1">
                    Total Questions
                  </label>
                  <input
                    type="number"
                    value={formTotalQuestions}
                    onChange={(e) => setFormTotalQuestions(parseInt(e.target.value) || 0)}
                    className="w-full bg-white dark:bg-[#242426] border border-[#e5e5ea] dark:border-[#3a3a3c] text-[#1d1d1f] dark:text-[#f5f5f7] rounded-lg px-2 py-1 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-[#86868b] dark:text-[#a1a1a6] font-semibold mb-1">
                    Attempted
                  </label>
                  <input
                    type="number"
                    value={formAttemptedQuestions}
                    onChange={(e) => setFormAttemptedQuestions(parseInt(e.target.value) || 0)}
                    className="w-full bg-white dark:bg-[#242426] border border-[#e5e5ea] dark:border-[#3a3a3c] text-[#1d1d1f] dark:text-[#f5f5f7] rounded-lg px-2 py-1 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-emerald-700 dark:text-emerald-400 font-semibold mb-1">
                    Correct
                  </label>
                  <input
                    type="number"
                    value={formCorrectQuestions}
                    onChange={(e) => setFormCorrectQuestions(parseInt(e.target.value) || 0)}
                    className="w-full bg-white dark:bg-[#242426] border border-emerald-300 dark:border-emerald-700 rounded-lg px-2 py-1 text-xs text-emerald-700 dark:text-emerald-400 font-bold"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-[#ff3b30] dark:text-[#ff453a] font-semibold mb-1">
                    Wrong
                  </label>
                  <input
                    type="number"
                    value={formWrongQuestions}
                    onChange={(e) => setFormWrongQuestions(parseInt(e.target.value) || 0)}
                    className="w-full bg-white dark:bg-[#242426] border border-red-300 dark:border-red-700 rounded-lg px-2 py-1 text-xs text-[#ff3b30] dark:text-[#ff453a] font-bold"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-[#ff3b30] dark:text-[#ff453a] font-semibold mb-1">
                    Negative Marks
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={formNegativeMarks}
                    onChange={(e) => setFormNegativeMarks(parseFloat(e.target.value) || 0)}
                    className="w-full bg-white dark:bg-[#242426] border border-red-300 dark:border-red-700 rounded-lg px-2 py-1 text-xs text-[#ff3b30] dark:text-[#ff453a] font-bold"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Weak Topics and Strong Topics Input */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#ff3b30] dark:text-[#ff453a] mb-1 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                Weak Topics (Comma-separated)
              </label>
              <textarea
                rows={2}
                id="input-weak-topics"
                placeholder="e.g. Cache Mapping, Virtual Memory, B-Tree insertion"
                value={formWeakTopics}
                onChange={(e) => setFormWeakTopics(e.target.value)}
                className="w-full bg-[#f5f5f7] dark:bg-[#2c2c2e] border border-red-200 dark:border-red-900/50 text-[#1d1d1f] dark:text-[#f5f5f7] rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-[#ff3b30] focus:outline-none"
              />
              <span className="text-[10px] text-[#86868b] dark:text-[#a1a1a6] mt-0.5 block">
                Topics where you lost marks or faced difficulty.
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-emerald-700 dark:text-emerald-400 mb-1 flex items-center gap-1">
                <Check className="w-3.5 h-3.5" />
                Strong Topics (Comma-separated)
              </label>
              <textarea
                rows={2}
                id="input-strong-topics"
                placeholder="e.g. CPU Scheduling, Transactions, Graph Algorithms"
                value={formStrongTopics}
                onChange={(e) => setFormStrongTopics(e.target.value)}
                className="w-full bg-[#f5f5f7] dark:bg-[#2c2c2e] border border-emerald-200 dark:border-emerald-900/50 text-[#1d1d1f] dark:text-[#f5f5f7] rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
              <span className="text-[10px] text-[#86868b] dark:text-[#a1a1a6] mt-0.5 block">
                Topics where you answered accurately and quickly.
              </span>
            </div>
          </div>

          {/* Notes & Key Learnings */}
          <div>
            <label className="block text-xs font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] mb-1">
              Notes &amp; Key Learnings from Test
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Avoid silly calculation errors in NAT questions, review Paging numericals..."
              value={formNotes}
              onChange={(e) => setFormNotes(e.target.value)}
              className="w-full bg-[#f5f5f7] dark:bg-[#2c2c2e] border border-[#e5e5ea] dark:border-[#3a3a3c] text-[#1d1d1f] dark:text-[#f5f5f7] rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-[#0071e3] focus:outline-none"
            />
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-2 pt-3 border-t border-[#e5e5ea] dark:border-[#333336]">
            <button
              type="button"
              onClick={() => setIsExamModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-[#86868b] dark:text-[#a1a1a6] hover:bg-[#f5f5f7] dark:hover:bg-[#2c2c2e] rounded-full"
            >
              Cancel
            </button>
            <button
              type="submit"
              id="btn-save-exam-submit"
              className="px-4 py-2 text-xs font-semibold text-white dark:text-black bg-[#0071e3] hover:bg-[#0077ed] dark:bg-[#2997ff] dark:hover:bg-[#40a9ff] rounded-full shadow-xs"
            >
              {editingExamId ? 'Save Exam Updates' : 'Save Exam Record'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

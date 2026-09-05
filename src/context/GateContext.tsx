import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import {
  Subject,
  Chapter,
  Revision,
  PYQ,
  CalendarEvent,
  RevisionSettings,
  TabType,
  SubjectId,
  ChapterId,
  RevisionId,
  PyqId,
  CalendarEventId,
  PyqQueueItem,
  Exam,
  AppTheme,
} from '../types';
import { getInitialSeedData, DEFAULT_REVISION_SETTINGS } from '../data/seedData';
import { getTodayDateString, addDays, getRevisionStatus } from '../utils/dateUtils';
import { useAuth } from './AuthContext';
import { api } from '../services/api';

interface GateContextType {
  // Navigation & global filter
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  selectedSubjectId: SubjectId | 'all';
  setSelectedSubjectId: (id: SubjectId | 'all') => void;

  // Data
  subjects: Subject[];
  chapters: Chapter[];
  revisions: Revision[];
  pyqs: PYQ[];
  pyqQueue: PyqQueueItem[];
  calendarEvents: CalendarEvent[];
  exams: Exam[];
  revisionSettings: RevisionSettings;
  isInitialized: boolean;
  syncStatus: 'synced' | 'saving' | 'error';

  // Subject Actions
  addSubject: (subject: Omit<Subject, 'id'>) => Subject;
  updateSubject: (id: SubjectId, updates: Partial<Subject>) => void;
  deleteSubject: (id: SubjectId) => void;
  getChapterRevisionCount: (chapterId: ChapterId) => number;
  getChapterPyqStats: (chapterId: ChapterId) => { solved: number; fullCycles: number };
  getSubjectRevisionCount: (subjectId: SubjectId) => { completed: number; total: number };
  getSubjectEntirePyqCount: (subjectId: SubjectId) => number;
  getSubjectTestsCount: (subjectId: SubjectId) => number;

  // Chapter Actions
  addChapter: (chapter: Omit<Chapter, 'id' | 'createdAt'>) => Chapter;
  updateChapter: (id: ChapterId, updates: Partial<Chapter>) => void;
  updateChapterMetrics: (
    chapterId: ChapterId,
    metrics: { revisionCount?: number; pyqsSolvedCount?: number; pyqFullCyclesCount?: number }
  ) => void;
  deleteChapter: (id: ChapterId) => void;
  startChapter: (id: ChapterId) => void;
  updateChapterProgress: (id: ChapterId, progress: number) => void;
  completeChapter: (id: ChapterId) => void;
  adjustChapterPriority: (id: ChapterId, delta: number) => void;

  // Revision Actions (Manual scheduling, no auto-schedules)
  addRevision: (revision: Omit<Revision, 'id'>) => Revision;
  updateRevision: (id: RevisionId, updates: Partial<Revision>) => void;
  deleteRevision: (id: RevisionId) => void;
  completeRevision: (id: RevisionId) => void;
  rescheduleRevision: (id: RevisionId, newDueDate: string) => void;
  skipRevision: (id: RevisionId) => void;
  adjustRevisionPriority: (id: RevisionId, delta: number) => void;
  updateRevisionProgress: (id: RevisionId, progress: number) => void;
  startRevision: (id: RevisionId) => void;
  updateRevisionSettings: (settings: RevisionSettings) => void;

  // PYQ Question Bank Actions
  addPyq: (pyq: Omit<PYQ, 'id'>) => PYQ;
  updatePyq: (id: PyqId, updates: Partial<PYQ>) => void;
  deletePyq: (id: PyqId) => void;
  updatePyqStatus: (id: PyqId, status: PYQ['status']) => void;

  // PYQ Practice Queue Actions (Learning-like priority queue)
  addPyqQueueItem: (item: Omit<PyqQueueItem, 'id' | 'createdAt'>) => PyqQueueItem;
  updatePyqQueueItem: (id: string, updates: Partial<PyqQueueItem>) => void;
  deletePyqQueueItem: (id: string) => void;
  startPyqQueueItem: (id: string) => void;
  completePyqQueueItem: (id: string) => void;
  adjustPyqQueuePriority: (id: string, delta: number) => void;
  updatePyqQueueProgress: (id: string, progress: number, solvedCount?: number) => void;

  // Calendar Actions
  addCalendarEvent: (event: Omit<CalendarEvent, 'id'>) => CalendarEvent;
  updateCalendarEvent: (id: CalendarEventId, updates: Partial<CalendarEvent>) => void;
  deleteCalendarEvent: (id: CalendarEventId) => void;

  // Exam Actions
  addExam: (exam: Omit<Exam, 'id' | 'createdAt'>) => Exam;
  updateExam: (id: string, updates: Partial<Exam>) => void;
  deleteExam: (id: string) => void;

  // Database actions
  resetDemoData: () => void;
  resetFreshWorkspace: () => Promise<void>;
  importSyllabusTemplate: () => Promise<void>;

  // Theme support (Apple Classic White and Apple Classic Dark)
  theme: AppTheme;
  setTheme: (theme: AppTheme) => void;
  toggleTheme: () => void;
}

const GateContext = createContext<GateContextType | undefined>(undefined);

export const GateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();

  const [theme, setThemeState] = useState<AppTheme>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('gate_prep_theme');
      if (saved === 'dark' || saved === 'light') return saved;
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark';
      }
    }
    return 'light';
  });

  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [selectedSubjectId, setSelectedSubjectId] = useState<SubjectId | 'all'>('all');

  // Fresh by default: 0 items for new users/fresh install
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [revisions, setRevisions] = useState<Revision[]>([]);
  const [pyqs, setPyqs] = useState<PYQ[]>([]);
  const [pyqQueue, setPyqQueue] = useState<PyqQueueItem[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [revisionSettings, setRevisionSettings] = useState<RevisionSettings>(DEFAULT_REVISION_SETTINGS);
  const [isInitialized, setIsInitialized] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'synced' | 'saving' | 'error'>('synced');

  const saveTimerRef = useRef<any>(null);

  // Initialize data for the authenticated user from the SQLite database
  useEffect(() => {
    if (!isAuthenticated || !user) {
      setIsInitialized(false);
      setSubjects([]);
      setChapters([]);
      setRevisions([]);
      setPyqs([]);
      setPyqQueue([]);
      setCalendarEvents([]);
      setExams([]);
      return;
    }

    let isMounted = true;
    const userCacheKey = `gate_prep_user_data_${user.id}`;

    async function loadData() {
      try {
        // Fast optimistic cache read
        const cached = localStorage.getItem(userCacheKey);
        if (cached) {
          try {
            const parsed = JSON.parse(cached);
            if (isMounted) {
              setSubjects(parsed.subjects || []);
              setChapters(parsed.chapters || []);
              setRevisions(parsed.revisions || []);
              setPyqs(parsed.pyqs || []);
              setPyqQueue(parsed.pyqQueue || []);
              setCalendarEvents(parsed.calendarEvents || []);
              setExams(parsed.exams || []);
              if (parsed.revisionSettings) setRevisionSettings(parsed.revisionSettings);
            }
          } catch (e) {
            console.warn('Failed parsing cached study data');
          }
        }

        // For guest aspirant or offline mode, local optimistic cache is sufficient
        if (user.id === 'guest_aspirant') {
          setIsInitialized(true);
          setSyncStatus('synced');
          return;
        }

        // Fetch authoritative study data from server database
        const remoteData = await api.study.getData();
        if (isMounted && remoteData) {
          // If the user is fresh/never used before, remoteData contains empty arrays!
          setSubjects(remoteData.subjects || []);
          setChapters(remoteData.chapters || []);
          setRevisions(remoteData.revisions || []);
          setPyqs(remoteData.pyqs || []);
          setPyqQueue(remoteData.pyqQueue || []);
          setCalendarEvents(remoteData.calendarEvents || []);
          setExams(remoteData.exams || []);
          if (remoteData.revisionSettings) {
            setRevisionSettings(remoteData.revisionSettings);
          }

          localStorage.setItem(userCacheKey, JSON.stringify(remoteData));
          setSyncStatus('synced');
        }
      } catch (err) {
        console.error('Error loading study data from server database:', err);
      } finally {
        if (isMounted) {
          setIsInitialized(true);
        }
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, [user?.id, isAuthenticated]);

  // Sync Theme with DOM and localStorage
  useEffect(() => {
    if (typeof document !== 'undefined') {
      const root = document.documentElement;
      if (theme === 'dark') {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
      localStorage.setItem('gate_prep_theme', theme);
    }
  }, [theme]);

  const setTheme = (newTheme: AppTheme) => {
    setThemeState(newTheme);
  };

  const toggleTheme = () => {
    setThemeState((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Sync to SQLite database whenever study data changes
  useEffect(() => {
    if (!isInitialized || !isAuthenticated || !user) return;

    const dataToSave = {
      subjects,
      chapters,
      revisions,
      pyqs,
      pyqQueue,
      calendarEvents,
      exams,
      revisionSettings,
    };

    // Save locally
    const userCacheKey = `gate_prep_user_data_${user.id}`;
    localStorage.setItem(userCacheKey, JSON.stringify(dataToSave));

    // Debounced sync to SQLite backend
    setSyncStatus('saving');
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
    }

    saveTimerRef.current = setTimeout(async () => {
      if (user.id === 'guest_aspirant') {
        setSyncStatus('synced');
        return;
      }
      try {
        await api.study.saveData(dataToSave);
        setSyncStatus('synced');
      } catch (e) {
        console.error('Failed to sync changes to database:', e);
        setSyncStatus('error');
      }
    }, 600);

    return () => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }
    };
  }, [subjects, chapters, revisions, pyqs, pyqQueue, calendarEvents, exams, revisionSettings, isInitialized, isAuthenticated, user]);

  // Reset to clean, completely fresh workspace with 0 data
  const resetFreshWorkspace = async () => {
    setSubjects([]);
    setChapters([]);
    setRevisions([]);
    setPyqs([]);
    setPyqQueue([]);
    setCalendarEvents([]);
    setExams([]);
    setRevisionSettings(DEFAULT_REVISION_SETTINGS);

    if (user) {
      localStorage.removeItem(`gate_prep_user_data_${user.id}`);
    }

    try {
      setSyncStatus('saving');
      await api.study.resetData();
      setSyncStatus('synced');
    } catch (e) {
      console.error('Failed resetting workspace in database:', e);
      setSyncStatus('error');
    }
  };

  // Optional: Import standard GATE CS Syllabus template
  const importSyllabusTemplate = async () => {
    try {
      setSyncStatus('saving');
      const res = await api.study.importTemplate();
      if (res && res.data) {
        setSubjects(res.data.subjects || []);
        setChapters(res.data.chapters || []);
        setRevisions(res.data.revisions || []);
        setPyqs(res.data.pyqs || []);
        setPyqQueue(res.data.pyqQueue || []);
        setCalendarEvents(res.data.calendarEvents || []);
        setExams(res.data.exams || []);
      }
      setSyncStatus('synced');
    } catch (e) {
      console.error('Failed importing syllabus template:', e);
      setSyncStatus('error');
    }
  };

  const resetDemoData = () => {
    importSyllabusTemplate();
  };

  // Recalculate revision statuses against today whenever revisions or today changes
  const computedRevisions = revisions.map((rev) => {
    const today = getTodayDateString();
    const updatedStatus = getRevisionStatus(
      rev.dueDate,
      rev.status === 'completed',
      rev.status === 'skipped',
      today
    );
    if (rev.status !== updatedStatus && rev.status !== 'completed' && rev.status !== 'skipped') {
      return { ...rev, status: updatedStatus };
    }
    return rev;
  });

  // --- SUBJECT ACTIONS ---
  const addSubject = (subjectData: Omit<Subject, 'id'>): Subject => {
    const newSub: Subject = {
      ...subjectData,
      id: `sub-${Date.now()}`,
    };
    setSubjects((prev) => [...prev, newSub]);
    return newSub;
  };

  const updateSubject = (id: SubjectId, updates: Partial<Subject>) => {
    setSubjects((prev) => prev.map((s) => (s.id === id ? { ...s, ...updates } : s)));
  };

  const deleteSubject = (id: SubjectId) => {
    setSubjects((prev) => prev.filter((s) => s.id !== id));
    setChapters((prev) => prev.filter((c) => c.subjectId !== id));
    setRevisions((prev) => prev.filter((r) => r.subjectId !== id));
    setPyqs((prev) => prev.filter((p) => p.subjectId !== id));
    setPyqQueue((prev) => prev.filter((pq) => pq.subjectId !== id));
    setCalendarEvents((prev) => prev.filter((ce) => ce.subjectId !== id));
    if (selectedSubjectId === id) {
      setSelectedSubjectId('all');
    }
  };

  // Chapter-wise & Subject-wise metrics count getters
  const getChapterRevisionCount = (chapterId: ChapterId): number => {
    const chap = chapters.find((c) => c.id === chapterId);
    if (chap && chap.revisionCount !== undefined) {
      return chap.revisionCount;
    }
    return revisions.filter((r) => r.chapterId === chapterId && r.status === 'completed').length;
  };

  const getChapterPyqStats = (chapterId: ChapterId): { solved: number; fullCycles: number } => {
    const chap = chapters.find((c) => c.id === chapterId);
    const solvedFromPyqs = pyqs.filter(
      (p) => p.chapterId === chapterId && (p.status === 'correct' || p.status === 'wrong')
    ).length;
    const solved = chap?.pyqsSolvedCount !== undefined ? chap.pyqsSolvedCount : solvedFromPyqs;
    const fullCycles = chap?.pyqFullCyclesCount ?? 0;
    return { solved, fullCycles };
  };

  const getSubjectRevisionCount = (subjectId: SubjectId): { completed: number; total: number } => {
    const sub = subjects.find((s) => s.id === subjectId);
    const subRevs = revisions.filter((r) => r.subjectId === subjectId);
    const subChaps = chapters.filter((c) => c.subjectId === subjectId);
    const chapRevsSum = subChaps.reduce((acc, c) => acc + (c.revisionCount ?? 0), 0);

    if (sub && sub.totalRevisionsCount !== undefined) {
      return {
        completed: sub.totalRevisionsCount,
        total: Math.max(sub.totalRevisionsCount, subRevs.length, chapRevsSum),
      };
    }

    const completedRevs = subRevs.filter((r) => r.status === 'completed').length;
    return {
      completed: Math.max(completedRevs, chapRevsSum),
      total: Math.max(subRevs.length, chapRevsSum),
    };
  };

  const getSubjectEntirePyqCount = (subjectId: SubjectId): number => {
    const sub = subjects.find((s) => s.id === subjectId);
    return sub?.entirePyqSolvedCount ?? 0;
  };

  const getSubjectTestsCount = (subjectId: SubjectId): number => {
    const sub = subjects.find((s) => s.id === subjectId);
    const testsInStore = exams.filter((e) => e.subjectId === subjectId).length;
    if (sub && sub.subjectTestsCount !== undefined) {
      return Math.max(sub.subjectTestsCount, testsInStore);
    }
    return testsInStore;
  };

  // --- CHAPTER ACTIONS (NO AUTO-SCHEDULE ON COMPLETION) ---
  const addChapter = (chapterData: Omit<Chapter, 'id' | 'createdAt'>): Chapter => {
    const today = getTodayDateString();
    const newChap: Chapter = {
      ...chapterData,
      id: `chap-${Date.now()}`,
      createdAt: today,
    };
    setChapters((prev) => [...prev, newChap]);
    return newChap;
  };

  const updateChapter = (id: ChapterId, updates: Partial<Chapter>) => {
    setChapters((prev) =>
      prev.map((c) => {
        if (c.id !== id) return c;
        return { ...c, ...updates };
      })
    );
  };

  const updateChapterMetrics = (
    chapterId: ChapterId,
    metrics: { revisionCount?: number; pyqsSolvedCount?: number; pyqFullCyclesCount?: number }
  ) => {
    setChapters((prev) =>
      prev.map((c) => {
        if (c.id !== chapterId) return c;
        return {
          ...c,
          revisionCount:
            metrics.revisionCount !== undefined
              ? Math.max(0, metrics.revisionCount)
              : c.revisionCount,
          pyqsSolvedCount:
            metrics.pyqsSolvedCount !== undefined
              ? Math.max(0, metrics.pyqsSolvedCount)
              : c.pyqsSolvedCount,
          pyqFullCyclesCount:
            metrics.pyqFullCyclesCount !== undefined
              ? Math.max(0, metrics.pyqFullCyclesCount)
              : c.pyqFullCyclesCount,
        };
      })
    );
  };

  const deleteChapter = (id: ChapterId) => {
    setChapters((prev) => prev.filter((c) => c.id !== id));
    setRevisions((prev) => prev.filter((r) => r.chapterId !== id));
    setPyqs((prev) => prev.filter((p) => p.chapterId !== id));
    setPyqQueue((prev) => prev.filter((pq) => pq.chapterId !== id));
    setCalendarEvents((prev) => prev.filter((ce) => ce.chapterId !== id));
  };

  const startChapter = (id: ChapterId) => {
    setChapters((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, status: 'in_progress', progress: Math.max(c.progress, 10) } : c
      )
    );
  };

  const updateChapterProgress = (id: ChapterId, progress: number) => {
    const clamped = Math.min(100, Math.max(0, Math.round(progress)));
    if (clamped === 100) {
      completeChapter(id);
    } else {
      setChapters((prev) =>
        prev.map((c) =>
          c.id === id
            ? {
                ...c,
                progress: clamped,
                status: clamped > 0 ? 'in_progress' : c.status,
              }
            : c
        )
      );
    }
  };

  // When chapter completes, mark complete ONLY. No automatic scheduling of revision!
  const completeChapter = (id: ChapterId) => {
    const today = getTodayDateString();
    setChapters((prev) =>
      prev.map((c) => {
        if (c.id === id) {
          return {
            ...c,
            status: 'completed',
            progress: 100,
            completedAt: today,
          };
        }
        return c;
      })
    );
  };

  const adjustChapterPriority = (id: ChapterId, delta: number) => {
    setChapters((prev) =>
      prev.map((c) => {
        if (c.id !== id) return c;
        const newPriority = Math.max(1, Math.min(20, c.priority + delta));
        return { ...c, priority: newPriority };
      })
    );
  };

  // --- REVISION ACTIONS (MANUAL SCHEDULING & PRIORITY QUEUE, NO AUTO-SCHEDULE) ---
  const addRevision = (revisionData: Omit<Revision, 'id'>): Revision => {
    const today = getTodayDateString();
    const newRevId = `rev-${Date.now()}`;
    const newRevision: Revision = {
      ...revisionData,
      id: newRevId,
      status: revisionData.status || getRevisionStatus(revisionData.dueDate, false, false, today),
      priority: revisionData.priority || 10,
      progress: revisionData.progress || 0,
    };

    setRevisions((prev) => [newRevision, ...prev]);

    // Synchronize to calendar event
    const sub = subjects.find((s) => s.id === revisionData.subjectId);
    const chap = chapters.find((c) => c.id === revisionData.chapterId);
    const subCode = sub?.code || sub?.name || 'Subject';
    const chapName = chap?.name || 'Chapter';

    const newCalEvent: CalendarEvent = {
      id: `cal-rev-${Date.now()}`,
      subjectId: revisionData.subjectId,
      chapterId: revisionData.chapterId,
      title: `${subCode}: ${chapName} Rev ${revisionData.revisionNumber}`,
      type: 'revision',
      date: revisionData.dueDate,
      status: 'pending',
      revisionId: newRevId,
    };
    setCalendarEvents((prev) => [...prev, newCalEvent]);

    return newRevision;
  };

  const updateRevision = (id: RevisionId, updates: Partial<Revision>) => {
    setRevisions((prev) =>
      prev.map((r) => {
        if (r.id !== id) return r;
        return { ...r, ...updates };
      })
    );

    if (updates.dueDate) {
      setCalendarEvents((prev) =>
        prev.map((ce) => (ce.revisionId === id ? { ...ce, date: updates.dueDate! } : ce))
      );
    }
  };

  const deleteRevision = (id: RevisionId) => {
    setRevisions((prev) => prev.filter((r) => r.id !== id));
    setCalendarEvents((prev) => prev.filter((ce) => ce.revisionId !== id));
  };

  // When revision is completed, NO automatic generation of next revision!
  const completeRevision = (id: RevisionId) => {
    const today = getTodayDateString();

    setRevisions((prev) =>
      prev.map((r) => {
        if (r.id !== id) return r;
        return {
          ...r,
          status: 'completed',
          progress: 100,
          completedDate: today,
          completedAt: new Date().toISOString(),
        };
      })
    );

    // Update calendar event for the completed revision
    setCalendarEvents((prev) =>
      prev.map((ce) => (ce.revisionId === id ? { ...ce, status: 'completed' } : ce))
    );
  };

  const rescheduleRevision = (id: RevisionId, newDueDate: string) => {
    const today = getTodayDateString();
    setRevisions((prev) =>
      prev.map((r) =>
        r.id === id
          ? {
              ...r,
              dueDate: newDueDate,
              status: getRevisionStatus(newDueDate, false, r.status === 'skipped', today),
            }
          : r
      )
    );

    // Update calendar event
    setCalendarEvents((prev) =>
      prev.map((ce) => (ce.revisionId === id ? { ...ce, date: newDueDate } : ce))
    );
  };

  const skipRevision = (id: RevisionId) => {
    setRevisions((prev) => prev.map((r) => (r.id === id ? { ...r, status: 'skipped' } : r)));
  };

  const adjustRevisionPriority = (id: RevisionId, delta: number) => {
    setRevisions((prev) =>
      prev.map((r) => {
        if (r.id !== id) return r;
        const newPriority = Math.max(1, Math.min(20, (r.priority || 10) + delta));
        return { ...r, priority: newPriority };
      })
    );
  };

  const startRevision = (id: RevisionId) => {
    setRevisions((prev) =>
      prev.map((r) =>
        r.id === id
          ? {
              ...r,
              progress: Math.max(r.progress || 0, 20),
            }
          : r
      )
    );
  };

  const updateRevisionProgress = (id: RevisionId, progress: number) => {
    const clamped = Math.min(100, Math.max(0, Math.round(progress)));
    if (clamped === 100) {
      completeRevision(id);
    } else {
      setRevisions((prev) =>
        prev.map((r) => (r.id === id ? { ...r, progress: clamped } : r))
      );
    }
  };

  const updateRevisionSettings = (settings: RevisionSettings) => {
    setRevisionSettings(settings);
  };

  // --- PYQ QUESTION BANK ACTIONS (UNCHANGED) ---
  const addPyq = (pyqData: Omit<PYQ, 'id'>): PYQ => {
    const newPyq: PYQ = {
      ...pyqData,
      id: `pyq-${Date.now()}`,
    };
    setPyqs((prev) => [newPyq, ...prev]);
    return newPyq;
  };

  const updatePyq = (id: PyqId, updates: Partial<PYQ>) => {
    setPyqs((prev) => prev.map((p) => (p.id === id ? { ...p, ...updates } : p)));
  };

  const deletePyq = (id: PyqId) => {
    setPyqs((prev) => prev.filter((p) => p.id !== id));
  };

  const updatePyqStatus = (id: PyqId, status: PYQ['status']) => {
    setPyqs((prev) => prev.map((p) => (p.id === id ? { ...p, status } : p)));
  };

  // --- PYQ PRACTICE QUEUE ACTIONS (LEARNING-LIKE INTERFACE) ---
  const addPyqQueueItem = (itemData: Omit<PyqQueueItem, 'id' | 'createdAt'>): PyqQueueItem => {
    const today = getTodayDateString();
    const newItem: PyqQueueItem = {
      ...itemData,
      id: `pyq-q-${Date.now()}`,
      createdAt: today,
    };
    setPyqQueue((prev) => [newItem, ...prev]);
    return newItem;
  };

  const updatePyqQueueItem = (id: string, updates: Partial<PyqQueueItem>) => {
    setPyqQueue((prev) => prev.map((pq) => (pq.id === id ? { ...pq, ...updates } : pq)));
  };

  const deletePyqQueueItem = (id: string) => {
    setPyqQueue((prev) => prev.filter((pq) => pq.id !== id));
  };

  const startPyqQueueItem = (id: string) => {
    setPyqQueue((prev) =>
      prev.map((pq) =>
        pq.id === id
          ? {
              ...pq,
              status: 'in_progress',
              progress: Math.max(pq.progress, 15),
            }
          : pq
      )
    );
  };

  const completePyqQueueItem = (id: string) => {
    const today = getTodayDateString();
    setPyqQueue((prev) =>
      prev.map((pq) =>
        pq.id === id
          ? {
              ...pq,
              status: 'completed',
              progress: 100,
              solvedQuestions: pq.targetQuestions,
              completedAt: today,
            }
          : pq
      )
    );
  };

  const adjustPyqQueuePriority = (id: string, delta: number) => {
    setPyqQueue((prev) =>
      prev.map((pq) => {
        if (pq.id !== id) return pq;
        const newPriority = Math.max(1, Math.min(20, pq.priority + delta));
        return { ...pq, priority: newPriority };
      })
    );
  };

  const updatePyqQueueProgress = (id: string, progress: number, solvedCount?: number) => {
    const clamped = Math.min(100, Math.max(0, Math.round(progress)));
    if (clamped === 100) {
      completePyqQueueItem(id);
    } else {
      setPyqQueue((prev) =>
        prev.map((pq) => {
          if (pq.id !== id) return pq;
          return {
            ...pq,
            progress: clamped,
            solvedQuestions: solvedCount !== undefined ? solvedCount : pq.solvedQuestions,
            status: clamped > 0 ? 'in_progress' : pq.status,
          };
        })
      );
    }
  };

  // --- CALENDAR ACTIONS ---
  const addCalendarEvent = (eventData: Omit<CalendarEvent, 'id'>): CalendarEvent => {
    const newEvent: CalendarEvent = {
      ...eventData,
      id: `cal-${Date.now()}`,
    };
    setCalendarEvents((prev) => [...prev, newEvent]);
    return newEvent;
  };

  const updateCalendarEvent = (id: CalendarEventId, updates: Partial<CalendarEvent>) => {
    setCalendarEvents((prev) => prev.map((ce) => (ce.id === id ? { ...ce, ...updates } : ce)));
  };

  const deleteCalendarEvent = (id: CalendarEventId) => {
    setCalendarEvents((prev) => prev.filter((ce) => ce.id !== id));
  };

  // --- EXAM ACTIONS ---
  const addExam = (examData: Omit<Exam, 'id' | 'createdAt'>): Exam => {
    const today = getTodayDateString();
    const newExam: Exam = {
      ...examData,
      id: `exam-${Date.now()}`,
      createdAt: today,
    };
    setExams((prev) => [newExam, ...prev]);

    // If subject test, also update subject tests count
    if (newExam.subjectId) {
      setSubjects((prev) =>
        prev.map((s) => {
          if (s.id === newExam.subjectId) {
            return {
              ...s,
              subjectTestsCount: (s.subjectTestsCount ?? 0) + 1,
            };
          }
          return s;
        })
      );
    }

    return newExam;
  };

  const updateExam = (id: string, updates: Partial<Exam>) => {
    setExams((prev) => prev.map((e) => (e.id === id ? { ...e, ...updates } : e)));
  };

  const deleteExam = (id: string) => {
    setExams((prev) => prev.filter((e) => e.id !== id));
  };

  return (
    <GateContext.Provider
      value={{
        activeTab,
        setActiveTab,
        selectedSubjectId,
        setSelectedSubjectId,
        subjects,
        chapters,
        revisions: computedRevisions,
        pyqs,
        pyqQueue,
        calendarEvents,
        exams,
        revisionSettings,
        isInitialized,
        syncStatus,
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
        updateChapterMetrics,
        deleteChapter,
        startChapter,
        updateChapterProgress,
        completeChapter,
        adjustChapterPriority,
        addRevision,
        updateRevision,
        deleteRevision,
        completeRevision,
        rescheduleRevision,
        skipRevision,
        adjustRevisionPriority,
        updateRevisionProgress,
        startRevision,
        updateRevisionSettings,
        addPyq,
        updatePyq,
        deletePyq,
        updatePyqStatus,
        addPyqQueueItem,
        updatePyqQueueItem,
        deletePyqQueueItem,
        startPyqQueueItem,
        completePyqQueueItem,
        adjustPyqQueuePriority,
        updatePyqQueueProgress,
        addCalendarEvent,
        updateCalendarEvent,
        deleteCalendarEvent,
        addExam,
        updateExam,
        deleteExam,
        resetDemoData,
        resetFreshWorkspace,
        importSyllabusTemplate,
        theme,
        setTheme,
        toggleTheme,
      }}
    >
      {children}
    </GateContext.Provider>
  );
};

export const useGate = (): GateContextType => {
  const context = useContext(GateContext);
  if (!context) {
    throw new Error('useGate must be used within a GateProvider');
  }
  return context;
};


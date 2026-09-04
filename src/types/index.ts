export type SubjectId = string;
export type ChapterId = string;
export type RevisionId = string;
export type PyqId = string;
export type CalendarEventId = string;

export interface Subject {
  id: SubjectId;
  name: string;
  code: string;
  description?: string;
  color: string; // Hex or theme color for tag
  totalRevisionsCount?: number; // Total revisions of subject count
  entirePyqSolvedCount?: number; // Total times entirely solved all PYQs of subject
  subjectTestsCount?: number; // Total times given full length / subject test of subject
}

export type ChapterStatus = 'not_started' | 'in_progress' | 'completed';

export interface Chapter {
  id: ChapterId;
  subjectId: SubjectId;
  name: string;
  priority: number; // e.g. 10 = highest
  status: ChapterStatus;
  progress: number; // 0 to 100
  notes?: string;
  createdAt: string;
  completedAt?: string;
  revisionCount?: number; // How many revisions taken of chapter
  pyqsSolvedCount?: number; // How many PYQs solved for this chapter
  pyqFullCyclesCount?: number; // How many times completely solved all PYQs of this chapter
}

export type RevisionStatus = 'upcoming' | 'due_today' | 'overdue' | 'completed' | 'skipped';

export interface Revision {
  id: RevisionId;
  subjectId: SubjectId;
  chapterId: ChapterId;
  revisionNumber: number; // 1, 2, 3...
  dueDate: string; // YYYY-MM-DD
  completedDate?: string; // YYYY-MM-DD
  completedAt?: string;
  status: RevisionStatus;
  priority: number; // 1 to 20, for priority-based revision queue
  progress: number; // 0 to 100
  notes?: string;
}

export type PyqDifficulty = 'easy' | 'medium' | 'hard';
export type PyqStatus = 'not_attempted' | 'correct' | 'wrong' | 'skipped';

export interface PYQ {
  id: PyqId;
  subjectId: SubjectId;
  chapterId: ChapterId;
  year: number;
  questionNumber: string;
  question: string;
  answer?: string;
  explanation?: string;
  difficulty: PyqDifficulty;
  status: PyqStatus;
}

export type PyqQueueStatus = 'not_started' | 'in_progress' | 'completed';

export interface PyqQueueItem {
  id: string;
  subjectId: SubjectId;
  chapterId: ChapterId;
  priority: number; // 1 to 20
  status: PyqQueueStatus;
  progress: number; // 0 to 100%
  targetQuestions: number; // e.g. 20
  solvedQuestions: number; // e.g. 15
  notes?: string;
  createdAt: string;
  completedAt?: string;
}

export type CalendarEventType = 'learning' | 'revision' | 'pyq' | 'other';

export interface CalendarEvent {
  id: CalendarEventId;
  subjectId: SubjectId;
  chapterId?: ChapterId;
  title: string;
  type: CalendarEventType;
  date: string; // YYYY-MM-DD
  status: 'pending' | 'completed';
  revisionId?: RevisionId;
}

export interface RevisionSettings {
  rev1Days: number;
  rev2Days: number;
  rev3Days: number;
}

export type TabType = 'dashboard' | 'learning' | 'revision' | 'pyq' | 'calendar' | 'subjects' | 'exams';

export type AppTheme = 'light' | 'dark';

export type ExamType = 'full_length' | 'subject_test' | 'topic_test';
export type ExamStatus = 'completed' | 'scheduled';

export interface Exam {
  id: string;
  title: string;
  examType: ExamType;
  subjectId?: SubjectId; // Optional for FLT, linked for subject test
  chapterId?: ChapterId; // Optional topic level
  date: string; // YYYY-MM-DD
  totalMarks: number;
  obtainedMarks: number;
  durationMinutes: number;
  timeTakenMinutes?: number;
  totalQuestions?: number;
  attemptedQuestions?: number;
  correctQuestions?: number;
  wrongQuestions?: number;
  negativeMarks?: number;
  percentage?: number;
  accuracy?: number;
  strongTopics: string[];
  weakTopics: string[];
  notes?: string;
  status: ExamStatus;
  createdAt: string;
}

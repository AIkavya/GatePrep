export type TabType =
  | "dashboard"
  | "learning"
  | "revision"
  | "pyq"
  | "calendar"
  | "subjects"
  | "exams";
export type AppTheme = "light" | "dark";

export type SubjectId = string;
export type ChapterId = string;
export type RevisionId = string;
export type PyqId = string;
export type CalendarEventId = string;

export type ChapterStatus = "not_started" | "in_progress" | "completed";
export type RevisionStatus =
  | "upcoming"
  | "due_today"
  | "overdue"
  | "completed"
  | "skipped";
export type PyqDifficulty = "easy" | "medium" | "hard";
export type PyqStatus = "not_attempted" | "correct" | "wrong" | "skipped";
export type PyqQueueStatus = "not_started" | "in_progress" | "completed";
export type CalendarEventType = "revision" | "learning" | "pyq" | "other";
export type ExamType = "full_length" | "subject_test" | "topic_test";
export type ExamStatus = "completed" | "scheduled";

export interface Subject {
  id: SubjectId;
  name: string;
  code: string;
  description?: string;
  color: string;
  totalRevisionsCount?: number;
  entirePyqSolvedCount?: number;
  subjectTestsCount?: number;
}

export interface Chapter {
  id: ChapterId;
  subjectId: SubjectId;
  name: string;
  priority: number;
  progress: number;
  status: ChapterStatus;
  notes?: string;
  createdAt?: string;
  completedAt?: string;
  revisionCount?: number;
  pyqsSolvedCount?: number;
  pyqFullCyclesCount?: number;
}

export interface Revision {
  id: RevisionId;
  subjectId: SubjectId;
  chapterId: ChapterId;
  revisionNumber: number;
  dueDate: string;
  status: RevisionStatus;
  priority: number;
  progress?: number;
  notes?: string;
  completedAt?: string;
  completedDate?: string;
}

export interface PYQ {
  id: PyqId;
  subjectId: SubjectId;
  chapterId: ChapterId;
  year: number;
  marks?: 1 | 2;
  questionNumber?: string | number;
  question?: string;
  questionText?: string;
  imageUrl?: string;
  answer?: string;
  explanation?: string;
  options?: string[];
  correctOption?: string | number;
  correctOptions?: number[];
  numericalAnswer?: number | string;
  isNumerical?: boolean;
  isNat?: boolean;
  natAnswerRange?: { min: number; max: number };
  difficulty: PyqDifficulty;
  status: PyqStatus;
  notes?: string;
  userNotes?: string;
  solvedAt?: string;
}

export interface PyqQueueItem {
  id: string;
  subjectId: SubjectId;
  chapterId: ChapterId;
  priority: number;
  targetQuestions: number;
  solvedQuestions: number;
  progress: number;
  status: PyqQueueStatus;
  notes?: string;
  createdAt?: string;
  completedAt?: string;
}

export interface CalendarEvent {
  id: CalendarEventId;
  subjectId?: SubjectId;
  chapterId?: ChapterId;
  revisionId?: RevisionId;
  title: string;
  date: string;
  time?: string;
  type: CalendarEventType;
  status?: "pending" | "completed" | string;
  notes?: string;
}

export interface Exam {
  id: string;
  title: string;
  examType: ExamType;
  subjectId?: SubjectId;
  chapterId?: ChapterId;
  date: string;
  durationMinutes: number;
  totalMarks: number;
  obtainedMarks?: number;
  percentage?: number;
  accuracy?: number;
  status: ExamStatus;
  timeTakenMinutes?: number;
  totalQuestions?: number;
  attemptedQuestions?: number;
  correctQuestions?: number;
  wrongQuestions?: number;
  negativeMarks?: number;
  weakTopics?: string[];
  strongTopics?: string[];
  notes?: string;
  createdAt?: string;
}

export interface RevisionSettings {
  rev1Days: number;
  rev2Days: number;
  rev3Days: number;
}

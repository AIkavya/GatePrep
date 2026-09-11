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
export type ExamType =
  | "full_length"
  | "subject_test"
  | "topic_test"
  | "chapter_wise"
  | "multiple_subject"
  | "all_subject";
export type ExamStatus = "completed" | "scheduled" | "in_progress";
export type QuestionType = "mcq" | "msq" | "nat";
export type ExamCompletionStatus =
  | "completed"
  | "time_expired"
  | "exited"
  | "scheduled";

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
  questionType?: QuestionType;
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

export interface ExamQuestionResult {
  questionId: string;
  questionNumber?: string | number;
  questionText: string;
  imageUrl?: string;
  questionType: QuestionType;
  subjectId: string;
  subjectName: string;
  chapterId: string;
  chapterName: string;
  options?: string[];
  userAnswer: any;
  correctAnswer: any;
  isCorrect: boolean;
  isAttempted: boolean;
  marksObtained: number; // +1, -1, 0
  maxMarks: number;
  timeSpentSeconds: number;
  explanation?: string;
  natAnswerRange?: { min: number; max: number };
  numericalAnswer?: number | string;
}

export interface ExamReportData {
  examId: string;
  title: string;
  date: string;
  durationMinutes: number;
  timeTakenSeconds: number;
  completionStatus: ExamCompletionStatus;
  syllabusScope: "all" | "multiple_subjects" | "single_subject" | "chapters";
  subjectNames: string[];
  chapterNames?: string[];
  questionTypes: QuestionType[];
  totalQuestions: number;
  attemptedQuestions: number;
  unattemptedQuestions: number;
  correctQuestions: number;
  wrongQuestions: number;
  totalMarks: number;
  obtainedMarks: number;
  percentage: number;
  accuracy: number;
  positiveMarks: number;
  negativeMarks: number;
  avgTimePerQuestionSeconds: number;
  fastestQuestion?: { questionNumber: string | number; seconds: number };
  slowestQuestion?: { questionNumber: string | number; seconds: number };
  typeStats: Record<
    QuestionType,
    {
      total: number;
      correct: number;
      wrong: number;
      unattempted: number;
      accuracy: number;
    }
  >;
  topicStats: Array<{
    subjectName: string;
    chapterName: string;
    total: number;
    attempted: number;
    correct: number;
    wrong: number;
    accuracy: number;
    category: "strong" | "weak" | "moderate";
  }>;
  questions: ExamQuestionResult[];
}

export interface Exam {
  id: string;
  title: string;
  examType: ExamType;
  subjectId?: SubjectId;
  chapterId?: ChapterId;
  subjectIds?: SubjectId[];
  chapterIds?: ChapterId[];
  questionTypes?: QuestionType[];
  syllabusScope?: "all" | "multiple_subjects" | "single_subject" | "chapters";
  completionStatus?: ExamCompletionStatus;
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
  positiveMarks?: number;
  negativeMarks?: number;
  weakTopics?: string[];
  strongTopics?: string[];
  notes?: string;
  reportData?: ExamReportData;
  createdAt?: string;
}

export interface RevisionSettings {
  rev1Days: number;
  rev2Days: number;
  rev3Days: number;
}

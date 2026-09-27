import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  Clock,
  ChevronLeft,
  ChevronRight,
  Flag,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  X,
  Send,
  LogOut,
  Maximize2,
  Grid,
  HelpCircle,
  Hash,
  Delete,
  CornerDownLeft,
} from "lucide-react";
import {
  PYQ,
  QuestionType,
  ExamCompletionStatus,
  Subject,
  Chapter,
} from "../../types";
import { getQuestionType } from "../../utils/examEngine";
import { QuestionTypeBadge } from "../common/Badge";

export interface ActiveExamSessionData {
  examId: string;
  title: string;
  syllabusScope: "all" | "multiple_subjects" | "single_subject" | "chapters";
  selectedSubjectIds: string[];
  selectedChapterIds: string[];
  selectedQuestionTypes: QuestionType[];
  questions: PYQ[];
  durationMinutes: number;
  durationSeconds: number;
  startedAt: number; // epoch ms
  userAnswers: Record<string, any>;
  questionTimes: Record<string, number>;
  markedForReview: Record<string, boolean>;
  currentQuestionIndex: number;
}

interface ExamActiveSessionProps {
  sessionData: ActiveExamSessionData;
  subjects: Subject[];
  chapters: Chapter[];
  onFinishExam: (result: {
    userAnswers: Record<string, any>;
    questionTimes: Record<string, number>;
    timeTakenSeconds: number;
    completionStatus: ExamCompletionStatus;
  }) => void;
  onUpdateSessionState: (updates: Partial<ActiveExamSessionData>) => void;
}

export const ExamActiveSession: React.FC<ExamActiveSessionProps> = ({
  sessionData,
  subjects,
  chapters,
  onFinishExam,
  onUpdateSessionState,
}) => {
  const {
    examId,
    title,
    questions,
    durationSeconds,
    startedAt,
    userAnswers: initialUserAnswers,
    questionTimes: initialQuestionTimes,
    markedForReview: initialMarked,
    currentQuestionIndex: initialIndex,
  } = sessionData;

  const [currentIndex, setCurrentIndex] = useState<number>(initialIndex || 0);
  const [userAnswers, setUserAnswers] = useState<Record<string, any>>(
    initialUserAnswers || {},
  );
  const [markedForReview, setMarkedForReview] = useState<
    Record<string, boolean>
  >(initialMarked || {});
  const [questionTimes, setQuestionTimes] = useState<Record<string, number>>(
    initialQuestionTimes || {},
  );

  // Question palette drawer on mobile
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);

  // Modals
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [isExitModalOpen, setIsExitModalOpen] = useState(false);

  // Current Question
  const currentQuestion = questions[currentIndex] || questions[0];
  const qType = currentQuestion ? getQuestionType(currentQuestion) : "mcq";

  // Subject & Chapter names
  const currentSubject = subjects.find(
    (s) => s.id === currentQuestion?.subjectId,
  );
  const currentChapter = chapters.find(
    (c) => c.id === currentQuestion?.chapterId,
  );

  // Timer calculation
  const [timeRemaining, setTimeRemaining] = useState<number>(() => {
    const elapsed = Math.floor((Date.now() - startedAt) / 1000);
    return Math.max(0, durationSeconds - elapsed);
  });

  // Track time spent on current question
  const currentQIdRef = useRef<string>(currentQuestion?.id);
  currentQIdRef.current = currentQuestion?.id;

  // Main 1-second countdown & active timer tick
  useEffect(() => {
    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startedAt) / 1000);
      const remaining = Math.max(0, durationSeconds - elapsed);
      setTimeRemaining(remaining);

      // Increment time spent on current question
      if (currentQIdRef.current) {
        setQuestionTimes((prev) => {
          const prevTime = prev[currentQIdRef.current] || 0;
          return { ...prev, [currentQIdRef.current]: prevTime + 1 };
        });
      }

      // If time hits 0, auto-submit
      if (remaining <= 0) {
        clearInterval(interval);
        handleAutoSubmit();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [startedAt, durationSeconds]);

  // Persist state updates to parent / localStorage
  useEffect(() => {
    onUpdateSessionState({
      userAnswers,
      markedForReview,
      questionTimes,
      currentQuestionIndex: currentIndex,
    });
  }, [userAnswers, markedForReview, questionTimes, currentIndex]);

  // Submit trigger
  const handleAutoSubmit = () => {
    const elapsed = Math.floor((Date.now() - startedAt) / 1000);
    onFinishExam({
      userAnswers,
      questionTimes,
      timeTakenSeconds: Math.min(durationSeconds, elapsed),
      completionStatus: "time_expired",
    });
  };

  const handleManualSubmit = () => {
    setIsSubmitModalOpen(false);
    const elapsed = Math.floor((Date.now() - startedAt) / 1000);
    onFinishExam({
      userAnswers,
      questionTimes,
      timeTakenSeconds: Math.min(durationSeconds, elapsed),
      completionStatus: "completed",
    });
  };

  const handleExitExam = () => {
    setIsExitModalOpen(false);
    const elapsed = Math.floor((Date.now() - startedAt) / 1000);
    onFinishExam({
      userAnswers,
      questionTimes,
      timeTakenSeconds: Math.min(durationSeconds, elapsed),
      completionStatus: "exited",
    });
  };

  // Answering handlers
  const handleMcqSelect = (optionIndex: number) => {
    setUserAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: optionIndex,
    }));
  };

  const handleMsqToggle = (optionIndex: number) => {
    setUserAnswers((prev) => {
      const currentList: number[] = Array.isArray(prev[currentQuestion.id])
        ? prev[currentQuestion.id]
        : [];
      if (currentList.includes(optionIndex)) {
        return {
          ...prev,
          [currentQuestion.id]: currentList.filter((i) => i !== optionIndex),
        };
      } else {
        return {
          ...prev,
          [currentQuestion.id]: [...currentList, optionIndex].sort(
            (a, b) => a - b,
          ),
        };
      }
    });
  };

  const handleNatChange = (val: string) => {
    setUserAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: val,
    }));
  };

  const handleClearResponse = () => {
    setUserAnswers((prev) => {
      const next = { ...prev };
      delete next[currentQuestion.id];
      return next;
    });
  };

  const toggleMarkForReview = () => {
    setMarkedForReview((prev) => ({
      ...prev,
      [currentQuestion.id]: !prev[currentQuestion.id],
    }));
  };

  // Nav
  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  // Statistics for palette and submit modal
  const answeredCount = useMemo(() => {
    return questions.filter((q) => {
      const ans = userAnswers[q.id];
      if (ans === undefined || ans === null || ans === "") return false;
      if (Array.isArray(ans) && ans.length === 0) return false;
      return true;
    }).length;
  }, [questions, userAnswers]);

  const markedCount = useMemo(() => {
    return Object.values(markedForReview).filter(Boolean).length;
  }, [markedForReview]);

  const unansweredCount = questions.length - answeredCount;

  // Format timer
  const formatTimer = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
    if (h > 0) {
      return `${pad(h)}:${pad(m)}:${pad(s)}`;
    }
    return `${pad(m)}:${pad(s)}`;
  };

  const isLowTime = timeRemaining <= 300; // <= 5 min

  // NAT Virtual Keypad
  const handleKeypadPress = (btn: string) => {
    const currentVal = String(userAnswers[currentQuestion.id] || "");
    if (btn === "CLEAR") {
      handleNatChange("");
    } else if (btn === "BACK") {
      handleNatChange(currentVal.slice(0, -1));
    } else if (btn === "-") {
      if (currentVal.startsWith("-")) {
        handleNatChange(currentVal.slice(1));
      } else {
        handleNatChange("-" + currentVal);
      }
    } else if (btn === ".") {
      if (!currentVal.includes(".")) {
        handleNatChange(currentVal + ".");
      }
    } else {
      handleNatChange(currentVal + btn);
    }
  };

  return (
    <div
      id="active-exam-session-root"
      className="min-h-[85vh] flex flex-col space-y-4"
    >
      {/* Top Floating Control Bar */}
      <header className="sticky top-0 z-20 bg-white/95 dark:bg-[#1c1c1e]/95 backdrop-blur-md rounded-2xl border border-[#e5e5ea] dark:border-[#2c2c2e] p-3.5 sm:px-6 shadow-md flex flex-wrap items-center justify-between gap-3">
        {/* Left: Title & Progress */}
        <div className="flex items-center gap-3 min-w-0">
          <div>
            <h1 className="text-base sm:text-lg font-bold text-[#1d1d1f] dark:text-[#f5f5f7] truncate max-w-xs sm:max-w-md">
              {title}
            </h1>
            <div className="flex items-center gap-2 text-xs text-[#86868b] dark:text-[#a1a1a6]">
              <span>
                Q {currentIndex + 1} of {questions.length}
              </span>
              <span>•</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                {answeredCount} Answered
              </span>
              <span>•</span>
              <span>{unansweredCount} Left</span>
            </div>
          </div>
        </div>

        {/* Center: Countdown Timer */}
        <div
          className={`flex items-center gap-2 px-4 py-1.5 rounded-xl font-mono text-sm sm:text-base font-bold transition-all shadow-2xs ${
            isLowTime
              ? "bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400 border border-red-300 dark:border-red-800 animate-pulse ring-2 ring-red-500/20"
              : "bg-[#f5f5f7] dark:bg-[#2c2c2e] text-[#1d1d1f] dark:text-[#f5f5f7] border border-[#e5e5ea] dark:border-[#38383a]"
          }`}
        >
          <Clock
            className={`w-4 h-4 ${isLowTime ? "text-red-600 dark:text-red-400" : "text-[#0071e3]"}`}
          />
          <span>{formatTimer(timeRemaining)}</span>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          {/* Mobile Palette Button */}
          <button
            type="button"
            onClick={() => setIsPaletteOpen(true)}
            className="md:hidden p-2 rounded-xl border border-[#e5e5ea] dark:border-[#38383a] bg-[#f5f5f7] dark:bg-[#2c2c2e] text-[#1d1d1f] dark:text-[#f5f5f7]"
            title="Question Palette"
          >
            <Grid className="w-4 h-4" />
          </button>

          {/* Exit Button */}
          <button
            type="button"
            id="exit-exam-btn"
            onClick={() => setIsExitModalOpen(true)}
            className="px-3 py-1.5 rounded-xl border border-rose-200 dark:border-rose-900/60 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors flex items-center gap-1.5"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Exit Exam</span>
          </button>

          {/* Submit Button */}
          <button
            type="button"
            id="submit-exam-btn"
            onClick={() => setIsSubmitModalOpen(true)}
            className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Submit Test</span>
          </button>
        </div>
      </header>

      {/* Main Examination Stage */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
        {/* Left / Main Question Area (8 columns on desktop) */}
        <main className="md:col-span-8 bg-white dark:bg-[#1c1c1e] rounded-2xl border border-[#e5e5ea] dark:border-[#2c2c2e] p-5 sm:p-7 shadow-xs flex flex-col justify-between min-h-[560px]">
          <div>
            {/* Question Meta Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-4 border-b border-[#e5e5ea] dark:border-[#2c2c2e]">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-[#0071e3] dark:text-[#2997ff] text-xs font-bold border border-blue-200 dark:border-blue-900">
                  {currentQuestion.questionNumber ||
                    `Question ${currentIndex + 1}`}
                </span>
                <QuestionTypeBadge type={qType} />
                {currentSubject && (
                  <span className="text-xs font-medium px-2 py-0.5 rounded-md bg-[#f5f5f7] dark:bg-[#2c2c2e] text-[#86868b] dark:text-[#a1a1a6]">
                    {currentSubject.name}
                  </span>
                )}
                {currentChapter && (
                  <span className="text-xs font-medium px-2 py-0.5 rounded-md bg-[#f5f5f7] dark:bg-[#2c2c2e] text-[#86868b] dark:text-[#a1a1a6]">
                    {currentChapter.name}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3 text-xs font-semibold">
                <span className="text-emerald-600 dark:text-emerald-400">
                  +1 Mark
                </span>
                <span className="text-rose-600 dark:text-rose-400">
                  -1 Mark
                </span>
              </div>
            </div>

            {/* Question Text */}
            <div className="space-y-4 mb-6">
              <div className="text-base sm:text-lg font-medium text-[#1d1d1f] dark:text-[#f5f5f7] leading-relaxed whitespace-pre-wrap">
                {currentQuestion.question || currentQuestion.questionText}
              </div>

              {/* Optional Question Image */}
              {currentQuestion.imageUrl && (
                <div className="my-4 p-2 bg-[#f5f5f7] dark:bg-[#2c2c2e] rounded-xl inline-block max-w-full">
                  <img
                    src={currentQuestion.imageUrl}
                    alt="Question Diagram"
                    referrerPolicy="no-referrer"
                    className="max-h-72 rounded-lg object-contain"
                  />
                </div>
              )}
            </div>

            {/* Interactive Answering Form */}
            <div className="pt-2">
              {/* Type A: MCQ (Single Choice Radio Cards) */}
              {qType === "mcq" && (
                <div className="space-y-2.5">
                  {(
                    currentQuestion.options || [
                      "Option A",
                      "Option B",
                      "Option C",
                      "Option D",
                    ]
                  ).map((optText, optIdx) => {
                    const optLetter =
                      ["A", "B", "C", "D"][optIdx] || `${optIdx + 1}`;
                    const isSelected =
                      userAnswers[currentQuestion.id] === optIdx;

                    return (
                      <button
                        key={optIdx}
                        type="button"
                        onClick={() => handleMcqSelect(optIdx)}
                        className={`w-full p-4 rounded-xl border text-left flex items-start gap-3.5 transition-all cursor-pointer ${
                          isSelected
                            ? "border-[#0071e3] bg-blue-50/60 dark:bg-blue-950/30 text-[#0071e3] dark:text-[#2997ff] ring-2 ring-blue-500/20 shadow-xs"
                            : "border-[#e5e5ea] dark:border-[#38383a] bg-[#fbfbfd] dark:bg-[#252528] text-[#1d1d1f] dark:text-[#f5f5f7] hover:bg-gray-100 dark:hover:bg-[#2c2c2e]"
                        }`}
                      >
                        <span
                          className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 transition-colors ${
                            isSelected
                              ? "bg-[#0071e3] text-white"
                              : "bg-gray-100 dark:bg-[#38383a] text-[#86868b] dark:text-[#a1a1a6]"
                          }`}
                        >
                          {optLetter}
                        </span>
                        <span className="text-sm font-medium pt-0.5 leading-normal flex-1">
                          {optText}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Type B: MSQ (Multiple Select Checkbox Cards) */}
              {qType === "msq" && (
                <div className="space-y-3">
                  <div className="p-2.5 rounded-xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 text-xs text-amber-800 dark:text-amber-300 flex items-center gap-2">
                    <span className="font-bold uppercase tracking-wider text-[10px] px-1.5 py-0.5 bg-amber-200 dark:bg-amber-800 text-amber-900 dark:text-amber-100 rounded">
                      MSQ Rule
                    </span>
                    <span>
                      One or more options may be correct. You must select all
                      correct options with no extras.
                    </span>
                  </div>

                  <div className="space-y-2.5">
                    {(
                      currentQuestion.options || [
                        "Option A",
                        "Option B",
                        "Option C",
                        "Option D",
                      ]
                    ).map((optText, optIdx) => {
                      const optLetter =
                        ["A", "B", "C", "D"][optIdx] || `${optIdx + 1}`;
                      const selectedList: number[] = Array.isArray(
                        userAnswers[currentQuestion.id],
                      )
                        ? userAnswers[currentQuestion.id]
                        : [];
                      const isSelected = selectedList.includes(optIdx);

                      return (
                        <button
                          key={optIdx}
                          type="button"
                          onClick={() => handleMsqToggle(optIdx)}
                          className={`w-full p-4 rounded-xl border text-left flex items-start gap-3.5 transition-all cursor-pointer ${
                            isSelected
                              ? "border-amber-500 bg-amber-50/60 dark:bg-amber-950/30 text-amber-800 dark:text-amber-300 ring-2 ring-amber-500/20 shadow-xs"
                              : "border-[#e5e5ea] dark:border-[#38383a] bg-[#fbfbfd] dark:bg-[#252528] text-[#1d1d1f] dark:text-[#f5f5f7] hover:bg-gray-100 dark:hover:bg-[#2c2c2e]"
                          }`}
                        >
                          <span
                            className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 transition-colors ${
                              isSelected
                                ? "bg-amber-500 text-white"
                                : "bg-gray-100 dark:bg-[#38383a] text-[#86868b] dark:text-[#a1a1a6]"
                            }`}
                          >
                            {optLetter}
                          </span>
                          <span className="text-sm font-medium pt-0.5 leading-normal flex-1">
                            {optText}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Type C: NAT (Numerical Answer Type Input + Official GATE Virtual Dialer) */}
              {qType === "nat" && (
                <div className="space-y-4 max-w-md">
                  <div className="p-3 bg-purple-50/60 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-900/50 rounded-xl text-xs text-purple-900 dark:text-purple-200 flex items-center gap-2">
                    <Hash className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" />
                    <span>
                      <strong className="font-bold">NAT Question:</strong> Use the GATE Virtual Dialer below or your keyboard to enter your answer.
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#86868b] dark:text-[#a1a1a6] uppercase tracking-wider mb-2">
                      Entered Numerical Answer
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="e.g. 4.67 or -128"
                        value={userAnswers[currentQuestion.id] || ""}
                        onChange={(e) => handleNatChange(e.target.value)}
                        className="w-full px-4 py-3 text-xl font-mono font-black rounded-xl border border-[#e5e5ea] dark:border-[#38383a] bg-[#f5f5f7] dark:bg-[#2c2c2e] text-[#1d1d1f] dark:text-[#f5f5f7] focus:outline-none focus:ring-2 focus:ring-[#0071e3]"
                      />
                      <button
                        type="button"
                        onClick={handleClearResponse}
                        className="px-4 py-3 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/30 text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/50 transition-colors"
                      >
                        Clear
                      </button>
                    </div>
                  </div>

                  {/* Virtual Numeric Dialer */}
                  <div className="p-4 bg-[#f5f5f7] dark:bg-[#252528] rounded-2xl border border-[#e5e5ea] dark:border-[#38383a] space-y-3 shadow-2xs">
                    <div className="text-[11px] font-bold text-[#86868b] dark:text-[#a1a1a6] uppercase tracking-wider flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <Hash className="w-3.5 h-3.5" /> GATE Virtual Keypad / Dialer
                      </span>
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">Active</span>
                    </div>

                    <div className="grid grid-cols-4 gap-2">
                      {[
                        { key: "7", label: "7" },
                        { key: "8", label: "8" },
                        { key: "9", label: "9" },
                        { key: "BACK", label: "Backspace ⌫" },
                        { key: "4", label: "4" },
                        { key: "5", label: "5" },
                        { key: "6", label: "6" },
                        { key: "-", label: "+/- Sign" },
                        { key: "1", label: "1" },
                        { key: "2", label: "2" },
                        { key: "3", label: "3" },
                        { key: ".", label: "Decimal ." },
                        { key: "0", label: "0" },
                        { key: "CLEAR", label: "Clear All" },
                      ].map(({ key, label }) => {
                        const isSpecial = ["BACK", "CLEAR", "-", "."].includes(key);
                        const isColSpan = key === "0" || key === "CLEAR" ? "col-span-2" : "";

                        return (
                          <button
                            key={key}
                            type="button"
                            onClick={() => handleKeypadPress(key)}
                            className={`${isColSpan} py-3 rounded-xl border font-mono font-extrabold text-base transition-all active:scale-95 shadow-2xs flex items-center justify-center ${
                              isSpecial
                                ? "bg-[#e5e5ea] dark:bg-[#38383a] border-gray-300 dark:border-gray-600 text-[#1d1d1f] dark:text-[#f5f5f7] hover:bg-gray-300 dark:hover:bg-[#48484a]"
                                : "bg-white dark:bg-[#1c1c1e] border-[#e5e5ea] dark:border-[#38383a] text-[#1d1d1f] dark:text-[#f5f5f7] hover:bg-blue-50 dark:hover:bg-blue-950/40 hover:border-blue-300"
                            }`}
                          >
                            {key === "BACK" ? "⌫" : key === "CLEAR" ? "Clear" : key}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Bottom Action Controls */}
          <div className="pt-6 mt-6 border-t border-[#e5e5ea] dark:border-[#2c2c2e] flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              {/* Mark for Review */}
              <button
                type="button"
                onClick={toggleMarkForReview}
                className={`px-3.5 py-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  markedForReview[currentQuestion.id]
                    ? "border-purple-500 bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300"
                    : "border-[#e5e5ea] dark:border-[#38383a] text-[#86868b] dark:text-[#a1a1a6] hover:bg-gray-100 dark:hover:bg-[#2c2c2e]"
                }`}
              >
                <Flag
                  className={`w-3.5 h-3.5 ${markedForReview[currentQuestion.id] ? "fill-current" : ""}`}
                />
                <span>
                  {markedForReview[currentQuestion.id]
                    ? "Marked for Review"
                    : "Mark for Review"}
                </span>
              </button>

              {/* Clear Response */}
              <button
                type="button"
                onClick={handleClearResponse}
                className="px-3 py-2 rounded-xl text-xs font-medium text-[#86868b] hover:text-[#1d1d1f] dark:hover:text-[#f5f5f7] hover:bg-gray-100 dark:hover:bg-[#2c2c2e] transition-colors"
              >
                Clear Response
              </button>
            </div>

            {/* Prev / Next buttons */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePrev}
                disabled={currentIndex === 0}
                className={`px-4 py-2 rounded-xl border text-xs font-semibold flex items-center gap-1 transition-all ${
                  currentIndex === 0
                    ? "border-transparent text-gray-400 dark:text-gray-600 cursor-not-allowed"
                    : "border-[#e5e5ea] dark:border-[#38383a] text-[#1d1d1f] dark:text-[#f5f5f7] hover:bg-gray-100 dark:hover:bg-[#2c2c2e]"
                }`}
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous</span>
              </button>

              <button
                type="button"
                onClick={handleNext}
                disabled={currentIndex === questions.length - 1}
                className={`px-5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1 transition-all ${
                  currentIndex === questions.length - 1
                    ? "bg-gray-200 dark:bg-gray-800 text-gray-400 cursor-not-allowed"
                    : "bg-[#0071e3] hover:bg-[#0077ed] text-white shadow-xs"
                }`}
              >
                <span>Save & Next</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </main>

        {/* Right / Question Palette (4 columns on desktop, hidden on mobile unless drawer opened) */}
        <aside className="hidden md:block md:col-span-4 bg-white dark:bg-[#1c1c1e] rounded-2xl border border-[#e5e5ea] dark:border-[#2c2c2e] p-5 shadow-xs space-y-5 sticky top-20">
          <div>
            <h3 className="text-sm font-bold text-[#1d1d1f] dark:text-[#f5f5f7]">
              Question Palette
            </h3>
            <p className="text-xs text-[#86868b] dark:text-[#a1a1a6]">
              Click any number to jump directly
            </p>
          </div>

          {/* Legend */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 rounded-md bg-emerald-500" />
              <span className="text-[#1d1d1f] dark:text-[#f5f5f7]">
                Answered ({answeredCount})
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 rounded-md bg-gray-200 dark:bg-[#38383a]" />
              <span className="text-[#86868b]">
                Unattempted ({unansweredCount})
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 rounded-md bg-purple-500" />
              <span className="text-purple-600 dark:text-purple-400 font-medium">
                Review ({markedCount})
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 rounded-md border-2 border-[#0071e3]" />
              <span className="text-[#0071e3] font-medium">Current</span>
            </div>
          </div>

          {/* Numbers Grid */}
          <div className="grid grid-cols-5 gap-2 max-h-80 overflow-y-auto pr-1">
            {questions.map((q, idx) => {
              const isCurrent = idx === currentIndex;
              const isAnswered =
                userAnswers[q.id] !== undefined &&
                userAnswers[q.id] !== null &&
                userAnswers[q.id] !== "" &&
                (!Array.isArray(userAnswers[q.id]) ||
                  userAnswers[q.id].length > 0);
              const isMarked = Boolean(markedForReview[q.id]);

              let btnStyle =
                "bg-gray-100 dark:bg-[#2c2c2e] text-[#86868b] dark:text-[#a1a1a6] border-[#e5e5ea] dark:border-[#38383a]";

              if (isMarked) {
                btnStyle =
                  "bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300 border-purple-300 dark:border-purple-800 font-bold";
              } else if (isAnswered) {
                btnStyle =
                  "bg-emerald-500 text-white border-emerald-600 font-bold shadow-2xs";
              }

              return (
                <button
                  key={q.id}
                  type="button"
                  onClick={() => setCurrentIndex(idx)}
                  className={`h-9 rounded-lg border text-xs font-semibold flex items-center justify-center transition-all ${btnStyle} ${
                    isCurrent
                      ? "ring-2 ring-[#0071e3] scale-105 z-10"
                      : "hover:opacity-80"
                  }`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>

          <div className="pt-2 border-t border-[#e5e5ea] dark:border-[#2c2c2e]">
            <button
              type="button"
              onClick={() => setIsSubmitModalOpen(true)}
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Submit Examination</span>
            </button>
          </div>
        </aside>
      </div>

      {/* Mobile Question Palette Drawer */}
      {isPaletteOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex justify-end md:hidden">
          <div className="w-4/5 max-w-sm h-full bg-white dark:bg-[#1c1c1e] p-5 shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-200">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-[#e5e5ea] dark:border-[#2c2c2e] mb-4">
                <h3 className="font-bold text-sm text-[#1d1d1f] dark:text-[#f5f5f7]">
                  Question Palette
                </h3>
                <button
                  type="button"
                  onClick={() => setIsPaletteOpen(false)}
                  className="p-1 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-[#2c2c2e]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Numbers Grid */}
              <div className="grid grid-cols-4 gap-2 max-h-[70vh] overflow-y-auto">
                {questions.map((q, idx) => {
                  const isCurrent = idx === currentIndex;
                  const isAnswered =
                    userAnswers[q.id] !== undefined &&
                    userAnswers[q.id] !== null &&
                    userAnswers[q.id] !== "" &&
                    (!Array.isArray(userAnswers[q.id]) ||
                      userAnswers[q.id].length > 0);
                  const isMarked = Boolean(markedForReview[q.id]);

                  let btnStyle = "bg-gray-100 dark:bg-[#2c2c2e] text-[#86868b]";
                  if (isMarked) {
                    btnStyle = "bg-purple-500 text-white";
                  } else if (isAnswered) {
                    btnStyle = "bg-emerald-500 text-white";
                  }

                  return (
                    <button
                      key={q.id}
                      type="button"
                      onClick={() => {
                        setCurrentIndex(idx);
                        setIsPaletteOpen(false);
                      }}
                      className={`h-10 rounded-lg text-xs font-bold border transition-all ${btnStyle} ${
                        isCurrent ? "ring-2 ring-blue-500 scale-105" : ""
                      }`}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setIsPaletteOpen(false);
                setIsSubmitModalOpen(true);
              }}
              className="w-full py-3 rounded-xl bg-emerald-600 text-white font-bold text-xs shadow-md"
            >
              Submit Test Now
            </button>
          </div>
        </div>
      )}

      {/* Confirmation Modal: Submit Exam */}
      {isSubmitModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-[#1c1c1e] rounded-2xl border border-[#e5e5ea] dark:border-[#2c2c2e] p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#1d1d1f] dark:text-[#f5f5f7]">
                  Submit Examination
                </h3>
                <p className="text-xs text-[#86868b] dark:text-[#a1a1a6]">
                  Are you ready to submit your exam responses?
                </p>
              </div>
            </div>

            {/* Quick Summary Grid */}
            <div className="grid grid-cols-3 gap-2 p-3.5 rounded-xl bg-[#f5f5f7] dark:bg-[#252528] border border-[#e5e5ea] dark:border-[#38383a] text-center">
              <div>
                <span className="text-[11px] text-[#86868b] block">
                  Answered
                </span>
                <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                  {answeredCount}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-[#86868b] block">
                  Unanswered
                </span>
                <span className="text-sm font-bold text-[#1d1d1f] dark:text-[#f5f5f7]">
                  {unansweredCount}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-[#86868b] block">Marked</span>
                <span className="text-sm font-bold text-purple-600 dark:text-purple-400">
                  {markedCount}
                </span>
              </div>
            </div>

            {unansweredCount > 0 && (
              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 text-xs text-amber-800 dark:text-amber-300">
                ⚠️ You still have <strong>{unansweredCount}</strong> unanswered
                questions. Unanswered questions receive 0 marks.
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsSubmitModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-[#86868b] hover:bg-gray-100 dark:hover:bg-[#2c2c2e]"
              >
                Keep Reviewing
              </button>
              <button
                type="button"
                id="confirm-submit-exam-btn"
                onClick={handleManualSubmit}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md"
              >
                Yes, Submit Exam
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal: Exit Exam */}
      {isExitModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-[#1c1c1e] rounded-2xl border border-[#e5e5ea] dark:border-[#2c2c2e] p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#1d1d1f] dark:text-[#f5f5f7]">
                  Exit Examination?
                </h3>
                <p className="text-xs text-[#86868b] dark:text-[#a1a1a6]">
                  Your test will end immediately
                </p>
              </div>
            </div>

            <p className="text-xs text-[#86868b] dark:text-[#a1a1a6] leading-relaxed">
              Exiting will submit your current responses so far and calculate
              your final score. Any unanswered questions will receive 0 marks.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsExitModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-[#86868b] hover:bg-gray-100 dark:hover:bg-[#2c2c2e]"
              >
                Cancel & Continue Test
              </button>
              <button
                type="button"
                id="confirm-exit-exam-btn"
                onClick={handleExitExam}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md"
              >
                Yes, Exit & View Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState, useMemo } from "react";
import {
  Trophy,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowLeft,
  RotateCcw,
  Zap,
  TrendingUp,
  AlertTriangle,
  HelpCircle,
  Layers,
  ChevronDown,
  ChevronUp,
  Filter,
  Check,
  X,
  Target,
  FileText,
  Share2,
} from "lucide-react";
import { ExamReportData, QuestionType, ExamQuestionResult } from "../../types";
import { QuestionTypeBadge } from "../common/Badge";

interface ExamReportViewProps {
  report: ExamReportData;
  onBackToHistory: () => void;
  onTakeAnotherExam: () => void;
  onRetakeExam?: () => void;
}

export const ExamReportView: React.FC<ExamReportViewProps> = ({
  report,
  onBackToHistory,
  onTakeAnotherExam,
  onRetakeExam,
}) => {
  const [filterStatus, setFilterStatus] = useState<
    "all" | "correct" | "wrong" | "unattempted"
  >("all");
  const [filterType, setFilterType] = useState<"all" | QuestionType>("all");
  const [expandedQuestions, setExpandedQuestions] = useState<
    Record<string, boolean>
  >({});

  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    if (m === 0) return `${s}s`;
    return `${m}m ${s}s`;
  };

  const toggleQuestionExpanded = (qId: string) => {
    setExpandedQuestions((prev) => ({ ...prev, [qId]: !prev[qId] }));
  };

  // Filtered Questions list
  const filteredQuestions = useMemo(() => {
    return report.questions.filter((q) => {
      if (filterStatus === "correct" && !q.isCorrect) return false;
      if (filterStatus === "wrong" && (!q.isAttempted || q.isCorrect))
        return false;
      if (filterStatus === "unattempted" && q.isAttempted) return false;
      if (filterType !== "all" && q.questionType !== filterType) return false;
      return true;
    });
  }, [report.questions, filterStatus, filterType]);

  // Weak and strong topics
  const strongTopics = useMemo(() => {
    return report.topicStats.filter((t) => t.category === "strong");
  }, [report.topicStats]);

  const weakTopics = useMemo(() => {
    return report.topicStats.filter((t) => t.category === "weak");
  }, [report.topicStats]);

  // Completion status label
  const statusLabel = useMemo(() => {
    switch (report.completionStatus) {
      case "completed":
        return {
          label: "Completed Submitted",
          color:
            "text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800",
        };
      case "time_expired":
        return {
          label: "Timer Expired",
          color:
            "text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800",
        };
      case "exited":
        return {
          label: "Exited Early",
          color:
            "text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800",
        };
      default:
        return {
          label: "Completed",
          color:
            "text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800",
        };
    }
  }, [report.completionStatus]);

  return (
    <div
      id="exam-report-view-container"
      className="space-y-7 max-w-5xl mx-auto pb-16"
    >
      {/* Top Action Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={onBackToHistory}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-[#e5e5ea] dark:border-[#38383a] bg-white dark:bg-[#1c1c1e] text-xs font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] hover:bg-gray-100 dark:hover:bg-[#2c2c2e] transition-colors shadow-2xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Exam History</span>
        </button>

        <div className="flex items-center gap-2">
          {onRetakeExam && (
            <button
              type="button"
              onClick={onRetakeExam}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[#e5e5ea] dark:border-[#38383a] bg-white dark:bg-[#1c1c1e] text-xs font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] hover:bg-gray-100 dark:hover:bg-[#2c2c2e] transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Retake Exam</span>
            </button>
          )}

          <button
            type="button"
            onClick={onTakeAnotherExam}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0071e3] hover:bg-[#0077ed] text-white text-xs font-bold transition-all shadow-xs"
          >
            <Zap className="w-3.5 h-3.5 fill-current" />
            <span>New Practice Exam</span>
          </button>
        </div>
      </div>

      {/* 1. Overall Performance Hero Card */}
      <div className="bg-white dark:bg-[#1c1c1e] rounded-3xl border border-[#e5e5ea] dark:border-[#2c2c2e] p-6 sm:p-8 shadow-sm space-y-6 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#e5e5ea] dark:border-[#2c2c2e]">
          <div>
            <div className="flex items-center gap-2.5 mb-2">
              <span
                className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${statusLabel.color}`}
              >
                {statusLabel.label}
              </span>
              <span className="text-xs text-[#86868b] dark:text-[#a1a1a6]">
                {report.date} • {formatSeconds(report.timeTakenSeconds)} taken
                of {report.durationMinutes}m
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1d1d1f] dark:text-[#f5f5f7]">
              {report.title}
            </h1>
            <p className="text-xs text-[#86868b] dark:text-[#a1a1a6] mt-1">
              Syllabus Scope:{" "}
              <strong className="text-[#1d1d1f] dark:text-[#f5f5f7] capitalize">
                {report.syllabusScope.replace("_", " ")}
              </strong>{" "}
              ({report.subjectNames.join(", ")})
            </p>
          </div>

          {/* Primary Score Badge */}
          <div className="flex items-center gap-4 bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/50 rounded-2xl p-4 shrink-0">
            <div className="w-12 h-12 rounded-xl bg-[#0071e3] text-white flex items-center justify-center font-bold shadow-sm">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-semibold text-[#86868b] uppercase tracking-wider block">
                Final Score
              </span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl font-black text-[#1d1d1f] dark:text-[#f5f5f7]">
                  {report.obtainedMarks}
                </span>
                <span className="text-sm font-semibold text-[#86868b]">
                  / {report.totalMarks} Marks
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* KPI Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-[#fbfbfd] dark:bg-[#252528] border border-[#e5e5ea] dark:border-[#38383a]">
            <span className="text-xs font-medium text-[#86868b] block mb-1">
              Percentage
            </span>
            <div className="text-xl font-bold text-[#1d1d1f] dark:text-[#f5f5f7]">
              {report.percentage}%
            </div>
            <span className="text-[11px] text-[#86868b] block mt-1">
              Marks percentage
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-[#fbfbfd] dark:bg-[#252528] border border-[#e5e5ea] dark:border-[#38383a]">
            <span className="text-xs font-medium text-[#86868b] block mb-1">
              Accuracy
            </span>
            <div className="text-xl font-bold text-[#0071e3] dark:text-[#2997ff]">
              {report.accuracy}%
            </div>
            <span className="text-[11px] text-[#86868b] block mt-1">
              Of attempted questions
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-[#fbfbfd] dark:bg-[#252528] border border-[#e5e5ea] dark:border-[#38383a]">
            <span className="text-xs font-medium text-[#86868b] block mb-1">
              Marking Breakdown
            </span>
            <div className="flex items-center gap-2 text-sm font-bold">
              <span className="text-emerald-600 dark:text-emerald-400">
                +{report.positiveMarks}
              </span>
              <span className="text-[#86868b]">/</span>
              <span className="text-rose-600 dark:text-rose-400">
                -{report.negativeMarks}
              </span>
            </div>
            <span className="text-[11px] text-[#86868b] block mt-1">
              Correct vs negative penalty
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-[#fbfbfd] dark:bg-[#252528] border border-[#e5e5ea] dark:border-[#38383a]">
            <span className="text-xs font-medium text-[#86868b] block mb-1">
              Avg Time / Question
            </span>
            <div className="text-xl font-bold text-[#1d1d1f] dark:text-[#f5f5f7]">
              {formatSeconds(report.avgTimePerQuestionSeconds)}
            </div>
            <span className="text-[11px] text-[#86868b] block mt-1">
              Overall pacing
            </span>
          </div>
        </div>

        {/* Question Counts Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <div>
              <div className="text-base font-bold text-emerald-900 dark:text-emerald-200">
                {report.correctQuestions} Correct
              </div>
              <div className="text-[11px] text-emerald-700 dark:text-emerald-400">
                +1 mark each
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-xl bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/60">
            <XCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0" />
            <div>
              <div className="text-base font-bold text-rose-900 dark:text-rose-200">
                {report.wrongQuestions} Incorrect
              </div>
              <div className="text-[11px] text-rose-700 dark:text-rose-400">
                -1 mark each
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-100 dark:bg-[#2c2c2e] border border-[#e5e5ea] dark:border-[#38383a]">
            <HelpCircle className="w-5 h-5 text-gray-500 shrink-0" />
            <div>
              <div className="text-base font-bold text-[#1d1d1f] dark:text-[#f5f5f7]">
                {report.unattemptedQuestions} Unattempted
              </div>
              <div className="text-[11px] text-[#86868b]">0 marks</div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/60">
            <Target className="w-5 h-5 text-[#0071e3] shrink-0" />
            <div>
              <div className="text-base font-bold text-blue-900 dark:text-blue-200">
                {report.attemptedQuestions} / {report.totalQuestions}
              </div>
              <div className="text-[11px] text-blue-700 dark:text-blue-400">
                Total attempted
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Question-Type Breakdown (Section 26) */}
      <div className="bg-white dark:bg-[#1c1c1e] rounded-2xl border border-[#e5e5ea] dark:border-[#2c2c2e] p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-[#1d1d1f] dark:text-[#f5f5f7]">
              Performance by Question Type
            </h2>
            <p className="text-xs text-[#86868b] dark:text-[#a1a1a6]">
              Detailed breakdown across MCQ (single choice), MSQ (multiple
              choice), and NAT (numerical answer)
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {(["mcq", "msq", "nat"] as QuestionType[]).map((t) => {
            const stat = report.typeStats[t];
            const titleMap = {
              mcq: "MCQ (Multiple Choice)",
              msq: "MSQ (Multiple Select)",
              nat: "NAT (Numerical Answer)",
            };

            return (
              <div
                key={t}
                className="p-4 rounded-xl border border-[#e5e5ea] dark:border-[#38383a] bg-[#fbfbfd] dark:bg-[#252528] space-y-3"
              >
                <div className="flex items-center justify-between">
                  <QuestionTypeBadge type={t} />
                  <span className="text-xs font-bold text-[#1d1d1f] dark:text-[#f5f5f7]">
                    {stat.total} Questions
                  </span>
                </div>

                <div className="space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[#86868b]">Correct:</span>
                    <strong className="text-emerald-600 dark:text-emerald-400">
                      {stat.correct}
                    </strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#86868b]">Wrong:</span>
                    <strong className="text-rose-600 dark:text-rose-400">
                      {stat.wrong}
                    </strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#86868b]">Unattempted:</span>
                    <strong className="text-[#86868b]">
                      {stat.unattempted}
                    </strong>
                  </div>
                </div>

                <div className="pt-2 border-t border-[#e5e5ea] dark:border-[#38383a] flex items-center justify-between">
                  <span className="text-xs text-[#86868b]">Accuracy:</span>
                  <span className="text-sm font-bold text-[#0071e3] dark:text-[#2997ff]">
                    {stat.accuracy}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Weak & Strong Areas (Section 13) & Timing Analysis (Section 14) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Topic Breakdown / Weak vs Strong */}
        <div className="bg-white dark:bg-[#1c1c1e] rounded-2xl border border-[#e5e5ea] dark:border-[#2c2c2e] p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-[#1d1d1f] dark:text-[#f5f5f7] flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#0071e3]" />
              <span>Topic Diagnostics</span>
            </h2>
          </div>

          <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
            {report.topicStats.map((topic, idx) => {
              const isStrong = topic.category === "strong";
              const isWeak = topic.category === "weak";

              return (
                <div
                  key={idx}
                  className="p-3 rounded-xl border border-[#e5e5ea] dark:border-[#38383a] bg-[#fbfbfd] dark:bg-[#252528] flex items-center justify-between gap-3"
                >
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] truncate">
                      {topic.chapterName}
                    </div>
                    <div className="text-[11px] text-[#86868b] dark:text-[#a1a1a6]">
                      {topic.subjectName} • {topic.correct}/{topic.attempted}{" "}
                      correct ({topic.total} total)
                    </div>
                  </div>

                  <div className="shrink-0 flex items-center gap-2">
                    <span
                      className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${
                        isStrong
                          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                          : isWeak
                            ? "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300"
                            : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
                      }`}
                    >
                      {isStrong
                        ? "Strong Area"
                        : isWeak
                          ? "Weak Area"
                          : "Moderate"}
                    </span>
                    <span className="text-xs font-bold text-[#1d1d1f] dark:text-[#f5f5f7] w-10 text-right">
                      {topic.accuracy}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Time Analysis (Section 14) */}
        <div className="bg-white dark:bg-[#1c1c1e] rounded-2xl border border-[#e5e5ea] dark:border-[#2c2c2e] p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-[#1d1d1f] dark:text-[#f5f5f7] flex items-center gap-2">
              <Clock className="w-4 h-4 text-orange-500" />
              <span>Time & Pace Analysis</span>
            </h2>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3.5 rounded-xl border border-[#e5e5ea] dark:border-[#38383a] bg-[#fbfbfd] dark:bg-[#252528]">
              <span className="text-[11px] text-[#86868b] block mb-1">
                Fastest Question
              </span>
              <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                {report.fastestQuestion
                  ? `${report.fastestQuestion.questionNumber} (${formatSeconds(report.fastestQuestion.seconds)})`
                  : "N/A"}
              </div>
              <span className="text-[10px] text-[#86868b] block mt-0.5">
                Speed bonus
              </span>
            </div>

            <div className="p-3.5 rounded-xl border border-[#e5e5ea] dark:border-[#38383a] bg-[#fbfbfd] dark:bg-[#252528]">
              <span className="text-[11px] text-[#86868b] block mb-1">
                Slowest Question
              </span>
              <div className="text-sm font-bold text-orange-600 dark:text-orange-400">
                {report.slowestQuestion
                  ? `${report.slowestQuestion.questionNumber} (${formatSeconds(report.slowestQuestion.seconds)})`
                  : "N/A"}
              </div>
              <span className="text-[10px] text-[#86868b] block mt-0.5">
                Most time invested
              </span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 text-xs space-y-1">
            <span className="font-bold text-[#0071e3] dark:text-[#2997ff] block">
              Exam Time Management Tip
            </span>
            <p className="text-[#1d1d1f] dark:text-[#f5f5f7] leading-relaxed">
              Target spending ~1.5 to 2 minutes on 1-mark questions and ~3
              minutes on 2-mark multi-step calculations. Skip difficult
              questions on your first pass and use Mark for Review.
            </p>
          </div>
        </div>
      </div>

      {/* 4. Question-by-Question Analysis & Detailed Solutions */}
      <div className="bg-white dark:bg-[#1c1c1e] rounded-2xl border border-[#e5e5ea] dark:border-[#2c2c2e] p-6 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-[#1d1d1f] dark:text-[#f5f5f7]">
              Detailed Question Analysis & Answer Key
            </h2>
            <p className="text-xs text-[#86868b] dark:text-[#a1a1a6]">
              Review your responses against official keys with step-by-step
              explanations
            </p>
          </div>

          {/* Filter Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-[#f5f5f7] dark:bg-[#2c2c2e]">
            {[
              { id: "all", label: `All (${report.questions.length})` },
              { id: "correct", label: `Correct (${report.correctQuestions})` },
              { id: "wrong", label: `Wrong (${report.wrongQuestions})` },
              {
                id: "unattempted",
                label: `Unattempted (${report.unattemptedQuestions})`,
              },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setFilterStatus(tab.id as any)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  filterStatus === tab.id
                    ? "bg-white dark:bg-[#1c1c1e] text-[#1d1d1f] dark:text-[#f5f5f7] shadow-2xs"
                    : "text-[#86868b] dark:text-[#a1a1a6] hover:text-[#1d1d1f]"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Questions List */}
        <div className="space-y-4">
          {filteredQuestions.length === 0 ? (
            <div className="p-8 text-center text-xs text-[#86868b]">
              No questions found matching this filter.
            </div>
          ) : (
            filteredQuestions.map((q, qIndex) => {
              const isExpanded = expandedQuestions[q.questionId] ?? true; // default expanded

              return (
                <div
                  key={q.questionId}
                  className={`rounded-2xl border transition-all ${
                    q.isCorrect
                      ? "border-emerald-200 dark:border-emerald-800/60 bg-emerald-50/10"
                      : !q.isAttempted
                        ? "border-[#e5e5ea] dark:border-[#38383a] bg-white dark:bg-[#1c1c1e]"
                        : "border-rose-200 dark:border-rose-800/60 bg-rose-50/10"
                  }`}
                >
                  {/* Question Header Card */}
                  <div
                    onClick={() => toggleQuestionExpanded(q.questionId)}
                    className="p-4 sm:p-5 flex items-center justify-between gap-3 cursor-pointer select-none"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono font-bold text-xs px-2.5 py-1 rounded-lg bg-[#f5f5f7] dark:bg-[#2c2c2e] text-[#1d1d1f] dark:text-[#f5f5f7]">
                        {q.questionNumber || `Q.${qIndex + 1}`}
                      </span>
                      <QuestionTypeBadge type={q.questionType} />
                      <span className="text-xs text-[#86868b] dark:text-[#a1a1a6]">
                        {q.subjectName} • {q.chapterName}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      {/* Status Tag */}
                      {q.isCorrect ? (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/60 px-2.5 py-0.5 rounded-full">
                          <Check className="w-3.5 h-3.5" />
                          +1 Mark
                        </span>
                      ) : !q.isAttempted ? (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#86868b] bg-gray-100 dark:bg-[#2c2c2e] px-2.5 py-0.5 rounded-full">
                          Unattempted (0 Marks)
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-700 dark:text-rose-400 bg-rose-100 dark:bg-rose-950/60 px-2.5 py-0.5 rounded-full">
                          <X className="w-3.5 h-3.5" />
                          -1 Mark
                        </span>
                      )}

                      <span className="text-xs text-[#86868b] hidden sm:inline">
                        ⏱️ {formatSeconds(q.timeSpentSeconds)}
                      </span>

                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-[#86868b]" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-[#86868b]" />
                      )}
                    </div>
                  </div>

                  {/* Question Body */}
                  {isExpanded && (
                    <div className="px-5 pb-5 pt-1 space-y-4 border-t border-[#e5e5ea] dark:border-[#2c2c2e]/60 text-sm">
                      {/* Question Text */}
                      <p className="font-medium text-[#1d1d1f] dark:text-[#f5f5f7] leading-relaxed whitespace-pre-wrap">
                        {q.questionText}
                      </p>

                      {/* Image if any */}
                      {q.imageUrl && (
                        <div className="p-2 bg-[#f5f5f7] dark:bg-[#2c2c2e] rounded-xl inline-block max-w-full">
                          <img
                            src={q.imageUrl}
                            alt="Question Diagram"
                            referrerPolicy="no-referrer"
                            className="max-h-60 rounded-lg object-contain"
                          />
                        </div>
                      )}

                      {/* Options listing for MCQ & MSQ */}
                      {q.options && q.options.length > 0 && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                          {q.options.map((opt, oIdx) => {
                            const optLetter =
                              ["A", "B", "C", "D"][oIdx] || String(oIdx + 1);
                            return (
                              <div
                                key={oIdx}
                                className="p-2.5 rounded-xl border border-[#e5e5ea] dark:border-[#38383a] bg-[#fbfbfd] dark:bg-[#252528] text-xs flex items-start gap-2"
                              >
                                <span className="font-bold text-[#86868b]">
                                  {optLetter}.
                                </span>
                                <span className="text-[#1d1d1f] dark:text-[#f5f5f7] leading-relaxed">
                                  {opt}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* Comparison: Your Answer vs Correct Answer */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-xl bg-[#f5f5f7] dark:bg-[#252528] border border-[#e5e5ea] dark:border-[#38383a] text-xs">
                        <div>
                          <span className="text-[11px] font-semibold text-[#86868b] uppercase tracking-wider block mb-1">
                            Your Answer
                          </span>
                          <span
                            className={`font-bold ${
                              q.isCorrect
                                ? "text-emerald-600 dark:text-emerald-400"
                                : !q.isAttempted
                                  ? "text-[#86868b]"
                                  : "text-rose-600 dark:text-rose-400"
                            }`}
                          >
                            {q.userAnswer}
                          </span>
                        </div>

                        <div>
                          <span className="text-[11px] font-semibold text-[#86868b] uppercase tracking-wider block mb-1">
                            Correct Answer Key
                          </span>
                          <span className="font-bold text-emerald-600 dark:text-emerald-400">
                            {q.correctAnswer}
                          </span>
                        </div>
                      </div>

                      {/* Explanation */}
                      {q.explanation && (
                        <div className="p-3.5 rounded-xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/60 text-xs space-y-1">
                          <span className="font-bold text-[#0071e3] dark:text-[#2997ff] block">
                            Explanation & Solution:
                          </span>
                          <p className="text-[#1d1d1f] dark:text-[#f5f5f7] leading-relaxed whitespace-pre-wrap">
                            {q.explanation}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

import React, { useState } from "react";
import {
  Trophy,
  Calendar,
  Clock,
  ArrowRight,
  Trash2,
  Play,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  FileText,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import { Exam } from "../../types";

interface ExamHistoryListProps {
  exams: Exam[];
  onSelectExamReport: (exam: Exam) => void;
  onTakeNewExam: () => void;
  onDeleteExam: (examId: string) => void;
  onRetakeExam?: (exam: Exam) => void;
}

export const ExamHistoryList: React.FC<ExamHistoryListProps> = ({
  exams,
  onSelectExamReport,
  onTakeNewExam,
  onDeleteExam,
  onRetakeExam,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Filter exams that have reportData or completed exams
  const completedExams = exams.filter(
    (e) => e.reportData || e.status === "completed",
  );

  const filteredExams = completedExams.filter((e) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      e.title.toLowerCase().includes(term) ||
      (e.notes && e.notes.toLowerCase().includes(term)) ||
      (e.reportData?.syllabusScope &&
        e.reportData.syllabusScope.toLowerCase().includes(term))
    );
  });

  const handleDelete = (examId: string) => {
    onDeleteExam(examId);
    setDeleteConfirmId(null);
  };

  return (
    <div id="exam-history-list-container" className="space-y-6">
      {/* Top Banner & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-[#1d1d1f] dark:text-[#f5f5f7]">
            Exam History & Detailed Reports
          </h2>
          <p className="text-xs text-[#86868b] dark:text-[#a1a1a6]">
            Review all completed practice tests, answer keys, and performance
            diagnostics
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-[#86868b] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search tests..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 rounded-xl border border-[#e5e5ea] dark:border-[#38383a] bg-white dark:bg-[#1c1c1e] text-xs text-[#1d1d1f] dark:text-[#f5f5f7] focus:outline-none focus:ring-2 focus:ring-[#0071e3]"
            />
          </div>

          <button
            type="button"
            onClick={onTakeNewExam}
            className="px-4 py-2 rounded-xl bg-[#0071e3] hover:bg-[#0077ed] text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 shrink-0"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>New Exam</span>
          </button>
        </div>
      </div>

      {/* List */}
      {filteredExams.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-[#1c1c1e] rounded-2xl border border-[#e5e5ea] dark:border-[#2c2c2e] space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-[#0071e3] dark:text-[#2997ff] flex items-center justify-center mx-auto">
            <Trophy className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-[#1d1d1f] dark:text-[#f5f5f7]">
            No Completed Exams Yet
          </h3>
          <p className="text-xs text-[#86868b] dark:text-[#a1a1a6] max-w-sm mx-auto">
            Take a mock test or custom practice exam to generate deep
            diagnostics, accuracy metrics, and question-by-question reviews.
          </p>
          <button
            type="button"
            onClick={onTakeNewExam}
            className="mt-2 px-4 py-2 rounded-xl bg-[#0071e3] text-white text-xs font-bold shadow-xs hover:bg-[#0077ed]"
          >
            Start Practice Exam
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3.5">
          {filteredExams.map((exam) => {
            const report = exam.reportData;
            const score = report?.obtainedMarks ?? exam.score ?? 0;
            const totalMarks = report?.totalMarks ?? exam.totalMarks ?? 100;
            const accuracy =
              report?.accuracy ??
              (exam.score && exam.totalMarks
                ? Math.round((exam.score / exam.totalMarks) * 100)
                : 0);
            const durationMin =
              report?.durationMinutes ?? exam.durationMinutes ?? 60;
            const scope =
              report?.syllabusScope ??
              (exam.subjectId ? "Single Subject" : "Full Syllabus");

            return (
              <div
                key={exam.id}
                className="bg-white dark:bg-[#1c1c1e] rounded-2xl border border-[#e5e5ea] dark:border-[#2c2c2e] p-5 shadow-xs hover:border-[#0071e3]/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-[#0071e3] dark:bg-blue-950/40 dark:text-[#2997ff] border border-blue-200 dark:border-blue-900/60 uppercase">
                      {scope.replace("_", " ")}
                    </span>
                    <span className="text-xs text-[#86868b] dark:text-[#a1a1a6] flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{exam.date || exam.createdAt}</span>
                    </span>
                    <span className="text-xs text-[#86868b] dark:text-[#a1a1a6] flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{durationMin}m</span>
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-[#1d1d1f] dark:text-[#f5f5f7] truncate">
                    {exam.title}
                  </h3>

                  {report && (
                    <div className="flex flex-wrap items-center gap-3 text-xs text-[#86868b] dark:text-[#a1a1a6]">
                      <span>
                        <strong className="text-emerald-600 dark:text-emerald-400">
                          {report.correctQuestions}
                        </strong>{" "}
                        Correct
                      </span>
                      <span>•</span>
                      <span>
                        <strong className="text-rose-600 dark:text-rose-400">
                          {report.wrongQuestions}
                        </strong>{" "}
                        Wrong
                      </span>
                      <span>•</span>
                      <span>
                        <strong className="text-[#1d1d1f] dark:text-[#f5f5f7]">
                          {report.unattemptedQuestions}
                        </strong>{" "}
                        Unattempted
                      </span>
                    </div>
                  )}
                </div>

                {/* Score and CTAs */}
                <div className="flex items-center gap-4 shrink-0 justify-between sm:justify-end border-t sm:border-t-0 pt-3 sm:pt-0 border-[#e5e5ea] dark:border-[#2c2c2e]">
                  <div className="text-right">
                    <div className="text-lg font-black text-[#1d1d1f] dark:text-[#f5f5f7]">
                      {score}{" "}
                      <span className="text-xs font-normal text-[#86868b]">
                        / {totalMarks}
                      </span>
                    </div>
                    <div className="text-[11px] font-semibold text-[#0071e3] dark:text-[#2997ff]">
                      {accuracy}% Accuracy
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {onRetakeExam && (
                      <button
                        type="button"
                        onClick={() => onRetakeExam(exam)}
                        className="px-3.5 py-2 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900/60 text-xs font-bold transition-colors flex items-center gap-1.5"
                        title="Retake this exam with the exact same questions and duration"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Retake Exam</span>
                      </button>
                    )}

                    {report && (
                      <button
                        type="button"
                        onClick={() => onSelectExamReport(exam)}
                        className="px-3.5 py-2 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-[#0071e3] dark:text-[#2997ff] hover:bg-blue-100 dark:hover:bg-blue-900/60 text-xs font-bold transition-colors flex items-center gap-1.5"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>View Report</span>
                      </button>
                    )}

                    {deleteConfirmId === exam.id ? (
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleDelete(exam.id)}
                          className="px-2.5 py-1.5 rounded-lg bg-rose-600 text-white text-[11px] font-bold"
                        >
                          Confirm
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteConfirmId(null)}
                          className="px-2 py-1.5 rounded-lg border text-[11px]"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setDeleteConfirmId(exam.id)}
                        className="p-2 rounded-xl text-gray-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                        title="Delete Exam"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

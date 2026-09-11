import React, { useState, useMemo } from "react";
import {
  BookOpen,
  CheckCircle2,
  Clock,
  Layers,
  HelpCircle,
  Play,
  ArrowRight,
  Sparkles,
  Info,
  Check,
  RotateCcw,
  Target,
  Sliders,
  ShieldCheck,
} from "lucide-react";
import { useGate } from "../../context/GateContext";
import { QuestionType, Subject, Chapter } from "../../types";
import { buildQuestionPool, selectExamQuestions } from "../../utils/examEngine";

interface ExamConfiguratorProps {
  onStartExam: (config: {
    title: string;
    syllabusScope: "all" | "multiple_subjects" | "single_subject" | "chapters";
    selectedSubjectIds: string[];
    selectedChapterIds: string[];
    selectedQuestionTypes: QuestionType[];
    requestedCount: number;
    durationMinutes: number;
  }) => void;
  onCancel?: () => void;
}

export const ExamConfigurator: React.FC<ExamConfiguratorProps> = ({
  onStartExam,
  onCancel,
}) => {
  const { subjects, chapters, pyqs } = useGate();

  // 1. Syllabus Scope: 'all' | 'multiple_subjects' | 'single_subject' | 'chapters'
  const [syllabusScope, setSyllabusScope] = useState<
    "all" | "multiple_subjects" | "single_subject" | "chapters"
  >("all");

  // Selected subjects (for multiple or single)
  const [selectedSubjectIds, setSelectedSubjectIds] = useState<string[]>(
    subjects.length > 0 ? [subjects[0].id] : [],
  );

  // Selected chapters (when scope === 'chapters' or single_subject)
  const [selectedChapterIds, setSelectedChapterIds] = useState<string[]>([]);

  // 2. Question Types selection
  const [selectedQuestionTypes, setSelectedQuestionTypes] = useState<
    QuestionType[]
  >(["mcq", "msq", "nat"]);

  // 3. Question Count & Duration
  const [requestedCount, setRequestedCount] = useState<number>(15);
  const [durationMinutes, setDurationMinutes] = useState<number>(30);
  const [customTitle, setCustomTitle] = useState<string>("");

  // Available chapters for single selected subject
  const singleSubjectId = selectedSubjectIds[0] || subjects[0]?.id || "";
  const currentSubjectChapters = useMemo(() => {
    return chapters.filter((c) => c.subjectId === singleSubjectId);
  }, [chapters, singleSubjectId]);

  // Compute eligible pool in real-time
  const eligiblePool = useMemo(() => {
    return buildQuestionPool({
      pyqs,
      scope: syllabusScope,
      selectedSubjectIds,
      selectedChapterIds,
      selectedQuestionTypes,
    });
  }, [
    pyqs,
    syllabusScope,
    selectedSubjectIds,
    selectedChapterIds,
    selectedQuestionTypes,
  ]);

  // Auto-calculated actual questions that will be taken
  const actualCount = Math.min(requestedCount, eligiblePool.length);

  // Suggested default title based on config
  const generatedTitle = useMemo(() => {
    if (customTitle.trim()) return customTitle.trim();

    if (syllabusScope === "all") {
      return `Full Syllabus Mock (${actualCount || requestedCount} Qs)`;
    }
    if (syllabusScope === "multiple_subjects") {
      const names = subjects
        .filter((s) => selectedSubjectIds.includes(s.id))
        .map((s) => s.code || s.name)
        .slice(0, 3)
        .join(", ");
      return `Multi-Subject Test: ${names}`;
    }
    if (syllabusScope === "single_subject") {
      const sub = subjects.find((s) => s.id === singleSubjectId);
      return `${sub?.name || "Subject"} Test (${actualCount || requestedCount} Qs)`;
    }
    if (syllabusScope === "chapters") {
      const sub = subjects.find((s) => s.id === singleSubjectId);
      const chaps = chapters.filter((c) => selectedChapterIds.includes(c.id));
      const chapStr =
        chaps.length === 1
          ? chaps[0].name
          : `${chaps.length} Chapters in ${sub?.name || ""}`;
      return `Chapter Practice: ${chapStr}`;
    }
    return `GATE Practice Exam (${actualCount || requestedCount} Qs)`;
  }, [
    customTitle,
    syllabusScope,
    selectedSubjectIds,
    selectedChapterIds,
    singleSubjectId,
    subjects,
    chapters,
    actualCount,
    requestedCount,
  ]);

  // Handle subject toggle in multiple subjects mode
  const toggleSubject = (subId: string) => {
    setSelectedSubjectIds((prev) => {
      if (prev.includes(subId)) {
        if (prev.length === 1) return prev; // keep at least 1
        return prev.filter((id) => id !== subId);
      }
      return [...prev, subId];
    });
  };

  // Handle chapter toggle in chapters mode
  const toggleChapter = (chapId: string) => {
    setSelectedChapterIds((prev) => {
      if (prev.includes(chapId)) {
        return prev.filter((id) => id !== chapId);
      }
      return [...prev, chapId];
    });
  };

  // Select all chapters of single subject
  const selectAllChapters = () => {
    setSelectedChapterIds(currentSubjectChapters.map((c) => c.id));
  };

  // Select no chapters
  const clearChapters = () => {
    setSelectedChapterIds([]);
  };

  // Handle question type preset selection
  const setTypePreset = (
    preset: "all" | "mcq" | "msq" | "nat" | "mcq_msq" | "mcq_nat" | "msq_nat",
  ) => {
    switch (preset) {
      case "all":
        setSelectedQuestionTypes(["mcq", "msq", "nat"]);
        break;
      case "mcq":
        setSelectedQuestionTypes(["mcq"]);
        break;
      case "msq":
        setSelectedQuestionTypes(["msq"]);
        break;
      case "nat":
        setSelectedQuestionTypes(["nat"]);
        break;
      case "mcq_msq":
        setSelectedQuestionTypes(["mcq", "msq"]);
        break;
      case "mcq_nat":
        setSelectedQuestionTypes(["mcq", "nat"]);
        break;
      case "msq_nat":
        setSelectedQuestionTypes(["msq", "nat"]);
        break;
    }
  };

  const isTypeActive = (t: QuestionType) => selectedQuestionTypes.includes(t);
  const toggleType = (t: QuestionType) => {
    setSelectedQuestionTypes((prev) => {
      if (prev.includes(t)) {
        if (prev.length === 1) return prev; // at least 1 type required
        return prev.filter((item) => item !== t);
      }
      return [...prev, t];
    });
  };

  const handleStart = () => {
    if (eligiblePool.length === 0) return;
    onStartExam({
      title: generatedTitle,
      syllabusScope,
      selectedSubjectIds:
        syllabusScope === "all"
          ? subjects.map((s) => s.id)
          : syllabusScope === "single_subject" || syllabusScope === "chapters"
            ? [singleSubjectId]
            : selectedSubjectIds,
      selectedChapterIds:
        syllabusScope === "chapters"
          ? selectedChapterIds.length > 0
            ? selectedChapterIds
            : currentSubjectChapters.map((c) => c.id)
          : [],
      selectedQuestionTypes,
      requestedCount,
      durationMinutes,
    });
  };

  return (
    <div
      id="exam-configurator-container"
      className="space-y-6 max-w-4xl mx-auto pb-12"
    >
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-600 rounded-2xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-semibold mb-3 border border-white/20">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Competitive Exam Engine</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Configure Practice Exam
            </h1>
            <p className="text-blue-100 text-sm mt-1 max-w-xl">
              Select your syllabus scope, question distribution, and time
              constraints. Experience an authentic GATE examination environment
              with exact marking schemes.
            </p>
          </div>
          {onCancel && (
            <button
              onClick={onCancel}
              className="self-start md:self-center px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-sm font-medium transition-colors"
            >
              Back to Dashboard
            </button>
          )}
        </div>
      </div>

      {/* 1. Syllabus Scope Selection */}
      <div className="bg-white dark:bg-[#1c1c1e] rounded-2xl border border-[#e5e5ea] dark:border-[#2c2c2e] p-6 shadow-xs space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-[#0071e3] dark:text-[#2997ff] flex items-center justify-center font-bold text-sm">
              1
            </div>
            <div>
              <h2 className="text-base font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">
                Syllabus Scope
              </h2>
              <p className="text-xs text-[#86868b] dark:text-[#a1a1a6]">
                Define which subjects and chapters are eligible for this test
              </p>
            </div>
          </div>
          <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-[#f5f5f7] dark:bg-[#2c2c2e] text-[#86868b] dark:text-[#a1a1a6]">
            Hierarchy: Subjects → Chapters
          </span>
        </div>

        {/* 4 Scope Modes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            {
              id: "all",
              title: "All Subjects",
              desc: "Full syllabus across all engineering subjects",
              icon: Layers,
            },
            {
              id: "multiple_subjects",
              title: "Multiple Subjects",
              desc: "Choose 2 or more subjects to test together",
              icon: BookOpen,
            },
            {
              id: "single_subject",
              title: "One Subject",
              desc: "Entire syllabus of a single chosen subject",
              icon: Target,
            },
            {
              id: "chapters",
              title: "Specific Chapters",
              desc: "Focus deeply on chosen chapters/topics",
              icon: Sliders,
            },
          ].map((scope) => {
            const Icon = scope.icon;
            const isSelected = syllabusScope === scope.id;
            return (
              <button
                key={scope.id}
                type="button"
                onClick={() => {
                  setSyllabusScope(scope.id as any);
                  if (
                    scope.id === "chapters" &&
                    selectedChapterIds.length === 0
                  ) {
                    setSelectedChapterIds(
                      currentSubjectChapters.map((c) => c.id),
                    );
                  }
                }}
                className={`p-4 rounded-xl text-left border transition-all relative flex flex-col justify-between ${
                  isSelected
                    ? "border-[#0071e3] bg-blue-50/50 dark:bg-blue-950/20 dark:border-[#2997ff] ring-2 ring-blue-500/20"
                    : "border-[#e5e5ea] dark:border-[#2c2c2e] bg-[#fbfbfd] dark:bg-[#252528] hover:border-gray-300 dark:hover:border-gray-600"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div
                      className={`p-2 rounded-lg ${
                        isSelected
                          ? "bg-[#0071e3] text-white"
                          : "bg-gray-100 dark:bg-[#38383a] text-[#86868b] dark:text-[#a1a1a6]"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    {isSelected && (
                      <div className="w-5 h-5 rounded-full bg-[#0071e3] text-white flex items-center justify-center">
                        <Check className="w-3 h-3" />
                      </div>
                    )}
                  </div>
                  <h3 className="font-semibold text-sm text-[#1d1d1f] dark:text-[#f5f5f7]">
                    {scope.title}
                  </h3>
                  <p className="text-xs text-[#86868b] dark:text-[#a1a1a6] mt-1 leading-relaxed">
                    {scope.desc}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Dynamic Context Selection based on chosen Scope */}
        {syllabusScope === "multiple_subjects" && (
          <div className="pt-3 border-t border-[#e5e5ea] dark:border-[#2c2c2e]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-[#86868b] dark:text-[#a1a1a6] uppercase tracking-wider">
                Select Subjects ({selectedSubjectIds.length} selected)
              </span>
              <button
                type="button"
                onClick={() => setSelectedSubjectIds(subjects.map((s) => s.id))}
                className="text-xs text-[#0071e3] dark:text-[#2997ff] font-medium hover:underline"
              >
                Select All
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {subjects.map((sub) => {
                const checked = selectedSubjectIds.includes(sub.id);
                return (
                  <button
                    key={sub.id}
                    type="button"
                    onClick={() => toggleSubject(sub.id)}
                    className={`flex items-center justify-between px-3 py-2.5 rounded-lg border text-xs font-medium transition-all ${
                      checked
                        ? "border-[#0071e3] bg-blue-50 dark:bg-blue-950/40 text-[#0071e3] dark:text-[#2997ff]"
                        : "border-[#e5e5ea] dark:border-[#38383a] bg-[#f5f5f7] dark:bg-[#2c2c2e] text-[#1d1d1f] dark:text-[#f5f5f7] hover:bg-gray-100"
                    }`}
                  >
                    <span className="truncate pr-2">{sub.name}</span>
                    <span
                      className={`w-4 h-4 rounded-sm flex items-center justify-center text-[10px] shrink-0 ${
                        checked
                          ? "bg-[#0071e3] text-white"
                          : "border border-gray-400"
                      }`}
                    >
                      {checked && <Check className="w-3 h-3" />}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {(syllabusScope === "single_subject" ||
          syllabusScope === "chapters") && (
          <div className="pt-3 border-t border-[#e5e5ea] dark:border-[#2c2c2e] space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#86868b] dark:text-[#a1a1a6] uppercase tracking-wider mb-2">
                Choose Subject
              </label>
              <select
                value={singleSubjectId}
                onChange={(e) => {
                  const newSubId = e.target.value;
                  setSelectedSubjectIds([newSubId]);
                  const subChaps = chapters.filter(
                    (c) => c.subjectId === newSubId,
                  );
                  setSelectedChapterIds(subChaps.map((c) => c.id));
                }}
                className="w-full sm:w-80 px-3.5 py-2.5 rounded-xl border border-[#e5e5ea] dark:border-[#38383a] bg-[#f5f5f7] dark:bg-[#2c2c2e] text-sm font-medium text-[#1d1d1f] dark:text-[#f5f5f7] focus:outline-none focus:ring-2 focus:ring-[#0071e3]"
              >
                {subjects.map((sub) => (
                  <option key={sub.id} value={sub.id}>
                    {sub.name} ({sub.code || "GATE"})
                  </option>
                ))}
              </select>
            </div>

            {syllabusScope === "chapters" && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-[#86868b] dark:text-[#a1a1a6] uppercase tracking-wider">
                    Select Chapters ({selectedChapterIds.length} of{" "}
                    {currentSubjectChapters.length})
                  </span>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={selectAllChapters}
                      className="text-xs text-[#0071e3] dark:text-[#2997ff] font-medium hover:underline"
                    >
                      Select All
                    </button>
                    <button
                      type="button"
                      onClick={clearChapters}
                      className="text-xs text-[#86868b] dark:text-[#a1a1a6] hover:underline"
                    >
                      Clear
                    </button>
                  </div>
                </div>

                {currentSubjectChapters.length === 0 ? (
                  <p className="text-xs text-[#86868b] italic py-2">
                    No chapters defined for this subject yet.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
                    {currentSubjectChapters.map((chap) => {
                      const checked = selectedChapterIds.includes(chap.id);
                      return (
                        <button
                          key={chap.id}
                          type="button"
                          onClick={() => toggleChapter(chap.id)}
                          className={`flex items-center justify-between px-3 py-2 rounded-lg border text-xs font-medium text-left transition-all ${
                            checked
                              ? "border-[#0071e3] bg-blue-50/70 dark:bg-blue-950/30 text-[#0071e3] dark:text-[#2997ff]"
                              : "border-[#e5e5ea] dark:border-[#38383a] bg-[#fbfbfd] dark:bg-[#252528] text-[#1d1d1f] dark:text-[#f5f5f7] hover:bg-gray-100"
                          }`}
                        >
                          <span className="truncate pr-2">{chap.name}</span>
                          <span
                            className={`w-4 h-4 rounded-sm flex items-center justify-center text-[10px] shrink-0 ${
                              checked
                                ? "bg-[#0071e3] text-white"
                                : "border border-gray-400"
                            }`}
                          >
                            {checked && <Check className="w-3 h-3" />}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* 2. Question Types Selection */}
      <div className="bg-white dark:bg-[#1c1c1e] rounded-2xl border border-[#e5e5ea] dark:border-[#2c2c2e] p-6 shadow-xs space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold text-sm">
              2
            </div>
            <div>
              <h2 className="text-base font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">
                Question Types
              </h2>
              <p className="text-xs text-[#86868b] dark:text-[#a1a1a6]">
                Choose question formats (MCQ, MSQ, NAT) or use quick
                combinations
              </p>
            </div>
          </div>
          <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-[#f5f5f7] dark:bg-[#2c2c2e] text-[#86868b] dark:text-[#a1a1a6]">
            Fair Distribution Logic
          </span>
        </div>

        {/* Quick Combination Presets */}
        <div>
          <span className="block text-xs font-semibold text-[#86868b] dark:text-[#a1a1a6] uppercase tracking-wider mb-2">
            Quick Combinations
          </span>
          <div className="flex flex-wrap gap-2">
            {[
              { id: "all", label: "All Types (MCQ + MSQ + NAT)" },
              { id: "mcq", label: "MCQ only" },
              { id: "msq", label: "MSQ only" },
              { id: "nat", label: "NAT only" },
              { id: "mcq_msq", label: "MCQ + MSQ" },
              { id: "mcq_nat", label: "MCQ + NAT" },
              { id: "msq_nat", label: "MSQ + NAT" },
            ].map((p) => {
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setTypePreset(p.id as any)}
                  className="px-3 py-1.5 rounded-lg border border-[#e5e5ea] dark:border-[#38383a] bg-[#f5f5f7] dark:bg-[#2c2c2e] text-xs font-medium text-[#1d1d1f] dark:text-[#f5f5f7] hover:bg-gray-200 dark:hover:bg-[#38383a] transition-colors"
                >
                  {p.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Checkbox Chips for MCQ, MSQ, NAT */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          {[
            {
              type: "mcq" as QuestionType,
              title: "MCQ (Multiple Choice)",
              badge: "Single Option Correct",
              color:
                "text-sky-700 dark:text-sky-300 border-sky-300 dark:border-sky-800 bg-sky-50 dark:bg-sky-950/30",
              activeRing: "ring-sky-500/20 border-sky-600",
              description:
                "Standard 4 options with exactly one correct choice.",
            },
            {
              type: "msq" as QuestionType,
              title: "MSQ (Multiple Select)",
              badge: "One or More Correct",
              color:
                "text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30",
              activeRing: "ring-amber-500/20 border-amber-600",
              description:
                "One, two, three, or all four options may be correct. No partial marking.",
            },
            {
              type: "nat" as QuestionType,
              title: "NAT (Numerical Answer)",
              badge: "Numeric Input Field",
              color:
                "text-violet-700 dark:text-violet-300 border-violet-300 dark:border-violet-800 bg-violet-50 dark:bg-violet-950/30",
              activeRing: "ring-violet-500/20 border-violet-600",
              description:
                "Direct numerical value or range with virtual numeric keypad.",
            },
          ].map((item) => {
            const active = isTypeActive(item.type);
            return (
              <button
                key={item.type}
                type="button"
                onClick={() => toggleType(item.type)}
                className={`p-4 rounded-xl border text-left transition-all relative flex flex-col justify-between ${
                  active
                    ? `${item.activeRing} ring-2 bg-white dark:bg-[#202024]`
                    : "border-[#e5e5ea] dark:border-[#38383a] bg-[#fbfbfd] dark:bg-[#252528] opacity-60 hover:opacity-100"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${item.color}`}
                    >
                      {item.type.toUpperCase()}
                    </span>
                    <span
                      className={`w-5 h-5 rounded-md flex items-center justify-center ${
                        active
                          ? "bg-[#0071e3] text-white"
                          : "border border-gray-400"
                      }`}
                    >
                      {active && <Check className="w-3.5 h-3.5" />}
                    </span>
                  </div>
                  <h4 className="text-sm font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">
                    {item.title}
                  </h4>
                  <p className="text-xs text-[#86868b] dark:text-[#a1a1a6] mt-1 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Number of Questions & Duration */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Question Count Card */}
        <div className="bg-white dark:bg-[#1c1c1e] rounded-2xl border border-[#e5e5ea] dark:border-[#2c2c2e] p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-sm">
              3
            </div>
            <div>
              <h2 className="text-base font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">
                Number of Questions
              </h2>
              <p className="text-xs text-[#86868b] dark:text-[#a1a1a6]">
                Eligible questions in current pool:{" "}
                <strong className="text-emerald-600 dark:text-emerald-400 font-bold">
                  {eligiblePool.length}
                </strong>
              </p>
            </div>
          </div>

          {/* Quick Presets */}
          <div className="flex flex-wrap gap-2">
            {[5, 10, 15, 20, 25, 30, 45, 65].map((cnt) => (
              <button
                key={cnt}
                type="button"
                onClick={() => setRequestedCount(cnt)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                  requestedCount === cnt
                    ? "border-[#0071e3] bg-[#0071e3] text-white shadow-xs"
                    : "border-[#e5e5ea] dark:border-[#38383a] bg-[#f5f5f7] dark:bg-[#2c2c2e] text-[#1d1d1f] dark:text-[#f5f5f7] hover:bg-gray-200 dark:hover:bg-[#38383a]"
                }`}
              >
                {cnt} Qs
              </button>
            ))}
          </div>

          {/* Custom Input */}
          <div className="flex items-center gap-3 pt-2">
            <label className="text-xs font-medium text-[#86868b] dark:text-[#a1a1a6] whitespace-nowrap">
              Custom Count:
            </label>
            <input
              type="number"
              min={1}
              max={150}
              value={requestedCount}
              onChange={(e) =>
                setRequestedCount(Math.max(1, parseInt(e.target.value) || 1))
              }
              className="w-24 px-3 py-1.5 rounded-lg border border-[#e5e5ea] dark:border-[#38383a] bg-[#f5f5f7] dark:bg-[#2c2c2e] text-sm font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] focus:outline-none focus:ring-2 focus:ring-[#0071e3]"
            />
            <span className="text-xs text-[#86868b]">questions</span>
          </div>

          {/* Availability Notice */}
          {requestedCount > eligiblePool.length && eligiblePool.length > 0 && (
            <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 flex items-start gap-2.5">
              <Info className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <p className="text-xs text-amber-800 dark:text-amber-300">
                You requested <strong>{requestedCount}</strong> questions, but
                only <strong>{eligiblePool.length}</strong> eligible questions
                match your scope and question type filters. This exam will
                include all <strong>{eligiblePool.length}</strong> available
                questions.
              </p>
            </div>
          )}

          {eligiblePool.length === 0 && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/60 flex items-start gap-2.5">
              <Info className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
              <p className="text-xs text-rose-800 dark:text-rose-300">
                No eligible questions found for this combination of syllabus and
                question types. Please broaden your scope or select additional
                question types.
              </p>
            </div>
          )}
        </div>

        {/* Duration Card */}
        <div className="bg-white dark:bg-[#1c1c1e] rounded-2xl border border-[#e5e5ea] dark:border-[#2c2c2e] p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-orange-50 dark:bg-orange-950/50 text-orange-600 dark:text-orange-400 flex items-center justify-center font-bold text-sm">
              4
            </div>
            <div>
              <h2 className="text-base font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">
                Exam Duration
              </h2>
              <p className="text-xs text-[#86868b] dark:text-[#a1a1a6]">
                Set the countdown timer limit for this test
              </p>
            </div>
          </div>

          {/* Predefined Durations */}
          <div className="grid grid-cols-3 gap-2">
            {[
              { min: 30, label: "30 mins" },
              { min: 60, label: "1 hour" },
              { min: 90, label: "1.5 hours" },
              { min: 120, label: "2 hours" },
              { min: 150, label: "2.5 hours" },
              { min: 180, label: "3 hours" },
            ].map((dur) => (
              <button
                key={dur.min}
                type="button"
                onClick={() => setDurationMinutes(dur.min)}
                className={`px-3 py-2 rounded-lg text-xs font-semibold border text-center transition-all ${
                  durationMinutes === dur.min
                    ? "border-[#0071e3] bg-[#0071e3] text-white shadow-xs"
                    : "border-[#e5e5ea] dark:border-[#38383a] bg-[#f5f5f7] dark:bg-[#2c2c2e] text-[#1d1d1f] dark:text-[#f5f5f7] hover:bg-gray-200 dark:hover:bg-[#38383a]"
                }`}
              >
                {dur.label}
              </button>
            ))}
          </div>

          <div className="p-3 rounded-xl bg-[#f5f5f7] dark:bg-[#2c2c2e] text-xs text-[#86868b] dark:text-[#a1a1a6] flex items-center justify-between">
            <span>Pace per question:</span>
            <strong className="text-[#1d1d1f] dark:text-[#f5f5f7]">
              {actualCount > 0 ? (durationMinutes / actualCount).toFixed(1) : 0}{" "}
              mins / Q
            </strong>
          </div>
        </div>
      </div>

      {/* 4. Pre-Start Summary & Marking Scheme Card */}
      <div className="bg-white dark:bg-[#1c1c1e] rounded-2xl border border-[#e5e5ea] dark:border-[#2c2c2e] p-6 shadow-sm space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-sm">
              5
            </div>
            <div>
              <h2 className="text-base font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">
                Exam Overview & Marking Scheme
              </h2>
              <p className="text-xs text-[#86868b] dark:text-[#a1a1a6]">
                Review all test parameters before launching the timer
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 text-xs font-semibold border border-emerald-200 dark:border-emerald-800/60">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Competitive Exam Mode</span>
          </div>
        </div>

        {/* Custom Exam Title Optional */}
        <div>
          <label className="block text-xs font-semibold text-[#86868b] dark:text-[#a1a1a6] uppercase tracking-wider mb-1.5">
            Exam Title (Optional)
          </label>
          <input
            type="text"
            placeholder={generatedTitle}
            value={customTitle}
            onChange={(e) => setCustomTitle(e.target.value)}
            className="w-full px-3.5 py-2 rounded-xl border border-[#e5e5ea] dark:border-[#38383a] bg-[#fbfbfd] dark:bg-[#252528] text-sm text-[#1d1d1f] dark:text-[#f5f5f7] focus:outline-none focus:ring-2 focus:ring-[#0071e3]"
          />
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 rounded-xl bg-[#f5f5f7] dark:bg-[#252528] border border-[#e5e5ea] dark:border-[#38383a]">
            <span className="text-[11px] text-[#86868b] block mb-0.5">
              Syllabus Scope
            </span>
            <span className="text-xs font-bold text-[#1d1d1f] dark:text-[#f5f5f7] capitalize">
              {syllabusScope.replace("_", " ")}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-[#f5f5f7] dark:bg-[#252528] border border-[#e5e5ea] dark:border-[#38383a]">
            <span className="text-[11px] text-[#86868b] block mb-0.5">
              Question Types
            </span>
            <span className="text-xs font-bold text-[#1d1d1f] dark:text-[#f5f5f7]">
              {selectedQuestionTypes.map((t) => t.toUpperCase()).join(" + ")}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-[#f5f5f7] dark:bg-[#252528] border border-[#e5e5ea] dark:border-[#38383a]">
            <span className="text-[11px] text-[#86868b] block mb-0.5">
              Total Questions
            </span>
            <span className="text-xs font-bold text-[#0071e3] dark:text-[#2997ff]">
              {actualCount} Questions ({actualCount} Marks)
            </span>
          </div>

          <div className="p-3 rounded-xl bg-[#f5f5f7] dark:bg-[#252528] border border-[#e5e5ea] dark:border-[#38383a]">
            <span className="text-[11px] text-[#86868b] block mb-0.5">
              Timer Duration
            </span>
            <span className="text-xs font-bold text-[#1d1d1f] dark:text-[#f5f5f7]">
              {durationMinutes} Minutes
            </span>
          </div>
        </div>

        {/* Marking Scheme Badge Strip */}
        <div className="p-4 rounded-xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200/80 dark:border-blue-900/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#0071e3] shrink-0" />
            <span className="text-xs font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">
              Active Marking Scheme:
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold">
              Correct: +1 Mark
            </span>
            <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 font-bold">
              Wrong: -1 Mark
            </span>
            <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-gray-200 text-gray-800 dark:bg-gray-800 dark:text-gray-300 font-bold">
              Unanswered: 0 Marks
            </span>
          </div>
        </div>

        {/* Start CTA */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-[#86868b] text-center sm:text-left">
            Once you click Start, the exam timer begins and questions are locked
            into session state.
          </p>

          <button
            type="button"
            id="start-exam-button"
            onClick={handleStart}
            disabled={eligiblePool.length === 0}
            className={`w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2.5 shadow-md transition-all ${
              eligiblePool.length === 0
                ? "bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed"
                : "bg-[#0071e3] hover:bg-[#0077ed] active:scale-[0.99] text-white ring-2 ring-blue-500/20"
            }`}
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Start Practice Exam</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

import React, { useState, useRef } from "react";
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
  Image as ImageIcon,
  Upload,
  Link as LinkIcon,
  CheckSquare,
  Square,
  AlertCircle,
  ExternalLink,
  Hash,
} from "lucide-react";
import { useGate } from "../../context/GateContext";
import { PYQ, PyqDifficulty, PyqStatus } from "../../types";
import {
  DifficultyBadge,
  PyqStatusBadge,
  QuestionTypeBadge,
} from "../common/Badge";
import { Modal } from "../common/Modal";
import { PyqQueueView } from "./PyqQueueView";

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
  const [pyqViewMode, setPyqViewMode] = useState<"queue" | "bank">("queue");

  // Filters for Question Bank
  const [filterChapterId, setFilterChapterId] = useState<string>("all");
  const [filterYear, setFilterYear] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterDifficulty, setFilterDifficulty] = useState<string>("all");
  const [filterType, setFilterType] = useState<"all" | "mcq" | "nat">("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Revealed explanations map
  const [revealedIds, setRevealedIds] = useState<Record<string, boolean>>({});

  // Modal for Add / Edit
  const [isPyqModalOpen, setIsPyqModalOpen] = useState(false);
  const [editingPyqId, setEditingPyqId] = useState<string | null>(null);

  // Form states
  const [formSubjectId, setFormSubjectId] = useState<string>(
    selectedSubjectId !== "all" ? selectedSubjectId : subjects[0]?.id || "",
  );
  const [formChapterId, setFormChapterId] = useState<string>("");
  const [formYear, setFormYear] = useState<number>(2024);
  const [formQuestionNumber, setFormQuestionNumber] = useState<string>("Q.1");
  const [formQuestion, setFormQuestion] = useState<string>("");
  const [formMarks, setFormMarks] = useState<1 | 2>(1);
  const [formIsNat, setFormIsNat] = useState<boolean>(false);
  const [formNatMin, setFormNatMin] = useState<string>("");
  const [formNatMax, setFormNatMax] = useState<string>("");

  // Photo attached to question
  const [formImageUrl, setFormImageUrl] = useState<string>("");
  const [showUrlInput, setShowUrlInput] = useState<boolean>(false);
  const [tempUrlInput, setTempUrlInput] = useState<string>("");
  const [isDragOver, setIsDragOver] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 4 Option Boxes
  const [formOptions, setFormOptions] = useState<
    [string, string, string, string]
  >(["", "", "", ""]);
  // Small checkbox on each box: if ticked, that is the answer
  const [formCorrectOptions, setFormCorrectOptions] = useState<
    [boolean, boolean, boolean, boolean]
  >([false, false, false, false]);

  const [formAnswer, setFormAnswer] = useState<string>("");
  const [formExplanation, setFormExplanation] = useState<string>("");
  const [formDifficulty, setFormDifficulty] = useState<PyqDifficulty>("medium");
  const [formStatus, setFormStatus] = useState<PyqStatus>("not_attempted");

  // Chapters available for the selected subject
  const availableChapters = chapters.filter((c) =>
    selectedSubjectId === "all" ? true : c.subjectId === selectedSubjectId,
  );

  // Form available chapters
  const formChapters = chapters.filter((c) => c.subjectId === formSubjectId);

  // Filtered PYQs
  const filteredPyqs = pyqs.filter((p) => {
    if (selectedSubjectId !== "all" && p.subjectId !== selectedSubjectId)
      return false;
    if (filterChapterId !== "all" && p.chapterId !== filterChapterId)
      return false;
    if (filterYear !== "all" && String(p.year) !== filterYear) return false;
    if (filterStatus !== "all" && p.status !== filterStatus) return false;
    if (filterDifficulty !== "all" && p.difficulty !== filterDifficulty)
      return false;
    if (filterType === "nat" && !p.isNat) return false;
    if (filterType === "mcq" && p.isNat) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchText = (
        p.question +
        " " +
        (p.answer || "") +
        " " +
        p.questionNumber
      ).toLowerCase();
      if (!matchText.includes(q)) return false;
    }
    return true;
  });

  // Calculate Statistics for selected subject (or all)
  const currentSubjectObj = subjects.find((s) => s.id === selectedSubjectId);
  const statPyqs = pyqs.filter((p) =>
    selectedSubjectId === "all" ? true : p.subjectId === selectedSubjectId,
  );
  const totalCount = statPyqs.length;
  const attemptedCount = statPyqs.filter(
    (p) => p.status !== "not_attempted",
  ).length;
  const correctCount = statPyqs.filter((p) => p.status === "correct").length;
  const wrongCount = statPyqs.filter((p) => p.status === "wrong").length;
  const accuracyPct =
    attemptedCount > 0
      ? ((correctCount / attemptedCount) * 100).toFixed(1)
      : "0.0";

  // Chapter-level progress for current subject
  const targetChaptersForStats =
    selectedSubjectId === "all"
      ? chapters.slice(0, 8)
      : chapters.filter((c) => c.subjectId === selectedSubjectId);

  const toggleReveal = (id: string) => {
    setRevealedIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Option text change handler
  const handleOptionTextChange = (idx: number, value: string) => {
    setFormOptions((prev) => {
      const next: [string, string, string, string] = [
        prev[0],
        prev[1],
        prev[2],
        prev[3],
      ];
      next[idx] = value;
      return next;
    });
  };

  // Option checkbox toggle handler: if ticked, that is the answer
  const toggleOptionCorrect = (idx: number) => {
    setFormCorrectOptions((prev) => {
      const next: [boolean, boolean, boolean, boolean] = [
        prev[0],
        prev[1],
        prev[2],
        prev[3],
      ];
      next[idx] = !next[idx];

      // Auto-synchronize formAnswer with the ticked options
      const letters = ["A", "B", "C", "D"];
      const tickedLetters = letters.filter((_, i) => next[i]);
      if (tickedLetters.length > 0) {
        setFormAnswer(tickedLetters.map((l) => `Option ${l}`).join(", "));
      } else {
        setFormAnswer("");
      }

      return next;
    });
  };

  // Photo upload and attachment handlers
  const handlePhotoUpload = (file?: File | null) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      alert("Please select a valid image file (PNG, JPG, WebP, SVG, etc.).");
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      alert("Image file size is too large. Please select an image under 8MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (result) {
        setFormImageUrl(result);
        setShowUrlInput(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleApplyUrl = () => {
    if (tempUrlInput.trim()) {
      setFormImageUrl(tempUrlInput.trim());
      setShowUrlInput(false);
    }
  };

  const handleRemovePhoto = () => {
    setFormImageUrl("");
    setTempUrlInput("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleOpenAdd = () => {
    setEditingPyqId(null);
    const subId =
      selectedSubjectId !== "all" ? selectedSubjectId : subjects[0]?.id || "";
    setFormSubjectId(subId);
    const firstChap = chapters.find((c) => c.subjectId === subId);
    setFormChapterId(firstChap ? firstChap.id : "");
    setFormYear(2024);
    setFormQuestionNumber(`Q.${statPyqs.length + 1}`);
    setFormQuestion("");
    setFormMarks(1);
    setFormIsNat(false);
    setFormNatMin("");
    setFormNatMax("");
    setFormImageUrl("");
    setTempUrlInput("");
    setShowUrlInput(false);
    setFormOptions(["", "", "", ""]);
    setFormCorrectOptions([false, false, false, false]);
    setFormAnswer("");
    setFormExplanation("");
    setFormDifficulty("medium");
    setFormStatus("not_attempted");
    setIsPyqModalOpen(true);
  };

  const handleOpenEdit = (p: PYQ) => {
    setEditingPyqId(p.id);
    setFormSubjectId(p.subjectId);
    setFormChapterId(p.chapterId);
    setFormYear(p.year);
    setFormQuestionNumber(p.questionNumber);
    setFormQuestion(p.question);
    setFormMarks(p.marks === 2 ? 2 : 1);
    setFormIsNat(!!p.isNat);
    setFormNatMin(
      p.natAnswerRange?.min !== undefined ? String(p.natAnswerRange.min) : "",
    );
    setFormNatMax(
      p.natAnswerRange?.max !== undefined ? String(p.natAnswerRange.max) : "",
    );
    setFormImageUrl(p.imageUrl || "");
    setTempUrlInput(
      p.imageUrl && !p.imageUrl.startsWith("data:") ? p.imageUrl : "",
    );
    setShowUrlInput(false);

    // Populate the 4 option boxes
    const loadedOptions: [string, string, string, string] = [
      p.options?.[0] || "",
      p.options?.[1] || "",
      p.options?.[2] || "",
      p.options?.[3] || "",
    ];
    setFormOptions(loadedOptions);

    // Populate checkboxes: if checked, that option is the answer
    const letters = ["A", "B", "C", "D"];
    const loadedCorrect: [boolean, boolean, boolean, boolean] = [
      false,
      false,
      false,
      false,
    ];

    if (p.correctOptions && p.correctOptions.length > 0) {
      p.correctOptions.forEach((idx) => {
        if (idx >= 0 && idx < 4) loadedCorrect[idx] = true;
      });
    } else if (p.answer && !p.isNat) {
      const upper = p.answer.toUpperCase();
      letters.forEach((l, idx) => {
        if (
          upper.includes(`OPTION ${l}`) ||
          upper.trim() === l ||
          upper.startsWith(`${l}:`) ||
          upper.startsWith(`${l})`)
        ) {
          loadedCorrect[idx] = true;
        }
      });
    }
    setFormCorrectOptions(loadedCorrect);

    setFormAnswer(
      p.answer ||
        (p.numericalAnswer !== undefined ? String(p.numericalAnswer) : ""),
    );
    setFormExplanation(p.explanation || "");
    setFormDifficulty(p.difficulty);
    setFormStatus(p.status);
    setIsPyqModalOpen(true);
  };

  const handleSavePyq = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      (!formQuestion.trim() && !formImageUrl.trim()) ||
      !formSubjectId ||
      !formChapterId
    )
      return;

    // Collect ticked option indices (if MCQ)
    const correctIndices: number[] = [];
    if (!formIsNat) {
      formCorrectOptions.forEach((isTicked, idx) => {
        if (isTicked) correctIndices.push(idx);
      });
    }

    const checkedLetters = ["A", "B", "C", "D"].filter(
      (_, i) => formCorrectOptions[i],
    );
    let finalAnswer = formAnswer.trim();
    if (!formIsNat && !finalAnswer && checkedLetters.length > 0) {
      finalAnswer = checkedLetters.map((l) => `Option ${l}`).join(", ");
    }

    // NAT Range parsing if provided
    let natRange: { min: number; max: number } | undefined = undefined;
    if (formIsNat) {
      const minVal = parseFloat(formNatMin);
      const maxVal = parseFloat(formNatMax);
      if (!isNaN(minVal) && !isNaN(maxVal)) {
        natRange = { min: minVal, max: maxVal };
      } else if (!isNaN(parseFloat(finalAnswer))) {
        const numVal = parseFloat(finalAnswer);
        natRange = { min: numVal, max: numVal };
      }
    }

    const payload = {
      subjectId: formSubjectId,
      chapterId: formChapterId,
      year: Number(formYear),
      marks: formMarks,
      isNat: formIsNat,
      isNumerical: formIsNat,
      numericalAnswer: formIsNat ? finalAnswer : undefined,
      natAnswerRange: natRange,
      questionNumber: formQuestionNumber.trim(),
      question: formQuestion.trim(),
      imageUrl: formImageUrl.trim() || undefined,
      options: formIsNat ? [] : formOptions.map((opt) => opt.trim()),
      correctOptions: formIsNat ? [] : correctIndices,
      correctOption: formIsNat
        ? undefined
        : checkedLetters.join(", ") || undefined,
      answer: finalAnswer,
      explanation: formExplanation.trim(),
      difficulty: formDifficulty,
      status: formStatus,
    };

    if (editingPyqId) {
      updatePyq(editingPyqId, payload);
    } else {
      addPyq(payload);
    }

    setIsPyqModalOpen(false);
  };

  // Unique years in database
  const allYears = Array.from(new Set(pyqs.map((p) => p.year))).sort(
    (a, b) => b - a,
  );

  return (
    <div className="space-y-6 pb-12">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#161617] p-5 rounded-2xl border border-[#e5e5ea] dark:border-[#333336] shadow-2xs transition-colors">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-[#1d1d1f] dark:text-[#f5f5f7] tracking-tight">
              GATE CSE PYQs
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full font-medium bg-purple-50 dark:bg-purple-950/40 text-[#af52de] border border-purple-200/80 dark:border-purple-800/60">
              Practice & Archive
            </span>
          </div>
          <p className="text-xs text-[#86868b] dark:text-[#a1a1a6] mt-1">
            Separately manage your priority practice queue and query past GATE
            questions.
          </p>
        </div>

        {pyqViewMode === "bank" && (
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
          onClick={() => setPyqViewMode("queue")}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold transition-colors ${
            pyqViewMode === "queue"
              ? "bg-[#0071e3] dark:bg-[#2997ff] text-white dark:text-black shadow-xs"
              : "bg-white dark:bg-[#161617] text-[#86868b] dark:text-[#a1a1a6] border border-[#e5e5ea] dark:border-[#333336] hover:text-[#1d1d1f] dark:hover:text-[#f5f5f7]"
          }`}
        >
          <ListOrdered className="w-4 h-4" />
          <span>Practice Queue (Learning Flow)</span>
        </button>

        <button
          onClick={() => setPyqViewMode("bank")}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold transition-colors ${
            pyqViewMode === "bank"
              ? "bg-[#0071e3] dark:bg-[#2997ff] text-white dark:text-black shadow-xs"
              : "bg-white dark:bg-[#161617] text-[#86868b] dark:text-[#a1a1a6] border border-[#e5e5ea] dark:border-[#333336] hover:text-[#1d1d1f] dark:hover:text-[#f5f5f7]"
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
            setSelectedSubjectId("all");
            setFilterChapterId("all");
          }}
          className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors border ${
            selectedSubjectId === "all"
              ? "bg-[#1d1d1f] text-white border-[#1d1d1f] dark:bg-[#f5f5f7] dark:text-black dark:border-[#f5f5f7]"
              : "bg-white dark:bg-[#161617] text-[#86868b] dark:text-[#a1a1a6] border-[#e5e5ea] dark:border-[#333336] hover:text-[#1d1d1f] dark:hover:text-[#f5f5f7]"
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
                setFilterChapterId("all");
              }}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors border ${
                isSelected
                  ? "bg-[#0071e3] text-white border-[#0071e3] dark:bg-[#2997ff] dark:text-black dark:border-[#2997ff]"
                  : "bg-white dark:bg-[#161617] text-[#86868b] dark:text-[#a1a1a6] border-[#e5e5ea] dark:border-[#333336] hover:text-[#1d1d1f] dark:hover:text-[#f5f5f7]"
              }`}
            >
              {s.code || s.name}
            </button>
          );
        })}
      </div>

      {/* Conditional Rendering based on Mode */}
      {pyqViewMode === "queue" ? (
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
                    {currentSubjectObj
                      ? currentSubjectObj.name
                      : "All Subjects Summary"}
                  </span>
                  <span className="text-xs font-semibold text-[#0071e3] dark:text-[#2997ff]">
                    {accuracyPct}% Accuracy
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 mt-4">
                  <div className="p-3 bg-[#f5f5f7] dark:bg-[#1d1d1f] rounded-xl border border-[#e5e5ea] dark:border-[#333336]">
                    <p className="text-[11px] text-[#86868b] dark:text-[#a1a1a6] font-medium">
                      Total Questions
                    </p>
                    <p className="text-xl font-bold text-[#1d1d1f] dark:text-[#f5f5f7] mt-0.5">
                      {totalCount}
                    </p>
                  </div>
                  <div className="p-3 bg-[#f5f5f7] dark:bg-[#1d1d1f] rounded-xl border border-[#e5e5ea] dark:border-[#333336]">
                    <p className="text-[11px] text-[#86868b] dark:text-[#a1a1a6] font-medium">
                      Attempted
                    </p>
                    <p className="text-xl font-bold text-[#1d1d1f] dark:text-[#f5f5f7] mt-0.5">
                      {attemptedCount}
                    </p>
                  </div>
                  <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200/70 dark:border-emerald-800/60">
                    <p className="text-[11px] text-emerald-700 dark:text-emerald-400 font-medium">
                      Correct
                    </p>
                    <p className="text-xl font-bold text-emerald-700 dark:text-emerald-400 mt-0.5">
                      {correctCount}
                    </p>
                  </div>
                  <div className="p-3 bg-red-50 dark:bg-red-950/40 rounded-xl border border-red-200/70 dark:border-red-800/60">
                    <p className="text-[11px] text-[#ff3b30] dark:text-[#ff453a] font-medium">
                      Wrong / Missed
                    </p>
                    <p className="text-xl font-bold text-[#ff3b30] dark:text-[#ff453a] mt-0.5">
                      {wrongCount}
                    </p>
                  </div>
                </div>
              </div>

              {/* Progress bar */}
              <div className="mt-4 pt-3 border-t border-[#e5e5ea] dark:border-[#333336]">
                <div className="flex justify-between text-xs text-[#86868b] dark:text-[#a1a1a6] mb-1">
                  <span>Coverage</span>
                  <span className="font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">
                    {totalCount > 0
                      ? Math.round((attemptedCount / totalCount) * 100)
                      : 0}
                    %
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
                  const chSolved = chPyqs.filter(
                    (p) => p.status === "correct",
                  ).length;
                  const chTotal = chPyqs.length;
                  const chPct =
                    chTotal > 0 ? Math.round((chSolved / chTotal) * 100) : 0;

                  return (
                    <div
                      key={c.id}
                      onClick={() =>
                        setFilterChapterId(
                          filterChapterId === c.id ? "all" : c.id,
                        )
                      }
                      className={`p-2.5 rounded-xl border text-xs cursor-pointer transition-colors ${
                        filterChapterId === c.id
                          ? "border-[#0071e3] dark:border-[#2997ff] bg-blue-50/50 dark:bg-blue-950/40"
                          : "border-[#e5e5ea] dark:border-[#333336] bg-[#f5f5f7] dark:bg-[#1d1d1f] hover:bg-[#e5e5ea]/60 dark:hover:bg-[#2c2c2e]"
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

              {/* Question Type filter dropdown */}
              <select
                value={filterType}
                onChange={(e) =>
                  setFilterType(e.target.value as "all" | "mcq" | "nat")
                }
                className="text-xs border border-[#e5e5ea] dark:border-[#3a3a3c] rounded-xl px-3 py-2 bg-[#f5f5f7] dark:bg-[#2c2c2e] text-[#1d1d1f] dark:text-[#f5f5f7] focus:ring-2 focus:ring-[#0071e3] focus:outline-none font-medium"
              >
                <option value="all">All Types (MCQ & NAT)</option>
                <option value="mcq">MCQ Only</option>
                <option value="nat">NAT (Numerical) Only</option>
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
                          style={{ backgroundColor: sub?.color || "#0071e3" }}
                        >
                          {sub?.code || sub?.name}
                        </span>
                        <span className="text-xs font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">
                          {chap?.name}
                        </span>
                        <span className="text-xs font-bold text-[#0071e3] dark:text-[#2997ff] bg-blue-50 dark:bg-blue-950/40 px-2.5 py-0.5 rounded-full border border-blue-200/80 dark:border-blue-800/60">
                          GATE {p.year} ({p.questionNumber})
                        </span>
                        <QuestionTypeBadge isNat={p.isNat} />
                        {p.marks && (
                          <span
                            className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${
                              p.marks === 2
                                ? "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-300/80 dark:border-amber-800/60"
                                : "bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border-slate-200 dark:border-zinc-700"
                            }`}
                          >
                            {p.marks} {p.marks === 1 ? "Mark" : "Marks"}
                          </span>
                        )}
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
                              if (window.confirm("Delete this PYQ?")) {
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
                    <div className="space-y-3">
                      {p.question && (
                        <div className="text-[#1d1d1f] dark:text-[#f5f5f7] text-xs sm:text-sm font-normal leading-relaxed whitespace-pre-line">
                          {p.question}
                        </div>
                      )}

                      {/* Question Photo / Diagram (if attached) */}
                      {p.imageUrl && (
                        <div className="mt-2.5 rounded-xl overflow-hidden border border-[#e5e5ea] dark:border-[#333336] bg-[#f5f5f7] dark:bg-[#1c1c1e] p-2 flex flex-col items-center justify-center">
                          <img
                            src={p.imageUrl}
                            alt={`Diagram for ${p.questionNumber || "PYQ"}`}
                            className="max-h-72 w-auto max-w-full object-contain rounded-lg shadow-2xs"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                      )}

                      {/* NAT Indicator / Answer Range on Card (when not revealed or revealed) */}
                      {p.isNat && (
                        <div className="pt-1">
                          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200/80 dark:border-purple-900/40 text-xs text-purple-900 dark:text-purple-200">
                            <span className="font-bold inline-flex items-center gap-1 text-purple-700 dark:text-purple-300">
                              <Hash className="w-3.5 h-3.5" /> Numerical Answer
                              Question
                            </span>
                            <span className="text-[#86868b] dark:text-[#a1a1a6] text-[11px]">
                              (Type in answer in GATE virtual keypad)
                            </span>
                          </div>
                        </div>
                      )}

                      {/* 4 Option Boxes (if defined and not NAT) */}
                      {!p.isNat &&
                        p.options &&
                        p.options.some(
                          (opt) => opt && opt.trim().length > 0,
                        ) && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                            {p.options.map((optText, optIdx) => {
                              const letter = ["A", "B", "C", "D"][optIdx];
                              const isOptionTicked =
                                p.correctOptions?.includes(optIdx) ||
                                (!p.correctOptions?.length &&
                                  p.answer &&
                                  (p.answer
                                    .toUpperCase()
                                    .includes(`OPTION ${letter}`) ||
                                    p.answer.trim().toUpperCase() === letter));
                              const showAsCorrect =
                                isRevealed && isOptionTicked;

                              return (
                                <div
                                  key={letter}
                                  className={`flex items-start gap-2.5 p-2.5 sm:p-3 rounded-xl border text-xs transition-all ${
                                    showAsCorrect
                                      ? "border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/30 text-emerald-900 dark:text-emerald-200 font-medium ring-1 ring-emerald-500/50"
                                      : "border-[#e5e5ea] dark:border-[#333336] bg-[#fbfbfd] dark:bg-[#1a1a1c] text-[#1d1d1f] dark:text-[#f5f5f7]"
                                  }`}
                                >
                                  <span
                                    className={`inline-flex items-center justify-center w-5 h-5 rounded-md text-[11px] font-bold shrink-0 ${
                                      showAsCorrect
                                        ? "bg-emerald-600 text-white shadow-2xs"
                                        : "bg-[#e5e5ea] dark:bg-[#3a3a3c] text-[#1d1d1f] dark:text-[#f5f5f7]"
                                    }`}
                                  >
                                    {letter}
                                  </span>
                                  <span className="flex-1 pt-0.5 leading-relaxed break-words">
                                    {optText || `(Option ${letter})`}
                                  </span>
                                  {showAsCorrect && (
                                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/50 px-2 py-0.5 rounded-md shrink-0">
                                      <Check className="w-3 h-3" /> Correct
                                    </span>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                    </div>

                    {/* Reveal Answer / Solution Box */}
                    {isRevealed && (
                      <div className="mt-4 p-4 rounded-xl bg-[#f5f5f7] dark:bg-[#1d1d1f] border border-[#e5e5ea] dark:border-[#333336] text-xs animate-in fade-in duration-150 space-y-2">
                        {p.answer && (
                          <div>
                            <span className="font-bold text-[#1d1d1f] dark:text-[#f5f5f7] block mb-0.5">
                              {p.isNat
                                ? "Correct Numerical Answer:"
                                : "Answer:"}
                            </span>
                            <div className="flex flex-wrap items-center gap-2">
                              <div className="font-mono text-emerald-700 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1 rounded-full inline-block border border-emerald-200/80 dark:border-emerald-800/60">
                                {p.answer}
                              </div>
                              {p.isNat && p.natAnswerRange && (
                                <span className="text-[11px] text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/40 px-2.5 py-0.5 rounded-full border border-purple-200 dark:border-purple-800/60 font-mono">
                                  Acceptable Range: [{p.natAnswerRange.min} to{" "}
                                  {p.natAnswerRange.max}]
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                        {p.explanation && (
                          <div>
                            <span className="font-bold text-[#1d1d1f] dark:text-[#f5f5f7] block mb-0.5">
                              Explanation & Method:
                            </span>
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
                        {isRevealed ? (
                          <EyeOff className="w-3.5 h-3.5" />
                        ) : (
                          <Eye className="w-3.5 h-3.5" />
                        )}
                        <span>
                          {isRevealed
                            ? "Hide Solution"
                            : "View Answer & Solution"}
                        </span>
                      </button>

                      {/* Status Marking Buttons */}
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] text-[#86868b] dark:text-[#a1a1a6] font-medium mr-1 hidden sm:inline">
                          Mark as:
                        </span>
                        <button
                          onClick={() => updatePyqStatus(p.id, "correct")}
                          className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 transition-colors ${
                            p.status === "correct"
                              ? "bg-emerald-600 text-white"
                              : "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 border border-emerald-200/80 dark:border-emerald-800/60"
                          }`}
                        >
                          <Check className="w-3 h-3" />
                          <span>Correct</span>
                        </button>

                        <button
                          onClick={() => updatePyqStatus(p.id, "wrong")}
                          className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 transition-colors ${
                            p.status === "wrong"
                              ? "bg-[#ff3b30] text-white"
                              : "bg-red-50 dark:bg-red-950/40 text-[#ff3b30] dark:text-[#ff453a] hover:bg-red-100 dark:hover:bg-red-900/40 border border-red-200/80 dark:border-red-800/60"
                          }`}
                        >
                          <X className="w-3 h-3" />
                          <span>Wrong</span>
                        </button>

                        <button
                          onClick={() => updatePyqStatus(p.id, "skipped")}
                          className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 transition-colors ${
                            p.status === "skipped"
                              ? "bg-[#1d1d1f] dark:bg-[#f5f5f7] text-white dark:text-black"
                              : "bg-[#f5f5f7] dark:bg-[#2c2c2e] text-[#86868b] dark:text-[#a1a1a6] hover:text-[#1d1d1f] dark:hover:text-[#f5f5f7]"
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
        title={editingPyqId ? "Edit PYQ Question" : "Add GATE PYQ"}
        subtitle="Contribute or log a question into the archive with 4 options and photo diagram"
        maxWidth="3xl"
      >
        <form onSubmit={handleSavePyq} className="space-y-4">
          {/* Subject & Chapter Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] mb-1">
                Subject *
              </label>
              <select
                value={formSubjectId}
                onChange={(e) => {
                  setFormSubjectId(e.target.value);
                  const firstChap = chapters.find(
                    (c) => c.subjectId === e.target.value,
                  );
                  setFormChapterId(firstChap ? firstChap.id : "");
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

          {/* GATE Year, Question No., Difficulty */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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
                onChange={(e) =>
                  setFormDifficulty(e.target.value as PyqDifficulty)
                }
                className="w-full bg-[#f5f5f7] dark:bg-[#2c2c2e] border border-[#e5e5ea] dark:border-[#3a3a3c] text-[#1d1d1f] dark:text-[#f5f5f7] rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-[#0071e3] focus:outline-none"
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
          </div>

          {/* Question Weightage & Question Format (MCQ vs NAT) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Weightage: 1 Mark or 2 Marks Checkbox */}
            <div className="p-3 rounded-xl border border-[#e5e5ea] dark:border-[#3a3a3c] bg-[#fbfbfd] dark:bg-[#202022]">
              <div className="flex flex-col justify-between h-full gap-2">
                <div>
                  <label className="block text-xs font-bold text-[#1d1d1f] dark:text-[#f5f5f7]">
                    Question Weightage (Marks) *
                  </label>
                  <p className="text-[11px] text-[#86868b] dark:text-[#a1a1a6]">
                    Select whether this question carries 1 mark or 2 marks.
                  </p>
                </div>

                {/* Interactive Checkbox Selection for 1 Mark or 2 Marks */}
                <div className="flex items-center gap-2.5 pt-1">
                  <label
                    onClick={() => setFormMarks(1)}
                    className={`flex-1 flex items-center justify-center gap-2 px-3 py-1.5 rounded-lg border cursor-pointer select-none transition-all ${
                      formMarks === 1
                        ? "border-[#0071e3] bg-blue-50/80 dark:bg-blue-950/40 text-[#0071e3] dark:text-[#2997ff] ring-1 ring-[#0071e3]/30 font-semibold"
                        : "border-[#e5e5ea] dark:border-[#3a3a3c] bg-white dark:bg-[#161618] text-[#1d1d1f] dark:text-[#f5f5f7] hover:border-[#86868b]"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={formMarks === 1}
                      onChange={() => setFormMarks(1)}
                      className="w-3.5 h-3.5 rounded text-[#0071e3] focus:ring-[#0071e3] border-[#d1d1d6] dark:border-[#545458] cursor-pointer"
                    />
                    <span className="text-xs">1 Mark</span>
                  </label>

                  <label
                    onClick={() => setFormMarks(2)}
                    className={`flex-1 flex items-center justify-center gap-2 px-3 py-1.5 rounded-lg border cursor-pointer select-none transition-all ${
                      formMarks === 2
                        ? "border-amber-500 bg-amber-50/80 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 ring-1 ring-amber-500/30 font-semibold"
                        : "border-[#e5e5ea] dark:border-[#3a3a3c] bg-white dark:bg-[#161618] text-[#1d1d1f] dark:text-[#f5f5f7] hover:border-[#86868b]"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={formMarks === 2}
                      onChange={() => setFormMarks(2)}
                      className="w-3.5 h-3.5 rounded text-amber-600 focus:ring-amber-500 border-[#d1d1d6] dark:border-[#545458] cursor-pointer"
                    />
                    <span className="text-xs">2 Marks</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Question Format: MCQ vs NAT Selection */}
            <div className="p-3 rounded-xl border border-[#e5e5ea] dark:border-[#3a3a3c] bg-[#fbfbfd] dark:bg-[#202022]">
              <div className="flex flex-col justify-between h-full gap-2">
                <div>
                  <label className="block text-xs font-bold text-[#1d1d1f] dark:text-[#f5f5f7]">
                    Question Type (MCQ or NAT) *
                  </label>
                  <p className="text-[11px] text-[#86868b] dark:text-[#a1a1a6]">
                    Choose Multiple Choice or Numerical Answer Type.
                  </p>
                </div>

                <div className="flex items-center gap-2.5 pt-1">
                  <label
                    onClick={() => setFormIsNat(false)}
                    className={`flex-1 flex items-center justify-center gap-2 px-3 py-1.5 rounded-lg border cursor-pointer select-none transition-all ${
                      !formIsNat
                        ? "border-[#0071e3] bg-blue-50/80 dark:bg-blue-950/40 text-[#0071e3] dark:text-[#2997ff] ring-1 ring-[#0071e3]/30 font-semibold"
                        : "border-[#e5e5ea] dark:border-[#3a3a3c] bg-white dark:bg-[#161618] text-[#1d1d1f] dark:text-[#f5f5f7] hover:border-[#86868b]"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={!formIsNat}
                      onChange={() => setFormIsNat(false)}
                      className="w-3.5 h-3.5 rounded text-[#0071e3] focus:ring-[#0071e3] border-[#d1d1d6] dark:border-[#545458] cursor-pointer"
                    />
                    <span className="text-xs">MCQ (4 Options)</span>
                  </label>

                  <label
                    onClick={() => setFormIsNat(true)}
                    className={`flex-1 flex items-center justify-center gap-2 px-3 py-1.5 rounded-lg border cursor-pointer select-none transition-all ${
                      formIsNat
                        ? "border-purple-500 bg-purple-50/80 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 ring-1 ring-purple-500/30 font-semibold"
                        : "border-[#e5e5ea] dark:border-[#3a3a3c] bg-white dark:bg-[#161618] text-[#1d1d1f] dark:text-[#f5f5f7] hover:border-[#86868b]"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={formIsNat}
                      onChange={() => setFormIsNat(true)}
                      className="w-3.5 h-3.5 rounded text-purple-600 focus:ring-purple-500 border-[#d1d1d6] dark:border-[#545458] cursor-pointer"
                    />
                    <span className="text-xs flex items-center gap-1">
                      <Hash className="w-3 h-3 text-purple-500" />
                      NAT (Numerical)
                    </span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Question Statement & Photo */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">
                Question Statement {formImageUrl ? "" : "*"}
              </label>
              <span className="text-[11px] text-[#86868b] dark:text-[#a1a1a6]">
                Text and/or photo diagram
              </span>
            </div>
            <textarea
              value={formQuestion}
              onChange={(e) => setFormQuestion(e.target.value)}
              rows={3}
              placeholder="Type or paste the question text..."
              className="w-full bg-[#f5f5f7] dark:bg-[#2c2c2e] border border-[#e5e5ea] dark:border-[#3a3a3c] text-[#1d1d1f] dark:text-[#f5f5f7] rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-[#0071e3] focus:outline-none font-sans"
              required={!formImageUrl}
            />

            {/* Photo Attachment Container */}
            <div className="pt-1">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handlePhotoUpload(e.target.files?.[0])}
              />

              {formImageUrl ? (
                <div className="p-3 rounded-xl border border-[#e5e5ea] dark:border-[#3a3a3c] bg-[#fbfbfd] dark:bg-[#202022] flex flex-col sm:flex-row items-center gap-4">
                  <div className="relative group max-w-xs shrink-0 rounded-lg overflow-hidden border border-[#e5e5ea] dark:border-[#3a3a3c] bg-white dark:bg-black p-1">
                    <img
                      src={formImageUrl}
                      alt="Question photo preview"
                      className="max-h-36 w-auto object-contain rounded"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="flex-1 space-y-1 text-center sm:text-left">
                    <div className="flex items-center justify-center sm:justify-start gap-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Photo Attached to Question</span>
                    </div>
                    <p className="text-[11px] text-[#86868b] dark:text-[#a1a1a6]">
                      This photo/diagram will be displayed alongside the
                      question text in the Question Bank.
                    </p>
                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1.5">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-3 py-1 bg-white dark:bg-[#2c2c2e] border border-[#e5e5ea] dark:border-[#3a3a3c] hover:bg-[#f5f5f7] dark:hover:bg-[#38383a] text-xs font-medium rounded-lg text-[#1d1d1f] dark:text-[#f5f5f7] transition-colors"
                      >
                        Change Photo
                      </button>
                      <button
                        type="button"
                        onClick={handleRemovePhoto}
                        className="px-3 py-1 bg-red-50 dark:bg-red-950/40 border border-red-200/80 dark:border-red-900/60 text-xs font-medium rounded-lg text-[#ff3b30] dark:text-[#ff453a] hover:bg-red-100 dark:hover:bg-red-900/60 transition-colors flex items-center gap-1"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Remove</span>
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  {!showUrlInput ? (
                    <div
                      onDragOver={(e) => {
                        e.preventDefault();
                        setIsDragOver(true);
                      }}
                      onDragLeave={() => setIsDragOver(false)}
                      onDrop={(e) => {
                        e.preventDefault();
                        setIsDragOver(false);
                        handlePhotoUpload(e.dataTransfer.files?.[0]);
                      }}
                      className={`border-2 border-dashed rounded-xl p-3 text-center transition-colors ${
                        isDragOver
                          ? "border-[#0071e3] bg-blue-50/50 dark:bg-blue-950/20"
                          : "border-[#e5e5ea] dark:border-[#3a3a3c] hover:border-[#86868b]"
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#f5f5f7] dark:bg-[#2c2c2e] hover:bg-[#e5e5ea] dark:hover:bg-[#38383a] text-[#1d1d1f] dark:text-[#f5f5f7] rounded-lg text-xs font-semibold transition-colors"
                        >
                          <Upload className="w-3.5 h-3.5 text-[#0071e3] dark:text-[#2997ff]" />
                          <span>Upload Question Photo / Diagram</span>
                        </button>
                        <span className="text-[11px] text-[#86868b] dark:text-[#a1a1a6]">
                          or drag & drop image here, or
                        </span>
                        <button
                          type="button"
                          onClick={() => setShowUrlInput(true)}
                          className="text-xs text-[#0071e3] dark:text-[#2997ff] hover:underline font-medium"
                        >
                          paste image link
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 p-2 rounded-xl border border-[#e5e5ea] dark:border-[#3a3a3c] bg-[#fbfbfd] dark:bg-[#202022]">
                      <LinkIcon className="w-4 h-4 text-[#86868b] shrink-0 ml-1" />
                      <input
                        type="url"
                        value={tempUrlInput}
                        onChange={(e) => setTempUrlInput(e.target.value)}
                        placeholder="Paste image URL (https://...)"
                        className="flex-1 bg-transparent text-xs text-[#1d1d1f] dark:text-[#f5f5f7] focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={handleApplyUrl}
                        className="px-3 py-1 bg-[#0071e3] text-white text-xs font-semibold rounded-lg hover:bg-[#0077ed]"
                      >
                        Apply
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowUrlInput(false)}
                        className="px-2 py-1 text-xs text-[#86868b] hover:text-[#1d1d1f] dark:hover:text-[#f5f5f7]"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Conditional Options / Answer Section */}
          {!formIsNat ? (
            /* 4 Boxes for Four Options with Small Checkbox for Answer (MCQ) */
            <div className="space-y-2 pt-1 border-t border-[#e5e5ea] dark:border-[#333336]">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <div>
                  <label className="block text-xs font-bold text-[#1d1d1f] dark:text-[#f5f5f7]">
                    4 Options & Correct Answer Checkbox *
                  </label>
                  <p className="text-[11px] text-[#86868b] dark:text-[#a1a1a6]">
                    Tick the small checkbox on any option to mark it as the
                    answer (supports single or multiple answers).
                  </p>
                </div>

                {/* Status pill showing which option is currently ticked */}
                <div className="flex items-center gap-1 text-xs shrink-0">
                  {formCorrectOptions.some(Boolean) ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-100/80 dark:bg-emerald-950/60 px-2.5 py-0.5 rounded-full border border-emerald-300/80 dark:border-emerald-800/80">
                      <Check className="w-3 h-3" />
                      <span>
                        Answer:{" "}
                        {["A", "B", "C", "D"]
                          .filter((_, i) => formCorrectOptions[i])
                          .map((l) => `Option ${l}`)
                          .join(", ")}
                      </span>
                    </span>
                  ) : (
                    <span className="text-[11px] text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-800/50">
                      No answer checkbox ticked yet
                    </span>
                  )}
                </div>
              </div>

              {/* 4 Option Boxes Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {(["A", "B", "C", "D"] as const).map((letter, idx) => {
                  const isChecked = formCorrectOptions[idx];

                  return (
                    <div
                      key={letter}
                      className={`p-3 rounded-xl border transition-all ${
                        isChecked
                          ? "border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/25 ring-1 ring-emerald-500/40 shadow-xs"
                          : "border-[#e5e5ea] dark:border-[#3a3a3c] bg-[#fbfbfd] dark:bg-[#202022] hover:border-[#86868b]/40"
                      }`}
                    >
                      {/* Option Box Header */}
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`inline-flex items-center justify-center w-5 h-5 rounded-md text-[11px] font-bold shrink-0 ${
                              isChecked
                                ? "bg-emerald-600 text-white shadow-2xs"
                                : "bg-[#0071e3] text-white dark:bg-[#2997ff] dark:text-black"
                            }`}
                          >
                            {letter}
                          </span>
                          <span className="text-xs font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">
                            Option ({letter})
                          </span>
                        </div>

                        {/* Small Checkbox: if ticked, then that is the answer */}
                        <label className="flex items-center gap-1.5 cursor-pointer text-xs select-none">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => toggleOptionCorrect(idx)}
                            className="w-3.5 h-3.5 rounded text-emerald-600 focus:ring-emerald-500 border-[#d1d1d6] dark:border-[#545458] cursor-pointer"
                          />
                          <span
                            className={
                              isChecked
                                ? "text-[11px] font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-0.5"
                                : "text-[11px] font-medium text-[#86868b] dark:text-[#a1a1a6] hover:text-[#1d1d1f] dark:hover:text-[#f5f5f7]"
                            }
                          >
                            {isChecked ? "Answer ✓" : "Tick if Answer"}
                          </span>
                        </label>
                      </div>

                      {/* Option Content Input */}
                      <textarea
                        rows={2}
                        value={formOptions[idx]}
                        onChange={(e) =>
                          handleOptionTextChange(idx, e.target.value)
                        }
                        placeholder={`Enter text or value for Option (${letter})...`}
                        className="w-full bg-white dark:bg-[#161618] border border-[#e5e5ea] dark:border-[#3a3a3c] text-[#1d1d1f] dark:text-[#f5f5f7] rounded-lg px-2.5 py-1.5 text-xs focus:ring-2 focus:ring-[#0071e3] focus:outline-none resize-none font-sans"
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            /* NAT (Numerical Answer Type) Inputs */
            <div className="space-y-3 pt-2 pb-1 border-t border-[#e5e5ea] dark:border-[#333336]">
              <div className="flex items-center justify-between">
                <div>
                  <label className="block text-xs font-bold text-[#1d1d1f] dark:text-[#f5f5f7] flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-md bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 inline-flex items-center justify-center font-bold text-xs">
                      #
                    </span>
                    NAT (Numerical Answer Type) Specification *
                  </label>
                  <p className="text-[11px] text-[#86868b] dark:text-[#a1a1a6]">
                    GATE NAT questions do not have multiple choice options.
                    Enter the exact numerical value or acceptable range.
                  </p>
                </div>
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/40 px-2.5 py-1 rounded-full border border-purple-200 dark:border-purple-800/60">
                  <Hash className="w-3 h-3" /> NAT Mode Active
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 rounded-xl border border-purple-200 dark:border-purple-900/50 bg-purple-50/30 dark:bg-purple-950/15">
                <div>
                  <label className="block text-xs font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] mb-1">
                    Exact / Nominal Answer *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 4 or 0.125 or -2.5"
                    value={formAnswer}
                    onChange={(e) => {
                      setFormAnswer(e.target.value);
                      if (
                        !formNatMin &&
                        !formNatMax &&
                        !isNaN(parseFloat(e.target.value))
                      ) {
                        setFormNatMin(e.target.value);
                        setFormNatMax(e.target.value);
                      }
                    }}
                    className="w-full bg-white dark:bg-[#161618] border border-[#e5e5ea] dark:border-[#3a3a3c] text-[#1d1d1f] dark:text-[#f5f5f7] rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none font-mono"
                    required={formIsNat}
                  />
                  <p className="text-[10px] text-[#86868b] dark:text-[#a1a1a6] mt-1">
                    Standard correct value
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] mb-1">
                    Range Min (Optional)
                  </label>
                  <input
                    type="number"
                    step="any"
                    placeholder="e.g. 3.9"
                    value={formNatMin}
                    onChange={(e) => setFormNatMin(e.target.value)}
                    className="w-full bg-white dark:bg-[#161618] border border-[#e5e5ea] dark:border-[#3a3a3c] text-[#1d1d1f] dark:text-[#f5f5f7] rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none font-mono"
                  />
                  <p className="text-[10px] text-[#86868b] dark:text-[#a1a1a6] mt-1">
                    Lower acceptable bound
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] mb-1">
                    Range Max (Optional)
                  </label>
                  <input
                    type="number"
                    step="any"
                    placeholder="e.g. 4.1"
                    value={formNatMax}
                    onChange={(e) => setFormNatMax(e.target.value)}
                    className="w-full bg-white dark:bg-[#161618] border border-[#e5e5ea] dark:border-[#3a3a3c] text-[#1d1d1f] dark:text-[#f5f5f7] rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none font-mono"
                  />
                  <p className="text-[10px] text-[#86868b] dark:text-[#a1a1a6] mt-1">
                    Upper acceptable bound
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Answer Key / Custom Key & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">
                  {formIsNat
                    ? "NAT Numerical Key"
                    : "Answer Key (Auto-filled by Checkboxes)"}
                </label>
                <span className="text-[10px] text-[#86868b] dark:text-[#a1a1a6]">
                  {formIsNat ? "Numerical format" : "Editable"}
                </span>
              </div>
              <input
                type="text"
                placeholder={
                  formIsNat
                    ? "e.g. 4 or 0.125"
                    : "e.g. Option B, or Option A, C"
                }
                value={formAnswer}
                onChange={(e) => setFormAnswer(e.target.value)}
                className="w-full bg-[#f5f5f7] dark:bg-[#2c2c2e] border border-[#e5e5ea] dark:border-[#3a3a3c] text-[#1d1d1f] dark:text-[#f5f5f7] rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-[#0071e3] focus:outline-none font-mono"
                required
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

          {/* Solution & Key Concepts (Explanation - Kept as requested) */}
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
              {editingPyqId ? "Update Question" : "Save Question"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

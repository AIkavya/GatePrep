import {
  PYQ,
  Subject,
  Chapter,
  QuestionType,
  ExamCompletionStatus,
  ExamQuestionResult,
  ExamReportData,
} from "../types";

/**
 * Determine question type reliably across question records
 */
export function getQuestionType(q: PYQ): QuestionType {
  if (q.questionType) return q.questionType;
  if (
    q.isNat ||
    q.isNumerical ||
    q.natAnswerRange ||
    q.numericalAnswer !== undefined
  ) {
    return "nat";
  }
  if (Array.isArray(q.correctOptions) && q.correctOptions.length > 1) {
    return "msq";
  }
  return "mcq";
}

/**
 * Filter available questions according to syllabus scope and question types
 */
export function buildQuestionPool(params: {
  pyqs: PYQ[];
  scope: "all" | "multiple_subjects" | "single_subject" | "chapters";
  selectedSubjectIds: string[];
  selectedChapterIds: string[];
  selectedQuestionTypes: QuestionType[];
}): PYQ[] {
  const {
    pyqs,
    scope,
    selectedSubjectIds,
    selectedChapterIds,
    selectedQuestionTypes,
  } = params;

  return pyqs.filter((q) => {
    // 1. Syllabus Scope Filtering
    if (scope === "all") {
      // All subjects eligible
    } else if (scope === "multiple_subjects") {
      if (!selectedSubjectIds.includes(q.subjectId)) return false;
    } else if (scope === "single_subject") {
      if (
        selectedSubjectIds.length > 0 &&
        q.subjectId !== selectedSubjectIds[0]
      )
        return false;
    } else if (scope === "chapters") {
      if (
        selectedSubjectIds.length > 0 &&
        q.subjectId !== selectedSubjectIds[0]
      )
        return false;
      if (
        selectedChapterIds.length > 0 &&
        !selectedChapterIds.includes(q.chapterId)
      )
        return false;
    }

    // 2. Question Type Filtering
    const qType = getQuestionType(q);
    if (!selectedQuestionTypes.includes(qType)) {
      return false;
    }

    return true;
  });
}

/**
 * Fisher-Yates array shuffle (in-place or returning new array)
 */
export function shuffleArray<T>(arr: T[]): T[] {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Select N questions with fair distribution across selected question types,
 * respecting availability limits and shuffling order.
 */
export function selectExamQuestions(params: {
  eligiblePool: PYQ[];
  requestedCount: number;
  selectedQuestionTypes: QuestionType[];
}): PYQ[] {
  const { eligiblePool, requestedCount, selectedQuestionTypes } = params;

  if (eligiblePool.length <= requestedCount) {
    return shuffleArray(eligiblePool);
  }

  // 1. Group eligible questions by type
  const buckets: Record<QuestionType, PYQ[]> = {
    mcq: [],
    msq: [],
    nat: [],
  };

  eligiblePool.forEach((q) => {
    const t = getQuestionType(q);
    if (buckets[t]) {
      buckets[t].push(q);
    }
  });

  // Shuffle each bucket internally
  selectedQuestionTypes.forEach((t) => {
    buckets[t] = shuffleArray(buckets[t]);
  });

  // 2. Determine fair distribution among selected types
  const typesWithCount = selectedQuestionTypes.map((type) => ({
    type,
    available: buckets[type].length,
    allocated: 0,
  }));

  let remainingToAllocate = requestedCount;

  // Step 2a: Initial fair share allocation
  let activeTypes = typesWithCount.filter((t) => t.available > 0);

  while (remainingToAllocate > 0 && activeTypes.length > 0) {
    const share = Math.max(
      1,
      Math.floor(remainingToAllocate / activeTypes.length),
    );
    let allocatedThisRound = 0;

    for (const item of activeTypes) {
      if (remainingToAllocate <= 0) break;
      const canTake = Math.min(
        share,
        item.available - item.allocated,
        remainingToAllocate,
      );
      if (canTake > 0) {
        item.allocated += canTake;
        remainingToAllocate -= canTake;
        allocatedThisRound += canTake;
      }
    }

    // Refresh active types that still have remaining capacity
    activeTypes = typesWithCount.filter((t) => t.allocated < t.available);

    if (allocatedThisRound === 0) {
      // Cannot allocate more even though remainingToAllocate > 0 (all available exhausted)
      break;
    }
  }

  // 3. Collect allocated questions from buckets
  const selectedQuestions: PYQ[] = [];
  typesWithCount.forEach((item) => {
    const picked = buckets[item.type].slice(0, item.allocated);
    selectedQuestions.push(...picked);
  });

  // 4. Randomize overall question order
  return shuffleArray(selectedQuestions);
}

/**
 * Normalizes an answer for comparison
 */
export function evaluateQuestionAnswer(
  question: PYQ,
  userAnswer: any,
): {
  isAttempted: boolean;
  isCorrect: boolean;
  marksObtained: number;
  correctAnswerFormatted: string;
  userAnswerFormatted: string;
} {
  const qType = getQuestionType(question);

  // Check if unanswered
  const isUnanswered =
    userAnswer === null ||
    userAnswer === undefined ||
    userAnswer === "" ||
    (Array.isArray(userAnswer) && userAnswer.length === 0);

  if (isUnanswered) {
    let formattedCorrect = "";
    if (qType === "mcq") {
      formattedCorrect = formatMcqCorrect(question);
    } else if (qType === "msq") {
      formattedCorrect = formatMsqCorrect(question);
    } else {
      formattedCorrect = formatNatCorrect(question);
    }
    return {
      isAttempted: false,
      isCorrect: false,
      marksObtained: 0,
      correctAnswerFormatted: formattedCorrect,
      userAnswerFormatted: "Not Attempted",
    };
  }

  // Question is attempted
  if (qType === "mcq") {
    const correctVal = getMcqCorrectIndexOrText(question);
    const userStr = String(userAnswer).trim();
    let isCorrect = false;

    if (typeof correctVal === "number") {
      // User answer might be number (index) or letter ('A', 'B', 'C', 'D')
      const userIndex = parseOptionIndex(userStr);
      isCorrect = userIndex === correctVal;
    } else {
      isCorrect = userStr.toLowerCase() === String(correctVal).toLowerCase();
    }

    const marksObtained = isCorrect ? 1 : -1;
    return {
      isAttempted: true,
      isCorrect,
      marksObtained,
      correctAnswerFormatted: formatMcqCorrect(question),
      userAnswerFormatted: formatOptionDisplay(userAnswer, question.options),
    };
  }

  if (qType === "msq") {
    // User answer is array of selected indices or labels e.g. [0, 2]
    const userArray = Array.isArray(userAnswer)
      ? userAnswer.map((u) => parseOptionIndex(u))
      : [parseOptionIndex(userAnswer)];

    const userIndices = Array.from(
      new Set(userArray.filter((idx) => idx >= 0)),
    ).sort((a, b) => a - b);

    const correctIndices = getMsqCorrectIndices(question).sort((a, b) => a - b);

    // Exact set comparison: must match all correct and no extra
    const isCorrect =
      userIndices.length === correctIndices.length &&
      userIndices.every((val, idx) => val === correctIndices[idx]);

    const marksObtained = isCorrect ? 1 : -1;

    return {
      isAttempted: true,
      isCorrect,
      marksObtained,
      correctAnswerFormatted: formatMsqCorrect(question),
      userAnswerFormatted: formatMsqDisplay(userIndices, question.options),
    };
  }

  // NAT (Numerical Answer Type)
  const numStr = String(userAnswer).trim();
  const userNum = parseFloat(numStr);

  if (isNaN(userNum)) {
    return {
      isAttempted: true,
      isCorrect: false,
      marksObtained: -1,
      correctAnswerFormatted: formatNatCorrect(question),
      userAnswerFormatted: numStr,
    };
  }

  let isCorrect = false;
  if (question.natAnswerRange) {
    const { min, max } = question.natAnswerRange;
    isCorrect = userNum >= min - 0.001 && userNum <= max + 0.001;
  } else if (question.numericalAnswer !== undefined) {
    const target = parseFloat(String(question.numericalAnswer));
    isCorrect = !isNaN(target) && Math.abs(userNum - target) <= 0.02;
  } else if (question.answer) {
    const target = parseFloat(question.answer.replace(/[^0-9.-]/g, ""));
    isCorrect = !isNaN(target) && Math.abs(userNum - target) <= 0.02;
  }

  const marksObtained = isCorrect ? 1 : -1;

  return {
    isAttempted: true,
    isCorrect,
    marksObtained,
    correctAnswerFormatted: formatNatCorrect(question),
    userAnswerFormatted: numStr,
  };
}

// Helpers for option formatting & evaluation
function parseOptionIndex(val: any): number {
  if (typeof val === "number") return val;
  const str = String(val).trim().toUpperCase();
  if (str === "A" || str === "0") return 0;
  if (str === "B" || str === "1") return 1;
  if (str === "C" || str === "2") return 2;
  if (str === "D" || str === "3") return 3;
  const parsed = parseInt(str, 10);
  return isNaN(parsed) ? -1 : parsed;
}

function getMcqCorrectIndexOrText(q: PYQ): number | string {
  if (q.correctOption !== undefined && q.correctOption !== null) {
    const idx = parseOptionIndex(q.correctOption);
    if (idx >= 0) return idx;
    return q.correctOption;
  }
  if (Array.isArray(q.correctOptions) && q.correctOptions.length > 0) {
    return q.correctOptions[0];
  }
  if (q.answer) {
    const letter = q.answer
      .trim()
      .toUpperCase()
      .match(/^([A-D])/);
    if (letter) return parseOptionIndex(letter[1]);
    return q.answer;
  }
  return 0;
}

function getMsqCorrectIndices(q: PYQ): number[] {
  if (Array.isArray(q.correctOptions) && q.correctOptions.length > 0) {
    return q.correctOptions.map(parseOptionIndex).filter((i) => i >= 0);
  }
  if (q.correctOption !== undefined) {
    const idx = parseOptionIndex(q.correctOption);
    return idx >= 0 ? [idx] : [];
  }
  if (q.answer) {
    const matches = q.answer.toUpperCase().match(/[A-D]/g);
    if (matches && matches.length > 0) {
      return Array.from(new Set(matches.map(parseOptionIndex)));
    }
  }
  return [];
}

function formatOptionDisplay(val: any, options?: string[]): string {
  const idx = parseOptionIndex(val);
  const letter = ["A", "B", "C", "D"][idx] || `Option ${idx + 1}`;
  if (options && options[idx]) {
    return `${letter}: ${options[idx]}`;
  }
  return letter;
}

function formatMsqDisplay(indices: number[], options?: string[]): string {
  if (indices.length === 0) return "None";
  const letters = indices.map(
    (idx) => ["A", "B", "C", "D"][idx] || String(idx + 1),
  );
  return letters.join(", ");
}

function formatMcqCorrect(q: PYQ): string {
  const idx = parseOptionIndex(getMcqCorrectIndexOrText(q));
  if (idx >= 0) {
    const letter = ["A", "B", "C", "D"][idx];
    if (q.options && q.options[idx]) {
      return `${letter}: ${q.options[idx]}`;
    }
    return letter;
  }
  return q.answer || "Option A";
}

function formatMsqCorrect(q: PYQ): string {
  const indices = getMsqCorrectIndices(q);
  if (indices.length > 0) {
    return indices
      .map((i) => ["A", "B", "C", "D"][i] || String(i + 1))
      .join(", ");
  }
  return q.answer || "A";
}

function formatNatCorrect(q: PYQ): string {
  if (q.natAnswerRange) {
    if (q.natAnswerRange.min === q.natAnswerRange.max) {
      return String(q.natAnswerRange.min);
    }
    return `${q.natAnswerRange.min} to ${q.natAnswerRange.max}`;
  }
  if (q.numericalAnswer !== undefined) {
    return String(q.numericalAnswer);
  }
  return q.answer || "0";
}

/**
 * Generates the complete exam report dataset from completed exam session
 */
export function generateExamReport(params: {
  examId: string;
  title: string;
  date: string;
  durationMinutes: number;
  timeTakenSeconds: number;
  completionStatus: ExamCompletionStatus;
  syllabusScope: "all" | "multiple_subjects" | "single_subject" | "chapters";
  subjects: Subject[];
  chapters: Chapter[];
  questions: PYQ[];
  userAnswers: Record<string, any>;
  questionTimes: Record<string, number>;
  selectedQuestionTypes: QuestionType[];
}): ExamReportData {
  const {
    examId,
    title,
    date,
    durationMinutes,
    timeTakenSeconds,
    completionStatus,
    syllabusScope,
    subjects,
    chapters,
    questions,
    userAnswers,
    questionTimes,
    selectedQuestionTypes,
  } = params;

  const subjectMap = new Map(subjects.map((s) => [s.id, s.name]));
  const chapterMap = new Map(chapters.map((c) => [c.id, c.name]));

  const questionResults: ExamQuestionResult[] = questions.map((q, index) => {
    const qType = getQuestionType(q);
    const userAnswer = userAnswers[q.id];
    const timeSpent = questionTimes[q.id] || 0;
    const evalRes = evaluateQuestionAnswer(q, userAnswer);

    const subName = subjectMap.get(q.subjectId) || "General";
    const chapName = chapterMap.get(q.chapterId) || "General Topic";

    return {
      questionId: q.id,
      questionNumber: q.questionNumber || `Q.${index + 1}`,
      questionText: q.question || q.questionText || "",
      imageUrl: q.imageUrl,
      questionType: qType,
      subjectId: q.subjectId,
      subjectName: subName,
      chapterId: q.chapterId,
      chapterName: chapName,
      options: q.options,
      userAnswer: evalRes.userAnswerFormatted,
      correctAnswer: evalRes.correctAnswerFormatted,
      isCorrect: evalRes.isCorrect,
      isAttempted: evalRes.isAttempted,
      marksObtained: evalRes.marksObtained,
      maxMarks: 1,
      timeSpentSeconds: timeSpent,
      explanation: q.explanation,
      natAnswerRange: q.natAnswerRange,
      numericalAnswer: q.numericalAnswer,
    };
  });

  const totalQuestions = questionResults.length;
  let attemptedQuestions = 0;
  let unattemptedQuestions = 0;
  let correctQuestions = 0;
  let wrongQuestions = 0;
  let positiveMarks = 0;
  let negativeMarks = 0;

  questionResults.forEach((res) => {
    if (res.isAttempted) {
      attemptedQuestions++;
      if (res.isCorrect) {
        correctQuestions++;
        positiveMarks += 1;
      } else {
        wrongQuestions++;
        negativeMarks += 1;
      }
    } else {
      unattemptedQuestions++;
    }
  });

  const totalMarks = totalQuestions; // 1 mark per question
  const obtainedMarks = positiveMarks - negativeMarks;
  const percentage =
    totalMarks > 0
      ? Number(((obtainedMarks / totalMarks) * 100).toFixed(1))
      : 0;
  const accuracy =
    attemptedQuestions > 0
      ? Number(((correctQuestions / attemptedQuestions) * 100).toFixed(1))
      : 0;

  const avgTimePerQuestionSeconds =
    totalQuestions > 0 ? Math.round(timeTakenSeconds / totalQuestions) : 0;

  // Fastest & slowest among attempted questions
  const attemptedResults = questionResults.filter(
    (r) => r.isAttempted && r.timeSpentSeconds > 0,
  );
  let fastestQuestion:
    | { questionNumber: string | number; seconds: number }
    | undefined;
  let slowestQuestion:
    | { questionNumber: string | number; seconds: number }
    | undefined;

  if (attemptedResults.length > 0) {
    const sortedByTime = [...attemptedResults].sort(
      (a, b) => a.timeSpentSeconds - b.timeSpentSeconds,
    );
    fastestQuestion = {
      questionNumber: sortedByTime[0].questionNumber || "Q.1",
      seconds: sortedByTime[0].timeSpentSeconds,
    };
    slowestQuestion = {
      questionNumber:
        sortedByTime[sortedByTime.length - 1].questionNumber || "Q.1",
      seconds: sortedByTime[sortedByTime.length - 1].timeSpentSeconds,
    };
  }

  // Question-Type breakdown
  const typeStats: Record<
    QuestionType,
    {
      total: number;
      correct: number;
      wrong: number;
      unattempted: number;
      accuracy: number;
    }
  > = {
    mcq: { total: 0, correct: 0, wrong: 0, unattempted: 0, accuracy: 0 },
    msq: { total: 0, correct: 0, wrong: 0, unattempted: 0, accuracy: 0 },
    nat: { total: 0, correct: 0, wrong: 0, unattempted: 0, accuracy: 0 },
  };

  questionResults.forEach((res) => {
    const st = typeStats[res.questionType];
    if (st) {
      st.total++;
      if (res.isAttempted) {
        if (res.isCorrect) st.correct++;
        else st.wrong++;
      } else {
        st.unattempted++;
      }
    }
  });

  (["mcq", "msq", "nat"] as QuestionType[]).forEach((t) => {
    const st = typeStats[t];
    const att = st.correct + st.wrong;
    st.accuracy = att > 0 ? Number(((st.correct / att) * 100).toFixed(1)) : 0;
  });

  // Weak & Strong Areas (Subject & Chapter breakdown)
  const topicMap = new Map<
    string,
    {
      subjectName: string;
      chapterName: string;
      total: number;
      attempted: number;
      correct: number;
      wrong: number;
    }
  >();

  questionResults.forEach((res) => {
    const key = `${res.subjectName}:::${res.chapterName}`;
    if (!topicMap.has(key)) {
      topicMap.set(key, {
        subjectName: res.subjectName,
        chapterName: res.chapterName,
        total: 0,
        attempted: 0,
        correct: 0,
        wrong: 0,
      });
    }
    const item = topicMap.get(key)!;
    item.total++;
    if (res.isAttempted) {
      item.attempted++;
      if (res.isCorrect) item.correct++;
      else item.wrong++;
    }
  });

  const topicStats = Array.from(topicMap.values()).map((t) => {
    const acc =
      t.attempted > 0
        ? Number(((t.correct / t.attempted) * 100).toFixed(1))
        : 0;
    let category: "strong" | "weak" | "moderate" = "moderate";
    if (t.attempted >= 2) {
      if (acc >= 75) {
        category = "strong";
      } else if (acc < 50 || t.wrong > t.correct) {
        category = "weak";
      }
    } else if (t.attempted === 1) {
      if (t.correct === 1) category = "strong";
      else category = "weak";
    }
    return {
      ...t,
      accuracy: acc,
      category,
    };
  });

  const subjectNames = Array.from(
    new Set(questionResults.map((r) => r.subjectName)),
  );
  const chapterNames = Array.from(
    new Set(questionResults.map((r) => r.chapterName)),
  );

  return {
    examId,
    title,
    date,
    durationMinutes,
    timeTakenSeconds,
    completionStatus,
    syllabusScope,
    subjectNames,
    chapterNames,
    questionTypes: selectedQuestionTypes,
    totalQuestions,
    attemptedQuestions,
    unattemptedQuestions,
    correctQuestions,
    wrongQuestions,
    totalMarks,
    obtainedMarks,
    percentage,
    accuracy,
    positiveMarks,
    negativeMarks,
    avgTimePerQuestionSeconds,
    fastestQuestion,
    slowestQuestion,
    typeStats,
    topicStats,
    questions: questionResults,
  };
}

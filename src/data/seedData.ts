import {
  Subject,
  Chapter,
  Revision,
  PYQ,
  PyqQueueItem,
  CalendarEvent,
  Exam,
  RevisionSettings,
} from "../types";

export const DEFAULT_REVISION_SETTINGS: RevisionSettings = {
  rev1Days: 7,
  rev2Days: 14,
  rev3Days: 28,
};

export function getInitialSeedData(): {
  subjects: Subject[];
  chapters: Chapter[];
  revisions: Revision[];
  pyqs: PYQ[];
  pyqQueue: PyqQueueItem[];
  calendarEvents: CalendarEvent[];
  exams: Exam[];
  revisionSettings: RevisionSettings;
} {
  const subjects: Subject[] = [
    {
      id: "sub-dbms",
      name: "Database Management Systems",
      code: "DBMS",
      description:
        "Relational model, SQL, Normalization, Transactions & Concurrency, Indexing.",
      color: "#2563eb",
      totalRevisionsCount: 3,
      entirePyqSolvedCount: 2,
      subjectTestsCount: 3,
    },
    {
      id: "sub-os",
      name: "Operating Systems",
      code: "OS",
      description:
        "Processes, Threads, CPU Scheduling, Synchronization, Deadlocks, Memory Management.",
      color: "#059669",
      totalRevisionsCount: 4,
      entirePyqSolvedCount: 1,
      subjectTestsCount: 4,
    },
    {
      id: "sub-algo",
      name: "Algorithms",
      code: "ALGO",
      description:
        "Asymptotic analysis, Divide & Conquer, Greedy, DP, Graph Algorithms.",
      color: "#7c3aed",
      totalRevisionsCount: 2,
      entirePyqSolvedCount: 1,
      subjectTestsCount: 2,
    },
    {
      id: "sub-cn",
      name: "Computer Networks",
      code: "CN",
      description:
        "OSI/TCP-IP models, Routing protocols, TCP/UDP congestion control, IP addressing.",
      color: "#ea580c",
      totalRevisionsCount: 1,
      entirePyqSolvedCount: 0,
      subjectTestsCount: 1,
    },
    {
      id: "sub-ds",
      name: "Data Structures",
      code: "DS",
      description:
        "Arrays, Stacks, Queues, Linked Lists, Trees, BST, Heaps, Graphs, Hashing.",
      color: "#0891b2",
      totalRevisionsCount: 2,
      entirePyqSolvedCount: 1,
      subjectTestsCount: 2,
    },
    {
      id: "sub-coa",
      name: "Computer Organization & Architecture",
      code: "COA",
      description:
        "Machine instructions, Addressing modes, ALU, Pipelining, Cache memory.",
      color: "#d97706",
      totalRevisionsCount: 1,
      entirePyqSolvedCount: 0,
      subjectTestsCount: 1,
    },
    {
      id: "sub-toc",
      name: "Theory of Computation",
      code: "TOC",
      description:
        "Regular expressions, Finite automata, Context-free grammars, Turing machines.",
      color: "#4f46e5",
      totalRevisionsCount: 3,
      entirePyqSolvedCount: 1,
      subjectTestsCount: 2,
    },
    {
      id: "sub-dm",
      name: "Discrete Mathematics",
      code: "DM",
      description:
        "Propositional & First order logic, Sets, Relations, Functions, Combinatorics, Graph theory.",
      color: "#db2777",
      totalRevisionsCount: 2,
      entirePyqSolvedCount: 1,
      subjectTestsCount: 2,
    },
    {
      id: "sub-em",
      name: "Engineering Mathematics",
      code: "EM",
      description: "Linear Algebra, Calculus, Probability and Statistics.",
      color: "#64748b",
      totalRevisionsCount: 1,
      entirePyqSolvedCount: 0,
      subjectTestsCount: 1,
    },
    {
      id: "sub-cd",
      name: "Compiler Design",
      code: "CD",
      description:
        "Lexical analysis, Parsing, Syntax Directed Translation, Runtime Environments, Code optimization.",
      color: "#0284c7",
      totalRevisionsCount: 1,
      entirePyqSolvedCount: 0,
      subjectTestsCount: 1,
    },
    {
      id: "sub-dl",
      name: "Digital Logic",
      code: "DL",
      description:
        "Boolean algebra, Combinational and sequential circuits, Minimization, Number representations.",
      color: "#0d9488",
      totalRevisionsCount: 1,
      entirePyqSolvedCount: 0,
      subjectTestsCount: 1,
    },
  ];

  const chapters: Chapter[] = [
    {
      id: "chap-dbms-tx",
      subjectId: "sub-dbms",
      name: "Transactions & Concurrency Control",
      priority: 10,
      status: "in_progress",
      progress: 80,
      revisionCount: 2,
      pyqsSolvedCount: 15,
      pyqFullCyclesCount: 1,
      notes:
        "Focus on Conflict Serializability, View Serializability, 2PL and Strict 2PL.",
      createdAt: "2026-08-26",
    },
    {
      id: "chap-dbms-norm",
      subjectId: "sub-dbms",
      name: "Normalization & Functional Dependencies",
      priority: 9,
      status: "completed",
      progress: 100,
      revisionCount: 3,
      pyqsSolvedCount: 25,
      pyqFullCyclesCount: 2,
      notes:
        "Master finding candidate keys, BCNF, 3NF decomposition and dependency preservation.",
      createdAt: "2026-08-26",
      completedAt: "2026-09-02",
    },
    {
      id: "chap-dbms-sql",
      subjectId: "sub-dbms",
      name: "SQL & Relational Algebra",
      priority: 8,
      status: "not_started",
      progress: 0,
      revisionCount: 0,
      pyqsSolvedCount: 0,
      pyqFullCyclesCount: 0,
      notes:
        "Group by, Having, Nested subqueries, Correlated subqueries, Relational Calculus.",
      createdAt: "2026-09-02",
    },
    {
      id: "chap-dbms-index",
      subjectId: "sub-dbms",
      name: "Indexing & B/B+ Trees",
      priority: 6,
      status: "not_started",
      progress: 0,
      revisionCount: 1,
      pyqsSolvedCount: 8,
      pyqFullCyclesCount: 0,
      notes:
        "Order of B-tree node, maximum and minimum keys, search time complexity.",
      createdAt: "2026-09-02",
    },
    {
      id: "chap-dbms-er",
      subjectId: "sub-dbms",
      name: "ER Model & Relational Schema Mapping",
      priority: 4,
      status: "completed",
      progress: 100,
      notes: "Mapping 1:1, 1:N, M:N relationships to minimum number of tables.",
      createdAt: "2026-08-26",
      completedAt: "2026-08-26",
    },
    {
      id: "chap-os-proc",
      subjectId: "sub-os",
      name: "Process Management & CPU Scheduling",
      priority: 9,
      status: "completed",
      progress: 100,
      notes:
        "SJF, SRTF, Round Robin with context switch overhead, Gantt charts.",
      createdAt: "2026-08-26",
      completedAt: "2026-08-26",
    },
    {
      id: "chap-os-sync",
      subjectId: "sub-os",
      name: "Process Synchronization & Semaphores",
      priority: 8,
      status: "in_progress",
      progress: 55,
      notes:
        "Peterson solution, Counting vs Binary Semaphores, Producer-Consumer, Dining Philosophers.",
      createdAt: "2026-09-02",
    },
    {
      id: "chap-os-deadlock",
      subjectId: "sub-os",
      name: "Deadlocks & Resource Allocation",
      priority: 7,
      status: "not_started",
      progress: 0,
      notes:
        "Banker's Algorithm, Safety sequence, Deadlock prevention vs avoidance.",
      createdAt: "2026-09-08",
    },
    {
      id: "chap-algo-sort",
      subjectId: "sub-algo",
      name: "Sorting & Divide and Conquer",
      priority: 8,
      status: "completed",
      progress: 100,
      notes:
        "Master Theorem, recurrence trees, MergeSort, QuickSort best/worst pivot cases.",
      createdAt: "2026-08-26",
      completedAt: "2026-08-26",
    },
    {
      id: "chap-algo-graph",
      subjectId: "sub-algo",
      name: "Graph Algorithms & Shortest Paths",
      priority: 9,
      status: "in_progress",
      progress: 30,
      notes:
        "Dijkstra's (negative cycle restriction), Bellman-Ford, Prim's and Kruskal's MST.",
      createdAt: "2026-09-02",
    },
    {
      id: "chap-cn-tcp",
      subjectId: "sub-cn",
      name: "TCP/IP & Flow/Congestion Control",
      priority: 8,
      status: "completed",
      progress: 100,
      notes:
        "Stop & Wait, Go-Back-N, Selective Repeat, Slow start, Congestion avoidance, AIMD.",
      createdAt: "2026-08-26",
      completedAt: "2026-09-02",
    },
    {
      id: "chap-cn-ip",
      subjectId: "sub-cn",
      name: "IP Addressing & Subnetting",
      priority: 7,
      status: "in_progress",
      progress: 40,
      notes: "CIDR, Subnet masks, Longest prefix match in routing tables.",
      createdAt: "2026-09-02",
    },
  ];

  const revisions: Revision[] = [
    {
      id: "rev-dbms-norm-1",
      subjectId: "sub-dbms",
      chapterId: "chap-dbms-norm",
      revisionNumber: 1,
      dueDate: "2026-09-09",
      status: "due_today",
      priority: 10,
      progress: 30,
      notes: "Revise 3NF vs BCNF testing algorithm and minimal covers.",
    },
    {
      id: "rev-os-proc-2",
      subjectId: "sub-os",
      chapterId: "chap-os-proc",
      revisionNumber: 2,
      dueDate: "2026-09-09",
      status: "due_today",
      priority: 9,
      progress: 0,
      notes: "Quick test on Round Robin Gantt chart calculations.",
    },
    {
      id: "rev-cn-tcp-1",
      subjectId: "sub-cn",
      chapterId: "chap-cn-tcp",
      revisionNumber: 1,
      dueDate: "2026-09-09",
      status: "due_today",
      priority: 8,
      progress: 0,
      notes:
        "Solve 5 numericals on TCP Congestion Window size after 3 duplicate ACKs / Timeout.",
    },
    {
      id: "rev-algo-sort-2",
      subjectId: "sub-algo",
      chapterId: "chap-algo-sort",
      revisionNumber: 2,
      dueDate: "2026-09-10",
      status: "upcoming",
      priority: 7,
      progress: 0,
      notes: "Review Master Theorem edge cases and median of medians.",
    },
    {
      id: "rev-dbms-er-1",
      subjectId: "sub-dbms",
      chapterId: "chap-dbms-er",
      revisionNumber: 1,
      dueDate: "2026-09-02",
      completedAt: "2026-09-02",
      status: "completed",
      priority: 5,
      progress: 100,
      notes: "Done successfully, retained 95% concepts.",
    },
  ];

  const pyqs: PYQ[] = [
    // --- DBMS: Normalization (MCQ, MSQ, NAT) ---
    {
      id: "pyq-dbms-1",
      subjectId: "sub-dbms",
      chapterId: "chap-dbms-norm",
      year: 2024,
      questionType: "mcq",
      questionNumber: "Q.14",
      question:
        "Consider a relation R(A, B, C, D, E) with functional dependencies: F = { AB -> C, C -> D, D -> E, E -> A }. What is the candidate key and highest normal form of R?",
      options: [
        "Candidate keys: {AB}, highest normal form: 2NF",
        "Candidate keys: {AB, BC, BD, BE}, highest normal form: 3NF",
        "Candidate keys: {AB, BC, BD, BE}, highest normal form: BCNF",
        "Candidate keys: {A, B}, highest normal form: 1NF",
      ],
      correctOption: 1,
      answer: "Candidate keys: {AB, BC, BD, BE}, highest normal form: 3NF",
      explanation:
        "Since AB+ = ABCDE, BC+ = BCDEA, BD+ = BDEAC, BE+ = BEACD. All of them are candidate keys. Prime attributes: {A, B, C, D, E}. Since all attributes are prime, R is automatically in 3NF. However, for C -> D, C is not a superkey, hence not in BCNF.",
      difficulty: "medium",
      status: "correct",
    },
    {
      id: "pyq-dbms-2",
      subjectId: "sub-dbms",
      chapterId: "chap-dbms-norm",
      year: 2023,
      questionType: "mcq",
      questionNumber: "Q.28",
      question:
        "A relation R(A, B, C, D) has FDs: { A -> B, B -> C, C -> D, D -> A }. R is decomposed into R1(A, B), R2(B, C), R3(C, D). Which statement is true regarding this decomposition?",
      options: [
        "Lossless join and dependency preserving",
        "Lossless join but not dependency preserving",
        "Dependency preserving but not lossless join",
        "Neither lossless join nor dependency preserving",
      ],
      correctOption: 0,
      answer: "Lossless join and dependency preserving",
      explanation:
        "Intersection of schemas: R1 ∩ R2 = B (which is a key for R2 since B->C). R12 ∩ R3 = C (which is a key for R3). Hence lossless. All FDs A->B, B->C, C->D are preserved in R1, R2, R3.",
      difficulty: "easy",
      status: "correct",
    },
    {
      id: "pyq-dbms-msq-1",
      subjectId: "sub-dbms",
      chapterId: "chap-dbms-norm",
      year: 2023,
      questionType: "msq",
      questionNumber: "Q.42",
      question:
        "Which of the following statements is/are ALWAYS TRUE regarding relational schema normal forms? (MSQ)",
      options: [
        "Every relation in BCNF is also in 3NF",
        "Any relation with only 2 attributes is always in BCNF",
        "Lossless and dependency preserving decomposition into BCNF is always possible",
        "Lossless and dependency preserving decomposition into 3NF is always possible",
      ],
      correctOptions: [0, 1, 3],
      answer: "A, B, D",
      explanation:
        "A is true: BCNF is strictly stronger than 3NF. B is true: binary relations cannot have non-trivial FD violating BCNF. D is true: 3NF synthesis algorithm guarantees both lossless join and dependency preservation. C is false because BCNF cannot always preserve dependencies.",
      difficulty: "hard",
      status: "not_attempted",
    },
    {
      id: "pyq-dbms-nat-1",
      subjectId: "sub-dbms",
      chapterId: "chap-dbms-norm",
      year: 2022,
      questionType: "nat",
      isNat: true,
      questionNumber: "Q.51",
      question:
        "Consider a relation R(A, B, C, D, E, F) with FDs: { AB -> C, C -> D, D -> E, E -> F, F -> A }. How many distinct candidate keys exist for relation R?",
      answer: "5",
      numericalAnswer: 5,
      natAnswerRange: { min: 5, max: 5 },
      explanation:
        "Notice B must be in every key because it does not appear on RHS of any FD. AB+ = ABCDEF, CB+ = CBDEFA, DB+ = DBFEAC, EB+ = EBAFCD, FB+ = FABCDE. Thus {AB, BC, BD, BE, BF} are the 5 candidate keys.",
      difficulty: "medium",
      status: "not_attempted",
    },

    // --- DBMS: Transactions & Concurrency Control ---
    {
      id: "pyq-dbms-tx-1",
      subjectId: "sub-dbms",
      chapterId: "chap-dbms-tx",
      year: 2024,
      questionType: "mcq",
      questionNumber: "Q.33",
      question:
        "Consider schedule S: r1(X); r2(Y); r1(Y); r2(X); w1(X); w2(Y). Which of the following is correct regarding schedule S?",
      options: [
        "S is conflict serializable with serial order T1 -> T2",
        "S is conflict serializable with serial order T2 -> T1",
        "S is NOT conflict serializable (contains a cycle)",
        "S is view serializable but not conflict serializable",
      ],
      correctOption: 2,
      answer: "S is NOT conflict serializable (contains a cycle)",
      explanation:
        "Conflicting pairs: r2(X) before w1(X) implies edge T2 -> T1. Also r1(Y) before w2(Y) implies edge T1 -> T2. This forms a cycle (T1 -> T2 and T2 -> T1).",
      difficulty: "medium",
      status: "correct",
    },
    {
      id: "pyq-dbms-tx-msq-1",
      subjectId: "sub-dbms",
      chapterId: "chap-dbms-tx",
      year: 2023,
      questionType: "msq",
      questionNumber: "Q.39",
      question:
        "Which of the following concurrency control protocol statements is/are correct? (MSQ)",
      options: [
        "Basic Two-Phase Locking (2PL) guarantees conflict serializability",
        "Basic Two-Phase Locking (2PL) is free from deadlocks",
        "Strict 2PL guarantees recoverability and avoids cascading aborts",
        "Timestamp Ordering protocol guarantees freedom from deadlocks",
      ],
      correctOptions: [0, 2, 3],
      answer: "A, C, D",
      explanation:
        "Basic 2PL guarantees conflict serializability (A), but deadlocks can occur (B is false). Strict 2PL holds exclusive locks until commit/abort, avoiding cascading rollbacks (C). Timestamp Ordering avoids deadlocks because transactions are aborted rather than waiting (D).",
      difficulty: "medium",
      status: "not_attempted",
    },

    // --- OS: CPU Scheduling & Processes ---
    {
      id: "pyq-os-proc-1",
      subjectId: "sub-os",
      chapterId: "chap-os-proc",
      year: 2023,
      questionType: "nat",
      marks: 2,
      isNat: true,
      questionNumber: "Q.22",
      question:
        "Three processes P1, P2, P3 arrive at t=0 with burst times 10, 4, 2. Round Robin scheduling with time quantum 2 is used without context switch overhead. What is the average waiting time (in milliseconds)?",
      answer: "4.67",
      numericalAnswer: "4.67",
      natAnswerRange: { min: 4.6, max: 4.7 },
      explanation:
        "Execution order in quantum 2: P1(0-2), P2(2-4), P3(4-6 [P3 finishes]), P1(6-8), P2(8-10 [P2 finishes]), P1(10-16 [P1 finishes]). Waiting times: P3 = 4, P2 = 6, P1 = 4. Avg = (4+6+4)/3 = 4.67 ms.",
      difficulty: "medium",
      status: "correct",
    },
    {
      id: "pyq-os-proc-mcq-1",
      subjectId: "sub-os",
      chapterId: "chap-os-proc",
      year: 2024,
      questionType: "mcq",
      questionNumber: "Q.12",
      question:
        "Which CPU scheduling algorithm minimizes the average waiting time for a given set of processes with known CPU burst times?",
      options: [
        "First-Come, First-Served (FCFS)",
        "Shortest Job First (SJF / SRTF)",
        "Round Robin (RR)",
        "Priority Scheduling without preemption",
      ],
      correctOption: 1,
      answer: "Shortest Job First (SJF / SRTF)",
      explanation:
        "Shortest Job First (SJF) is provably optimal in minimizing average waiting time for a given set of processes.",
      difficulty: "easy",
      status: "correct",
    },
    {
      id: "pyq-os-proc-msq-1",
      subjectId: "sub-os",
      chapterId: "chap-os-proc",
      year: 2023,
      questionType: "msq",
      questionNumber: "Q.35",
      question:
        "Which of the following actions trigger a context switch by the operating system kernel? (MSQ)",
      options: [
        "A timer interrupt in preemptive multitasking",
        "An I/O request requiring synchronous disk read",
        "Executing a non-blocking arithmetic register operation",
        "Voluntary relinquishment of CPU via sched_yield() system call",
      ],
      correctOptions: [0, 1, 3],
      answer: "A, B, D",
      explanation:
        "Timer interrupts (A), I/O blockages (B), and voluntary yields (D) switch CPU context. Pure register operations (C) execute in user mode without trap to kernel.",
      difficulty: "medium",
      status: "not_attempted",
    },

    // --- OS: Synchronization & Deadlocks ---
    {
      id: "pyq-os-sync-1",
      subjectId: "sub-os",
      chapterId: "chap-os-sync",
      year: 2024,
      questionType: "nat",
      marks: 1,
      isNat: true,
      questionNumber: "Q.08",
      question:
        "A counting semaphore S is initialized to 7. Then 20 wait() operations and 15 signal() operations are conducted on S. What is the final value of S?",
      answer: "2",
      numericalAnswer: 2,
      natAnswerRange: { min: 2, max: 2 },
      explanation:
        "Initial = 7. 20 wait() operations decrement by 20 -> 7 - 20 = -13. 15 signal() operations increment by 15 -> -13 + 15 = 2.",
      difficulty: "easy",
      status: "correct",
    },
    {
      id: "pyq-os-sync-msq-1",
      subjectId: "sub-os",
      chapterId: "chap-os-sync",
      year: 2022,
      questionType: "msq",
      questionNumber: "Q.44",
      question:
        "Which of the following conditions is/are NECESSARY for a deadlock to occur in a computer system? (MSQ)",
      options: [
        "Mutual Exclusion",
        "Hold and Wait",
        "Preemption allowed by kernel",
        "Circular Wait",
      ],
      correctOptions: [0, 1, 3],
      answer: "A, B, D",
      explanation:
        "Coffman conditions for deadlock: 1) Mutual Exclusion, 2) Hold and Wait, 3) NO Preemption (non-preemption), 4) Circular Wait. Option C says preemption allowed, which actually prevents deadlocks.",
      difficulty: "easy",
      status: "not_attempted",
    },

    // --- Algorithms: Sorting & Divide-and-Conquer ---
    {
      id: "pyq-algo-1",
      subjectId: "sub-algo",
      chapterId: "chap-algo-sort",
      year: 2024,
      questionType: "mcq",
      questionNumber: "Q.15",
      question:
        "What is the worst-case number of comparisons in QuickSort of an array of n elements when the pivot is always selected as the median of the first, middle, and last elements?",
      options: ["O(n log n)", "O(n^2)", "O(n)", "O(log n)"],
      correctOption: 1,
      answer: "O(n^2)",
      explanation:
        "Median-of-three heuristic drastically reduces the chance of worst-case on sorted data, but adversarial inputs can still cause O(n^2) worst-case comparisons.",
      difficulty: "hard",
      status: "correct",
    },
    {
      id: "pyq-algo-nat-1",
      subjectId: "sub-algo",
      chapterId: "chap-algo-sort",
      year: 2023,
      questionType: "nat",
      isNat: true,
      questionNumber: "Q.27",
      question:
        "Consider the recurrence T(n) = 4T(n/2) + n^2 for n >= 2, with T(1) = 1. What is the value of T(16)?",
      answer: "1280",
      numericalAnswer: 1280,
      natAnswerRange: { min: 1280, max: 1280 },
      explanation:
        "T(1)=1. T(2)=4(1)+4=8. T(4)=4(8)+16=48. T(8)=4(48)+64=256. T(16)=4(256)+256=1024+256=1280. By Master theorem, T(n) = Theta(n^2 log n).",
      difficulty: "medium",
      status: "not_attempted",
    },
    {
      id: "pyq-algo-graph-msq-1",
      subjectId: "sub-algo",
      chapterId: "chap-algo-graph",
      year: 2023,
      questionType: "msq",
      questionNumber: "Q.38",
      question:
        "Let G = (V, E) be a connected undirected graph with distinct edge weights. Which of the following is/are ALWAYS TRUE? (MSQ)",
      options: [
        "The Minimum Spanning Tree (MST) of G is unique",
        "The shortest path between any two vertices is always part of the MST",
        "The edge with the minimum weight in G is always present in the MST",
        "If an edge e has the maximum weight in some cycle, e is not in the MST",
      ],
      correctOptions: [0, 2, 3],
      answer: "A, C, D",
      explanation:
        "With distinct edge weights, MST is unique (A). The minimum weight edge in the graph is always in MST by cut property (C). Cycle property states the heaviest edge in any cycle cannot be in MST (D). Shortest path between two vertices is not necessarily in MST (B is false).",
      difficulty: "medium",
      status: "not_attempted",
    },

    // --- Computer Networks: TCP & IP ---
    {
      id: "pyq-cn-tcp-mcq-1",
      subjectId: "sub-cn",
      chapterId: "chap-cn-tcp",
      year: 2024,
      questionType: "mcq",
      questionNumber: "Q.19",
      question:
        "In TCP Reno, when a packet loss is detected via 3 duplicate ACKs (Triple Duplicate ACK), what happens to the Congestion Window (cwnd) and Threshold (ssthresh)?",
      options: [
        "cwnd set to 1 MSS, ssthresh set to cwnd/2",
        "ssthresh set to cwnd/2, cwnd set to ssthresh + 3 MSS (Fast Recovery)",
        "cwnd set to maximum segment size, ssthresh unchanged",
        "ssthresh set to 1 MSS, cwnd remains unchanged",
      ],
      correctOption: 1,
      answer:
        "ssthresh set to cwnd/2, cwnd set to ssthresh + 3 MSS (Fast Recovery)",
      explanation:
        "3 duplicate ACKs indicate mild congestion. Fast retransmit and fast recovery set ssthresh = cwnd/2, and cwnd = ssthresh + 3 (growing linearly via AIMD). Timeout sets cwnd to 1 MSS.",
      difficulty: "medium",
      status: "correct",
    },
    {
      id: "pyq-cn-ip-nat-1",
      subjectId: "sub-cn",
      chapterId: "chap-cn-ip",
      year: 2023,
      questionType: "nat",
      isNat: true,
      questionNumber: "Q.48",
      question:
        "An organization is granted the block 130.56.0.0/16. The administrator creates 64 equal-sized subnets. How many usable host IP addresses are available in each subnet?",
      answer: "1022",
      numericalAnswer: 1022,
      natAnswerRange: { min: 1022, max: 1022 },
      explanation:
        "Original prefix = /16. 64 subnets = 2^6, so 6 bits borrowed for subnetting -> new mask is /22 (16 + 6 = 22). Host bits remaining = 32 - 22 = 10 bits. Total addresses per subnet = 2^10 = 1024. Usable host addresses = 1024 - 2 = 1022 (excluding network and broadcast addresses).",
      difficulty: "easy",
      status: "not_attempted",
    },
    {
      id: "pyq-cn-tcp-msq-1",
      subjectId: "sub-cn",
      chapterId: "chap-cn-tcp",
      year: 2024,
      questionType: "msq",
      questionNumber: "Q.40",
      question:
        "Which of the following statements regarding Transport Layer protocols is/are TRUE? (MSQ)",
      options: [
        "TCP provides full-duplex byte stream service",
        "UDP headers contain a checksum field which is mandatory in IPv6",
        "TCP uses a 3-way handshake to negotiate sequence numbers",
        "UDP provides congestion control to prevent network collapse",
      ],
      correctOptions: [0, 1, 2],
      answer: "A, B, C",
      explanation:
        "TCP is full-duplex (A), UDP checksum is mandatory in IPv6 (B), TCP connection establishment uses SYN, SYN-ACK, ACK 3-way handshake (C). UDP does not provide congestion control (D is false).",
      difficulty: "medium",
      status: "not_attempted",
    },
  ];

  const pyqQueue: PyqQueueItem[] = [
    {
      id: "pyq-q-dbms-tx",
      subjectId: "sub-dbms",
      chapterId: "chap-dbms-tx",
      priority: 10,
      status: "in_progress",
      progress: 60,
      targetQuestions: 15,
      solvedQuestions: 9,
      notes:
        "Focus on 2PL and conflict serializability questions from GATE 2020-2024.",
      createdAt: "2026-09-02",
    },
    {
      id: "pyq-q-os-sync",
      subjectId: "sub-os",
      chapterId: "chap-os-sync",
      priority: 8,
      status: "in_progress",
      progress: 40,
      targetQuestions: 20,
      solvedQuestions: 8,
      notes:
        "Solve producer-consumer and reader-writer semaphore code trace problems.",
      createdAt: "2026-09-02",
    },
  ];

  const calendarEvents: CalendarEvent[] = [
    {
      id: "cal-rev-dbms-norm",
      title: "Revise Normalization (BCNF, 3NF)",
      date: "2026-09-09",
      type: "revision",
      subjectId: "sub-dbms",
      chapterId: "chap-dbms-norm",
      revisionId: "rev-dbms-norm-1",
    },
    {
      id: "cal-rev-os-proc",
      title: "Revise CPU Scheduling Gantt Charts",
      date: "2026-09-09",
      type: "revision",
      subjectId: "sub-os",
      chapterId: "chap-os-proc",
      revisionId: "rev-os-proc-2",
    },
  ];

  const exams: Exam[] = [
    {
      id: "exam-flt-1",
      title: "Full Length Mock 01 (Made Easy FLT-1)",
      examType: "full_length",
      date: "2026-09-05",
      durationMinutes: 180,
      totalMarks: 100,
      obtainedMarks: 68.33,
      percentage: 68.33,
      accuracy: 82.5,
      status: "completed",
      timeTakenMinutes: 172,
      totalQuestions: 65,
      attemptedQuestions: 56,
      correctQuestions: 48,
      wrongQuestions: 8,
      negativeMarks: 5.33,
      weakTopics: [
        "Virtual Memory TLB calculations",
        "TCP Congestion window edge cases",
      ],
      strongTopics: ["Normalization", "CPU Scheduling", "Graph Shortest Paths"],
      notes:
        "Good pacing, need to be more careful with 2-mark MSQ calculations.",
      createdAt: "2026-09-05",
    },
    {
      id: "exam-sub-dbms",
      title: "DBMS Comprehensive Subject Test",
      examType: "subject_test",
      subjectId: "sub-dbms",
      date: "2026-09-07",
      durationMinutes: 60,
      totalMarks: 50,
      obtainedMarks: 42.0,
      percentage: 84.0,
      accuracy: 91.3,
      status: "completed",
      timeTakenMinutes: 52,
      totalQuestions: 33,
      attemptedQuestions: 29,
      correctQuestions: 27,
      wrongQuestions: 2,
      negativeMarks: 1.33,
      weakTopics: ["B+ Tree split pointer calculations"],
      strongTopics: ["Transactions & 2PL", "Relational Algebra"],
      notes: "Excellent score. Strong command over transactions.",
      createdAt: "2026-09-07",
    },
  ];

  return {
    subjects,
    chapters,
    revisions,
    pyqs,
    pyqQueue,
    calendarEvents,
    exams,
    revisionSettings: DEFAULT_REVISION_SETTINGS,
  };
}

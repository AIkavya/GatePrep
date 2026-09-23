import mongoose, { Schema } from "mongoose";

export interface UserRecord {
  id: string;
  username: string;
  password_hash: string;
  created_at: string;
}

export interface StudyDataRecord {
  subjects: any[];
  chapters: any[];
  revisions: any[];
  pyqs: any[];
  pyqQueue: any[];
  calendarEvents: any[];
  exams: any[];
  revisionSettings: any;
}

// 1. User Schema
const UserSchema = new Schema(
  {
    userId: { type: String, required: true, unique: true, index: true },
    username: { type: String, required: true, unique: true, index: true },
    password_hash: { type: String, required: true },
    created_at: { type: String, required: true },
  },
  { timestamps: true }
);

export const UserModel: any =
  mongoose.models.User || mongoose.model("User", UserSchema);

// 2. Subject Schema
const SubjectSchema = new Schema(
  {
    userId: { type: String, required: true, index: true },
    id: { type: String, required: true },
    name: { type: String, required: true },
    code: { type: String, default: "" },
    description: { type: String, default: "" },
    color: { type: String, default: "#3b82f6" },
    totalRevisionsCount: { type: Number, default: 0 },
    entirePyqSolvedCount: { type: Number, default: 0 },
    subjectTestsCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);
SubjectSchema.index({ userId: 1, id: 1 }, { unique: true });

export const SubjectModel: any =
  mongoose.models.Subject || mongoose.model("Subject", SubjectSchema);

// 3. Chapter Schema
const ChapterSchema = new Schema(
  {
    userId: { type: String, required: true, index: true },
    id: { type: String, required: true },
    subjectId: { type: String, required: true, index: true },
    name: { type: String, required: true },
    priority: { type: Number, default: 10 },
    progress: { type: Number, default: 0 },
    status: { type: String, default: "not_started" },
    notes: { type: String, default: "" },
    createdAt: { type: String },
    completedAt: { type: String },
    revisionCount: { type: Number, default: 0 },
    pyqsSolvedCount: { type: Number, default: 0 },
    pyqFullCyclesCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);
ChapterSchema.index({ userId: 1, id: 1 }, { unique: true });
ChapterSchema.index({ userId: 1, subjectId: 1 });

export const ChapterModel: any =
  mongoose.models.Chapter || mongoose.model("Chapter", ChapterSchema);

// 4. Revision Schema
const RevisionSchema = new Schema(
  {
    userId: { type: String, required: true, index: true },
    id: { type: String, required: true },
    subjectId: { type: String, required: true, index: true },
    chapterId: { type: String, required: true, index: true },
    revisionNumber: { type: Number, default: 1 },
    dueDate: { type: String, required: true },
    status: { type: String, default: "upcoming" },
    priority: { type: Number, default: 10 },
    progress: { type: Number, default: 0 },
    notes: { type: String, default: "" },
    completedAt: { type: String },
    completedDate: { type: String },
  },
  { timestamps: true }
);
RevisionSchema.index({ userId: 1, id: 1 }, { unique: true });
RevisionSchema.index({ userId: 1, subjectId: 1, chapterId: 1 });

export const RevisionModel: any =
  mongoose.models.Revision || mongoose.model("Revision", RevisionSchema);

// 5. PYQ Schema (Optimized for 10,000+ Questions)
const PyqSchema = new Schema(
  {
    userId: { type: String, required: true, index: true },
    id: { type: String, required: true },
    subjectId: { type: String, required: true, index: true },
    chapterId: { type: String, required: true, index: true },
    year: { type: Number, required: true, index: true },
    marks: { type: Number, default: 1 },
    questionNumber: { type: Schema.Types.Mixed },
    question: { type: String },
    questionText: { type: String },
    imageUrl: { type: String, default: "" },
    answer: { type: String },
    explanation: { type: String },
    options: { type: [String], default: [] },
    correctOption: { type: Schema.Types.Mixed },
    correctOptions: { type: [Number], default: [] },
    numericalAnswer: { type: Schema.Types.Mixed },
    isNumerical: { type: Boolean, default: false },
    isNat: { type: Boolean, default: false },
    natAnswerRange: { type: Schema.Types.Mixed },
    questionType: { type: String, default: "mcq" },
    difficulty: { type: String, default: "medium" },
    status: { type: String, default: "not_attempted" },
    notes: { type: String, default: "" },
    userNotes: { type: String, default: "" },
    solvedAt: { type: String },
  },
  { timestamps: true }
);
PyqSchema.index({ userId: 1, id: 1 }, { unique: true });
PyqSchema.index({ userId: 1, subjectId: 1, chapterId: 1 });
PyqSchema.index({ userId: 1, year: 1, subjectId: 1 });

export const PyqModel: any =
  mongoose.models.Pyq || mongoose.model("Pyq", PyqSchema);

// 6. PyqQueue Schema
const PyqQueueSchema = new Schema(
  {
    userId: { type: String, required: true, index: true },
    id: { type: String, required: true },
    subjectId: { type: String, required: true, index: true },
    chapterId: { type: String, required: true, index: true },
    priority: { type: Number, default: 10 },
    targetQuestions: { type: Number, default: 10 },
    solvedQuestions: { type: Number, default: 0 },
    progress: { type: Number, default: 0 },
    status: { type: String, default: "not_started" },
    notes: { type: String, default: "" },
    createdAt: { type: String },
    completedAt: { type: String },
  },
  { timestamps: true }
);
PyqQueueSchema.index({ userId: 1, id: 1 }, { unique: true });
PyqQueueSchema.index({ userId: 1, subjectId: 1 });

export const PyqQueueModel: any =
  mongoose.models.PyqQueue || mongoose.model("PyqQueue", PyqQueueSchema);

// 7. CalendarEvent Schema
const CalendarEventSchema = new Schema(
  {
    userId: { type: String, required: true, index: true },
    id: { type: String, required: true },
    subjectId: { type: String },
    chapterId: { type: String },
    revisionId: { type: String },
    title: { type: String, required: true },
    date: { type: String, required: true, index: true },
    time: { type: String },
    type: { type: String, default: "other" },
    status: { type: String, default: "pending" },
    notes: { type: String, default: "" },
  },
  { timestamps: true }
);
CalendarEventSchema.index({ userId: 1, id: 1 }, { unique: true });
CalendarEventSchema.index({ userId: 1, date: 1 });

export const CalendarEventModel: any =
  mongoose.models.CalendarEvent ||
  mongoose.model("CalendarEvent", CalendarEventSchema);

// 8. Exam Schema
const ExamSchema = new Schema(
  {
    userId: { type: String, required: true, index: true },
    id: { type: String, required: true },
    title: { type: String, required: true },
    examType: { type: String, default: "full_length" },
    subjectId: { type: String },
    chapterId: { type: String },
    subjectIds: { type: [String], default: [] },
    chapterIds: { type: [String], default: [] },
    questionTypes: { type: [String], default: [] },
    syllabusScope: { type: String },
    completionStatus: { type: String },
    date: { type: String, required: true },
    durationMinutes: { type: Number, default: 180 },
    totalMarks: { type: Number, default: 100 },
    obtainedMarks: { type: Number },
    percentage: { type: Number },
    accuracy: { type: Number },
    status: { type: String, default: "completed" },
    timeTakenMinutes: { type: Number },
    totalQuestions: { type: Number },
    attemptedQuestions: { type: Number },
    correctQuestions: { type: Number },
    wrongQuestions: { type: Number },
    positiveMarks: { type: Number },
    negativeMarks: { type: Number },
    weakTopics: { type: [String], default: [] },
    strongTopics: { type: [String], default: [] },
    notes: { type: String, default: "" },
    reportData: { type: Schema.Types.Mixed },
    createdAt: { type: String },
  },
  { timestamps: true }
);
ExamSchema.index({ userId: 1, id: 1 }, { unique: true });

export const ExamModel: any =
  mongoose.models.Exam || mongoose.model("Exam", ExamSchema);

// 9. UserSettings Schema
const UserSettingsSchema = new Schema(
  {
    userId: { type: String, required: true, unique: true, index: true },
    revisionSettings: {
      type: Schema.Types.Mixed,
      default: { rev1Days: 7, rev2Days: 14, rev3Days: 28 },
    },
  },
  { timestamps: true }
);

export const UserSettingsModel: any =
  mongoose.models.UserSettings ||
  mongoose.model("UserSettings", UserSettingsSchema);

// MongoDB connection handling
let isConnected = false;

export async function connectDb(): Promise<boolean> {
  if (isConnected && mongoose.connection.readyState === 1) {
    return true;
  }

  const mongoUri =
    process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/gate_prep";

  try {
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
    });
    isConnected = true;
    console.log(`Connected successfully to MongoDB at ${mongoUri}`);
    return true;
  } catch (err) {
    console.warn(
      `MongoDB connection attempt to ${mongoUri} failed. Make sure MongoDB is running locally or set MONGODB_URI:`,
      err
    );
    return false;
  }
}

export function generateUserId(username: string): string {
  const clean = username
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, "_")
    .slice(0, 16);
  const entropy = Math.random().toString(36).substring(2, 10);
  return `usr_${clean}_${entropy}`;
}

// User helper methods
export async function findUserByUsername(
  username: string
): Promise<UserRecord | null> {
  const cleanUsername = username.trim().toLowerCase();
  await connectDb();

  try {
    const filter: any = { username: new RegExp(`^${cleanUsername}$`, "i") };
    const userDoc: any = await UserModel.findOne(filter).lean();

    if (!userDoc) return null;

    return {
      id: userDoc.userId,
      username: userDoc.username,
      password_hash: userDoc.password_hash,
      created_at: userDoc.created_at,
    };
  } catch (err) {
    console.error("Error finding user by username:", err);
    return null;
  }
}

export async function findUserById(id: string): Promise<UserRecord | null> {
  await connectDb();

  try {
    const filter: any = { userId: id };
    const userDoc: any = await UserModel.findOne(filter).lean();
    if (!userDoc) return null;

    return {
      id: userDoc.userId,
      username: userDoc.username,
      password_hash: userDoc.password_hash,
      created_at: userDoc.created_at,
    };
  } catch (err) {
    console.error("Error finding user by ID:", err);
    return null;
  }
}

export async function insertUser(
  id: string,
  username: string,
  passwordHash: string
): Promise<UserRecord> {
  await connectDb();

  const now = new Date().toISOString();
  const cleanUsername = username.trim().toLowerCase();

  try {
    const filter: any = { userId: id };
    const userDoc: any = await UserModel.findOneAndUpdate(
      filter,
      {
        userId: id,
        username: cleanUsername,
        password_hash: passwordHash,
        created_at: now,
      },
      { upsert: true, new: true }
    ).lean();

    // Ensure default settings exist for user
    await UserSettingsModel.updateOne(
      filter,
      {
        $setOnInsert: {
          userId: id,
          revisionSettings: { rev1Days: 7, rev2Days: 14, rev3Days: 28 },
        },
      },
      { upsert: true }
    );

    return {
      id: userDoc.userId,
      username: userDoc.username,
      password_hash: userDoc.password_hash,
      created_at: userDoc.created_at,
    };
  } catch (err) {
    console.error("Error inserting user:", err);
    throw err;
  }
}

export async function deleteUser(id: string): Promise<boolean> {
  await connectDb();
  try {
    const filter: any = { userId: id };
    await Promise.all([
      UserModel.deleteOne(filter),
      SubjectModel.deleteMany(filter),
      ChapterModel.deleteMany(filter),
      RevisionModel.deleteMany(filter),
      PyqModel.deleteMany(filter),
      PyqQueueModel.deleteMany(filter),
      CalendarEventModel.deleteMany(filter),
      ExamModel.deleteMany(filter),
      UserSettingsModel.deleteOne(filter),
    ]);
    return true;
  } catch (err) {
    console.error("Error deleting user:", err);
    return false;
  }
}

export async function getUserStudyData(
  userId: string
): Promise<StudyDataRecord> {
  await connectDb();
  const filter: any = { userId };

  try {
    const [
      subjects,
      chapters,
      revisions,
      pyqs,
      pyqQueue,
      calendarEvents,
      exams,
      settingsDoc,
    ] = await Promise.all([
      SubjectModel.find(filter).lean(),
      ChapterModel.find(filter).lean(),
      RevisionModel.find(filter).lean(),
      PyqModel.find(filter).lean(),
      PyqQueueModel.find(filter).lean(),
      CalendarEventModel.find(filter).lean(),
      ExamModel.find(filter).lean(),
      UserSettingsModel.findOne(filter).lean(),
    ]);

    // Map away Mongo _id / __v metadata
    const cleanList = (arr: any[]) =>
      arr.map(({ _id, __v, ...rest }) => rest);

    return {
      subjects: cleanList(subjects || []),
      chapters: cleanList(chapters || []),
      revisions: cleanList(revisions || []),
      pyqs: cleanList(pyqs || []),
      pyqQueue: cleanList(pyqQueue || []),
      calendarEvents: cleanList(calendarEvents || []),
      exams: cleanList(exams || []),
      revisionSettings: settingsDoc?.revisionSettings || {
        rev1Days: 7,
        rev2Days: 14,
        rev3Days: 28,
      },
    };
  } catch (err) {
    console.error("Error fetching study data from normalized collections:", err);
    return {
      subjects: [],
      chapters: [],
      revisions: [],
      pyqs: [],
      pyqQueue: [],
      calendarEvents: [],
      exams: [],
      revisionSettings: { rev1Days: 7, rev2Days: 14, rev3Days: 28 },
    };
  }
}

// Bulk sync helper for normalized MongoDB collections
async function syncCollection(
  Model: any,
  userId: string,
  items: any[] = [],
  isPartialChunk = false,
  allKeepIds?: string[]
): Promise<void> {
  const filter: any = { userId };
  if (!items || items.length === 0) {
    if (!isPartialChunk && !allKeepIds) {
      await Model.deleteMany(filter);
    }
    return;
  }

  const bulkOps = items.map((item) => {
    const cleanItem = { ...item, userId };
    delete cleanItem._id;
    delete cleanItem.__v;
    return {
      updateOne: {
        filter: { userId, id: item.id },
        update: { $set: cleanItem },
        upsert: true,
      },
    };
  });

  // Remove items deleted on frontend if this is a full sync or explicit allKeepIds was provided
  const keepIds = allKeepIds || items.map((i) => i.id);
  if (!isPartialChunk || allKeepIds) {
    await Model.deleteMany({ userId, id: { $nin: keepIds } });
  }
  if (bulkOps.length > 0) {
    await Model.bulkWrite(bulkOps);
  }
}

export async function saveUserStudyData(
  userId: string,
  data: Partial<StudyDataRecord> & { isPartial?: boolean; allPyqIds?: string[] },
  isPartialChunkOverride = false
): Promise<void> {
  await connectDb();
  const safeData = data && typeof data === "object" ? data : {};
  const isPartial = isPartialChunkOverride || Boolean(safeData.isPartial);

  try {
    const tasks: Promise<any>[] = [];

    if (Array.isArray(safeData.subjects)) {
      tasks.push(syncCollection(SubjectModel, userId, safeData.subjects, isPartial));
    }
    if (Array.isArray(safeData.chapters)) {
      tasks.push(syncCollection(ChapterModel, userId, safeData.chapters, isPartial));
    }
    if (Array.isArray(safeData.revisions)) {
      tasks.push(syncCollection(RevisionModel, userId, safeData.revisions, isPartial));
    }
    if (Array.isArray(safeData.pyqs)) {
      tasks.push(syncCollection(PyqModel, userId, safeData.pyqs, isPartial, safeData.allPyqIds));
    }
    if (Array.isArray(safeData.pyqQueue)) {
      tasks.push(syncCollection(PyqQueueModel, userId, safeData.pyqQueue, isPartial));
    }
    if (Array.isArray(safeData.calendarEvents)) {
      tasks.push(syncCollection(CalendarEventModel, userId, safeData.calendarEvents, isPartial));
    }
    if (Array.isArray(safeData.exams)) {
      tasks.push(syncCollection(ExamModel, userId, safeData.exams, isPartial));
    }
    if (safeData.revisionSettings && typeof safeData.revisionSettings === "object") {
      tasks.push(
        UserSettingsModel.updateOne(
          { userId },
          { $set: { userId, revisionSettings: safeData.revisionSettings } },
          { upsert: true }
        )
      );
    }

    await Promise.all(tasks);
  } catch (err) {
    console.error("Error saving user study data to normalized MongoDB collections:", err);
    throw err;
  }
}

export async function resetUserStudyData(userId: string): Promise<void> {
  await connectDb();
  const filter: any = { userId };
  const defaultSettings = { rev1Days: 7, rev2Days: 14, rev3Days: 28 };

  try {
    await Promise.all([
      SubjectModel.deleteMany(filter),
      ChapterModel.deleteMany(filter),
      RevisionModel.deleteMany(filter),
      PyqModel.deleteMany(filter),
      PyqQueueModel.deleteMany(filter),
      CalendarEventModel.deleteMany(filter),
      ExamModel.deleteMany(filter),
      UserSettingsModel.updateOne(
        filter,
        { $set: { userId, revisionSettings: defaultSettings } },
        { upsert: true }
      ),
    ]);
  } catch (err) {
    console.error("Error resetting user study data in MongoDB:", err);
    throw err;
  }
}

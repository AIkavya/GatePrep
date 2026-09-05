import initSqlJs from 'sql.js';
import type { Database } from 'sql.js';
import fs from 'fs';
import path from 'path';

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

let dbInstance: Database | null = null;
let dbPath: string = '';
let isFallbackMode = false;

// In-memory fallback structures in case sql.js WASM cannot load in serverless
const memoryUsers = new Map<string, UserRecord>();
const memoryStudyData = new Map<string, StudyDataRecord>();
let fallbackJsonPath = '';

function getWritableDataDir(): string {
  const isVercel = process.env.VERCEL === '1';
  if (isVercel) {
    return '/tmp';
  }

  // Attempt local ./data directory first
  const preferredDir = path.join(process.cwd(), 'data');
  try {
    if (!fs.existsSync(preferredDir)) {
      fs.mkdirSync(preferredDir, { recursive: true });
    }
    // Verify write permissions
    const testFile = path.join(preferredDir, '.perm_test_' + Date.now());
    fs.writeFileSync(testFile, '1');
    fs.unlinkSync(testFile);
    return preferredDir;
  } catch (e) {
    console.warn('Cannot write to data directory, falling back to /tmp:', e);
  }

  // Fallback to /tmp which is writable on all Linux, Docker, and Cloud Run environments
  const tmpDir = path.join('/tmp', 'gate_prep_data');
  try {
    if (!fs.existsSync(tmpDir)) {
      fs.mkdirSync(tmpDir, { recursive: true });
    }
    return tmpDir;
  } catch (e2) {
    console.warn('Failed creating /tmp/gate_prep_data, using /tmp directly:', e2);
    return '/tmp';
  }
}

function loadFallbackData(): void {
  const dataDir = getWritableDataDir();
  fallbackJsonPath = path.join(dataDir, 'gate_prep_store.json');
  if (fs.existsSync(fallbackJsonPath)) {
    try {
      const raw = fs.readFileSync(fallbackJsonPath, 'utf8');
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed.users)) {
        parsed.users.forEach((u: UserRecord) => memoryUsers.set(u.id, u));
      }
      if (parsed.studyData && typeof parsed.studyData === 'object') {
        Object.entries(parsed.studyData).forEach(([k, v]) => memoryStudyData.set(k, v as StudyDataRecord));
      }
    } catch (e) {
      console.warn('Could not read fallback JSON store, starting fresh in-memory:', e);
    }
  }
}

function persistFallbackData(): void {
  if (!fallbackJsonPath) {
    fallbackJsonPath = path.join(getWritableDataDir(), 'gate_prep_store.json');
  }
  try {
    const payload = {
      users: Array.from(memoryUsers.values()),
      studyData: Object.fromEntries(memoryStudyData.entries()),
      updatedAt: new Date().toISOString(),
    };
    fs.writeFileSync(fallbackJsonPath, JSON.stringify(payload, null, 2));
  } catch (e) {
    console.warn('Could not persist fallback JSON to disk:', e);
  }
}

function getCurrentDir(): string {
  if (typeof __dirname !== 'undefined') {
    return __dirname;
  }
  try {
    return path.dirname(new URL(import.meta.url).pathname);
  } catch {
    return process.cwd();
  }
}

export async function getDb(): Promise<Database | null> {
  if (isFallbackMode) return null;
  if (dbInstance) return dbInstance;

  try {
    const currentDir = getCurrentDir();
    // Attempt locating sql-wasm.wasm across common bundle and filesystem paths
    const SQL = await initSqlJs({
      locateFile: (file: string) => {
        const candidates = [
          path.join(process.cwd(), 'node_modules', 'sql.js', 'dist', file),
          path.join(currentDir, file),
          path.join(currentDir, '..', 'node_modules', 'sql.js', 'dist', file),
          path.join('/var/task', 'node_modules', 'sql.js', 'dist', file),
          path.join('/var/task', file),
        ];
        for (const candidate of candidates) {
          if (fs.existsSync(candidate)) {
            return candidate;
          }
        }
        return file;
      },
    });

    const dataDir = getWritableDataDir();
    dbPath = path.join(dataDir, 'gate_prep.sqlite');

    if (fs.existsSync(dbPath)) {
      try {
        const fileBuffer = fs.readFileSync(dbPath);
        dbInstance = new SQL.Database(fileBuffer);
      } catch (err) {
        console.error('Failed to read existing SQLite DB file, creating fresh database:', err);
        dbInstance = new SQL.Database();
      }
    } else {
      dbInstance = new SQL.Database();
    }

    // Initialize SQLite schema
    dbInstance.run(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        username TEXT UNIQUE COLLATE NOCASE,
        password_hash TEXT NOT NULL,
        created_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS study_data (
        user_id TEXT PRIMARY KEY,
        subjects_json TEXT DEFAULT '[]',
        chapters_json TEXT DEFAULT '[]',
        revisions_json TEXT DEFAULT '[]',
        pyqs_json TEXT DEFAULT '[]',
        pyq_queue_json TEXT DEFAULT '[]',
        calendar_json TEXT DEFAULT '[]',
        exams_json TEXT DEFAULT '[]',
        settings_json TEXT DEFAULT '{}',
        updated_at TEXT NOT NULL,
        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
      );

      CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
    `);

    persistDb();
    return dbInstance;
  } catch (fatalDbError) {
    console.warn('SQLite wasm initialization failed, smoothly switching to resilient JSON storage engine:', fatalDbError);
    isFallbackMode = true;
    loadFallbackData();
    return null;
  }
}

export function persistDb(): void {
  if (isFallbackMode) {
    persistFallbackData();
    return;
  }
  if (!dbInstance || !dbPath) return;
  try {
    const data = dbInstance.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(dbPath, buffer);
  } catch (e) {
    console.error('Error persisting SQLite database to disk at ' + dbPath + ':', e);
    // If local write failed, attempt saving to /tmp fallback
    if (!dbPath.startsWith('/tmp')) {
      try {
        const fallbackPath = path.join('/tmp', 'gate_prep.sqlite');
        const data = dbInstance.export();
        fs.writeFileSync(fallbackPath, Buffer.from(data));
        dbPath = fallbackPath;
        console.log('Successfully persisted database to /tmp fallback:', fallbackPath);
      } catch (err2) {
        console.error('Fallback persistence to /tmp also failed:', err2);
      }
    }
  }
}

// User helper methods
export async function findUserByUsername(username: string): Promise<UserRecord | null> {
  const cleanUsername = username.trim().toLowerCase();
  const db = await getDb();
  if (!db) {
    for (const u of memoryUsers.values()) {
      if (u.username.toLowerCase() === cleanUsername) {
        return u;
      }
    }
    return null;
  }

  try {
    const stmt = db.prepare('SELECT id, username, password_hash, created_at FROM users WHERE LOWER(username) = LOWER(?) LIMIT 1');
    stmt.bind([username]);
    if (stmt.step()) {
      const row = stmt.getAsObject() as any;
      stmt.free();
      return {
        id: row.id,
        username: row.username,
        password_hash: row.password_hash,
        created_at: row.created_at,
      };
    }
    stmt.free();
    return null;
  } catch (err) {
    console.warn('SQLite query failed, falling back to memory store:', err);
    for (const u of memoryUsers.values()) {
      if (u.username.toLowerCase() === cleanUsername) return u;
    }
    return null;
  }
}

export async function findUserById(id: string): Promise<UserRecord | null> {
  const db = await getDb();
  if (!db) {
    return memoryUsers.get(id) || null;
  }

  try {
    const stmt = db.prepare('SELECT id, username, password_hash, created_at FROM users WHERE id = ? LIMIT 1');
    stmt.bind([id]);
    if (stmt.step()) {
      const row = stmt.getAsObject() as any;
      stmt.free();
      return {
        id: row.id,
        username: row.username,
        password_hash: row.password_hash,
        created_at: row.created_at,
      };
    }
    stmt.free();
    return null;
  } catch (err) {
    console.warn('SQLite query failed, falling back to memory store:', err);
    return memoryUsers.get(id) || null;
  }
}

export async function insertUser(id: string, username: string, passwordHash: string): Promise<UserRecord> {
  const now = new Date().toISOString();
  const newUser: UserRecord = {
    id,
    username,
    password_hash: passwordHash,
    created_at: now,
  };

  const db = await getDb();
  if (!db) {
    memoryUsers.set(id, newUser);
    memoryStudyData.set(id, {
      subjects: [],
      chapters: [],
      revisions: [],
      pyqs: [],
      pyqQueue: [],
      calendarEvents: [],
      exams: [],
      revisionSettings: { rev1Days: 7, rev2Days: 14, rev3Days: 28 },
    });
    persistFallbackData();
    return newUser;
  }

  try {
    db.run(
      'INSERT INTO users (id, username, password_hash, created_at) VALUES (?, ?, ?, ?)',
      [id, username, passwordHash, now]
    );

    // Initialize fresh, completely empty study data for the new user
    const defaultSettings = JSON.stringify({ rev1Days: 7, rev2Days: 14, rev3Days: 28 });
    db.run(
      `INSERT INTO study_data (
        user_id, subjects_json, chapters_json, revisions_json, pyqs_json, 
        pyq_queue_json, calendar_json, exams_json, settings_json, updated_at
      ) VALUES (?, '[]', '[]', '[]', '[]', '[]', '[]', '[]', ?, ?)`,
      [id, defaultSettings, now]
    );

    persistDb();
  } catch (err) {
    console.warn('SQLite insert failed, persisting to memory fallback:', err);
    memoryUsers.set(id, newUser);
    persistFallbackData();
  }

  return newUser;
}

export async function getUserStudyData(userId: string): Promise<StudyDataRecord> {
  const db = await getDb();
  if (!db) {
    return (
      memoryStudyData.get(userId) || {
        subjects: [],
        chapters: [],
        revisions: [],
        pyqs: [],
        pyqQueue: [],
        calendarEvents: [],
        exams: [],
        revisionSettings: { rev1Days: 7, rev2Days: 14, rev3Days: 28 },
      }
    );
  }

  try {
    const stmt = db.prepare(`
      SELECT subjects_json, chapters_json, revisions_json, pyqs_json,
             pyq_queue_json, calendar_json, exams_json, settings_json
      FROM study_data WHERE user_id = ? LIMIT 1
    `);
    stmt.bind([userId]);

    if (stmt.step()) {
      const row = stmt.getAsObject() as any;
      stmt.free();
      try {
        return {
          subjects: JSON.parse(row.subjects_json || '[]'),
          chapters: JSON.parse(row.chapters_json || '[]'),
          revisions: JSON.parse(row.revisions_json || '[]'),
          pyqs: JSON.parse(row.pyqs_json || '[]'),
          pyqQueue: JSON.parse(row.pyq_queue_json || '[]'),
          calendarEvents: JSON.parse(row.calendar_json || '[]'),
          exams: JSON.parse(row.exams_json || '[]'),
          revisionSettings: JSON.parse(row.settings_json || '{"rev1Days":7,"rev2Days":14,"rev3Days":28}'),
        };
      } catch (e) {
        console.error('Error parsing study data JSON:', e);
      }
    } else {
      stmt.free();
    }
  } catch (err) {
    console.warn('SQLite select study data failed, checking fallback:', err);
    if (memoryStudyData.has(userId)) {
      return memoryStudyData.get(userId)!;
    }
  }

  // Fresh empty state if record doesn't exist
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

export async function saveUserStudyData(userId: string, data: Partial<StudyDataRecord>): Promise<void> {
  const db = await getDb();
  const now = new Date().toISOString();

  // Always keep fallback in sync
  const existing = memoryStudyData.get(userId) || {
    subjects: [],
    chapters: [],
    revisions: [],
    pyqs: [],
    pyqQueue: [],
    calendarEvents: [],
    exams: [],
    revisionSettings: { rev1Days: 7, rev2Days: 14, rev3Days: 28 },
  };
  const updatedFallback: StudyDataRecord = {
    subjects: data.subjects !== undefined ? data.subjects : existing.subjects,
    chapters: data.chapters !== undefined ? data.chapters : existing.chapters,
    revisions: data.revisions !== undefined ? data.revisions : existing.revisions,
    pyqs: data.pyqs !== undefined ? data.pyqs : existing.pyqs,
    pyqQueue: data.pyqQueue !== undefined ? data.pyqQueue : existing.pyqQueue,
    calendarEvents: data.calendarEvents !== undefined ? data.calendarEvents : existing.calendarEvents,
    exams: data.exams !== undefined ? data.exams : existing.exams,
    revisionSettings: data.revisionSettings !== undefined ? data.revisionSettings : existing.revisionSettings,
  };
  memoryStudyData.set(userId, updatedFallback);

  if (!db) {
    persistFallbackData();
    return;
  }

  try {
    // Check if study_data row exists
    const checkStmt = db.prepare('SELECT user_id FROM study_data WHERE user_id = ?');
    checkStmt.bind([userId]);
    const exists = checkStmt.step();
    checkStmt.free();

    const subjectsJson = data.subjects !== undefined ? JSON.stringify(data.subjects) : '[]';
    const chaptersJson = data.chapters !== undefined ? JSON.stringify(data.chapters) : '[]';
    const revisionsJson = data.revisions !== undefined ? JSON.stringify(data.revisions) : '[]';
    const pyqsJson = data.pyqs !== undefined ? JSON.stringify(data.pyqs) : '[]';
    const pyqQueueJson = data.pyqQueue !== undefined ? JSON.stringify(data.pyqQueue) : '[]';
    const calendarJson = data.calendarEvents !== undefined ? JSON.stringify(data.calendarEvents) : '[]';
    const examsJson = data.exams !== undefined ? JSON.stringify(data.exams) : '[]';
    const settingsJson = data.revisionSettings !== undefined ? JSON.stringify(data.revisionSettings) : '{"rev1Days":7,"rev2Days":14,"rev3Days":28}';

    if (exists) {
      db.run(
        `UPDATE study_data SET
          subjects_json = ?,
          chapters_json = ?,
          revisions_json = ?,
          pyqs_json = ?,
          pyq_queue_json = ?,
          calendar_json = ?,
          exams_json = ?,
          settings_json = ?,
          updated_at = ?
         WHERE user_id = ?`,
        [
          subjectsJson,
          chaptersJson,
          revisionsJson,
          pyqsJson,
          pyqQueueJson,
          calendarJson,
          examsJson,
          settingsJson,
          now,
          userId,
        ]
      );
    } else {
      db.run(
        `INSERT INTO study_data (
          user_id, subjects_json, chapters_json, revisions_json, pyqs_json, 
          pyq_queue_json, calendar_json, exams_json, settings_json, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          userId,
          subjectsJson,
          chaptersJson,
          revisionsJson,
          pyqsJson,
          pyqQueueJson,
          calendarJson,
          examsJson,
          settingsJson,
          now,
        ]
      );
    }

    persistDb();
  } catch (err) {
    console.warn('SQLite save failed, falling back to memory/json store:', err);
    persistFallbackData();
  }
}

export async function resetUserStudyData(userId: string): Promise<void> {
  const now = new Date().toISOString();
  const defaultSettings = { rev1Days: 7, rev2Days: 14, rev3Days: 28 };

  memoryStudyData.set(userId, {
    subjects: [],
    chapters: [],
    revisions: [],
    pyqs: [],
    pyqQueue: [],
    calendarEvents: [],
    exams: [],
    revisionSettings: defaultSettings,
  });

  const db = await getDb();
  if (!db) {
    persistFallbackData();
    return;
  }

  try {
    db.run(
      `UPDATE study_data SET
        subjects_json = '[]',
        chapters_json = '[]',
        revisions_json = '[]',
        pyqs_json = '[]',
        pyq_queue_json = '[]',
        calendar_json = '[]',
        exams_json = '[]',
        settings_json = ?,
        updated_at = ?
       WHERE user_id = ?`,
      [JSON.stringify(defaultSettings), now, userId]
    );

    persistDb();
  } catch (err) {
    console.warn('SQLite reset failed, saved to fallback store:', err);
    persistFallbackData();
  }
}

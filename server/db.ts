import initSqlJs, { Database } from 'sql.js';
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

export async function getDb(): Promise<Database> {
  if (dbInstance) return dbInstance;

  const SQL = await initSqlJs();
  const isVercel = process.env.VERCEL === '1';
  const dataDir = isVercel ? '/tmp' : path.join(process.cwd(), 'data');

  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  dbPath = path.join(dataDir, 'gate_prep.sqlite');

  if (fs.existsSync(dbPath)) {
    try {
      const fileBuffer = fs.readFileSync(dbPath);
      dbInstance = new SQL.Database(fileBuffer);
    } catch (err) {
      console.error('Failed to read existing SQLite DB file, creating new:', err);
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
}

export function persistDb(): void {
  if (!dbInstance || !dbPath) return;
  try {
    const data = dbInstance.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(dbPath, buffer);
  } catch (e) {
    console.error('Error persisting SQLite database to disk:', e);
  }
}

// User helper methods
export async function findUserByUsername(username: string): Promise<UserRecord | null> {
  const db = await getDb();
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
}

export async function findUserById(id: string): Promise<UserRecord | null> {
  const db = await getDb();
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
}

export async function insertUser(id: string, username: string, passwordHash: string): Promise<UserRecord> {
  const db = await getDb();
  const now = new Date().toISOString();
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

  return {
    id,
    username,
    password_hash: passwordHash,
    created_at: now,
  };
}

export async function getUserStudyData(userId: string): Promise<StudyDataRecord> {
  const db = await getDb();
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
}

export async function resetUserStudyData(userId: string): Promise<void> {
  const db = await getDb();
  const now = new Date().toISOString();
  const defaultSettings = JSON.stringify({ rev1Days: 7, rev2Days: 14, rev3Days: 28 });

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
    [defaultSettings, now, userId]
  );

  persistDb();
}

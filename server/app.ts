import express, { Request, Response } from 'express';
import {
  handleRegister,
  handleLogin,
  handleMe,
  authMiddleware,
  AuthRequest,
} from './auth';
import {
  getUserStudyData,
  saveUserStudyData,
  resetUserStudyData,
} from './db';
import { getInitialSeedData } from '../src/data/seedData';

export const app = express();

app.use(express.json({ limit: '50mb' }));

// Health check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    database: 'SQLite (sql.js WASM)',
    jwtAuth: 'enabled',
  });
});

// Authentication endpoints
app.post('/api/auth/register', handleRegister);
app.post('/api/auth/login', handleLogin);
app.get('/api/auth/me', authMiddleware, handleMe);

// Study Data endpoints (Protected by JWT)
app.get('/api/gate/data', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const data = await getUserStudyData(userId);
    res.json(data);
  } catch (error: any) {
    console.error('Error fetching user study data:', error);
    res.status(500).json({ error: 'Failed to retrieve study data from database' });
  }
});

app.put('/api/gate/data', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const payload = req.body;
    await saveUserStudyData(userId, payload);
    res.json({ success: true, message: 'Data saved successfully to SQLite database' });
  } catch (error: any) {
    console.error('Error saving user study data:', error);
    res.status(500).json({ error: 'Failed to save study data to database' });
  }
});

app.post('/api/gate/reset', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    await resetUserStudyData(userId);
    res.json({
      success: true,
      message: 'Study data reset to fresh state',
      data: {
        subjects: [],
        chapters: [],
        revisions: [],
        pyqs: [],
        pyqQueue: [],
        calendarEvents: [],
        exams: [],
        revisionSettings: { rev1Days: 7, rev2Days: 14, rev3Days: 28 },
      },
    });
  } catch (error: any) {
    console.error('Error resetting user study data:', error);
    res.status(500).json({ error: 'Failed to reset study data' });
  }
});

// Optional action to populate standard syllabus template on explicit request
app.post('/api/gate/import-template', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const seed = getInitialSeedData();
    await saveUserStudyData(userId, seed);
    res.json({
      success: true,
      message: 'Standard GATE CS syllabus template imported successfully',
      data: seed,
    });
  } catch (error: any) {
    console.error('Error importing template:', error);
    res.status(500).json({ error: 'Failed to import template' });
  }
});

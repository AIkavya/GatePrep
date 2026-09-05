import express, { Request, Response, NextFunction } from 'express';
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

// CORS & Preflight handling
app.use((req: Request, res: Response, next: NextFunction) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }
  next();
});

const apiRouter = express.Router();

// Health check
apiRouter.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    database: 'SQLite (sql.js WASM) with JSON fallback',
    jwtAuth: 'enabled',
  });
});

// Authentication endpoints
apiRouter.post('/auth/register', handleRegister);
apiRouter.post('/auth/login', handleLogin);
apiRouter.get('/auth/me', authMiddleware, handleMe);

// Study Data endpoints (Protected by JWT)
apiRouter.get('/gate/data', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const data = await getUserStudyData(userId);
    res.json(data);
  } catch (error: any) {
    console.error('Error fetching user study data:', error);
    res.status(500).json({ error: 'Failed to retrieve study data from database' });
  }
});

apiRouter.put('/gate/data', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const payload = req.body;
    await saveUserStudyData(userId, payload);
    res.json({ success: true, message: 'Data saved successfully to database' });
  } catch (error: any) {
    console.error('Error saving user study data:', error);
    res.status(500).json({ error: 'Failed to save study data to database' });
  }
});

apiRouter.post('/gate/reset', authMiddleware, async (req: AuthRequest, res: Response) => {
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
apiRouter.post('/gate/import-template', authMiddleware, async (req: AuthRequest, res: Response) => {
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

// Mount router on both /api (standard) and / (if serverless rewrites or strips /api prefix)
app.use('/api', apiRouter);
app.use('/', apiRouter);

// Global JSON error handler - guarantees server errors are never HTML
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Unhandled API Error:', err);
  if (!res.headersSent) {
    res.status(err.status || 500).json({
      error: err?.message || 'An unexpected server error occurred.',
    });
  }
});


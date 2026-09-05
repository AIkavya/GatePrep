import { app } from '../server/app.js';

export default function handler(req: any, res: any) {
  // If Vercel rewrote the path to /api/index.ts, restore original URL so Express routes match correctly
  const matchedPath = (req.headers['x-matched-path'] as string) || (req.headers['x-forwarded-uri'] as string);
  if (matchedPath && (req.url === '/api/index.ts' || req.url === '/api' || req.url.startsWith('/api/index.ts'))) {
    req.url = matchedPath;
  }
  return app(req, res);
}


import express from 'express';
import fs from 'fs';
import path from 'path';
import { app } from './server/app';

const PORT = 3000;

function resolveDistDirectory(): string {
  // Check common deployment directory structures
  const candidates = [
    typeof __dirname !== 'undefined' ? __dirname : '', // when running inside dist/server.cjs, __dirname IS the dist directory
    path.join(process.cwd(), 'dist'),
    path.resolve(process.cwd(), 'dist'),
    typeof __dirname !== 'undefined' ? path.resolve(__dirname, 'dist') : '',
    typeof __dirname !== 'undefined' ? path.resolve(__dirname, '..', 'dist') : '',
  ];

  for (const candidate of candidates) {
    if (candidate && fs.existsSync(path.join(candidate, 'index.html'))) {
      return candidate;
    }
  }

  return path.join(process.cwd(), 'dist');
}

async function startServer() {
  const distPath = resolveDistDirectory();
  const hasDistIndex = fs.existsSync(path.join(distPath, 'index.html'));
  const isBundled = typeof __filename !== 'undefined' && __filename.endsWith('.cjs');
  const isProduction =
    process.env.NODE_ENV === 'production' ||
    isBundled ||
    (process.env.NODE_ENV !== 'development' && hasDistIndex);

  if (!isProduction) {
    // In development mode, dynamically import Vite so it is never loaded in production
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // In production mode, serve precompiled static assets from dist
    app.use(express.static(distPath, { index: false }));

    // Unmatched API routes return 404 JSON instead of HTML
    app.all('/api/*', (req, res) => {
      res.status(404).json({ error: 'API route not found' });
    });

    // SPA fallback: send index.html for all page routes
    app.get('*', (req, res, next) => {
      const indexPath = path.join(distPath, 'index.html');
      if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath, (err) => {
          if (err && !res.headersSent) {
            next(err);
          }
        });
      } else {
        res.status(200).send('<!doctype html><html><head><meta charset="utf-8"/><title>GATE Prep</title></head><body><div id="root"></div></body></html>');
      }
    });
  }

  // Global error handler to catch any unexpected exceptions without crashing the server
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('Server error handled:', err);
    if (!res.headersSent) {
      res.status(500).json({
        error: 'Internal server error',
        message: err?.message || 'An unexpected error occurred.',
      });
    }
  });

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT} [${isProduction ? 'PRODUCTION' : 'DEVELOPMENT'}]`);
  });
}

startServer().catch((err) => {
  console.error('Fatal startup error in startServer:', err);
});

import 'dotenv/config';
import { app } from './backend/app.ts';
import express from 'express';
import path from 'node:path';

if (process.env.NODE_ENV !== 'production') {
  const { createServer } = await import('vite');
  const vite = await createServer({ server: { middlewareMode: true }, appType: 'spa' });
  app.use(vite.middlewares);
} else {
  const dist = path.resolve(import.meta.dirname, 'dist');
  app.use(express.static(dist));
  app.get('*', (_req, res) => res.sendFile(path.join(dist, 'index.html')));
}
app.listen(Number(process.env.PORT) || 3000, '0.0.0.0');

/**
 * AI Code Review Tool — Backend Server
 *
 * Express server providing hybrid code analysis:
 * - Rule-based checks (fast, zero latency)
 * - AI-powered analysis via Google Gemini (deep insights)
 */

import { fileURLToPath } from 'url';
import path from 'path';
import dotenv from 'dotenv';

// Load .env before any other imports (absolute path avoids Windows CWD issues in ESM)
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '.env') });

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import reviewRoutes from './routes/reviewRoute.js';

// ─── App Setup ────────────────────────────────────────────────────────────────

const app = express();
const PORT = process.env.PORT || 5000;
const isDev = process.env.NODE_ENV !== 'production';

// ─── Security Middleware ──────────────────────────────────────────────────────

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc:   ["'self'", "'unsafe-inline'"],
      scriptSrc:  ["'self'"],
      imgSrc:     ["'self'", 'data:', 'https:'],
    },
  },
}));

// ─── CORS ─────────────────────────────────────────────────────────────────────

const allowedOrigins = isDev
  ? ['http://localhost:3000', 'http://localhost:5173', 'http://127.0.0.1:5173']
  : [process.env.FRONTEND_URL].filter(Boolean);

app.use(cors({
  origin: allowedOrigins,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  maxAge: 86400,
}));

// ─── Rate Limiting ────────────────────────────────────────────────────────────

app.use(rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max:      parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message:  { success: false, error: 'Too many requests. Please try again later.', code: 'RATE_LIMIT_EXCEEDED' },
  standardHeaders: true,
  legacyHeaders:   false,
}));

// ─── Body Parsing ─────────────────────────────────────────────────────────────

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ─── Request Logger ───────────────────────────────────────────────────────────

app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// ─── Routes ───────────────────────────────────────────────────────────────────

app.get('/health', (_req, res) => res.json({
  success: true,
  message: 'AI Code Review API is running',
  timestamp: new Date().toISOString(),
  version: '1.0.0',
}));

app.use('/api', reviewRoutes);

// ─── 404 Handler ──────────────────────────────────────────────────────────────

app.use((_req, res) => res.status(404).json({
  success: false,
  error: 'Endpoint not found',
  code: 'NOT_FOUND',
}));

// ─── Global Error Handler ─────────────────────────────────────────────────────

// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  console.error('[Server Error]', err.message);

  const statusMap = {
    ValidationError:   400,
    UnauthorizedError: 401,
  };

  const status = statusMap[err.name] || err.status || 500;

  if (err.code === 'ECONNREFUSED' || err.code === 'ETIMEDOUT') {
    return res.status(503).json({ success: false, error: 'Service temporarily unavailable', code: 'SERVICE_UNAVAILABLE' });
  }

  res.status(status).json({
    success: false,
    error: isDev ? err.message : 'Internal server error',
    code: err.code || 'INTERNAL_ERROR',
  });
});

// ─── Graceful Shutdown ────────────────────────────────────────────────────────

const shutdown = (signal) => {
  console.log(`\n${signal} received. Shutting down gracefully...`);
  process.exit(0);
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT',  () => shutdown('SIGINT'));

// ─── Start ────────────────────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════════════╗
║           AI Code Review Tool — Backend Server             ║
╠════════════════════════════════════════════════════════════╣
║  Port:    ${PORT}                                              ║
║  Mode:    ${isDev ? 'development' : 'production '}                                     ║
║  Health:  http://localhost:${PORT}/health                     ║
║  API:     http://localhost:${PORT}/api/review                 ║
╚════════════════════════════════════════════════════════════╝
  `);
});

export default app;

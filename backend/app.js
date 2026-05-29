require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const { connectDB } = require('./config/database');
require('./models/index'); // register all models & associations

const authRoutes = require('./routes/authRoutes');
const courseRoutes = require('./routes/courseRoutes');
const { globalErrorHandler } = require('./middleware/errorHandler');
const { sendError } = require('./utils/response');

const app = express();

// ─── Security ─────────────────────────────────────────────────────────────────
app.use(helmet());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || '*',
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// ─── Rate limiting ────────────────────────────────────────────────────────────
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX) || 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests. Please try again later.' },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { success: false, message: 'Too many login attempts. Please try again after 15 minutes.' },
});

app.use('/api', limiter);
app.use('/api/auth', authLimiter);

// ─── Body parsing ─────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ─── Logging ──────────────────────────────────────────────────────────────────
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
}

// ─── Health check ─────────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({
    success: true,
    status: 'OK',
    service: 'Course Management API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });
});

// ─── API routes ───────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);

// ─── API docs stub ────────────────────────────────────────────────────────────
app.get('/api', (req, res) => {
  res.json({
    success: true,
    message: 'Course Management API — Surabhi Prakash',
    version: '1.0.0',
    endpoints: {
      auth: {
        'POST /api/auth/register': 'Register a new user',
        'POST /api/auth/login': 'Login and receive JWT tokens',
        'POST /api/auth/refresh': 'Refresh access token',
        'GET  /api/auth/me': 'Get current user profile [Protected]',
      },
      courses: {
        'GET    /api/courses': 'List courses (pagination, filtering, sorting)',
        'POST   /api/courses': 'Create course [Instructor, Admin]',
        'GET    /api/courses/stats': 'Course statistics [Admin]',
        'GET    /api/courses/my-courses': 'My courses [Instructor, Admin]',
        'GET    /api/courses/slug/:slug': 'Get course by slug',
        'GET    /api/courses/:id': 'Get course by ID',
        'PATCH  /api/courses/:id': 'Update course [Instructor/Owner, Admin]',
        'DELETE /api/courses/:id': 'Delete or archive course [Instructor/Owner, Admin]',
        'PATCH  /api/courses/:id/publish': 'Publish or submit for review',
        'PUT    /api/courses/:id/sections': 'Replace course sections/lessons',
        'POST   /api/courses/:id/reviews': 'Add review [Student]',
      },
    },
  });
});

// ─── 404 handler ──────────────────────────────────────────────────────────────
app.all('*', (req, res) => {
  sendError(res, { message: `Route ${req.method} ${req.originalUrl} not found`, statusCode: 404 });
});

// ─── Global error handler ─────────────────────────────────────────────────────
app.use(globalErrorHandler);

// ─── Start server ─────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();
  const server = app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📄 API docs at http://localhost:${PORT}/api`);
    console.log(`🏥 Health check at http://localhost:${PORT}/health`);
  });

  server.on('error', (err) => {
    console.error('🔴 Server failed to start:', err.message);
    if (err.code === 'EADDRINUSE') {
      console.error(`Port ${PORT} is already in use. Stop the existing process or change PORT.`);
    }
    process.exit(1);
  });
};

if (require.main === module) {
  startServer();
}

module.exports = { app, startServer };

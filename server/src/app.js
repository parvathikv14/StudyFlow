import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { rateLimit } from 'express-rate-limit';
import authRoutes from './routes/authRoutes.js';
import taskRoutes from './routes/taskRoutes.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';

const app = express();
const allowedOrigins = (process.env.FRONTEND_URL || 'http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.disable('x-powered-by');
app.use(helmet());
app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    const error = new Error('This origin is not allowed by the CORS policy.');
    error.status = 403;
    return callback(error);
  }
}));
app.use(express.json({ limit: '20kb' }));
app.use('/api/auth', rateLimit({ windowMs: 15 * 60 * 1000, limit: 30, standardHeaders: 'draft-7', legacyHeaders: false }));
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'studyflow-api', timestamp: new Date().toISOString() });
});
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use(notFound);
app.use(errorHandler);

export default app;

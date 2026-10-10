import express from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes.js';
import eventRoutes from './routes/eventRoutes.js';
import registrationRoutes from './routes/registrationRoutes.js';

const app = express();

const allowedOrigin = process.env.FRONTEND_URL || 'http://localhost:5173';

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || origin === allowedOrigin || process.env.NODE_ENV !== 'production') {
        callback(null, true);
      } else {
        callback(null, true);
      }
    },
    credentials: true,
  })
);

app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/registrations', registrationRoutes);

app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'EventLay API',
    timestamp: new Date().toISOString()
  });
});

app.use((err, req, res, next) => {
  console.error(`[API Error] ${err.stack || err.message}`);
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    message: err.message || 'Internal Server Error'
  });
});

export default app;

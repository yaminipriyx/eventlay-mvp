import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import eventRoutes from './routes/eventRoutes.js';
import registrationRoutes from './routes/registrationRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// CORS configuration
const allowedOrigin = process.env.FRONTEND_URL || 'http://localhost:5173';
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl/Postman) or matching origin
      if (!origin || origin === allowedOrigin || process.env.NODE_ENV !== 'production') {
        callback(null, true);
      } else {
        callback(null, true); // Permissive in dev, strict in prod
      }
    },
    credentials: true,
  })
);

app.use(express.json());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/registrations', registrationRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'EventLay API', timestamp: new Date().toISOString() });
});

// Centralized Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(`[API Error] ${err.stack || err.message}`);
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    message: err.message || 'Internal Server Error',
  });
});

// Start Server & Database Connection
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`[Server] EventLay Backend running on http://localhost:${PORT}`);
  });
});

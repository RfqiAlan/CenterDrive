import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import passport from 'passport';

import authRoutes from './routes/auth';
import sectionsRoutes from './routes/sections';
import driveRoutes from './routes/drive';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middlewares
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:4000',
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());
app.use(passport.initialize());

// Basic health check route
app.get('/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});


// Routes
app.use('/auth', authRoutes);
app.use('/api/sections', sectionsRoutes);
app.use('/api/drive', driveRoutes);

// Only start the server locally. Vercel will use the exported app instance.
if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
  app.listen(port, () => {
    console.log(`[Server]: Running at http://localhost:${port}`);
  });
}

export default app;

import dotenv from 'dotenv';
import path from 'path';

// Load environment variables FIRST before any other imports
dotenv.config({ path: path.join(process.cwd(), '.env') });

import express from 'express';
import cors from 'cors';
import 'express-async-errors';

// Import routes
import authRoutes from './routes/auth';
import jobDescriptionRoutes from './routes/jobDescriptions';
import candidateRoutes from './routes/candidates';
import analysisRoutes from './routes/analysis';
import analyticsRoutes from './routes/analytics';
import subscriptionRoutes from './routes/subscriptions';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? true // Allow all origins in production, or specify your Railway domain
    : 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/job-descriptions', jobDescriptionRoutes);
app.use('/api/candidates', candidateRoutes);
app.use('/api/analysis', analysisRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/subscriptions', subscriptionRoutes);

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  // Serve the built frontend files
  app.use(express.static(path.join(__dirname, '../../client/dist')));
  
  // Handle all other routes by serving the index.html
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../../client/dist/index.html'));
  });
}

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Debug endpoint for AI configuration (remove in production)
app.get('/api/debug/ai-config', (req, res) => {
  res.json({
    useGemini: process.env.USE_GEMINI === 'true',
    geminiKeyPresent: !!process.env.GEMINI_API_KEY,
    openaiKeyPresent: !!process.env.OPENAI_API_KEY,
    nodeEnv: process.env.NODE_ENV,
    geminiKeyLength: process.env.GEMINI_API_KEY?.length || 0,
  });
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  
  if (err.code === 'P2002') {
    return res.status(409).json({ error: 'This record already exists' });
  }
  
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
}); 
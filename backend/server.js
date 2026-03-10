// Main entry point
import "dotenv/config";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import path from "path";
import { fileURLToPath } from "url";
import jobRoutes from "./src/routes/jobRoutes.js";
import candidateRoutes from "./src/routes/candidateRoutes.js";
import authRoutes from "./src/routes/authRoutes.js";
import questionRoutes from "./src/routes/questionRoutes.js";
import interviewRoutes from "./src/routes/interviewRoutes.js";
import { skillselectRouter, interviewModuleRouter, interviewAnalysisRouter, interviewVideoRouter } from "./src/routes/interviewSessionRoutes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve interview videos as static files with proper headers for streaming
app.use('/uploads/interview-videos', express.static(path.join(__dirname, 'uploads/interview-videos'), {
  setHeaders: (res, filePath) => {
    res.set('Accept-Ranges', 'bytes');
    res.set('Cache-Control', 'public, max-age=3600');
    if (filePath.endsWith('.webm')) {
      res.set('Content-Type', 'video/webm');
    }
  }
}));

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/skillselect')
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB error:', err));

// Routes Registration
console.log('📍 Registering routes...');
app.use('/api/jobs', jobRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/interviews', interviewRoutes);
app.use('/api/skillselect', skillselectRouter);
app.use('/api/interview-module', interviewModuleRouter);
app.use('/api/interview-analysis', interviewAnalysisRouter);
app.use('/api/interview-video', interviewVideoRouter);
app.use('/api/candidates', candidateRoutes);
app.use('/api/auth', authRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date() });
});

// 404 Handler
app.use((req, res) => {
  console.log(`❌ 404 - ${req.method} ${req.path}`);
  res.status(404).json({ 
    success: false,
    message: `Route not found: ${req.method} ${req.path}` 
  });
});

// Error Handler
app.use((err, req, res, next) => {
  console.error('❌ Server error:', err);
  res.status(500).json({ 
    success: false,
    message: 'Internal server error',
    error: err.message 
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📍 Available routes:`);
  console.log(`   POST /api/interviews/send-invites`);
  console.log(`   GET  /api/interviews/start`);
  console.log(`   POST /api/skillselect/interview-context`);
  console.log(`   POST /api/interview-module/analyze`);
  console.log(`   POST /api/skillselect/candidate-score`);
  console.log(`   GET  /api/interview-analysis/:candidateID/:jobID`);
  console.log(`   GET  /api/interview-video/:candidateID/:jobID`);
});

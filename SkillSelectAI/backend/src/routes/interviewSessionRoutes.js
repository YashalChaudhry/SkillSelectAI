import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import {
  getInterviewContext,
  analyzeInterview,
  saveCandidateScore,
  getInterviewAnalysis,
  getInterviewVideo
} from '../controllers/interviewSessionController.js';

// Configure multer for video uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'uploads/interview-videos';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname) || '.webm';
    cb(null, 'interview-' + uniqueSuffix + ext);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 500 * 1024 * 1024 // 500MB limit (single video for entire interview)
  }
});

// ── Routes that match the frontend's integrationController.ts ──

// Route 1: POST /api/skillselect/interview-context
// Called by: fetchInterviewContext(candidateID, jobID)
const skillselectRouter = express.Router();
skillselectRouter.post('/interview-context', getInterviewContext);
skillselectRouter.post('/candidate-score', saveCandidateScore);

// Route 2: POST /api/interview-module/analyze
// Called by: submitInterviewResponse({ candidateID, sessionToken, mediaBlob, keywords, jobID, duration, interviewType })
const interviewModuleRouter = express.Router();
interviewModuleRouter.post('/analyze', upload.any(), analyzeInterview);

// Route 3: GET /api/interview-analysis/:candidateID/:jobID
// Called by: Recruiter dashboard to fetch detailed interview analysis
const interviewAnalysisRouter = express.Router();
interviewAnalysisRouter.get('/:candidateID/:jobID', getInterviewAnalysis);

// Route 4: GET /api/interview-video/:candidateID/:jobID
// Called by: Recruiter dashboard to stream interview video for manual review
const interviewVideoRouter = express.Router();
interviewVideoRouter.get('/:candidateID/:jobID', getInterviewVideo);

export { skillselectRouter, interviewModuleRouter, interviewAnalysisRouter, interviewVideoRouter };
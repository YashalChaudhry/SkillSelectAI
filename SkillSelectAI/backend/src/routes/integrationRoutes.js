import { Router } from 'express';
import multer from 'multer';
import {
  getInterviewContext,
  analyzeInterview,
  saveCandidateScore,
  getInterviewAnalysis
} from '../controllers/interviewSessionController.js';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

/**
 * POST /api/skillselect/interview-context
 * Fetch interview questions and keywords for a candidate
 */
router.post('/skillselect/interview-context', getInterviewContext);

/**
 * POST /api/interview-module/analyze
 * Submit video and receive analysis score
 */
router.post(
  '/interview-module/analyze',
  upload.single('videoBlob'),
  analyzeInterview
);

/**
 * POST /api/skillselect/candidate-score
 * Save final interview score to candidate profile
 */
router.post('/skillselect/candidate-score', saveCandidateScore);

/**
 * GET /api/interview-analysis/:candidateID/:jobID
 * Retrieve detailed interview analysis (for recruiter dashboard)
 */
router.get('/interview-analysis/:candidateID/:jobID', getInterviewAnalysis);

export default router;

// backend/src/routes/questionRoutes.js
import express from 'express';
import Question from '../models/Question.js';
import { generateQuestionsForJob } from '../services/questionGenerationService.js';
import questionValidationService from '../services/questionValidationService.js';

const router = express.Router();

// Get questions for a job
router.get('/jobs/:jobId/questions', async (req, res) => {
  try {
    const questions = await Question.find({ 
      jobId: req.params.jobId 
    }).populate('templateId').sort({ createdAt: -1 });
    
    res.json(questions);
  } catch (error) {
    console.error('Error fetching questions:', error);
    res.status(500).json({ message: 'Error fetching questions' });
  }
});

// Create a question (for testing)
router.post('/', async (req, res) => {
  try {
    const { jobId, text, skill, difficulty, type, status } = req.body;
    const question = await Question.create({
      jobId,
      text,
      skill,
      difficulty,
      type,
      status: status || 'Pending'
    });
    
    res.status(201).json(question);
  } catch (error) {
    console.error('Error creating question:', error);
    res.status(500).json({ message: 'Error creating question' });
  }
});

// Update a question
router.patch('/:id', async (req, res) => {
  try {
    const { text, skill, difficulty, type, status, rejectionReason } = req.body;
    const update = { 
      text, 
      skill, 
      difficulty, 
      type, 
      status,
      'metadata.lastModified': new Date()
    };

    if (status === 'Rejected' && rejectionReason) {
      update.rejectionReason = rejectionReason;
    }

    const question = await Question.findByIdAndUpdate(
      req.params.id,
      { $set: update },
      { new: true }
    );
    
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }
    
    res.json(question);
  } catch (error) {
    console.error('Error updating question:', error);
    res.status(500).json({ message: 'Error updating question' });
  }
});

// Generate questions for a job (admin only)
router.post('/jobs/:jobId/generate', async (req, res) => {
  try {
    const jobId = req.params.jobId;
    const questions = await generateQuestionsForJob(jobId);
    res.json({ 
      message: `${questions.length} questions generated successfully`,
      questions
    });
  } catch (error) {
    console.error('Error generating questions:', error);
    res.status(500).json({ 
      message: 'Error generating questions',
      error: error.message 
    });
  }
});

// Get validation details for a question
router.get('/:id/validation', async (req, res) => {
  try {
    const question = await Question.findById(req.params.id).populate('templateId');
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    const validationResult = await questionValidationService.validateQuestion(question.toObject());
    res.json(validationResult);
  } catch (error) {
    console.error('Error getting validation details:', error);
    res.status(500).json({ message: 'Error getting validation details' });
  }
});

export default router;
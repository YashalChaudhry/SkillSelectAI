import Question from '../models/Question.js';
import QuestionTemplate from '../models/QuestionTemplate.js';
import mongoose from 'mongoose';

/**
 * @desc    Get all questions for a job
 * @route   GET /api/jobs/:jobId/questions
 * @access  Private/Recruiter
 */
export const getJobQuestions = async (req, res) => {
  try {
    const { jobId } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(jobId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid job ID',
      });
    }

    const questions = await Question.find({ jobId })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: questions.length,
      data: questions,
    });
  } catch (error) {
    console.error('Error fetching questions:', error);
    res.status(500).json({
      success: false,
      error: 'Error fetching questions',
    });
  }
};

/**
 * @desc    Update a question
 * @route   PATCH /api/questions/:questionId
 * @access  Private/Recruiter
 */
export const updateQuestion = async (req, res) => {
  try {
    const { questionId } = req.params;
    const updates = req.body;
    
    if (!mongoose.Types.ObjectId.isValid(questionId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid question ID',
      });
    }

    // Only allow certain fields to be updated
    const allowedUpdates = ['text', 'skill', 'difficulty', 'status', 'rejectionReason'];
    const isValidOperation = Object.keys(updates).every(update => 
      allowedUpdates.includes(update)
    );

    if (!isValidOperation) {
      return res.status(400).json({
        success: false,
        error: 'Invalid updates!',
      });
    }

    const question = await Question.findByIdAndUpdate(
      questionId,
      { 
        ...updates,
        'metadata.lastModified': Date.now(),
        'metadata.modifiedBy': req.user?.id || null,
      },
      { new: true, runValidators: true }
    );

    if (!question) {
      return res.status(404).json({
        success: false,
        error: 'Question not found',
      });
    }

    res.status(200).json({
      success: true,
      data: question,
    });
  } catch (error) {
    console.error('Error updating question:', error);
    res.status(500).json({
      success: false,
      error: 'Error updating question',
    });
  }
};

/**
 * @desc    Delete a question
 * @route   DELETE /api/questions/:questionId
 * @access  Private/Recruiter
 */
export const deleteQuestion = async (req, res) => {
  try {
    const { questionId } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(questionId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid question ID',
      });
    }

    const question = await Question.findByIdAndDelete(questionId);

    if (!question) {
      return res.status(404).json({
        success: false,
        error: 'Question not found',
      });
    }

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (error) {
    console.error('Error deleting question:', error);
    res.status(500).json({
      success: false,
      error: 'Error deleting question',
    });
  }
};

/**
 * @desc    Get all question templates
 * @route   GET /api/question-templates
 * @access  Private/Admin
 */
export const getQuestionTemplates = async (req, res) => {
  try {
    const { type, difficulty, category } = req.query;
    
    const filter = { isActive: true };
    
    if (type) filter.type = type;
    if (difficulty) filter.difficulty = difficulty;
    if (category) filter.category = category;
    
    const templates = await QuestionTemplate.find(filter)
      .sort({ type: 1, difficulty: 1, category: 1 });
    
    res.status(200).json({
      success: true,
      count: templates.length,
      data: templates,
    });
  } catch (error) {
    console.error('Error fetching question templates:', error);
    res.status(500).json({
      success: false,
      error: 'Error fetching question templates',
    });
  }
};

/**
 * @desc    Create a new question template
 * @route   POST /api/question-templates
 * @access  Private/Admin
 */
export const createQuestionTemplate = async (req, res) => {
  try {
    const { text, type, difficulty, placeholders, category } = req.body;
    
    if (!text || !type || !difficulty) {
      return res.status(400).json({
        success: false,
        error: 'Please provide text, type, and difficulty',
      });
    }
    
    const template = new QuestionTemplate({
      text,
      type,
      difficulty,
      placeholders: placeholders || [],
      category: category || 'Software Engineering',
    });
    
    await template.save();
    
    res.status(201).json({
      success: true,
      data: template,
    });
  } catch (error) {
    console.error('Error creating question template:', error);
    res.status(500).json({
      success: false,
      error: 'Error creating question template',
    });
  }
};

/**
 * @desc    Seed question templates (for initial setup)
 * @route   POST /api/question-templates/seed
 * @access  Private/Admin
 */
export const seedTemplates = async (req, res) => {
  try {
    const { COMPREHENSIVE_TEMPLATES } = await import('../seeds/questionTemplates.js');
    
    // Clear existing templates
    await QuestionTemplate.deleteMany({});
    
    const inserted = await QuestionTemplate.insertMany(COMPREHENSIVE_TEMPLATES);
    
    res.status(201).json({
      success: true,
      count: inserted.length,
      message: `Seeded ${inserted.length} question templates across all categories`,
      data: inserted,
    });
  } catch (error) {
    console.error('Error seeding templates:', error);
    res.status(500).json({
      success: false,
      error: 'Error seeding templates',
      details: error.message,
    });
  }
};

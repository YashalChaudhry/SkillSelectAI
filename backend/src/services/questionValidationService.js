import Question from '../models/Question.js';

class QuestionValidationService {
  /**
   * Validate a question for completeness and correctness
   */
  async validateQuestion(questionData) {
    const validationResults = {
      isValid: true,
      errors: [],
      warnings: [],
      score: 0,
      details: {}
    };

    try {
      // Check required fields
      const requiredFields = ['text', 'skill', 'difficulty', 'type'];
      for (const field of requiredFields) {
        if (!questionData[field] || questionData[field].trim() === '') {
          validationResults.errors.push(`Missing required field: ${field}`);
          validationResults.isValid = false;
        }
      }

      // Validate difficulty
      const validDifficulties = ['Easy', 'Medium', 'Hard'];
      if (questionData.difficulty && !validDifficulties.includes(questionData.difficulty)) {
        validationResults.errors.push(`Invalid difficulty: ${questionData.difficulty}`);
        validationResults.isValid = false;
      }

      // Validate question type
      const validTypes = ['Conceptual', 'Technical', 'Behavioral', 'Scenario'];
      if (questionData.type && !validTypes.includes(questionData.type)) {
        validationResults.errors.push(`Invalid question type: ${questionData.type}`);
        validationResults.isValid = false;
      }

      // Check for unfilled placeholders
      const text = questionData.text || '';
      const placeholderRegex = /\{[^}]+\}/g;
      const placeholders = text.match(placeholderRegex);
      
      if (placeholders && placeholders.length > 0) {
        validationResults.warnings.push(`Question contains unfilled placeholders: ${placeholders.join(', ')}`);
        validationResults.details.unfilledPlaceholders = placeholders;
      }

      // Calculate validation score
      let score = 100;
      
      // Deduct points for errors
      score -= validationResults.errors.length * 20;
      
      // Deduct points for warnings
      score -= validationResults.warnings.length * 5;
      
      // Ensure score doesn't go below 0
      validationResults.score = Math.max(0, score);

      // Add additional details
      validationResults.details = {
        ...validationResults.details,
        questionLength: text.length,
        wordCount: text.split(/\s+/).length,
        hasPlaceholders: placeholders && placeholders.length > 0,
        placeholderCount: placeholders ? placeholders.length : 0
      };

    } catch (error) {
      validationResults.isValid = false;
      validationResults.errors.push(`Validation error: ${error.message}`);
      validationResults.score = 0;
    }

    return validationResults;
  }

  /**
   * Validate multiple questions
   */
  async validateQuestions(questions) {
    const results = [];
    
    for (const question of questions) {
      const validation = await this.validateQuestion(question);
      results.push({
        questionId: question._id,
        ...validation
      });
    }

    return {
      totalQuestions: questions.length,
      validQuestions: results.filter(r => r.isValid).length,
      invalidQuestions: results.filter(r => !r.isValid).length,
      averageScore: results.reduce((sum, r) => sum + r.score, 0) / results.length,
      results
    };
  }
}

export default new QuestionValidationService();

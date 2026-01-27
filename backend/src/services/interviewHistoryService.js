import InterviewHistory from '../models/InterviewHistory.js';
import Question from '../models/Question.js';
import mongoose from 'mongoose';

class InterviewHistoryService {
  constructor() {
    this.defaultCooldownPeriod = 5; // interviews
    this.maxHistoryDays = 90; // days to keep detailed history
  }

  /**
   * Record interview session in history
   * @param {Object} interviewData - Interview session data
   * @returns {Promise<Object>} - Created interview history record
   */
  async recordInterviewSession(interviewData) {
    const {
      interviewId,
      jobId,
      candidateId,
      questions,
      metadata,
      scheduledAt = new Date()
    } = interviewData;

    try {
      // Extract question IDs and template IDs
      const questionIds = questions.map(q => q._id || q.id);
      const templateIds = questions.map(q => q.templateId?._id || q.templateId);

      // Create interview history record
      const interviewHistory = new InterviewHistory({
        interviewId,
        jobId: new mongoose.Types.ObjectId(jobId),
        candidateId: new mongoose.Types.ObjectId(candidateId),
        questionIds: questionIds.map(id => new mongoose.Types.ObjectId(id)),
        templateIds: templateIds.map(id => id ? new mongoose.Types.ObjectId(id) : null),
        scheduledAt,
        metadata: {
          totalQuestions: questions.length,
          difficultyDistribution: metadata.difficultyDistribution || { Easy: 0, Medium: 0, Hard: 0 },
          skillCoverage: metadata.skillCoverage || [],
          typeDistribution: metadata.typeDistribution || { Conceptual: 0, Technical: 0, Scenario: 0, Behavioral: 0 },
          randomizationSeed: metadata.randomizationSeed || this.generateRandomSeed()
        }
      });

      const saved = await interviewHistory.save();
      return saved;

    } catch (error) {
      console.error('Error recording interview session:', error);
      throw error;
    }
  }

  /**
   * Get interview history for a candidate
   * @param {string} candidateId - Candidate ID
   * @param {number} limit - Maximum number of interviews to return
   * @returns {Promise<Array>} - Interview history
   */
  async getCandidateInterviewHistory(candidateId, limit = 20) {
    try {
      const history = await InterviewHistory.find({
        candidateId: new mongoose.Types.ObjectId(candidateId)
      })
      .populate('jobId', 'title description')
      .populate('questionIds', 'text skill difficulty type')
      .sort({ scheduledAt: -1 })
      .limit(limit);

      return history;
    } catch (error) {
      console.error('Error getting candidate interview history:', error);
      throw error;
    }
  }

  /**
   * Get recent interviews for cooldown tracking
   * @param {string} candidateId - Candidate ID
   * @param {number} cooldownPeriod - Number of interviews to consider for cooldown
   * @returns {Promise<Array>} - Recent interviews for cooldown
   */
  async getRecentInterviewsForCooldown(candidateId, cooldownPeriod = null) {
    try {
      const limit = cooldownPeriod || this.defaultCooldownPeriod;
      return await InterviewHistory.getRecentInterviews(candidateId, limit);
    } catch (error) {
      console.error('Error getting recent interviews for cooldown:', error);
      throw error;
    }
  }

  /**
   * Check if questions are in cooldown for a candidate
   * @param {Array} questionIds - Array of question IDs to check
   * @param {string} candidateId - Candidate ID
   * @param {number} cooldownPeriod - Cooldown period in interviews
   * @returns {Promise<Object>} - Cooldown status for each question
   */
  async checkQuestionCooldown(questionIds, candidateId, cooldownPeriod = null) {
    try {
      const recentInterviews = await this.getRecentInterviewsForCooldown(candidateId, cooldownPeriod);
      const cooldownStatus = {};

      // Initialize all questions as not in cooldown
      questionIds.forEach(id => {
        cooldownStatus[id.toString()] = {
          inCooldown: false,
          lastUsed: null,
          interviewsAgo: -1
        };
      });

      // Check each recent interview
      recentInterviews.forEach((interview, index) => {
        interview.questionIds.forEach(qId => {
          const qIdStr = qId.toString();
          if (cooldownStatus[qIdStr]) {
            if (!cooldownStatus[qIdStr].inCooldown) {
              cooldownStatus[qIdStr].inCooldown = true;
              cooldownStatus[qIdStr].lastUsed = interview.scheduledAt;
              cooldownStatus[qIdStr].interviewsAgo = index;
            }
          }
        });
      });

      return cooldownStatus;
    } catch (error) {
      console.error('Error checking question cooldown:', error);
      throw error;
    }
  }

  /**
   * Check if templates are in cooldown for a candidate
   * @param {Array} templateIds - Array of template IDs to check
   * @param {string} candidateId - Candidate ID
   * @param {number} cooldownPeriod - Cooldown period in interviews
   * @returns {Promise<Object>} - Cooldown status for each template
   */
  async checkTemplateCooldown(templateIds, candidateId, cooldownPeriod = null) {
    try {
      const recentInterviews = await this.getRecentInterviewsForCooldown(candidateId, cooldownPeriod);
      const cooldownStatus = {};

      // Initialize all templates as not in cooldown
      templateIds.forEach(id => {
        cooldownStatus[id.toString()] = {
          inCooldown: false,
          lastUsed: null,
          interviewsAgo: -1
        };
      });

      // Check each recent interview
      recentInterviews.forEach((interview, index) => {
        interview.templateIds.forEach(tId => {
          if (tId) { // Skip null template IDs
            const tIdStr = tId.toString();
            if (cooldownStatus[tIdStr]) {
              if (!cooldownStatus[tIdStr].inCooldown) {
                cooldownStatus[tIdStr].inCooldown = true;
                cooldownStatus[tIdStr].lastUsed = interview.scheduledAt;
                cooldownStatus[tIdStr].interviewsAgo = index;
              }
            }
          }
        });
      });

      return cooldownStatus;
    } catch (error) {
      console.error('Error checking template cooldown:', error);
      throw error;
    }
  }

  /**
   * Get questions that are available for a candidate (not in cooldown)
   * @param {Array} allQuestions - All available questions
   * @param {string} candidateId - Candidate ID
   * @param {number} cooldownPeriod - Cooldown period
   * @returns {Promise<Array>} - Available questions
   */
  async getAvailableQuestionsForCandidate(allQuestions, candidateId, cooldownPeriod = null) {
    try {
      const questionIds = allQuestions.map(q => q._id.toString());
      const cooldownStatus = await this.checkQuestionCooldown(questionIds, candidateId, cooldownPeriod);

      return allQuestions.filter(question => {
        const status = cooldownStatus[question._id.toString()];
        return !status || !status.inCooldown;
      });
    } catch (error) {
      console.error('Error getting available questions for candidate:', error);
      throw error;
    }
  }

  /**
   * Get question usage statistics
   * @param {string} questionId - Question ID
   * @param {number} days - Number of days to look back
   * @returns {Promise<Object>} - Usage statistics
   */
  async getQuestionUsageStats(questionId, days = 30) {
    try {
      return await InterviewHistory.getQuestionUsageStats(questionId, days);
    } catch (error) {
      console.error('Error getting question usage stats:', error);
      throw error;
    }
  }

  /**
   * Get template usage statistics
   * @param {string} templateId - Template ID
   * @param {number} days - Number of days to look back
   * @returns {Promise<Object>} - Usage statistics
   */
  async getTemplateUsageStats(templateId, days = 30) {
    try {
      return await InterviewHistory.getTemplateUsageStats(templateId, days);
    } catch (error) {
      console.error('Error getting template usage stats:', error);
      throw error;
    }
  }

  /**
   * Update interview status
   * @param {string} interviewId - Interview ID
   * @param {string} status - New status
   * @returns {Promise<Object>} - Updated interview history
   */
  async updateInterviewStatus(interviewId, status) {
    try {
      const updateData = { status };
      
      if (status === 'Completed') {
        updateData.completedAt = new Date();
      }

      return await InterviewHistory.findOneAndUpdate(
        { interviewId },
        updateData,
        { new: true }
      );
    } catch (error) {
      console.error('Error updating interview status:', error);
      throw error;
    }
  }

  /**
   * Record interview performance scores
   * @param {string} interviewId - Interview ID
   * @param {Array} scores - Array of question scores
   * @param {string} evaluatedBy - User ID who evaluated
   * @returns {Promise<Object>} - Updated interview history
   */
  async recordInterviewPerformance(interviewId, scores, evaluatedBy) {
    try {
      const questionScores = scores.map(score => ({
        questionId: new mongoose.Types.ObjectId(score.questionId),
        score: score.score,
        feedback: score.feedback || '',
        evaluatedAt: new Date()
      }));

      const overallScore = scores.reduce((sum, s) => sum + s.score, 0) / scores.length;

      return await InterviewHistory.findOneAndUpdate(
        { interviewId },
        {
          'performance.overallScore': overallScore,
          'performance.questionScores': questionScores,
          'performance.evaluatedBy': new mongoose.Types.ObjectId(evaluatedBy),
          'performance.evaluatedAt': new Date()
        },
        { new: true }
      );
    } catch (error) {
      console.error('Error recording interview performance:', error);
      throw error;
    }
  }

  /**
   * Get interview analytics for a job
   * @param {string} jobId - Job ID
   * @param {number} days - Number of days to look back
   * @returns {Promise<Object>} - Interview analytics
   */
  async getJobInterviewAnalytics(jobId, days = 30) {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const analytics = await InterviewHistory.aggregate([
        {
          $match: {
            jobId: new mongoose.Types.ObjectId(jobId),
            scheduledAt: { $gte: startDate }
          }
        },
        {
          $group: {
            _id: null,
            totalInterviews: { $sum: 1 },
            completedInterviews: {
              $sum: { $cond: [{ $eq: ['$status', 'Completed'] }, 1, 0] }
            },
            averageScore: { $avg: '$performance.overallScore' },
            uniqueCandidates: { $addToSet: '$candidateId' }
          }
        },
        {
          $project: {
            totalInterviews: 1,
            completedInterviews: 1,
            completionRate: {
              $multiply: [
                { $divide: ['$completedInterviews', '$totalInterviews'] },
                100
              ]
            },
            averageScore: { $round: ['$averageScore', 2] },
            uniqueCandidateCount: { $size: '$uniqueCandidates' }
          }
        }
      ]);

      return analytics[0] || {
        totalInterviews: 0,
        completedInterviews: 0,
        completionRate: 0,
        averageScore: 0,
        uniqueCandidateCount: 0
      };
    } catch (error) {
      console.error('Error getting job interview analytics:', error);
      throw error;
    }
  }

  /**
   * Clean up old interview history
   * @param {number} daysToKeep - Number of days to keep history
   * @returns {Promise<Object>} - Cleanup result
   */
  async cleanupOldHistory(daysToKeep = null) {
    try {
      const keepDays = daysToKeep || this.maxHistoryDays;
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - keepDays);

      const result = await InterviewHistory.deleteMany({
        scheduledAt: { $lt: cutoffDate },
        status: { $in: ['Completed', 'Cancelled'] }
      });

      return {
        deletedCount: result.deletedCount,
        cutoffDate,
        message: `Cleaned up ${result.deletedCount} old interview records`
      };
    } catch (error) {
      console.error('Error cleaning up old history:', error);
      throw error;
    }
  }

  /**
   * Generate random seed for interview randomization
   * @returns {string} - Random seed
   */
  generateRandomSeed() {
    return `seed_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get question repetition patterns
   * @param {string} candidateId - Candidate ID
   * @returns {Promise<Object>} - Repetition analysis
   */
  async analyzeQuestionRepetition(candidateId) {
    try {
      const history = await this.getCandidateInterviewHistory(candidateId, 50);
      const questionFrequency = {};
      const templateFrequency = {};

      history.forEach(interview => {
        interview.questionIds.forEach(qId => {
          const qIdStr = qId.toString();
          questionFrequency[qIdStr] = (questionFrequency[qIdStr] || 0) + 1;
        });

        interview.templateIds.forEach(tId => {
          if (tId) {
            const tIdStr = tId.toString();
            templateFrequency[tIdStr] = (templateFrequency[tIdStr] || 0) + 1;
          }
        });
      });

      return {
        totalInterviews: history.length,
        questionFrequency,
        templateFrequency,
        mostRepeatedQuestions: this.getMostRepeated(questionFrequency, 5),
        mostRepeatedTemplates: this.getMostRepeated(templateFrequency, 5)
      };
    } catch (error) {
      console.error('Error analyzing question repetition:', error);
      throw error;
    }
  }

  /**
   * Get most repeated items from frequency map
   * @param {Object} frequencyMap - Frequency map
   * @param {number} limit - Maximum items to return
   * @returns {Array} - Most repeated items
   */
  getMostRepeated(frequencyMap, limit) {
    return Object.entries(frequencyMap)
      .sort(([,a], [,b]) => b - a)
      .slice(0, limit)
      .map(([id, count]) => ({ id, count }));
  }
}

export default new InterviewHistoryService();

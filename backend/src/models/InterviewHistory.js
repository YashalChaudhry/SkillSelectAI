import mongoose from 'mongoose';

const interviewHistorySchema = new mongoose.Schema({
  interviewId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  jobId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true,
    index: true
  },
  candidateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Candidate',
    required: true,
    index: true
  },
  questionIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question',
    required: true
  }],
  templateIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'QuestionTemplate',
    required: true
  }],
  scheduledAt: {
    type: Date,
    required: true,
    default: Date.now
  },
  completedAt: {
    type: Date
  },
  status: {
    type: String,
    enum: ['Scheduled', 'InProgress', 'Completed', 'Cancelled'],
    default: 'Scheduled'
  },
  metadata: {
    totalQuestions: {
      type: Number,
      required: true
    },
    difficultyDistribution: {
      Easy: { type: Number, default: 0 },
      Medium: { type: Number, default: 0 },
      Hard: { type: Number, default: 0 }
    },
    skillCoverage: [{
      skill: String,
      count: Number
    }],
    typeDistribution: {
      Conceptual: { type: Number, default: 0 },
      Technical: { type: Number, default: 0 },
      Scenario: { type: Number, default: 0 },
      Behavioral: { type: Number, default: 0 }
    },
    randomizationSeed: {
      type: String,
      required: true
    }
  },
  performance: {
    overallScore: {
      type: Number,
      min: 0,
      max: 100
    },
    questionScores: [{
      questionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Question'
      },
      score: {
        type: Number,
        min: 0,
        max: 100
      },
      feedback: String,
      evaluatedAt: {
        type: Date,
        default: Date.now
      }
    }],
    evaluatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    evaluatedAt: Date
  }
}, {
  timestamps: true
});

// Compound indexes for efficient querying
interviewHistorySchema.index({ jobId: 1, scheduledAt: -1 });
interviewHistorySchema.index({ candidateId: 1, scheduledAt: -1 });
interviewHistorySchema.index({ status: 1, scheduledAt: -1 });
interviewHistorySchema.index({ 'metadata.randomizationSeed': 1 });

// Text index for search functionality
interviewHistorySchema.index({
  interviewId: 'text',
  status: 'text'
});

// Pre-save middleware to validate data
interviewHistorySchema.pre('save', function(next) {
  // Ensure questionIds and templateIds arrays have same length
  if (this.questionIds.length !== this.templateIds.length) {
    return next(new Error('Question IDs and template IDs arrays must have the same length'));
  }

  // Validate metadata matches actual data
  if (this.metadata.totalQuestions !== this.questionIds.length) {
    this.metadata.totalQuestions = this.questionIds.length;
  }

  next();
});

// Static method to get interview history for cooldown tracking
interviewHistorySchema.statics.getRecentInterviews = function(candidateId, limit = 10) {
  return this.find({
    candidateId: new mongoose.Types.ObjectId(candidateId),
    status: { $in: ['Completed', 'InProgress'] }
  })
  .sort({ scheduledAt: -1 })
  .limit(limit)
  .select('questionIds templateIds scheduledAt metadata.randomizationSeed')
  .lean();
};

// Static method to get question usage statistics
interviewHistorySchema.statics.getQuestionUsageStats = function(questionId, days = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  return this.aggregate([
    {
      $match: {
        questionIds: new mongoose.Types.ObjectId(questionId),
        scheduledAt: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: null,
        usageCount: { $sum: 1 },
        lastUsed: { $max: '$scheduledAt' },
        uniqueCandidates: { $addToSet: '$candidateId' }
      }
    },
    {
      $project: {
        usageCount: 1,
        lastUsed: 1,
        uniqueCandidateCount: { $size: '$uniqueCandidates' }
      }
    }
  ]);
};

// Static method to get template usage statistics
interviewHistorySchema.statics.getTemplateUsageStats = function(templateId, days = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  return this.aggregate([
    {
      $match: {
        templateIds: new mongoose.Types.ObjectId(templateId),
        scheduledAt: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: null,
        usageCount: { $sum: 1 },
        lastUsed: { $max: '$scheduledAt' }
      }
    }
  ]);
};

// Instance method to check if question was used in this interview
interviewHistorySchema.methods.containsQuestion = function(questionId) {
  return this.questionIds.some(id => id.toString() === questionId.toString());
};

// Instance method to check if template was used in this interview
interviewHistorySchema.methods.containsTemplate = function(templateId) {
  return this.templateIds.some(id => id.toString() === templateId.toString());
};

// Instance method to get cooldown information
interviewHistorySchema.methods.getCooldownInfo = function(cooldownPeriod = 5) {
  const interviewsSince = [];
  const now = new Date();
  
  // This would typically be called with a list of recent interviews
  // For now, return basic cooldown info
  return {
    interviewId: this.interviewId,
    scheduledAt: this.scheduledAt,
    daysSinceScheduled: Math.floor((now - this.scheduledAt) / (1000 * 60 * 60 * 24)),
    isInCooldown: this.isInCooldown(cooldownPeriod),
    questionIds: this.questionIds,
    templateIds: this.templateIds
  };
};

// Helper method to check if interview is in cooldown period
interviewHistorySchema.methods.isInCooldown = function(cooldownPeriod) {
  const now = new Date();
  const cooldownEndDate = new Date(this.scheduledAt);
  cooldownEndDate.setDate(cooldownEndDate.getDate() + cooldownPeriod);
  return now < cooldownEndDate;
};

export default mongoose.model('InterviewHistory', interviewHistorySchema);

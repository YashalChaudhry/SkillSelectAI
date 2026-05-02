import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
  jobId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true,
    index: true,
  },
  text: {
    type: String,
    required: true,
  },
  skill: {
    type: String,
    required: true,
  },
  difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard'],
    required: true,
  },
  type: {
    type: String,
    enum: ['Conceptual', 'Scenario', 'Technical', 'Behavioral'],
    required: true,
  },
  templateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'QuestionTemplate',
  },
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected'],
    default: 'Pending',
  },
  rejectionReason: {
    type: String,
    default: '',
  },
  metadata: {
    generatedAt: {
      type: Date,
      default: Date.now,
    },
    lastModified: {
      type: Date,
      default: Date.now,
    },
    modifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    jobSkills: [{
      type: String,
    }],
    relevantTemplate: {
      type: Boolean,
      default: false,
    },
    relevanceScore: {
      type: Number,
      default: 0,
    },
    matchedSkills: [{
      type: String,
    }],
    shouldShow: {
      type: Boolean,
      default: true,
    },
  },
  version: {
    type: Number,
    default: 1,
  },
  isGenerated: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

// Index for faster querying
questionSchema.index({ jobId: 1, status: 1 });
questionSchema.index({ skill: 1, difficulty: 1 });

// Add text index for search functionality
questionSchema.index({
  text: 'text',
  skill: 'text',
}, {
  weights: {
    text: 5,
    skill: 3,
  },
  name: 'question_text_search',
});

// Pre-save hook to update version and lastModified
questionSchema.pre('save', function(next) {
  if (this.isModified()) {
    this.version += 1;
    this.metadata.lastModified = Date.now();
  }
  next();
});

export default mongoose.model('Question', questionSchema);

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

import { COMPREHENSIVE_TEMPLATES } from './seeds/questionTemplates.js';
import QuestionTemplate from './models/QuestionTemplate.js';

// After MongoDB connection is established
async function initializeDatabase() {
  try {
    const templateCount = await QuestionTemplate.countDocuments({});
    
    if (templateCount === 0) {
      console.log('📋 No templates found. Seeding...');
      await QuestionTemplate.insertMany(COMPREHENSIVE_TEMPLATES);
      console.log(`✅ Seeded ${COMPREHENSIVE_TEMPLATES.length} question templates`);
    } else {
      console.log(`✅ Found ${templateCount} existing templates`);
    }
  } catch (error) {
    console.error('❌ Error initializing templates:', error);
  }
}

// Call this after connecting to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('✅ Connected to MongoDB');
    await initializeDatabase();
    
    app.listen(process.env.PORT || 5000, () => {
      console.log(`🚀 Server running on port ${process.env.PORT || 5000}`);
    });
  })
  .catch(err => console.error('❌ MongoDB connection error:', err));
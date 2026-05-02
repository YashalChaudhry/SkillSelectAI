import mongoose from 'mongoose';

const questionTemplateSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['Conceptual', 'Scenario', 'Technical', 'Behavioral'],
    required: true,
  },
  difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard'],
    required: true,
  },
  placeholders: [{
    type: String,
    required: true,
  }],
  category: {
    type: String,
    enum: [
      'Software Engineering',
      'Frontend Development',
      'Backend Development', 
      'Full Stack Development',
      'Mobile Development',
      'Android Development',
      'iOS Development',
      'Web Development',
      'DevOps',
      'Site Reliability Engineering',
      'Cloud Engineering',
      'Quality Assurance',
      'Security Engineering',
      'Data Engineering',
      'Data Science',
      'Machine Learning Engineering',
      'Software Architecture',
      'Technical Leadership',
      'Blockchain Development',
      'AR/VR Development',
      'API Engineering',
      'Developer Experience',
      'Engineering Management',
      'Technical Program Management',
      'Product Engineering'
    ],
    default: 'Software Engineering',
  },
  skillMappings: [{
    type: String,
    required: true,
  }],
  validationRules: {
    minLength: {
      type: Number,
      default: 10,
    },
    maxLength: {
      type: Number,
      default: 200,
    },
    requiredPlaceholders: [{
      type: String,
    }],
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update the updatedAt field on save
questionTemplateSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

export default mongoose.model('QuestionTemplate', questionTemplateSchema);

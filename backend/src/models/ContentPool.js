import mongoose from 'mongoose';

const contentPoolSchema = new mongoose.Schema({
  placeholderType: {
    type: String,
    required: true,
    enum: [
      'concept', 'scenario', 'skill', 'role', 'context', 'technology', 'language', 'feature', 'pattern', 'application', 'issue', 'type', 'challenge', 'project_type', 'function_type', 'action', 'concept1', 'concept2', 'conflict', 'stakeholder', 'phase', 'process', 'team_type', 'domain', 'requirement', 'error_type', 'component', 'performance_metric', 'framework', 'task', 'constraint', 'alternative', 'criteria', 'situation',
      // New role-specific placeholders
      'platform', 'device_category', 'web_technology', 'ci_tool', 'iac_tool', 'orchestration_tool', 'service_type', 'security_control', 'security_threat', 'ml_problem', 'algorithm', 'data_visualization_tool', 'analysis_type', 'data_source', 'system_type', 'architecture_pattern', 'design_pattern', 'project_type', 'technology_stack', 'testing_framework', 'deployment_environment', 'model_type', 'workload_type', 'ml_model', 'incident_type', 'data_type', 'critical_service', 'deployment_type', 'application_type', 'cloud_provider', 'automation_tool', 'monitoring_tool', 'business_requirement', 'product_feature', 'complex_project', 'development_team', 'development_workflow', 'smart_contract_feature', 'blockchain_platform', 'ar_vr_feature', 'ar_vr_application', 'api_type', 'use_case', 'security_method', 'engineering_team', 'team_type',
      // Missing placeholders that were blocked
      'quality_aspect', 'task', 'issue', 'advanced_topic', 'resource', 'scenario', 'web_framework', 'complex_problem', 'cutting_edge_technology', 'critical_situation'
    ],
    index: true,
  },
  values: [{
    value: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      enum: [
        'Frontend', 'Backend', 'DevOps', 'Full Stack', 'General', 'JavaScript', 'React', 'Node.js', 'Architecture', 'Design Pattern', 'State Management', 'Database', 'Networking', 'Performance', 'Application', 'OOP', 'System Design', 'Algorithms', 'Security', 'Communication', 'Leadership', 'Problem Solving', 'Time Management', 'Teamwork', 'Adaptability', 'Programming',
        // New role-specific categories
        'Mobile', 'Web', 'Cloud', 'Security', 'AI', 'Architecture', 'DevOps'
      ],
      default: 'General',
    },
    difficulty: {
      type: String,
      enum: ['Easy', 'Medium', 'Hard', 'Any'],
      default: 'Any',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  }],
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
contentPoolSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Create a compound index for faster lookups
contentPoolSchema.index({ placeholderType: 1, 'values.category': 1, 'values.difficulty': 1 });

export default mongoose.model('ContentPool', contentPoolSchema);

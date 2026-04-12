import mongoose from 'mongoose';

const interviewSessionSchema = new mongoose.Schema({
  interviewId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Interview'
  },
  jobId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true
  },
  candidateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Candidate',
    required: true
  },
  sessionToken: {
    type: String,
    required: true,
    unique: true
  },
  questions: {
    type: mongoose.Schema.Types.Mixed,
    default: []
  },
  keywords: [String],
  interviewType: {
    type: String,
    enum: ['video', 'voice'],
    default: 'video'
  },
  status: {
    type: String,
    enum: ['Created', 'InProgress', 'Completed', 'Analyzing', 'Scored', 'Failed', 'PartialAnalysis'],
    default: 'Created'
  },
  // Single video for entire interview (all 10 questions together)
  videoPath: String,
  videoDuration: Number,
  recordingPath: String,
  recordingMimeType: String,
  recordingDuration: Number,
  // Analysis results from InterviewModule
  analysisTaskId: String,
  score: {
    type: Number,
    min: 0,
    max: 100
  },
  analysis: {
    type: mongoose.Schema.Types.Mixed
  },
  startedAt: Date,
  completedAt: Date,
  analyzedAt: Date
}, {
  timestamps: true
});

interviewSessionSchema.index({ candidateId: 1, jobId: 1 });
interviewSessionSchema.index({ status: 1 });

// Clear any existing model to prevent schema conflicts
if (mongoose.models.InterviewSession) {
  delete mongoose.models.InterviewSession;
}

export default mongoose.model('InterviewSession', interviewSessionSchema);
import mongoose from 'mongoose';

const interviewSchema = new mongoose.Schema({
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
  token: {
    type: String,
    required: true,
    unique: true
  },
  scheduledAt: {
    type: Date,
    required: true
  },
  googleEventId: {
    type: String
  },
  status: {
    type: String,
    enum: ['Scheduled', 'In_Progress', 'Completed', 'Cancelled'],
    default: 'Scheduled'
  },
  meetingLink: String
}, { timestamps: true });

// Prevent duplicate interviews for the same candidate on the same job
interviewSchema.index({ jobId: 1, candidateId: 1 }, { unique: true });

export default mongoose.model('Interview', interviewSchema);

import mongoose from "mongoose";
import Interview from "./Interview.js";

const jobSchema = new mongoose.Schema({
  title: String,
  description: String,
  interviewType: {
    type: String,
    enum: ['video', 'voice'],
    default: 'video'
  },
  descriptionFilePath: String,
  candidates: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Candidate" 
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: false // Made optional
  },
  status: {
    type: String,
    enum: ['Draft', 'Active', 'Closed'],
    default: 'Draft'
  }
}, { 
  timestamps: true 
});

// Cascade delete interviews when job is deleted
jobSchema.pre('deleteOne', { document: true, query: false }, async function() {
  console.log('Deleting interviews for job:', this._id);
  await Interview.deleteMany({ jobId: this._id });
});

jobSchema.pre('deleteMany', async function() {
  console.log('Deleting interviews for multiple jobs');
  const jobs = await this.model.find(this.getFilter());
  const jobIds = jobs.map(job => job._id);
  await Interview.deleteMany({ jobId: { $in: jobIds } });
});

export default mongoose.model("Job", jobSchema);
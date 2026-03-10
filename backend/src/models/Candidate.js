import mongoose from "mongoose";

const candidateSchema = new mongoose.Schema({
  name: { 
    type: String, 
    default: "Unnamed Candidate" 
  },
  email: { 
    type: String, 
    default: "" 
  },
  phone: { 
    type: String, 
    default: "" 
  },
  address: { 
    type: String, 
    default: "" 
  },
  matchScore: { 
    type: Number, 
    default: 15,
    min: 0,
    max: 100
  },
  job: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Job",
  },
  
  // CV content fields
  skills: { 
    type: String, 
    default: "" 
  },
  work_experience: { 
    type: String, 
    default: "" 
  },
  education_and_training: { 
    type: String, 
    default: "" 
  },

  // Interview results
  interviewScore: {
    type: Number,
    min: 0,
    max: 100,
    default: null
  },
  interviewAnalysis: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  },
  interviewCompletedAt: {
    type: Date,
    default: null
  }
});

export default mongoose.model("Candidate", candidateSchema);
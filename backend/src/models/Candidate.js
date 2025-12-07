import mongoose from "mongoose";

const candidateSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  address: String,
  matchScore: Number,
  job: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Job",
  },
  
  // --- THESE FIELDS MUST BE HERE ---
  skills: String,
  work_experience: String,
  education_and_training: String,
  // -------------------------
});

export default mongoose.model("Candidate", candidateSchema);
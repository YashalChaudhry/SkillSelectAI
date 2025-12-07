import mongoose from "mongoose";

const jobSchema = new mongoose.Schema({
  title: String,
  description: String,
  descriptionFilePath: String,
  candidates: [{ type: mongoose.Schema.Types.ObjectId, ref: "Candidate" }]
}, { timestamps: true });

export default mongoose.model("Job", jobSchema);

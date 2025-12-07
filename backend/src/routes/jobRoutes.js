import { Router } from "express";
import mongoose from "mongoose";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import { v4 as uuidv4 } from "uuid";
import { processCVsAndMatch } from "../services/matchingService.js";
import fs from "fs"; // <-- FIX 1: Import 'fs'

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = Router();

// Configure multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dest = path.join(__dirname, "../../uploads");
    
    // --- THIS IS THE FIX ---
    // Use mkdirSync to force the code to wait until the folder exists
    // before saving the file.
    fs.mkdirSync(dest, { recursive: true });
    // ---------------------
    
    cb(null, dest);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, uuidv4() + ext);
  }
});

const upload = multer({ storage });

import Job from "../models/Job.js";

// Single endpoint to submit job + cv files
// Get all jobs with candidates
router.get("/", async (req,res) => {
  try {
    const jobs = await Job.find().populate("candidates").lean();
    const jobsWithName = jobs.map(j => ({ ...j, name: j.title, id: j._id }));
    res.json(jobsWithName);
  } catch(err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch jobs" });
  }
});

// Update a job title/description
router.put("/:id", async (req,res) => {
  const { title, description } = req.body;
  try {
    const job = await Job.findByIdAndUpdate(req.params.id, { title, description }, { new: true }).populate("candidates").lean();
    if(!job) return res.status(404).json({ message:"Job not found"});
    res.json(job);
  } catch(err){
    console.error(err);
    res.status(500).json({ message:"Failed to update"});
  }
});

import Candidate from "../models/Candidate.js";
// Delete a job and its candidates
router.delete("/:id", async (req,res)=>{
  try{
    const id = req.params.id || req.query.id;
    if(!mongoose.Types.ObjectId.isValid(id))
      return res.status(400).json({ message: "Invalid job id"});

    // delete candidates first
    await Candidate.deleteMany({ job: id });
    await Job.findByIdAndDelete(id);
    return res.json({ message: "Job deleted"});
  }catch(err){
    console.error(err);
    res.status(500).json({ message:"Failed to delete"});
  }
});

router.post("/", upload.array("cvs", 20), async (req, res) => {
  const { title, description } = req.body;
  const cvs = req.files || [];

  // Validation
  if (!title || !description) {
    return res.status(400).json({ message: "Job title and description text are required" });
  }
  if (cvs.length === 0) {
    return res.status(400).json({ message: "Please upload at least one CV before posting the job." });
  }

  try {
    // Create job doc first
    const jobDoc = await Job.create({
      title,
      description,
      candidates: []
    });

    // Process CVs & link candidates
    const candidateIds = await processCVsAndMatch(cvs.map(f => f.path), description, jobDoc._id);
    jobDoc.candidates = candidateIds;
    await jobDoc.save();

    // Update each candidate with job reference (already set in saveCandidate)

    res.status(201).json({ message: "Job and CVs uploaded successfully", jobId: jobDoc._id, candidates: candidateIds });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error processing submission" });
  }
});

export default router;
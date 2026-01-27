// backend/src/routes/jobRoutes.js
import { Router } from "express";
import mongoose from "mongoose";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import { v4 as uuidv4 } from "uuid";
import { processCVsAndMatch } from "../services/matchingService.js";
import { generateQuestionsForJob } from "../services/questionGenerationService.js";
import fs from "fs";
import Question from "../models/Question.js";

const router = Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dest = path.join(__dirname, "../../uploads");
    fs.mkdirSync(dest, { recursive: true });
    cb(null, dest);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, uuidv4() + ext);
  }
});

const upload = multer({ storage });
import Job from "../models/Job.js";
import Candidate from "../models/Candidate.js";

// Get jobs (with optional recruiter filter)
router.get("/", async (req, res) => {
  try {
    const { recruiterId } = req.query;
    const query = {};
    
    if (recruiterId) {
      query.createdBy = recruiterId;
    }

    const jobs = await Job.find(query).populate("candidates").lean();
    const jobsWithName = jobs.map(j => ({ 
      ...j, 
      name: j.title, 
      id: j._id 
    }));
    
    res.json(jobsWithName);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch jobs" });
  }
});

// Create new job with CVs
router.post("/", upload.array("cvs", 20), async (req, res) => {
  const { title, description, createdBy } = req.body;
  const cvs = req.files || [];

  if (!title || !description) {
    return res.status(400).json({ message: "Missing required fields: title and description are required" });
  }

  try {
    // Create job document
    const jobDoc = await Job.create({
      title,
      description,
      candidates: [],
      createdBy: createdBy || new mongoose.Types.ObjectId(), // Default to a new ObjectId if not provided
      status: 'Active'
    });

    // Generate questions in background
    generateQuestionsForJob(jobDoc._id).catch(console.error);

    // Process CVs if any
    if (cvs.length > 0) {
      const candidateIds = await processCVsAndMatch(
        cvs.map(f => f.path),
        description,
        jobDoc._id
      );
      jobDoc.candidates = candidateIds;
      await jobDoc.save();
    }

    res.status(201).json({
      message: "Job created successfully",
      jobId: jobDoc._id
    });
  } catch (error) {
    console.error('Error creating job:', error);
    res.status(500).json({ message: "Error creating job" });
  }
});

// Get single job by ID
router.get("/:id", async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }
    res.json(job);
  } catch (error) {
    console.error('Error fetching job:', error);
    res.status(500).json({ message: "Error fetching job" });
  }
});

// Update job
router.put("/:id", async (req, res) => {
  const { title, description, status } = req.body;
  try {
    const job = await Job.findByIdAndUpdate(
      req.params.id,
      { title, description, status },
      { new: true }
    ).populate("candidates").lean();
    
    if (!job) return res.status(404).json({ message: "Job not found" });
    res.json(job);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update job" });
  }
});

// Delete job and its candidates
router.delete("/:id", async (req, res) => {
  try {
    const id = req.params.id || req.query.id;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid job id" });
    }

    // Delete candidates first
    await Candidate.deleteMany({ job: id });
    await Job.findByIdAndDelete(id);
    
    // Note: You might want to delete associated questions as well
    // await Question.deleteMany({ jobId: id });
    
    res.json({ message: "Job deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete job" });
  }
});

// Bulk generate questions for all existing jobs (backfill)
router.post("/generate-bulk", async (req, res) => {
  try {
    console.log("Starting bulk question generation for all jobs...");
    
    // Fetch ALL jobs from database
    const allJobs = await Job.find({});
    console.log(`Found ${allJobs.length} jobs to process`);
    
    let processedJobs = 0;
    let skippedJobs = 0;
    let generatedQuestions = 0;
    
    // Process each job
    for (const job of allJobs) {
      try {
        // Check if this job already has questions
        const existingQuestions = await Question.countDocuments({ jobId: job._id });
        
        if (existingQuestions >= 30) {
          console.log(`Job ${job.title} already has ${existingQuestions} questions - skipping`);
          skippedJobs++;
          continue;
        }
        
        // If questions exist but count is wrong, delete them first
        if (existingQuestions > 0) {
          console.log(`Deleting ${existingQuestions} existing questions for job ${job.title}`);
          await Question.deleteMany({ jobId: job._id });
        }
        
        // Generate fresh questions (10/10/10 distribution)
        console.log(`Generating questions for job: ${job.title}`);
        const result = await generateQuestionsForJob(job._id);
        
        if (result.success) {
          processedJobs++;
          generatedQuestions += result.relevantCount || 0;
          console.log(`✅ Generated ${result.relevantCount} questions for ${job.title}`);
        } else {
          console.log(`❌ Failed to generate questions for ${job.title}: ${result.message}`);
        }
        
      } catch (jobError) {
        console.error(`Error processing job ${job.title}:`, jobError);
      }
    }
    
    res.json({
      message: "Bulk question generation completed",
      summary: {
        totalJobs: allJobs.length,
        processedJobs,
        skippedJobs,
        generatedQuestions,
        successRate: processedJobs > 0 ? (processedJobs / (processedJobs + skippedJobs)) * 100 : 0
      }
    });
    
  } catch (error) {
    console.error('Bulk generation error:', error);
    res.status(500).json({ 
      message: "Bulk question generation failed", 
      error: error.message 
    });
  }
});

export default router;
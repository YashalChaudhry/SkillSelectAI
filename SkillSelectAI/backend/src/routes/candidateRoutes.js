import { Router } from "express";
import { getAllCandidates, getAllCandidatesUnfiltered, cleanupInvalidCandidates } from "../services/candidateService.js";

const router = Router();

// Return shortlisted candidates only (40%+ match score)
router.get("/", async (req, res) => {
  try {
    const list = await getAllCandidates();
    res.json(list);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch candidates" });
  }
});

// Return ALL candidates including non-shortlisted (for admin/review)
router.get("/all", async (req, res) => {
  try {
    const list = await getAllCandidatesUnfiltered();
    res.json(list);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch all candidates" });
  }
});

// Clean up old invalid candidates (0% score or unnamed)
router.delete("/cleanup", async (req, res) => {
  try {
    const deletedCount = await cleanupInvalidCandidates();
    res.json({ 
      success: true, 
      message: `Cleaned up ${deletedCount} invalid candidates`,
      deletedCount 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to cleanup candidates" });
  }
});

export default router;

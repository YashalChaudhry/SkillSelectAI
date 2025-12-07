import { Router } from "express";
import { getAllCandidates } from "../services/candidateService.js";

const router = Router();

// Return list of candidate profiles
router.get("/", async (req, res) => {
  try {
    const list = await getAllCandidates();
    res.json(list);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch candidates" });
  }
});

export default router;

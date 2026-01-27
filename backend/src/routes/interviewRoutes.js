import express from 'express';
import { processInvitesForJob } from '../services/schedulerService.js';
import { startInterview } from '../controllers/interviewController.js';

const router = express.Router();

router.post('/send-invites', async (req, res) => {
  try {
    const { jobId } = req.body;

    if (!jobId) {
      return res.status(400).json({ message: "Job ID is required" });
    }

    const interviews = await processInvitesForJob(jobId);

    res.status(200).json({
      success: true,
      message: `Successfully scheduled ${interviews.length} interviews.`,
      data: interviews
    });

  } catch (error) {
    // Handle the "Only Clicked Once" error specifically
    if (error.message.includes("already been sent")) {
      return res.status(409).json({ message: error.message }); // 409 Conflict
    }
    console.error(error);
    res.status(500).json({ message: "Scheduling failed", error: error.message });
  }
});

// Interview start validation endpoint
router.get('/start', startInterview);

export default router;

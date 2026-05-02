import express from 'express';
import { processInvitesForJob } from '../services/schedulerService.js';
import { startInterview } from '../controllers/interviewController.js';

const router = express.Router();

// POST /api/interviews/send-invites
router.post('/send-invites', async (req, res) => {
  try {
    const { jobId } = req.body;

    console.log('📧 Received send-invites request for jobId:', jobId);

    if (!jobId) {
      return res.status(400).json({ 
        success: false,
        message: "Job ID is required" 
      });
    }

    const interviews = await processInvitesForJob(jobId);

    console.log(`✅ Successfully scheduled ${interviews.length} interviews`);

    return res.status(200).json({
      success: true,
      message: `Successfully scheduled ${interviews.length} interviews.`,
      data: interviews
    });

  } catch (error) {
    console.error('❌ Error in send-invites:', error.message);
    
    if (error.message.includes("already been sent")) {
      return res.status(409).json({ 
        success: false,
        message: error.message 
      });
    }
    
    return res.status(500).json({ 
      success: false,
      message: "Failed to send invites",
      error: error.message 
    });
  }
});

// GET /api/interviews/start
router.get('/start', startInterview);

export default router;

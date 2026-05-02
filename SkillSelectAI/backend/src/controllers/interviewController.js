import { validateSession } from '../services/interviewValidationService.js';

export const startInterview = async (req, res) => {
  try {
    const { token } = req.query;
    
    if (!token) {
      return res.status(400).json({ 
        success: false, 
        message: 'Token is required' 
      });
    }
    
    const interview = await validateSession(token);
    
    res.status(200).json({
      success: true,
      message: 'Interview session started successfully',
      data: {
        interviewId: interview._id,
        candidateId: interview.candidateId,
        jobId: interview.jobId,
        scheduledAt: interview.scheduledAt,
        token: token // Include token for interview session initialization
      }
    });
    
  } catch (error) {
    console.error('Interview validation error:', error);
    
    // Return specific error for expired links
    if (error.message.includes('LINK EXPIRED')) {
      return res.status(403).json({
        success: false,
        message: error.message
      });
    }
    
    // Handle other errors
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to validate interview session'
    });
  }
};

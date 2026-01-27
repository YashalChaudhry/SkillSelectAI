import Interview from '../models/Interview.js';

export const validateSession = async (token) => {
  // Find the interview by token
  const interview = await Interview.findOne({ token });
  
  if (!interview) {
    throw new Error('Interview not found');
  }
  
  // Block if interview is already in progress or completed
  if (interview.status === 'In_Progress' || interview.status === 'Completed') {
    throw new Error('LINK EXPIRED. You have already used this one-time link.');
  }
  
  // Allow only if status is 'Scheduled', then update to 'In_Progress'
  if (interview.status === 'Scheduled') {
    interview.status = 'In_Progress';
    await interview.save();
    return interview;
  }
  
  // Handle any other unexpected status
  throw new Error('Invalid interview status');
};

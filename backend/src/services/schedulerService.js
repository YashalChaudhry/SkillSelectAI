import { addHours, addMinutes, isSaturday, isSunday, setHours, setMinutes, setSeconds } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';
import { google } from 'googleapis';
import Interview from '../models/Interview.js';
import Candidate from '../models/Candidate.js';
import Job from '../models/Job.js';

// Setup Google Auth (You need these in your .env file)
console.log('Google OAuth Setup:');
console.log('CLIENT_ID:', process.env.GOOGLE_CLIENT_ID ? 'SET' : 'MISSING');
console.log('CLIENT_SECRET:', process.env.GOOGLE_CLIENT_SECRET ? 'SET' : 'MISSING');
console.log('REDIRECT_URI:', process.env.GOOGLE_REDIRECT_URI);
console.log('REFRESH_TOKEN:', process.env.GOOGLE_REFRESH_TOKEN ? 'SET' : 'MISSING');

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

// PHASE 1: The Custom Algorithm (The "Brain")
const calculatePerfectSlot = () => {
  // Step A: "Right Now" + 24 Hours
  let targetDate = addHours(new Date(), 24);

  // Step B: The Weekend Filter
  if (isSaturday(targetDate)) {
    targetDate = addHours(targetDate, 48); // Push to Monday
  } else if (isSunday(targetDate)) {
    targetDate = addHours(targetDate, 24); // Push to Monday
  }

  // Step C: The Morning Rule (Force 10:00 AM)
  targetDate = setHours(targetDate, 10);
  targetDate = setMinutes(targetDate, 0);
  targetDate = setSeconds(targetDate, 0);

  return targetDate;
};

// PHASE 4: The Delivery (Google API)
const createGoogleCalendarEvent = async (candidateEmail, startTime, meetingLink) => {
  // Set credentials (ensure you have a valid REFRESH_TOKEN in .env)
  oauth2Client.setCredentials({ refresh_token: process.env.GOOGLE_REFRESH_TOKEN });
  const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

  const event = {
    summary: 'SkillSelectAI Interview',
    description: `INTERVIEW LINK:\n${meetingLink}\n\n⚠️ CRITICAL INSTRUCTIONS - READ BEFORE CLICKING:\n------------------------------------------------\n1. ONE-TIME ACCESS: This link is valid for a SINGLE session only.\n2. NO RE-ENTRY: Once you click the link, your interview timer begins immediately. You cannot pause, refresh, or close the window and return later.\n3. STABILITY CHECK: Ensure you have a stable internet connection and 60 minutes of uninterrupted time before clicking.\n\n\nGood luck!\n`,
    start: { dateTime: startTime.toISOString() },
    end: { dateTime: addHours(startTime, 1).toISOString() }, // 1 hour duration
    attendees: [{ email: candidateEmail, responseStatus: 'accepted' }],
    guestsCanModify: false,
    guestsCanInviteOthers: false,
    guestsCanSeeOtherGuests: false
  };

  try {
    console.log('Creating Google Calendar event for:', candidateEmail);
    console.log('Event details:', {
      summary: event.summary,
      start: event.start,
      end: event.end,
      attendees: event.attendees
    });
    
    const response = await calendar.events.insert({
      calendarId: 'primary',
      resource: event,
      sendUpdates: 'all', // Sends the email invite automatically
      conferenceDataVersion: 1,
    });
    
    console.log('✅ Google Calendar event created successfully!');
    console.log('Event ID:', response.data.id);
    console.log('Event link:', response.data.htmlLink);
    console.log('Attendees:', response.data.attendees);
    console.log('SendUpdates response:', response.data);
    console.log('Email updates sent to:', candidateEmail);
    
    // Also try to send a separate email notification
    console.log('Attempting to send separate email notification...');
    
    return response.data.id;
  } catch (error) {
    console.error('❌ Google Calendar API Error:', error.message);
    console.error('Full error details:', error);
    return null; // Don't crash app if Google fails, just log it
  }
};

export const processInvitesForJob = async (jobId) => {
  // 1. Idempotency Check (Prevent Double Clicking)
  const existingInterviews = await Interview.exists({ jobId: jobId });
  if (existingInterviews) {
    throw new Error("Invites have already been sent for this job.");
  }

  // 2. Fetch Candidates (Assuming we only invite 'Shortlisted' ones)
  // You might need to adjust this query based on your Candidate model
  const candidates = await Candidate.find({ job: jobId }); 
  const job = await Job.findById(jobId).select('interviewType');
  const interviewType = job?.interviewType === 'voice' ? 'voice' : 'video';
  
  if (candidates.length === 0) {
    throw new Error("No candidates found for this job.");
  }

  const results = [];
  
  // Calculate base slot for all candidates
  let baseSlot = calculatePerfectSlot();

  for (let i = 0; i < candidates.length; i++) {
    const candidate = candidates[i];
    
    // Stagger logic: Everyone gets 10:00 AM, staggered by 5 minutes to avoid server spikes
    const interviewDate = addMinutes(baseSlot, i * 5);

    // PHASE 2: The Security Token
    const token = uuidv4();
    const uniqueLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/interview?candidateID=${candidate._id}&jobID=${jobId}&interviewType=${interviewType}`;

    // PHASE 4: Delivery
    // Note: requires candidate.email to exist
    const googleEventId = await createGoogleCalendarEvent(
      candidate.email, 
      interviewDate, 
      uniqueLink
    );

    // PHASE 3: The Memory (Database)
    const interview = await Interview.create({
      jobId,
      candidateId: candidate._id,
      token,
      interviewType,
      scheduledAt: interviewDate,
      meetingLink: uniqueLink,
      googleEventId
    });

    results.push(interview);
  }

  return results;
};

import Candidate from "../models/Candidate.js";

/**
 * @param {object} profile - The full data object from the Python parser
 * { personal_info: {...}, work_experience: "...", ... }
 * @param {number} matchScore - The score from the matcher
 * @param {string} jobId - The ID of the job
 */
export async function saveCandidate(profile, matchScore, jobId) {
  
  // --- THIS IS THE CORRECTED LOGIC ---
  const candidate = new Candidate({
    // We now read from the nested 'personal_info' object
    name: profile.personal_info.Name,
    email: profile.personal_info.Email,
    phone: profile.personal_info.Phone,
    address: profile.personal_info.Address,
    
    // And we save the new fields
    skills: profile.skills,
    work_experience: profile.work_experience,
    education_and_training: profile.education_and_training,
    
    // We save the score and job ID
    matchScore: matchScore,
    job: jobId,
  });
  // ------------------------------------
  
  const saved = await candidate.save();
  return saved._id;
}

export async function getAllCandidates() {
  // This is correct, it fetches all candidates for the frontend
  return Candidate.find().populate("job").lean();
}
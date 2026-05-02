import Candidate from "../models/Candidate.js";

/**
 * @param {object} profile - The full data object from the Python parser
 * { personal_info: {...}, work_experience: "...", ... }
 * @param {number} matchScore - The score from the matcher
 * @param {string} jobId - The ID of the job
 */
export async function saveCandidate(profile, matchScore, jobId) {
  const MIN_SCORE = 15;
  
  // Safely extract personal info with defaults
  const personalInfo = profile?.personal_info || {};
  
  // Ensure matchScore is valid
  const validScore = (typeof matchScore === 'number' && !isNaN(matchScore)) 
    ? Math.max(MIN_SCORE, Math.min(100, matchScore))
    : MIN_SCORE;

  const candidate = new Candidate({
    // We now read from the nested 'personal_info' object with fallbacks
    name: personalInfo.Name || personalInfo.name || "Unnamed Candidate",
    email: personalInfo.Email || personalInfo.email || "",
    phone: personalInfo.Phone || personalInfo.phone || "",
    address: personalInfo.Address || personalInfo.address || "",
    
    // And we save the new fields with fallbacks
    skills: profile?.skills || "",
    work_experience: profile?.work_experience || "",
    education_and_training: profile?.education_and_training || "",
    
    // We save the validated score and job ID
    matchScore: validScore,
    job: jobId,
  });
  
  const saved = await candidate.save();
  return saved._id;
}

export async function getAllCandidates() {
  // Filter out candidates with <40% score (not shortlisted), 0% score, or no name
  return Candidate.find({
    matchScore: { $gte: 40 },  // Only show shortlisted candidates (40%+)
    name: { $nin: ["Unnamed Candidate", ""], $exists: true }
  }).populate("job").lean();
}

/**
 * Get ALL candidates including non-shortlisted (for admin/debugging)
 */
export async function getAllCandidatesUnfiltered() {
  return Candidate.find({
    matchScore: { $gt: 0 },
    name: { $nin: ["Unnamed Candidate", ""], $exists: true }
  }).populate("job").lean();
}

/**
 * Clean up old invalid candidates from database
 * Only removes truly invalid entries (0% or null score, unnamed)
 */
export async function cleanupInvalidCandidates() {
  const result = await Candidate.deleteMany({
    $or: [
      { matchScore: { $lte: 0 } },
      { matchScore: null },
      { matchScore: { $exists: false } },
      { name: "Unnamed Candidate" },
      { name: { $exists: false } },
      { name: "" },
      { name: null }
    ]
  });
  return result.deletedCount;
}
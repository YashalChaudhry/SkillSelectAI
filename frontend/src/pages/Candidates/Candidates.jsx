import React from "react";
import "./Candidates.css"; // Your CSS file
import { FormControl, InputLabel, MenuItem, Select } from "@mui/material";

// This is the main component that manages the view
const Candidates = () => {
  const [view, setView] = React.useState("list"); // 'list' or 'detail'
  const [selectedCandidate, setSelectedCandidate] = React.useState(null);

  const handleSelectCandidate = (candidate) => {
    setSelectedCandidate(candidate);
    setView("detail");
  };

  const handleBackToList = () => {
    setSelectedCandidate(null);
    setView("list");
  };

  // When you first load, go to the list view
  if (view === "list") {
    return <CandidateListPage onSelectCandidate={handleSelectCandidate} />;
  }

  // When you click a candidate, show this
  if (view === "detail" && selectedCandidate) {
    return <CandidateDetailPage candidate={selectedCandidate} onBack={handleBackToList} />;
  }
};

// --- 1. THE LIST PAGE (Your original component) ---
const CandidateListPage = ({ onSelectCandidate }) => {
  const [jobs, setJobs] = React.useState([]);
  const [candidates, setCandidates] = React.useState([]);
  const [selectedJob, setSelectedJob] = React.useState("");
  const [loading, setLoading] = React.useState(true); // Added loading state

  // Fetch all jobs
  React.useEffect(() => {
    fetch("http://localhost:5000/api/jobs")
      .then((res) => res.json())
      .then((data) => setJobs(data))
      .catch((err) => console.error("Error fetching jobs:", err));
  }, []);

  // Fetch all candidates
  React.useEffect(() => {
    fetch("http://localhost:5000/api/candidates")
      .then((res) => res.json())
      .then((data) => {
        setCandidates(data);
        setLoading(false); // Stop loading
      })
      .catch((err) => {
        console.error("Error fetching candidates:", err);
        setLoading(false); // Stop loading even on error
      });
  }, []);

  // Filter candidates by selected job (if selected)
  const filteredCandidates = React.useMemo(() => {
    if (!selectedJob) return candidates; // show all
    return candidates.filter((c) => {
      if (!c.job) return false;
      if (typeof c.job === "string") return c.job === selectedJob;
      if (c.job._id) return c.job._id === selectedJob;
      return false;
    });
  }, [candidates, selectedJob]);

  return (
    <div className="candidates-page">
      <div className="main-content">
        <h1 className="heading">CANDIDATES</h1>

        {/* Dropdown filter (No changes) */}
        <div className="select-job-box">
          <FormControl fullWidth>
            <InputLabel
              sx={{
                color: "#d7c8f3",
                "&.Mui-focused": { color: "#bfa8f8" },
              }}
            >
              Filter by Job
            </InputLabel>
            <Select
              value={selectedJob}
              label="Filter by Job"
              onChange={(e) => setSelectedJob(e.target.value)}
              MenuProps={{
                PaperProps: {
                  sx: {
                    bgcolor: "#2e2440",
                    color: "#e1d8f7",
                  },
                },
              }}
              sx={{
                color: "#e1d8f7",
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#6a4caf",
                },
                "&:hover .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#a88bff",
                },
                "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#bfa8f8",
                },
              }}
            >
              <MenuItem value="">
                <em>All Jobs</em>
              </MenuItem>
              {jobs.map((j) => (
                <MenuItem key={j._id} value={j._id}>
                  {j.title}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </div>

        {/* Candidate Cards */}
        <div className="cards-container">
          {loading ? (
            <p>Loading candidates...</p>
          ) : filteredCandidates.length === 0 ? (
            <p>No candidates found for this job.</p>
          ) : (
            // --- UI STRUCTURE UPDATED TO MATCH YOUR CSS ---
            filteredCandidates.map((c) => (
              <div 
                key={c._id} 
                className="candidate-card"
                onClick={() => onSelectCandidate(c)} // Added onClick
              >
                {/* Avatar Placeholder */}
                <div className="candidate-avatar">
                  {/* Avatar circle from your CSS */}
                  {c.name ? c.name[0].toUpperCase() : "C"}
                </div>
                
                {/* Info Container */}
                <div className="candidate-info">
                  <div className="name">
                    {c.name || c.email || "Unnamed Candidate"}
                  </div>
                  <div className="job">
                    {c.job?.title || c.job?._id || "Unknown"}
                  </div>
                  <div className="score">
                    <strong>Match Score:</strong>{" "}
                    {c.matchScore ? `${c.matchScore.toFixed(1)}%` : "N/A"}
                  </div>
                </div>
              </div>
            ))
            // --- UI STRUCTURE UPDATED ABOVE ---
          )}
        </div>
      </div>
    </div>
  );
};


// --- 2. THE NEW DETAIL PAGE ---
const CandidateDetailPage = ({ candidate, onBack }) => {

  // Helper to format text blocks (like skills, work ex)
  const formatTextBlock = (text) => {
    if (!text) return <p className="detail-value-empty">No information provided.</p>;
    // Split by newline and render each line in a <p> tag
    return text.split('\n').map((line, index) => (
      <p key={index} className="detail-value-multiline">
        {line || <span>&nbsp;</span>} {/* Render an empty space for blank lines */}
      </p>
    ));
  };

  return (
    <div className="candidates-page detail-page">
      <div className="main-content">
        {/* Back Button */}
        <button onClick={onBack} className="back-button">
          &larr; Back to List
        </button>

        {/* Profile Header */}
        <div className="detail-header-card">
          <div className="detail-avatar">
            {candidate.name ? candidate.name[0].toUpperCase() : 'C'}
          </div>
          <div className="detail-header-info">
            <h1 className="detail-name">{candidate.name}</h1>
            <p className="detail-job-title">Applied for: {candidate.job?.title || 'N/A'}</p>
          </div>
          <div className="detail-score-box">
             <div className="detail-score-label">Match Score</div>
             <div className="detail-score-value">
               {candidate.matchScore ? `${candidate.matchScore.toFixed(1)}%` : "N/A"}
             </div>
          </div>
        </div>

        {/* Parsed Info Container */}
        <div className="detail-info-grid">
          
          {/* Contact Card */}
          <div className="detail-info-card">
            <h2 className="detail-title">Contact Information</h2>
            <div className="detail-info-row">
              <span className="detail-label">Email</span>
              <span className="detail-value">{candidate.email}</span>
            </div>
            <div className="detail-info-row">
              <span className="detail-label">Phone</span>
              <span className="detail-value">{candidate.phone || '-'}</span>
            </div>
            {/* THIS IS ONE OF THE MISSING FIELDS */}
            <div className="detail-info-row">
              <span className="detail-label">Address</span>
              <span className="detail-value">{candidate.address || '-'}</span>
            </div>
          </div>
          
          {/* Skills Card */}
          <div className="detail-info-card">
            <h2 className="detail-title">Skills</h2>
            <div className="detail-text-block">
              {formatTextBlock(candidate.skills)}
            </div>
          </div>
          
          {/* THIS IS ONE OF THE MISSING FIELDS */}
          <div className="detail-info-card full-width">
            <h2 className="detail-title">Work Experience</h2>
            <div className="detail-text-block">
              {formatTextBlock(candidate.work_experience)}
            </div>
          </div>
          
          {/* THIS IS ONE OF THE MISSING FIELDS */}
          <div className="detail-info-card full-width">
            <h2 className="detail-title">Education & Training</h2>
            <div className="detail-text-block">
              {formatTextBlock(candidate.education_and_training)}
            </div>
          </div>

        </div>
        
      </div>
    </div>
  );
};

export default Candidates;
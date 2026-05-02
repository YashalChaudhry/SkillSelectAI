import React from "react";
import "./Ranking.css";
import { FormControl, InputLabel, MenuItem, Select } from "@mui/material";
import Lottie from "lottie-react";
import waitingAnimation from "../../assets/lottie/waiting.json";

const Ranking = () => {
  const [jobs, setJobs] = React.useState([]);
  const [candidates, setCandidates] = React.useState([]);
  const [selectedJobId, setSelectedJobId] = React.useState("");
  const [jobsLoading, setJobsLoading] = React.useState(true);
  const [candidatesLoading, setCandidatesLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  const [selectedCandidate, setSelectedCandidate] = React.useState(null);

  React.useEffect(() => {
    const fetchJobs = async () => {
      try {
        setJobsLoading(true);
        const res = await fetch("http://localhost:5000/api/jobs");
        const data = await res.json();
        setJobs(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Error fetching jobs for ranking:", err);
        setError("Failed to load jobs");
      } finally {
        setJobsLoading(false);
      }
    };

    fetchJobs();
  }, []);

  React.useEffect(() => {
    const fetchCandidates = async () => {
      try {
        setCandidatesLoading(true);
        const res = await fetch("http://localhost:5000/api/candidates");
        const data = await res.json();
        setCandidates(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Error fetching candidates for ranking:", err);
        setError("Failed to load candidates");
      } finally {
        setCandidatesLoading(false);
      }
    };

    fetchCandidates();
  }, []);

  const rankedCandidates = React.useMemo(() => {
    if (!selectedJobId) return [];

    const belongsToJob = (candidate) => {
      if (!candidate.job) return false;
      if (typeof candidate.job === "string") return candidate.job === selectedJobId;
      if (candidate.job._id) return candidate.job._id === selectedJobId;
      return false;
    };

    const hasCompletedInterview = (candidate) => {
      return typeof candidate.interviewScore === "number";
    };

    return candidates
      .filter((c) => belongsToJob(c) && hasCompletedInterview(c))
      .slice()
      .sort((a, b) => (b.interviewScore || 0) - (a.interviewScore || 0));
  }, [candidates, selectedJobId]);

  const handleCloseModal = () => {
    setSelectedCandidate(null);
  };

  return (
    <div className="rank-container">
      <header className="rank-header">
        <h1 className="rank-title">
          Candidate <span className="rank-gradient-text">Ranking</span>
        </h1>
        <p className="rank-subtitle">
          Select a job to view AI-ranked candidates based on their interview performance.
        </p>
      </header>

      <div className="rank-controls-row">
        <div className="rank-controls-left">
          <h2 className="rank-section-title">Job Selection</h2>
          <p className="rank-section-helper">
            Choose a job to see candidates who have completed the AI interview, automatically ranked from highest to lowest score.
          </p>
        </div>
        <div className="rank-controls-right">
          <FormControl fullWidth size="small">
            <InputLabel
              sx={{
                color: "#6B7280",
                "&.Mui-focused": { color: "#7C3AED" },
              }}
            >
              Select Job
            </InputLabel>
            <Select
              value={selectedJobId}
              label="Select Job"
              onChange={(e) => setSelectedJobId(e.target.value)}
              MenuProps={{
                PaperProps: {
                  sx: {
                    bgcolor: "#FFFFFF",
                    color: "#111827",
                    border: "1px solid #E5E7EB",
                  },
                },
              }}
              sx={{
                color: "#111827",
                height: "48px",
                bgcolor: "#FFFFFF",
                borderRadius: "12px",
                minWidth: 340,
                maxWidth: 480,
                width: "100%",
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#E5E7EB",
                  borderRadius: "12px",
                },
                "&:hover .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#7C3AED",
                },
                "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#7C3AED",
                },
              }}
            >
              <MenuItem value="" disabled={jobsLoading || jobs.length === 0}>
                {jobsLoading ? "Loading jobs..." : jobs.length === 0 ? "No jobs available" : "Select a job"}
              </MenuItem>
              {jobs.map((job) => (
                <MenuItem key={job._id || job.id} value={job._id || job.id}>
                  {job.title || job.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </div>
      </div>

      {error && (
        <div className="rank-error">
          {error}
        </div>
      )}

      {!selectedJobId && (
        <div className="rank-placeholder">
          <div className="rank-placeholder-icon">★</div>
          <h3>Select a job to view candidate rankings</h3>
          <p>
            Use the dropdown above to pick a job. You will see candidates who have completed the AI interview, ranked by their interview score.
          </p>
        </div>
      )}

      {selectedJobId && (
        <div className="rank-results">
          {candidatesLoading ? (
            <div className="rank-loading">
              <p>Loading ranked candidates...</p>
            </div>
          ) : rankedCandidates.length === 0 ? (
            <div className="rank-empty">
              <div className="rank-empty-icon">?</div>
              <h3>No completed AI interviews yet</h3>
              <p>
                Once candidates complete their AI interview for this job, they will appear here automatically ranked by score.
              </p>
            </div>
          ) : (
            <div className="rank-grid">
              {rankedCandidates.map((c, index) => {
                const rank = index + 1;
                const isTop = rank <= 3;
                const topClass = isTop ? `rank-card-top rank-card-top-${rank}` : "";

                return (
                  <div
                    key={c._id}
                    className={`rank-card ${topClass}`}
                    onClick={() => setSelectedCandidate({ ...c, rank })}
                    style={{ animationDelay: `${index * 0.04}s` }}
                  >
                    <div className="rank-card-rank">#{rank}</div>
                    <div className="rank-card-main">
                      <div className="rank-card-name">{c.name || "Unnamed Candidate"}</div>
                      <div className="rank-card-meta">
                        <span className="rank-card-job">{c.job?.title || "Unknown Position"}</span>
                      </div>
                    </div>
                    <div className="rank-card-score">
                      <span className="rank-card-score-label">AI Score</span>
                      <span className="rank-card-score-value">
                        {typeof c.interviewScore === "number" ? `${c.interviewScore.toFixed(0)} / 100` : "N/A"}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {selectedCandidate && (
        <div className="rank-modal-overlay" onClick={handleCloseModal}>
          <div className="rank-modal" onClick={(e) => e.stopPropagation()}>
            <button className="rank-modal-close" onClick={handleCloseModal}>
              <span>&times;</span>
            </button>
            <div className="rank-modal-header">
              <span className="rank-modal-badge">#{selectedCandidate.rank}</span>
              <h2>{selectedCandidate.name || "Candidate Details"}</h2>
              <p className="rank-modal-subtitle">Use these details to quickly contact the candidate.</p>
            </div>
            <div className="rank-modal-body">
              <div className="rank-modal-field">
                <label>Candidate Name</label>
                <p>{selectedCandidate.name || "N/A"}</p>
              </div>
              <div className="rank-modal-field">
                <label>Email</label>
                <p>{selectedCandidate.email || "Not provided"}</p>
              </div>
              <div className="rank-modal-field">
                <label>Phone</label>
                <p>{selectedCandidate.phone || "Not provided"}</p>
              </div>
              <div className="rank-modal-field">
                <label>AI Interview Score</label>
                <p className="rank-modal-score">
                  {typeof selectedCandidate.interviewScore === "number"
                    ? `${selectedCandidate.interviewScore.toFixed(0)} / 100`
                    : "N/A"}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {!selectedJobId && (
        <div className="rank-waiting-lottie" aria-hidden="true">
          <Lottie
            animationData={waitingAnimation}
            loop
            autoplay
            rendererSettings={{ preserveAspectRatio: "xMidYMid meet" }}
            style={{ width: "100%", height: "100%" }}
          />
        </div>
      )}
    </div>
  );
};

export default Ranking;

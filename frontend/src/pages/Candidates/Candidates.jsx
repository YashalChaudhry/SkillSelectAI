import React from "react";
import "./Candidates.css";
import { FormControl, InputLabel, MenuItem, Select } from "@mui/material";

const Candidates = () => {
  const [view, setView] = React.useState("list");
  const [selectedCandidate, setSelectedCandidate] = React.useState(null);

  const handleSelectCandidate = (candidate) => {
    setSelectedCandidate(candidate);
    setView("detail");
  };

  const handleBackToList = () => {
    setSelectedCandidate(null);
    setView("list");
  };

  if (view === "list") {
    return <CandidateListPage onSelectCandidate={handleSelectCandidate} />;
  }

  if (view === "detail" && selectedCandidate) {
    return <CandidateDetailPage candidate={selectedCandidate} onBack={handleBackToList} />;
  }
};

// --- LIST PAGE ---
const CandidateListPage = ({ onSelectCandidate }) => {
  const [jobs, setJobs] = React.useState([]);
  const [candidates, setCandidates] = React.useState([]);
  const [selectedJob, setSelectedJob] = React.useState("");
  const [loading, setLoading] = React.useState(true);
  const [searchTerm, setSearchTerm] = React.useState("");

  React.useEffect(() => {
    fetch("http://localhost:5000/api/jobs")
      .then((res) => res.json())
      .then((data) => setJobs(data))
      .catch((err) => console.error("Error fetching jobs:", err));
  }, []);

  React.useEffect(() => {
    fetch("http://localhost:5000/api/candidates")
      .then((res) => res.json())
      .then((data) => {
        setCandidates(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching candidates:", err);
        setLoading(false);
      });
  }, []);

  const filteredCandidates = React.useMemo(() => {
    let result = candidates;
    if (selectedJob) {
      result = result.filter((c) => {
        if (!c.job) return false;
        if (typeof c.job === "string") return c.job === selectedJob;
        if (c.job._id) return c.job._id === selectedJob;
        return false;
      });
    }
    if (searchTerm) {
      result = result.filter((c) =>
        (c.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.email || "").toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    return result;
  }, [candidates, selectedJob, searchTerm]);

  const getScoreColor = (score) => {
    if (score >= 70) return "#22c55e";
    if (score >= 50) return "#eab308";
    return "#a855f7";
  };

  return (
    <div className="cand-container">
      {/* Header */}
      <header className="cand-header">
        <h1 className="cand-title">
          Candidate <span className="cand-gradient-text">Pool</span>
        </h1>
        <p className="cand-subtitle">
          Review and manage candidates with AI-powered insights
        </p>
      </header>

      {/* Filters Row */}
      <div className="cand-filters">
        <div className="cand-search-box">
          <input
            type="text"
            className="cand-search-input"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="cand-filter-box">
          <FormControl fullWidth size="small">
            <InputLabel
              sx={{
                color: "#a0a0b0",
                "&.Mui-focused": { color: "#a855f7" },
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
                    bgcolor: "#1a1625",
                    color: "#e1d8f7",
                    border: "1px solid rgba(255,255,255,0.1)",
                  },
                },
              }}
              sx={{
                color: "#fff",
                height: "48px",
                bgcolor: "rgba(0, 0, 0, 0.3)",
                borderRadius: "12px",
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: "rgba(255,255,255,0.1)",
                  borderRadius: "12px",
                },
                "&:hover .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#a855f7",
                },
                "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#a855f7",
                },
              }}
            >
              <MenuItem value="">All Jobs</MenuItem>
              {jobs.map((j) => (
                <MenuItem key={j._id} value={j._id}>
                  {j.title}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </div>
        <div className="cand-count-badge">
          {filteredCandidates.length} Candidate{filteredCandidates.length !== 1 ? "s" : ""}
        </div>
      </div>

      {/* Candidate Grid */}
      <div className="cand-grid">
        {loading ? (
          <div className="cand-loading">
            <div className="cand-spinner"></div>
            <p>Loading candidates...</p>
          </div>
        ) : filteredCandidates.length === 0 ? (
          <div className="cand-empty">
            <div className="cand-empty-icon">?</div>
            <h3>No Candidates Found</h3>
            <p>Try adjusting your filters or check back later</p>
          </div>
        ) : (
          filteredCandidates.map((c, index) => (
            <div
              key={c._id}
              className="cand-card"
              onClick={() => onSelectCandidate(c)}
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <div className="cand-card-top">
                <div className="cand-avatar">
                  {c.name ? c.name[0].toUpperCase() : "C"}
                </div>
                <div className="cand-card-info">
                  <h3 className="cand-name">{c.name || "Unnamed Candidate"}</h3>
                  <p className="cand-email">{c.email || "No email"}</p>
                </div>
              </div>
              <div className="cand-card-bottom">
                <div className="cand-job-tag">
                  {c.job?.title || "Unknown Position"}
                </div>
                <div
                  className="cand-score"
                  style={{
                    background: `linear-gradient(135deg, ${getScoreColor(c.matchScore)}22, ${getScoreColor(c.matchScore)}44)`,
                    color: getScoreColor(c.matchScore),
                    borderColor: getScoreColor(c.matchScore),
                  }}
                >
                  {typeof c.matchScore === "number"
                    ? `${c.matchScore.toFixed(0)}%`
                    : "N/A"}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};


// --- DETAIL PAGE ---
const CandidateDetailPage = ({ candidate, onBack }) => {
  const [interviewAnalysis, setInterviewAnalysis] = React.useState(null);
  const [analysisLoading, setAnalysisLoading] = React.useState(true);
  const [analysisError, setAnalysisError] = React.useState(null);

  React.useEffect(() => {
    if (candidate._id && candidate.job?._id) {
      fetch(`http://localhost:5000/api/interview-analysis/${candidate._id}/${candidate.job._id}`)
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setInterviewAnalysis(data.interview);
          } else {
            setAnalysisError('No interview data available');
          }
          setAnalysisLoading(false);
        })
        .catch(err => {
          console.error('Error fetching interview analysis:', err);
          setAnalysisError('Failed to load interview data');
          setAnalysisLoading(false);
        });
    }
  }, [candidate._id, candidate.job?._id]);

  const formatTextBlock = (text) => {
    if (!text) return <p className="cand-detail-empty">No information provided.</p>;
    return text.split('\n').map((line, index) => (
      <p key={index} className="cand-detail-line">
        {line || <span>&nbsp;</span>}
      </p>
    ));
  };

  const getScoreColor = (score) => {
    if (score >= 70) return "#22c55e";
    if (score >= 50) return "#eab308";
    return "#a855f7";
  };

  return (
    <div className="cand-container cand-detail-page">
      {/* Back Button */}
      <button onClick={onBack} className="cand-back-btn">
        Back to List
      </button>

      {/* Profile Header Card */}
      <div className="cand-profile-header">
        <div className="cand-profile-avatar">
          {candidate.name ? candidate.name[0].toUpperCase() : 'C'}
        </div>
        <div className="cand-profile-info">
          <h1 className="cand-profile-name">{candidate.name || "Unnamed Candidate"}</h1>
          <p className="cand-profile-job">Applied for: {candidate.job?.title || 'N/A'}</p>
          <p className="cand-profile-email">{candidate.email}</p>
        </div>
        <div className="cand-profile-score">
          <div className="cand-score-label">Match Score</div>
          <div 
            className="cand-score-value"
            style={{ color: getScoreColor(candidate.matchScore) }}
          >
            {typeof candidate.matchScore === 'number' ? `${candidate.matchScore.toFixed(0)}%` : "N/A"}
          </div>
        </div>
      </div>

      {/* Info Grid */}
      <div className="cand-detail-grid">
        {/* Contact Card */}
        <div className="cand-detail-card">
          <h2 className="cand-detail-title">Contact Information</h2>
          <div className="cand-detail-row">
            <span className="cand-detail-label">Email</span>
            <span className="cand-detail-value">{candidate.email || '-'}</span>
          </div>
          <div className="cand-detail-row">
            <span className="cand-detail-label">Phone</span>
            <span className="cand-detail-value">{candidate.phone || '-'}</span>
          </div>
          <div className="cand-detail-row">
            <span className="cand-detail-label">Address</span>
            <span className="cand-detail-value">{candidate.address || '-'}</span>
          </div>
        </div>

        {/* Skills Card */}
        <div className="cand-detail-card">
          <h2 className="cand-detail-title">Skills</h2>
          <div className="cand-detail-text">
            {formatTextBlock(candidate.skills)}
          </div>
        </div>

        {/* Work Experience Card */}
        <div className="cand-detail-card cand-full-width">
          <h2 className="cand-detail-title">Work Experience</h2>
          <div className="cand-detail-text">
            {formatTextBlock(candidate.work_experience)}
          </div>
        </div>

        {/* Education Card */}
        <div className="cand-detail-card cand-full-width">
          <h2 className="cand-detail-title">Education & Training</h2>
          <div className="cand-detail-text">
            {formatTextBlock(candidate.education_and_training)}
          </div>
        </div>

        {/* Interview Analysis Section */}
        {analysisLoading ? (
          <div className="cand-detail-card cand-full-width">
            <h2 className="cand-detail-title">Interview Analysis</h2>
            <div className="cand-loading">
              <div className="cand-spinner"></div>
              <p>Loading interview data...</p>
            </div>
          </div>
        ) : analysisError ? (
          <div className="cand-detail-card cand-full-width">
            <h2 className="cand-detail-title">Interview Analysis</h2>
            <p className="cand-detail-empty">{analysisError}</p>
          </div>
        ) : interviewAnalysis ? (
          <>
            {/* Overall Score Card */}
            <div className="cand-detail-card cand-full-width cand-interview-header">
              <h2 className="cand-detail-title">Interview Results</h2>
              <div className="cand-interview-score">
                <div className="cand-interview-score-value">{interviewAnalysis.overallScore}</div>
                <div className="cand-interview-score-label">Overall Score</div>
              </div>
            </div>

            {/* Video Player */}
            {interviewAnalysis.video?.available && (
              <div className="cand-detail-card cand-full-width">
                <h2 className="cand-detail-title">
                  Interview Recording
                  {interviewAnalysis.video.duration > 0 && (
                    <span className="cand-video-duration">
                      ({Math.floor(interviewAnalysis.video.duration / 60)}:{String(Math.floor(interviewAnalysis.video.duration % 60)).padStart(2, '0')})
                    </span>
                  )}
                </h2>
                <div className="cand-video-container">
                  <video controls preload="auto" playsInline className="cand-video">
                    <source src={`http://localhost:5000${interviewAnalysis.video.url}`} type="video/webm" />
                    Your browser does not support the video tag.
                  </video>
                </div>
                <div className="cand-video-actions">
                  <a 
                    href={`http://localhost:5000${interviewAnalysis.video.url}`}
                    download={`interview-${candidate?.name?.replace(/\s+/g, '_')}.webm`}
                    className="cand-download-btn"
                  >
                    Download Video
                  </a>
                </div>
              </div>
            )}

            {/* Metrics Cards */}
            <div className="cand-detail-card cand-metric-card">
              <h3 className="cand-metric-title" style={{ color: '#4299e1' }}>Visual Presence</h3>
              <div className="cand-metric-score">{interviewAnalysis.visual.score}/100</div>
              <div className="cand-detail-row">
                <span className="cand-detail-label">Eye Contact</span>
                <span className="cand-detail-value">{interviewAnalysis.visual.eyeContact}%</span>
              </div>
              <div className="cand-detail-row">
                <span className="cand-detail-label">Dominant Emotion</span>
                <span className="cand-detail-value">{interviewAnalysis.visual.dominantEmotion}</span>
              </div>
              {interviewAnalysis.visual.feedback && (
                <div className="cand-metric-feedback">
                  <span className="cand-detail-label">Feedback</span>
                  <p>{interviewAnalysis.visual.feedback}</p>
                </div>
              )}
            </div>

            <div className="cand-detail-card cand-metric-card">
              <h3 className="cand-metric-title" style={{ color: '#48bb78' }}>Communication</h3>
              <div className="cand-metric-score">{interviewAnalysis.audio.score}/100</div>
              <div className="cand-detail-row">
                <span className="cand-detail-label">Pace</span>
                <span className="cand-detail-value">{interviewAnalysis.audio.pace} WPM</span>
              </div>
              <div className="cand-detail-row">
                <span className="cand-detail-label">Confidence</span>
                <span className="cand-detail-value">{interviewAnalysis.audio.confidenceScore}/100</span>
              </div>
              <div className="cand-detail-row">
                <span className="cand-detail-label">Expression</span>
                <span className="cand-detail-value">{interviewAnalysis.audio.expressionScore}/100</span>
              </div>
              {interviewAnalysis.audio.feedback && (
                <div className="cand-metric-feedback">
                  <span className="cand-detail-label">Feedback</span>
                  <p>{interviewAnalysis.audio.feedback}</p>
                </div>
              )}
            </div>

            <div className="cand-detail-card cand-metric-card cand-full-width">
              <h3 className="cand-metric-title" style={{ color: '#ed8936' }}>Content Quality</h3>
              <div className="cand-metric-score">{interviewAnalysis.content.score}/100</div>
              {interviewAnalysis.content.summary && (
                <div className="cand-metric-feedback">
                  <span className="cand-detail-label">Summary</span>
                  <p>{interviewAnalysis.content.summary}</p>
                </div>
              )}
              {interviewAnalysis.content.strengths.length > 0 && (
                <div className="cand-metric-feedback">
                  <span className="cand-detail-label">Strengths</span>
                  <ul className="cand-strength-list">
                    {interviewAnalysis.content.strengths.map((s, idx) => (
                      <li key={idx}>{s}</li>
                    ))}
                  </ul>
                </div>
              )}
              {interviewAnalysis.content.improvements.length > 0 && (
                <div className="cand-metric-feedback">
                  <span className="cand-detail-label">Areas to Improve</span>
                  <ul className="cand-improve-list">
                    {interviewAnalysis.content.improvements.map((i, idx) => (
                      <li key={idx}>{i}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
};

export default Candidates;
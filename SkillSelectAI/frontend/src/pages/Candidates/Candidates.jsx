import React from "react";
import "./Candidates.css";
import { FormControl, InputLabel, MenuItem, Select } from "@mui/material";

const MODAL_ANIMATION_MS = 220;

const Candidates = () => {
  const [selectedCandidate, setSelectedCandidate] = React.useState(null);
  const [isOverviewOpen, setIsOverviewOpen] = React.useState(false);
  const [activeSection, setActiveSection] = React.useState(null);

  React.useEffect(() => {
    document.body.style.overflow = selectedCandidate ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [selectedCandidate]);

  const handleSelectCandidate = (candidate) => {
    setSelectedCandidate(candidate);
    setIsOverviewOpen(true);
    setActiveSection(null);
  };

  const handleCloseOverview = () => {
    setIsOverviewOpen(false);
    setActiveSection(null);
  };

  const handleOverviewExited = () => {
    setSelectedCandidate(null);
    setActiveSection(null);
  };

  return (
    <>
      <CandidateListPage onSelectCandidate={handleSelectCandidate} />
      {selectedCandidate && (
        <CandidateOverviewModal
          candidate={selectedCandidate}
          isOpen={isOverviewOpen}
          activeSection={activeSection}
          onOpenSection={setActiveSection}
          onCloseSection={() => setActiveSection(null)}
          onCloseOverview={handleCloseOverview}
          onOverviewExited={handleOverviewExited}
        />
      )}
    </>
  );
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

  // Apply filters: job selection and search term
  const filteredCandidates = candidates.filter((c) => {
    if (selectedJob) {
      const jobId = typeof c.job === 'string' ? c.job : c.job?._id;
      if (jobId !== selectedJob) return false;
    }

    const term = (searchTerm || '').trim().toLowerCase();
    if (term) {
      const name = (c.name || '').toLowerCase();
      const email = (c.email || '').toLowerCase();
      return name.includes(term) || email.includes(term);
    }

    return true;
  });

  return (
    <div className="cand-container">
      {/* Header */}
      <header className="cand-header">
        <h1 className="cand-title">
          Candidate <span className="cand-gradient-text">Pool</span>
        </h1>
        <p className="cand-subtitle">Review and manage candidates with AI-powered insights</p>
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
          <div className="cand-filter-inline">
            <FormControl size="small" className="cand-filter-control">
              <InputLabel
                sx={{
                  color: "#6B7280",
                  "&.Mui-focused": { color: "#7C3AED" },
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
      </div>

      {/* Candidate Grid */}
      <div className="cand-grid">
        {loading ? (
          <div className="cand-loading">
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
                <div className="cand-job-tag">{c.job?.title || "Unknown Position"}</div>
                <div
                  className="cand-score"
                  style={{
                    background: getScoreBg(c.matchScore),
                    color: getScoreColor(c.matchScore),
                    borderColor: getScoreColor(c.matchScore),
                  }}
                >
                  {typeof c.matchScore === "number" ? `${c.matchScore.toFixed(0)}%` : "N/A"}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

 


const CandidateOverviewModal = ({
  candidate,
  isOpen,
  activeSection,
  onOpenSection,
  onCloseSection,
  onCloseOverview,
  onOverviewExited,
}) => {
  const [interviewAnalysis, setInterviewAnalysis] = React.useState(null);
  const [analysisLoading, setAnalysisLoading] = React.useState(true);
  const [analysisError, setAnalysisError] = React.useState(null);
  const [rendered, closing] = useModalTransition(isOpen, MODAL_ANIMATION_MS);

  const jobId = typeof candidate?.job === "string" ? candidate.job : candidate?.job?._id;

  React.useEffect(() => {
    let cancelled = false;

    setAnalysisLoading(true);
    setAnalysisError(null);
    setInterviewAnalysis(null);

    if (!candidate?._id || !jobId) {
      setAnalysisLoading(false);
      setAnalysisError("No interview data available.");
      return undefined;
    }

    fetch(`http://localhost:5000/api/interview-analysis/${candidate._id}/${jobId}`)
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return;

        if (data.success) {
          setInterviewAnalysis(data.interview);
        } else {
          setAnalysisError("No interview data available.");
        }
        setAnalysisLoading(false);
      })
      .catch((err) => {
        if (cancelled) return;
        console.error("Error fetching interview analysis:", err);
        setAnalysisError("Failed to load interview data.");
        setAnalysisLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [candidate?._id, jobId]);

  React.useEffect(() => {
    if (!rendered) {
      onCloseSection();
      onOverviewExited();
    }
  }, [rendered, onCloseSection, onOverviewExited]);

  React.useEffect(() => {
    if (!rendered) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        onCloseOverview();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [rendered, onCloseOverview]);

  if (!rendered) {
    return null;
  }

  const modalState = closing ? "is-closing" : "is-open";
  const candidateInitial = candidate?.name ? candidate.name[0].toUpperCase() : "C";
  const jobTitle = getCandidateJobTitle(candidate);
  const matchScore = typeof candidate?.matchScore === "number" ? `${candidate.matchScore.toFixed(0)}%` : "N/A";

  return (
    <div
      className={`cand-modal-backdrop ${modalState}`}
      onMouseDown={onCloseOverview}
      role="presentation"
    >
      <div
        className={`cand-modal cand-overview-modal ${modalState}`}
        role="dialog"
        aria-modal="true"
        aria-label="Candidate overview"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="cand-modal-header">
          <div>
            <div className="cand-modal-kicker">Candidate Overview</div>
          </div>
          <button className="cand-modal-close" onClick={onCloseOverview} aria-label="Close overview">
            X
          </button>
        </div>

        <div className="cand-modal-scroll">
          <div className="cand-overview-hero">
            <div className="cand-overview-hero-main">
              <div className="cand-overview-avatar">{candidateInitial}</div>
              <div className="cand-overview-meta">
                <div className="cand-overview-name-row">
                  <h3 className="cand-overview-name">{candidate?.name || "Unnamed Candidate"}</h3>
                </div>
                <div className="cand-overview-submeta">{jobTitle}</div>
                <div className="cand-overview-submeta">{candidate?.email || "No email provided"}</div>
              </div>
            </div>
            <div className="cand-overview-score-block">
              <div className="cand-overview-score">{matchScore}</div>
              <div className="cand-overview-score-label">Match score</div>
            </div>
          </div>

          <div className="cand-overview-grid">
            <OverviewSectionCard
              label="Profile / CV"
              title="Candidate profile"
              preview={getProfilePreview(candidate)}
              accent="profile"
              onClick={() => onOpenSection("profile")}
            />
            <OverviewSectionCard
              label="Evaluation"
              title="Interview evaluation"
              preview={getEvaluationPreview(interviewAnalysis, analysisLoading, analysisError)}
              accent="evaluation"
              onClick={() => onOpenSection("evaluation")}
            />
            <OverviewSectionCard
              label="Interview Video"
              title="Recording preview"
              preview={getVideoPreview(interviewAnalysis, analysisLoading, analysisError)}
              accent="video"
              onClick={() => onOpenSection("video")}
            />
          </div>
        </div>
      </div>

      <CandidateSectionModal
        isOpen={Boolean(activeSection)}
        section={activeSection}
        candidate={candidate}
        interviewAnalysis={interviewAnalysis}
        analysisLoading={analysisLoading}
        analysisError={analysisError}
        onClose={onCloseSection}
      />
    </div>
  );
};

const OverviewSectionCard = ({ label, title, preview, accent, onClick }) => {
  return (
    <button className={`cand-overview-card cand-overview-card--${accent}`} onClick={onClick} type="button">
      <div className="cand-overview-card-label">{label}</div>
      <div className="cand-overview-card-title">{title}</div>
      <p className="cand-overview-card-preview">{preview}</p>
      <div className="cand-overview-card-cta">Open section</div>
    </button>
  );
};

const CandidateSectionModal = ({
  isOpen,
  section,
  candidate,
  interviewAnalysis,
  analysisLoading,
  analysisError,
  onClose,
}) => {
  const [rendered, closing] = useModalTransition(isOpen, MODAL_ANIMATION_MS);

  React.useEffect(() => {
    if (!rendered) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [rendered, onClose]);

  if (!rendered || !section) {
    return null;
  }

  const modalState = closing ? "is-closing" : "is-open";
  const config = getSectionConfig(section, candidate);

  return (
    <div
      className={`cand-modal-backdrop cand-modal-backdrop--inner ${modalState}`}
      onMouseDown={onClose}
      role="presentation"
    >
      <div
        className={`cand-modal cand-section-modal ${modalState}`}
        role="dialog"
        aria-modal="true"
        aria-label={config.title}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="cand-modal-header">
          <div>
            <div className="cand-modal-kicker">{config.kicker}</div>
            <h2 className="cand-modal-title">{config.title}</h2>
            <p className="cand-modal-subtitle">{config.subtitle}</p>
          </div>
          <button className="cand-modal-close" onClick={onClose} aria-label={`Close ${config.title}`}>
            X
          </button>
        </div>

        <div className="cand-modal-scroll cand-section-scroll">
          {section === "profile" && <ProfileSection candidate={candidate} />}
          {section === "evaluation" && (
            <EvaluationSection
              interviewAnalysis={interviewAnalysis}
              analysisLoading={analysisLoading}
              analysisError={analysisError}
            />
          )}
          {section === "video" && (
            <VideoSection
              candidate={candidate}
              interviewAnalysis={interviewAnalysis}
              analysisLoading={analysisLoading}
              analysisError={analysisError}
            />
          )}
        </div>
      </div>
    </div>
  );
};

const ProfileSection = ({ candidate }) => {
  const experiences = parseWorkExperiences(candidate?.work_experience);

  return (
    <div className="cand-section-stack">
      <div className="cand-detail-card cand-section-block">
        <h3 className="cand-detail-title">Candidate Snapshot</h3>
        <div className="cand-detail-row">
          <span className="cand-detail-label">Applied for</span>
          <span className="cand-detail-value">{getCandidateJobTitle(candidate)}</span>
        </div>
        <div className="cand-detail-row">
          <span className="cand-detail-label">Match score</span>
          <span className="cand-detail-value">{formatPercent(candidate?.matchScore)}</span>
        </div>
        <div className="cand-detail-row">
          <span className="cand-detail-label">Email</span>
          <span className="cand-detail-value">{candidate?.email || "-"}</span>
        </div>
        <div className="cand-detail-row">
          <span className="cand-detail-label">Phone</span>
          <span className="cand-detail-value">{candidate?.phone || "-"}</span>
        </div>
        <div className="cand-detail-row">
          <span className="cand-detail-label">Address</span>
          <span className="cand-detail-value">{candidate?.address || "-"}</span>
        </div>
      </div>

      <div className="cand-detail-card cand-section-block">
        <h3 className="cand-detail-title">Skills</h3>
        <div className="cand-detail-text">{renderSkillsChips(candidate?.skills)}</div>
      </div>

      <div className="cand-detail-card cand-section-block">
        <h3 className="cand-detail-title">Work Experience</h3>
        <div className="cand-detail-text">{renderWorkExperience(experiences)}</div>
      </div>

      <div className="cand-detail-card cand-section-block">
        <h3 className="cand-detail-title">Education & Training</h3>
        <div className="cand-detail-text">{renderEducation(candidate?.education_and_training)}</div>
      </div>
    </div>
  );
};

const EvaluationSection = ({ interviewAnalysis, analysisLoading, analysisError }) => {
  if (analysisLoading) {
    return <p className="cand-detail-empty">Loading interview evaluation...</p>;
  }

  if (analysisError) {
    return <p className="cand-detail-empty">{analysisError}</p>;
  }

  if (!interviewAnalysis) {
    return <p className="cand-detail-empty">No interview data available.</p>;
  }

  const recordingType = getInterviewRecordingType(interviewAnalysis);

  return (
    <div className="cand-section-stack">
      <div className="cand-detail-card cand-section-block cand-interview-header">
        <h3 className="cand-detail-title">Interview Results</h3>
        <div className="cand-interview-score">
          <div className="cand-interview-score-value">{interviewAnalysis.overallScore}</div>
          <div className="cand-interview-score-label">Overall Score</div>
        </div>
      </div>

      {recordingType === "video" && interviewAnalysis.visual && (
        <div className="cand-detail-card cand-section-block cand-metric-card">
          <h3 className="cand-metric-title" style={{ color: "#4299e1" }}>
            Visual Presence
          </h3>
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
      )}

      {interviewAnalysis.audio && (
        <div className="cand-detail-card cand-section-block cand-metric-card">
          <h3 className="cand-metric-title" style={{ color: "#48bb78" }}>
            Communication
          </h3>
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
      )}

      {interviewAnalysis.content && (
        <div className="cand-detail-card cand-section-block cand-metric-card">
          <h3 className="cand-metric-title" style={{ color: "#ed8936" }}>
            Content Quality
          </h3>
          <div className="cand-metric-score">{interviewAnalysis.content.score}/100</div>
          {interviewAnalysis.content.summary && (
            <div className="cand-metric-feedback">
              <span className="cand-detail-label">Summary</span>
              <p>{interviewAnalysis.content.summary}</p>
            </div>
          )}
          {Array.isArray(interviewAnalysis.content.strengths) && interviewAnalysis.content.strengths.length > 0 && (
            <div className="cand-metric-feedback">
              <span className="cand-detail-label">Strengths</span>
              <ul className="cand-strength-list">
                {interviewAnalysis.content.strengths.map((strength, index) => (
                  <li key={index}>{strength}</li>
                ))}
              </ul>
            </div>
          )}
          {Array.isArray(interviewAnalysis.content.improvements) && interviewAnalysis.content.improvements.length > 0 && (
            <div className="cand-metric-feedback">
              <span className="cand-detail-label">Areas to Improve</span>
              <ul className="cand-improve-list">
                {interviewAnalysis.content.improvements.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const VideoSection = ({ candidate, interviewAnalysis, analysisLoading, analysisError }) => {
  if (analysisLoading) {
    return <p className="cand-detail-empty">Loading interview recording...</p>;
  }

  if (analysisError) {
    return <p className="cand-detail-empty">{analysisError}</p>;
  }

  if (!interviewAnalysis?.recording?.available) {
    return <p className="cand-detail-empty">No interview recording available.</p>;
  }

  const recordingType = getInterviewRecordingType(interviewAnalysis);
  const recordingUrl = `http://localhost:5000${interviewAnalysis.recording.url}`;
  const fileName = `interview-${candidate?.name?.replace(/\s+/g, "_") || "candidate"}.webm`;

  return (
    <div className="cand-section-stack">
      <div className="cand-detail-card cand-section-block">
        <h3 className="cand-detail-title">
          {recordingType === "voice" ? "Interview Audio" : "Interview Video"}
          {interviewAnalysis.recording.duration > 0 && (
            <span className="cand-video-duration">
              ({Math.floor(interviewAnalysis.recording.duration / 60)}:
              {String(Math.floor(interviewAnalysis.recording.duration % 60)).padStart(2, "0")})
            </span>
          )}
        </h3>
        <div className="cand-video-container">
          {recordingType === "voice" ? (
            <audio controls preload="auto" style={{ width: "100%" }}>
              <source src={recordingUrl} type={interviewAnalysis.recording.mimeType || "audio/webm"} />
              Your browser does not support the audio tag.
            </audio>
          ) : (
            <video controls preload="auto" playsInline className="cand-video">
              <source src={recordingUrl} type={interviewAnalysis.recording.mimeType || "video/webm"} />
              Your browser does not support the video tag.
            </video>
          )}
        </div>
        <div className="cand-video-actions">
          <a href={recordingUrl} download={fileName} className="cand-download-btn">
            {recordingType === "voice" ? "Download Audio" : "Download Video"}
          </a>
        </div>
      </div>
    </div>
  );
};

const useModalTransition = (isOpen, duration = 220) => {
  const [rendered, setRendered] = React.useState(isOpen);
  const [closing, setClosing] = React.useState(false);

  React.useEffect(() => {
    if (isOpen) {
      setRendered(true);
      requestAnimationFrame(() => setClosing(false));
      return undefined;
    }

    if (!rendered) {
      return undefined;
    }

    setClosing(true);
    const timeoutId = window.setTimeout(() => {
      setRendered(false);
      setClosing(false);
    }, duration);

    return () => window.clearTimeout(timeoutId);
  }, [isOpen, rendered, duration]);

  return [rendered, closing];
};

const getCandidateJobTitle = (candidate) => {
  if (!candidate?.job) {
    return "Unknown Position";
  }

  if (typeof candidate.job === "string") {
    return candidate.job;
  }

  return candidate.job.title || "Unknown Position";
};

const getProfilePreview = (candidate) => {
  const parts = [candidate?.skills, candidate?.work_experience, candidate?.education_and_training]
    .filter(Boolean)
    .map((item) => formatPreviewText(item, 70));

  return parts.length > 0 ? parts.join(" • ") : "No profile details provided yet.";
};

const getEvaluationPreview = (interviewAnalysis, analysisLoading, analysisError) => {
  if (analysisLoading) {
    return "Loading evaluation preview...";
  }

  if (analysisError) {
    return analysisError;
  }

  if (!interviewAnalysis) {
    return "No interview evaluation available.";
  }

  const scoreText =
    typeof interviewAnalysis.overallScore !== "undefined"
      ? `Overall score ${interviewAnalysis.overallScore}`
      : "Evaluation ready";
  const summaryText =
    interviewAnalysis.content?.summary || interviewAnalysis.audio?.feedback || interviewAnalysis.visual?.feedback;

  return summaryText ? `${scoreText}. ${formatPreviewText(summaryText, 92)}` : scoreText;
};

const getVideoPreview = (interviewAnalysis, analysisLoading, analysisError) => {
  if (analysisLoading) {
    return "Loading interview video preview...";
  }

  if (analysisError) {
    return analysisError;
  }

  if (!interviewAnalysis?.recording?.available) {
    return "No interview recording available.";
  }

  const recordingType = getInterviewRecordingType(interviewAnalysis);
  const duration = interviewAnalysis.recording.duration || 0;
  const durationText =
    duration > 0
      ? `${Math.floor(duration / 60)}:${String(Math.floor(duration % 60)).padStart(2, "0")}`
      : "duration unavailable";

  return `${recordingType === "voice" ? "Audio" : "Video"} available • ${durationText}`;
};

const getInterviewRecordingType = (interviewAnalysis) => {
  return interviewAnalysis?.recording?.type || (interviewAnalysis?.video?.available ? "video" : "voice");
};

const getSectionConfig = (section, candidate) => {
  if (section === "profile") {
    return {
      kicker: "Profile / CV",
      title: candidate?.name || "Candidate Profile",
      subtitle: "Focused profile details, CV sections, and contact information.",
    };
  }

  if (section === "evaluation") {
    return {
      kicker: "Evaluation",
      title: "Interview Evaluation",
      subtitle: "All interview insights in one focused modal.",
    };
  }

  return {
    kicker: "Interview Video",
    title: "Interview Recording",
    subtitle: "Play back the selected candidate's recorded interview.",
  };
};

const renderTextBlock = (text) => {
  if (!text) {
    return <p className="cand-detail-empty">No information provided.</p>;
  }

  return String(text)
    .split("\n")
    .map((line, index) => (
      <p key={index} className="cand-detail-line">
        {line || <span>&nbsp;</span>}
      </p>
    ));
};

const formatPreviewText = (text, maxLength = 120) => {
  const cleaned = String(text || "").replace(/\s+/g, " ").trim();

  if (!cleaned) {
    return "No information provided.";
  }

  return cleaned.length > maxLength ? `${cleaned.slice(0, maxLength)}...` : cleaned;
};

const formatPercent = (value) => {
  return typeof value === "number" ? `${value.toFixed(0)}%` : "N/A";
};

// Score color helpers used across list and detail views
const getScoreColor = (score) => {
  if (typeof score !== 'number') return '#9CA3AF';
  if (score >= 70) return '#22C55E';
  if (score >= 50) return '#F59E0B';
  return '#EF4444';
};

const getScoreBg = (score) => {
  const color = getScoreColor(score);
  // return a soft translucent background based on the color
  if (color === '#22C55E') return 'rgba(34,197,94,0.12)';
  if (color === '#F59E0B') return 'rgba(245,158,11,0.08)';
  if (color === '#EF4444') return 'rgba(239,68,68,0.08)';
  return 'rgba(156,163,175,0.06)';
};

// ===== SKILLS RENDERING WITH SECTION-BLOCK EXTRACTION =====
const parseSkillsSection = (text) => {
  if (!text) return [];

  const headingAliases = new Set([
    'skills',
    'key skills',
    'skill set',
    'technical skills',
    'skills & tools',
    'core skills',
    'core competencies',
    'professional skills',
    'competencies',
  ]);

  const categoryLabels = new Set([
    'languages',
    'frameworks',
    'libraries',
    'tools',
    'other',
    'frameworks/libraries',
    'frameworks & libraries',
    'technologies',
    'technology stack',
    'stack',
  ]);

  const stopHeaders = new Set([
    'work experience',
    'experience',
    'employment history',
    'education',
    'projects',
    'certifications',
    'achievements',
    'summary',
    'profile',
    'objective',
    'about',
    'contact',
    'languages',
  ]);

  const sectionHeaderRegex = /^(work experience|professional experience|education and training|education|projects|certifications|achievements|summary|profile|objective|about|contact)\b/i;

  const cleanSkillToken = (token) => {
    let value = String(token || '').trim();
    value = value.replace(/\b(basics?|fundamentals?|principles?|advanced|intermediate)\b$/i, '');
    value = value.replace(/^[-•*\u2022]+\s*/, '');
    value = value.replace(/\s+/g, ' ').trim();
    return value;
  };

  const splitSkillValues = (valuesString) => {
    const raw = String(valuesString || '').trim();
    if (!raw) return [];

    const protectedPairs = ['ci/cd', 'qa/qc', 'r&d', 'ui/ux'];
    const placeholders = new Map();
    let normalized = raw;

    protectedPairs.forEach((term, idx) => {
      const placeholder = `__SKILL_PROTECT_${idx}__`;
      normalized = normalized.replace(new RegExp(term, 'ig'), placeholder);
      placeholders.set(placeholder, term);
    });

    const baseParts = normalized
      .split(/[;,|]/)
      .map((token) => token.trim())
      .filter(Boolean);

    const compactSlashPattern = /^[A-Za-z0-9.+#-]+(?:\s*\/\s*[A-Za-z0-9.+#-]+)+$/;
    const parts = [];
    baseParts.forEach((token) => {
      if (compactSlashPattern.test(token)) {
        token
          .split(/\s*\/\s*/)
          .map((part) => part.trim())
          .filter(Boolean)
          .forEach((part) => parts.push(part));
      } else {
        parts.push(token);
      }
    });

    return parts.map((token) => {
      let restored = token;
      placeholders.forEach((term, placeholder) => {
        restored = restored.replaceAll(placeholder, term);
      });
      return restored;
    });
  };

  const mergeWrappedPhraseSkills = (items) => {
    const phraseSecondWords = new Set([
      'development', 'paradigm', 'design', 'management', 'analysis',
      'engineering', 'science', 'learning', 'processing', 'architecture',
    ]);

    const merged = [];
    for (let i = 0; i < items.length; i += 1) {
      const cur = String(items[i] || '').trim();
      const next = String(items[i + 1] || '').trim();
      const curWords = cur.split(/\s+/).filter(Boolean);
      const nextWords = next.split(/\s+/).filter(Boolean);
      const tokenPattern = /^[A-Za-z][A-Za-z.+#-]*$/;

      if (
        next &&
        curWords.length === 1 &&
        nextWords.length === 1 &&
        tokenPattern.test(cur) &&
        tokenPattern.test(next) &&
        phraseSecondWords.has(next.toLowerCase())
      ) {
        merged.push(`${cur} ${next}`);
        i += 1;
        continue;
      }

      merged.push(cur);
    }

    const deduped = [];
    merged.forEach((skill) => {
      const key = skill.toLowerCase();
      if (!deduped.some((existing) => existing.toLowerCase() === key)) {
        deduped.push(skill);
      }
    });
    return deduped;
  };

  const extractSkillsHeading = (line) => {
    const value = String(line || '').trim();
    const match = value.match(/^(skills(?:\s*&\s*tools|\s*set|\s*\+\s*tools|\s*and\s*tools|\s*\/\s*tools)?|key skills|technical skills|core skills|core competencies|professional skills|competencies)\b(?:\s*[:\-–—]\s*(.*)|$)/i);
    if (!match) return null;
    return {
      heading: match[1].toLowerCase(),
      remainder: String(match[2] || '').trim(),
    };
  };

  const isLikelyHeading = (line) => {
    const normalized = String(line || '').trim().toLowerCase().replace(/[:\-]+$/g, '');
    if (!normalized) return false;
    if (headingAliases.has(normalized)) return true;
    return stopHeaders.has(normalized) || sectionHeaderRegex.test(normalized);
  };

  const lines = String(text)
    .replace(/\r\n/g, '\n')
    .split('\n')
    .map((line) => line.trim());

  const skills = [];
  let inSkillsSection = false;
  let sawSkillsHeading = false;

  const pushSkillsFromValues = (valuesString) => {
    splitSkillValues(valuesString)
      .map((token) => cleanSkillToken(token))
      .filter(Boolean)
      .forEach((skill) => {
        const normalized = skill.replace(/\s+/g, ' ').trim();
        const lower = normalized.toLowerCase();
        if (!categoryLabels.has(lower) && !skills.some((item) => item.toLowerCase() === lower)) {
          skills.push(normalized);
        }
      });
  };

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;

    if (!inSkillsSection) {
      const headingMatch = extractSkillsHeading(line);
      if (headingMatch) {
        inSkillsSection = true;
        sawSkillsHeading = true;
        if (headingMatch.remainder) {
          pushSkillsFromValues(headingMatch.remainder);
        }
      }
      continue;
    }

    const normalizedHeading = line.toLowerCase().replace(/[:\-]+$/g, '');

    if (stopHeaders.has(normalizedHeading) || sectionHeaderRegex.test(normalizedHeading) || (isLikelyHeading(line) && !line.includes(':'))) {
      break;
    }

    if (line.includes(':')) {
      const [, valuesPart = ''] = line.split(/:(.+)/);
      if (valuesPart.trim()) {
        pushSkillsFromValues(valuesPart);
      }
      continue;
    }

    if (/[;,|/]/.test(line)) {
      pushSkillsFromValues(line);
      continue;
    }

    const normalizedLine = cleanSkillToken(line);
    const lower = normalizedLine.toLowerCase();
    if (normalizedLine && !categoryLabels.has(lower) && !skills.some((item) => item.toLowerCase() === lower)) {
      skills.push(normalizedLine);
    }
  }

  // If the CV parser already isolated the skills block and stripped the heading,
  // parse the block directly as a fallback.
  if (skills.length === 0 && !sawSkillsHeading) {
    const narrativePattern = /\b(i am|i have|i've|worked|work experience|developed|improved|gained|seeking|looking|responsible|passionate|summary|profile|objective|about)\b/i;
    const nonEmptyLines = lines.filter((line) => line.trim());
    const looksLikeSkillsBlock = nonEmptyLines.length > 0 && nonEmptyLines.every((line) => {
      const normalized = String(line || '').trim();
      const normalizedHeading = normalized.toLowerCase().replace(/[:\-]+$/g, '');

      if (sectionHeaderRegex.test(normalizedHeading) || stopHeaders.has(normalizedHeading)) {
        return false;
      }

      if (/[;,|/]/.test(normalized) || normalized.includes(':')) {
        return true;
      }

      const wordCount = normalized.split(/\s+/).filter(Boolean).length;
      return wordCount > 0 && wordCount <= 4 && !narrativePattern.test(normalized) && !/[.!?]$/.test(normalized);
    });

    if (!looksLikeSkillsBlock) {
      return skills;
    }

    const fallbackSkills = [];
    for (const rawLine of lines) {
      const line = rawLine.trim();
      if (!line) continue;
      const normalizedHeading = line.toLowerCase().replace(/[:\-]+$/g, '');
      if (sectionHeaderRegex.test(normalizedHeading)) break;

      if (line.includes(':')) {
        const [, valuesPart = ''] = line.split(/:(.+)/);
        if (valuesPart.trim()) {
          splitSkillValues(valuesPart)
            .map((token) => cleanSkillToken(token))
            .filter(Boolean)
            .forEach((skill) => {
              const normalized = skill.replace(/\s+/g, ' ').trim();
              const lower = normalized.toLowerCase();
              if (!categoryLabels.has(lower) && !fallbackSkills.some((item) => item.toLowerCase() === lower)) {
                fallbackSkills.push(normalized);
              }
            });
        }
        continue;
      }

      if (/[;,|/]/.test(line)) {
        splitSkillValues(line)
          .map((token) => cleanSkillToken(token))
          .filter(Boolean)
          .forEach((skill) => {
            const normalized = skill.replace(/\s+/g, ' ').trim();
            const lower = normalized.toLowerCase();
            if (!categoryLabels.has(lower) && !fallbackSkills.some((item) => item.toLowerCase() === lower)) {
              fallbackSkills.push(normalized);
            }
          });
        continue;
      }

      const normalizedLine = cleanSkillToken(line);
      const lower = normalizedLine.toLowerCase();
      if (normalizedLine && !categoryLabels.has(lower) && !fallbackSkills.some((item) => item.toLowerCase() === lower)) {
        fallbackSkills.push(normalizedLine);
      }
    }

    if (fallbackSkills.length > 0) {
      return fallbackSkills;
    }
  }

  return mergeWrappedPhraseSkills(skills);
};

const renderSkillsChips = (text) => {
  const skills = parseSkillsSection(text);

  if (skills.length === 0) {
    return <p className="cand-detail-empty">No skills provided.</p>;
  }

  return (
    <div className="cand-skills-container">
      {skills.map((skill, index) => (
        <div key={index} className="cand-skill-chip">
          {skill}
        </div>
      ))}
    </div>
  );
};

// Parse work experiences into structured objects: { title, company, dates, description, techStack }
const parseWorkExperiences = (text) => {
  if (!text) return [];

  const rolePhrases = [
    'full stack developer', 'software developer', 'software engineer', 'frontend developer',
    'backend developer', 'web developer', 'mobile developer', 'data analyst',
    'business analyst', 'project manager', 'product manager', 'qa engineer',
    'qa analyst', 'devops engineer', 'intern', 'internship', 'developer', 'engineer',
    'manager', 'analyst', 'consultant', 'architect', 'designer', 'specialist'
  ];
  const orderedRolePhrases = [...rolePhrases].sort((a, b) => b.length - a.length);
  const descriptionVerbRegex = /\b(developed|designed|implemented|managed|created|deployed|currently|responsible|worked|collaborated|built|improved|enhanced|maintained|handled|supported|delivered|extended|scoped|automated|optimized)\b/i;
  const companySignalRegex = /\b(inc|llc|ltd|limited|corp|corporation|co\.|company|solutions|technologies|labs|authority|agency|institute|university|college|group|capital|ncri|nepra)\b/i;
  const locationRegex = /\b(islamabad|lahore|karachi|rawalpindi|peshawar|quetta|multan|faisalabad|pakistan|india|uae|saudi arabia|united states|usa|uk|canada|germany|france|australia|new york|london|remote)\b/i;
  const sectionStopRegex = /^(education(?:\s+and\s+training|\s*&\s*training)?|projects?|certifications?|certificates?|achievements?|skills?|technical\s+skills|core\s+skills|summary|profile|objective|about|contact|languages?|references?|additional\s+information)\b/i;
  const techLineRegex = /\b(tech stack|technologies|technology stack|tech stack:|tech:|stack:|tools:|technologies:)\b/i;
  const noiseTokenRegex = /^(?:\[\s*\d+\s*\]|developer|software|systems?|internal(?:\s+use(?:\s+only)?)?)$/i;
  const dateUnit = '(?:\\d{1,2}[\\/\\.\\-]\\d{1,2}[\\/\\.\\-]\\d{2,4}|(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec)[a-z]*\\s+\\d{4}|current|present)';
  const dateRangeRegex = new RegExp(`${dateUnit}\\s*[-–—]\\s*${dateUnit}`, 'ig');

  const normalize = (line) => String(line || '')
    .replace(/\r\n/g, '\n')
    .replace(/[▪◦●◉◌]/g, ' ')
    .replace(/\[\s*\d+\s*\]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  const classifyRole = (line) => {
    const value = normalize(line);
    if (!value || descriptionVerbRegex.test(value) || value.split(/\s+/).length < 2) return false;
    for (const phrase of orderedRolePhrases) {
      const re = new RegExp(`\\b${phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
      if (re.test(value)) return true;
    }
    return false;
  };

  const classifyLocation = (line) => {
    const value = normalize(line);
    if (!value || /\d{2,}/.test(value)) return false;
    if (/^city\s*:/i.test(value) || /^country\s*:/i.test(value)) return true;
    return locationRegex.test(value);
  };

  const classifyCompany = (line) => {
    const value = normalize(line).replace(/^company:\s*/i, '').trim();
    if (!value || classifyRole(value) || classifyLocation(value) || descriptionVerbRegex.test(value)) return false;
    if (/[.!?]$/.test(value) && value.split(/\s+/).length > 7) return false;
    return companySignalRegex.test(value) || value === value.toUpperCase() || /\([^)]+\)/.test(value);
  };

  const extractDateRanges = (line) => {
    const value = normalize(line);
    return Array.from(value.matchAll(dateRangeRegex)).map((m) => m[0].replace(/\s+/g, ' ').trim());
  };

  const removeDates = (line) => {
    const value = normalize(line);
    return value.replace(dateRangeRegex, ' ').replace(/\s+/g, ' ').trim();
  };

  const cleanLocation = (line) => {
    const value = normalize(line)
      .replace(/^city\s*:\s*/i, '')
      .replace(/^country\s*:\s*/i, '')
      .replace(/\|\s*country\s*:\s*/i, ', ')
      .replace(/\|\s*city\s*:\s*/i, ', ')
      .replace(/\s*\|\s*/g, ', ')
      .replace(/\s+,/g, ',')
      .trim();
    return value || null;
  };

  const cleanCompany = (line) => {
    const value = normalize(line)
      .replace(/^company:\s*/i, '')
      .replace(/[,;:\-–—\s]+$/g, '')
      .trim();
    if (!value || noiseTokenRegex.test(value)) return null;
    return value;
  };

  const cleanRole = (line) => {
    const value = removeDates(line).replace(/[,;:\-–—\s]+$/g, '').trim();
    if (!value || noiseTokenRegex.test(value)) return null;
    return value;
  };

  const splitComposite = (line) => {
    const raw = String(line || '').trim();
    if (!raw) return [''];
    return raw
      .replace(/[]/g, '\nCOMPANY: ')
      .replace(/\s*[•●▪◦]\s*/g, '\n• ')
      .replace(/\s+(Tech Stack\s*:)/ig, '\n$1')
      .replace(/\s+(Technologies\s*:)/ig, '\n$1')
      .split('\n')
      .map((x) => x.trim());
  };

  // PASS 1: deterministic segmentation into closed job blocks.
  const lines = String(text)
    .replace(/\r\n/g, '\n')
    .split('\n')
    .flatMap((line) => splitComposite(line));
  const queuedDates = [];
  const blocks = [];
  let block = [];
  let blockCompany = null;
  let blockRole = null;
  let blockLocation = null;
  let blankCount = 0;

  const flushBlock = () => {
    const cleaned = block.map((x) => normalize(x)).filter(Boolean);
    if (cleaned.length > 0) blocks.push(cleaned);
    block = [];
    blockCompany = null;
    blockRole = null;
    blockLocation = null;
    blankCount = 0;
  };

  for (const rawLine of lines) {
    const value = normalize(rawLine);
    if (!value) {
      blankCount += 1;
      if (blankCount >= 1 && block.length > 0) flushBlock();
      continue;
    }
    blankCount = 0;
    if (sectionStopRegex.test(value)) break;

    const dateRanges = extractDateRanges(value);
    if (dateRanges.length >= 2 && block.length === 0) {
      queuedDates.push(...dateRanges);
      const rem = removeDates(value);
      if (!rem) continue;
    }

    const maybeCompany = classifyCompany(value) ? cleanCompany(removeDates(value)) : null;
    const maybeRole = classifyRole(value) ? cleanRole(value) : null;
    const maybeLocation = classifyLocation(value) ? cleanLocation(removeDates(value)) : null;

    if (maybeCompany && blockCompany && maybeCompany.toLowerCase() !== blockCompany.toLowerCase()) flushBlock();
    if (maybeRole && blockRole && maybeRole.toLowerCase() !== blockRole.toLowerCase()) flushBlock();
    if (maybeLocation && blockLocation && maybeLocation.toLowerCase() !== blockLocation.toLowerCase()) flushBlock();

    block.push(value);
    if (maybeCompany) blockCompany = maybeCompany;
    if (maybeRole) blockRole = maybeRole;
    if (maybeLocation) blockLocation = maybeLocation;
  }
  flushBlock();

  // PASS 2: strict field identification per isolated block.
  const experiences = [];
  for (const isolated of blocks) {
    const exp = { title: null, company: null, location: null, dates: null, description: '', techStack: [] };
    const desc = [];

    for (const line of isolated) {
      const value = normalize(line);
      if (!value || noiseTokenRegex.test(value)) continue;

      if (techLineRegex.test(value)) {
        const stack = value.replace(techLineRegex, '').replace(/^[:\-\s]+/, '').trim();
        if (stack) {
          stack.split(/[;,|/]/).map((x) => normalize(x)).filter(Boolean).forEach((x) => exp.techStack.push(x));
        }
        continue;
      }

      const ranges = extractDateRanges(value);
      if (ranges.length > 0 && !exp.dates) {
        exp.dates = ranges[0];
        if (ranges.length > 1) queuedDates.push(...ranges.slice(1));
      }

      const noDates = removeDates(value);
      if (!noDates) continue;

      if (!exp.location && classifyLocation(noDates)) {
        exp.location = cleanLocation(noDates);
        continue;
      }

      if (!exp.company && classifyCompany(noDates)) {
        exp.company = cleanCompany(noDates);
        continue;
      }

      if (!exp.title && classifyRole(noDates)) {
        exp.title = cleanRole(noDates);
        continue;
      }

      const descValue = noDates.replace(/^•\s*/, '').trim();
      if (descValue && !noiseTokenRegex.test(descValue)) desc.push(descValue);
    }

    if (!exp.dates && queuedDates.length > 0) exp.dates = queuedDates.shift();
    const titleNorm = normalize(exp.title || '').toLowerCase();
    exp.description = desc
      .map((d) => {
        const n = normalize(d);
        if (!titleNorm) return n;
        const low = n.toLowerCase();
        if (low === titleNorm) return '';
        if (low.startsWith(`${titleNorm} `)) return n.slice(titleNorm.length).trim();
        return n;
      })
      .filter(Boolean)
      .join(' ')
      .replace(/\s+/g, ' ')
      .replace(/\s+([,.;:!?])/g, '$1')
      .trim();
    exp.techStack = Array.from(new Set(exp.techStack.map((x) => normalize(x)).filter((x) => x && !noiseTokenRegex.test(x))));

    // PASS 3: strict structured output filter.
    if (!exp.title && !exp.company && !exp.location && !exp.dates && !exp.description && exp.techStack.length === 0) continue;
    if (!exp.company && exp.description && !exp.title) continue;
    experiences.push(exp);
  }

  return experiences;
};

// ===== WORK EXPERIENCE RENDERING WITH STRUCTURED LAYOUT =====
const renderWorkExperience = (input) => {
  const normalizeDisplayDate = (value) => {
    const raw = String(value || '').trim();
    if (!raw) return null;
    return raw;
  };

  const normalizeDisplayTitle = (value) => {
    const raw = String(value || '').replace(/\s+/g, ' ').trim();
    if (!raw) return null;
    return raw;
  };

  const normalizeDisplayCompany = (value) => {
    const raw = String(value || '').replace(/\s+/g, ' ').trim();
    if (!raw) return null;
    return raw;
  };

  const normalizeDisplayLocation = (value) => {
    const raw = String(value || '').replace(/\s+/g, ' ').trim();
    if (!raw) return null;
    return raw;
  };

  const normalizeDisplayDescription = (value) => {
    const raw = String(value || '')
      .replace(/\|+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    return raw || null;
  };

  const normalizeDisplayTech = (items) => {
    const blacklist = new Set(['internal', '|', '.']);
    return Array.from(new Set((Array.isArray(items) ? items : [])
      .map((item) => String(item || '').replace(/\|+/g, ' ').replace(/\s+/g, ' ').trim())
      .filter((item) => item && !blacklist.has(item.toLowerCase()))));
  };

  // Input may be raw text or an array of structured experiences
  let experiences = [];
  if (Array.isArray(input)) {
    experiences = input;
  } else {
    experiences = parseWorkExperiences(input);
  }

  experiences = (experiences || []).map((exp) => ({
    title: normalizeDisplayTitle(exp?.title),
    company: normalizeDisplayCompany(exp?.company),
    dates: normalizeDisplayDate(exp?.dates),
    location: normalizeDisplayLocation(exp?.location),
    description: normalizeDisplayDescription(exp?.description),
    techStack: normalizeDisplayTech(exp?.techStack),
  }));

  if (!experiences || experiences.length === 0) {
    return <p className="cand-detail-empty">No work experience provided.</p>;
  }

  return (
    <div className="cand-work-experience-container">
      {experiences.map((exp, idx) => (
        <div key={idx} className="cand-experience-block">
          <div className="cand-experience-content">
            {exp.title && <p className="cand-experience-paragraph" style={{ fontWeight: 700 }}>{exp.title}</p>}
            {exp.company && (
              <p className="cand-experience-paragraph" style={{ fontWeight: 700 }}>
                {exp.company}
              </p>
            )}
            {exp.dates && (
              <p className="cand-experience-paragraph" style={{ fontStyle: 'italic', color: 'var(--text-muted)' }}>{exp.dates}</p>
            )}
            {exp.location && (
              <p className="cand-experience-paragraph" style={{ fontWeight: 700 }}>
                {exp.location}
              </p>
            )}
            {exp.description && <p className="cand-experience-paragraph">{exp.description}</p>}
            {exp.techStack && exp.techStack.length > 0 && (
              <div style={{ marginTop: 8 }}>
                <div style={{ marginBottom: 6 }}>Tech Stack</div>
                <div className="cand-skills-container">
                  {exp.techStack.map((t, i) => (
                    <div key={i} className="cand-skill-chip">{t}</div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

// ===== EDUCATION RENDERING WITH STRUCTURED LAYOUT =====
const renderEducation = (text) => {
  if (!text) {
    return <p className="cand-detail-empty">No education provided.</p>;
  }

  let content = String(text);

  // Normalize excessive newlines (3+ to 2)
  content = content.replace(/\n\n\n+/g, '\n\n');

  // Split by double newlines to identify separate education entries
  let entries = content.split(/\n\n+/).filter(entry => entry.trim());

  if (entries.length === 0) {
    return <p className="cand-detail-empty">No education provided.</p>;
  }

  return (
    <div className="cand-education-container">
      {entries.map((entry, index) => {
        // Split each education entry into lines
        const lines = entry
          .split('\n')
          .map(line => line.trim())
          .filter(line => line.length > 0);

        return (
          <div key={index} className="cand-education-entry">
            {lines.map((line, lineIdx) => (
              <p
                key={lineIdx}
                className={`cand-education-line ${lineIdx === 0 ? 'cand-education-line--first' : ''}`}
              >
                {line}
              </p>
            ))}
          </div>
        );
      })}
    </div>
  );
};

// --- DETAIL PAGE ---
/* eslint-disable no-unused-vars */
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
            {renderSkillsChips(candidate.skills)}
          </div>
        </div>

        {/* Work Experience Card */}
        <div className="cand-detail-card cand-full-width">
          <h2 className="cand-detail-title">Work Experience</h2>
          <div className="cand-detail-text">
            {renderWorkExperience(candidate.work_experience)}
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
            {(() => {
              const recordingType = interviewAnalysis.recording?.type || (interviewAnalysis.video?.available ? 'video' : 'voice');
              return (
                <>
            {/* Overall Score Card */}
            <div className="cand-detail-card cand-full-width cand-interview-header">
              <h2 className="cand-detail-title">Interview Results</h2>
              <div className="cand-interview-score">
                <div className="cand-interview-score-value">{interviewAnalysis.overallScore}</div>
                <div className="cand-interview-score-label">Overall Score</div>
              </div>
            </div>

            {/* Interview Recording */}
            {interviewAnalysis.recording?.available && (
              <div className="cand-detail-card cand-full-width">
                <h2 className="cand-detail-title">
                  {recordingType === 'voice' ? 'Interview Audio' : 'Interview Recording'}
                  {(interviewAnalysis.recording.duration || 0) > 0 && (
                    <span className="cand-video-duration">
                      ({Math.floor(interviewAnalysis.recording.duration / 60)}:{String(Math.floor(interviewAnalysis.recording.duration % 60)).padStart(2, '0')})
                    </span>
                  )}
                </h2>
                <div className="cand-video-container">
                  {recordingType === 'voice' ? (
                    <audio controls preload="auto" style={{ width: '100%' }}>
                      <source src={`http://localhost:5000${interviewAnalysis.recording.url}`} type={interviewAnalysis.recording.mimeType || 'audio/webm'} />
                      Your browser does not support the audio tag.
                    </audio>
                  ) : (
                    <video controls preload="auto" playsInline className="cand-video">
                      <source src={`http://localhost:5000${interviewAnalysis.recording.url}`} type={interviewAnalysis.recording.mimeType || 'video/webm'} />
                      Your browser does not support the video tag.
                    </video>
                  )}
                </div>
                <div className="cand-video-actions">
                  <a 
                    href={`http://localhost:5000${interviewAnalysis.recording.url}`}
                    download={`interview-${candidate?.name?.replace(/\s+/g, '_')}.${recordingType === 'voice' ? 'webm' : 'webm'}`}
                    className="cand-download-btn"
                  >
                    {recordingType === 'voice' ? 'Download Audio' : 'Download Video'}
                  </a>
                </div>
              </div>
            )}

            {/* Metrics Cards */}
            {recordingType === 'video' && (
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
            )}

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
              );
            })()}
          </>
        ) : null}
      </div>
    </div>
  );
};

export default Candidates;
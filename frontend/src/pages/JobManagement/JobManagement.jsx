import React, { useState, useRef, useEffect } from "react";
import "./JobManagement.css";

const JobManagement = () => {
  const [jobs, setJobs] = useState([]);
  const [jobName, setJobName] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [interviewType, setInterviewType] = useState("video");
  const [cvFiles, setCvFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    refreshJobs();
  }, []);

  const refreshJobs = () => {
    fetch("http://localhost:5000/api/jobs")
      .then((r) => r.json())
      .then(setJobs)
      .catch(() => {});
  };

  const handleAddJob = async () => {
    if (!jobName.trim() || !jobDescription.trim()) {
      alert("Please enter both job name and description.");
      return;
    }
    if (cvFiles.length === 0) {
      alert("Please upload at least one CV before posting the job.");
      return;
    }

    setIsLoading(true);
    const formData = new FormData();
    formData.append("title", jobName);
    formData.append("description", jobDescription);
    formData.append("interviewType", interviewType);
    cvFiles.forEach((file) => formData.append("cvs", file));

    try {
      const res = await fetch("http://localhost:5000/api/jobs", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Upload failed");
      
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
      refreshJobs();
      setJobName("");
      setJobDescription("");
      setInterviewType("video");
      setCvFiles([]);
    } catch (err) {
      alert(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this job?")) return;
    try {
      await fetch(`http://localhost:5000/api/jobs/${id}`, { method: "DELETE" });
      refreshJobs();
    } catch (e) {
      alert("Failed to delete job");
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files).filter(
      (file) => file.type === "application/pdf"
    );
    if (files.length > 0) {
      setCvFiles((prev) => [...prev, ...files]);
    }
  };

  const removeFile = (index) => {
    setCvFiles((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="jm-container">
      {/* Success Toast */}
      {showSuccess && (
        <div className="jm-toast">
          <span className="jm-toast-icon">✓</span>
          Job posted successfully!
        </div>
      )}

      {/* Header */}
      <header className="jm-header">
        <div className="jm-header-content">
          <h1 className="jm-title">
            Job <span className="jm-gradient-text">Management</span>
          </h1>
          <p className="jm-subtitle">
            Create jobs, upload CVs, and let AI find the best candidates
          </p>
        </div>
      </header>

      {/* Main Content */}
      <div className="jm-content">
        {/* Create Job Card */}
        <div className="jm-card jm-form-card">
          <div className="jm-card-header">
            <h2>Create New Job</h2>
          </div>

          <div className="jm-form">
            <div className="jm-form-group">
              <label className="jm-label">
                Job Title
              </label>
              <input
                type="text"
                className="jm-input"
                placeholder="e.g., Senior React Developer"
                value={jobName}
                onChange={(e) => setJobName(e.target.value)}
              />
            </div>

            <div className="jm-form-group">
              <label className="jm-label">
                Job Description
              </label>
              <textarea
                className="jm-textarea"
                placeholder="Paste the complete job description here including requirements, responsibilities, and qualifications..."
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
              />
            </div>

            <div className="jm-form-group">
              <label className="jm-label">
                Interview Type
              </label>
              <div className="jm-toggle-group" role="group" aria-label="Interview Type">
                <button
                  type="button"
                  className={`jm-toggle-btn ${interviewType === "video" ? "jm-toggle-active" : ""}`}
                  onClick={() => setInterviewType("video")}
                >
                  Video Interview
                </button>
                <button
                  type="button"
                  className={`jm-toggle-btn ${interviewType === "voice" ? "jm-toggle-active" : ""}`}
                  onClick={() => setInterviewType("voice")}
                >
                  Voice Interview
                </button>
              </div>
            </div>

            <div className="jm-form-group">
              <label className="jm-label">
                Upload CVs
              </label>
              <div
                className={`jm-upload-zone ${isDragging ? "jm-dragging" : ""} ${
                  cvFiles.length > 0 ? "jm-has-files" : ""
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept=".pdf"
                  onChange={(e) =>
                    setCvFiles((prev) => [...prev, ...Array.from(e.target.files)])
                  }
                  style={{ display: "none" }}
                />
                <div className="jm-upload-content">
                  <p className="jm-upload-text">
                    {isDragging
                      ? "Drop your CVs here!"
                      : "Drag & drop PDF files or click to browse"}
                  </p>
                  <span className="jm-upload-hint">
                    Supports multiple PDF files
                  </span>
                </div>
              </div>

              {/* File List */}
              {cvFiles.length > 0 && (
                <div className="jm-file-list">
                  <div className="jm-file-count">
                    <span className="jm-file-badge">{cvFiles.length}</span>
                    CV{cvFiles.length > 1 ? "s" : ""} selected
                  </div>
                  <div className="jm-files">
                    {cvFiles.map((file, index) => (
                      <div key={index} className="jm-file-item">
                        <span className="jm-file-name">{file.name}</span>
                        <button
                          className="jm-file-remove"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeFile(index);
                          }}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <button
              className={`jm-submit-btn ${isLoading ? "jm-loading" : ""}`}
              onClick={handleAddJob}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="jm-spinner"></span>
                  Processing CVs...
                </>
              ) : (
                "Post Job & Analyze CVs"
              )}
            </button>
          </div>
        </div>

        {/* Jobs List Card */}
        <div className="jm-card jm-jobs-card">
          <div className="jm-card-header">
            <h2>Active Jobs</h2>
            <span className="jm-job-count">{jobs.length}</span>
          </div>

          {jobs.length === 0 ? (
            <div className="jm-empty-state">
              <h3>No Jobs Yet</h3>
              <p>Create your first job to start receiving candidates</p>
            </div>
          ) : (
            <div className="jm-jobs-list">
              {jobs.map((job, index) => (
                <div
                  key={job._id || job.id}
                  className="jm-job-item"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="jm-job-info">
                    <div className="jm-job-avatar">
                      {job.title?.[0]?.toUpperCase() || job.name?.[0]?.toUpperCase() || "J"}
                    </div>
                    <div className="jm-job-details">
                      <h3 className="jm-job-title">{job.title || job.name}</h3>
                      <div className="jm-job-meta">
                        <span className="jm-job-candidates">
                          {job.candidates?.length || 0} candidates
                        </span>
                        <span className="jm-job-mode">
                          {(job.interviewType || "video") === "voice" ? "Voice" : "Video"} mode
                        </span>
                        <span className="jm-job-status">
                          <span className="jm-status-dot"></span>
                          Active
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="jm-job-actions">
                    <button
                      className="jm-action-btn jm-delete-btn"
                      onClick={() => handleDelete(job._id || job.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default JobManagement;

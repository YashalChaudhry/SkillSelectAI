import React, { useState } from "react";
import "./JobManagement.css";

const JobManagement = () => {
  const [jobs, setJobs] = useState([]);

  React.useEffect(() => {
    fetch("http://localhost:5000/api/jobs")
      .then(r => r.json())
      .then(setJobs)
      .catch(() => {});
  }, []);
  const [jobName, setJobName] = useState("");
  const [jobDescription, setJobDescription] = useState("");
// State for CV uploads only
const [cvFiles, setCvFiles] = useState([]);

const refreshJobs = ()=>{
  fetch("http://localhost:5000/api/jobs").then(r=>r.json()).then(setJobs).catch(()=>{});
};

  // Function to handle adding a job
  const handleAddJob = async () => {
    if (!jobName.trim() || !jobDescription.trim()) {
      alert("Please enter both job name and description text.");
      return;
    }
    if (cvFiles.length === 0) {
      alert("Please upload at least one CV before posting the job.");
      return;
    }

    const formData = new FormData();
    formData.append("title", jobName);
    formData.append("description", jobDescription);
    cvFiles.forEach((file) => formData.append("cvs", file));

    try {
      const res = await fetch("http://localhost:5000/api/jobs", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Upload failed");
      }
      alert("Job posted successfully!");
      refreshJobs();
      // reset
      setJobName("");
      setJobDescription("");
      setCvFiles([]);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDelete = async(id)=>{
    if(!window.confirm("Delete this job?")) return;
    try{
      await fetch(`http://localhost:5000/api/jobs/${id}`, { method:"DELETE"});
      refreshJobs();
    }catch(e){alert("Failed to delete");}
  };

  return (
    <div className="job-management-container">
      <div className="page-header">
        <h1>JOB MANAGEMENT</h1>
      </div>

      <div className="job-management-content">
        {/* ============ ADD JOB FORM ============ */}
        <div className="job-form">
          <h2 className="section-heading">Add a Job</h2>

          <div className="form-group">
            <label htmlFor="job-name">Job Name</label>
            <input
              type="text"
              id="job-name"
              placeholder="Enter the job name"
              className="job-input"
              value={jobName}
              onChange={(e) => setJobName(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label htmlFor="job-description">Job Description</label>
            <textarea
              id="job-description"
              placeholder="Write or paste the job description here..."
              className="job-textarea"
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
            ></textarea>
          </div>

          {/* Hidden input for CV selection */}
          <input
            type="file"
            id="cv-files"
            style={{ display: "none" }}
            multiple
            accept=".pdf"
            onChange={(e) => setCvFiles(Array.from(e.target.files))}
          />

          <div className="form-group">
            <div className="upload-box" onClick={() => document.getElementById('cv-files').click()}>
              <p>Drag & Drop CVs here or click to upload</p>
            </div>
            {cvFiles.length > 0 && <small style={{ color: '#0f0' }}>{cvFiles.length} CV(s) selected</small>}
          </div>

          {/* ✅ Submit Button */}
          <button className="submit-btn" onClick={handleAddJob}>
            + Add Job
          </button>
        </div>

        {/* ============ EXISTING JOBS LIST ============ */}
        <div className="jobs-list-section">
          <h2 className="section-heading">Existing Jobs</h2>

          {jobs.length === 0 ? (
            <p className="no-jobs">📂 No jobs have been added yet.</p>
          ) : (
            <>
              <div className="job-list-header">
                <span className="job-list-title">Job Name</span>
                <span className="job-list-actions">Actions</span>
              </div>

              <div className="job-list">
                {jobs.map((job) => (
                  <div key={job.id} className="job-card">
                    <div className="job-name">{job.name}</div>
                    <button className="action-btn delete-btn" onClick={() => handleDelete(job._id)}>
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default JobManagement;

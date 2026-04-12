// frontend/src/pages/Interviews/Interviews.jsx
import React, { useState, useEffect } from 'react';
import './Interviews.css';
import SendInvitesButton from '../../components/SendInvitesButton';

const Interviews = () => {
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: 'all',
    difficulty: 'all',
    type: 'all',
    search: ''
  });
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [editForm, setEditForm] = useState({
    text: '',
    skill: '',
    difficulty: 'Medium',
    type: 'Technical'
  });
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [showValidationDetails, setShowValidationDetails] = useState(false);
  const [invitesSent, setInvitesSent] = useState({});

  // Handle invite sent callback
  const handleInvitesSent = (jobId) => {
    setInvitesSent(prev => ({
      ...prev,
      [jobId]: true
    }));
  };

  // Fetch jobs
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:5000/api/jobs');
        const data = await response.json();
        setJobs(data);
      } catch (error) {
        console.error('Error fetching jobs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  // Fetch questions for selected job
  const fetchQuestions = async (jobId) => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:5000/api/questions/jobs/${jobId}/questions`);
      const data = await response.json();
      // Ensure we always set an array
      setQuestions(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching questions:', error);
      setQuestions([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  // Handle job selection
  const handleJobSelect = (job) => {
    setSelectedJob(job);
    fetchQuestions(job._id);
  };

  // Close modal
  const closeModal = () => {
    setSelectedJob(null);
    setQuestions([]);
    setFilters({
      status: 'all',
      difficulty: 'all',
      type: 'all',
      search: ''
    });
  };

  // Handle question status update
  const handleStatusUpdate = async (questionId, status, rejectionReason = '') => {
    try {
      const response = await fetch(`http://localhost:5000/api/questions/${questionId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status, ...(rejectionReason && { rejectionReason }) })
      });
      
      if (response.ok) {
        if (status === 'Rejected') {
          // Remove the rejected question from the list
          setQuestions((questions || []).filter(q => q._id !== questionId));
        } else {
          // Update the question status
          setQuestions((questions || []).map(q => 
            q._id === questionId ? { ...q, status, ...(rejectionReason && { rejectionReason }) } : q
          ));
        }
      }
    } catch (error) {
      console.error('Error updating question status:', error);
    }
  };

  // Handle question edit
  const handleEditQuestion = (question) => {
    setEditingQuestion(question);
    setEditForm({
      text: question.text,
      skill: question.skill,
      difficulty: question.difficulty,
      type: question.type
    });
  };

  // Handle save edited question
  const handleSaveEdit = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/${editingQuestion._id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editForm)
      });
      
      if (response.ok) {
        setQuestions((questions || []).map(q => 
          q._id === editingQuestion._id ? { ...q, ...editForm } : q
        ));
        setEditingQuestion(null);
      }
    } catch (error) {
      console.error('Error updating question:', error);
    }
  };

  // Helper method to get validation score class
  const getValidationScoreClass = (score) => {
    if (score >= 80) return 'high';
    if (score >= 60) return 'medium';
    return 'low';
  };

  // Filter questions based on filters
  const filteredQuestions = (questions || []).filter(question => {
    return (
      (filters.status === 'all' || question.status === filters.status) &&
      (filters.difficulty === 'all' || question.difficulty === filters.difficulty) &&
      (filters.type === 'all' || question.type === filters.type) &&
      ((question.text && question.text.toLowerCase().includes(filters.search.toLowerCase())) ||
      (question.skill && question.skill.toLowerCase().includes(filters.search.toLowerCase())))
    );
  });

  // Count approved questions
  const approvedCount = (questions || []).filter(q => q.status === 'Approved').length;

  if (loading && jobs.length === 0) {
    return (
      <div className="interviews-page">
        <div className="loading-container">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="interviews-page">
      <div className="page-header">
        <h1>Interview Management</h1>
        <p>Review and manage interview questions for your job positions</p>
      </div>

      <div className="jobs-grid">
        {jobs.length === 0 ? (
          <div className="no-jobs">
            <h2>No Jobs Available</h2>
            <p>Create a job position to start generating interview questions</p>
          </div>
        ) : (
          jobs.map(job => (
            <div 
              key={job._id}
              className="job-card"
              onClick={() => handleJobSelect(job)}
            >
              <div className="job-header">
                <div className="title-section">
                  <h3>{job.title}</h3>
                  <span className="job-status">{job.status || 'Active'}</span>
                </div>
              </div>
              <p className="job-description">
                {job.description?.substring(0, 120)}...
              </p>
              <div className="job-footer">
                {job.candidates?.length > 0 && (
                  <span className="candidate-count">{job.candidates.length} candidates</span>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal Overlay */}
      {selectedJob && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">
                <h2>{selectedJob.title}</h2>
                <span className="modal-subtitle">Interview Questions Management</span>
              </div>
              <button className="close-button" onClick={closeModal}>
                <span>×</span>
              </button>
            </div>

            <div className="filters-section">
              <div className="filter-group">
                <label>Status</label>
                <select 
                  value={filters.status} 
                  onChange={(e) => setFilters({...filters, status: e.target.value})}
                >
                  <option value="all">All Status</option>
                  <option value="Pending">Pending</option>
                  <option value="Approved">Approved</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>

              <div className="filter-group">
                <label>Difficulty</label>
                <select 
                  value={filters.difficulty} 
                  onChange={(e) => setFilters({...filters, difficulty: e.target.value})}
                >
                  <option value="all">All Levels</option>
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
              </div>

              <div className="filter-group">
                <label>Type</label>
                <select 
                  value={filters.type} 
                  onChange={(e) => setFilters({...filters, type: e.target.value})}
                >
                  <option value="all">All Types</option>
                  <option value="Conceptual">Conceptual</option>
                  <option value="Technical">Technical</option>
                  <option value="Scenario">Scenario</option>
                  <option value="Behavioral">Behavioral</option>
                </select>
              </div>

              <div className="filter-group search-group">
                <label>Search</label>
                <input 
                  type="text"
                  placeholder="Search questions..."
                  value={filters.search}
                  onChange={(e) => setFilters({...filters, search: e.target.value})}
                />
              </div>
            </div>

            <div className="questions-section">
              {loading ? (
                <div className="loading-questions">
                  <p>Loading questions...</p>
                </div>
              ) : questions.length === 0 ? (
                <div className="no-questions">
                  <h3>No Questions Yet</h3>
                  <p>Questions will be automatically generated when this job is processed</p>
                </div>
              ) : (
                <div className="questions-table-container">
                  <table className="questions-table">
                    <thead>
                      <tr>
                        <th style={{ width: '35%' }}>Question</th>
                        <th style={{ width: '12%' }}>Skill</th>
                        <th style={{ width: '10%' }}>Difficulty</th>
                        <th style={{ width: '10%' }}>Type</th>
                        <th style={{ width: '10%' }}>Status</th>
                        <th style={{ width: '23%' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredQuestions.map((question) => (
                        <tr key={question._id}>
                          <td className="question-text">{question.text}</td>
                          <td className="skill-column">
                            <span className="skill-tag">{question.skill}</span>
                          </td>
                          <td>
                            <span className={`difficulty-badge ${question.difficulty.toLowerCase()}`}>
                              {question.difficulty}
                            </span>
                          </td>
                          <td className="question-type">{question.type}</td>
                          <td>
                            <span className={`status-badge ${question.status.toLowerCase()}`}>
                              {question.status}
                            </span>
                            {question.rejectionReason && (
                              <div className="rejection-reason">{question.rejectionReason}</div>
                            )}
                          </td>
                          <td className="actions-cell">
                            <div className="action-buttons">
                              {question.status === 'Approved' ? (
                                <button 
                                  className="btn btn-unapprove"
                                  onClick={() => handleStatusUpdate(question._id, 'Pending')}
                                >
                                  Unapprove
                                </button>
                              ) : (
                                <button 
                                  className="btn btn-approve"
                                  onClick={() => handleStatusUpdate(question._id, 'Approved')}
                                >
                                  Approve
                                </button>
                              )}
                              {question.status !== 'Rejected' && (
                                <button 
                                  className="btn btn-reject"
                                  onClick={() => handleStatusUpdate(question._id, 'Rejected')}
                                >
                                  Reject
                                </button>
                              )}
                              <button 
                                className="btn btn-edit"
                                onClick={() => handleEditQuestion(question)}
                              >
                                Edit
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              
              {/* Send Invites Button - Only show if there are questions */}
              {questions.length > 0 && (
                <div className="send-invites-section">
                  <div className="send-invites-container">
                    <div className="invite-info">
                      <span className="approved-count">
                        {approvedCount} / 30 questions approved (10 will be used per interview)
                      </span>
                    </div>
                    <SendInvitesButton 
                      key={`send-invites-${selectedJob._id}`}
                      jobId={selectedJob._id} 
                      hasInvitesSent={invitesSent[selectedJob._id] || false}
                      jobName={selectedJob.title}
                      onInvitesSent={handleInvitesSent}
                      approvedCount={approvedCount}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Edit Question Modal */}
      {editingQuestion && (
        <div className="modal-overlay" onClick={() => setEditingQuestion(null)}>
          <div className="modal-content edit-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Edit Question</h2>
              <button className="close-button" onClick={() => setEditingQuestion(null)}>
                <span>×</span>
              </button>
            </div>

            <div className="edit-form">
              <div className="form-group">
                <label>Question Text</label>
                <textarea
                  value={editForm.text}
                  onChange={(e) => setEditForm({...editForm, text: e.target.value})}
                  rows={4}
                  placeholder="Enter the interview question..."
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Skill</label>
                  <input
                    type="text"
                    value={editForm.skill}
                    onChange={(e) => setEditForm({...editForm, skill: e.target.value})}
                    placeholder="e.g., React, JavaScript"
                  />
                </div>

                <div className="form-group">
                  <label>Difficulty</label>
                  <select
                    value={editForm.difficulty}
                    onChange={(e) => setEditForm({...editForm, difficulty: e.target.value})}
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Type</label>
                <select
                  value={editForm.type}
                  onChange={(e) => setEditForm({...editForm, type: e.target.value})}
                >
                  <option value="Conceptual">Conceptual</option>
                  <option value="Technical">Technical</option>
                  <option value="Scenario">Scenario</option>
                  <option value="Behavioral">Behavioral</option>
                </select>
              </div>

              <div className="form-actions">
                <button className="btn btn-cancel" onClick={() => setEditingQuestion(null)}>
                  Cancel
                </button>
                <button className="btn btn-primary" onClick={handleSaveEdit}>
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Question Details Modal */}
      {selectedQuestion && (
        <div className="modal-overlay" onClick={() => setSelectedQuestion(null)}>
          <div className="modal-content details-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Question Details</h2>
              <button className="close-button" onClick={() => setSelectedQuestion(null)}>
                <span>×</span>
              </button>
            </div>

            <div className="question-details">
              <div className="detail-section">
                <h3>Question Text</h3>
                <p className="question-text-full">{selectedQuestion.text}</p>
              </div>

              <div className="detail-grid">
                <div className="detail-item">
                  <label>Skill</label>
                  <span className="skill-tag">{selectedQuestion.skill}</span>
                </div>
                <div className="detail-item">
                  <label>Difficulty</label>
                  <span className={`difficulty-badge ${selectedQuestion.difficulty.toLowerCase()}`}>
                    {selectedQuestion.difficulty}
                  </span>
                </div>
                <div className="detail-item">
                  <label>Type</label>
                  <span className="question-type">{selectedQuestion.type}</span>
                </div>
                <div className="detail-item">
                  <label>Status</label>
                  <span className={`status-badge ${selectedQuestion.status.toLowerCase()}`}>
                    {selectedQuestion.status}
                  </span>
                </div>
              </div>

              <div className="detail-section">
                <h3>Validation Information</h3>
                <div className="validation-details">
                  <div className="validation-metrics">
                    <div className="metric">
                      <label>Validation Score</label>
                      <div className={`validation-score ${getValidationScoreClass(selectedQuestion.metadata?.validationScore || 0)}`}>
                        {selectedQuestion.metadata?.validationScore || 'N/A'}/100
                      </div>
                    </div>
                    <div className="metric">
                      <label>Difficulty Score</label>
                      <div className="difficulty-score">
                        {selectedQuestion.metadata?.difficultyScore || 'N/A'}
                      </div>
                    </div>
                    <div className="metric">
                      <label>Generated</label>
                      <div className="generation-date">
                        {new Date(selectedQuestion.metadata?.generatedAt || selectedQuestion.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  {selectedQuestion.templateId && selectedQuestion.templateId.text && (
                    <div className="template-details">
                      <h4>Template Information</h4>
                      <p><strong>Template:</strong> {selectedQuestion.templateId.text}</p>
                      <p><strong>Category:</strong> {selectedQuestion.templateId.category}</p>
                      <p><strong>Type:</strong> {selectedQuestion.templateId.type}</p>
                      <p><strong>Difficulty:</strong> {selectedQuestion.templateId.difficulty}</p>
                    </div>
                  )}

                  {showValidationDetails && selectedQuestion.validationDetails && (
                    <div className="validation-issues">
                      <h4>Validation Issues</h4>
                      {selectedQuestion.validationDetails.issues?.length > 0 ? (
                        <ul className="issues-list">
                          {selectedQuestion.validationDetails.issues.map((issue, index) => (
                            <li key={index} className={`issue ${issue.severity}`}>
                              <span className="issue-type">{issue.type}:</span>
                              <span className="issue-message">{issue.message}</span>
                              {issue.suggestion && (
                                <span className="issue-suggestion">Suggestion: {issue.suggestion}</span>
                              )}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="no-issues">No validation issues found</p>
                      )}
                    </div>
                  )}

                  <div className="validation-actions">
                    <button 
                      className="btn btn-secondary"
                      onClick={() => setShowValidationDetails(!showValidationDetails)}
                    >
                      {showValidationDetails ? 'Hide' : 'Show'} Validation Details
                    </button>
                  </div>
                </div>
              </div>

              {selectedQuestion.rejectionReason && (
                <div className="detail-section">
                  <h3>Rejection Reason</h3>
                  <p className="rejection-reason-full">{selectedQuestion.rejectionReason}</p>
                </div>
              )}
            </div>

            <div className="modal-actions">
              <button className="btn btn-cancel" onClick={() => setSelectedQuestion(null)}>
                Close
              </button>
              <button className="btn btn-edit"
                onClick={() => {
                  handleEditQuestion(selectedQuestion);
                  setSelectedQuestion(null);
                }}
              >
                Edit Question
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Interviews;

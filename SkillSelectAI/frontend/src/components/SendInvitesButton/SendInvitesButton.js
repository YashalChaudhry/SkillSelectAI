import React, { useState } from 'react';
import './SendInvitesButton.css';

const SendInvitesButton = ({ jobId, hasInvitesSent, jobName, onInvitesSent, approvedCount = 0 }) => {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(hasInvitesSent);
  const [showConfirm, setShowConfirm] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const isDisabled = approvedCount < 10 || sent || loading;

  const handleSendInvites = async () => {
    setShowConfirm(false);
    setLoading(true);
    setErrorMessage('');
    
    try {
      console.log('📧 Sending invites for job:', jobId);
      
      const url = 'http://localhost:5000/api/interviews/send-invites';
      console.log('🔗 Calling endpoint:', url);
      
      const res = await fetch(url, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ jobId })
      });

      console.log('📊 Response status:', res.status);

      const data = await res.json();
      console.log('📦 Response data:', data);

      if (res.status === 409) {
        setErrorMessage("Invites were already sent for this job!");
        setSent(true);
        if (onInvitesSent) {
          onInvitesSent(jobId);
        }
        return;
      }

      if (res.ok && data.success) {
        setSent(true);
        setSuccessMessage(`Invites sent successfully to ${data.data?.length || 0} candidates!`);
        
        // Call the callback to update parent component
        if (onInvitesSent) {
          onInvitesSent(jobId);
        }
        
        // Hide success message after 4 seconds
        setTimeout(() => {
          setSuccessMessage('');
        }, 4000);
      } else {
        setErrorMessage(data.message || "Failed to send invites");
      }
    } catch (err) {
      console.error("❌ Error sending invites:", err);
      setErrorMessage(err.message || "Error sending invites. Check console for details.");
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <button disabled className="invite-btn invite-btn-sent">
        Invites Sent
      </button>
    );
  }

  return (
    <>
      {!showConfirm && !sent && (
        <div className="invite-button-wrapper">
          <button 
            onClick={() => setShowConfirm(true)} 
            disabled={isDisabled}
            className={`invite-btn ${isDisabled ? 'invite-btn-disabled' : 'invite-btn-active'}`}
            title={approvedCount < 10 ? `Approve ${10 - approvedCount} more question(s) to enable` : ''}
          >
            {loading ? 'Scheduling...' : 'Send Interview Invites'}
          </button>
          {successMessage && (
            <div className="invite-message invite-message-success">
              {successMessage}
            </div>
          )}
          {errorMessage && (
            <div className="invite-message invite-message-error">
              {errorMessage}
            </div>
          )}
        </div>
      )}

      {showConfirm && (
        <div className="invite-modal-overlay">
          <div className="invite-modal-content">
            <h3 className="invite-modal-title">Send Interview Invites</h3>
            <p className="invite-modal-text">
              Send interview invitations to all candidates for "{jobName || 'this job'}"?
            </p>
            <div className="invite-modal-actions">
              <button
                onClick={() => setShowConfirm(false)}
                disabled={loading}
                className="invite-modal-btn invite-modal-btn-cancel"
              >
                Cancel
              </button>
              <button
                onClick={handleSendInvites}
                disabled={loading}
                className="invite-modal-btn invite-modal-btn-confirm"
              >
                {loading ? 'Sending...' : 'Send Invites'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SendInvitesButton;

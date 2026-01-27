import React, { useState } from 'react';

const SendInvitesButton = ({ jobId, hasInvitesSent, jobName }) => {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(hasInvitesSent);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleSendInvites = async () => {
    setShowConfirm(false);
    setLoading(true);
    try {
      const res = await fetch('/api/interviews/send-invites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId })
      });

      if (res.status === 409) {
         alert("Invites were already sent for this job!");
         setSent(true);
         return;
      }

      if (res.ok) {
        setSent(true);
        alert("Invites sent successfully!");
      }
    } catch (err) {
      alert("Error sending invites");
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <button disabled className="bg-gray-600 text-white px-6 py-2 rounded cursor-not-allowed opacity-75">
        Invites Sent ✓
      </button>
    );
  }

  return (
    <>
      {!showConfirm && !sent && (
        <button 
          onClick={() => setShowConfirm(true)} 
          disabled={loading}
          className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded shadow-lg transition-all duration-200 disabled:bg-gray-600 disabled:opacity-75 disabled:cursor-not-allowed"
        >
          {loading ? 'Scheduling...' : 'Send Invites'}
        </button>
      )}

      {sent && (
        <button disabled className="bg-gray-600 text-white px-6 py-2 rounded cursor-not-allowed opacity-75">
          Invites Sent ✓
        </button>
      )}

      {showConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 max-w-sm mx-4">
            <h3 className="text-lg font-semibold text-white mb-2">Send Interview Invites</h3>
            <p className="text-gray-300 mb-4">
              Send interview invitations to all candidates for "{jobName || 'this job'}"?
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowConfirm(false)}
                disabled={loading}
                className="px-4 py-2 text-gray-300 border border-gray-600 rounded hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={handleSendInvites}
                disabled={loading}
                className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors disabled:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
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

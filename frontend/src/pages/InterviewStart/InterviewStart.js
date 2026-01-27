import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

const InterviewStart = () => {
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [interviewData, setInterviewData] = useState(null);
  const [startingInterview, setStartingInterview] = useState(false);

  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      setError('No interview token provided');
      setLoading(false);
      return;
    }

    validateInterview();
  }, [token]);

  const validateInterview = async () => {
    try {
      const response = await fetch(`/api/interviews/start?token=${token}`);
      
      if (response.status === 403) {
        const errorData = await response.json();
        setError('LINK_EXPIRED');
        return;
      }
      
      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to validate interview');
        return;
      }
      
      const data = await response.json();
      setInterviewData(data.data);
      
    } catch (err) {
      setError('Network error. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleStartInterview = () => {
    setStartingInterview(true);
    // Redirect to actual interview interface or start interview logic
    // For now, we'll just show a success message
    setTimeout(() => {
      // You can redirect to your actual interview interface here
      // window.location.href = '/interview/session';
      alert('Interview interface would load here');
    }, 1000);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Validating your interview link...</p>
        </div>
      </div>
    );
  }

  if (error === 'LINK_EXPIRED') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
              <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-red-600 mb-2">Link Expired</h1>
            <p className="text-gray-600 mb-6">You have already used this one-time link.</p>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-left">
              <h3 className="font-semibold text-red-800 mb-2">Important:</h3>
              <ul className="text-sm text-red-700 space-y-1">
                <li>• Each interview link can only be used once</li>
                <li>• Your interview session has already been started</li>
                <li>• If you believe this is an error, please contact support</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100 mb-4">
              <svg className="h-6 w-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-yellow-600 mb-2">Validation Error</h1>
            <p className="text-gray-600">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
            <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Interview Ready</h1>
          <p className="text-gray-600 mb-6">Your interview session is ready to begin.</p>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left mb-6">
            <h3 className="font-semibold text-blue-800 mb-2">Before you start:</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Ensure you have 60 minutes of uninterrupted time</li>
              <li>• Check your internet connection is stable</li>
              <li>• This link is valid for one session only</li>
            </ul>
          </div>

          <button
            onClick={handleStartInterview}
            disabled={startingInterview}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200"
          >
            {startingInterview ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Starting Interview...
              </span>
            ) : (
              'Start Interview'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default InterviewStart;

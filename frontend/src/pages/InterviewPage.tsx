import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import UnifiedInterviewInterface from '../components/UnifiedInterviewInterface';

const InterviewPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isValidating, setIsValidating] = useState(true);
  const [questionsReady, setQuestionsReady] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true);
  const candidateID = searchParams.get('candidateID');
  const jobID = searchParams.get('jobID');

  useEffect(() => {
    const initializeInterview = async () => {
      if (!candidateID || !jobID) {
        navigate('/error?message=Invalid interview link');
        return;
      }

      try {
        // Check if questions exist
        const checkRes = await fetch(`http://localhost:5000/api/questions/jobs/${jobID}/check`);
        const checkData = await checkRes.json();

        if (!checkData.exists) {
          console.log('No questions found, generating...');
          // Generate questions
          const genRes = await fetch(`http://localhost:5000/api/questions/jobs/${jobID}/generate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
          });
          const genData = await genRes.json();
          console.log('Questions generated:', genData);
        }

        setQuestionsReady(true);
      } catch (error) {
        console.error('Error initializing interview:', error);
        navigate('/error?message=Failed to initialize interview');
      } finally {
        setIsValidating(false);
      }
    };

    initializeInterview();
  }, [candidateID, jobID, navigate]);

  if (isValidating || !questionsReady || !candidateID || !jobID) {
    return <div>Loading interview...</div>;
  }

  if (showInstructions) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundImage: "url('/LandingPage.png')",
        backgroundAttachment: 'fixed',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundColor: '#0f0720',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        color: '#e1d8f7'
      }}>
        <div style={{
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          borderRadius: '16px',
          padding: '24px',
          maxWidth: '500px',
          width: '100%',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.1) inset'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <h1 style={{ 
              color: '#e1d8f7', 
              marginBottom: '8px', 
              fontSize: '1.8rem',
              fontWeight: '700',
              letterSpacing: '-0.02em'
            }}>
              Interview Assessment
            </h1>
            <p style={{ 
              color: '#c0a7eb', 
              fontSize: '0.9rem',
              margin: 0,
              opacity: 0.9
            }}>
              Please review the instructions before beginning
            </p>
          </div>
          
          <div style={{ marginBottom: '20px' }}>
            <div style={{ 
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 1fr',
              gap: '12px',
              marginBottom: '20px'
            }}>
              <div style={{
                background: 'rgba(192, 167, 235, 0.15)',
                border: '1px solid rgba(192, 167, 235, 0.3)',
                borderRadius: '8px',
                padding: '16px',
                textAlign: 'center'
              }}>
                <div style={{ 
                  fontSize: '1.5rem', 
                  fontWeight: '700', 
                  color: '#c0a7eb',
                  marginBottom: '4px'
                }}>10</div>
                <div style={{ 
                  fontSize: '0.8rem', 
                  color: '#e1d8f7',
                  opacity: 0.9
                }}>Questions</div>
              </div>
              <div style={{
                background: 'rgba(192, 167, 235, 0.15)',
                border: '1px solid rgba(192, 167, 235, 0.3)',
                borderRadius: '8px',
                padding: '16px',
                textAlign: 'center'
              }}>
                <div style={{ 
                  fontSize: '1.5rem', 
                  fontWeight: '700', 
                  color: '#c0a7eb',
                  marginBottom: '4px'
                }}>60s</div>
                <div style={{ 
                  fontSize: '0.8rem', 
                  color: '#e1d8f7',
                  opacity: 0.9
                }}>Per question</div>
              </div>
              <div style={{
                background: 'rgba(192, 167, 235, 0.15)',
                border: '1px solid rgba(192, 167, 235, 0.3)',
                borderRadius: '8px',
                padding: '16px',
                textAlign: 'center'
              }}>
                <div style={{ 
                  fontSize: '1.5rem', 
                  fontWeight: '700', 
                  color: '#c0a7eb',
                  marginBottom: '4px'
                }}>●</div>
                <div style={{ 
                  fontSize: '0.8rem', 
                  color: '#e1d8f7',
                  opacity: 0.9
                }}>Recording</div>
              </div>
            </div>
            
            <div style={{
              background: 'rgba(61, 52, 84, 0.2)',
              border: '1px solid rgba(61, 52, 84, 0.4)',
              borderRadius: '8px',
              padding: '16px'
            }}>
              <p style={{ 
                color: '#c0a7eb', 
                margin: 0, 
                fontSize: '0.9rem',
                lineHeight: '1.5',
                textAlign: 'center'
              }}>
                Answer questions at your own pace. Use "Next Question" to advance early. 
                <br />Position your camera at eye level and speak clearly.
              </p>
            </div>
          </div>

          <div style={{ textAlign: 'center' }}>
            <button 
              onClick={() => setShowInstructions(false)}
              style={{
                background: 'linear-gradient(135deg, #c0a7eb 0%, #9575cd 100%)',
                color: '#1a1625',
                border: 'none',
                padding: '12px 32px',
                fontSize: '0.95rem',
                fontWeight: '600',
                borderRadius: '6px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: '0 3px 12px rgba(192, 167, 235, 0.3)'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 4px 16px rgba(192, 167, 235, 0.4)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 3px 12px rgba(192, 167, 235, 0.3)';
              }}
            >
              Begin Interview
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ width: '100%', height: '100vh' }}>
      <UnifiedInterviewInterface candidateID={candidateID} jobID={jobID} />
    </div>
  );
};

export default InterviewPage;

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
  const interviewType = searchParams.get('interviewType') === 'voice' ? 'voice' : 'video';

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

  const landingBackgroundStyle: React.CSSProperties = {
    backgroundImage: "url('/LandingPage.png')",
    backgroundAttachment: 'fixed',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    backgroundColor: '#0f0720'
  };

  if (isValidating || !questionsReady || !candidateID || !jobID) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#FFFFFF',
        ...landingBackgroundStyle
      }}>
        Loading interview...
      </div>
    );
  }

  if (showInstructions) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        color: '#111827',
        ...landingBackgroundStyle
      }}>
        <div style={{
          background: '#FFFFFF',
          border: '1px solid #E5E7EB',
          borderRadius: '16px',
          padding: '24px',
          maxWidth: '500px',
          width: '100%',
          boxShadow: '0 10px 30px rgba(17, 24, 39, 0.1)'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <h1 style={{ 
              color: '#111827', 
              marginBottom: '8px', 
              fontSize: '1.8rem',
              fontWeight: '700',
              letterSpacing: '-0.02em'
            }}>
              Interview Assessment
            </h1>
            <p style={{ 
              color: '#6B7280', 
              fontSize: '0.9rem',
              margin: 0,
              opacity: 1
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
                background: '#F3F0FF',
                border: '1px solid #E5E7EB',
                borderRadius: '8px',
                padding: '16px',
                textAlign: 'center'
              }}>
                <div style={{ 
                  fontSize: '1.5rem', 
                  fontWeight: '700', 
                  color: '#111827',
                  marginBottom: '4px'
                }}>10</div>
                <div style={{ 
                  fontSize: '0.8rem', 
                  color: '#6B7280',
                  opacity: 1
                }}>Questions</div>
              </div>
              <div style={{
                background: '#F3F0FF',
                border: '1px solid #E5E7EB',
                borderRadius: '8px',
                padding: '16px',
                textAlign: 'center'
              }}>
                <div style={{ 
                  fontSize: '1.5rem', 
                  fontWeight: '700', 
                  color: '#111827',
                  marginBottom: '4px'
                }}>60s</div>
                <div style={{ 
                  fontSize: '0.8rem', 
                  color: '#6B7280',
                  opacity: 1
                }}>Per question</div>
              </div>
              <div style={{
                background: '#F3F0FF',
                border: '1px solid #E5E7EB',
                borderRadius: '8px',
                padding: '16px',
                textAlign: 'center'
              }}>
                <div style={{ 
                  fontSize: '1.5rem', 
                  fontWeight: '700', 
                  color: '#111827',
                  marginBottom: '4px'
                }}>●</div>
                <div style={{ 
                  fontSize: '0.8rem', 
                  color: '#6B7280',
                  opacity: 1
                }}>Recording</div>
              </div>
            </div>
            
            <div style={{
              background: '#F3F0FF',
              border: '1px solid #E5E7EB',
              borderRadius: '8px',
              padding: '16px'
            }}>
              <p style={{ 
                color: '#111827', 
                margin: 0, 
                fontSize: '0.9rem',
                lineHeight: '1.5',
                textAlign: 'center'
              }}>
                Answer questions at your own pace. Use "Next Question" to advance early. 
                <br />{interviewType === 'voice' ? 'Keep your microphone clear and speak confidently.' : 'Position your camera at eye level and speak clearly.'}
              </p>
            </div>
          </div>

          <div style={{ textAlign: 'center' }}>
            <button 
              onClick={() => setShowInstructions(false)}
              style={{
                background: '#7C3AED',
                color: '#FFFFFF',
                border: 'none',
                padding: '12px 32px',
                fontSize: '0.95rem',
                fontWeight: '600',
                borderRadius: '6px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: '0 3px 12px rgba(124, 58, 237, 0.3)'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 4px 16px rgba(124, 58, 237, 0.4)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 3px 12px rgba(124, 58, 237, 0.3)';
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
    <div style={{ width: '100%', minHeight: '100vh', ...landingBackgroundStyle }}>
      <UnifiedInterviewInterface candidateID={candidateID} jobID={jobID} />
    </div>
  );
};

export default InterviewPage;

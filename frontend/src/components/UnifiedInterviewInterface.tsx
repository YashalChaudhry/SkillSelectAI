import React, { useState, useEffect, useRef } from 'react';
import { fetchInterviewContext, submitInterviewResponse, saveInterviewScore, InterviewContext } from '../services/integrationController';
import './UnifiedInterviewInterface.css';

interface UnifiedInterviewInterfaceProps {
  candidateID: string;
  jobID: string;
}

const UnifiedInterviewInterface: React.FC<UnifiedInterviewInterfaceProps> = ({ candidateID, jobID }) => {
  const [context, setContext] = useState<InterviewContext | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(60);
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionProgress, setSubmissionProgress] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const recordingStartTimeRef = useRef<number>(0);

  // Initialize: Fetch interview context and start recording
  useEffect(() => {
    const initializeInterview = async () => {
      try {
        const interviewContext = await fetchInterviewContext(candidateID, jobID);
        setContext(interviewContext);
        await startRecording(interviewContext.interviewType);
        setIsLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to initialize interview');
        setIsLoading(false);
      }
    };

    initializeInterview();

    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      stopRecording();
    };
  }, [candidateID, jobID]);

  // Start single MediaRecorder stream (persistent across all questions)
  const startRecording = async (interviewType: 'video' | 'voice' = 'video') => {
    try {
      const mode = interviewType;
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: mode === 'video' });
      streamRef.current = stream;

      // Set video stream to video element
      if (mode === 'video' && videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      const mimeType = mode === 'voice'
        ? (MediaRecorder.isTypeSupported('audio/webm;codecs=opus') ? 'audio/webm;codecs=opus' : 'audio/webm')
        : (MediaRecorder.isTypeSupported('video/webm;codecs=vp8,opus')
            ? 'video/webm;codecs=vp8,opus'
            : 'video/webm');

      const recorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = recorder;
      recordedChunksRef.current = [];

      recorder.ondataavailable = (event) => {
        console.log('Data available:', event.data.size, 'bytes');
        if (event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };

      // Start recording WITHOUT timeslice to ensure proper webm container finalization
      // This creates a single proper webm file when stopped
      recorder.start();
      console.log('Recording started (continuous mode for proper webm format)');
      setIsRecording(true);
      recordingStartTimeRef.current = Date.now();
    } catch (err) {
      console.error('Failed to start recording:', err);
      setError(context?.interviewType === 'voice' ? 'Failed to access microphone' : 'Failed to access camera/microphone');
    }
  };

  // Stop recording and cleanup
  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      // Just stop - continuous mode will trigger ondataavailable with final complete blob
      mediaRecorderRef.current.stop();
      console.log('Recording stopped');
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    setIsRecording(false);
  };

  // Wait for recording to fully stop and collect all chunks
  const waitForRecordingToStop = (): Promise<void> => {
    return new Promise((resolve) => {
      if (!mediaRecorderRef.current || mediaRecorderRef.current.state === 'inactive') {
        // Already stopped, give it a moment to finalize data
        setTimeout(resolve, 200);
        return;
      }

      // Listen for the stop event
      mediaRecorderRef.current.onstop = () => {
        console.log('MediaRecorder onstop fired. Final chunks:', recordedChunksRef.current.length);
        setTimeout(resolve, 100); // Small delay to ensure data is processed
      };
    });
  };

  const showInterviewResults = (result: any) => {
    const analysis = result.analysis || {};
    const gemini = analysis.geminiEvaluation || {};
    const strengths: string[] = gemini.strengths || analysis.nlp?.strengths || [];
    const improvements: string[] = gemini.improvements || analysis.nlp?.improvements || [];
    const summary: string = gemini.summary || analysis.nlp?.feedback || '';
    
    // Create results modal
    const modal = document.createElement('div');
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(47, 24, 75, 0.12);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10000;
      backdrop-filter: blur(10px);
    `;
    
    const content = document.createElement('div');
    content.style.cssText = `
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(20px);
      border-radius: 20px;
      padding: 32px;
      max-width: 520px;
      max-height: 80vh;
      overflow-y: auto;
      box-shadow: 0 32px 64px rgba(47, 24, 75, 0.05);
      border: 1px solid rgba(226, 232, 240, 0.5);
    `;
    
    const strengthsList = strengths.length > 0
      ? strengths.map((s: string) => `<li style="margin-bottom: 8px;">${s}</li>`).join('')
      : '<li>You showed up and completed the interview — that takes effort.</li>';

    const improvementsList = improvements.length > 0
      ? improvements.map((s: string) => `<li style="margin-bottom: 8px;">${s}</li>`).join('')
      : '<li>Keep practising and refining your answers for future interviews.</li>';

    content.innerHTML = `
      <div style="text-align: center; margin-bottom: 24px;">
        <h2 style="color: #1a202c; margin: 0 0 8px 0; font-size: 1.5rem; font-weight: 700;">Interview Feedback</h2>
        ${summary ? `<p style="color: #64748b; margin: 0; font-size: 0.9rem; line-height: 1.5;">${summary}</p>` : ''}
      </div>
      
      <div style="background: rgba(240, 249, 255, 0.8); border: 1px solid rgba(147, 197, 253, 0.4); padding: 20px; border-radius: 14px; margin-bottom: 16px;">
        <h4 style="color: #0c4a6e; margin: 0 0 10px 0; font-size: 1rem; font-weight: 700;">What You Did Well</h4>
        <ul style="color: #164e63; line-height: 1.6; font-size: 0.9rem; margin: 0; padding-left: 20px;">
          ${strengthsList}
        </ul>
      </div>
      
      <div style="background: rgba(254, 252, 232, 0.8); border: 1px solid rgba(253, 224, 71, 0.4); padding: 20px; border-radius: 14px; margin-bottom: 24px;">
        <h4 style="color: #78350f; margin: 0 0 10px 0; font-size: 1rem; font-weight: 700;">Where You Can Improve</h4>
        <ul style="color: #92400e; line-height: 1.6; font-size: 0.9rem; margin: 0; padding-left: 20px;">
          ${improvementsList}
        </ul>
      </div>
      
      <div style="text-align: center;">
        <button onclick="window.location.href = '/'; this.parentElement.parentElement.parentElement.remove();" 
          style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; padding: 14px 32px; font-size: 1rem; font-weight: 600; border-radius: 12px; cursor: pointer; box-shadow: 0 8px 24px rgba(102, 126, 234, 0.4); border: 1px solid rgba(255, 255, 255, 0.2);">
          Return to Dashboard
        </button>
      </div>
    `;
    
    modal.appendChild(content);
    document.body.appendChild(modal);
    
    // Close modal on backdrop click
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.remove();
        window.location.href = '/';
      }
    });
  };

  // Global 60-second timer for each question
  useEffect(() => {
    if (!context || !isRecording) return;

    setTimeRemaining(60);

    timerIntervalRef.current = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          handleNextQuestion();
          return 60;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [currentQuestionIndex, isRecording, context]);

  // Auto-transition to next question
  const handleNextQuestion = () => {
    if (!context) return;

    if (currentQuestionIndex < context.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      handleFinishInterview();
    }
  };

  // Manual finish button
  const handleFinish = () => {
    handleFinishInterview();
  };

  // Process and submit final video
  const handleFinishInterview = async () => {
    if (!context || !mediaRecorderRef.current) return;

    setIsSubmitting(true);
    stopRecording();

    try {
      // Wait for recording to fully complete and all chunks to be collected
      setSubmissionProgress('Finalizing recording...');
      await waitForRecordingToStop();
      
      // Give a small delay to ensure all data is processed
      await new Promise(r => setTimeout(r, 100));

      const blobType = context.interviewType === 'voice' ? 'audio/webm' : 'video/webm';
      const mediaBlob = new Blob(recordedChunksRef.current, { type: blobType });
      const duration = (Date.now() - recordingStartTimeRef.current) / 1000;

      console.log('Recording complete. Chunks:', recordedChunksRef.current.length, 'Total size:', mediaBlob.size, 'bytes');

      if (mediaBlob.size === 0) {
        throw new Error('No recording data was captured. Please try again and ensure permissions are granted.');
      }

      // Submit to InterviewModule
      setSubmissionProgress('Uploading recording... (1/3)');
      const result = await submitInterviewResponse({
        candidateID,
        sessionToken: context.sessionToken,
        mediaBlob,
        interviewType: context.interviewType,
        keywords: context.keywords,
        jobID,
        duration
      });

      // Save score back to SkillSelectAI
      setSubmissionProgress('Processing results... (2/3)');
      await saveInterviewScore(candidateID, jobID, result.score, result.analysis);

      // Show detailed results to candidate
      setSubmissionProgress('Finalizing... (3/3)');
      await new Promise(r => setTimeout(r, 500));
      showInterviewResults(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit interview');
    } finally {
      setIsSubmitting(false);
      setSubmissionProgress('');
    }
  };

  if (isLoading) return <div className="interview-loading">Loading interview...</div>;
  if (error) return <div className="interview-error">{error}</div>;
  if (!context) return <div className="interview-error">Failed to load interview context</div>;

  const currentQuestion = context.questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === context.questions.length - 1;

  return (
    <div className="unified-interview-container">
      {/* Submission Progress Modal */}
      {isSubmitting && (
        <div className="submission-overlay">
          <div className="submission-modal">
            <div className="submission-spinner"></div>
            <h3 className="submission-title">Processing Your Interview</h3>
            <p className="submission-status">{submissionProgress}</p>
            <p className="submission-note">This may take a few minutes. Please do not close this window.</p>
          </div>
        </div>
      )}

      {/* Header with progress */}
      <div className="interview-header">
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${((currentQuestionIndex + 1) / context.questions.length) * 100}%` }}
          />
        </div>
        <div className="question-counter">
          Question {currentQuestionIndex + 1} of {context.questions.length}
        </div>
      </div>

      {/* Timer - Fixed top right corner */}
      <div className={`timer-fixed ${timeRemaining <= 10 ? 'timer-warning' : ''}`}>
        <div className="timer-circle">
          <svg viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="#E5E7EB"
              strokeWidth="3"
            />
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="#7C3AED"
              strokeWidth="3"
              strokeDasharray={`${(timeRemaining / 60) * 282.7} 282.7`}
              style={{ transition: 'stroke-dasharray 1s linear' }}
            />
          </svg>
          <span className="timer-text">{timeRemaining}</span>
        </div>
      </div>

      {/* Main interview area */}
      <div className="interview-main">
        {/* Question at TOP */}
        <div className="question-area">
          <h2 className="current-question">{currentQuestion.question}</h2>
        </div>

        {/* Video preview area - CENTERED */}
        <div className="video-preview-container">
          {(context.interviewType === 'video' && isRecording) ? (
            <div className="video-container">
              <video 
                ref={videoRef}
                autoPlay 
                muted 
                className="video-preview"
                style={{ 
                  width: '100%', 
                  height: '100%', 
                  objectFit: 'cover',
                  transform: 'scaleX(-1)' // Mirror effect for better UX
                }}
              />
              <div className="recording-indicator">
                ● REC
              </div>
            </div>
          ) : (
            <div className="video-placeholder">
              <span>{context.interviewType === 'voice' ? 'Voice-only interview in progress' : 'Camera preview will appear here'}</span>
            </div>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="interview-controls">
        {!isLastQuestion ? (
          <button onClick={handleNextQuestion} className="btn-next">
            Next Question
          </button>
        ) : (
          <button onClick={handleFinish} disabled={isSubmitting} className="btn-finish">
            {isSubmitting ? 'Submitting...' : 'Finish Interview'}
          </button>
        )}
      </div>
    </div>
  );
};

export default UnifiedInterviewInterface;

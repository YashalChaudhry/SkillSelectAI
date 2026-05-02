export interface InterviewQuestion {
  id: string;
  question: string;
  order: number;
}

export interface InterviewContext {
  candidateID: string;
  jobID: string;
  interviewType: 'video' | 'voice';
  questions: InterviewQuestion[];
  keywords: string[];
  sessionToken: string;
}

export interface InterviewSubmission {
  candidateID: string;
  sessionToken: string;
  mediaBlob: Blob;
  interviewType: 'video' | 'voice';
  keywords: string[];
  jobID: string;
  duration: number;
}

// Get API base URL from environment
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

/**
 * Fetch interview context from SkillSelectAI module
 * This retrieves the 10 pre-set questions and keywords for a specific job
 */
export async function fetchInterviewContext(candidateID: string, jobID: string): Promise<InterviewContext> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/skillselect/interview-context`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ candidateID, jobID })
    });

    if (!response.ok) throw new Error('Failed to fetch interview context');

    const data = await response.json();
    return {
      candidateID,
      jobID,
      interviewType: data.interviewType === 'voice' ? 'voice' : 'video',
      questions: data.questions.map((q: any, idx: number) => ({
        id: q.id,
        question: q.question,
        order: idx + 1
      })),
      keywords: data.keywords || [],
      sessionToken: data.sessionToken
    };
  } catch (error) {
    console.error('Error fetching interview context:', error);
    throw error;
  }
}

/**
 * Submit recorded video and interview data to InterviewModule for analysis
 */
export async function submitInterviewResponse(submission: InterviewSubmission): Promise<{ score: number; analysis: any }> {
  try {
    const formData = new FormData();
    formData.append('candidateID', submission.candidateID);
    formData.append('sessionToken', submission.sessionToken);
    const fileField = submission.interviewType === 'voice' ? 'audioBlob' : 'videoBlob';
    const fileName = submission.interviewType === 'voice' ? 'interview-audio.webm' : 'interview.webm';
    formData.append(fileField, submission.mediaBlob, fileName);
    formData.append('keywords', JSON.stringify(submission.keywords));
    formData.append('jobID', submission.jobID);
    formData.append('duration', submission.duration.toString());
    formData.append('interviewType', submission.interviewType);

    console.log('Submitting interview response:', submission.interviewType, 'size:', submission.mediaBlob.size, 'bytes');

    const response = await fetch(`${API_BASE_URL}/api/interview-module/analyze`, {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Backend error response:', errorData);
      throw new Error(`Backend error (${response.status}): ${errorData || 'Unknown error'}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error submitting interview response:', error);
    throw new Error(`Failed to submit interview response: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Map InterviewModule scores back to candidate profile in SkillSelectAI
 */
export async function saveInterviewScore(
  candidateID: string,
  jobID: string,
  score: number,
  analysis: any
): Promise<void> {
  try {
    await fetch(`${API_BASE_URL}/api/skillselect/candidate-score`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        candidateID,
        jobID,
        interviewScore: score,
        analysis
      })
    });
  } catch (error) {
    console.error('Error saving interview score:', error);
    throw error;
  }
}

import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';

// Mock database - replace with actual DB
const sessionStore: Map<string, any> = new Map();
const candidateScores: Map<string, any> = new Map();

/**
 * Fetch interview context from SkillSelectAI
 * Returns 10 pre-set questions and keywords for a specific job
 */
export const fetchInterviewContext = async (req: Request, res: Response) => {
  try {
    const { candidateID, jobID } = req.body;

    if (!candidateID || !jobID) {
      return res.status(400).json({ error: 'Missing candidateID or jobID' });
    }

    // Query SkillSelectAI database for job questions and keywords
    const questions = await getJobQuestions(jobID);
    const keywords = await getJobKeywords(jobID);

    if (!questions || questions.length === 0) {
      return res.status(404).json({ error: 'No interview questions found for this job' });
    }

    // Ensure exactly 10 questions
    const selectedQuestions = questions.slice(0, 10).map((q: any, idx: number) => ({
      id: q._id || q.id || `q-${idx}`,
      text: q.question || q.text || q.title
    }));

    // Generate unique session token
    const sessionToken = uuidv4();

    // Store session context
    sessionStore.set(sessionToken, {
      candidateID,
      jobID,
      questions: selectedQuestions,
      keywords,
      createdAt: new Date()
    });

    res.json({
      questions: selectedQuestions,
      keywords,
      sessionToken
    });
  } catch (error) {
    console.error('Error fetching interview context:', error);
    res.status(500).json({ error: 'Failed to fetch interview context' });
  }
};

/**
 * Fetch questions from SkillSelectAI database
 */
const getJobQuestions = async (jobID: string): Promise<any[]> => {
  try {
    // TODO: Replace with actual database query
    // Example for MongoDB:
    // const questions = await db.collection('jobQuestions').find({ jobID }).toArray();
    
    // Example for PostgreSQL/Prisma:
    // const questions = await prisma.jobQuestion.findMany({ where: { jobID } });

    // For now, this is a placeholder - connect to your actual database
    const questions = await querySkillSelectAIDatabase(jobID);
    return questions;
  } catch (error) {
    console.error('Error fetching job questions:', error);
    return [];
  }
};

/**
 * Fetch keywords from SkillSelectAI database
 */
const getJobKeywords = async (jobID: string): Promise<string[]> => {
  try {
    // TODO: Replace with actual database query
    // Example for MongoDB:
    // const job = await db.collection('jobs').findOne({ _id: jobID });
    // return job?.keywords || [];

    // Example for PostgreSQL/Prisma:
    // const job = await prisma.job.findUnique({ where: { id: jobID } });
    // return job?.keywords || [];

    const keywords = await querySkillSelectAIKeywords(jobID);
    return keywords;
  } catch (error) {
    console.error('Error fetching job keywords:', error);
    return [];
  }
};

/**
 * Placeholder: Query SkillSelectAI database for questions
 * REPLACE THIS WITH YOUR ACTUAL DB CONNECTION
 */
const querySkillSelectAIDatabase = async (jobID: string): Promise<any[]> => {
  // If using MongoDB:
  // import { MongoClient } from 'mongodb';
  // const client = new MongoClient(process.env.MONGODB_URI);
  // const db = client.db('skillselect');
  // const questions = await db.collection('interviewQuestions').find({ jobID }).toArray();
  // await client.close();
  // return questions;

  // If using PostgreSQL with Prisma:
  // import { PrismaClient } from '@prisma/client';
  // const prisma = new PrismaClient();
  // const questions = await prisma.interviewQuestion.findMany({
  //   where: { jobID }
  // });
  // return questions;

  // If using Firebase:
  // import { db } from './firebase';
  // const snapshot = await db.collection('interviewQuestions')
  //   .where('jobID', '==', jobID)
  //   .get();
  // return snapshot.docs.map(doc => doc.data());

  // MOCK DATA - Replace with actual query above
  const mockQuestions = [
    { id: '1', question: 'Tell us about your experience with React.' },
    { id: '2', question: 'How do you handle state management in large applications?' },
    { id: '3', question: 'Describe a challenging project you worked on.' },
    { id: '4', question: 'What is your approach to debugging?' },
    { id: '5', question: 'How do you stay updated with new technologies?' },
    { id: '6', question: 'Explain your experience with REST APIs.' },
    { id: '7', question: 'How do you approach code reviews?' },
    { id: '8', question: 'Tell us about your teamwork experience.' },
    { id: '9', question: 'What is your experience with databases?' },
    { id: '10', question: 'Why are you interested in this position?' }
  ];
  return mockQuestions;
};

/**
 * Placeholder: Query SkillSelectAI database for keywords
 * REPLACE THIS WITH YOUR ACTUAL DB CONNECTION
 */
const querySkillSelectAIKeywords = async (jobID: string): Promise<string[]> => {
  // MOCK DATA - Replace with actual query
  const mockKeywords = [
    'React',
    'TypeScript',
    'problem-solving',
    'collaboration',
    'API design',
    'testing'
  ];
  return mockKeywords;
};

/**
 * Analyze interview video using InterviewModule
 * Receives single video blob and keywords, returns score
 */
export const analyzeInterview = async (req: Request, res: Response) => {
  try {
    const { candidateID, sessionToken, jobID, duration } = req.body;
    const videoFile = req.file;

    if (!candidateID || !sessionToken || !videoFile) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const keywords = JSON.parse(req.body.keywords || '[]');

    // Retrieve session context
    const sessionContext = sessionStore.get(sessionToken);
    if (!sessionContext) {
      return res.status(400).json({ error: 'Invalid or expired session token' });
    }

    // TODO: Send video to InterviewModule for actual analysis
    // This is a mock implementation
    // Replace with actual call to InterviewModule.analyze(videoFile, keywords)
    
    const mockAnalysis = {
      score: Math.floor(Math.random() * 40 + 60), // Mock score 60-100
      keywordMatches: keywords.map(keyword => ({
        keyword,
        detected: Math.random() > 0.3,
        frequency: Math.floor(Math.random() * 5) + 1
      })),
      tone: ['confident', 'clear', 'professional'][Math.floor(Math.random() * 3)],
      sentiment: 0.75,
      duration: parseInt(duration) || 600
    };

    // Clean up session
    sessionStore.delete(sessionToken);

    res.json({
      score: mockAnalysis.score,
      analysis: mockAnalysis
    });
  } catch (error) {
    console.error('Error analyzing interview:', error);
    res.status(500).json({ error: 'Failed to analyze interview' });
  }
};

/**
 * Save interview score back to SkillSelectAI candidate profile
 */
export const saveInterviewScore = async (req: Request, res: Response) => {
  try {
    const { candidateID, jobID, interviewScore, analysis } = req.body;

    if (!candidateID || !jobID || interviewScore === undefined) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // TODO: Update candidate profile in SkillSelectAI DB with interview score
    // Example for MongoDB:
    // await db.collection('candidates').updateOne(
    //   { _id: candidateID },
    //   { $set: { [`interviews.${jobID}`]: { score: interviewScore, analysis, completedAt: new Date() } } }
    // );

    // Example for PostgreSQL/Prisma:
    // await prisma.candidate.update({
    //   where: { id: candidateID },
    //   data: {
    //     interviews: {
    //       upsert: {
    //         where: { candidateID_jobID: { candidateID, jobID } },
    //         update: { score: interviewScore, analysis },
    //         create: { jobID, score: interviewScore, analysis }
    //       }
    //     }
    //   }
    // });

    const scoreRecord = {
      candidateID,
      jobID,
      interviewScore,
      analysis,
      completedAt: new Date()
    };

    candidateScores.set(`${candidateID}-${jobID}`, scoreRecord);

    res.json({
      success: true,
      message: 'Interview score saved successfully',
      scoreRecord
    });
  } catch (error) {
    console.error('Error saving interview score:', error);
    res.status(500).json({ error: 'Failed to save interview score' });
  }
};

/**
 * Get candidate interview score (for verification)
 */
export const getCandidateScore = async (req: Request, res: Response) => {
  try {
    const { candidateID, jobID } = req.params;

    const scoreRecord = candidateScores.get(`${candidateID}-${jobID}`);

    if (!scoreRecord) {
      return res.status(404).json({ error: 'No interview score found' });
    }

    res.json(scoreRecord);
  } catch (error) {
    console.error('Error retrieving candidate score:', error);
    res.status(500).json({ error: 'Failed to retrieve score' });
  }
};

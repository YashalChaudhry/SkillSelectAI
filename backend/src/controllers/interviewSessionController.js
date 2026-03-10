import InterviewSession from '../models/InterviewSession.js';
import Question from '../models/Question.js';
import Interview from '../models/Interview.js';
import Candidate from '../models/Candidate.js';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';
import path from 'path';
import { Readable } from 'stream';
import { evaluateWithGemini } from '../services/geminiEvaluation.js';

const INTERVIEW_MODULE_URL = process.env.INTERVIEW_MODULE_URL || 'http://localhost:5001';

/**
 * POST /api/skillselect/interview-context
 * Called by frontend when candidate opens the interview page.
 * Fetches 10 approved questions for the job and returns them with a session token.
 */
export const getInterviewContext = async (req, res) => {
  try {
    const { candidateID, jobID } = req.body;

    if (!candidateID || !jobID) {
      return res.status(400).json({
        success: false,
        message: 'candidateID and jobID are required'
      });
    }

    // Check if there's already an active session for this candidate+job
    let session = await InterviewSession.findOne({
      candidateId: candidateID,
      jobId: jobID,
      status: { $in: ['Created', 'InProgress'] }
    });

    if (session) {
      // Resume existing session — return the same questions and token
      return res.status(200).json({
        success: true,
        questions: session.questions.map(q => ({
          id: q.questionId?.toString() || q._id.toString(),
          question: q.text,
          order: q.order
        })),
        keywords: session.keywords,
        sessionToken: session.sessionToken
      });
    }

    // Fetch approved questions for this job
    const questions = await Question.find({
      jobId: jobID,
      status: 'Approved'
    });

    if (questions.length < 10) {
      return res.status(400).json({
        success: false,
        message: `Not enough approved questions. Found ${questions.length}, need at least 10.`
      });
    }

    // Shuffle and pick 10 random questions
    const shuffled = questions.sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, 10);

    // Collect unique skills as keywords for analysis
    const keywords = [...new Set(selected.map(q => q.skill).filter(Boolean))];

    // Generate session token
    const sessionToken = uuidv4();

    // Build question list with explicit type conversion
    const sessionQuestions = selected.map((q, idx) => {
      const questionObj = {
        questionId: q._id,
        text: String(q.text || ''),
        skill: String(q.skill || ''),
        difficulty: String(q.difficulty || ''),
        type: String(q.type || ''),
        order: Number(idx + 1)
      };
      return questionObj;
    });

    // Ensure we have an array of objects, not strings
    console.log('sessionQuestions type check:', Array.isArray(sessionQuestions), sessionQuestions.length);

    // Drop the collection if it exists with old schema to force schema reset
    try {
      await InterviewSession.collection.drop();
      console.log('✅ Dropped InterviewSession collection to reset schema');
    } catch (dropError) {
      // Collection doesn't exist or can't be dropped, continue
      console.log('Collection drop not needed:', dropError.message);
    }

    // Find matching interview record (if exists)
    const interview = await Interview.findOne({
      jobId: jobID,
      candidateId: candidateID
    });

    // Ensure clean data before creating session
    const sessionData = {
      interviewId: interview?._id || null,
      jobId: jobID,
      candidateId: candidateID,
      sessionToken,
      questions: sessionQuestions, // This should be an array of objects
      keywords: Array.isArray(keywords) ? keywords : [],
      status: 'Created',
      startedAt: new Date()
    };

    // Create session
    session = await InterviewSession.create(sessionData);

    // Update interview status if exists
    if (interview) {
      interview.status = 'In_Progress';
      await interview.save();
    }

    console.log(`✅ Interview session created for candidate ${candidateID}, job ${jobID}, token ${sessionToken}`);

    res.status(200).json({
      success: true,
      questions: sessionQuestions.map(q => ({
        id: q.questionId.toString(),
        question: q.text,
        order: q.order
      })),
      keywords,
      sessionToken
    });

  } catch (error) {
    console.error('❌ Error fetching interview context:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch interview context',
      error: error.message
    });
  }
};

/**
 * POST /api/interview-module/analyze
 * Called by frontend after recording finishes.
 * Receives the single video blob for all 10 questions,
 * sends it to the InterviewModule for AI analysis,
 * and returns the score.
 */
export const analyzeInterview = async (req, res) => {
  try {
    const candidateID = req.body.candidateID;
    const sessionToken = req.body.sessionToken;
    const keywordsRaw = req.body.keywords;
    const jobID = req.body.jobID;
    const duration = parseFloat(req.body.duration) || 0;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Video file is required'
      });
    }

    // Parse keywords
    let keywords = [];
    try {
      keywords = typeof keywordsRaw === 'string' ? JSON.parse(keywordsRaw) : (keywordsRaw || []);
    } catch {
      keywords = keywordsRaw ? [keywordsRaw] : [];
    }

    // Find the session
    const session = await InterviewSession.findOne({ sessionToken });
    if (!session) {
      return res.status(404).json({ success: false, message: 'Interview session not found' });
    }

    // Update session with video info
    session.videoPath = req.file.path;
    session.videoDuration = duration;
    session.status = 'Completed';
    session.completedAt = new Date();
    await session.save();

    // Update interview record status
    if (session.interviewId) {
      await Interview.findByIdAndUpdate(session.interviewId, { status: 'Completed' });
    }

    console.log(`📹 Video received for session ${sessionToken} (${(req.file.size / 1024 / 1024).toFixed(1)}MB, ${duration}s)`);

    // Send video to InterviewModule for AI analysis
    let score = 0;
    let analysis = {};

    try {
      const formData = new FormData();
      
      // Handle both disk storage and memory storage
      if (req.file.path) {
        // Disk storage - use file stream with filename for extension detection
        const filename = req.file.originalname || path.basename(req.file.path) || 'video.webm';
        formData.append('video', fs.createReadStream(req.file.path), {
          filename: filename,
          contentType: req.file.mimetype || 'video/webm'
        });
      } else if (req.file.buffer) {
        // Memory storage - convert buffer to readable stream
        const readableStream = Readable.from(req.file.buffer);
        formData.append('video', readableStream, {
          filename: req.file.originalname || 'video.webm',
          contentType: req.file.mimetype || 'video/webm'
        });
      } else {
        throw new Error('No video data available');
      }
      
      // NEW: Send required parameters for Gemini-based analysis
      // Combine all questions into a context for full interview analysis
      const allQuestions = session.questions.map((q, idx) => 
        `Q${idx + 1}: ${q.text}`
      ).join('\n');
      
      // Determine predominant question type
      const typeCount = {};
      session.questions.forEach(q => {
        const type = (q.type || 'technical').toLowerCase();
        typeCount[type] = (typeCount[type] || 0) + 1;
      });
      const predominantType = Object.entries(typeCount)
        .sort((a, b) => b[1] - a[1])[0]?.[0] || 'technical';
      
      // Build expected points from skills
      const expectedPoints = session.questions
        .map(q => q.skill)
        .filter(Boolean)
        .filter((v, i, a) => a.indexOf(v) === i); // unique skills
      
      // Add required Gemini analysis parameters
      formData.append('question', allQuestions);
      formData.append('question_type', predominantType);
      if (expectedPoints.length > 0) {
        formData.append('expected_points', expectedPoints.join(','));
      }
      
      // LEGACY: Keep old params for backward compatibility
      if (keywords.length > 0) {
        formData.append('keywords', keywords.join(','));
      }
      
      // Add question context for better analysis (legacy)
      const questionContext = {
        skills: session.questions.map(q => q.skill).filter(Boolean),
        difficulties: session.questions.map(q => q.difficulty).filter(Boolean),
        types: session.questions.map(q => q.type).filter(Boolean)
      };
      
      if (questionContext.skills.length > 0) {
        formData.append('skills', questionContext.skills.join(','));
      }
      if (questionContext.difficulties.length > 0) {
        formData.append('difficulty_levels', questionContext.difficulties.join(','));
      }
      if (questionContext.types.length > 0) {
        formData.append('question_types', questionContext.types.join(','));
      }

      console.log(`🔄 Sending video to InterviewModule at ${INTERVIEW_MODULE_URL}/api/analyze ...`);
      console.log(`   Questions: ${session.questions.length}, Type: ${predominantType}, Skills: ${expectedPoints.join(', ')}`);

      const analyzeRes = await axios.post(
        `${INTERVIEW_MODULE_URL}/api/analyze`,
        formData,
        {
          headers: formData.getHeaders(),
          timeout: 30000 // 30s to submit the task
        }
      );

      if (analyzeRes.data.success && analyzeRes.data.task_id) {
        const taskId = analyzeRes.data.task_id;
        session.analysisTaskId = taskId;
        session.status = 'Analyzing';
        await session.save();

        console.log(`⏳ Analysis task submitted: ${taskId}. Polling for results...`);

        // Poll for results with adaptive timing (up to 3 minutes)
        let result = null;
        let consecutiveQuickChecks = 0;
        
        for (let i = 0; i < 150; i++) {
          // Adaptive wait: start with 1s, increase gradually
          // Increased to 150 iterations (~5 min max) for larger videos
          const waitTime = Math.min(consecutiveQuickChecks < 5 ? 1000 : 2000, 3000);
          await new Promise(r => setTimeout(r, waitTime));

          try {
            const statusRes = await axios.get(
              `${INTERVIEW_MODULE_URL}/api/status/${taskId}`,
              { timeout: 5000 }
            );

            if (statusRes.data.state === 'SUCCESS') {
              result = statusRes.data.result;
              console.log(`✅ Analysis completed in ${i * waitTime / 1000}s`);
              break;
            } else if (statusRes.data.state === 'FAILURE') {
              console.error('❌ InterviewModule analysis failed:', statusRes.data.status);
              break;
            } else if (statusRes.data.state === 'PROGRESS') {
              consecutiveQuickChecks++;
              const progress = statusRes.data.progress || (i / 90 * 100);
              console.log(`   Progress: ${Math.round(progress)}%`);
            }
          } catch (pollError) {
            console.warn(`   Poll attempt ${i + 1} failed, retrying...`, pollError.message);
            if (i > 120) break; // Stop after ~4 minutes of retries
          }
        }

        if (result) {
          // Get the transcript from audio analysis
          const transcript = result.audio?.transcript || '';

          // Run Gemini AI evaluation on questions + transcript
          console.log('🤖 Running Gemini AI evaluation on transcript...');
          const geminiEval = await evaluateWithGemini(
            transcript,
            session.questions || [],
            keywords
          );

          // Merge Gemini evaluation into the analysis
          if (geminiEval.success) {
            // Use Gemini content score instead of generic NLP
            result.nlp = {
              final_score: geminiEval.overallScore,
              feedback: geminiEval.summary,
              strengths: geminiEval.strengths,
              improvements: geminiEval.improvements,
              questionFeedback: geminiEval.questionFeedback,
            };
            console.log(`✅ Gemini evaluation merged. Content score: ${geminiEval.overallScore}`);
          } else {
            console.warn('⚠️ Gemini evaluation failed, using content score of 0');
            result.nlp = {
              final_score: 0,
              feedback: geminiEval.summary || 'Content analysis unavailable',
              strengths: [],
              improvements: geminiEval.improvements || [],
              questionFeedback: [],
            };
          }
          
          // ALWAYS calculate overall score using: 30% visual + 30% audio + 40% content
          const visualScore = result.visual?.final_score || 0;
          const audioScore = result.audio?.final_score || 0;
          const contentScore = geminiEval.success ? geminiEval.overallScore : 0;
          
          result.overall_score = Math.round(
            visualScore * 0.3 + audioScore * 0.3 + contentScore * 0.4
          );
          result.final_score = result.overall_score;
          
          console.log(`📊 Score breakdown: Visual=${visualScore}, Audio=${audioScore}, Content=${contentScore} => Overall=${result.overall_score}`);

          score = result.overall_score || result.final_score || 0;
          analysis = result;
          analysis.geminiEvaluation = geminiEval;
          session.score = score;
          session.analysis = analysis;
          session.status = 'Scored';
          session.analyzedAt = new Date();
          await session.save();
          console.log(`✅ Analysis complete. Final score: ${score}`);
        } else {
          console.warn('⚠️ Analysis timed out or failed. Returning partial result.');
          session.status = 'Failed';
          await session.save();
        }
      }
    } catch (moduleError) {
      console.error('⚠️ InterviewModule not reachable or failed:', moduleError.message);
      console.log('🤖 Generating placeholder analysis (visual/audio unavailable)...');
      
      // Generate a basic analysis structure when InterviewModule is unavailable
      // This allows the system to still function and provide some feedback
      const placeholderAnalysis = {
        visual: {
          final_score: 0,
          eye_contact_percentage: 0,
          emotion_score: 0,
          dominant_emotion: 'N/A',
          feedback: 'Video analysis unavailable - AI service was not running'
        },
        audio: {
          final_score: 0,
          wpm: 0,
          pace_score: 0,
          confidence_score: 0,
          expression_score: 0,
          transcript: '',
          feedback: 'Audio analysis unavailable - AI service was not running'
        },
        nlp: {
          final_score: 0,
          feedback: 'Content analysis requires the AI analysis service to be running. Please contact support.'
        },
        overall_score: 0,
        final_score: 0,
        error: 'InterviewModule service unavailable',
        note: 'Please ensure the Flask AI server and Celery worker are running for full analysis'
      };

      score = 0;
      analysis = placeholderAnalysis;
      session.score = score;
      session.analysis = analysis;
      session.status = 'PartialAnalysis';
      await session.save();
      console.log('⚠️ Saved partial analysis with placeholder data');
    }

    res.status(200).json({
      success: true,
      score,
      analysis
    });

  } catch (error) {
    console.error('❌ Error analyzing interview:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to analyze interview',
      error: error.message
    });
  }
};

/**
 * POST /api/skillselect/candidate-score
 * Called by frontend after analysis completes.
 * Saves the interview score back to the candidate profile.
 */
export const saveCandidateScore = async (req, res) => {
  try {
    const { candidateID, jobID, interviewScore, analysis } = req.body;

    if (!candidateID || !jobID) {
      return res.status(400).json({
        success: false,
        message: 'candidateID and jobID are required'
      });
    }

    // Update candidate with interview results
    const candidate = await Candidate.findByIdAndUpdate(
      candidateID,
      {
        interviewScore: interviewScore || 0,
        interviewAnalysis: analysis || {},
        interviewCompletedAt: new Date()
      },
      { new: true }
    );

    if (!candidate) {
      return res.status(404).json({
        success: false,
        message: 'Candidate not found'
      });
    }

    // Also update the interview session
    await InterviewSession.findOneAndUpdate(
      { candidateId: candidateID, jobId: jobID },
      { score: interviewScore, status: 'Scored' }
    );

    console.log(`✅ Score saved for candidate ${candidateID}: ${interviewScore}/100`);

    res.status(200).json({
      success: true,
      message: 'Interview score saved successfully',
      candidate: {
        id: candidate._id,
        name: candidate.name,
        interviewScore: candidate.interviewScore
      }
    });

  } catch (error) {
    console.error('❌ Error saving candidate score:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save candidate score',
      error: error.message
    });
  }
};

/**
 * GET /api/interview-video/:candidateID/:jobID
 * Streams the interview video file for recruiter review
 */
export const getInterviewVideo = async (req, res) => {
  try {
    const { candidateID, jobID } = req.params;

    // Find the interview session - prefer sessions with video
    const session = await InterviewSession.findOne({
      candidateId: candidateID,
      jobId: jobID,
      videoPath: { $exists: true, $ne: null }
    }).sort({ createdAt: -1 });

    if (!session || !session.videoPath) {
      return res.status(404).json({
        success: false,
        message: 'Interview video not found'
      });
    }

    // Resolve the full path since videoPath is stored as relative
    const videoPath = path.resolve(session.videoPath);

    // Check if file exists
    if (!fs.existsSync(videoPath)) {
      console.error('Video file not found:', videoPath);
      return res.status(404).json({
        success: false,
        message: 'Video file not found on server'
      });
    }

    const stat = fs.statSync(videoPath);
    const fileSize = stat.size;
    const range = req.headers.range;

    // Optimal chunk size for smooth streaming (1MB chunks)
    const CHUNK_SIZE = 1024 * 1024; // 1MB

    // Handle range requests for video streaming
    if (range) {
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      // Use larger chunks for smoother playback
      const end = parts[1] 
        ? parseInt(parts[1], 10) 
        : Math.min(start + CHUNK_SIZE - 1, fileSize - 1);
      const chunkSize = end - start + 1;

      const file = fs.createReadStream(videoPath, { 
        start, 
        end,
        highWaterMark: 64 * 1024 // 64KB buffer for smoother reading
      });
      
      const headers = {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunkSize,
        'Content-Type': 'video/webm',
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
      };

      res.writeHead(206, headers);
      file.pipe(res);
    } else {
      // No range requested - send with Accept-Ranges header so browser knows it can request ranges
      const headers = {
        'Content-Length': fileSize,
        'Content-Type': 'video/webm',
        'Accept-Ranges': 'bytes',
        'Cache-Control': 'public, max-age=3600',
      };
      res.writeHead(200, headers);
      fs.createReadStream(videoPath, { highWaterMark: 64 * 1024 }).pipe(res);
    }
  } catch (error) {
    console.error('❌ Error streaming interview video:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to stream video',
      error: error.message
    });
  }
};

/**
 * GET /api/interview-analysis/:candidateID/:jobID
 * Retrieves detailed interview analysis for a candidate (for recruiter dashboard)
 */
export const getInterviewAnalysis = async (req, res) => {
  try {
    const { candidateID, jobID } = req.params;

    if (!candidateID || !jobID) {
      return res.status(400).json({
        success: false,
        message: 'candidateID and jobID are required'
      });
    }

    // Find the interview session - include PartialAnalysis status
    // Sort by createdAt desc to get the most recent session first
    // Also prefer sessions with video by trying to find one with videoPath first
    let session = await InterviewSession.findOne({
      candidateId: candidateID,
      jobId: jobID,
      status: { $in: ['Scored', 'Completed', 'Analyzing', 'PartialAnalysis'] },
      videoPath: { $exists: true, $ne: null }
    }).sort({ completedAt: -1, createdAt: -1 }).populate('candidateId', 'name email');

    // If no session with video, fall back to any session
    if (!session) {
      session = await InterviewSession.findOne({
        candidateId: candidateID,
        jobId: jobID,
        status: { $in: ['Scored', 'Completed', 'Analyzing', 'PartialAnalysis'] }
      }).sort({ createdAt: -1 }).populate('candidateId', 'name email');
    }

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'No interview analysis found for this candidate'
      });
    }

    // Format the response for recruiters
    const analysis = session.analysis || {};
    const visual = analysis.visual || {};
    const audio = analysis.audio || {};
    const nlp = analysis.nlp || {};
    const gemini = analysis.geminiEvaluation || {};

    // Check if visual analysis was actually performed
    const hasVisualAnalysis = (analysis.visual && analysis.visual.status === 'success') ||
                              (visual.final_score !== undefined) || 
                              (visual.eye_contact_percentage !== undefined) || 
                              (visual.emotion_score !== undefined);

    // Check if video exists - need to resolve full path since videoPath is stored as relative
    const videoFullPath = session.videoPath ? path.resolve(session.videoPath) : null;
    const hasVideo = videoFullPath && fs.existsSync(videoFullPath);

    const overallScore = session.score || 0;

    // Generate detailed feedback for low scores (0-2 out of 10)
    const generateDetailedFeedback = (score, analysis, hasVisual) => {
      if (score > 2) return null; // Only show for very low scores
      
      const feedback = {
        scoreReason: [],
        transcript: '',
        detailedIssues: [],
        recommendations: []
      };

      // Add visual analysis status
      if (!hasVisual) {
        feedback.detailedIssues.push("Visual analysis not performed (eye contact, facial expressions not evaluated)");
        feedback.recommendations.push("Note: Visual assessment requires updated analysis pipeline");
      }

      // Extract comprehensive analysis data
      const geminiStages = analysis.stages?.gemini_analysis?.analysis || {};
      const transcriptionStages = analysis.stages?.transcription || {};
      const audioStages = analysis.stages?.audio_extraction?.metrics || {};

      // Get transcript from multiple possible sources
      const transcript = transcriptionStages.text || analysis.transcript || '';
      feedback.transcript = transcript;

      // Analyze transcript for specific issues
      if (transcript) {
        if (transcript.includes('I have no idea') || transcript.includes('I don\'t know')) {
          feedback.scoreReason.push('Candidate explicitly stated not knowing answers to multiple questions');
          feedback.detailedIssues.push('Multiple questions answered with "I have no idea" or "I don\'t know"');
          feedback.recommendations.push('Candidate should prepare basic knowledge in the required technical areas');
        }
        
        if (transcript.length < 200) {
          feedback.scoreReason.push('Very brief responses provided');
          feedback.detailedIssues.push('Answers were too short to demonstrate knowledge or competency');
          feedback.recommendations.push('Encourage candidate to provide more detailed, structured answers');
        }
        
        if (geminiStages.key_points_coverage === 0) {
          feedback.scoreReason.push('Failed to cover key technical points');
          feedback.detailedIssues.push('No technical concepts or relevant skills demonstrated');
        }
        
        if (geminiStages.technical_accuracy === 0) {
          feedback.scoreReason.push('No technical accuracy demonstrated');
          feedback.detailedIssues.push('Answers lacked technical depth and accuracy');
          feedback.recommendations.push('Candidate needs fundamental training in the technical requirements');
        }
      } else {
        feedback.scoreReason.push('No verbal response provided');
        feedback.detailedIssues.push('Candidate did not provide any audible answers');
        feedback.recommendations.push('Candidate should ensure microphone is working and speak clearly');
      }

      // Audio analysis issues
      if (audioStages.silence_ratio && audioStages.silence_ratio > 0.6) {
        feedback.scoreReason.push('Excessive silence during interview');
        feedback.detailedIssues.push(`${Math.round(audioStages.silence_ratio * 100)}% of interview time was silence`);
        feedback.recommendations.push('Candidate should practice speaking fluently and filling silence appropriately');
      }

      // Add general assessment if available
      if (geminiStages.overall_assessment) {
        feedback.detailedIssues.push(geminiStages.overall_assessment);
      }

      // Add improvement suggestions
      if (analysis.recommendations) {
        feedback.recommendations.push(...analysis.recommendations);
      }

      if (analysis.geminiEvaluation?.improvements) {
        feedback.recommendations.push(...analysis.geminiEvaluation.improvements);
      }

      // Provide hiring recommendation
      feedback.hiringRecommendation = score === 0 
        ? 'NOT RECOMMENDED - Candidate demonstrates insufficient knowledge and preparation'
        : 'REQUIRES SIGNIFICANT IMPROVEMENT - Consider additional screening or training requirements';

      return feedback;
    };

    res.status(200).json({
      success: true,
      interview: {
        candidateName: session.candidateId?.name,
        candidateEmail: session.candidateId?.email,
        completedAt: session.analyzedAt || session.completedAt,
        status: session.status,
        
        // Video Info for recruiter review - use static file URL for better streaming
        video: {
          available: hasVideo,
          url: hasVideo ? `/${session.videoPath}` : null,
          duration: session.videoDuration || 0
        },
        
        // Overall Score
        overallScore: overallScore,
        
        // Visual Metrics (30%)
        visual: {
          score: hasVisualAnalysis ? Math.round(analysis.visual?.final_score || visual.final_score || 0) : null,
          eyeContact: hasVisualAnalysis ? Math.round(analysis.visual?.eye_contact_percentage || visual.eye_contact_percentage || 0) : null,
          emotionScore: hasVisualAnalysis ? Math.round(analysis.visual?.emotion_score || visual.emotion_score || 0) : null,
          dominantEmotion: hasVisualAnalysis ? (analysis.visual?.dominant_emotion || visual.dominant_emotion || 'N/A') : 'Analysis not available',
          feedback: hasVisualAnalysis ? (analysis.visual?.feedback || visual.feedback || '') : 'Visual analysis not performed - this feature is currently unavailable'
        },
        
        // Audio Metrics (30%)
        audio: {
          score: Math.round(audio.final_score || 0),
          pace: Math.round(audio.wpm || 0),
          paceScore: Math.round(audio.pace_score || 0),
          confidenceScore: Math.round(audio.confidence_score || 0),
          expressionScore: Math.round(audio.expression_score || 0),
          transcript: audio.transcript || '',
          feedback: audio.feedback || ''
        },
        
        // Content/NLP Metrics (40%)
        content: {
          score: Math.round(nlp.final_score || gemini.overallScore || 0),
          summary: gemini.summary || nlp.feedback || '',
          strengths: gemini.strengths || [],
          improvements: gemini.improvements || [],
          questionFeedback: gemini.questionFeedback || []
        },

        // Detailed feedback for low scores - helps recruiters understand why candidate failed
        detailedFeedback: generateDetailedFeedback(overallScore, analysis, hasVisualAnalysis)
      }
    });

  } catch (error) {
    console.error('❌ Error retrieving interview analysis:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve interview analysis',
      error: error.message
    });
  }
};
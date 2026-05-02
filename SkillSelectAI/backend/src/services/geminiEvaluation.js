import Groq from 'groq-sdk';

const GROQ_API_KEY = process.env.GROQ_API_KEY;

/**
 * Evaluates interview answers against questions using Groq AI (Llama 3.1).
 * 
 * @param {string} transcript - The full whisper transcript from the interview
 * @param {Array} questions - Array of question objects { text, skill, difficulty, type }
 * @param {Array} keywords - Expected keywords/skills for the role
 * @returns {Object} - AI evaluation with strengths, improvements, and score
 */
export const evaluateWithGemini = async (transcript, questions, keywords = []) => {
  if (!GROQ_API_KEY) {
    console.warn('⚠️ GROQ_API_KEY not set. Skipping AI content evaluation.');
    return getDefaultEvaluation();
  }

  if (!transcript || transcript.trim().length < 20) {
    console.warn('⚠️ Transcript too short for meaningful evaluation.');
    return getDefaultEvaluation('The response was too brief to evaluate. Try to provide more detailed answers.');
  }

  try {
    const groq = new Groq({ apiKey: GROQ_API_KEY });

    const questionList = questions
      .map((q, i) => `Q${i + 1}: ${q.text} [Skill: ${q.skill || 'General'}, Difficulty: ${q.difficulty || 'Medium'}]`)
      .join('\n');

    const prompt = `You are an expert technical interviewer evaluating a candidate's interview performance.

The candidate was asked the following questions during a video interview:
${questionList}

The candidate's full transcribed response (from the entire interview recording):
"${transcript}"

Expected skills/keywords for this role: ${keywords.length > 0 ? keywords.join(', ') : 'Not specified'}

Evaluate the candidate's responses and provide a structured assessment. Be specific and reference actual content from their answers.

Respond ONLY with valid JSON in this exact format (no markdown, no code blocks, just raw JSON):
{
  "overallScore": <number 0-100>,
  "strengths": [
    "<specific strength based on their actual answers, 1-2 sentences>",
    "<another specific strength, 1-2 sentences>"
  ],
  "improvements": [
    "<specific area to improve with actionable advice, 1-2 sentences>",
    "<another specific area to improve, 1-2 sentences>"
  ],
  "questionFeedback": [
    {
      "questionNumber": 1,
      "relevance": "<how relevant was their answer to this specific question>",
      "score": <number 0-100>
    }
  ],
  "summary": "<A 2-3 sentence overall summary of the interview performance>"
}

Guidelines:
- Be constructive and professional
- Reference specific things the candidate said
- If the transcript doesn't seem to address certain questions, note that
- Score based on relevance, depth, accuracy, and clarity of answers
- Give actionable improvement suggestions`;

    const result = await groq.chat.completions.create({
      messages: [
        {
          role: "user",
          content: prompt
        }
      ],
      model: "llama-3.1-8b-instant", // Fast model for interview evaluation
      temperature: 0.3, // Lower temperature for consistent evaluation
      max_tokens: 2000
    });

    const responseText = result.choices[0]?.message?.content || '';

    // Parse the JSON response - strip markdown code blocks if present
    let cleanedResponse = responseText.trim();
    if (cleanedResponse.startsWith('```')) {
      cleanedResponse = cleanedResponse.replace(/^```(?:json)?\s*/, '').replace(/\s*```$/, '');
    }

    const evaluation = JSON.parse(cleanedResponse);

    console.log(`✅ Groq evaluation complete. Score: ${evaluation.overallScore}/100`);

    return {
      success: true,
      overallScore: evaluation.overallScore || 0,
      strengths: evaluation.strengths || [],
      improvements: evaluation.improvements || [],
      questionFeedback: evaluation.questionFeedback || [],
      summary: evaluation.summary || '',
    };

  } catch (error) {
    console.error('❌ Groq evaluation failed:', error.message);
    console.error('   Full error:', error);
    return getDefaultEvaluation(`Groq API error: ${error.message}`);
  }
};

function getDefaultEvaluation(fallbackMessage = '') {
  return {
    success: false,
    overallScore: 0,
    strengths: [],
    improvements: fallbackMessage ? [fallbackMessage] : [],
    questionFeedback: [],
    summary: fallbackMessage || 'AI evaluation was not available for this interview.',
  };
}

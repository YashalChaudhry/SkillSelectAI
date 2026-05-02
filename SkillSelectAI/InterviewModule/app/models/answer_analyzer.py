"""
Answer Analysis using Gemini API
Analyzes individual candidate answers and calculates comprehensive scores
"""

import json
import re
import os
from typing import Dict, List, Optional
import google.generativeai as genai

# Initialize Gemini
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)

class AnswerAnalyzer:
    """Analyzes interview answers using Gemini API"""
    
    def __init__(self):
        self.model = genai.GenerativeModel('gemini-2.0-flash')
    
    def analyze_single_answer(
        self,
        question: str,
        transcribed_answer: str,
        question_type: str = "technical",
        expected_points: Optional[List[str]] = None,
        candidate_background: Optional[str] = None
    ) -> Dict:
        """
        Analyze a single answer using Gemini
        
        Args:
            question: The interview question
            transcribed_answer: The candidate's transcribed answer
            question_type: Type of question (technical/behavioral/situational)
            expected_points: Expected points to cover
            candidate_background: Candidate's background/resume summary
            
        Returns:
            Dictionary with detailed analysis
        """
        
        if not transcribed_answer or transcribed_answer.strip() == "":
            return self._get_empty_analysis()
        
        # Build the analysis prompt
        prompt = self._build_analysis_prompt(
            question=question,
            answer=transcribed_answer,
            question_type=question_type,
            expected_points=expected_points,
            background=candidate_background
        )
        
        try:
            response = self.model.generate_content(prompt)
            analysis = self._parse_gemini_response(response.text)
            return analysis
        except Exception as e:
            print(f"Error analyzing answer with Gemini: {e}")
            return self._get_empty_analysis()
    
    def _build_analysis_prompt(
        self,
        question: str,
        answer: str,
        question_type: str,
        expected_points: Optional[List[str]],
        background: Optional[str]
    ) -> str:
        """Build the Gemini analysis prompt"""
        
        expected_points_str = ""
        if expected_points:
            expected_points_str = f"\nExpected Key Points:\n" + "\n".join(
                f"- {point}" for point in expected_points
            )
        
        background_str = f"\nCandidate Background:\n{background}" if background else ""
        
        prompt = f"""You are an expert interview evaluator. Analyze this interview answer and provide a detailed JSON response.

QUESTION: {question}
QUESTION TYPE: {question_type}{expected_points_str}
CANDIDATE ANSWER: {answer}{background_str}

Evaluate the answer across these dimensions:
1. RELEVANCE (0-100): Does the answer directly address the question? Are there off-topic tangents?
2. TECHNICAL ACCURACY (0-100): Are technical concepts correctly explained? Any factual errors?
3. COMMUNICATION QUALITY (0-100): Is it logically structured? Clear articulation? Appropriate length?
4. DEPTH OF KNOWLEDGE (0-100): Shows understanding of the topic? Goes beyond basics?
5. KEY POINTS COVERAGE (0-100): How many expected points were covered?

For behavioral questions, also evaluate:
- STAR METHOD (0-100): Does it follow Situation-Task-Action-Result?

Provide your analysis as a JSON object with this exact structure:
{{
    "relevance_score": <number 0-100>,
    "technical_accuracy": <number 0-100>,
    "communication_score": <number 0-100>,
    "depth_of_knowledge": <number 0-100>,
    "key_points_coverage": <number 0-100>,
    "star_method_score": <number 0-100 or null if not applicable>,
    "key_points_covered": [<list of points covered>],
    "key_points_missed": [<list of points not covered>],
    "strengths": [<list of 2-3 key strengths>],
    "weaknesses": [<list of 2-3 areas for improvement>],
    "improvement_suggestions": [<list of 2-3 specific suggestions>],
    "confidence_indicators": [<evidence of confidence or hesitation in the answer>],
    "ideal_answer_comparison": "<1-2 sentence comparison to ideal answer>",
    "follow_up_question": "<optional follow-up question if needed, or null>",
    "overall_assessment": "<1-2 sentence summary>"
}}

IMPORTANT: Return ONLY valid JSON, no markdown or extra text."""
        
        return prompt
    
    def _parse_gemini_response(self, response_text: str) -> Dict:
        """Parse Gemini response and extract JSON"""
        try:
            # Try to find JSON in the response
            json_match = re.search(r'\{.*\}', response_text, re.DOTALL)
            if json_match:
                json_str = json_match.group(0)
                data = json.loads(json_str)
                return data
            else:
                print(f"No JSON found in response: {response_text[:200]}")
                return self._get_empty_analysis()
        except json.JSONDecodeError as e:
            print(f"Failed to parse JSON: {e}")
            return self._get_empty_analysis()
    
    def _get_empty_analysis(self) -> Dict:
        """Return empty analysis structure"""
        return {
            "relevance_score": 0,
            "technical_accuracy": 0,
            "communication_score": 0,
            "depth_of_knowledge": 0,
            "key_points_coverage": 0,
            "star_method_score": None,
            "key_points_covered": [],
            "key_points_missed": [],
            "strengths": [],
            "weaknesses": [],
            "improvement_suggestions": [],
            "confidence_indicators": [],
            "ideal_answer_comparison": "No answer provided.",
            "follow_up_question": None,
            "overall_assessment": "No substantive answer was provided."
        }
    
    def calculate_answer_score(self, analysis: Dict, question_type: str = "technical") -> float:
        """
        Calculate overall score for a single answer
        
        Args:
            analysis: Analysis dictionary from Gemini
            question_type: Type of question for proper weighting
            
        Returns:
            Overall score (0-100)
        """
        
        # Base scoring with weights
        relevance = analysis.get("relevance_score", 0)
        technical = analysis.get("technical_accuracy", 0)
        communication = analysis.get("communication_score", 0)
        depth = analysis.get("depth_of_knowledge", 0)
        coverage = analysis.get("key_points_coverage", 0)
        
        if question_type == "behavioral":
            star_score = analysis.get("star_method_score", 0) or 0
            # Behavioral: weighted towards communication and STAR method
            overall = (
                relevance * 0.15 +
                technical * 0.15 +
                communication * 0.25 +
                depth * 0.15 +
                coverage * 0.15 +
                star_score * 0.15
            )
        elif question_type == "situational":
            # Situational: weighted towards problem-solving and communication
            overall = (
                relevance * 0.20 +
                technical * 0.15 +
                communication * 0.25 +
                depth * 0.20 +
                coverage * 0.20
            )
        else:  # technical
            # Technical: more weight on accuracy and depth
            overall = (
                relevance * 0.20 +
                technical * 0.35 +
                communication * 0.15 +
                depth * 0.20 +
                coverage * 0.10
            )
        
        return round(overall, 2)


class OverallScoreCalculator:
    """Calculates overall interview score from multiple answers"""
    
    @staticmethod
    def calculate_final_score(
        answer_analyses: List[Dict],
        question_types: List[str],
        question_details: Optional[List[Dict]] = None
    ) -> Dict:
        """
        Calculate final interview score
        
        Args:
            answer_analyses: List of analysis dictionaries from Gemini
            question_types: List of question types (technical/behavioral/situational)
            question_details: Optional detailed question info
            
        Returns:
            Dictionary with final scores and breakdown
        """
        
        if not answer_analyses:
            return OverallScoreCalculator._get_zero_score()
        
        # Calculate individual answer scores
        analyzer = AnswerAnalyzer()
        answer_scores = [
            analyzer.calculate_answer_score(analysis, qtype)
            for analysis, qtype in zip(answer_analyses, question_types)
        ]
        
        # Group by question type
        technical_scores = [
            score for score, qtype in zip(answer_scores, question_types)
            if qtype == "technical"
        ]
        behavioral_scores = [
            score for score, qtype in zip(answer_scores, question_types)
            if qtype == "behavioral"
        ]
        situational_scores = [
            score for score, qtype in zip(answer_scores, question_types)
            if qtype == "situational"
        ]
        
        # Calculate category averages
        technical_avg = sum(technical_scores) / len(technical_scores) if technical_scores else 0
        behavioral_avg = sum(behavioral_scores) / len(behavioral_scores) if behavioral_scores else 0
        situational_avg = sum(situational_scores) / len(situational_scores) if situational_scores else 0
        
        # Calculate dimension averages
        technical_knowledge = technical_avg
        communication_skills = sum(
            analysis.get("communication_score", 0) for analysis in answer_analyses
        ) / len(answer_analyses)
        problem_solving = situational_avg if situational_avg > 0 else behavioral_avg
        
        # Calculate confidence score from indicators
        confidence_score = OverallScoreCalculator._calculate_confidence(answer_analyses)
        
        # Apply consistency bonus/penalty
        consistency_modifier = OverallScoreCalculator._calculate_consistency(answer_scores)
        
        # Calculate final score with weights
        final_score = (
            technical_knowledge * 0.30 +
            communication_skills * 0.25 +
            problem_solving * 0.25 +
            confidence_score * 0.10 +
            behavioral_avg * 0.10
        ) + consistency_modifier
        
        # Clamp to 0-100
        final_score = max(0, min(100, final_score))
        
        # Determine grade
        grade = OverallScoreCalculator._score_to_grade(final_score)
        
        return {
            "overall_score": round(final_score, 2),
            "grade": grade,
            "breakdown": {
                "technical_knowledge": round(technical_knowledge, 2),
                "communication_skills": round(communication_skills, 2),
                "problem_solving": round(problem_solving, 2),
                "confidence": round(confidence_score, 2),
                "behavioral_fit": round(behavioral_avg, 2)
            },
            "category_scores": {
                "technical": round(technical_avg, 2) if technical_scores else None,
                "behavioral": round(behavioral_avg, 2) if behavioral_scores else None,
                "situational": round(situational_avg, 2) if situational_scores else None
            },
            "individual_answer_scores": answer_scores,
            "consistency_modifier": consistency_modifier,
            "strengths": OverallScoreCalculator._aggregate_strengths(answer_analyses),
            "improvement_areas": OverallScoreCalculator._aggregate_weaknesses(answer_analyses),
            "summary": OverallScoreCalculator._generate_summary(final_score, grade)
        }
    
    @staticmethod
    def _calculate_confidence(analyses: List[Dict]) -> float:
        """Calculate confidence score from confidence indicators"""
        confidence_indicators = []
        for analysis in analyses:
            indicators = analysis.get("confidence_indicators", [])
            confidence_indicators.extend(indicators)
        
        if not confidence_indicators:
            return 50
        
        # Simple heuristic: count positive vs negative indicators
        positive = sum(1 for ind in confidence_indicators if any(
            word in ind.lower() for word in ['confident', 'clear', 'articulate', 'knowledgeable']
        ))
        negative = sum(1 for ind in confidence_indicators if any(
            word in ind.lower() for word in ['hesitat', 'uncertain', 'unclear', 'rambl']
        ))
        
        total = len(confidence_indicators)
        confidence = (positive / total) * 100 if total > 0 else 50
        
        return min(100, confidence)
    
    @staticmethod
    def _calculate_consistency(scores: List[float]) -> float:
        """Apply consistency bonus/penalty"""
        if len(scores) < 2:
            return 0
        
        # Calculate standard deviation
        mean = sum(scores) / len(scores)
        variance = sum((x - mean) ** 2 for x in scores) / len(scores)
        std_dev = variance ** 0.5
        
        if std_dev < 10:
            return 5  # Bonus for consistency
        elif std_dev > 25:
            return -5  # Penalty for inconsistency
        else:
            return 0
    
    @staticmethod
    def _score_to_grade(score: float) -> str:
        """Convert score to letter grade"""
        if score >= 90:
            return "A - Excellent"
        elif score >= 80:
            return "B - Good"
        elif score >= 70:
            return "C - Acceptable"
        elif score >= 60:
            return "D - Needs Improvement"
        else:
            return "F - Poor"
    
    @staticmethod
    def _aggregate_strengths(analyses: List[Dict]) -> List[str]:
        """Aggregate top strengths across all answers"""
        all_strengths = []
        for analysis in analyses:
            strengths = analysis.get("strengths", [])
            all_strengths.extend(strengths)
        
        # Return top 5 unique strengths
        return list(dict.fromkeys(all_strengths))[:5]
    
    @staticmethod
    def _aggregate_weaknesses(analyses: List[Dict]) -> List[str]:
        """Aggregate improvement areas across all answers"""
        all_weaknesses = []
        for analysis in analyses:
            weaknesses = analysis.get("weaknesses", [])
            all_weaknesses.extend(weaknesses)
        
        # Return top 5 unique weaknesses
        return list(dict.fromkeys(all_weaknesses))[:5]
    
    @staticmethod
    def _generate_summary(score: float, grade: str) -> str:
        """Generate summary text"""
        if score >= 85:
            return "Strong interview performance with good technical knowledge and communication skills."
        elif score >= 70:
            return "Solid interview performance. Some areas for improvement identified."
        elif score >= 60:
            return "Fair interview performance. Significant improvement needed in key areas."
        else:
            return "Weak interview performance. Requires substantial preparation for future opportunities."
    
    @staticmethod
    def _get_zero_score() -> Dict:
        """Return zero score structure"""
        return {
            "overall_score": 0,
            "grade": "F - Poor",
            "breakdown": {
                "technical_knowledge": 0,
                "communication_skills": 0,
                "problem_solving": 0,
                "confidence": 0,
                "behavioral_fit": 0
            },
            "category_scores": {
                "technical": None,
                "behavioral": None,
                "situational": None
            },
            "individual_answer_scores": [],
            "consistency_modifier": 0,
            "strengths": [],
            "improvement_areas": [],
            "summary": "No data available for scoring."
        }

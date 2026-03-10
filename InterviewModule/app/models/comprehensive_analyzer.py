"""
Comprehensive Interview Analysis Module
Integrates STT, Answer Analysis, Visual Analysis, and Score Calculation
"""

import os
import json
from typing import Dict, List, Optional
from pathlib import Path
from .speech_to_text import SpeechToTextProcessor
from .answer_analyzer import AnswerAnalyzer, OverallScoreCalculator
from .visual_analyzer import VisualAnalyzer

class ComprehensiveInterviewAnalyzer:
    """Main analyzer that orchestrates the entire analysis pipeline"""
    
    def __init__(self):
        self.stt_processor = SpeechToTextProcessor()
        self.answer_analyzer = AnswerAnalyzer()
        self.visual_analyzer = VisualAnalyzer()
    
    def analyze_interview_response(
        self,
        video_path: str,
        question: str,
        question_type: str = "technical",
        expected_points: Optional[List[str]] = None,
        candidate_background: Optional[str] = None
    ) -> Dict:
        """
        Analyze a complete interview response
        
        Args:
            video_path: Path to recorded interview video
            question: The interview question asked
            question_type: Type of question (technical/behavioral/situational)
            expected_points: Expected points to cover in the answer
            candidate_background: Candidate's background/resume summary
            
        Returns:
            Dictionary with complete analysis results
        """
        
        print("\n" + "="*60)
        print("🎬 STARTING COMPREHENSIVE INTERVIEW ANALYSIS")
        print("="*60)
        
        result = {
            "status": "processing",
            "stages": {}
        }
        
        transcript = ""
        audio_metrics = {}
        analysis = {}
        visual_analysis = {}
        answer_score = 0
        
        try:
            # STAGE 1: Audio Extraction
            print("\n[STAGE 1] Extracting audio from video...")
            print(f"   Video path: {video_path}")
            print(f"   Video exists: {os.path.exists(video_path)}")
            if os.path.exists(video_path):
                print(f"   Video size: {os.path.getsize(video_path)} bytes")
            
            audio_result = self._process_audio(video_path)
            if not audio_result:
                print("   ⚠️ Audio extraction failed - continuing with visual analysis only")
                result["stages"]["audio_extraction"] = {"status": "failed", "error": "Could not extract audio"}
            else:
                transcript = audio_result.get("transcript", "")
                audio_metrics = audio_result.get("metrics", {})
                result["stages"]["audio_extraction"] = {
                    "status": "complete",
                    "audio_path": audio_result.get("audio_path"),
                    "metrics": audio_metrics
                }
                print(f"   ✅ Transcript length: {len(transcript)} characters")
            
            # STAGE 2: Speech-to-Text validation
            print("\n[STAGE 2] Validating transcription...")
            if not transcript or len(transcript.strip()) < 10:
                print("   ⚠️ Transcript too short or empty - content analysis will be limited")
                result["stages"]["transcription"] = {"status": "limited", "text": transcript or "", "length": len(transcript) if transcript else 0}
            else:
                result["stages"]["transcription"] = {
                    "status": "complete",
                    "text": transcript,
                    "length": len(transcript)
                }
            
            # STAGE 3: Answer Analysis with Gemini
            print("\n[STAGE 3] Analyzing answer with Gemini AI...")
            if transcript and len(transcript.strip()) >= 10:
                try:
                    analysis = self.answer_analyzer.analyze_single_answer(
                        question=question,
                        transcribed_answer=transcript,
                        question_type=question_type,
                        expected_points=expected_points,
                        candidate_background=candidate_background
                    )
                    result["stages"]["gemini_analysis"] = {"status": "complete", "analysis": analysis}
                    print(f"   ✅ Gemini analysis complete")
                except Exception as gemini_error:
                    print(f"   ⚠️ Gemini analysis failed: {gemini_error}")
                    analysis = {"relevance_score": 0, "technical_accuracy": 0, "communication_score": 0, 
                               "depth_of_knowledge": 0, "key_points_coverage": 0}
                    result["stages"]["gemini_analysis"] = {"status": "failed", "error": str(gemini_error)}
            else:
                print("   ⚠️ Skipping Gemini analysis - no transcript available")
                analysis = {"relevance_score": 0, "technical_accuracy": 0, "communication_score": 0, 
                           "depth_of_knowledge": 0, "key_points_coverage": 0}
                result["stages"]["gemini_analysis"] = {"status": "skipped", "reason": "No transcript"}
            
            # STAGE 4: Visual Analysis
            print("\n[STAGE 4] Analyzing visual engagement...")
            try:
                visual_analysis = self.visual_analyzer.analyze_video(video_path)
                result["stages"]["visual_analysis"] = {"status": "complete", "analysis": visual_analysis}
                print(f"   ✅ Visual analysis complete - Score: {visual_analysis.get('final_score', 0)}/100")
            except Exception as visual_error:
                print(f"   ⚠️ Visual analysis failed: {visual_error}")
                visual_analysis = {"status": "error", "final_score": 0, "eye_contact_percentage": 0, 
                                   "emotion_score": 0, "dominant_emotion": "N/A"}
                result["stages"]["visual_analysis"] = {"status": "failed", "error": str(visual_error)}
            
            # STAGE 5: Score Calculation
            print("\n[STAGE 5] Calculating scores...")
            try:
                answer_score = self.answer_analyzer.calculate_answer_score(analysis, question_type)
            except Exception as score_error:
                print(f"   ⚠️ Score calculation failed: {score_error}")
                answer_score = 0
            
            result["stages"]["scoring"] = {
                "status": "complete",
                "answer_score": answer_score
            }
            
            # STAGE 6: Create Audio Object for Backend
            print("\n[STAGE 6] Preparing audio analysis for backend...")
            # audio_metrics already set from stage 1
            
            # Calculate WPM from transcript and speech duration
            word_count = len(transcript.split()) if transcript else 0
            speech_duration_seconds = audio_metrics.get("speech_duration", 0.1)  # Avoid division by zero
            
            # Handle edge case where speaker speaks very fast
            if speech_duration_seconds <= 0:
                speech_duration_seconds = 0.1
                
            wpm = round((word_count / speech_duration_seconds * 60)) if word_count > 0 else 0
            
            # Calculate pace score (ideal is 120-180 WPM)
            pace_score = 100 if 120 <= wpm <= 180 else max(0, min(100, 100 - abs(150 - wpm) / 2))
            
            # Calculate confidence from audio energy (RMS energy indicates vocal strength)
            rms_energy = audio_metrics.get("rms_energy", 0)
            # Typical RMS values range from -80 to 0 dB
            # Normalize to 0-100 scale
            confidence_score = max(0, min(100, (rms_energy + 80) * 1.25))  # Rough scaling
            
            # Calculate expression score from silence ratio
            # Low silence ratio = better expression/flow
            silence_ratio = audio_metrics.get("silence_ratio", 0.5)
            expression_score = max(0, min(100, 100 - (silence_ratio * 100)))
            
            # Calculate overall audio quality score
            audio_quality_score = min(100, max(0, round(
                pace_score * 0.4 +
                confidence_score * 0.3 +
                expression_score * 0.3
            )))
            
            # Create audio scoring object expected by backend
            audio_object = {
                "final_score": audio_quality_score,
                "wpm": max(0, wpm),  # Ensure non-negative
                "pace_score": round(max(0, min(100, pace_score)), 1),
                "confidence_score": round(max(0, min(100, confidence_score)), 1),
                "expression_score": round(max(0, min(100, expression_score)), 1),
                "transcript": transcript,
                "feedback": f"Speaking rate: {wpm} WPM. " + 
                           ("Good pace detected." if 120 <= wpm <= 180 else "Consider adjusting pace for clarity.") +
                           f" Confidence level: {confidence_score:.0f}%.",
                "metrics": audio_metrics
            }
            
            print(f"   Audio Metrics: WPM={wpm}, Pace={pace_score:.1f}, Confidence={confidence_score:.1f}, Expression={expression_score:.1f}")
            print(f"   Overall Audio Score: {audio_quality_score}/100")
            
            # STAGE 7: Final Assembly
            print("\n[STAGE 7] Assembling final results...")
            result.update({
                "status": "success",
                "question": question,
                "question_type": question_type,
                "transcript": transcript,
                "analysis": analysis,
                "audio": audio_object,  # Properly formatted audio object
                "visual": visual_analysis,  # Include visual analysis in results
                "nlp": {  # Added for backend compatibility
                    "final_score": answer_score,
                    "feedback": analysis.get("summary", ""),
                    "strengths": analysis.get("strengths", []),
                    "improvements": analysis.get("improvements", []),
                    "questionFeedback": analysis.get("question_feedback", "")
                },
                "score": answer_score,
                "grade": self._score_to_grade(answer_score),
                "recommendations": self._generate_recommendations(analysis, answer_score, visual_analysis)
            })
            
            print("\n" + "="*60)
            print(f"✅ ANALYSIS COMPLETE - Score: {answer_score}/100")
            print("="*60 + "\n")
            
            return result
            
        except Exception as e:
            print(f"\n❌ Error during analysis: {str(e)}")
            import traceback
            traceback.print_exc()
            return self._error_result(f"Analysis failed: {str(e)}")
    
    def analyze_multiple_answers(
        self,
        video_answers: List[Dict],
        candidate_background: Optional[str] = None
    ) -> Dict:
        """
        Analyze multiple interview answers from a single video
        
        Args:
            video_answers: List of dicts with:
                - video_path: Path to video
                - question: The question
                - question_type: Type of question
                - expected_points: Expected points
            candidate_background: Candidate's background
            
        Returns:
            Dictionary with aggregated scores
        """
        
        print("\n" + "="*60)
        print("🎬 ANALYZING MULTIPLE INTERVIEW ANSWERS")
        print("="*60)
        
        results = []
        analyses = []
        question_types = []
        
        for idx, item in enumerate(video_answers, 1):
            print(f"\n--- Processing Answer {idx}/{len(video_answers)} ---")
            
            result = self.analyze_interview_response(
                video_path=item["video_path"],
                question=item["question"],
                question_type=item.get("question_type", "technical"),
                expected_points=item.get("expected_points"),
                candidate_background=candidate_background
            )
            
            if result["status"] == "success":
                results.append(result)
                analyses.append(result["analysis"])
                question_types.append(item.get("question_type", "technical"))
        
        if not results:
            return self._error_result("No valid answers could be analyzed")
        
        # Calculate overall score
        overall = OverallScoreCalculator.calculate_final_score(
            analyses,
            question_types
        )
        
        print("\n" + "="*60)
        print(f"✅ ALL ANSWERS ANALYZED")
        print(f"Final Score: {overall['overall_score']}/100 ({overall['grade']})")
        print("="*60 + "\n")
        
        return {
            "status": "success",
            "individual_results": results,
            "overall_assessment": overall,
            "total_answers_analyzed": len(results)
        }
    
    def _process_audio(self, video_path: str) -> Optional[Dict]:
        """Process video and extract audio"""
        try:
            # Extract audio
            audio_path = self.stt_processor.extract_audio_from_video(video_path)
            if not audio_path:
                return None
            
            # Transcribe
            transcript = self.stt_processor.transcribe_audio(audio_path)
            if not transcript:
                return None
            
            # Get metrics
            metrics = self.stt_processor.get_audio_metrics(audio_path)
            
            return {
                "audio_path": audio_path,
                "transcript": transcript,
                "metrics": metrics
            }
        except Exception as e:
            print(f"Error processing audio: {e}")
            return None
    
    def _score_to_grade(self, score: float) -> str:
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
    
    def _generate_recommendations(self, analysis: Dict, score: float, visual_analysis: Dict = None) -> List[str]:
        """Generate actionable recommendations including visual feedback"""
        recommendations = []
        
        # Based on weak areas
        if analysis.get("relevance_score", 0) < 70:
            recommendations.append("Focus on directly addressing the question asked before going into details.")
        
        if analysis.get("technical_accuracy", 0) < 70:
            recommendations.append("Strengthen your technical knowledge in this area. Review core concepts.")
        
        if analysis.get("communication_score", 0) < 70:
            recommendations.append("Work on clarity and structure. Use the PREP method (Point, Reason, Example, Point).")
        
        if analysis.get("depth_of_knowledge", 0) < 70:
            recommendations.append("Demonstrate deeper understanding. Go beyond surface-level explanations.")
        
        # Visual analysis recommendations
        if visual_analysis and visual_analysis.get("status") == "success":
            eye_contact = visual_analysis.get("eye_contact_percentage", 0)
            face_presence = visual_analysis.get("face_presence_percentage", 0)
            emotion_score = visual_analysis.get("emotion_score", 0)
            
            if eye_contact < 50:
                recommendations.append("Improve eye contact by looking directly at the camera more frequently.")
            elif eye_contact < 70:
                recommendations.append("Maintain more consistent eye contact throughout your responses.")
                
            if face_presence < 70:
                recommendations.append("Position yourself properly in frame and maintain good camera positioning.")
                
            if emotion_score < 40:
                recommendations.append("Show more engagement and enthusiasm in your responses.")
        
        # Based on weaknesses
        weaknesses = analysis.get("weaknesses", [])
        for weakness in weaknesses[:2]:
            if "hesitation" in weakness.lower():
                recommendations.append("Practice speaking with more confidence. Record yourself and listen back.")
            elif "example" in weakness.lower():
                recommendations.append("Use more concrete examples from your experience to support answers.")
            elif "structure" in weakness.lower():
                recommendations.append("Organize your thoughts before speaking. Use the STAR method for behavioral questions.")
        
        # Overall improvement suggestions
        suggestions = analysis.get("improvement_suggestions", [])
        recommendations.extend(suggestions[:2])
        
        # Remove duplicates
        recommendations = list(dict.fromkeys(recommendations))
        
        return recommendations[:6]  # Return top 6 to accommodate visual feedback
    
    def _error_result(self, error_message: str) -> Dict:
        """Return error result structure with proper audio/visual objects for backend compatibility"""
        return {
            "status": "error",
            "error": error_message,
            "transcript": "",
            "analysis": {},
            "audio": {
                "final_score": 0,
                "wpm": 0,
                "pace_score": 0,
                "confidence_score": 0,
                "expression_score": 0,
                "transcript": "",
                "feedback": f"Audio analysis failed: {error_message}",
                "metrics": {}
            },
            "visual": {
                "status": "error",
                "final_score": 0,
                "eye_contact_percentage": 0,
                "emotion_score": 0,
                "dominant_emotion": "N/A",
                "feedback": f"Visual analysis failed: {error_message}"
            },
            "nlp": {
                "final_score": 0,
                "feedback": f"Content analysis failed: {error_message}",
                "strengths": [],
                "improvements": []
            },
            "score": 0,
            "grade": "F - Poor"
        }

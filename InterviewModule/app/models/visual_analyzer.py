"""
Visual Analysis Module for Interview Assessment
Analyzes eye contact, facial expressions, and emotional engagement
"""

import cv2
import numpy as np
import os
from typing import Dict, List, Tuple, Optional
import tempfile
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class VisualAnalyzer:
    """Analyzes facial features and emotional engagement from interview videos"""
    
    def __init__(self):
        """Initialize face detection using OpenCV"""
        # Use OpenCV's Haar Cascade for face detection (lightweight, reliable)
        self.face_cascade = cv2.CascadeClassifier(
            cv2.data.haarcascades + 'haarcascade_frontalface_default.xml'
        )
        self._deepface = None

    def _get_deepface(self):
        """Lazy-load DeepFace to avoid heavy imports during API startup."""
        if self._deepface is None:
            from deepface import DeepFace
            self._deepface = DeepFace
        return self._deepface
        
    def analyze_video(self, video_path: str, sample_interval: int = 30) -> Dict:
        """
        Analyze video for visual engagement metrics
        
        Args:
            video_path: Path to video file
            sample_interval: Analyze every N frames (30 = ~1 second at 30fps)
            
        Returns:
            Dictionary with visual analysis metrics
        """
        print(f"\n[VISUAL ANALYZER] Processing video: {video_path}")
        
        if not os.path.exists(video_path):
            return self._error_result(f"Video file not found: {video_path}")
            
        cap = cv2.VideoCapture(video_path)
        if not cap.isOpened():
            return self._error_result("Could not open video file")
            
        # Video properties
        fps = int(cap.get(cv2.CAP_PROP_FPS)) or 30
        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        duration_seconds = total_frames / fps
        
        print(f"Video stats: {total_frames} frames, {fps} FPS, {duration_seconds:.1f}s")
        
        # Analysis containers
        frame_analyses = []
        emotion_detections = []
        eye_contact_scores = []
        face_presence_frames = 0
        total_analyzed_frames = 0
        
        frame_count = 0
        
        try:
            while cap.isOpened():
                ret, frame = cap.read()
                if not ret:
                    break
                    
                # Sample frames at specified interval
                if frame_count % sample_interval == 0:
                    total_analyzed_frames += 1
                    analysis = self._analyze_frame(frame)
                    frame_analyses.append(analysis)
                    
                    if analysis['face_detected']:
                        face_presence_frames += 1
                        
                        # Accumulate metrics
                        if analysis['eye_contact_score'] is not None:
                            eye_contact_scores.append(analysis['eye_contact_score'])
                            
                        if analysis['emotion'] and analysis['emotion'] != 'unknown':
                            emotion_detections.append(analysis['emotion'])
                
                frame_count += 1
                
                # Progress indicator
                if frame_count % (fps * 5) == 0:  # Every 5 seconds
                    progress = (frame_count / total_frames) * 100
                    print(f"Progress: {progress:.1f}% ({frame_count}/{total_frames} frames)")
                    
        except Exception as e:
            logger.error(f"Error processing video: {e}")
            return self._error_result(f"Video processing failed: {str(e)}")
            
        finally:
            cap.release()
            
        # Calculate final metrics
        return self._calculate_metrics(
            frame_analyses=frame_analyses,
            emotion_detections=emotion_detections, 
            eye_contact_scores=eye_contact_scores,
            face_presence_frames=face_presence_frames,
            total_analyzed_frames=total_analyzed_frames,
            duration_seconds=duration_seconds
        )
        
    def _analyze_frame(self, frame: np.ndarray) -> Dict:
        """Analyze a single frame for visual metrics"""
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        
        analysis = {
            'face_detected': False,
            'eye_contact_score': None,
            'emotion': None,
            'face_position': None
        }
        
        # Face detection using OpenCV Haar Cascade
        faces = self.face_cascade.detectMultiScale(
            gray, scaleFactor=1.1, minNeighbors=5, minSize=(30, 30)
        )
        
        if len(faces) > 0:
            analysis['face_detected'] = True
            
            # Get the largest face (primary subject)
            x, y, w, h = max(faces, key=lambda f: f[2] * f[3])
            analysis['face_position'] = {'x': x, 'y': y, 'w': w, 'h': h}
            
            # Calculate eye contact score based on face position
            frame_height, frame_width = frame.shape[:2]
            face_center_x = (x + w/2) / frame_width
            face_center_y = (y + h/2) / frame_height
            
            analysis['eye_contact_score'] = self._calculate_eye_contact_simple(
                face_center_x, face_center_y
            )
                
            # Emotion detection with DeepFace (sample frames to save processing)
            try:
                DeepFace = self._get_deepface()
                emotion_result = DeepFace.analyze(
                    img_path=frame,
                    actions=['emotion'],
                    enforce_detection=False,
                    silent=True
                )
                
                if isinstance(emotion_result, list) and len(emotion_result) > 0:
                    dominant_emotion = emotion_result[0]['dominant_emotion']
                    analysis['emotion'] = dominant_emotion.lower()
                    
            except Exception as e:
                logger.debug(f"Emotion detection failed for frame: {e}")
                analysis['emotion'] = 'unknown'
                
        return analysis
    
    def _calculate_eye_contact_simple(self, face_center_x: float, face_center_y: float) -> float:
        """
        Calculate eye contact score based on face position in frame
        Returns score 0-100 where 100 is face centered (looking at camera)
        """
        # Frame center is 0.5, 0.5 in normalized coordinates
        x_deviation = abs(face_center_x - 0.5)
        y_deviation = abs(face_center_y - 0.5)
        
        # Allow some natural movement (up to 20% from center is still "good" contact)
        max_deviation = 0.3
        
        x_score = max(0, 1 - (x_deviation / max_deviation))
        y_score = max(0, 1 - (y_deviation / max_deviation))
        
        eye_contact_score = (x_score * y_score) * 100
        
        return min(100, max(0, eye_contact_score))
            
    def _calculate_metrics(self, **kwargs) -> Dict:
        """Calculate final visual analysis metrics"""
        
        frame_analyses = kwargs['frame_analyses']
        emotion_detections = kwargs['emotion_detections']
        eye_contact_scores = kwargs['eye_contact_scores']
        face_presence_frames = kwargs['face_presence_frames']
        total_analyzed_frames = kwargs['total_analyzed_frames']
        duration_seconds = kwargs['duration_seconds']
        
        # Face presence percentage
        face_presence_percent = (face_presence_frames / max(1, total_analyzed_frames)) * 100
        
        # Average eye contact score
        avg_eye_contact = np.mean(eye_contact_scores) if eye_contact_scores else 0
        
        # Emotion analysis
        emotion_distribution = {}
        if emotion_detections:
            unique_emotions, counts = np.unique(emotion_detections, return_counts=True)
            emotion_distribution = dict(zip(unique_emotions, counts.tolist()))
            
            # Most common emotion
            dominant_emotion = max(emotion_distribution, key=emotion_distribution.get)
        else:
            dominant_emotion = 'neutral'
            
        # Calculate emotion engagement score
        positive_emotions = ['happy', 'surprise']
        neutral_emotions = ['neutral']
        negative_emotions = ['sad', 'angry', 'fear', 'disgust']
        
        emotion_score = 0
        if emotion_detections:
            positive_count = sum(1 for e in emotion_detections if e in positive_emotions)
            neutral_count = sum(1 for e in emotion_detections if e in neutral_emotions)
            negative_count = sum(1 for e in emotion_detections if e in negative_emotions)
            
            total_emotions = len(emotion_detections)
            
            # Score: positive emotions = +1, neutral = 0, negative = -0.5
            emotion_score = ((positive_count * 1.0) + (neutral_count * 0.5) + (negative_count * 0.0)) / total_emotions * 100
            
        # Overall visual score (weighted combination)
        visual_score = (
            (face_presence_percent * 0.3) +  # 30% face presence
            (avg_eye_contact * 0.5) +        # 50% eye contact
            (emotion_score * 0.2)            # 20% emotional engagement
        )
        
        # Generate feedback
        feedback = self._generate_feedback(
            face_presence_percent=face_presence_percent,
            avg_eye_contact=avg_eye_contact,
            emotion_score=emotion_score,
            dominant_emotion=dominant_emotion
        )
        
        result = {
            'status': 'success',
            'final_score': round(visual_score, 1),
            'eye_contact_percentage': round(avg_eye_contact, 1),
            'face_presence_percentage': round(face_presence_percent, 1),
            'emotion_score': round(emotion_score, 1),
            'dominant_emotion': dominant_emotion,
            'emotion_distribution': emotion_distribution,
            'feedback': feedback,
            'metrics': {
                'duration_seconds': duration_seconds,
                'analyzed_frames': total_analyzed_frames,
                'frames_with_face': face_presence_frames,
                'eye_contact_samples': len(eye_contact_scores)
            }
        }
        
        print(f"[VISUAL ANALYZER] Analysis complete:")
        print(f"  - Overall Score: {visual_score:.1f}/100")
        print(f"  - Eye Contact: {avg_eye_contact:.1f}%")
        print(f"  - Face Presence: {face_presence_percent:.1f}%")
        print(f"  - Dominant Emotion: {dominant_emotion}")
        
        return result
        
    def _generate_feedback(self, face_presence_percent: float, avg_eye_contact: float, 
                         emotion_score: float, dominant_emotion: str) -> str:
        """Generate human-readable feedback based on visual metrics"""
        
        feedback_parts = []
        
        # Face presence feedback
        if face_presence_percent < 50:
            feedback_parts.append("Candidate was frequently out of frame or not visible")
        elif face_presence_percent < 80:
            feedback_parts.append("Candidate visibility could be improved")
        else:
            feedback_parts.append("Good camera positioning and visibility")
            
        # Eye contact feedback  
        if avg_eye_contact < 30:
            feedback_parts.append("Very poor eye contact - candidate rarely looked at camera")
        elif avg_eye_contact < 60:
            feedback_parts.append("Limited eye contact - candidate should focus more on camera")
        elif avg_eye_contact < 80:
            feedback_parts.append("Moderate eye contact - good but could be more consistent")
        else:
            feedback_parts.append("Excellent eye contact and engagement")
            
        # Emotion feedback
        if emotion_score < 30:
            feedback_parts.append(f"Emotional engagement appears low (dominant: {dominant_emotion})")
        elif emotion_score < 60:
            feedback_parts.append(f"Neutral emotional presentation (dominant: {dominant_emotion})")
        else:
            feedback_parts.append(f"Positive emotional engagement (dominant: {dominant_emotion})")
            
        return ". ".join(feedback_parts) + "."
        
    def _error_result(self, message: str) -> Dict:
        """Return error result structure"""
        return {
            'status': 'error',
            'message': message,
            'final_score': 0,
            'eye_contact_percentage': 0,
            'emotion_score': 0,
            'dominant_emotion': 'N/A',
            'feedback': f"Visual analysis failed: {message}"
        }
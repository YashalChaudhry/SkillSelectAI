"""
Core analysis engine extracted from interview_pipeline.ipynb
Contains all AI model initialization and analysis functions
"""

import cv2
import mediapipe as mp
import numpy as np
import pandas as pd
from mediapipe.tasks.python import vision
import librosa
import os
import warnings

warnings.filterwarnings('ignore')

# Lazy imports to avoid loading TensorFlow/heavy models at import time
_deepface = None
_whisper = None
_sentence_transformers = None
_textblob = None
_nltk = None
_moviepy = None

def _get_deepface():
    global _deepface
    if _deepface is None:
        from deepface import DeepFace as DF
        _deepface = DF
    return _deepface

def _get_whisper():
    global _whisper
    if _whisper is None:
        import whisper as w
        _whisper = w
    return _whisper

def _get_sentence_transformers():
    global _sentence_transformers
    if _sentence_transformers is None:
        from sentence_transformers import SentenceTransformer, util
        _sentence_transformers = (SentenceTransformer, util)
    return _sentence_transformers

def _get_textblob():
    global _textblob
    if _textblob is None:
        from textblob import TextBlob
        _textblob = TextBlob
    return _textblob

def _get_nltk():
    global _nltk
    if _nltk is None:
        import nltk as n
        _nltk = n
    return _nltk

def _get_moviepy():
    global _moviepy
    if _moviepy is None:
        from moviepy import VideoFileClip
        _moviepy = VideoFileClip
    return _moviepy


class InterviewAnalyzer:
    """Main analyzer class that initializes all AI models"""
    
    def __init__(self, model_path='face_landmarker.task'):
        """Initialize all AI models on class instantiation"""
        print("🔄 Loading AI models...")
        
        # Download NLTK data
        try:
            nltk = _get_nltk()
            nltk.download('punkt', quiet=True)
            nltk.download('punkt_tab', quiet=True)
        except:
            pass
        
        # Initialize MediaPipe components
        self.BaseOptions = mp.tasks.BaseOptions
        self.FaceLandmarker = mp.tasks.vision.FaceLandmarker
        self.FaceLandmarkerOptions = mp.tasks.vision.FaceLandmarkerOptions
        self.VisionRunningMode = mp.tasks.vision.RunningMode
        self.model_path = model_path
        
        # Load Whisper model
        whisper = _get_whisper()
        self.transcriber = whisper.load_model("base")
        
        # Load Sentence Transformer
        SentenceTransformer, util = _get_sentence_transformers()
        self.embedder = SentenceTransformer('all-MiniLM-L6-v2')
        
        print("✅ All models loaded successfully!")
    
    def get_gaze_ratio(self, eye_points, iris_center, w, h):
        """Calculate horizontal position of iris within the eye."""
        p1 = np.array([eye_points[0].x * w, eye_points[0].y * h])
        p2 = np.array([eye_points[3].x * w, eye_points[3].y * h])
        c = np.array([iris_center.x * w, iris_center.y * h])
        eye_width = np.linalg.norm(p1 - p2)
        dist_to_center = np.linalg.norm(p1 - c)
        if eye_width == 0: 
            return 0.5
        return dist_to_center / eye_width

    def is_looking_at_camera(self, face_landmarks_list, width, height):
        """Determine if user is looking at camera."""
        left_eye_indices = [33, 7, 163, 144, 145, 153, 154, 155, 133]
        right_eye_indices = [362, 382, 381, 380, 374, 373, 390, 249, 263]
        
        left_eye_lms = [face_landmarks_list[i] for i in left_eye_indices]
        right_eye_lms = [face_landmarks_list[i] for i in right_eye_indices]
        left_iris = face_landmarks_list[468]
        right_iris = face_landmarks_list[473]
        
        left_ratio = self.get_gaze_ratio(left_eye_lms, left_iris, width, height)
        right_ratio = self.get_gaze_ratio(right_eye_lms, right_iris, width, height)
        avg_ratio = (left_ratio + right_ratio) / 2
        
        return 0.42 < avg_ratio < 0.58

    def analyze_video_visual(self, video_path):
        """Analyze video for eye contact and emotions."""
        # Create fresh landmarker for each analysis to avoid timestamp issues
        options = self.FaceLandmarkerOptions(
            base_options=self.BaseOptions(model_asset_path=self.model_path),
            running_mode=self.VisionRunningMode.VIDEO,
            num_faces=1,
            min_face_detection_confidence=0.5,
            min_face_presence_confidence=0.5,
            min_tracking_confidence=0.5,
            output_face_blendshapes=True
        )
        local_landmarker = self.FaceLandmarker.create_from_options(options)
        
        cap = cv2.VideoCapture(video_path)
        fps = cap.get(cv2.CAP_PROP_FPS) or 30
        results = []
        frame_count = 0
        
        print(f"🎥 Analyzing visual cues from {video_path}...")
        
        while cap.isOpened():
            ret, frame = cap.read()
            if not ret: 
                break
            
            if frame_count % int(fps) == 0:  # Process 1 frame per second
                timestamp_ms = int(cap.get(cv2.CAP_PROP_POS_MSEC))
                timestamp_sec = frame_count / fps
                
                frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
                mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=frame_rgb)
                h, w, _ = frame.shape
                
                detection_result = local_landmarker.detect_for_video(mp_image, timestamp_ms)
                
                eye_contact = False
                face_detected = False
                dominant_emotion = "Unknown"
                
                if len(detection_result.face_landmarks) > 0:
                    face_detected = True
                    face_lms = detection_result.face_landmarks[0]
                    eye_contact = self.is_looking_at_camera(face_lms, w, h)
                    
                    try:
                        DeepFace = _get_deepface()
                        emotion_analysis = DeepFace.analyze(
                            img_path=frame_rgb,
                            actions=['emotion'],
                            enforce_detection=False,
                            silent=True
                        )
                        if isinstance(emotion_analysis, list):
                            dominant_emotion = emotion_analysis[0]['dominant_emotion']
                        else:
                            dominant_emotion = emotion_analysis['dominant_emotion']
                    except:
                        dominant_emotion = "Unknown"
                
                results.append({
                    'timestamp': timestamp_sec,
                    'eye_contact': eye_contact,
                    'face_detected': face_detected,
                    'emotion': dominant_emotion
                })
                print(f"  Frame {len(results)}: Eye Contact={eye_contact}, Emotion={dominant_emotion}")
            
            frame_count += 1
        
        cap.release()
        local_landmarker.close()  # Clean up the landmarker
        print(f"✅ Processed {len(results)} frames")
        return pd.DataFrame(results)

    def calculate_visual_score(self, df):
        """Calculate visual analysis scores."""
        eye_contact_pct = df['eye_contact'].mean() * 100
        emotions = df['emotion'].value_counts()
        dominant_emotion = emotions.index[0] if len(emotions) > 0 else "Unknown"
        
        positive_emotions = ['happy', 'neutral', 'surprise']
        positive_count = df[df['emotion'].isin(positive_emotions)].shape[0]
        emotion_score = (positive_count / len(df)) * 100 if len(df) > 0 else 0
        
        # Calculate final score (50% eye contact, 50% positive emotions)
        eye_contact_score = eye_contact_pct
        final_score = (eye_contact_score * 0.5) + (emotion_score * 0.5)
        
        # Generate feedback
        feedback = []
        if eye_contact_pct >= 70:
            feedback.append("Excellent eye contact.")
        elif eye_contact_pct >= 40:
            feedback.append("Good eye contact.")
        else:
            feedback.append("Poor eye contact - practice looking at camera.")
        
        if emotion_score >= 70:
            feedback.append("Great emotional presence.")
        elif emotion_score >= 40:
            feedback.append("Acceptable emotional expression.")
        else:
            feedback.append(f"Detected mostly {dominant_emotion} emotion - try to appear more confident.")
        
        return {
            'final_score': round(final_score, 1),
            'eye_contact_percentage': round(eye_contact_pct, 1),
            'eye_contact_score': round(eye_contact_pct, 1),
            'dominant_emotion': dominant_emotion,
            'emotion_score': round(emotion_score, 1),
            'emotions_breakdown': emotions.to_dict(),
            'feedback': " ".join(feedback)
        }

    def extract_audio(self, video_path, output_wav="temp_audio.wav"):
        """Extract audio from video as WAV file using ffmpeg directly.
        This is more robust for handling potentially incomplete/damaged webm files.
        """
        try:
            import subprocess
            import imageio_ffmpeg
            
            # Get the bundled ffmpeg path
            ffmpeg_path = imageio_ffmpeg.get_ffmpeg_exe()
            
            # Use ffmpeg directly with error handling for incomplete files
            # -y: overwrite output
            # -i: input file
            # -vn: no video
            # -acodec pcm_s16le: PCM 16-bit audio
            # -ar 16000: sample rate
            # -ac 1: mono
            cmd = [
                ffmpeg_path, '-y', '-i', video_path,
                '-vn', '-acodec', 'pcm_s16le', '-ar', '16000', '-ac', '1',
                '-err_detect', 'ignore_err',  # Ignore errors in file
                output_wav
            ]
            
            result = subprocess.run(
                cmd, 
                capture_output=True, 
                text=True,
                timeout=60
            )
            
            if os.path.exists(output_wav) and os.path.getsize(output_wav) > 0:
                print(f"✅ Audio extracted successfully: {output_wav}")
                return output_wav
            
            # Fallback to moviepy if ffmpeg direct failed
            try:
                VideoFileClip = _get_moviepy()
                video = VideoFileClip(video_path)
                video.audio.write_audiofile(output_wav, fps=16000, nbytes=2, codec='pcm_s16le', logger=None)
                video.close()
                return output_wav
            except Exception as e2:
                print(f"Moviepy fallback also failed: {e2}")
                return None
                
        except Exception as e:
            print(f"Error extracting audio: {e}")
            return None

    def analyze_audio(self, audio_path):
        """Analyze audio for pace, silence, and pitch."""
        print(f"🎤 Analyzing audio from {audio_path}...")
        
        # Load audio with librosa (bypasses FFmpeg dependency for Whisper)
        y, sr = librosa.load(audio_path, sr=16000)
        duration_total = librosa.get_duration(y=y, sr=sr)
        
        # Silence detection
        non_silent_intervals = librosa.effects.split(y, top_db=25)
        speech_duration = sum((interval[1] - interval[0]) / sr for interval in non_silent_intervals)
        silence_duration = duration_total - speech_duration
        silence_ratio = silence_duration / duration_total if duration_total > 0 else 0
        
        # Transcription & WPM - pass numpy array directly to Whisper to avoid FFmpeg
        result = self.transcriber.transcribe(y, fp16=False)
        text = result["text"].strip()
        word_count = len(text.split())
        wpm = (word_count / speech_duration) * 60 if speech_duration > 0 else 0
        
        # Pitch analysis
        f0, voiced_flag, voiced_probs = librosa.pyin(y, fmin=50, fmax=300, sr=sr)
        valid_f0 = f0[~np.isnan(f0)]
        pitch_mean = np.mean(valid_f0) if len(valid_f0) > 0 else 0
        pitch_std = np.std(valid_f0) if len(valid_f0) > 0 else 0
        
        print(f"✅ Audio analysis complete")
        
        return {
            "metrics": {
                "duration_total_sec": round(duration_total, 2),
                "speech_duration_sec": round(speech_duration, 2),
                "silence_ratio": round(silence_ratio, 2),
                "word_count": word_count,
                "wpm": round(wpm, 1),
                "pitch_avg_hz": round(pitch_mean, 1),
                "pitch_variance": round(pitch_std, 1)
            },
            "transcript": text
        }

    def calculate_audio_score(self, metrics):
        """Calculate audio score from metrics."""
        scores = {}
        feedback = []
        
        # Pace Score
        wpm = metrics['wpm']
        if 130 <= wpm <= 160:
            scores['pace'] = 100
            feedback.append("Perfect speaking pace.")
        elif 110 <= wpm < 130 or 160 < wpm <= 170:
            scores['pace'] = 80
            feedback.append("Good pace, slightly fast/slow.")
        elif wpm < 110:
            scores['pace'] = 50
            feedback.append("Speaking too slowly.")
        else:
            scores['pace'] = 50
            feedback.append("Speaking too fast.")
        
        # Confidence Score
        silence = metrics['silence_ratio']
        if silence < 0.15:
            scores['confidence'] = 100
        elif silence < 0.30:
            scores['confidence'] = 75
            feedback.append("Occasional pauses detected.")
        else:
            scores['confidence'] = 40
            feedback.append("Frequent pauses; indicates hesitation.")
        
        # Expression Score
        variance = metrics['pitch_variance']
        if variance > 20:
            scores['expression'] = 100
            feedback.append("Good vocal variety.")
        elif variance > 10:
            scores['expression'] = 70
            feedback.append("Tone is somewhat flat.")
        else:
            scores['expression'] = 40
            feedback.append("Voice is monotone.")
        
        final_score = (scores['pace'] + scores['confidence'] + scores['expression']) / 3
        
        return {
            "final_score": round(final_score, 1),
            "pace_score": scores['pace'],
            "confidence_score": scores['confidence'],
            "expression_score": scores['expression'],
            "wpm": metrics['wpm'],
            "feedback": " ".join(feedback)
        }

    def analyze_content(self, transcript, expected_keywords, model_answer):
        """Analyze transcript for keywords and semantic similarity."""
        print("📝 Analyzing content...")
        
        TextBlob = _get_textblob()
        SentenceTransformer, util = _get_sentence_transformers()
        
        expected_keywords = [k.lower() for k in expected_keywords]
        text_lower = transcript.lower()
        
        # Keyword matching
        found_keywords = [kw for kw in expected_keywords if kw in text_lower]
        keyword_score = len(found_keywords) / len(expected_keywords) if expected_keywords else 0
        
        # Semantic similarity
        embeddings = self.embedder.encode([transcript, model_answer])
        similarity_score = util.cos_sim(embeddings[0], embeddings[1]).item()
        
        # Sentiment analysis
        blob = TextBlob(transcript)
        sentiment_polarity = blob.sentiment.polarity
        
        print("✅ Content analysis complete")
        
        return {
            "matched_keywords": found_keywords,
            "missing_keywords": list(set(expected_keywords) - set(found_keywords)),
            "keyword_match_ratio": round(keyword_score, 2),
            "semantic_similarity": round(similarity_score, 2),
            "sentiment_polarity": round(sentiment_polarity, 2)
        }

    def calculate_nlp_score(self, metrics):
        """Calculate NLP score from metrics."""
        w_similarity = 0.60
        w_keywords = 0.40
        
        sim_raw = metrics['semantic_similarity']
        if sim_raw > 0.8: 
            sim_score = 100
        elif sim_raw > 0.6: 
            sim_score = 80
        elif sim_raw > 0.4: 
            sim_score = 50
        else: 
            sim_score = 20
        
        kw_score = metrics['keyword_match_ratio'] * 100
        final_score = (sim_score * w_similarity) + (kw_score * w_keywords)
        
        feedback = []
        if metrics['missing_keywords']:
            feedback.append(f"Missing terms: {', '.join(metrics['missing_keywords'])}.")
        else:
            feedback.append("Excellent use of terminology.")
        
        if sim_score >= 80:
            feedback.append("Highly relevant answer.")
        elif sim_score <= 40:
            feedback.append("Answer drifted off-topic.")
        
        if metrics['sentiment_polarity'] < -0.3:
            feedback.append("Tone was slightly negative.")
        
        return {
            "final_score": round(final_score, 1),
            "similarity_score": round(sim_raw * 100, 1),
            "keyword_score": round(kw_score, 1),
            "feedback": " ".join(feedback)
        }
    
    def analyze_video(self, video_path, expected_keywords=None, model_answer=None):
        """
        Main analysis function - calls all sub-analyses
        
        Args:
            video_path (str): Path to video file
            expected_keywords (list): Expected keywords for content analysis
            model_answer (str): Model answer for semantic comparison
            
        Returns:
            dict: Complete analysis results
        """
        print("="*60)
        print("🎯 AI INTERVIEW ASSESSMENT SYSTEM")
        print("="*60)
        
        if not os.path.exists(video_path):
            return {"error": f"Video file not found: {video_path}"}
        
        # Default values if not provided
        if expected_keywords is None:
            expected_keywords = []
        if model_answer is None:
            model_answer = ""
        
        results = {}
        
        # --- VISUAL ANALYSIS ---
        print("\n" + "-"*40)
        print("PHASE 1: VISUAL ANALYSIS")
        print("-"*40)
        visual_df = self.analyze_video_visual(video_path)
        visual_results = self.calculate_visual_score(visual_df)
        results['visual'] = visual_results
        
        # --- AUDIO ANALYSIS ---
        print("\n" + "-"*40)
        print("PHASE 2: AUDIO ANALYSIS")
        print("-"*40)
        audio_file = self.extract_audio(video_path)
        if audio_file:
            audio_data = self.analyze_audio(audio_file)
            audio_results = self.calculate_audio_score(audio_data['metrics'])
            audio_results['transcript'] = audio_data['transcript']
            results['audio'] = audio_results
            
            # --- NLP ANALYSIS ---
            print("\n" + "-"*40)
            print("PHASE 3: CONTENT ANALYSIS")
            print("-"*40)
            if expected_keywords or model_answer:
                nlp_metrics = self.analyze_content(audio_data['transcript'], expected_keywords, model_answer)
                nlp_results = self.calculate_nlp_score(nlp_metrics)
                nlp_results['matched_keywords'] = nlp_metrics['matched_keywords']
                nlp_results['missing_keywords'] = nlp_metrics['missing_keywords']
            else:
                nlp_results = {
                    "final_score": 0,
                    "feedback": "No keywords/model answer provided for content analysis."
                }
            results['nlp'] = nlp_results
            
            # Cleanup
            if os.path.exists(audio_file):
                os.remove(audio_file)
        else:
            results['audio'] = {"final_score": 0, "feedback": "Audio extraction failed."}
            results['nlp'] = {"final_score": 0, "feedback": "No transcript available."}
        
        # --- FINAL SCORE CALCULATION ---
        # Weights: Visual 30%, Audio 30%, Content 40%
        visual_score = results['visual'].get('final_score', 0)
        audio_score = results['audio'].get('final_score', 0)
        nlp_score = results['nlp'].get('final_score', 0)
        
        if nlp_score > 0:  # Full analysis with content
            final_score = (visual_score * 0.30) + (audio_score * 0.30) + (nlp_score * 0.40)
        else:  # No content analysis
            final_score = (visual_score * 0.50) + (audio_score * 0.50)
        
        results['final_score'] = round(final_score, 1)
        
        # Grade assignment
        if final_score >= 85:
            grade = "A - Excellent"
        elif final_score >= 70:
            grade = "B - Good"
        elif final_score >= 55:
            grade = "C - Average"
        elif final_score >= 40:
            grade = "D - Below Average"
        else:
            grade = "F - Poor"
        
        results['grade'] = grade
        
        return results

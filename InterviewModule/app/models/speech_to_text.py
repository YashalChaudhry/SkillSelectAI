"""
Speech-to-Text (STT) Module
Converts audio from video to transcribed text using Whisper
"""

import os
import re
import subprocess
import numpy as np
import librosa
from pathlib import Path
from typing import Optional, Tuple
import imageio_ffmpeg

class SpeechToTextProcessor:
    """Handles audio extraction and transcription"""
    
    def __init__(self):
        """Initialize STT processor"""
        self.ffmpeg_path = imageio_ffmpeg.get_ffmpeg_exe()
        self._whisper = None
        
        # Ensure ffmpeg is on PATH for Whisper (it shells out to ffmpeg)
        ffmpeg_dir = os.path.dirname(self.ffmpeg_path)
        if ffmpeg_dir not in os.environ.get('PATH', ''):
            os.environ['PATH'] = ffmpeg_dir + os.pathsep + os.environ.get('PATH', '')
    
    @property
    def whisper_model(self):
        """Lazy load Whisper model"""
        if self._whisper is None:
            import whisper as w
            self._whisper = w.load_model("base")
        return self._whisper
    
    def extract_audio_from_video(
        self,
        video_path: str,
        output_audio_path: str = "/tmp/extracted_audio.wav"
    ) -> Optional[str]:
        """
        Extract audio from video file
        
        Args:
            video_path: Path to video file
            output_audio_path: Where to save extracted audio
            
        Returns:
            Path to extracted audio file, or None if extraction failed
        """
        
        try:
            if not os.path.exists(video_path):
                print(f"Video file not found: {video_path}")
                return None
            
            print(f"Extracting audio from {video_path}...")
            
            # Use ffmpeg to extract audio robustly
            cmd = [
                self.ffmpeg_path,
                '-y',  # Overwrite output
                '-i', video_path,
                '-vn',  # No video
                '-acodec', 'pcm_s16le',  # PCM 16-bit audio codec
                '-ar', '16000',  # Sample rate
                '-ac', '1',  # Mono
                '-err_detect', 'ignore_err',  # Ignore errors
                output_audio_path
            ]
            
            result = subprocess.run(
                cmd,
                capture_output=True,
                text=True,
                timeout=120
            )
            
            # Check if output file was created successfully
            if os.path.exists(output_audio_path) and os.path.getsize(output_audio_path) > 0:
                print(f"✅ Audio extracted: {output_audio_path} ({os.path.getsize(output_audio_path)} bytes)")
                return output_audio_path
            else:
                print(f"Failed to extract audio. ffmpeg output: {result.stderr[:500]}")
                return None
                
        except subprocess.TimeoutExpired:
            print("Audio extraction timed out")
            return None
        except Exception as e:
            print(f"Error extracting audio: {e}")
            return None
    
    def transcribe_audio(self, audio_path: str) -> Optional[str]:
        """
        Transcribe audio to text using Whisper
        
        Args:
            audio_path: Path to audio file
            
        Returns:
            Transcribed text, or None if transcription failed
        """
        
        try:
            if not os.path.exists(audio_path):
                print(f"Audio file not found: {audio_path}")
                return None
            
            print(f"Transcribing audio: {audio_path}...")
            
            # Use Whisper to transcribe
            result = self.whisper_model.transcribe(audio_path, fp16=False)
            
            transcript = result.get("text", "").strip()
            
            if transcript:
                print(f"✅ Transcription complete: {len(transcript)} characters")
                return transcript
            else:
                print("No transcription result")
                return None
                
        except Exception as e:
            print(f"Error transcribing audio: {e}")
            return None
    
    def process_video_to_text(self, video_path: str) -> Optional[Tuple[str, str]]:
        """
        Full pipeline: video → audio → transcription
        
        Args:
            video_path: Path to video file
            
        Returns:
            Tuple of (audio_path, transcript), or None if failed
        """
        
        # Step 1: Extract audio
        audio_path = self.extract_audio_from_video(video_path)
        if not audio_path:
            print("Failed to extract audio from video")
            return None
        
        # Step 2: Transcribe audio
        transcript = self.transcribe_audio(audio_path)
        if not transcript:
            print("Failed to transcribe audio")
            return None
        
        # Step 3: Clean transcript
        clean_transcript = self._clean_transcript(transcript)
        
        return audio_path, clean_transcript
    
    def _clean_transcript(self, text: str) -> str:
        """
        Clean and normalize transcribed text
        
        Args:
            text: Raw transcribed text
            
        Returns:
            Cleaned text
        """
        
        # Remove filler words using regex
        filler_patterns = [
            r'\b(um|uh|uh-huh|hmm|like|you know|i mean|basically|actually)\b',
        ]
        
        for pattern in filler_patterns:
            text = re.sub(pattern, ' ', text, flags=re.IGNORECASE)
        
        # Normalize whitespace
        text = re.sub(r'\s+', ' ', text).strip()
        
        # Capitalize sentences
        text = '. '.join(sentence.capitalize() for sentence in text.split('. '))
        
        return text
    
    def get_audio_metrics(self, audio_path: str) -> Optional[dict]:
        """
        Get metrics about the audio file
        
        Args:
            audio_path: Path to audio file
            
        Returns:
            Dictionary with audio metrics
        """
        
        try:
            # Load audio
            y, sr = librosa.load(audio_path, sr=16000)
            duration = librosa.get_duration(y=y, sr=sr)
            
            # Detect speech vs silence
            non_silent_intervals = librosa.effects.split(y, top_db=25)
            speech_duration = sum((interval[1] - interval[0]) / sr for interval in non_silent_intervals)
            silence_duration = duration - speech_duration
            silence_ratio = silence_duration / duration if duration > 0 else 0
            
            # Calculate RMS energy
            S = librosa.feature.melspectrogram(y=y, sr=sr)
            S_db = librosa.power_to_db(S, ref=np.max)
            rms_energy = np.sqrt(np.mean(S_db ** 2))
            
            return {
                "total_duration": round(duration, 2),
                "speech_duration": round(speech_duration, 2),
                "silence_duration": round(silence_duration, 2),
                "silence_ratio": round(silence_ratio, 2),
                "rms_energy": round(float(rms_energy), 2),
                "sample_rate": sr
            }
        except Exception as e:
            print(f"Error getting audio metrics: {e}")
            return None

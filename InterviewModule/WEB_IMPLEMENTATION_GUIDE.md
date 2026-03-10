# 🌐 Web Interface Implementation Guide

## AI Interview Assessment System - Flask Web Application

**Objective:** Transform the Jupyter notebook-based interview analysis system into a production-ready web application with video upload, real-time processing, and interactive results dashboard.

---

## 📋 Table of Contents

1. [Phase 1: Basic Flask API (MVP)](#phase-1-basic-flask-api-mvp)
2. [Phase 2: Frontend Development](#phase-2-frontend-development)
3. [Phase 3: Async Processing](#phase-3-async-processing)
4. [Phase 4: Advanced Features](#phase-4-advanced-features)
5. [Phase 5: Production Deployment](#phase-5-production-deployment)
6. [Testing & Validation](#testing--validation)
7. [Maintenance & Monitoring](#maintenance--monitoring)

---

# Phase 1: Basic Flask API (MVP)

**Duration:** 2-3 days  
**Goal:** Create a minimal working API that accepts video uploads and returns analysis results

## Step 1.1: Project Restructuring

**Action:** Reorganize project files for web application architecture

```bash
# Create new directory structure
mkdir app
mkdir app/routes
mkdir app/models
mkdir app/utils
mkdir templates
mkdir static
mkdir static/css
mkdir static/js
mkdir static/uploads
mkdir logs
```

**Expected Structure:**
```
project/
├── app/
│   ├── __init__.py          # Flask app factory
│   ├── routes/
│   │   ├── __init__.py
│   │   └── api.py           # API endpoints
│   ├── models/
│   │   ├── __init__.py
│   │   └── analyzer.py      # Analysis logic (extracted from notebook)
│   └── utils/
│       ├── __init__.py
│       └── helpers.py       # Utility functions
├── templates/
│   ├── base.html            # Base template
│   ├── index.html           # Upload page
│   └── results.html         # Results page
├── static/
│   ├── css/
│   │   └── style.css
│   ├── js/
│   │   └── app.js
│   └── uploads/             # Temporary video storage
├── config.py                # Configuration
├── run.py                   # Application entry point
├── .env                     # Environment variables
└── .gitignore               # Git ignore file
```

**Deliverable:** Directory structure created

---

## Step 1.2: Extract Analysis Code from Notebook

**Action:** Convert notebook cells into Python modules

### Create `app/models/analyzer.py`

```python
"""
Core analysis engine extracted from interview_pipeline.ipynb
Contains all AI model initialization and analysis functions
"""

import cv2
import mediapipe as mp
import numpy as np
import pandas as pd
from deepface import DeepFace
from mediapipe.tasks.python import vision
from moviepy import VideoFileClip
import librosa
import whisper
from sentence_transformers import SentenceTransformer, util
from textblob import TextBlob
import nltk
import os
import warnings

warnings.filterwarnings('ignore')

class InterviewAnalyzer:
    """Main analyzer class that initializes all AI models"""
    
    def __init__(self, model_path='face_landmarker.task'):
        """Initialize all AI models on class instantiation"""
        print("🔄 Loading AI models...")
        
        # Download NLTK data
        nltk.download('punkt', quiet=True)
        nltk.download('punkt_tab', quiet=True)
        
        # Initialize MediaPipe components
        self.BaseOptions = mp.tasks.BaseOptions
        self.FaceLandmarker = mp.tasks.vision.FaceLandmarker
        self.FaceLandmarkerOptions = mp.tasks.vision.FaceLandmarkerOptions
        self.VisionRunningMode = mp.tasks.vision.RunningMode
        self.model_path = model_path
        
        # Load Whisper model
        self.transcriber = whisper.load_model("base")
        
        # Load Sentence Transformer
        self.embedder = SentenceTransformer('all-MiniLM-L6-v2')
        
        print("✅ All models loaded successfully!")
    
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
        # [Copy the run_full_analysis() function here]
        pass
    
    # [Copy all other functions from notebook: 
    #  - get_gaze_ratio()
    #  - is_looking_at_camera()
    #  - analyze_video_visual()
    #  - calculate_visual_score()
    #  - extract_audio()
    #  - analyze_audio()
    #  - calculate_audio_score()
    #  - analyze_content()
    #  - calculate_nlp_score()
    # ]
```

**Instructions:**
1. Copy ALL functions from `interview_pipeline.ipynb` Cell 6, 8, 10, and 12
2. Wrap them in the `InterviewAnalyzer` class
3. Replace global variables (`transcriber`, `embedder`) with `self.transcriber`, `self.embedder`
4. Test the class independently before integration

**Deliverable:** Working `analyzer.py` module

---

## Step 1.3: Create Flask Application Core

### Create `config.py`

```python
"""Application configuration"""
import os
from pathlib import Path

class Config:
    """Base configuration"""
    BASE_DIR = Path(__file__).parent
    SECRET_KEY = os.environ.get('SECRET_KEY', 'dev-secret-key-change-in-production')
    
    # Upload settings
    UPLOAD_FOLDER = BASE_DIR / 'static' / 'uploads'
    MAX_CONTENT_LENGTH = 500 * 1024 * 1024  # 500MB max file size
    ALLOWED_EXTENSIONS = {'mp4', 'avi', 'mov', 'mkv'}
    
    # Model paths
    FACE_LANDMARKER_MODEL = BASE_DIR / 'face_landmarker.task'
    
    # Processing settings
    CLEANUP_AFTER_HOURS = 24  # Delete uploads after 24 hours
    
class DevelopmentConfig(Config):
    """Development configuration"""
    DEBUG = True
    TESTING = False

class ProductionConfig(Config):
    """Production configuration"""
    DEBUG = False
    TESTING = False
    SECRET_KEY = os.environ.get('SECRET_KEY')  # Must be set in production

config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'default': DevelopmentConfig
}
```

### Create `.env`

```bash
FLASK_APP=run.py
FLASK_ENV=development
SECRET_KEY=your-secret-key-here
```

### Create `app/__init__.py`

```python
"""Flask application factory"""
from flask import Flask
from flask_cors import CORS
from config import config

def create_app(config_name='default'):
    """Create and configure Flask application"""
    app = Flask(__name__)
    app.config.from_object(config[config_name])
    
    # Enable CORS
    CORS(app)
    
    # Ensure upload folder exists
    app.config['UPLOAD_FOLDER'].mkdir(parents=True, exist_ok=True)
    
    # Register blueprints
    from app.routes.api import api_bp
    app.register_blueprint(api_bp, url_prefix='/api')
    
    # Register main routes
    from app.routes import main
    app.register_blueprint(main.main_bp)
    
    return app
```

**Deliverable:** Flask app structure created

---

## Step 1.4: Create API Endpoints

### Create `app/routes/api.py`

```python
"""API endpoints for video analysis"""
from flask import Blueprint, request, jsonify, current_app
from werkzeug.utils import secure_filename
import os
import uuid
from datetime import datetime
from pathlib import Path

from app.models.analyzer import InterviewAnalyzer

api_bp = Blueprint('api', __name__)

# Initialize analyzer globally (loaded once at startup)
analyzer = None

def init_analyzer():
    """Initialize analyzer on first request"""
    global analyzer
    if analyzer is None:
        model_path = current_app.config['FACE_LANDMARKER_MODEL']
        analyzer = InterviewAnalyzer(model_path=str(model_path))
    return analyzer

def allowed_file(filename):
    """Check if file extension is allowed"""
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in current_app.config['ALLOWED_EXTENSIONS']

@api_bp.route('/analyze', methods=['POST'])
def analyze_video():
    """
    Main endpoint for video analysis
    
    Form Data:
        video: Video file (required)
        keywords: JSON array or comma-separated string (optional)
        model_answer: String (optional)
        
    Returns:
        JSON: Analysis results or error message
    """
    try:
        # Validate request
        if 'video' not in request.files:
            return jsonify({'success': False, 'error': 'No video file provided'}), 400
        
        video_file = request.files['video']
        
        if video_file.filename == '':
            return jsonify({'success': False, 'error': 'No file selected'}), 400
        
        if not allowed_file(video_file.filename):
            return jsonify({
                'success': False, 
                'error': f'Invalid file type. Allowed: {current_app.config["ALLOWED_EXTENSIONS"]}'
            }), 400
        
        # Create unique session ID
        session_id = str(uuid.uuid4())
        session_dir = current_app.config['UPLOAD_FOLDER'] / session_id
        session_dir.mkdir(parents=True, exist_ok=True)
        
        # Save uploaded file
        filename = secure_filename(video_file.filename)
        video_path = session_dir / filename
        video_file.save(str(video_path))
        
        # Parse optional parameters
        keywords_str = request.form.get('keywords', '')
        keywords = [k.strip() for k in keywords_str.split(',') if k.strip()] if keywords_str else None
        
        model_answer = request.form.get('model_answer', None)
        
        # Initialize analyzer
        analyzer_instance = init_analyzer()
        
        # Run analysis
        print(f"📹 Processing video: {filename}")
        results = analyzer_instance.analyze_video(
            video_path=str(video_path),
            expected_keywords=keywords,
            model_answer=model_answer
        )
        
        # Add metadata
        results['metadata'] = {
            'session_id': session_id,
            'filename': filename,
            'timestamp': datetime.utcnow().isoformat(),
            'video_path': str(video_path)
        }
        
        # Cleanup video file (optional - uncomment to delete immediately)
        # os.remove(str(video_path))
        
        return jsonify({
            'success': True,
            'data': results
        }), 200
        
    except Exception as e:
        print(f"❌ Error during analysis: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@api_bp.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'models_loaded': analyzer is not None
    }), 200
```

**Deliverable:** Working API endpoint that accepts video uploads

---

## Step 1.5: Create Main Routes

### Create `app/routes/main.py`

```python
"""Main web routes"""
from flask import Blueprint, render_template

main_bp = Blueprint('main', __name__)

@main_bp.route('/')
def index():
    """Home page with upload form"""
    return render_template('index.html')

@main_bp.route('/results/<session_id>')
def results(session_id):
    """Results page"""
    return render_template('results.html', session_id=session_id)
```

### Create `app/routes/__init__.py`

```python
# Empty file to make routes a package
```

**Deliverable:** Route handlers created

---

## Step 1.6: Create Entry Point

### Create `run.py`

```python
"""Application entry point"""
import os
from app import create_app

# Get environment from .env
env = os.environ.get('FLASK_ENV', 'development')
app = create_app(env)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=(env == 'development'))
```

**Deliverable:** Runnable Flask application

---

## Step 1.7: Test API with Postman/cURL

### Test Commands

```bash
# Activate virtual environment
.\venv310\Scripts\Activate.ps1

# Run Flask app
python run.py

# In another terminal - test health check
curl http://localhost:5000/api/health

# Test video upload
curl -X POST http://localhost:5000/api/analyze \
  -F "video=@video/interview1.mp4" \
  -F "keywords=experience,skills,project" \
  -F "model_answer=I have experience in Python development"
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "final_score": 48.7,
    "grade": "D - Below Average",
    "visual": { ... },
    "audio": { ... },
    "nlp": { ... },
    "metadata": { ... }
  }
}
```

**Deliverable:** Working API verified with test requests

---

## Phase 1 Checklist

- [ ] Directory structure created
- [ ] `analyzer.py` module created with all functions
- [ ] `config.py` configuration file created
- [ ] `.env` environment file created
- [ ] Flask app factory (`app/__init__.py`) created
- [ ] API routes (`app/routes/api.py`) created
- [ ] Main routes (`app/routes/main.py`) created
- [ ] Entry point (`run.py`) created
- [ ] API tested with cURL/Postman
- [ ] Video analysis returns correct JSON

**Phase 1 Complete!** ✅  
You now have a working REST API for video analysis.

---

# Phase 2: Frontend Development

**Duration:** 2-3 days  
**Goal:** Create user-friendly web interface for video upload and results display

## Step 2.1: Create Base HTML Template

### Create `templates/base.html`

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{% block title %}AI Interview Assessment{% endblock %}</title>
    
    <!-- Bootstrap CSS -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    
    <!-- Font Awesome -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    
    <!-- Custom CSS -->
    <link rel="stylesheet" href="{{ url_for('static', filename='css/style.css') }}">
    
    {% block extra_css %}{% endblock %}
</head>
<body>
    <!-- Navigation Bar -->
    <nav class="navbar navbar-dark bg-primary">
        <div class="container">
            <a class="navbar-brand" href="{{ url_for('main.index') }}">
                <i class="fas fa-video"></i> AI Interview Assessment
            </a>
        </div>
    </nav>

    <!-- Main Content -->
    <main class="container my-5">
        {% block content %}{% endblock %}
    </main>

    <!-- Footer -->
    <footer class="bg-light text-center py-3 mt-5">
        <div class="container">
            <p class="text-muted mb-0">
                &copy; 2026 AI Interview Assessment System | Powered by MediaPipe, Whisper & Sentence-BERT
            </p>
        </div>
    </footer>

    <!-- Bootstrap JS -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    
    <!-- jQuery -->
    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
    
    {% block extra_js %}{% endblock %}
</body>
</html>
```

**Deliverable:** Base template with navigation and footer

---

## Step 2.2: Create Upload Page

### Create `templates/index.html`

```html
{% extends "base.html" %}

{% block title %}Upload Video - AI Interview Assessment{% endblock %}

{% block content %}
<div class="row justify-content-center">
    <div class="col-lg-8">
        <!-- Header -->
        <div class="text-center mb-5">
            <h1 class="display-4">🎯 AI Interview Assessment</h1>
            <p class="lead text-muted">
                Upload an interview video for comprehensive AI-powered analysis
            </p>
        </div>

        <!-- Upload Card -->
        <div class="card shadow">
            <div class="card-body p-4">
                <form id="uploadForm" enctype="multipart/form-data">
                    <!-- Video Upload -->
                    <div class="mb-4">
                        <label for="videoFile" class="form-label fw-bold">
                            <i class="fas fa-video text-primary"></i> Interview Video *
                        </label>
                        <input type="file" class="form-control" id="videoFile" 
                               accept="video/mp4,video/avi,video/mov,video/mkv" required>
                        <div class="form-text">
                            Accepted formats: MP4, AVI, MOV, MKV (Max: 500MB)
                        </div>
                    </div>

                    <!-- Keywords (Optional) -->
                    <div class="mb-4">
                        <label for="keywords" class="form-label fw-bold">
                            <i class="fas fa-tags text-success"></i> Expected Keywords (Optional)
                        </label>
                        <input type="text" class="form-control" id="keywords" 
                               placeholder="e.g., experience, skills, project, team">
                        <div class="form-text">
                            Comma-separated terms you expect in the answer
                        </div>
                    </div>

                    <!-- Model Answer (Optional) -->
                    <div class="mb-4">
                        <label for="modelAnswer" class="form-label fw-bold">
                            <i class="fas fa-lightbulb text-warning"></i> Ideal Answer (Optional)
                        </label>
                        <textarea class="form-control" id="modelAnswer" rows="4"
                                  placeholder="Enter the ideal answer for comparison..."></textarea>
                        <div class="form-text">
                            Provide a model answer to compare semantic similarity
                        </div>
                    </div>

                    <!-- Submit Button -->
                    <div class="d-grid">
                        <button type="submit" class="btn btn-primary btn-lg" id="analyzeBtn">
                            <i class="fas fa-brain"></i> Analyze Interview
                        </button>
                    </div>
                </form>

                <!-- Progress Section (Hidden by default) -->
                <div id="progressSection" class="mt-4" style="display: none;">
                    <div class="text-center">
                        <div class="spinner-border text-primary mb-3" role="status">
                            <span class="visually-hidden">Loading...</span>
                        </div>
                        <h5 id="progressText">Uploading video...</h5>
                        <p class="text-muted" id="progressDetails">Please wait, this may take 1-2 minutes</p>
                        <div class="progress">
                            <div class="progress-bar progress-bar-striped progress-bar-animated" 
                                 role="progressbar" style="width: 100%"></div>
                        </div>
                    </div>
                </div>

                <!-- Error Alert (Hidden by default) -->
                <div id="errorAlert" class="alert alert-danger mt-4" role="alert" style="display: none;">
                    <i class="fas fa-exclamation-triangle"></i>
                    <strong>Error:</strong> <span id="errorMessage"></span>
                </div>
            </div>
        </div>

        <!-- Features Section -->
        <div class="row mt-5">
            <div class="col-md-4 text-center">
                <div class="feature-box p-3">
                    <i class="fas fa-eye fa-3x text-primary mb-3"></i>
                    <h5>Visual Analysis</h5>
                    <p class="text-muted">Eye contact tracking & emotion detection</p>
                </div>
            </div>
            <div class="col-md-4 text-center">
                <div class="feature-box p-3">
                    <i class="fas fa-microphone fa-3x text-success mb-3"></i>
                    <h5>Audio Analysis</h5>
                    <p class="text-muted">Speech pace, tone & confidence scoring</p>
                </div>
            </div>
            <div class="col-md-4 text-center">
                <div class="feature-box p-3">
                    <i class="fas fa-brain fa-3x text-warning mb-3"></i>
                    <h5>NLP Analysis</h5>
                    <p class="text-muted">Content relevance & keyword matching</p>
                </div>
            </div>
        </div>
    </div>
</div>
{% endblock %}

{% block extra_js %}
<script src="{{ url_for('static', filename='js/app.js') }}"></script>
{% endblock %}
```

**Deliverable:** Upload page with form validation

---

## Step 2.3: Create JavaScript for Upload

### Create `static/js/app.js`

```javascript
/**
 * Frontend logic for video upload and analysis
 */

$(document).ready(function() {
    const uploadForm = $('#uploadForm');
    const analyzeBtn = $('#analyzeBtn');
    const progressSection = $('#progressSection');
    const errorAlert = $('#errorAlert');
    const progressText = $('#progressText');
    const progressDetails = $('#progressDetails');

    // Form submission
    uploadForm.on('submit', function(e) {
        e.preventDefault();
        
        // Validate file
        const videoFile = $('#videoFile')[0].files[0];
        if (!videoFile) {
            showError('Please select a video file');
            return;
        }

        // Check file size (500MB max)
        const maxSize = 500 * 1024 * 1024;
        if (videoFile.size > maxSize) {
            showError('File size exceeds 500MB limit');
            return;
        }

        // Prepare form data
        const formData = new FormData();
        formData.append('video', videoFile);
        
        const keywords = $('#keywords').val();
        if (keywords) {
            formData.append('keywords', keywords);
        }
        
        const modelAnswer = $('#modelAnswer').val();
        if (modelAnswer) {
            formData.append('model_answer', modelAnswer);
        }

        // Show progress, hide form
        analyzeBtn.prop('disabled', true);
        progressSection.show();
        errorAlert.hide();
        
        updateProgress('Uploading video...', 'Please wait while we upload your file');

        // Send AJAX request
        $.ajax({
            url: '/api/analyze',
            type: 'POST',
            data: formData,
            processData: false,
            contentType: false,
            xhr: function() {
                const xhr = new window.XMLHttpRequest();
                // Upload progress
                xhr.upload.addEventListener('progress', function(e) {
                    if (e.lengthComputable) {
                        const percentComplete = Math.round((e.loaded / e.total) * 100);
                        updateProgress(
                            `Uploading video... ${percentComplete}%`,
                            'File transfer in progress'
                        );
                    }
                }, false);
                return xhr;
            },
            success: function(response) {
                if (response.success) {
                    // Redirect to results page
                    const sessionId = response.data.metadata.session_id;
                    window.location.href = `/results/${sessionId}`;
                } else {
                    showError(response.error || 'Unknown error occurred');
                    resetForm();
                }
            },
            error: function(xhr, status, error) {
                let errorMsg = 'Server error occurred';
                if (xhr.responseJSON && xhr.responseJSON.error) {
                    errorMsg = xhr.responseJSON.error;
                }
                showError(errorMsg);
                resetForm();
            }
        });

        // Simulate analysis progress messages
        setTimeout(() => updateProgress('Processing video frames...', 'Visual analysis in progress'), 3000);
        setTimeout(() => updateProgress('Analyzing audio...', 'Transcription and speech analysis'), 10000);
        setTimeout(() => updateProgress('Evaluating content...', 'NLP and semantic analysis'), 20000);
    });

    function updateProgress(text, details) {
        progressText.text(text);
        progressDetails.text(details);
    }

    function showError(message) {
        $('#errorMessage').text(message);
        errorAlert.show();
    }

    function resetForm() {
        analyzeBtn.prop('disabled', false);
        progressSection.hide();
    }
});
```

**Deliverable:** Working upload functionality with progress indicator

---

## Step 2.4: Create Results Page

### Create `templates/results.html`

```html
{% extends "base.html" %}

{% block title %}Analysis Results - AI Interview Assessment{% endblock %}

{% block extra_css %}
<style>
    .score-circle {
        width: 150px;
        height: 150px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 2.5rem;
        font-weight: bold;
        color: white;
        margin: 0 auto;
    }
    .score-A { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
    .score-B { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); }
    .score-C { background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); }
    .score-D { background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%); }
    .score-F { background: linear-gradient(135deg, #fa709a 0%, #fee140 100%); }
</style>
{% endblock %}

{% block content %}
<div class="row">
    <!-- Loading State -->
    <div id="loadingSection" class="col-12 text-center">
        <div class="spinner-border text-primary mb-3" style="width: 3rem; height: 3rem;" role="status">
            <span class="visually-hidden">Loading...</span>
        </div>
        <h4>Loading analysis results...</h4>
    </div>

    <!-- Results Section (Hidden initially) -->
    <div id="resultsSection" class="col-12" style="display: none;">
        <!-- Header -->
        <div class="text-center mb-5">
            <h1 class="display-5">📊 Interview Assessment Report</h1>
            <p class="text-muted">Session ID: <code id="sessionId">{{ session_id }}</code></p>
        </div>

        <!-- Overall Score Card -->
        <div class="card shadow-lg mb-4">
            <div class="card-body text-center py-5">
                <h2 class="mb-4">Overall Performance</h2>
                <div id="scoreCircle" class="score-circle mb-3">
                    <span id="finalScore">--</span>
                </div>
                <h3 id="gradeText" class="text-muted">Loading...</h3>
                <p class="text-muted">Out of 100</p>
            </div>
        </div>

        <!-- Component Scores -->
        <div class="row mb-4">
            <!-- Visual Score -->
            <div class="col-md-4 mb-3">
                <div class="card h-100">
                    <div class="card-header bg-primary text-white">
                        <h5 class="mb-0"><i class="fas fa-eye"></i> Visual Analysis</h5>
                    </div>
                    <div class="card-body">
                        <h2 class="text-primary" id="visualScore">--</h2>
                        <p class="text-muted mb-3">Eye Contact: <strong id="eyeContact">--%</strong></p>
                        <p class="text-muted mb-3">Emotion: <strong id="emotion">--</strong></p>
                        <hr>
                        <p class="small" id="visualFeedback">Loading...</p>
                    </div>
                </div>
            </div>

            <!-- Audio Score -->
            <div class="col-md-4 mb-3">
                <div class="card h-100">
                    <div class="card-header bg-success text-white">
                        <h5 class="mb-0"><i class="fas fa-microphone"></i> Audio Analysis</h5>
                    </div>
                    <div class="card-body">
                        <h2 class="text-success" id="audioScore">--</h2>
                        <p class="text-muted mb-3">Speaking Pace: <strong id="wpm">-- WPM</strong></p>
                        <p class="text-muted mb-3">Confidence: <strong id="confidence">--</strong></p>
                        <hr>
                        <p class="small" id="audioFeedback">Loading...</p>
                    </div>
                </div>
            </div>

            <!-- NLP Score -->
            <div class="col-md-4 mb-3">
                <div class="card h-100">
                    <div class="card-header bg-warning text-dark">
                        <h5 class="mb-0"><i class="fas fa-brain"></i> Content Analysis</h5>
                    </div>
                    <div class="card-body">
                        <h2 class="text-warning" id="nlpScore">--</h2>
                        <p class="text-muted mb-3">Keywords: <strong id="keywordsFound">--</strong></p>
                        <p class="text-muted mb-3">Similarity: <strong id="similarity">--%</strong></p>
                        <hr>
                        <p class="small" id="nlpFeedback">Loading...</p>
                    </div>
                </div>
            </div>
        </div>

        <!-- Transcript Section -->
        <div class="card mb-4">
            <div class="card-header">
                <h5 class="mb-0"><i class="fas fa-file-alt"></i> Interview Transcript</h5>
            </div>
            <div class="card-body">
                <p id="transcript" class="font-monospace">Loading transcript...</p>
            </div>
        </div>

        <!-- Actions -->
        <div class="text-center">
            <a href="{{ url_for('main.index') }}" class="btn btn-primary btn-lg">
                <i class="fas fa-plus"></i> Analyze Another Video
            </a>
            <button class="btn btn-outline-secondary btn-lg" onclick="window.print()">
                <i class="fas fa-print"></i> Print Report
            </button>
        </div>
    </div>
</div>
{% endblock %}

{% block extra_js %}
<script>
const sessionId = "{{ session_id }}";

$(document).ready(function() {
    // For Phase 2: Store results in localStorage after upload
    // Retrieve from localStorage and display
    
    const resultsKey = `analysis_${sessionId}`;
    const storedResults = localStorage.getItem(resultsKey);
    
    if (storedResults) {
        const data = JSON.parse(storedResults);
        displayResults(data);
    } else {
        $('#loadingSection').html('<div class="alert alert-warning">No results found for this session.</div>');
    }
});

function displayResults(data) {
    // Hide loading, show results
    $('#loadingSection').hide();
    $('#resultsSection').show();
    
    // Overall score
    const score = data.final_score;
    const grade = data.grade.charAt(0); // Get letter grade
    $('#finalScore').text(score);
    $('#gradeText').text(data.grade);
    $('#scoreCircle').addClass(`score-${grade}`);
    
    // Visual analysis
    $('#visualScore').text(data.visual.final_score + '/100');
    $('#eyeContact').text(data.visual.eye_contact_percentage + '%');
    $('#emotion').text(data.visual.dominant_emotion);
    $('#visualFeedback').text(data.visual.feedback);
    
    // Audio analysis
    $('#audioScore').text(data.audio.final_score + '/100');
    $('#wpm').text(data.audio.wpm + ' WPM');
    $('#confidence').text(data.audio.confidence_score);
    $('#audioFeedback').text(data.audio.feedback);
    
    // NLP analysis
    $('#nlpScore').text(data.nlp.final_score + '/100');
    $('#keywordsFound').text(data.nlp.matched_keywords.length);
    $('#similarity').text(data.nlp.similarity_score + '%');
    $('#nlpFeedback').text(data.nlp.feedback);
    
    // Transcript
    if (data.audio.transcript) {
        $('#transcript').text(data.audio.transcript);
    } else {
        $('#transcript').text('No transcript available (video may not have audio)');
    }
}
</script>
{% endblock %}
```

**Deliverable:** Results page with score visualization

---

## Step 2.5: Update JavaScript to Store Results

### Update `static/js/app.js` - Add after success callback:

```javascript
success: function(response) {
    if (response.success) {
        // Store results in localStorage for results page
        const sessionId = response.data.metadata.session_id;
        const resultsKey = `analysis_${sessionId}`;
        localStorage.setItem(resultsKey, JSON.stringify(response.data));
        
        // Redirect to results page
        window.location.href = `/results/${sessionId}`;
    } else {
        showError(response.error || 'Unknown error occurred');
        resetForm();
    }
}
```

**Deliverable:** Results passed from upload to results page

---

## Step 2.6: Create Custom CSS

### Create `static/css/style.css`

```css
/* Custom styles for AI Interview Assessment */

:root {
    --primary-color: #667eea;
    --secondary-color: #764ba2;
    --success-color: #43e97b;
    --warning-color: #f5576c;
}

body {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
    min-height: 100vh;
}

.navbar-brand {
    font-weight: 600;
    font-size: 1.3rem;
}

.card {
    border: none;
    border-radius: 15px;
    transition: transform 0.3s ease;
}

.card:hover {
    transform: translateY(-5px);
}

.feature-box {
    transition: all 0.3s ease;
}

.feature-box:hover {
    transform: scale(1.05);
}

.btn-lg {
    padding: 12px 30px;
    font-size: 1.1rem;
    border-radius: 10px;
}

.progress {
    height: 10px;
    border-radius: 10px;
}

.form-control, .form-select {
    border-radius: 10px;
    padding: 12px 15px;
}

.form-control:focus {
    border-color: var(--primary-color);
    box-shadow: 0 0 0 0.2rem rgba(102, 126, 234, 0.25);
}

/* Print styles */
@media print {
    .navbar, footer, .btn {
        display: none !important;
    }
    
    .card {
        box-shadow: none !important;
        border: 1px solid #dee2e6 !important;
    }
}
```

**Deliverable:** Styled, professional-looking interface

---

## Phase 2 Checklist

- [ ] `base.html` template created
- [ ] `index.html` upload page created
- [ ] `results.html` results page created
- [ ] `app.js` JavaScript file created
- [ ] `style.css` stylesheet created
- [ ] Form validation working
- [ ] Upload progress indicator working
- [ ] Results display working
- [ ] localStorage data passing working
- [ ] Responsive design tested on mobile

**Phase 2 Complete!** ✅  
You now have a full-featured web interface.

---

# Phase 3: Async Processing

**Duration:** 2-3 days  
**Goal:** Implement background task processing to handle long-running video analysis

## Step 3.1: Install Celery & Redis

```bash
# Activate virtual environment
.\venv310\Scripts\Activate.ps1

# Install Celery and Redis client
pip install celery redis

# Update requirements.txt
pip freeze > requirements.txt
```

### Install Redis Server

**Windows:**
```powershell
# Using winget
winget install Redis.Redis

# Or download from: https://github.com/microsoftarchive/redis/releases
```

**Linux/Mac:**
```bash
# Ubuntu/Debian
sudo apt-get install redis-server

# Mac
brew install redis
```

**Deliverable:** Celery and Redis installed

---

## Step 3.2: Create Celery Configuration

### Create `celery_app.py`

```python
"""Celery application configuration"""
from celery import Celery
from config import Config
import os

def make_celery():
    """Create Celery instance"""
    celery = Celery(
        'interview_analyzer',
        broker=os.environ.get('CELERY_BROKER_URL', 'redis://localhost:6379/0'),
        backend=os.environ.get('CELERY_RESULT_BACKEND', 'redis://localhost:6379/0')
    )
    
    # Configuration
    celery.conf.update(
        task_serializer='json',
        accept_content=['json'],
        result_serializer='json',
        timezone='UTC',
        enable_utc=True,
        task_track_started=True,
        task_time_limit=600,  # 10 minutes max
        task_soft_time_limit=540,  # 9 minutes soft limit
    )
    
    return celery

celery = make_celery()
```

### Update `.env`

```bash
CELERY_BROKER_URL=redis://localhost:6379/0
CELERY_RESULT_BACKEND=redis://localhost:6379/0
```

**Deliverable:** Celery configuration created

---

## Step 3.3: Create Async Analysis Task

### Create `app/tasks.py`

```python
"""Background tasks for video analysis"""
from celery_app import celery
from app.models.analyzer import InterviewAnalyzer
from pathlib import Path
import os

# Initialize analyzer
analyzer = None

def get_analyzer():
    """Lazy load analyzer"""
    global analyzer
    if analyzer is None:
        model_path = Path(__file__).parent.parent / 'face_landmarker.task'
        analyzer = InterviewAnalyzer(model_path=str(model_path))
    return analyzer

@celery.task(bind=True, name='app.tasks.analyze_video_async')
def analyze_video_async(self, video_path, keywords=None, model_answer=None):
    """
    Async task for video analysis
    
    Args:
        video_path (str): Path to uploaded video
        keywords (list): Optional keywords
        model_answer (str): Optional model answer
        
    Returns:
        dict: Analysis results
    """
    try:
        # Update task state to PROGRESS
        self.update_state(
            state='PROGRESS',
            meta={'current': 0, 'total': 100, 'status': 'Initializing...'}
        )
        
        # Get analyzer instance
        analyzer_instance = get_analyzer()
        
        # Update progress
        self.update_state(
            state='PROGRESS',
            meta={'current': 10, 'total': 100, 'status': 'Analyzing video frames...'}
        )
        
        # Run analysis
        results = analyzer_instance.analyze_video(
            video_path=video_path,
            expected_keywords=keywords,
            model_answer=model_answer
        )
        
        # Update progress
        self.update_state(
            state='PROGRESS',
            meta={'current': 90, 'total': 100, 'status': 'Finalizing results...'}
        )
        
        # Cleanup: delete video file after analysis
        try:
            if os.path.exists(video_path):
                os.remove(video_path)
            # Also delete parent directory if empty
            parent_dir = Path(video_path).parent
            if parent_dir.exists() and not any(parent_dir.iterdir()):
                parent_dir.rmdir()
        except Exception as e:
            print(f"Warning: Failed to cleanup {video_path}: {e}")
        
        return results
        
    except Exception as e:
        # Update task state to FAILURE
        self.update_state(
            state='FAILURE',
            meta={'status': f'Error: {str(e)}'}
        )
        raise
```

**Deliverable:** Async task for video analysis

---

## Step 3.4: Update API Routes for Async

### Update `app/routes/api.py`

```python
"""API endpoints with async support"""
from flask import Blueprint, request, jsonify, current_app
from werkzeug.utils import secure_filename
import os
import uuid
from datetime import datetime
from pathlib import Path

from app.tasks import analyze_video_async

api_bp = Blueprint('api', __name__)

def allowed_file(filename):
    """Check if file extension is allowed"""
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in current_app.config['ALLOWED_EXTENSIONS']

@api_bp.route('/analyze', methods=['POST'])
def analyze_video():
    """
    Submit video for async analysis
    
    Returns:
        JSON: Task ID for status polling
    """
    try:
        # Validate request
        if 'video' not in request.files:
            return jsonify({'success': False, 'error': 'No video file provided'}), 400
        
        video_file = request.files['video']
        
        if video_file.filename == '':
            return jsonify({'success': False, 'error': 'No file selected'}), 400
        
        if not allowed_file(video_file.filename):
            return jsonify({
                'success': False, 
                'error': f'Invalid file type. Allowed: {current_app.config["ALLOWED_EXTENSIONS"]}'
            }), 400
        
        # Create unique session ID
        session_id = str(uuid.uuid4())
        session_dir = current_app.config['UPLOAD_FOLDER'] / session_id
        session_dir.mkdir(parents=True, exist_ok=True)
        
        # Save uploaded file
        filename = secure_filename(video_file.filename)
        video_path = session_dir / filename
        video_file.save(str(video_path))
        
        # Parse optional parameters
        keywords_str = request.form.get('keywords', '')
        keywords = [k.strip() for k in keywords_str.split(',') if k.strip()] if keywords_str else None
        
        model_answer = request.form.get('model_answer', None)
        
        # Submit async task
        task = analyze_video_async.apply_async(
            args=[str(video_path), keywords, model_answer]
        )
        
        return jsonify({
            'success': True,
            'task_id': task.id,
            'session_id': session_id,
            'status_url': f'/api/status/{task.id}'
        }), 202  # 202 Accepted
        
    except Exception as e:
        print(f"❌ Error submitting task: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@api_bp.route('/status/<task_id>', methods=['GET'])
def get_task_status(task_id):
    """
    Get status of async task
    
    Args:
        task_id: Celery task ID
        
    Returns:
        JSON: Task status and results
    """
    from celery.result import AsyncResult
    
    task = AsyncResult(task_id)
    
    if task.state == 'PENDING':
        response = {
            'state': 'PENDING',
            'status': 'Task is waiting to start...'
        }
    elif task.state == 'PROGRESS':
        response = {
            'state': 'PROGRESS',
            'current': task.info.get('current', 0),
            'total': task.info.get('total', 100),
            'status': task.info.get('status', '')
        }
    elif task.state == 'SUCCESS':
        response = {
            'state': 'SUCCESS',
            'result': task.result
        }
    elif task.state == 'FAILURE':
        response = {
            'state': 'FAILURE',
            'status': str(task.info)
        }
    else:
        response = {
            'state': task.state,
            'status': 'Unknown state'
        }
    
    return jsonify(response)

@api_bp.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    # Check Celery connection
    from celery_app import celery
    try:
        celery.control.inspect().stats()
        celery_status = 'connected'
    except:
        celery_status = 'disconnected'
    
    return jsonify({
        'status': 'healthy',
        'celery': celery_status
    }), 200
```

**Deliverable:** Async API endpoints with task status polling

---

## Step 3.5: Update Frontend for Polling

### Update `static/js/app.js`

```javascript
/**
 * Frontend with async polling support
 */

$(document).ready(function() {
    const uploadForm = $('#uploadForm');
    const analyzeBtn = $('#analyzeBtn');
    const progressSection = $('#progressSection');
    const errorAlert = $('#errorAlert');
    const progressText = $('#progressText');
    const progressDetails = $('#progressDetails');

    uploadForm.on('submit', function(e) {
        e.preventDefault();
        
        // Validate file
        const videoFile = $('#videoFile')[0].files[0];
        if (!videoFile) {
            showError('Please select a video file');
            return;
        }

        const maxSize = 500 * 1024 * 1024;
        if (videoFile.size > maxSize) {
            showError('File size exceeds 500MB limit');
            return;
        }

        // Prepare form data
        const formData = new FormData();
        formData.append('video', videoFile);
        
        const keywords = $('#keywords').val();
        if (keywords) formData.append('keywords', keywords);
        
        const modelAnswer = $('#modelAnswer').val();
        if (modelAnswer) formData.append('model_answer', modelAnswer);

        // Show progress
        analyzeBtn.prop('disabled', true);
        progressSection.show();
        errorAlert.hide();
        updateProgress('Uploading video...', 'Please wait');

        // Submit video
        $.ajax({
            url: '/api/analyze',
            type: 'POST',
            data: formData,
            processData: false,
            contentType: false,
            success: function(response) {
                if (response.success) {
                    // Start polling for results
                    const taskId = response.task_id;
                    const sessionId = response.session_id;
                    pollTaskStatus(taskId, sessionId);
                } else {
                    showError(response.error || 'Unknown error');
                    resetForm();
                }
            },
            error: function(xhr) {
                let errorMsg = 'Server error occurred';
                if (xhr.responseJSON && xhr.responseJSON.error) {
                    errorMsg = xhr.responseJSON.error;
                }
                showError(errorMsg);
                resetForm();
            }
        });
    });

    function pollTaskStatus(taskId, sessionId) {
        const statusUrl = `/api/status/${taskId}`;
        
        const pollInterval = setInterval(function() {
            $.ajax({
                url: statusUrl,
                type: 'GET',
                success: function(response) {
                    if (response.state === 'PENDING') {
                        updateProgress('Queued...', 'Waiting for processing');
                    } else if (response.state === 'PROGRESS') {
                        const percent = Math.round((response.current / response.total) * 100);
                        updateProgress(response.status, `${percent}% complete`);
                    } else if (response.state === 'SUCCESS') {
                        clearInterval(pollInterval);
                        
                        // Store results and redirect
                        const resultsKey = `analysis_${sessionId}`;
                        localStorage.setItem(resultsKey, JSON.stringify(response.result));
                        window.location.href = `/results/${sessionId}`;
                    } else if (response.state === 'FAILURE') {
                        clearInterval(pollInterval);
                        showError(response.status);
                        resetForm();
                    }
                },
                error: function() {
                    clearInterval(pollInterval);
                    showError('Failed to check task status');
                    resetForm();
                }
            });
        }, 2000); // Poll every 2 seconds
    }

    function updateProgress(text, details) {
        progressText.text(text);
        progressDetails.text(details);
    }

    function showError(message) {
        $('#errorMessage').text(message);
        errorAlert.show();
    }

    function resetForm() {
        analyzeBtn.prop('disabled', false);
        progressSection.hide();
    }
});
```

**Deliverable:** Frontend polling for async task status

---

## Step 3.6: Start Celery Worker

### Create startup scripts

**For Windows:** `start_celery.bat`
```batch
@echo off
call venv310\Scripts\activate
celery -A celery_app.celery worker --loglevel=info --pool=solo
```

**For Linux/Mac:** `start_celery.sh`
```bash
#!/bin/bash
source venv310/bin/activate
celery -A celery_app.celery worker --loglevel=info
```

### Start services

```powershell
# Terminal 1: Start Redis
redis-server

# Terminal 2: Start Celery Worker
.\start_celery.bat

# Terminal 3: Start Flask App
python run.py
```

**Deliverable:** Working async processing system

---

## Phase 3 Checklist

- [ ] Celery and Redis installed
- [ ] `celery_app.py` configuration created
- [ ] `app/tasks.py` async task created
- [ ] API routes updated for async processing
- [ ] Frontend updated with polling logic
- [ ] Redis server running
- [ ] Celery worker running
- [ ] Async analysis tested end-to-end
- [ ] Progress updates working correctly
- [ ] File cleanup after processing working

**Phase 3 Complete!** ✅  
You now have scalable async processing.

---

# Phase 4: Advanced Features

**Duration:** 3-4 days  
**Goal:** Add visualization, export, and enhanced user experience features

## Step 4.1: Add Chart.js for Visualization

### Update `templates/results.html` - Add to head:

```html
<!-- Chart.js -->
<script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.js"></script>
```

### Add emotion timeline chart:

```html
<!-- Add after transcript section -->
<div class="card mb-4">
    <div class="card-header">
        <h5 class="mb-0"><i class="fas fa-chart-line"></i> Emotion Timeline</h5>
    </div>
    <div class="card-body">
        <canvas id="emotionChart" height="80"></canvas>
    </div>
</div>
```

### Update results JavaScript:

```javascript
function displayResults(data) {
    // ... existing code ...
    
    // Create emotion timeline chart
    if (data.visual.emotions_breakdown) {
        createEmotionChart(data.visual.emotions_breakdown);
    }
}

function createEmotionChart(emotions) {
    const ctx = document.getElementById('emotionChart').getContext('2d');
    
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: Object.keys(emotions),
            datasets: [{
                label: 'Frequency',
                data: Object.values(emotions),
                backgroundColor: [
                    'rgba(255, 206, 86, 0.8)',  // happy
                    'rgba(54, 162, 235, 0.8)',  // neutral
                    'rgba(255, 99, 132, 0.8)',  // sad
                    'rgba(75, 192, 192, 0.8)',  // surprise
                    'rgba(153, 102, 255, 0.8)', // fear
                    'rgba(255, 159, 64, 0.8)'   // other
                ]
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: false
                },
                title: {
                    display: true,
                    text: 'Emotion Distribution Throughout Interview'
                }
            }
        }
    });
}
```

**Deliverable:** Visual charts for emotion distribution

---

## Step 4.2: Add PDF Export

### Install ReportLab:

```bash
pip install reportlab
pip freeze > requirements.txt
```

### Create `app/utils/pdf_generator.py`:

```python
"""PDF report generation"""
from reportlab.lib.pagesizes import letter, A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from io import BytesIO
from datetime import datetime

def generate_pdf_report(results_data, session_id):
    """
    Generate PDF report from analysis results
    
    Args:
        results_data: Analysis results dictionary
        session_id: Session identifier
        
    Returns:
        BytesIO: PDF file in memory
    """
    buffer = BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter)
    elements = []
    styles = getSampleStyleSheet()
    
    # Title
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=24,
        textColor=colors.HexColor('#667eea'),
        spaceAfter=30,
        alignment=TA_CENTER
    )
    title = Paragraph("AI Interview Assessment Report", title_style)
    elements.append(title)
    elements.append(Spacer(1, 0.2*inch))
    
    # Metadata
    meta_data = [
        ['Session ID:', session_id],
        ['Generated:', datetime.now().strftime('%Y-%m-%d %H:%M:%S')],
        ['Overall Score:', f"{results_data['final_score']}/100"],
        ['Grade:', results_data['grade']]
    ]
    
    meta_table = Table(meta_data, colWidths=[2*inch, 4*inch])
    meta_table.setStyle(TableStyle([
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 12),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 12),
    ]))
    elements.append(meta_table)
    elements.append(Spacer(1, 0.5*inch))
    
    # Component Scores
    section_style = ParagraphStyle(
        'SectionTitle',
        parent=styles['Heading2'],
        fontSize=16,
        textColor=colors.HexColor('#764ba2'),
        spaceAfter=12
    )
    
    # Visual Analysis
    elements.append(Paragraph("👁️ Visual Analysis", section_style))
    visual_data = [
        ['Score:', f"{results_data['visual']['final_score']}/100"],
        ['Eye Contact:', f"{results_data['visual']['eye_contact_percentage']}%"],
        ['Dominant Emotion:', results_data['visual']['dominant_emotion']],
        ['Feedback:', results_data['visual']['feedback']]
    ]
    visual_table = Table(visual_data, colWidths=[2*inch, 4*inch])
    visual_table.setStyle(TableStyle([
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
    ]))
    elements.append(visual_table)
    elements.append(Spacer(1, 0.3*inch))
    
    # Audio Analysis
    elements.append(Paragraph("🎤 Audio Analysis", section_style))
    audio_data = [
        ['Score:', f"{results_data['audio']['final_score']}/100"],
        ['Speaking Pace:', f"{results_data['audio']['wpm']} WPM"],
        ['Feedback:', results_data['audio']['feedback']],
        ['Transcript:', results_data['audio'].get('transcript', 'No transcript available')[:200] + '...']
    ]
    audio_table = Table(audio_data, colWidths=[2*inch, 4*inch])
    audio_table.setStyle(TableStyle([
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
    ]))
    elements.append(audio_table)
    elements.append(Spacer(1, 0.3*inch))
    
    # NLP Analysis
    elements.append(Paragraph("📝 Content Analysis", section_style))
    nlp_data = [
        ['Score:', f"{results_data['nlp']['final_score']}/100"],
        ['Keywords Found:', ', '.join(results_data['nlp'].get('matched_keywords', []))],
        ['Keywords Missing:', ', '.join(results_data['nlp'].get('missing_keywords', []))],
        ['Feedback:', results_data['nlp']['feedback']]
    ]
    nlp_table = Table(nlp_data, colWidths=[2*inch, 4*inch])
    nlp_table.setStyle(TableStyle([
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
    ]))
    elements.append(nlp_table)
    
    # Build PDF
    doc.build(elements)
    buffer.seek(0)
    return buffer
```

### Add PDF download endpoint to `app/routes/api.py`:

```python
from flask import send_file
from app.utils.pdf_generator import generate_pdf_report

@api_bp.route('/download/<session_id>', methods=['POST'])
def download_report(session_id):
    """Download PDF report"""
    try:
        # Get results from request body
        results = request.json
        
        # Generate PDF
        pdf_buffer = generate_pdf_report(results, session_id)
        
        return send_file(
            pdf_buffer,
            mimetype='application/pdf',
            as_attachment=True,
            download_name=f'interview_report_{session_id}.pdf'
        )
    except Exception as e:
        return jsonify({'error': str(e)}), 500
```

### Update `templates/results.html` button:

```html
<button class="btn btn-outline-success btn-lg" id="downloadPdfBtn">
    <i class="fas fa-file-pdf"></i> Download PDF Report
</button>

<script>
$('#downloadPdfBtn').on('click', function() {
    const sessionId = "{{ session_id }}";
    const resultsKey = `analysis_${sessionId}`;
    const data = JSON.parse(localStorage.getItem(resultsKey));
    
    $.ajax({
        url: `/api/download/${sessionId}`,
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(data),
        xhrFields: {
            responseType: 'blob'
        },
        success: function(blob) {
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `interview_report_${sessionId}.pdf`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
        }
    });
});
</script>
```

**Deliverable:** PDF export functionality

---

## Step 4.3: Add Email Report Feature

### Install email library:

```bash
pip install flask-mail
pip freeze > requirements.txt
```

### Update `config.py`:

```python
class Config:
    # ... existing config ...
    
    # Email settings
    MAIL_SERVER = os.environ.get('MAIL_SERVER', 'smtp.gmail.com')
    MAIL_PORT = int(os.environ.get('MAIL_PORT', 587))
    MAIL_USE_TLS = True
    MAIL_USERNAME = os.environ.get('MAIL_USERNAME')
    MAIL_PASSWORD = os.environ.get('MAIL_PASSWORD')
    MAIL_DEFAULT_SENDER = os.environ.get('MAIL_DEFAULT_SENDER')
```

### Create `app/utils/email_sender.py`:

```python
"""Email report functionality"""
from flask_mail import Mail, Message
from flask import current_app
import os

mail = Mail()

def send_report_email(recipient_email, results_data, session_id, pdf_buffer=None):
    """
    Send analysis report via email
    
    Args:
        recipient_email: Recipient email address
        results_data: Analysis results
        session_id: Session ID
        pdf_buffer: Optional PDF attachment
    """
    try:
        subject = f"Interview Assessment Report - {session_id}"
        
        body = f"""
        Dear Candidate,
        
        Your AI interview assessment has been completed. Here's a summary:
        
        Overall Score: {results_data['final_score']}/100
        Grade: {results_data['grade']}
        
        Visual Analysis: {results_data['visual']['final_score']}/100
        Audio Analysis: {results_data['audio']['final_score']}/100
        Content Analysis: {results_data['nlp']['final_score']}/100
        
        Detailed results are attached to this email.
        
        Best regards,
        AI Interview Assessment System
        """
        
        msg = Message(subject, recipients=[recipient_email], body=body)
        
        if pdf_buffer:
            msg.attach(
                f"interview_report_{session_id}.pdf",
                "application/pdf",
                pdf_buffer.getvalue()
            )
        
        mail.send(msg)
        return True
    except Exception as e:
        print(f"Error sending email: {e}")
        return False
```

**Deliverable:** Email report functionality (optional)

---

## Phase 4 Checklist

- [ ] Chart.js visualization added
- [ ] Emotion timeline chart working
- [ ] Score breakdown charts added
- [ ] PDF generation implemented
- [ ] PDF download working
- [ ] Email functionality added (optional)
- [ ] Export to JSON added (optional)
- [ ] Share results link added (optional)

**Phase 4 Complete!** ✅  
You now have advanced features and exports.

---

# Phase 5: Production Deployment

**Duration:** 2-3 days  
**Goal:** Prepare and deploy application to production

## Step 5.1: Create Dockerfile

```dockerfile
# Multi-stage build for smaller image size
FROM python:3.10-slim as base

# Install system dependencies
RUN apt-get update && apt-get install -y \
    ffmpeg \
    libsm6 \
    libxext6 \
    libxrender-dev \
    libgomp1 \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy requirements
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Download models
RUN python -c "import urllib.request; urllib.request.urlretrieve('https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task', 'face_landmarker.task')"

# Create upload directory
RUN mkdir -p static/uploads

# Expose port
EXPOSE 5000

# Start gunicorn
CMD ["gunicorn", "--bind", "0.0.0.0:5000", "--workers", "2", "--timeout", "600", "run:app"]
```

**Deliverable:** Production-ready Dockerfile

---

## Step 5.2: Create docker-compose.yml

```yaml
version: '3.8'

services:
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 5s
      timeout: 3s
      retries: 5

  web:
    build: .
    ports:
      - "5000:5000"
    environment:
      - FLASK_ENV=production
      - SECRET_KEY=${SECRET_KEY}
      - CELERY_BROKER_URL=redis://redis:6379/0
      - CELERY_RESULT_BACKEND=redis://redis:6379/0
    depends_on:
      redis:
        condition: service_healthy
    volumes:
      - ./static/uploads:/app/static/uploads
    restart: unless-stopped

  celery_worker:
    build: .
    command: celery -A celery_app.celery worker --loglevel=info --concurrency=2
    environment:
      - CELERY_BROKER_URL=redis://redis:6379/0
      - CELERY_RESULT_BACKEND=redis://redis:6379/0
    depends_on:
      - redis
    volumes:
      - ./static/uploads:/app/static/uploads
    restart: unless-stopped

volumes:
  redis_data:
```

**Deliverable:** Docker Compose configuration

---

## Step 5.3: Create Production Configuration

### Create `.env.production`

```bash
FLASK_ENV=production
SECRET_KEY=your-super-secret-production-key-here
CELERY_BROKER_URL=redis://redis:6379/0
CELERY_RESULT_BACKEND=redis://redis:6379/0

# Optional: Email configuration
MAIL_SERVER=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password
MAIL_DEFAULT_SENDER=noreply@yourapp.com
```

**Deliverable:** Production environment configuration

---

## Step 5.4: Add Logging

### Create `app/utils/logger.py`:

```python
"""Logging configuration"""
import logging
from logging.handlers import RotatingFileHandler
import os
from pathlib import Path

def setup_logging(app):
    """Configure application logging"""
    if not app.debug:
        # Create logs directory
        logs_dir = Path('logs')
        logs_dir.mkdir(exist_ok=True)
        
        # File handler
        file_handler = RotatingFileHandler(
            'logs/interview_app.log',
            maxBytes=10240000,  # 10MB
            backupCount=10
        )
        file_handler.setFormatter(logging.Formatter(
            '%(asctime)s %(levelname)s: %(message)s [in %(pathname)s:%(lineno)d]'
        ))
        file_handler.setLevel(logging.INFO)
        app.logger.addHandler(file_handler)
        
        app.logger.setLevel(logging.INFO)
        app.logger.info('Interview Assessment App startup')
```

### Update `app/__init__.py`:

```python
from app.utils.logger import setup_logging

def create_app(config_name='default'):
    app = Flask(__name__)
    # ... existing code ...
    
    # Setup logging
    setup_logging(app)
    
    return app
```

**Deliverable:** Production logging

---

## Step 5.5: Add Error Handling

### Create `app/routes/errors.py`:

```python
"""Error handlers"""
from flask import Blueprint, render_template, jsonify

errors_bp = Blueprint('errors', __name__)

@errors_bp.app_errorhandler(404)
def not_found_error(error):
    """Handle 404 errors"""
    if request.path.startswith('/api/'):
        return jsonify({'error': 'Resource not found'}), 404
    return render_template('errors/404.html'), 404

@errors_bp.app_errorhandler(500)
def internal_error(error):
    """Handle 500 errors"""
    if request.path.startswith('/api/'):
        return jsonify({'error': 'Internal server error'}), 500
    return render_template('errors/500.html'), 500

@errors_bp.app_errorhandler(413)
def request_entity_too_large(error):
    """Handle file too large errors"""
    return jsonify({'error': 'File size exceeds 500MB limit'}), 413
```

### Create error templates:

**`templates/errors/404.html`**
```html
{% extends "base.html" %}
{% block title %}404 - Page Not Found{% endblock %}
{% block content %}
<div class="text-center">
    <h1 class="display-1">404</h1>
    <p class="lead">Page not found</p>
    <a href="{{ url_for('main.index') }}" class="btn btn-primary">Go Home</a>
</div>
{% endblock %}
```

**Deliverable:** Error handling and pages

---

## Step 5.6: Security Enhancements

### Install security packages:

```bash
pip install flask-talisman flask-limiter
pip freeze > requirements.txt
```

### Update `app/__init__.py`:

```python
from flask_talisman import Talisman
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

def create_app(config_name='default'):
    app = Flask(__name__)
    app.config.from_object(config[config_name])
    
    # Security headers
    if not app.debug:
        Talisman(app, force_https=False)  # Set to True in production with HTTPS
    
    # Rate limiting
    limiter = Limiter(
        app=app,
        key_func=get_remote_address,
        default_limits=["200 per day", "50 per hour"]
    )
    
    # ... rest of configuration ...
```

### Add rate limits to API:

```python
@api_bp.route('/analyze', methods=['POST'])
@limiter.limit("10 per hour")  # Max 10 uploads per hour
def analyze_video():
    # ... existing code ...
```

**Deliverable:** Production security measures

---

## Step 5.7: Deployment Scripts

### Create `deploy.sh` for Linux:

```bash
#!/bin/bash

echo "🚀 Deploying AI Interview Assessment System"

# Pull latest code
git pull origin main

# Build and start containers
docker-compose down
docker-compose build
docker-compose up -d

# Check health
sleep 10
curl -f http://localhost:5000/api/health || exit 1

echo "✅ Deployment complete!"
```

### Create deployment documentation:

**`DEPLOYMENT.md`**
```markdown
# Deployment Guide

## Prerequisites
- Docker & Docker Compose installed
- Domain name (optional, for HTTPS)
- SSL certificate (for production)

## Steps

1. Clone repository
2. Copy `.env.production` to `.env`
3. Update environment variables
4. Run: `docker-compose up -d`
5. Access: http://your-domain.com:5000

## Cloud Platforms

### AWS EC2
- Use t3.xlarge or larger (4GB+ RAM)
- Open ports 5000, 6379
- Use ELB for load balancing

### Google Cloud Run
- Build container image
- Deploy with 4GB memory, 600s timeout
- Use Cloud Memorystore for Redis

### Heroku
- Use dyno with 4GB RAM
- Add Redis addon
- Use Celery worker dyno

## Monitoring
- Check logs: `docker-compose logs -f`
- Redis status: `docker exec redis redis-cli ping`
- Celery workers: `celery -A celery_app.celery inspect active`
```

**Deliverable:** Deployment scripts and documentation

---

## Phase 5 Checklist

- [ ] Dockerfile created
- [ ] docker-compose.yml created
- [ ] Production environment configured
- [ ] Logging implemented
- [ ] Error handling added
- [ ] Security measures implemented
- [ ] Rate limiting added
- [ ] Deployment scripts created
- [ ] Documentation completed
- [ ] Application tested in container
- [ ] Health checks working

**Phase 5 Complete!** ✅  
Your application is production-ready!

---

# Testing & Validation

## Test Checklist

### Unit Tests
- [ ] Visual analysis functions
- [ ] Audio analysis functions
- [ ] NLP analysis functions
- [ ] Scoring calculations

### Integration Tests
- [ ] Video upload
- [ ] Analysis pipeline
- [ ] Results retrieval
- [ ] PDF generation

### Load Testing
- [ ] Multiple concurrent uploads
- [ ] Large video files (500MB)
- [ ] Long videos (10+ minutes)
- [ ] Queue performance

### Security Testing
- [ ] File type validation
- [ ] Size limits enforcement
- [ ] Rate limiting
- [ ] CSRF protection

---

# Maintenance & Monitoring

## Regular Tasks

### Daily
- Check error logs
- Monitor disk space (uploads folder)
- Check Celery worker status

### Weekly
- Cleanup old upload files
- Review performance metrics
- Update dependencies (security patches)

### Monthly
- Database backup (if added)
- Performance optimization review
- User feedback analysis

---

# Conclusion

🎉 **Congratulations!** You now have a complete, production-ready web application for AI-powered interview assessment.

## What You've Built

✅ Flask REST API with video upload  
✅ Async processing with Celery + Redis  
✅ Beautiful responsive frontend  
✅ AI analysis (Visual, Audio, NLP)  
✅ PDF report generation  
✅ Docker containerization  
✅ Production deployment ready  

## Next Steps

1. **Launch MVP** - Deploy to cloud platform
2. **Gather Feedback** - Get user testing
3. **Iterate** - Add requested features
4. **Scale** - Add load balancing, CDN
5. **Monetize** - Add payment integration

## Support Resources

- Flask Documentation: https://flask.palletsprojects.com/
- Celery Documentation: https://docs.celeryproject.org/
- Docker Documentation: https://docs.docker.com/
- Chart.js Documentation: https://www.chartjs.org/

---

**Good luck with your AI Interview Assessment System!** 🚀

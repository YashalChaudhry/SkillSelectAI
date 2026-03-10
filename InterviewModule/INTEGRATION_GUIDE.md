# Integration Guide - AI Interview Assessment System

## Overview
This guide explains how to integrate the AI Interview Assessment system into your existing application as a module.

## Integration Options

### Option 1: Python Module Integration (Direct Import)
Use the analyzer directly as a Python module in your application.

```python
# In your application
from app.models.analyzer import InterviewAnalyzer

# Initialize analyzer
analyzer = InterviewAnalyzer()

# Analyze video
results = analyzer.analyze_video(
    video_path="path/to/video.mp4",
    keywords=["experience", "skills"],
    model_answer="Expected answer here"
)

# Use results
print(f"Final Score: {results['final_score']}")
print(f"Visual Score: {results['visual']['final_score']}")
print(f"Audio Score: {results['audio']['final_score']}")
print(f"NLP Score: {results['nlp']['final_score']}")
```

### Option 2: REST API Integration (Microservice)
Run this as a separate service and call via REST API.

```python
# In your application
import requests

# Upload and analyze video
with open('video.mp4', 'rb') as video_file:
    files = {'video': video_file}
    data = {
        'keywords': 'experience,skills,project',
        'model_answer': 'Expected answer'
    }
    
    # Submit for analysis
    response = requests.post('http://localhost:5000/api/analyze', 
                            files=files, data=data)
    task_data = response.json()
    task_id = task_data['task_id']
    
    # Poll for results
    import time
    while True:
        status_response = requests.get(f'http://localhost:5000/api/status/{task_id}')
        status_data = status_response.json()
        
        if status_data['state'] == 'SUCCESS':
            results = status_data['result']
            break
        elif status_data['state'] == 'FAILURE':
            print("Analysis failed")
            break
        
        time.sleep(2)
    
    # Use results
    print(f"Final Score: {results['final_score']}")
```

### Option 3: Celery Task Integration (Same Infrastructure)
Share Redis/Celery infrastructure with your existing app.

```python
# In your application's celery config
from celery import Celery

app = Celery('your_app')
app.config_from_object('your_config')

# Import the analysis task
from app.tasks import analyze_video_async

# Use in your code
task = analyze_video_async.delay(
    video_path="path/to/video.mp4",
    keywords=["experience", "skills"],
    model_answer="Expected answer"
)

# Get results
results = task.get(timeout=300)
```

## Installation as Package

### 1. Install as Dependency

```bash
# Add to your requirements.txt
git+https://github.com/yourusername/ai-interview-assessment.git

# Or install locally
pip install -e /path/to/project
```

### 2. Create Package Structure

The project is already structured as a package:
```
app/
├── __init__.py          # Package initialization
├── models/
│   └── analyzer.py      # Core analyzer (can be imported)
├── tasks.py             # Celery tasks
├── routes/              # Flask routes (optional if using as API)
└── utils/               # Utilities
```

### 3. Import in Your Application

```python
# Import the analyzer
from app.models.analyzer import InterviewAnalyzer

# Or import Celery tasks
from app.tasks import analyze_video_async

# Or import Flask blueprint
from app.routes.api import bp as api_blueprint
your_flask_app.register_blueprint(api_blueprint, url_prefix='/interview-api')
```

## Configuration

### Share Environment Variables

```python
# In your application's config
INTERVIEW_ANALYZER_CONFIG = {
    'CELERY_BROKER_URL': 'redis://localhost:6379/0',
    'CELERY_RESULT_BACKEND': 'redis://localhost:6379/0',
    'UPLOAD_FOLDER': 'path/to/uploads',
}
```

### Use Same Redis Instance

```python
# config.py in your app
import os

class Config:
    # Your existing config
    DATABASE_URL = os.getenv('DATABASE_URL')
    SECRET_KEY = os.getenv('SECRET_KEY')
    
    # Interview analyzer config (same Redis)
    CELERY_BROKER_URL = os.getenv('CELERY_BROKER_URL', 'redis://localhost:6379/0')
    CELERY_RESULT_BACKEND = os.getenv('CELERY_RESULT_BACKEND', 'redis://localhost:6379/0')
```

## Example Integrations

### Django Integration

```python
# In your Django app
from app.models.analyzer import InterviewAnalyzer

class InterviewAnalysisView(View):
    def post(self, request):
        video_file = request.FILES['video']
        
        # Save video temporarily
        video_path = f'/tmp/{video_file.name}'
        with open(video_path, 'wb+') as destination:
            for chunk in video_file.chunks():
                destination.write(chunk)
        
        # Analyze
        analyzer = InterviewAnalyzer()
        results = analyzer.analyze_video(video_path)
        
        # Save to database
        InterviewResult.objects.create(
            user=request.user,
            video_path=video_path,
            final_score=results['final_score'],
            visual_score=results['visual']['final_score'],
            audio_score=results['audio']['final_score'],
            nlp_score=results['nlp']['final_score'],
            results_json=results
        )
        
        return JsonResponse(results)
```

### FastAPI Integration

```python
# In your FastAPI app
from fastapi import FastAPI, UploadFile, BackgroundTasks
from app.models.analyzer import InterviewAnalyzer

app = FastAPI()
analyzer = InterviewAnalyzer()

@app.post("/analyze-interview")
async def analyze_interview(
    video: UploadFile,
    background_tasks: BackgroundTasks
):
    # Save video
    video_path = f"uploads/{video.filename}"
    with open(video_path, "wb") as buffer:
        content = await video.read()
        buffer.write(content)
    
    # Analyze in background
    background_tasks.add_task(
        process_video,
        video_path=video_path
    )
    
    return {"status": "processing", "video_path": video_path}

def process_video(video_path: str):
    results = analyzer.analyze_video(video_path)
    # Save results to database
    save_results_to_db(results)
```

### Streamlit Integration

```python
# streamlit_app.py
import streamlit as st
from app.models.analyzer import InterviewAnalyzer

st.title("🎯 Interview Analysis")

uploaded_file = st.file_uploader("Upload Interview Video", type=['mp4', 'avi', 'mov'])

if uploaded_file:
    # Save video
    video_path = f"temp/{uploaded_file.name}"
    with open(video_path, "wb") as f:
        f.write(uploaded_file.read())
    
    # Analyze
    with st.spinner("Analyzing interview..."):
        analyzer = InterviewAnalyzer()
        results = analyzer.analyze_video(video_path)
    
    # Display results
    col1, col2, col3 = st.columns(3)
    col1.metric("Visual Score", f"{results['visual']['final_score']}/100")
    col2.metric("Audio Score", f"{results['audio']['final_score']}/100")
    col3.metric("NLP Score", f"{results['nlp']['final_score']}/100")
    
    st.metric("Final Score", f"{results['final_score']}/100", 
              delta=results['grade'])
```

## Docker Integration

```dockerfile
# Dockerfile for microservice deployment
FROM python:3.10-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .

EXPOSE 5000

CMD ["gunicorn", "-b", "0.0.0.0:5000", "run:app"]
```

```yaml
# docker-compose.yml - Add to your existing compose file
services:
  interview-analyzer:
    build: ./interview-assessment
    ports:
      - "5001:5000"
    environment:
      - CELERY_BROKER_URL=redis://redis:6379/0
      - CELERY_RESULT_BACKEND=redis://redis:6379/0
    depends_on:
      - redis
  
  interview-celery:
    build: ./interview-assessment
    command: celery -A celery_app worker --loglevel=info
    environment:
      - CELERY_BROKER_URL=redis://redis:6379/0
      - CELERY_RESULT_BACKEND=redis://redis:6379/0
    depends_on:
      - redis
```

## Best Practices

### 1. Lazy Loading (Already Implemented)
The analyzer uses lazy loading for models to reduce memory usage:
```python
# Models are loaded only when needed
if self.face_landmarker is None:
    self._load_models()
```

### 2. Error Handling
Always wrap analyzer calls in try-except:
```python
try:
    results = analyzer.analyze_video(video_path)
except Exception as e:
    logger.error(f"Analysis failed: {e}")
    # Handle error appropriately
```

### 3. Resource Cleanup
The analyzer automatically cleans up temporary files:
```python
# Video file is deleted after analysis (in Celery task)
if os.path.exists(video_path):
    os.remove(video_path)
```

### 4. Async Processing
Use Celery for long-running tasks:
```python
# Non-blocking analysis
task = analyze_video_async.delay(video_path)
task_id = task.id
# Return task_id to client immediately
```

## API Endpoints Reference

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/analyze` | POST | Submit video for analysis (returns task_id) |
| `/api/status/<task_id>` | GET | Check analysis status |
| `/api/health` | GET | Check service health |
| `/` | GET | Web interface (optional) |
| `/results/<session_id>` | GET | View results page |

## Environment Variables

```bash
# Required
CELERY_BROKER_URL=redis://localhost:6379/0
CELERY_RESULT_BACKEND=redis://localhost:6379/0

# Optional
UPLOAD_FOLDER=./static/uploads
MAX_CONTENT_LENGTH=524288000  # 500MB
FLASK_ENV=production
SECRET_KEY=your-secret-key
```

## Troubleshooting

### Issue: Models not found
**Solution**: Ensure `face_landmarker.task` is in the project root

### Issue: CUDA out of memory
**Solution**: Use CPU mode or reduce batch size:
```python
os.environ['CUDA_VISIBLE_DEVICES'] = '-1'  # Force CPU
```

### Issue: Celery tasks not found
**Solution**: Ensure `include=['app.tasks']` in celery_app.py

### Issue: Redis connection failed
**Solution**: Check Redis is running:
```bash
redis-cli ping  # Should return PONG
```

## Support

For issues or questions about integration:
1. Check logs: `logs/app.log`
2. Test health endpoint: `curl http://localhost:5000/api/health`
3. Verify Celery worker: Check terminal output

## License

MIT License - See LICENSE file for details

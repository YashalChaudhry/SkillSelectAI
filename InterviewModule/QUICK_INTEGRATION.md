# Quick Integration Examples

## 1. Simple Python Import (Easiest)

```python
# Add project to Python path
import sys
sys.path.append('/path/to/project')

from app.models.analyzer import InterviewAnalyzer

# Use it
analyzer = InterviewAnalyzer()
results = analyzer.analyze_video("video.mp4")
print(f"Score: {results['final_score']}/100")
```

## 2. Install as Package

```bash
# In your project directory
pip install -e /path/to/project

# Or from git
pip install git+https://github.com/yourusername/ai-interview-assessment.git
```

Then in your code:
```python
from app.models.analyzer import InterviewAnalyzer

analyzer = InterviewAnalyzer()
results = analyzer.analyze_video("video.mp4")
```

## 3. REST API Call (No Installation Needed)

```python
import requests

# Start the Flask server (in project directory)
# python run.py

# In your application
url = "http://localhost:5000/api/analyze"
files = {'video': open('video.mp4', 'rb')}
data = {'keywords': 'experience,skills', 'model_answer': ''}

response = requests.post(url, files=files, data=data)
task_id = response.json()['task_id']

# Poll for results
import time
while True:
    status = requests.get(f"http://localhost:5000/api/status/{task_id}").json()
    if status['state'] == 'SUCCESS':
        results = status['result']
        break
    time.sleep(2)

print(f"Score: {results['final_score']}/100")
```

## 4. Command Line Usage

```bash
# Install package
pip install -e /path/to/project

# Analyze video from command line
interview-analyzer video.mp4 -k "experience,skills" -o results.json -v
```

## 5. Django View Integration

```python
# views.py in your Django app
from app.models.analyzer import InterviewAnalyzer

def analyze_interview(request):
    if request.method == 'POST':
        video = request.FILES['video']
        
        # Save temporarily
        import tempfile
        with tempfile.NamedTemporaryFile(delete=False, suffix='.mp4') as tmp:
            for chunk in video.chunks():
                tmp.write(chunk)
            video_path = tmp.name
        
        # Analyze
        analyzer = InterviewAnalyzer()
        results = analyzer.analyze_video(video_path)
        
        # Clean up
        import os
        os.remove(video_path)
        
        return JsonResponse(results)
```

## 6. FastAPI Integration

```python
# main.py in your FastAPI app
from fastapi import FastAPI, UploadFile, File
from app.models.analyzer import InterviewAnalyzer
import tempfile
import os

app = FastAPI()
analyzer = InterviewAnalyzer()

@app.post("/analyze")
async def analyze_video(video: UploadFile = File(...)):
    # Save video
    with tempfile.NamedTemporaryFile(delete=False, suffix='.mp4') as tmp:
        content = await video.read()
        tmp.write(content)
        video_path = tmp.name
    
    # Analyze
    try:
        results = analyzer.analyze_video(video_path)
        return results
    finally:
        os.remove(video_path)
```

## 7. Flask Blueprint Integration

```python
# In your existing Flask app
from flask import Flask
from app.routes.api import bp as interview_bp

app = Flask(__name__)

# Register the interview analyzer blueprint
app.register_blueprint(interview_bp, url_prefix='/interview')

# Now available at:
# POST /interview/api/analyze
# GET /interview/api/status/<task_id>
```

## 8. Celery Task Integration (Shared Worker)

```python
# In your app's celery.py
from celery import Celery

app = Celery('your_app')

# Import interview tasks
from app.tasks import analyze_video_async

# Use in your code
@app.task
def process_job_application(application_id):
    # Your logic
    video_path = get_video_path(application_id)
    
    # Trigger interview analysis
    analysis_task = analyze_video_async.delay(video_path)
    
    # Wait for result or save task_id
    results = analysis_task.get(timeout=300)
    
    # Continue your workflow
    save_results(application_id, results)
```

## 9. Microservice (Docker)

```yaml
# Add to your docker-compose.yml
services:
  interview-api:
    build: ./ai-interview-assessment
    ports:
      - "5001:5000"
    environment:
      - CELERY_BROKER_URL=redis://redis:6379/1
    networks:
      - your-network
```

Then call from any service:
```python
import requests
response = requests.post('http://interview-api:5000/api/analyze', ...)
```

## 10. Subprocess Call

```python
# If you don't want to import anything
import subprocess
import json

result = subprocess.run([
    'interview-analyzer',
    'video.mp4',
    '-k', 'experience,skills',
    '-o', 'output.json'
], capture_output=True, text=True)

with open('output.json') as f:
    results = json.load(f)

print(f"Score: {results['final_score']}/100")
```

## Which Method to Choose?

| Method | Use When | Pros | Cons |
|--------|----------|------|------|
| **Python Import** | Same language, same server | Fast, direct access | Tight coupling |
| **REST API** | Different language/server | Loose coupling, scalable | Network overhead |
| **CLI** | Batch processing, scripts | Simple, no coding | Less flexible |
| **Blueprint** | Existing Flask app | Easy integration | Same process |
| **Celery Task** | Already using Celery | Async, scalable | Complex setup |
| **Microservice** | Production, multiple apps | Isolated, scalable | More infrastructure |

## Minimal Example (5 Lines)

```python
import sys; sys.path.append('/path/to/project')
from app.models.analyzer import InterviewAnalyzer
analyzer = InterviewAnalyzer()
results = analyzer.analyze_video("video.mp4")
print(f"Score: {results['final_score']}, Grade: {results['grade']}")
```

## Need Help?

- Full docs: See `INTEGRATION_GUIDE.md`
- API reference: Start server and visit `/api/health`
- Examples: Check `interview_pipeline.ipynb`

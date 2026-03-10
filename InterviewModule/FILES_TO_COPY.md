# Files to Copy for Module Integration

## Essential Files (Copy these to your other project)

### 1️⃣ Core Module Files
```
app/
├── __init__.py                    # Package initialization
├── models/
│   ├── __init__.py               # Models package
│   └── analyzer.py               # ⭐ MAIN ANALYZER (core logic)
└── utils/
    └── __init__.py               # Utils package (if exists)
```

### 2️⃣ AI Model File
```
face_landmarker.task              # ⭐ REQUIRED - MediaPipe model (95MB)
```

### 3️⃣ Dependencies File
```
requirements.txt                   # Python packages needed
```

### 4️⃣ Optional: Async Processing (if using Celery)
```
celery_app.py                     # Celery configuration
app/tasks.py                      # Async tasks
```

---

## Minimum Setup (Just 3 Files!)

If you only want the **core functionality** without web interface:

### Copy These 3 Things:
1. **`app/models/analyzer.py`** - The main analyzer class
2. **`face_landmarker.task`** - AI model file
3. **`requirements.txt`** - Install dependencies

### File Structure in Your Project:
```
your_project/
├── your_existing_files.py
├── interview_module/              # Create this folder
│   ├── analyzer.py               # Copy from app/models/analyzer.py
│   └── face_landmarker.task      # Copy from root
└── requirements.txt              # Merge with yours
```

### Then Use It:
```python
# In your application
from interview_module.analyzer import InterviewAnalyzer

analyzer = InterviewAnalyzer()
results = analyzer.analyze_video("video.mp4")
```

---

## Full Integration (All Features)

### Copy Entire Structure:
```
your_project/
├── app/                          # ⭐ Copy entire app folder
│   ├── __init__.py
│   ├── models/
│   │   ├── __init__.py
│   │   └── analyzer.py          # Core analyzer
│   ├── tasks.py                 # Celery tasks (optional)
│   ├── routes/                  # API routes (optional)
│   │   ├── __init__.py
│   │   ├── api.py              # REST API
│   │   └── main.py             # Web pages
│   └── utils/
│       └── __init__.py
│
├── face_landmarker.task         # ⭐ AI model file
├── celery_app.py                # Celery config (if using async)
├── config.py                    # Configuration
├── requirements.txt             # Dependencies
└── .env                         # Environment variables
```

---

## Required Python Packages

Install these in your project:
```bash
pip install tensorflow==2.15.0
pip install mediapipe==0.10.11
pip install openai-whisper==20231117
pip install sentence-transformers==2.2.2
pip install opencv-python==4.9.0.80
pip install pydub==0.25.1
```

Or just:
```bash
pip install -r requirements.txt
```

---

## Quick Copy Commands

### Windows PowerShell:
```powershell
# Copy minimum files
Copy-Item "app\models\analyzer.py" -Destination "C:\your_project\interview_module\analyzer.py"
Copy-Item "face_landmarker.task" -Destination "C:\your_project\interview_module\face_landmarker.task"

# Copy full module
Copy-Item "app" -Destination "C:\your_project\app" -Recurse
Copy-Item "face_landmarker.task" -Destination "C:\your_project\"
Copy-Item "celery_app.py" -Destination "C:\your_project\"
```

### Linux/Mac:
```bash
# Copy minimum files
cp app/models/analyzer.py /path/to/your_project/interview_module/analyzer.py
cp face_landmarker.task /path/to/your_project/interview_module/face_landmarker.task

# Copy full module
cp -r app /path/to/your_project/
cp face_landmarker.task /path/to/your_project/
cp celery_app.py /path/to/your_project/
```

---

## File Sizes (What to Expect)

| File | Size | Required? |
|------|------|-----------|
| `face_landmarker.task` | ~95 MB | ✅ Yes |
| `app/models/analyzer.py` | ~15 KB | ✅ Yes |
| `app/tasks.py` | ~3 KB | 🔶 For async only |
| `celery_app.py` | ~1 KB | 🔶 For async only |
| `app/routes/*` | ~10 KB | ❌ For web UI only |
| `templates/*` | ~15 KB | ❌ For web UI only |
| `static/*` | ~20 KB | ❌ For web UI only |

---

## Important Notes

### 1. Model File Path
The analyzer looks for `face_landmarker.task` in the project root. If you move it, update the path in `analyzer.py`:

```python
# In analyzer.py, line ~30
model_path = os.path.join(os.path.dirname(__file__), "face_landmarker.task")
```

Change to:
```python
model_path = "path/to/your/face_landmarker.task"
```

### 2. Environment Variables (Optional)
Create `.env` file if using async features:
```env
CELERY_BROKER_URL=redis://localhost:6379/0
CELERY_RESULT_BACKEND=redis://localhost:6379/0
```

### 3. Dependencies
Some packages are large (TensorFlow ~500MB). Install in virtual environment:
```bash
python -m venv venv
venv\Scripts\activate  # Windows
source venv/bin/activate  # Linux/Mac
pip install -r requirements.txt
```

---

## Test Your Integration

After copying files, test with:

```python
# test_integration.py
from app.models.analyzer import InterviewAnalyzer

analyzer = InterviewAnalyzer()
print("✅ Analyzer loaded successfully!")

# Test with a video
results = analyzer.analyze_video("test_video.mp4")
print(f"✅ Analysis complete! Score: {results['final_score']}/100")
```

---

## What Each File Does

| File | Purpose |
|------|---------|
| `analyzer.py` | Main logic - analyzes videos (visual, audio, NLP) |
| `face_landmarker.task` | AI model for face detection & eye tracking |
| `tasks.py` | Async processing with Celery (optional) |
| `celery_app.py` | Celery configuration (optional) |
| `routes/api.py` | REST API endpoints (optional) |
| `routes/main.py` | Web interface routes (optional) |

---

## Support

If files are missing or errors occur:
1. Check `face_landmarker.task` exists and is ~95MB
2. Verify all dependencies installed: `pip list`
3. Test import: `python -c "from app.models.analyzer import InterviewAnalyzer"`

**Need help?** Check `INTEGRATION_GUIDE.md` for detailed examples.

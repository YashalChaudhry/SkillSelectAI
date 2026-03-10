# 🚀 Quick Start - Phase 3 Async Processing

## Installation (One-Time Setup)

### 1. Install Redis
```powershell
# Windows - Using Winget
winget install Redis.Redis

# Or using Memurai
winget install Memurai.Memurai-Developer
```

### 2. Verify Installation
```powershell
redis-cli ping
# Should return: PONG
```

---

## Running the Application (Every Time)

### Three Terminal Windows Needed:

#### Terminal 1: Redis Server
```powershell
redis-server
```
**Leave this running**

---

#### Terminal 2: Celery Worker
```powershell
cd "c:\Users\RAMISH TAHIR\Downloads\project"
.\start_celery.bat
```
**Leave this running**

You should see:
```
[INFO] Connected to redis://localhost:6379/0
[INFO] celery@DESKTOP ready.
```

---

#### Terminal 3: Flask App
```powershell
cd "c:\Users\RAMISH TAHIR\Downloads\project"
python run.py
```
**Leave this running**

You should see:
```
🚀 AI INTERVIEW ASSESSMENT API SERVER
URL: http://127.0.0.1:5000
```

---

## Access Application

Open browser: **http://127.0.0.1:5000**

---

## Testing

### 1. Check Health
```powershell
Invoke-WebRequest -Uri "http://127.0.0.1:5000/api/health" -UseBasicParsing | Select-Object -ExpandProperty Content
```

Should show:
```json
{
  "status": "healthy",
  "celery": "connected"
}
```

### 2. Upload Test Video
1. Go to http://127.0.0.1:5000
2. Click "Choose File"
3. Select `video/interview1.mp4`
4. Add keywords: `experience, skills, project, team`
5. Click "Analyze Interview"
6. **Watch real-time progress updates** ⚡
7. View results when complete

---

## What's Different?

### ❌ Before (Phase 1-2)
- Upload → Wait 2-3 minutes → Results
- Browser frozen during analysis
- No progress updates

### ✅ Now (Phase 3)
- Upload → Instant response
- Real-time progress: "Analyzing video frames... 45%"
- Browser stays responsive
- Can submit multiple videos

---

## Troubleshooting

### Redis Connection Error
```
Error: [Errno 111] Connection refused
```
**Fix:** Start Redis server first
```powershell
redis-server
```

---

### Celery Worker Not Processing
```
Task stays at "PENDING"
```
**Fix:** Restart Celery worker
```powershell
Ctrl+C in Terminal 2
.\start_celery.bat
```

---

### No Progress Updates
**Check:** Browser console (F12) for errors  
**Check:** Celery worker terminal for logs  
**Fix:** Refresh page and try again

---

## Monitoring

### Check Active Tasks
```powershell
cd "c:\Users\RAMISH TAHIR\Downloads\project"
.\venv310\Scripts\activate
celery -A celery_app.celery inspect active
```

### Check Task History
```powershell
celery -A celery_app.celery inspect stats
```

### View Celery Logs
Look at Terminal 2 output - shows all task activity

---

## Stopping Services

### Stop Order:
1. **Flask** (Terminal 3): `Ctrl+C`
2. **Celery** (Terminal 2): `Ctrl+C`
3. **Redis** (Terminal 1): `Ctrl+C`

---

## Quick Commands Reference

```powershell
# Check Redis
redis-cli ping

# Check Celery workers
celery -A celery_app.celery inspect active

# Check API health
Invoke-WebRequest -Uri "http://127.0.0.1:5000/api/health" -UseBasicParsing

# View Celery registered tasks
celery -A celery_app.celery inspect registered
```

---

## Architecture at a Glance

```
User → Flask (instant response with task_id)
         ↓
       Redis (queue)
         ↓
     Celery Worker (background processing)
         ↓
       Redis (results)
         ↓
User polls Flask → Gets progress/results
```

---

## Next Phase

Once everything is working, proceed to:
**Phase 4: Advanced Features**
- Chart.js visualizations
- PDF report generation
- Email reports
- Advanced analytics

---

**Need help?** Check:
- PHASE3_SETUP.md (detailed instructions)
- PHASE3_COMPLETE.md (full documentation)
- PROGRESS.md (project status)

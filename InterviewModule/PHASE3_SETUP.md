# 🚀 Phase 3 Setup Instructions

## Redis Server Installation

Phase 3 requires Redis server for async task processing with Celery.

### Windows Installation

#### Option 1: Using Winget (Recommended)
```powershell
winget install Redis.Redis
```

#### Option 2: Manual Download
1. Download Redis from: https://github.com/microsoftarchive/redis/releases
2. Extract to `C:\Program Files\Redis`
3. Add to PATH: `C:\Program Files\Redis`

#### Option 3: Using Memurai (Redis-compatible)
```powershell
winget install Memurai.Memurai-Developer
```

### Linux Installation

```bash
# Ubuntu/Debian
sudo apt-get update
sudo apt-get install redis-server

# Start Redis
sudo systemctl start redis-server
sudo systemctl enable redis-server
```

### macOS Installation

```bash
brew install redis

# Start Redis
brew services start redis
```

## Starting the Application

### Step 1: Start Redis Server

**Windows:**
```powershell
# If installed via Winget
redis-server

# Or if using Memurai
memurai
```

**Linux/Mac:**
```bash
redis-server
```

### Step 2: Start Celery Worker

Open a new terminal:

```powershell
cd "c:\Users\RAMISH TAHIR\Downloads\project"
.\start_celery.bat
```

You should see:
```
[INFO] Connected to redis://localhost:6379/0
[INFO] Registered tasks:
    app.tasks.analyze_video_async
[INFO] celery@hostname ready.
```

### Step 3: Start Flask Application

Open another terminal:

```powershell
cd "c:\Users\RAMISH TAHIR\Downloads\project"
python run.py
```

### Step 4: Access Application

Open browser: http://127.0.0.1:5000

## Verifying Installation

### Check Redis Connection
```powershell
redis-cli ping
# Should return: PONG
```

### Check Celery Workers
```powershell
cd "c:\Users\RAMISH TAHIR\Downloads\project"
.\venv310\Scripts\activate
celery -A celery_app.celery inspect active
```

### Check API Health
```powershell
curl http://127.0.0.1:5000/api/health
```

Should return:
```json
{
  "status": "healthy",
  "celery": "connected",
  "service": "AI Interview Assessment API"
}
```

## Troubleshooting

### Redis Connection Failed
- Check if Redis is running: `redis-cli ping`
- Check port 6379 is available: `netstat -an | findstr 6379`
- Restart Redis server

### Celery Worker Not Starting
- Ensure virtual environment is activated
- Check Redis connection
- Try: `celery -A celery_app.celery worker --loglevel=debug --pool=solo`

### Tasks Not Processing
- Check Celery worker logs
- Verify task registration: `celery -A celery_app.celery inspect registered`
- Check Redis queue: `redis-cli LLEN celery`

## Architecture Overview

```
User → Flask (Web Server) → Redis (Message Broker) → Celery Worker → AI Models
                              ↓                            ↓
                           Task Queue                  Analysis
                              ↓                            ↓
User ← Results ← localStorage ← Flask ← Redis ← Task Complete
```

## Benefits of Async Processing

✅ Non-blocking video uploads  
✅ Real-time progress updates  
✅ Scalable (add more workers)  
✅ Fault tolerant  
✅ Automatic file cleanup  
✅ Better user experience  

## Next Phase

Once all services are running, you're ready for:
- Phase 4: Advanced Features (visualizations, PDF export)
- Phase 5: Production Deployment (Docker, monitoring)

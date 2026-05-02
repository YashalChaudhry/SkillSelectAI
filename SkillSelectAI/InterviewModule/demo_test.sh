#!/bin/bash
# Test script to show complete analysis pipeline

VIDEO="/Users/yashal/Desktop/SkillSelectAI/backend/uploads/interview-videos/interview-1772136310973-400387093.webm"

echo "🎬 TESTING COMPLETE ANALYSIS PIPELINE"
echo "========================================"
echo "Video: $(basename $VIDEO) ($(ls -lh "$VIDEO" | awk '{print $5}'))"
echo ""

echo "1. Health Check..."
HEALTH=$(curl -s http://localhost:5001/api/health)
echo "   Flask: $(echo "$HEALTH" | python3 -c "import sys,json; print(json.load(sys.stdin).get('status',''))" 2>/dev/null)"
echo "   Celery: $(echo "$HEALTH" | python3 -c "import sys,json; print(json.load(sys.stdin).get('celery',''))" 2>/dev/null)"
echo ""

echo "2. Submitting Analysis Request..."
RESPONSE=$(curl -s -X POST http://localhost:5001/api/analyze \
  -F "video=@${VIDEO};filename=test.webm" \
  -F "question=Describe your experience with full-stack development and the technologies you've worked with" \
  -F "question_type=technical" \
  -F "expected_points=Frontend frameworks,Backend technologies,Database experience,API development")

echo "   Response:"
echo "$RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$RESPONSE"

TASK_ID=$(echo "$RESPONSE" | python3 -c "import sys,json; print(json.load(sys.stdin).get('task_id',''))" 2>/dev/null)

if [ -z "$TASK_ID" ]; then
    echo "❌ Failed to get task ID"
    exit 1
fi

echo ""
echo "3. Monitoring Analysis Progress..."
echo "   Task ID: $TASK_ID"
echo ""

for i in $(seq 1 20); do
    sleep 5
    STATUS=$(curl -s "http://localhost:5001/api/status/${TASK_ID}")
    STATE=$(echo "$STATUS" | python3 -c "import sys,json; print(json.load(sys.stdin).get('state',''))" 2>/dev/null)
    
    echo "   [Step $i] State: $STATE"
    
    if [ "$STATE" = "PROGRESS" ]; then
        PROGRESS_MSG=$(echo "$STATUS" | python3 -c "import sys,json; print(json.load(sys.stdin).get('status',''))" 2>/dev/null)
        echo "             Progress: $PROGRESS_MSG"
    elif [ "$STATE" = "SUCCESS" ]; then
        echo ""
        echo "✅ ANALYSIS COMPLETE!"
        echo "====================="
        
        # Extract key results
        SCORE=$(echo "$STATUS" | python3 -c "import sys,json; result=json.load(sys.stdin).get('result',{}); print(result.get('score',0))" 2>/dev/null)
        GRADE=$(echo "$STATUS" | python3 -c "import sys,json; result=json.load(sys.stdin).get('result',{}); print(result.get('grade',''))" 2>/dev/null)
        TRANSCRIPT=$(echo "$STATUS" | python3 -c "import sys,json; result=json.load(sys.stdin).get('result',{}); print(result.get('transcript','')[:100])" 2>/dev/null)
        
        echo "Score: $SCORE/100"
        echo "Grade: $GRADE"
        echo "Transcript Sample: $TRANSCRIPT..."
        echo ""
        echo "Full Analysis Results:"
        echo "$STATUS" | python3 -m json.tool
        exit 0
    elif [ "$STATE" = "FAILURE" ]; then
        echo ""
        echo "❌ ANALYSIS FAILED"
        echo "$STATUS" | python3 -m json.tool
        exit 1
    fi
done

echo "⏰ Timeout - analysis took longer than 100 seconds"
exit 1
#!/bin/bash
# Test the analysis pipeline

VIDEO="/Users/yashal/Desktop/SkillSelectAI/backend/uploads/interview-videos/interview-1772135543177-359206256.webm"

# First check health
echo "=== Health Check ==="
HEALTH=$(curl -s http://127.0.0.1:5001/api/health)
echo "$HEALTH"

echo ""
echo "=== Submitting analysis ==="
RESPONSE=$(curl -s -X POST http://127.0.0.1:5001/api/analyze \
  -F "video=@${VIDEO};filename=test.webm" \
  -F "question=Tell me about your experience with JavaScript and React" \
  -F "question_type=technical" \
  -F "expected_points=JavaScript proficiency,React experience,State management,Component lifecycle")

echo "$RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$RESPONSE"

TASK_ID=$(echo "$RESPONSE" | python3 -c "import sys,json; print(json.load(sys.stdin).get('task_id',''))" 2>/dev/null)

if [ -z "$TASK_ID" ]; then
    echo "ERROR: No task_id received!"
    exit 1
fi

echo ""
echo "=== Task ID: $TASK_ID ==="
echo "=== Polling for results... ==="

for i in $(seq 1 40); do
    sleep 5
    STATUS=$(curl -s "http://127.0.0.1:5001/api/status/${TASK_ID}")
    STATE=$(echo "$STATUS" | python3 -c "import sys,json; print(json.load(sys.stdin).get('state',''))" 2>/dev/null)
    echo "[Poll $i] State: $STATE"
    
    if [ "$STATE" = "SUCCESS" ]; then
        echo ""
        echo "=== ANALYSIS COMPLETE ==="
        echo "$STATUS" | python3 -m json.tool
        exit 0
    elif [ "$STATE" = "FAILURE" ]; then
        echo ""
        echo "=== ANALYSIS FAILED ==="
        echo "$STATUS" | python3 -m json.tool
        exit 1
    elif [ "$STATE" = "PROGRESS" ]; then
        PROGRESS_STATUS=$(echo "$STATUS" | python3 -c "import sys,json; print(json.load(sys.stdin).get('status',''))" 2>/dev/null)
        echo "  Progress: $PROGRESS_STATUS"
    fi
done

echo "TIMEOUT: Task did not complete in 200 seconds"
exit 1

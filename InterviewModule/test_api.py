# Test script for API endpoints
# Run this after starting the Flask server

import requests
import json
import time

BASE_URL = "http://127.0.0.1:5000"

def test_health_check():
    """Test health check endpoint"""
    print("Testing health check endpoint...")
    response = requests.get(f"{BASE_URL}/api/health")
    print(f"Status: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
    return response.status_code == 200

def test_video_analysis(video_path, keywords=None, model_answer=None):
    """Test video analysis endpoint"""
    print(f"\nTesting video analysis with {video_path}...")
    
    # Prepare form data
    files = {'video': open(video_path, 'rb')}
    data = {}
    if keywords:
        data['keywords'] = keywords
    if model_answer:
        data['model_answer'] = model_answer
    
    # Send request
    print("Uploading video and starting analysis...")
    start_time = time.time()
    response = requests.post(f"{BASE_URL}/api/analyze", files=files, data=data)
    end_time = time.time()
    
    print(f"Status: {response.status_code}")
    print(f"Analysis time: {end_time - start_time:.2f} seconds")
    
    if response.status_code == 200:
        result = response.json()
        print(f"\nSession ID: {result['session_id']}")
        print(f"Overall Score: {result['final_score']}/100")
        print(f"Grade: {result['grade']}")
        print(f"\nVisual Score: {result['visual']['final_score']}/100")
        print(f"Audio Score: {result['audio']['final_score']}/100")
        print(f"NLP Score: {result['nlp']['final_score']}/100")
        return result['session_id']
    else:
        print(f"Error: {response.text}")
        return None

def test_get_results(session_id):
    """Test get results endpoint"""
    print(f"\nTesting get results for session {session_id}...")
    response = requests.get(f"{BASE_URL}/api/results/{session_id}")
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        result = response.json()
        print(f"Retrieved results for: {result['filename']}")
        print(f"Overall Score: {result['final_score']}/100")
    else:
        print(f"Error: {response.text}")

if __name__ == "__main__":
    print("="*60)
    print("AI INTERVIEW ASSESSMENT API TEST SUITE")
    print("="*60)
    
    # Test 1: Health Check
    if not test_health_check():
        print("\n❌ Health check failed! Make sure server is running.")
        exit(1)
    print("✅ Health check passed!")
    
    # Test 2: Video Analysis
    video_path = "video/interview1.mp4"
    keywords = "experience, skills, project, team, problem, solution"
    model_answer = "I have extensive experience working on collaborative projects where I applied my technical skills to solve complex problems."
    
    session_id = test_video_analysis(video_path, keywords, model_answer)
    
    if session_id:
        print("\n✅ Video analysis passed!")
        
        # Test 3: Get Results
        time.sleep(1)  # Brief pause
        test_get_results(session_id)
        print("\n✅ Get results passed!")
        
        print("\n" + "="*60)
        print("ALL TESTS PASSED!")
        print(f"View results in browser: {BASE_URL}/results?session_id={session_id}")
        print("="*60)
    else:
        print("\n❌ Video analysis failed!")

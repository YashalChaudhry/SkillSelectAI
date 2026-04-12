"""API routes with async support"""

from flask import Blueprint, request, jsonify, current_app
from werkzeug.utils import secure_filename
import os
import uuid
import json
from datetime import datetime

from app.tasks import analyze_video_async


bp = Blueprint('api', __name__, url_prefix='/api')


def allowed_file(filename):
    """Check if file extension is allowed"""
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in current_app.config['ALLOWED_EXTENSIONS']


@bp.route('/health', methods=['GET'])
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
        'service': 'AI Interview Assessment API',
        'celery': celery_status,
        'timestamp': datetime.utcnow().isoformat()
    }), 200


@bp.route('/analyze', methods=['POST'])
def analyze_video():
    """
    Submit video for async analysis
    
    Form Data:
        - video: Video file (required)
        - question: Interview question (required)
        - interview_type: video/voice (optional, default: video)
        - question_type: Type of question - technical/behavioral/situational (optional, default: technical)
        - expected_points: Comma-separated expected points (optional)
        - background: Candidate background/resume summary (optional)
    
    Returns:
        JSON with task_id for status polling
    """
    # Check if video file is present
    if 'video' not in request.files:
        return jsonify({'success': False, 'error': 'No video file provided'}), 400
    
    file = request.files['video']
    
    if file.filename == '':
        return jsonify({'success': False, 'error': 'No file selected'}), 400
    
    if not allowed_file(file.filename):
        return jsonify({
            'success': False,
            'error': f'Invalid file type. Allowed: {", ".join(current_app.config["ALLOWED_EXTENSIONS"])}'
        }), 400
    
    # Check for question
    question = request.form.get('question', '').strip()
    if not question:
        return jsonify({'success': False, 'error': 'No question provided'}), 400
    
    # Generate unique session ID
    session_id = str(uuid.uuid4())
    
    # Save uploaded file
    filename = secure_filename(file.filename)
    file_extension = filename.rsplit('.', 1)[1].lower()
    saved_filename = f"{session_id}.{file_extension}"
    file_path = os.path.join(current_app.config['UPLOAD_FOLDER'], saved_filename)
    
    try:
        file.save(file_path)
        print(f"📁 Video saved: {file_path}")
    except Exception as e:
        return jsonify({'success': False, 'error': f'Failed to save file: {str(e)}'}), 500
    
    # Extract optional parameters
    question_type = request.form.get('question_type', 'technical').strip()
    interview_type = request.form.get('interview_type', 'video').strip().lower()
    if interview_type not in {'video', 'voice'}:
        interview_type = 'video'
    expected_points_str = request.form.get('expected_points', '')
    expected_points = [p.strip() for p in expected_points_str.split(',') if p.strip()] if expected_points_str else None
    background = request.form.get('background', '').strip() or None
    
    # Submit async task
    try:
        print(f"🎬 Submitting analysis task for session: {session_id}")
        print(f"   Question: {question[:80]}...")
        print(f"   Interview type: {interview_type}")
        print(f"   Type: {question_type}")
        
        task = analyze_video_async.apply_async(
            args=[
                file_path,
                question,
                interview_type,
                question_type,
                expected_points,
                background
            ]
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


@bp.route('/status/<task_id>', methods=['GET'])
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


@bp.route('/results/<session_id>', methods=['GET'])
def get_results(session_id):
    """
    Retrieve analysis results by session ID
    
    Args:
        session_id: UUID of the analysis session
    
    Returns:
        JSON with analysis results
    """
    results_path = os.path.join('logs', f"{session_id}_results.json")
    
    if not os.path.exists(results_path):
        return jsonify({'error': 'Results not found'}), 404
    
    try:
        with open(results_path, 'r') as f:
            results = json.load(f)
        return jsonify(results), 200
    except Exception as e:
        return jsonify({'error': f'Failed to read results: {str(e)}'}), 500

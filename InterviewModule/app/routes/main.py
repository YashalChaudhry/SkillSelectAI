"""Main web routes for HTML interface"""

from flask import Blueprint, render_template, request, redirect, url_for, send_from_directory, current_app
import os


bp = Blueprint('main', __name__)


@bp.route('/')
def index():
    """Home page with video upload form"""
    return render_template('index.html')


@bp.route('/results/<session_id>')
def results(session_id):
    """Results display page"""
    return render_template('results.html', session_id=session_id)


@bp.route('/api/download-video/<filename>')
def download_video(filename):
    """Download or stream uploaded video"""
    upload_folder = current_app.config['UPLOAD_FOLDER']
    file_path = os.path.join(upload_folder, filename)
    
    # Security check: ensure file exists and is in upload folder
    if not os.path.exists(file_path):
        return {'error': 'Video not found'}, 404
    
    return send_from_directory(upload_folder, filename, as_attachment=False)

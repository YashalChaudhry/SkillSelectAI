"""Celery application configuration"""
import os
from pathlib import Path

# Load environment variables from .env file
try:
    from dotenv import load_dotenv
    load_dotenv(Path(__file__).parent / '.env')
except ImportError:
    pass

from celery import Celery

def make_celery():
    """Create Celery instance"""
    celery = Celery(
        'interview_analyzer',
        broker=os.environ.get('CELERY_BROKER_URL', 'redis://localhost:6379/0'),
        backend=os.environ.get('CELERY_RESULT_BACKEND', 'redis://localhost:6379/0'),
        include=['app.tasks']  # Tell Celery where to find tasks
    )
    
    # Configuration
    celery.conf.update(
        task_serializer='json',
        accept_content=['json'],
        result_serializer='json',
        timezone='UTC',
        enable_utc=True,
        task_track_started=True,
        task_time_limit=900,  # 15 minutes max for large video analysis
        task_soft_time_limit=840,  # 14 minutes soft limit
    )
    
    return celery

celery = make_celery()

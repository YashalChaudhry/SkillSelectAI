"""Application configuration"""
import os
from pathlib import Path

class Config:
    """Base configuration"""
    BASE_DIR = Path(__file__).parent
    SECRET_KEY = os.environ.get('SECRET_KEY', 'dev-secret-key-change-in-production')
    
    # Upload settings
    UPLOAD_FOLDER = BASE_DIR / 'static' / 'uploads'
    MAX_CONTENT_LENGTH = 500 * 1024 * 1024  # 500MB max file size
    ALLOWED_EXTENSIONS = {'mp4', 'avi', 'mov', 'mkv', 'webm', 'wav', 'mp3', 'm4a', 'ogg'}
    
    # Model paths
    FACE_LANDMARKER_MODEL = BASE_DIR / 'face_landmarker.task'
    
    # Processing settings
    CLEANUP_AFTER_HOURS = 24  # Delete uploads after 24 hours
    
class DevelopmentConfig(Config):
    """Development configuration"""
    DEBUG = True
    TESTING = False

class ProductionConfig(Config):
    """Production configuration"""
    DEBUG = False
    TESTING = False
    SECRET_KEY = os.environ.get('SECRET_KEY')  # Must be set in production

config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'default': DevelopmentConfig
}

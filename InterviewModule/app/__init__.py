"""Flask application factory"""

from flask import Flask
from flask_cors import CORS
import os
from pathlib import Path


def create_app(config_name='development'):
    """Create and configure Flask application"""
    # Get the project root directory (parent of app directory)
    project_root = Path(__file__).parent.parent
    
    # Create Flask app with correct template and static folders
    app = Flask(__name__,
                template_folder=str(project_root / 'templates'),
                static_folder=str(project_root / 'static'))
    
    # Load configuration
    if config_name == 'production':
        app.config.from_object('config.ProductionConfig')
    else:
        app.config.from_object('config.DevelopmentConfig')
    
    # Enable CORS
    CORS(app)
    
    # Ensure upload directory exists
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
    
    # Register blueprints
    from app.routes import api, main
    app.register_blueprint(api.bp)
    app.register_blueprint(main.bp)
    
    return app

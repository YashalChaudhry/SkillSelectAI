"""Application entry point"""

import os
from pathlib import Path

# Load environment variables from .env file
try:
    from dotenv import load_dotenv
    load_dotenv(Path(__file__).parent / '.env')
except ImportError:
    pass

from app import create_app


if __name__ == '__main__':
    # Get configuration from environment
    config_name = os.getenv('FLASK_ENV', 'development')
    
    # Create Flask app
    app = create_app(config_name)
    
    # Run the application
    print("\n" + "="*60)
    print("🚀 AI INTERVIEW ASSESSMENT API SERVER")
    print("="*60)
    print(f"Environment: {config_name}")
    print(f"URL: http://127.0.0.1:5001")
    print(f"API Docs: http://127.0.0.1:5001/api/health")
    print("="*60 + "\n")
    
    app.run(
        host='0.0.0.0',
        port=5001,
        debug=(config_name == 'development'),
        use_reloader=False  # Disable auto-reloader to avoid TensorFlow issues
    )

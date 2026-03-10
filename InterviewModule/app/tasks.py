"""Background tasks for video analysis"""
from celery_app import celery
from app.models.comprehensive_analyzer import ComprehensiveInterviewAnalyzer
from pathlib import Path
import os

# Initialize analyzer
analyzer = None

def get_analyzer():
    """Lazy load analyzer"""
    global analyzer
    if analyzer is None:
        analyzer = ComprehensiveInterviewAnalyzer()
    return analyzer

@celery.task(bind=True, name='app.tasks.analyze_video_async')
def analyze_video_async(
    self,
    video_path,
    question,
    question_type="technical",
    expected_points=None,
    candidate_background=None
):
    """
    Async task for comprehensive video analysis
    
    Args:
        video_path (str): Path to uploaded video
        question (str): The interview question
        question_type (str): Type of question (technical/behavioral/situational)
        expected_points (list): Expected points to cover
        candidate_background (str): Candidate's background summary
        
    Returns:
        dict: Comprehensive analysis results
    """
    try:
        # Update task state to PROGRESS
        self.update_state(
            state='PROGRESS',
            meta={'current': 0, 'total': 100, 'status': 'Initializing analysis...'}
        )
        
        # Get analyzer instance
        analyzer_instance = get_analyzer()
        
        # Update progress
        self.update_state(
            state='PROGRESS',
            meta={'current': 15, 'total': 100, 'status': 'Extracting audio...'}
        )
        
        # Run comprehensive analysis
        results = analyzer_instance.analyze_interview_response(
            video_path=video_path,
            question=question,
            question_type=question_type,
            expected_points=expected_points,
            candidate_background=candidate_background
        )
        
        # Update progress based on results
        if results.get('status') == 'success':
            self.update_state(
                state='PROGRESS',
                meta={'current': 90, 'total': 100, 'status': 'Finalizing results...'}
            )
        
        # Cleanup: delete video file after analysis
        try:
            if os.path.exists(video_path):
                os.remove(video_path)
        except Exception as e:
            print(f"Warning: Failed to cleanup {video_path}: {e}")
        
        return results
        
    except Exception as e:
        print(f"Task error: {str(e)}")
        import traceback
        traceback.print_exc()
        # Update task state to FAILURE
        self.update_state(
            state='FAILURE',
            meta={'status': f'Error: {str(e)}'}
        )
        raise

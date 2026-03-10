"""
Command-line interface for standalone usage
"""

import argparse
import json
import sys
from pathlib import Path
from app.models.analyzer import InterviewAnalyzer


def main():
    """Main CLI entry point"""
    parser = argparse.ArgumentParser(
        description="AI Interview Assessment - Analyze interview videos"
    )
    
    parser.add_argument(
        "video_path",
        type=str,
        help="Path to the interview video file"
    )
    
    parser.add_argument(
        "-k", "--keywords",
        type=str,
        default="",
        help="Comma-separated keywords to search for (optional)"
    )
    
    parser.add_argument(
        "-m", "--model-answer",
        type=str,
        default="",
        help="Model answer for semantic similarity comparison (optional)"
    )
    
    parser.add_argument(
        "-o", "--output",
        type=str,
        default=None,
        help="Output JSON file path (optional, prints to stdout if not provided)"
    )
    
    parser.add_argument(
        "-v", "--verbose",
        action="store_true",
        help="Enable verbose output"
    )
    
    args = parser.parse_args()
    
    # Validate video path
    video_path = Path(args.video_path)
    if not video_path.exists():
        print(f"Error: Video file not found: {video_path}", file=sys.stderr)
        sys.exit(1)
    
    # Parse keywords
    keywords = [k.strip() for k in args.keywords.split(",") if k.strip()]
    
    # Initialize analyzer
    if args.verbose:
        print("Initializing AI Interview Analyzer...", file=sys.stderr)
    
    analyzer = InterviewAnalyzer()
    
    # Analyze video
    if args.verbose:
        print(f"Analyzing video: {video_path}", file=sys.stderr)
        print(f"Keywords: {keywords if keywords else 'None'}", file=sys.stderr)
        print(f"Model answer: {'Provided' if args.model_answer else 'None'}", file=sys.stderr)
        print("\nProcessing...\n", file=sys.stderr)
    
    try:
        results = analyzer.analyze_video(
            video_path=str(video_path),
            keywords=keywords,
            model_answer=args.model_answer if args.model_answer else None
        )
        
        # Output results
        if args.output:
            output_path = Path(args.output)
            output_path.parent.mkdir(parents=True, exist_ok=True)
            with open(output_path, 'w', encoding='utf-8') as f:
                json.dump(results, f, indent=2)
            
            if args.verbose:
                print(f"\nResults saved to: {output_path}", file=sys.stderr)
        else:
            print(json.dumps(results, indent=2))
        
        # Print summary if verbose
        if args.verbose:
            print("\n" + "="*60, file=sys.stderr)
            print("ANALYSIS SUMMARY", file=sys.stderr)
            print("="*60, file=sys.stderr)
            print(f"Final Score: {results['final_score']}/100", file=sys.stderr)
            print(f"Grade: {results['grade']}", file=sys.stderr)
            print(f"\nVisual Score: {results['visual']['final_score']}/100", file=sys.stderr)
            print(f"  - Eye Contact: {results['visual']['eye_contact_percentage']}%", file=sys.stderr)
            print(f"  - Emotion: {results['visual']['dominant_emotion']}", file=sys.stderr)
            print(f"\nAudio Score: {results['audio']['final_score']}/100", file=sys.stderr)
            print(f"  - WPM: {results['audio']['wpm']}", file=sys.stderr)
            print(f"  - Confidence: {results['audio']['confidence_score']}", file=sys.stderr)
            print(f"\nNLP Score: {results['nlp']['final_score']}/100", file=sys.stderr)
            if results['nlp']['matched_keywords']:
                print(f"  - Keywords Found: {', '.join(results['nlp']['matched_keywords'])}", file=sys.stderr)
            print("="*60, file=sys.stderr)
        
        sys.exit(0)
        
    except Exception as e:
        print(f"Error during analysis: {e}", file=sys.stderr)
        if args.verbose:
            import traceback
            traceback.print_exc(file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()

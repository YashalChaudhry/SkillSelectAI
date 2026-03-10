@echo off
echo Starting Celery Worker for AI Interview Assessment System...
call venv310\Scripts\activate
celery -A celery_app.celery worker --loglevel=info --pool=solo

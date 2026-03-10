/**
 * Frontend logic for video upload and analysis
 */

$(document).ready(function() {
    const uploadForm = $('#uploadForm');
    const analyzeBtn = $('#analyzeBtn');
    const progressSection = $('#progressSection');
    const errorAlert = $('#errorAlert');
    const progressText = $('#progressText');
    const progressDetails = $('#progressDetails');

    // Form submission
    uploadForm.on('submit', function(e) {
        e.preventDefault();
        
        // Validate file
        const videoFile = $('#videoFile')[0].files[0];
        if (!videoFile) {
            showError('Please select a video file');
            return;
        }

        // Check file size (500MB max)
        const maxSize = 500 * 1024 * 1024;
        if (videoFile.size > maxSize) {
            showError('File size exceeds 500MB limit');
            return;
        }

        // Prepare form data
        const formData = new FormData();
        formData.append('video', videoFile);
        
        const keywords = $('#keywords').val();
        if (keywords) {
            formData.append('keywords', keywords);
        }
        
        const modelAnswer = $('#modelAnswer').val();
        if (modelAnswer) {
            formData.append('model_answer', modelAnswer);
        }

        // Show progress, hide form
        analyzeBtn.prop('disabled', true);
        progressSection.show();
        errorAlert.hide();
        
        updateProgress('Uploading video...', 'Please wait while we upload your file');

        // Send AJAX request
        $.ajax({
            url: '/api/analyze',
            type: 'POST',
            data: formData,
            processData: false,
            contentType: false,
            xhr: function() {
                const xhr = new window.XMLHttpRequest();
                // Upload progress
                xhr.upload.addEventListener('progress', function(e) {
                    if (e.lengthComputable) {
                        const percentComplete = Math.round((e.loaded / e.total) * 100);
                        updateProgress(
                            `Uploading video... ${percentComplete}%`,
                            'File transfer in progress'
                        );
                    }
                }, false);
                return xhr;
            },
            success: function(response) {
                if (response.success) {
                    // Start polling for task status with video filename
                    pollTaskStatus(response.task_id, response.session_id, response.video_filename);
                } else {
                    showError(response.error || 'Unknown error occurred');
                    resetForm();
                }
            },
            error: function(xhr, status, error) {
                let errorMsg = 'Server error occurred';
                if (xhr.responseJSON && xhr.responseJSON.error) {
                    errorMsg = xhr.responseJSON.error;
                }
                showError(errorMsg);
                resetForm();
            }
        });
    });

    function pollTaskStatus(taskId, sessionId, videoFilename) {
        const statusUrl = `/api/status/${taskId}`;
        
        const pollInterval = setInterval(function() {
            $.ajax({
                url: statusUrl,
                type: 'GET',
                success: function(response) {
                    if (response.state === 'PENDING') {
                        updateProgress('Waiting...', response.status);
                    } else if (response.state === 'PROGRESS') {
                        const percent = Math.round((response.current / response.total) * 100);
                        updateProgress(response.status, `${percent}% complete`);
                    } else if (response.state === 'SUCCESS') {
                        clearInterval(pollInterval);
                        updateProgress('Complete!', 'Redirecting to results...');
                        
                        // Store results in localStorage with video filename
                        const resultsKey = `analysis_${sessionId}`;
                        const resultsData = response.result;
                        resultsData.video_filename = videoFilename;  // Add video filename
                        localStorage.setItem(resultsKey, JSON.stringify(resultsData));
                        
                        // Redirect to results page
                        setTimeout(() => {
                            window.location.href = `/results/${sessionId}`;
                        }, 1000);
                    } else if (response.state === 'FAILURE') {
                        clearInterval(pollInterval);
                        showError(response.status || 'Analysis failed');
                        resetForm();
                    }
                },
                error: function() {
                    clearInterval(pollInterval);
                    showError('Failed to check task status');
                    resetForm();
                }
            });
        }, 2000); // Poll every 2 seconds
    }

    function updateProgress(text, details) {
        progressText.text(text);
        progressDetails.text(details);
    }

    function showError(message) {
        $('#errorMessage').text(message);
        errorAlert.show();
    }

    function resetForm() {
        analyzeBtn.prop('disabled', false);
        progressSection.hide();
    }
});

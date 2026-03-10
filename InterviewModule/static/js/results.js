/**
 * Results page functionality
 */

$(document).ready(function() {
    // Retrieve results from localStorage
    const resultsKey = `analysis_${sessionId}`;
    const storedResults = localStorage.getItem(resultsKey);
    
    if (storedResults) {
        const data = JSON.parse(storedResults);
        displayResults(data);
        
        // Display video if filename is available
        if (data.video_filename) {
            displayVideo(data.video_filename);
        }
    } else {
        $('#loadingSection').html('<div class="alert alert-warning"><i class="fas fa-exclamation-triangle"></i> No results found for this session.</div>');
    }
});

function displayVideo(filename) {
    const videoUrl = `/api/download-video/${filename}`;
    
    // Set video source
    $('#videoSource').attr('src', videoUrl);
    $('#videoPlayer')[0].load();
    
    // Set download links
    $('#downloadBtn').attr('href', videoUrl);
    $('#downloadVideoBtn').attr('onclick', `window.location.href='${videoUrl}'`);
    
    // Show video section and download button
    $('#videoSection').show();
    $('#downloadVideoBtn').show();
}

function displayResults(data) {
    // Hide loading, show results
    $('#loadingSection').hide();
    $('#resultsSection').show();
    
    // Overall score
    const score = data.final_score;
    const grade = data.grade.charAt(0); // Get letter grade (A, B, C, D, F)
    $('#finalScore').text(score);
    $('#gradeText').text(data.grade);
    $('#scoreCircle').addClass(`score-${grade}`);
    
    // Visual analysis
    if (data.visual) {
        $('#visualScore').text(data.visual.final_score + '/100');
        $('#eyeContact').text(data.visual.eye_contact_percentage + '%');
        $('#emotion').text(data.visual.dominant_emotion);
        $('#visualFeedback').text(data.visual.feedback);
    }
    
    // Audio analysis
    if (data.audio) {
        $('#audioScore').text(data.audio.final_score + '/100');
        $('#wpm').text(data.audio.wpm + ' WPM');
        $('#confidence').text(data.audio.confidence_score);
        $('#audioFeedback').text(data.audio.feedback);
        
        // Transcript
        if (data.audio.transcript) {
            $('#transcript').text(data.audio.transcript);
        } else {
            $('#transcript').text('No transcript available (video may not have audio)');
        }
    }
    
    // NLP analysis
    if (data.nlp) {
        $('#nlpScore').text(data.nlp.final_score + '/100');
        
        if (data.nlp.matched_keywords && data.nlp.matched_keywords.length > 0) {
            $('#keywordsFound').text(data.nlp.matched_keywords.length + ' found');
        } else {
            $('#keywordsFound').text('None');
        }
        
        if (data.nlp.similarity_score !== undefined) {
            $('#similarity').text(data.nlp.similarity_score + '%');
        } else {
            $('#similarity').text('N/A');
        }
        
        $('#nlpFeedback').text(data.nlp.feedback);
    }
    
    // Create charts
    createCharts(data);
}

function createCharts(data) {
    const visualScore = data.visual?.final_score || 0;
    const audioScore = data.audio?.final_score || 0;
    const nlpScore = data.nlp?.final_score || 0;
    
    // Bar Chart - Score Breakdown
    const scoreCtx = document.getElementById('scoreChart').getContext('2d');
    new Chart(scoreCtx, {
        type: 'bar',
        data: {
            labels: ['Visual', 'Audio', 'Content', 'Overall'],
            datasets: [{
                label: 'Score',
                data: [visualScore, audioScore, nlpScore, data.final_score],
                backgroundColor: [
                    'rgba(54, 162, 235, 0.7)',
                    'rgba(75, 192, 192, 0.7)',
                    'rgba(255, 206, 86, 0.7)',
                    'rgba(153, 102, 255, 0.7)'
                ],
                borderColor: [
                    'rgba(54, 162, 235, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(153, 102, 255, 1)'
                ],
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    ticks: {
                        callback: function(value) {
                            return value + '%';
                        }
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return context.parsed.y.toFixed(1) + '/100';
                        }
                    }
                }
            }
        }
    });
    
    // Radar Chart - Performance Overview
    const radarCtx = document.getElementById('radarChart').getContext('2d');
    new Chart(radarCtx, {
        type: 'radar',
        data: {
            labels: [
                'Eye Contact',
                'Speaking Pace',
                'Confidence',
                'Content Quality',
                'Keyword Match',
                'Overall Score'
            ],
            datasets: [{
                label: 'Performance',
                data: [
                    data.visual?.eye_contact_percentage || 0,
                    Math.min((data.audio?.wpm || 0) / 150 * 100, 100), // Normalize WPM to 0-100
                    parseFloat(data.audio?.confidence_score) || 0,
                    nlpScore,
                    data.nlp?.similarity_score || 0,
                    data.final_score
                ],
                backgroundColor: 'rgba(102, 126, 234, 0.2)',
                borderColor: 'rgba(102, 126, 234, 1)',
                borderWidth: 2,
                pointBackgroundColor: 'rgba(102, 126, 234, 1)',
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: 'rgba(102, 126, 234, 1)'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            scales: {
                r: {
                    beginAtZero: true,
                    max: 100,
                    ticks: {
                        stepSize: 20
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                }
            }
        }
    });
}

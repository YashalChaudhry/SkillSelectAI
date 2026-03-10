// backend/src/services/questionGenerationService.js
import Question from '../models/Question.js';
import QuestionTemplate from '../models/QuestionTemplate.js';
import ContentPool from '../models/ContentPool.js';
import Job from '../models/Job.js';

// Sample question templates (you can move these to a separate file or database)
const DEFAULT_TEMPLATES = [
  {
    template: "Explain the concept of [concept] in [technology]",
    type: "Conceptual",
    difficulty: "Medium",
    skill: "General"
  },
  {
    template: "How would you implement [feature] in [technology]?",
    type: "Technical",
    difficulty: "Medium",
    skill: "General"
  },
  {
    template: "What are the best practices for [concept] in [technology]?",
    type: "Behavioral",
    difficulty: "Easy",
    skill: "General"
  }
];

export const generateQuestionsForJob = async (jobId) => {
  try {
    console.log('\n' + '🎯'.repeat(30));
    console.log('📝 QUESTION GENERATION STARTED');
    console.log(`Target: 30 questions (10 Easy, 10 Medium, 10 Hard)`);
    console.log(`Job ID: ${jobId}`);
    console.log('🎯'.repeat(30) + '\n');
    
    // 1. Get job details
    const job = await Job.findById(jobId);
    if (!job) {
      throw new Error('Job not found');
    }
    
    console.log(`Job Title: ${job.title}`);
    console.log(`Job Description length: ${(job.description || '').length} characters\n`);

    // 2. Extract skills from job description
    const jobDesc = job.description || '';
    const jobSkills = extractSkillsFromDescription(jobDesc);
    console.log('Extracted skills from job description:', jobSkills);

    // 3. Get or create question templates
    let templates = await QuestionTemplate.find({});
    if (templates.length === 0) {
      templates = await seedDefaultTemplates();
    }

    // 4. Get content pool
    const contentPool = await ContentPool.find({});
    const contentMap = new Map();
    
    contentPool.forEach(item => {
      contentMap.set(item.placeholderType, item.values || []);
    });

    // 5. Filter templates based on comprehensive job role detection for perfect relevance
    let templatesToUse;
    
    // Determine job role from job title and description
    const jobTitle = (job.title || '').toLowerCase();
    const jobDescLower = (job.description || '').toLowerCase();
    
    // 📱 MOBILE DEVELOPMENT ROLES
    if (jobTitle.includes('mobile') || jobTitle.includes('ios') || jobTitle.includes('android')) {
      if (jobTitle.includes('android')) {
        templatesToUse = templates.filter(t => t.category === 'Android Development');
        console.log(`Using ${templatesToUse.length} Android-specific templates`);
      } else if (jobTitle.includes('ios')) {
        templatesToUse = templates.filter(t => t.category === 'iOS Development');
        console.log(`Using ${templatesToUse.length} iOS-specific templates`);
      } else {
        templatesToUse = templates.filter(t => t.category === 'Mobile Development');
        console.log(`Using ${templatesToUse.length} mobile-specific templates`);
      }
    }
    // 🌐 WEB DEVELOPMENT
    else if (jobTitle.includes('web developer') || jobTitle.includes('web application')) {
      templatesToUse = templates.filter(t => t.category === 'Web Development');
      console.log(`Using ${templatesToUse.length} web development templates`);
    }
    // 🚀 DEVOPS & PLATFORM ROLES
    else if (jobTitle.includes('devops') || jobTitle.includes('dev-ops')) {
      templatesToUse = templates.filter(t => t.category === 'DevOps');
      console.log(`Using ${templatesToUse.length} devops templates`);
    } else if (jobTitle.includes('sre') || jobTitle.includes('site reliability')) {
      templatesToUse = templates.filter(t => t.category === 'Site Reliability Engineering');
      console.log(`Using ${templatesToUse.length} SRE templates`);
    } else if (jobTitle.includes('cloud engineer') || jobTitle.includes('cloud')) {
      templatesToUse = templates.filter(t => t.category === 'Cloud Engineering');
      console.log(`Using ${templatesToUse.length} cloud engineering templates`);
    }
    // 🧪 QUALITY & DELIVERY ROLES
    else if (jobTitle.includes('qa') || jobTitle.includes('test engineer') || jobTitle.includes('quality assurance')) {
      templatesToUse = templates.filter(t => t.category === 'Quality Assurance');
      console.log(`Using ${templatesToUse.length} QA templates`);
    } else if (jobTitle.includes('automation test') || jobTitle.includes('test automation')) {
      templatesToUse = templates.filter(t => t.category === 'Quality Assurance');
      console.log(`Using ${templatesToUse.length} automation testing templates`);
    } else if (jobTitle.includes('performance test') || jobTitle.includes('performance engineer')) {
      templatesToUse = templates.filter(t => t.category === 'Quality Assurance');
      console.log(`Using ${templatesToUse.length} performance testing templates`);
    }
    // 🔐 SECURITY ROLES
    else if (jobTitle.includes('security engineer') || jobTitle.includes('application security') || jobTitle.includes('cloud security')) {
      templatesToUse = templates.filter(t => t.category === 'Security Engineering');
      console.log(`Using ${templatesToUse.length} security engineering templates`);
    }
    // 📊 DATA & AI ROLES
    else if (jobTitle.includes('data engineer') || jobTitle.includes('data pipeline')) {
      templatesToUse = templates.filter(t => t.category === 'Data Engineering');
      console.log(`Using ${templatesToUse.length} data engineering templates`);
    } else if (jobTitle.includes('data scientist') || jobTitle.includes('data science') || jobTitle.includes('data analyst')) {
      templatesToUse = templates.filter(t => t.category === 'Data Science');
      console.log(`Using ${templatesToUse.length} data science templates`);
    } else if (
      jobTitle.includes('machine learning') || jobTitle.includes('ml engineer') ||
      jobTitle.includes('ai engineer') || jobTitle.includes('ai developer') ||
      jobTitle.includes('artificial intelligence') ||
      jobTitle.includes('deep learning') || jobTitle.includes('neural network') ||
      jobTitle.includes('nlp') || jobTitle.includes('natural language processing') ||
      jobTitle.includes('computer vision') || jobTitle.includes('cv engineer') ||
      jobTitle.includes('llm') || jobTitle.includes('large language model') ||
      jobTitle.includes('genai') || jobTitle.includes('generative ai') ||
      jobTitle.includes('ai/ml') || jobTitle.includes('ml/ai') ||
      jobTitle.includes('ai specialist') || jobTitle.includes('ai researcher') ||
      jobTitle.includes('prompt engineer') || jobTitle.includes('ai ops') ||
      jobTitle.includes('applied scientist') || jobTitle.includes('research scientist') ||
      jobTitle.includes('data science') ||
      (jobTitle.includes('ai') && !jobTitle.includes('maintain') && !jobTitle.includes('contain'))
    ) {
      templatesToUse = templates.filter(t => t.category === 'Machine Learning Engineering');
      console.log(`Using ${templatesToUse.length} AI/ML engineering templates`);
    } else if (jobTitle.includes('mlops') || jobTitle.includes('analytics engineer')) {
      templatesToUse = templates.filter(t => t.category === 'Machine Learning Engineering');
      console.log(`Using ${templatesToUse.length} MLOps templates`);
    }
    // 🧠 ARCHITECTURE & SENIOR ROLES
    else if (jobTitle.includes('architect') || jobTitle.includes('solutions architect') || jobTitle.includes('enterprise architect')) {
      templatesToUse = templates.filter(t => t.category === 'Software Architecture');
      console.log(`Using ${templatesToUse.length} architecture templates`);
    } else if (jobTitle.includes('technical lead') || jobTitle.includes('engineering lead') || jobTitle.includes('tech lead')) {
      templatesToUse = templates.filter(t => t.category === 'Technical Leadership');
      console.log(`Using ${templatesToUse.length} technical leadership templates`);
    }
    // 📱 EMERGING & SPECIALIZED ROLES
    else if (jobTitle.includes('blockchain') || jobTitle.includes('smart contract')) {
      templatesToUse = templates.filter(t => t.category === 'Blockchain Development');
      console.log(`Using ${templatesToUse.length} blockchain templates`);
    } else if (jobTitle.includes('ar/vr') || jobTitle.includes('ar') || jobTitle.includes('vr') || jobTitle.includes('augmented reality') || jobTitle.includes('virtual reality')) {
      templatesToUse = templates.filter(t => t.category === 'AR/VR Development');
      console.log(`Using ${templatesToUse.length} AR/VR templates`);
    } else if (jobTitle.includes('game developer') || jobTitle.includes('game development')) {
      templatesToUse = templates.filter(t => t.category === 'AR/VR Development');
      console.log(`Using ${templatesToUse.length} game development templates`);
    } else if (jobTitle.includes('embedded') || jobTitle.includes('iot')) {
      templatesToUse = templates.filter(t => t.category === 'AR/VR Development');
      console.log(`Using ${templatesToUse.length} embedded/IoT templates`);
    }
    // 🧩 SUPPORTING & HYBRID ROLES
    else if (jobTitle.includes('api engineer') || jobTitle.includes('api development')) {
      templatesToUse = templates.filter(t => t.category === 'API Engineering');
      console.log(`Using ${templatesToUse.length} API engineering templates`);
    } else if (jobTitle.includes('dx engineer') || jobTitle.includes('developer experience') || jobTitle.includes('tools engineer')) {
      templatesToUse = templates.filter(t => t.category === 'Developer Experience');
      console.log(`Using ${templatesToUse.length} developer experience templates`);
    } else if (jobTitle.includes('build engineer') || jobTitle.includes('release engineer') || jobTitle.includes('integration engineer')) {
      templatesToUse = templates.filter(t => t.category === 'DevOps');
      console.log(`Using ${templatesToUse.length} build/release/integration templates`);
    }
    // 🎯 SOFT-SKILL HEAVY ENGINEERING ROLES
    else if (jobTitle.includes('engineering manager') || jobTitle.includes('manager')) {
      templatesToUse = templates.filter(t => t.category === 'Engineering Management');
      console.log(`Using ${templatesToUse.length} engineering management templates`);
    } else if (jobTitle.includes('tpm') || jobTitle.includes('technical program manager') || jobTitle.includes('program manager')) {
      templatesToUse = templates.filter(t => t.category === 'Technical Program Management');
      console.log(`Using ${templatesToUse.length} TPM templates`);
    } else if (jobTitle.includes('product engineer') || jobTitle.includes('product development')) {
      templatesToUse = templates.filter(t => t.category === 'Product Engineering');
      console.log(`Using ${templatesToUse.length} product engineering templates`);
    }
    // 🎨 FRONTEND DEVELOPMENT (Fallback for traditional roles)
    else if (jobTitle.includes('frontend') || jobTitle.includes('front end') || jobDescLower.includes('html') || jobDescLower.includes('css') || jobDescLower.includes('react') || jobDescLower.includes('angular') || jobDescLower.includes('vue')) {
      // Try Frontend Development first, then fall back to Web Development
      templatesToUse = templates.filter(t => t.category === 'Frontend Development');
      if (templatesToUse.length === 0) {
        templatesToUse = templates.filter(t => t.category === 'Web Development');
        console.log(`Using ${templatesToUse.length} web development templates (frontend fallback)`);
      } else {
        console.log(`Using ${templatesToUse.length} frontend-specific templates`);
      }
    }
    // ⚙️ BACKEND DEVELOPMENT (Fallback for traditional roles)
    else if (jobTitle.includes('backend') || jobTitle.includes('back end') || jobDescLower.includes('java') || jobDescLower.includes('python') || jobDescLower.includes('node') || jobDescLower.includes('api')) {
      templatesToUse = templates.filter(t => t.category === 'Backend Development');
      console.log(`Using ${templatesToUse.length} backend-specific templates`);
    }
    // 🔧 FULL STACK (Fallback)
    else if (jobTitle.includes('full stack') || jobTitle.includes('full-stack')) {
      templatesToUse = templates.filter(t => t.category === 'Full Stack Development');
      console.log(`Using ${templatesToUse.length} full-stack templates`);
    }
    else {
      // Fallback to all templates if role not detected
      templatesToUse = templates;
      console.log(`Role not detected, using all ${templatesToUse.length} templates`);
    }

    // CRITICAL: If no templates found for specific role, use ALL templates as fallback
    if (templatesToUse.length === 0) {
      console.warn(`No templates found for role. Using all available templates as fallback.`);
      templatesToUse = templates;
    }

    // 6. Generate questions with strict difficulty quotas (Three-Bucket Approach)
    const questions = [];
    const usedTexts = new Set();
    const maxAttempts = 500; // Increased from 200 to ensure we generate 30 questions
    let attempts = 0;

    const targetQuotas = { Easy: 10, Medium: 10, Hard: 10 };
    const currentCounts = { Easy: 0, Medium: 0, Hard: 0 };
    
    // Generate questions for each difficulty level separately
    for (const difficulty of ['Easy', 'Medium', 'Hard']) {
      const targetCount = targetQuotas[difficulty];
      let difficultyTemplates = templatesToUse.filter(t => t.difficulty === difficulty);
      
      // If no templates for this difficulty, use ALL templates (they'll be reused with different placeholders)
      if (difficultyTemplates.length === 0) {
        console.warn(`No ${difficulty} templates found. Using all templates.`);
        difficultyTemplates = templatesToUse;
      }
      
      console.log(`Generating ${targetCount} ${difficulty} questions from ${difficultyTemplates.length} templates`);
      
      while (currentCounts[difficulty] < targetCount && attempts < maxAttempts) {
        attempts++;
        
        if (difficultyTemplates.length === 0) {
          console.warn(`No templates available. Stopping.`);
          break;
        }
        
        const randomIndex = Math.floor(Math.random() * difficultyTemplates.length);
        let template = difficultyTemplates[randomIndex];

        // If template doesn't have correct difficulty, clone it with the target difficulty
        if (template.difficulty !== difficulty) {
          template = { ...template, difficulty };
        }

        // Skip if we've already used this template too many times (max 3 times to allow enough variety for 30 questions)
        const templateKey = template._id.toString();
        const templateUsageCount = questions.filter(q => q.templateId?.toString() === templateKey).length;
        if (templateUsageCount >= 3) {
          continue;
        }

      // Replace placeholders with content from pool, prioritizing job-specific skills
      let questionText = template.text; // Use 'text' field instead of 'template'
      const placeholders = questionText.match(/\{(.*?)\}/g) || [];
      let hasInvalidContent = false; // Flag to track if we couldn't find appropriate content
      
      for (const placeholder of placeholders) {
        const placeholderType = placeholder.substring(1, placeholder.length - 1); // Remove { and }
        const contentItems = contentMap.get(placeholderType) || [];
        
        if (contentItems.length > 0) {
          let selectedContent;
          
          // Priority 1: Use job-specific skills if they match this placeholder type
          const matchingJobSkills = contentItems.filter(item => 
            jobSkills.some(skill => 
              item.value.toLowerCase() === skill.toLowerCase() ||
              skill.toLowerCase().includes(item.value.toLowerCase()) ||
              item.value.toLowerCase().includes(skill.toLowerCase())
            )
          );
          
          if (matchingJobSkills.length > 0) {
            // Use job-specific content
            selectedContent = matchingJobSkills[Math.floor(Math.random() * matchingJobSkills.length)];
            console.log(`✅ Using job-specific skill: ${selectedContent.value} for placeholder ${placeholderType}`);
          } else {
            // Priority 2: Use role-appropriate content (STRICT MATCHING)
            const roleAppropriateContent = contentItems.filter(item => {
              const itemCategory = item.category?.toLowerCase() || '';
              const jobTitleLower = jobTitle.toLowerCase();
              
              // Match content category to job role - COMPREHENSIVE MATCHING
              if (jobTitleLower.includes('mobile') || jobTitleLower.includes('android') || jobTitleLower.includes('ios')) {
                return itemCategory === 'mobile';
              } else if (jobTitleLower.includes('web') || jobTitleLower.includes('frontend') || jobTitleLower.includes('front-end')) {
                return itemCategory === 'web' || itemCategory === 'frontend';
              } else if (jobTitleLower.includes('devops') || jobTitleLower.includes('sre') || jobTitleLower.includes('site reliability')) {
                return itemCategory === 'devops' || itemCategory === 'cloud';
              } else if (jobTitleLower.includes('security')) {
                return itemCategory === 'security';
              } else if (jobTitleLower.includes('data engineer') || jobTitleLower.includes('data pipeline')) {
                return itemCategory === 'ai' || itemCategory === 'backend';
              } else if (jobTitleLower.includes('machine learning') || jobTitleLower.includes('ml ') || jobTitleLower.includes('ai ') || 
                         jobTitleLower.includes('ai engineer') || jobTitleLower.includes('ml engineer') || 
                         jobTitleLower.includes('deep learning') || jobTitleLower.includes('data scientist') ||
                         jobTitleLower.includes('mlops') || jobTitleLower.includes('nlp') ||
                         jobTitleLower.includes('computer vision') || jobTitleLower.includes('llm') ||
                         jobTitleLower.includes('genai') || jobTitleLower.includes('generative ai') ||
                         jobTitleLower.includes('artificial intelligence') || jobTitleLower.includes('ai/ml') ||
                         jobTitleLower.includes('ml/ai') || jobTitleLower.includes('prompt engineer') ||
                         jobTitleLower.includes('applied scientist') || jobTitleLower.includes('research scientist') ||
                         jobTitleLower.includes('ai researcher') || jobTitleLower.includes('ai specialist') ||
                         jobTitleLower.includes('ai developer') || jobTitleLower.includes('cv engineer') ||
                         jobTitleLower.includes('neural') || jobTitleLower.includes('ai ops')) {
                return itemCategory === 'ai';
              } else if (jobTitleLower.includes('architect')) {
                return itemCategory === 'architecture';
              } else if (jobTitleLower.includes('backend') || jobTitleLower.includes('back-end')) {
                return itemCategory === 'backend';
              } else if (jobTitleLower.includes('cloud')) {
                return itemCategory === 'cloud';
              }
              // For general roles, accept general content
              return itemCategory === 'general';
            });
            
            if (roleAppropriateContent.length > 0) {
              selectedContent = roleAppropriateContent[Math.floor(Math.random() * roleAppropriateContent.length)];
              console.log(`✅ Using role-appropriate content: ${selectedContent.value} (${selectedContent.category}) for placeholder ${placeholderType}`);
            } else {
              // Fallback: If we're close to the target and having trouble finding content, use any related content
              const remainingForDifficulty = targetCount - currentCounts[difficulty];
              const shouldUseFallback = remainingForDifficulty <= 3 && contentItems.length > 0;
              
              if (shouldUseFallback) {
                // Use any available content from the pool (more lenient)
                selectedContent = contentItems[Math.floor(Math.random() * contentItems.length)];
                console.log(`⚠️ Using fallback content: ${selectedContent.value} (${selectedContent.category}) - ${remainingForDifficulty} questions remaining`);
              } else {
                // Strict mode: Mark as invalid and skip this question
                console.warn(`❌ No role-appropriate content found for ${placeholderType} in ${jobTitle} role. Skipping question.`);
                hasInvalidContent = true;
                break; // Exit the placeholder loop early
              }
            }
          }
          
          if (selectedContent) {
            questionText = questionText.replace(placeholder, selectedContent.value);
          }
        } else {
          // If no content pool items, mark as invalid
          console.warn(`❌ No content pool for ${placeholderType}. Skipping question.`);
          hasInvalidContent = true;
          break;
        }
      }

      // Skip this question if we couldn't find appropriate content for all placeholders
      if (hasInvalidContent) {
        continue;
      }

      // Check if this exact question text has been used before
      if (usedTexts.has(questionText)) {
        continue;
      }

      // Mark this text as used
      usedTexts.add(questionText);

      // Add generated question for this difficulty
      questions.push({
        jobId,
        text: questionText,
        skill: template.skillMappings?.[0] || template.skill || 'General',
        difficulty: difficulty, // Use the loop difficulty, not template.difficulty
        type: template.type,
        category: template.category || 'Software Engineering', // Add category from template
        templateId: template._id,
        status: 'Pending',
        isGenerated: true,
        metadata: {
          generatedAt: new Date(),
          lastModified: new Date(),
          jobSkills: jobSkills,
          relevantTemplate: templatesToUse.includes(template)
        }
      });
      
      currentCounts[difficulty]++;
      console.log(`Generated ${currentCounts[difficulty]}/${targetCount} ${difficulty} questions`);
    }
  }

    console.log('\n' + '='.repeat(60));
    console.log(`✅ Generation Complete: ${questions.length}/30 total questions`);
    console.log('Difficulty distribution:', currentCounts);
    console.log('Target: Easy: 10, Medium: 10, Hard: 10');
    
    // Warn if we didn't generate the full 30 questions
    if (questions.length < 30) {
      console.warn(`⚠️ WARNING: Only generated ${questions.length}/30 questions!`);
      console.warn(`   Missing: Easy: ${10 - currentCounts.Easy}, Medium: ${10 - currentCounts.Medium}, Hard: ${10 - currentCounts.Hard}`);
      console.warn(`   This may be due to strict content filtering or insufficient templates`);
    }
    console.log('='.repeat(60) + '\n');

    // 7. Calculate skill relevance score for each question and filter
    console.log('Job skills extracted:', jobSkills);
    
    const questionsWithRelevance = questions.map(q => {
      // Calculate relevance score based on job skills match
      const questionText = q.text.toLowerCase(); // Text should already have placeholders filled
      const questionSkills = q.skillMappings || [];
      
      let relevanceScore = 0;
      let matchedSkills = [];
      
      // Check each job skill against question content
      jobSkills.forEach(jobSkill => {
        const skillLower = jobSkill.toLowerCase();
        
        // Check if skill is in question text (direct match)
        if (questionText.includes(skillLower)) {
          relevanceScore += 40; // Increased weight
          matchedSkills.push(jobSkill);
          console.log(`Direct match found: ${jobSkill} in question`);
        }
        
        // Check if skill is in question skill mappings
        if (questionSkills.some(qs => 
          qs.toLowerCase().includes(skillLower) || 
          skillLower.includes(qs.toLowerCase())
        )) {
          relevanceScore += 30; // Increased weight
          if (!matchedSkills.includes(jobSkill)) {
            matchedSkills.push(jobSkill);
          }
          console.log(`Skill mapping match: ${jobSkill} -> ${questionSkills.join(', ')}`);
        }
        
        // Check partial matches for common web technologies
        const webTechMatches = {
          'html': ['html5', 'markup', 'semantic html', 'html', 'user authentication', 'file upload'],
          'css': ['css3', 'styling', 'stylesheets', 'accessibility', 'css', 'responsive', 'cross-browser'],
          'javascript': ['js', 'es6', 'ecmascript', 'typescript', 'javascript', 'asynchronous', 'promises'],
          'react': ['reactjs', 'react hooks', 'components', 'jsx', 'react', 'ui', 'ux'],
          'angular': ['angularjs', 'angular 2+', 'angular', 'typescript', 'services'],
          'typescript': ['ts', 'types', 'interfaces', 'typescript', 'angular'],
          'sass': ['scss', 'sass', 'css preprocessors', 'styling'],
          'less': ['less', 'css preprocessors', 'styling'],
          'hooks': ['react hooks', 'useeffect', 'usestate', 'hooks'],
          'components': ['components', 'react components', 'vue components', 'ui components'],
          'state management': ['redux', 'vuex', 'context', 'state', 'state management'],
          'ui': ['user interface', 'ui design', 'ux', 'ui'],
          'ux': ['user experience', 'ux design', 'ui', 'ux'],
          'responsive design': ['responsive', 'mobile first', 'media queries', 'responsive design'],
          'cross-browser': ['browser compatibility', 'cross browser', 'cross-browser'],
          'rest api': ['api', 'rest', 'graphql', 'rest api'],
          'api integration': ['api', 'integration', 'rest', 'api integration'],
          'asynchronous': ['async', 'await', 'promises', 'callbacks', 'asynchronous'],
          'git': ['version control', 'github', 'gitlab', 'git'],
          'version control': ['git', 'svn', 'version control', 'git'],
          'webpack': ['bundlers', 'build tools', 'vite', 'webpack'],
          'vite': ['bundlers', 'build tools', 'webpack', 'vite'],
          'build tools': ['webpack', 'vite', 'rollup', 'build tools'],
          'bundling': ['webpack', 'vite', 'parcel', 'bundling'],
          'collaboration': ['teamwork', 'code review', 'collaboration'],
          'webpack': ['bundling', 'build tools', 'optimization'],
          'vite': ['bundling', 'build tools', 'optimization']
        };
        
        if (webTechMatches[skillLower]) {
          const alternatives = webTechMatches[skillLower];
          if (alternatives.some(alt => questionText.includes(alt))) {
            relevanceScore += 20;
            if (!matchedSkills.includes(jobSkill)) {
              matchedSkills.push(jobSkill);
            }
            console.log(`Partial match found: ${jobSkill} -> ${alternatives.join(', ')}`);
          }
        }
      });
      
      // Base score for having any relevant content
      if (matchedSkills.length > 0) {
        relevanceScore += 20; // Increased from 10
      }
      
      // Fallback: Give minimum relevance to web development questions for frontend roles
      if (matchedSkills.length === 0 && questionText.includes('web')) {
        relevanceScore += 15; // Increased from 5
        matchedSkills.push('web development');
        console.log('Fallback: web development question');
      }
      
      // Universal fallback: Give minimum relevance to all web-related questions
      if (matchedSkills.length === 0 && (
        questionText.includes('application') || 
        questionText.includes('development') || 
        questionText.includes('programming') ||
        questionText.includes('coding')
      )) {
        relevanceScore += 10;
        matchedSkills.push('general development');
        console.log('Universal fallback: development question');
      }
      
      // Category-based matching: Give points for relevant categories
      const template = templatesToUse.find(t => t._id.toString() === q.templateId?.toString());
      if (template) {
        const categoryLower = template.category.toLowerCase();
        
        // Frontend development category matches
        if (categoryLower.includes('web') || categoryLower.includes('frontend')) {
          relevanceScore += 8; // Increased from 3
          if (!matchedSkills.includes('frontend development')) {
            matchedSkills.push('frontend development');
          }
        }
        
        // Security questions match security skills
        if (categoryLower.includes('security') && jobSkills.some(s => s.toLowerCase().includes('security'))) {
          relevanceScore += 10; // Increased from 5
          if (!matchedSkills.includes('security')) {
            matchedSkills.push('security');
          }
        }
        
        // General development category bonus
        if (categoryLower.includes('development') || categoryLower.includes('engineering')) {
          relevanceScore += 5;
          if (!matchedSkills.includes('development')) {
            matchedSkills.push('development');
          }
        }
      }
      
      // Normalize score to 0-100
      const maxPossibleScore = jobSkills.length * 40;
      const normalizedScore = Math.min(100, Math.round((relevanceScore / maxPossibleScore) * 100));
      
      console.log(`Question: ${q.text.substring(0, 50)}...`);
      console.log(`  Matched skills: ${matchedSkills.join(', ')}`);
      console.log(`  Score: ${relevanceScore}/${maxPossibleScore} = ${normalizedScore}%`);
      
      return {
        ...q,
        relevanceScore: normalizedScore,
        matchedSkills: matchedSkills,
        shouldShow: normalizedScore >= 1 // Show questions with 1%+ relevance
      };
    });
    
    // Filter to show only relevant questions
    const relevantQuestions = questionsWithRelevance.filter(q => q.shouldShow);
    
    console.log(`Generated ${questions.length} total questions`);
    console.log(`Filtered to ${relevantQuestions.length} relevant questions (1%+ skill match)`);
    console.log('Relevance distribution:');
    const relevanceCounts = { '90-100%': 0, '70-89%': 0, '50-69%': 0, 'Below 50%': 0 };
    questionsWithRelevance.forEach(q => {
      if (q.relevanceScore >= 90) relevanceCounts['90-100%']++;
      else if (q.relevanceScore >= 70) relevanceCounts['70-89%']++;
      else if (q.relevanceScore >= 50) relevanceCounts['50-69%']++;
      else relevanceCounts['Below 50%']++;
    });
    Object.entries(relevanceCounts).forEach(([range, count]) => {
      console.log(`  ${range}: ${count} questions`);
    });

    // 8. Save questions with relevance data
    if (questionsWithRelevance.length > 0) {
      await Question.insertMany(questionsWithRelevance);
      console.log(`\n💾 Saved ${questionsWithRelevance.length} questions to database`);
      console.log(`📋 Workflow: Recruiter reviews → Approves questions → 10 randomly selected for interview\n`);
    }

    return {
      success: true,
      message: `Generated ${questions.length} questions for recruiter review (Target: 30 total - 10 Easy, 10 Medium, 10 Hard). Recruiter will approve questions, then 10 will be randomly selected for each interview.`,
      questions: relevantQuestions,
      totalGenerated: questions.length,
      relevantCount: relevantQuestions.length,
      filteredOut: questions.length - relevantQuestions.length,
      targetQuotas: { Easy: 10, Medium: 10, Hard: 10 },
      actualCounts: currentCounts
    };

  } catch (error) {
    console.error('Error generating questions:', error);
    return {
      success: false,
      message: 'Error generating questions',
      error: error.message
    };
  }
};

// Helper function to extract skills from job description - UNIVERSAL for all roles
function extractSkillsFromDescription(jobDescription) {
  const foundSkills = [];
  
  // Extract from description if available
  if (jobDescription && jobDescription.trim()) {
    const lowerDescription = jobDescription.toLowerCase();
    
    // FRONTEND SKILLS
    if (lowerDescription.includes('html')) foundSkills.push('html', 'html5', 'semantic html');
    if (lowerDescription.includes('css')) foundSkills.push('css', 'css3', 'sass', 'less', 'styling');
    if (lowerDescription.includes('javascript')) foundSkills.push('javascript', 'es6', 'ecmascript');
    if (lowerDescription.includes('react')) foundSkills.push('react', 'react hooks', 'components', 'jsx');
    if (lowerDescription.includes('angular')) foundSkills.push('angular', 'angularjs', 'typescript');
    if (lowerDescription.includes('vue')) foundSkills.push('vue', 'vuejs', 'vuex');
    if (lowerDescription.includes('typescript')) foundSkills.push('typescript', 'ts', 'types');
    
    // BACKEND SKILLS
    if (lowerDescription.includes('node')) foundSkills.push('nodejs', 'express', 'npm');
    if (lowerDescription.includes('python')) foundSkills.push('python', 'django', 'flask');
    if (lowerDescription.includes('java')) foundSkills.push('java', 'spring', 'maven');
    if (lowerDescription.includes('php')) foundSkills.push('php', 'laravel', 'composer');
    if (lowerDescription.includes('ruby')) foundSkills.push('ruby', 'rails', 'sinatra');
    if (lowerDescription.includes('c#')) foundSkills.push('csharp', 'dotnet', 'aspnet');
    if (lowerDescription.includes('go')) foundSkills.push('golang', 'go', 'gin');
    if (lowerDescription.includes('rust')) foundSkills.push('rust', 'cargo', 'tokio');
    
    // DATABASE SKILLS
    if (lowerDescription.includes('sql')) foundSkills.push('sql', 'mysql', 'postgresql');
    if (lowerDescription.includes('nosql')) foundSkills.push('nosql', 'mongodb', 'cassandra');
    if (lowerDescription.includes('mongodb')) foundSkills.push('mongodb', 'mongoose', 'aggregation');
    if (lowerDescription.includes('redis')) foundSkills.push('redis', 'caching', 'pubsub');
    if (lowerDescription.includes('elasticsearch')) foundSkills.push('elasticsearch', 'search', 'indexing');
    
    // DEVOPS SKILLS
    if (lowerDescription.includes('docker')) foundSkills.push('docker', 'containers', 'kubernetes');
    if (lowerDescription.includes('kubernetes')) foundSkills.push('kubernetes', 'k8s', 'orchestration');
    if (lowerDescription.includes('aws')) foundSkills.push('aws', 'ec2', 's3', 'lambda');
    if (lowerDescription.includes('azure')) foundSkills.push('azure', 'cloud', 'app service');
    if (lowerDescription.includes('gcp')) foundSkills.push('gcp', 'google cloud', 'compute engine');
    if (lowerDescription.includes('jenkins')) foundSkills.push('jenkins', 'ci/cd', 'pipeline');
    if (lowerDescription.includes('gitlab')) foundSkills.push('gitlab', 'ci/cd', 'devops');
    if (lowerDescription.includes('terraform')) foundSkills.push('terraform', 'iac', 'infrastructure');
    if (lowerDescription.includes('ansible')) foundSkills.push('ansible', 'automation', 'deployment');
    
    // SECURITY SKILLS
    if (lowerDescription.includes('security')) foundSkills.push('security', 'authentication', 'authorization');
    if (lowerDescription.includes('oauth')) foundSkills.push('oauth', 'jwt', 'tokens');
    if (lowerDescription.includes('encryption')) foundSkills.push('encryption', 'ssl', 'tls');
    if (lowerDescription.includes('penetration')) foundSkills.push('penetration testing', 'security audit');
    if (lowerDescription.includes('vulnerability')) foundSkills.push('vulnerability assessment', 'security');
    
    // MOBILE SKILLS
    if (lowerDescription.includes('android')) foundSkills.push('android', 'java', 'kotlin');
    if (lowerDescription.includes('ios')) foundSkills.push('ios', 'swift', 'objective-c');
    if (lowerDescription.includes('react native')) foundSkills.push('react native', 'mobile');
    if (lowerDescription.includes('flutter')) foundSkills.push('flutter', 'dart', 'mobile');
    if (lowerDescription.includes('swift')) foundSkills.push('swift', 'ios', 'mobile');
    if (lowerDescription.includes('kotlin')) foundSkills.push('kotlin', 'android', 'mobile');
    
    // DATA SCIENCE SKILLS
    if (lowerDescription.includes('machine learning')) foundSkills.push('machine learning', 'ml', 'ai');
    if (lowerDescription.includes('data science')) foundSkills.push('data science', 'analytics', 'statistics');
    if (lowerDescription.includes('python') && lowerDescription.includes('data')) foundSkills.push('pandas', 'numpy', 'jupyter');
    if (lowerDescription.includes('tensorflow')) foundSkills.push('tensorflow', 'deep learning', 'neural networks');
    if (lowerDescription.includes('pytorch')) foundSkills.push('pytorch', 'deep learning', 'ml');
    if (lowerDescription.includes('jupyter')) foundSkills.push('jupyter', 'notebook', 'data analysis');
    
    // UI/UX SKILLS (universal)
    if (lowerDescription.includes('ui') || lowerDescription.includes('ux')) {
      foundSkills.push('ui design', 'ux design', 'user interface', 'user experience');
    }
    
    // GENERAL DEVELOPMENT SKILLS
    if (lowerDescription.includes('api')) foundSkills.push('rest api', 'api integration', 'graphql');
    if (lowerDescription.includes('git')) foundSkills.push('git', 'version control', 'collaboration');
    if (lowerDescription.includes('testing')) foundSkills.push('unit testing', 'integration testing', 'tdd');
    if (lowerDescription.includes('agile')) foundSkills.push('agile', 'scrum', 'project management');
    if (lowerDescription.includes('microservices')) foundSkills.push('microservices', 'distributed systems');
    
    // Remove duplicates and return
    return [...new Set(foundSkills)];
  }
  
  // Default skills if no description (basic web development)
  return ['html', 'css', 'javascript'];
}

// Helper function to seed default templates
async function seedDefaultTemplates() {
  return await QuestionTemplate.insertMany(DEFAULT_TEMPLATES);
}
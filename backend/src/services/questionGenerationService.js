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
    // 1. Get job details
    const job = await Job.findById(jobId);
    if (!job) {
      throw new Error('Job not found');
    }

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
    } else if (jobTitle.includes('data scientist') || jobTitle.includes('data science')) {
      templatesToUse = templates.filter(t => t.category === 'Data Science');
      console.log(`Using ${templatesToUse.length} data science templates`);
    } else if (jobTitle.includes('machine learning') || jobTitle.includes('ml engineer') || jobTitle.includes('ai engineer')) {
      templatesToUse = templates.filter(t => t.category === 'Machine Learning Engineering');
      console.log(`Using ${templatesToUse.length} ML engineering templates`);
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

    // 6. Generate questions with strict difficulty quotas (Three-Bucket Approach)
    const questions = [];
    const usedTexts = new Set(); // Track used question texts to prevent duplicates
    const maxAttempts = 200; // Prevent infinite loops
    let attempts = 0;

    // Define strict quotas for each difficulty
    const targetQuotas = { Easy: 10, Medium: 10, Hard: 10 };
    const currentCounts = { Easy: 0, Medium: 0, Hard: 0 };
    
    // Generate questions for each difficulty level separately
    for (const difficulty of ['Easy', 'Medium', 'Hard']) {
      const targetCount = targetQuotas[difficulty];
      const difficultyTemplates = templatesToUse.filter(t => t.difficulty === difficulty);
      
      console.log(`Generating ${targetCount} ${difficulty} questions from ${difficultyTemplates.length} templates`);
      
      while (currentCounts[difficulty] < targetCount && attempts < maxAttempts) {
        attempts++;
        
        // Pick a random template from this difficulty only
        const randomIndex = Math.floor(Math.random() * difficultyTemplates.length);
        const template = difficultyTemplates[randomIndex];

        // Skip if we've already used this template too many times (max 2 times)
        const templateKey = template._id.toString();
        const templateUsageCount = questions.filter(q => q.templateId?.toString() === templateKey).length;
        if (templateUsageCount >= 2) {
          continue;
        }

      // Replace placeholders with content from pool, prioritizing job-specific skills
      let questionText = template.text; // Use 'text' field instead of 'template'
      const placeholders = questionText.match(/\{(.*?)\}/g) || [];
      
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
            console.log(`Using job-specific skill: ${selectedContent.value} for placeholder ${placeholderType}`);
          } else {
            // Priority 2: Use role-appropriate content
            const roleAppropriateContent = contentItems.filter(item => {
              const itemCategory = item.category?.toLowerCase() || '';
              const jobTitleLower = jobTitle.toLowerCase();
              
              // Match content category to job role
              if (jobTitleLower.includes('mobile') || jobTitleLower.includes('android') || jobTitleLower.includes('ios')) {
                return itemCategory === 'mobile';
              } else if (jobTitleLower.includes('web') || jobTitleLower.includes('frontend')) {
                return itemCategory === 'web';
              } else if (jobTitleLower.includes('devops') || jobTitleLower.includes('sre')) {
                return itemCategory === 'devops';
              } else if (jobTitleLower.includes('security')) {
                return itemCategory === 'security';
              } else if (jobTitleLower.includes('data') || jobTitleLower.includes('ml') || jobTitleLower.includes('ai')) {
                return itemCategory === 'ai';
              } else if (jobTitleLower.includes('architect')) {
                return itemCategory === 'architecture';
              }
              return false;
            });
            
            if (roleAppropriateContent.length > 0) {
              selectedContent = roleAppropriateContent[Math.floor(Math.random() * roleAppropriateContent.length)];
              console.log(`Using role-appropriate content: ${selectedContent.value} for placeholder ${placeholderType}`);
            } else {
              // Priority 3: Use random content as fallback
              selectedContent = contentItems[Math.floor(Math.random() * contentItems.length)];
              console.log(`Using random content: ${selectedContent.value} for placeholder ${placeholderType}`);
            }
          }
          
          questionText = questionText.replace(placeholder, selectedContent.value);
        }
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
        difficulty: template.difficulty,
        type: template.type,
        templateId: template._id,
        status: 'Pending',
        metadata: {
          generatedAt: new Date(),
          lastModified: new Date(),
          jobSkills: jobSkills,
          relevantTemplate: templatesToUse.includes(template)
        }
      });
      
      currentCounts[template.difficulty]++;
      console.log(`Generated ${currentCounts[template.difficulty]}/${targetCount} ${template.difficulty} questions`);
    }
  }

    console.log(`Generated ${questions.length} questions in ${attempts} attempts`);
    console.log('Difficulty distribution:', currentCounts);

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
    }

    return {
      success: true,
      message: `${relevantQuestions.length} relevant questions generated (filtered from ${questions.length} total)`,
      questions: relevantQuestions,
      totalGenerated: questions.length,
      relevantCount: relevantQuestions.length,
      filteredOut: questions.length - relevantQuestions.length
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
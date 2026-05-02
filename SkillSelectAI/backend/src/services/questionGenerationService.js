import Question from '../models/Question.js';
import QuestionTemplate from '../models/QuestionTemplate.js';
import ContentPool from '../models/ContentPool.js';
import Job from '../models/Job.js';

const ROLE_PROFILES = [
  {
    key: 'software-engineering',
    name: 'Software Engineering',
    templateCategories: ['Software Engineering'],
    contentCategories: ['general', 'backend', 'web', 'frontend'],
    titleKeywords: ['software engineer', 'software developer', 'engineer'],
    descriptionKeywords: ['algorithms', 'data structures', 'oop', 'testing', 'code quality'],
    primarySkills: ['algorithms', 'data structures', 'object-oriented programming', 'testing', 'version control'],
    excludedKeywords: []
  },
  {
    key: 'ml',
    name: 'Machine Learning Engineering',
    templateCategories: ['Machine Learning Engineering'],
    contentCategories: ['ai', 'data'],
    titleKeywords: [
      'ai engineer', 'ml engineer', 'machine learning', 'artificial intelligence', 'deep learning',
      'nlp', 'computer vision', 'llm', 'genai', 'generative ai', 'applied scientist', 'ai researcher',
      'ai developer', 'prompt engineer', 'ai/ml engineer', 'mlops engineer', 'applied ai engineer'
    ],
    descriptionKeywords: [
      'model training', 'model evaluation', 'feature engineering', 'deep learning', 'neural network',
      'tensorflow', 'pytorch', 'mlops', 'inference', 'embedding', 'prompt engineering', 'rag',
      'fine-tuning', 'hyperparameter tuning', 'model serving', 'vector database', 'retrieval augmented generation'
    ],
    primarySkills: [
      'machine learning', 'deep learning', 'model evaluation', 'feature engineering', 'data preprocessing',
      'tensorflow', 'pytorch', 'scikit-learn', 'python', 'mlops', 'computer vision', 'nlp', 'llm',
      'transformers', 'hugging face', 'model deployment', 'experiment tracking', 'model monitoring'
    ],
    excludedKeywords: [
      'react', 'angular', 'vue', 'html', 'css', 'frontend', 'node.js api', 'spring boot api', 'rest controller ui',
      'ui component', 'responsive design', 'dom manipulation', 'css framework', 'pixel-perfect'
    ]
  },
  {
    key: 'data-science',
    name: 'Data Science',
    templateCategories: ['Data Science'],
    contentCategories: ['ai', 'data'],
    titleKeywords: ['data scientist', 'data science', 'research scientist'],
    descriptionKeywords: ['statistics', 'hypothesis testing', 'eda', 'data analysis', 'experimentation', 'causal inference', 'regression analysis'],
    primarySkills: ['python', 'pandas', 'numpy', 'statistics', 'model evaluation', 'a/b testing', 'visualization', 'feature importance', 'experimental design'],
    excludedKeywords: ['react', 'angular', 'vue', 'html', 'css', 'frontend', 'backend api', 'kubernetes administration', 'terraform modules']
  },
  {
    key: 'full-stack',
    name: 'Full Stack Development',
    templateCategories: ['Full Stack Development'],
    contentCategories: ['web', 'frontend', 'backend', 'api'],
    titleKeywords: ['full stack', 'full-stack', 'fullstack'],
    descriptionKeywords: ['end-to-end', 'frontend and backend', 'react', 'node', 'api integration', 'database'],
    primarySkills: ['react', 'javascript', 'typescript', 'node.js', 'rest api', 'sql', 'mongodb', 'authentication'],
    excludedKeywords: ['deep learning', 'computer vision', 'threat hunting', 'kubernetes operator']
  },
  {
    key: 'data-engineering',
    name: 'Data Engineering',
    templateCategories: ['Data Engineering'],
    contentCategories: ['data', 'cloud'],
    titleKeywords: ['data engineer', 'analytics engineer', 'etl engineer'],
    descriptionKeywords: ['etl', 'elt', 'pipeline', 'spark', 'airflow', 'warehouse'],
    primarySkills: ['sql', 'spark', 'airflow', 'data pipeline', 'warehouse', 'dbt', 'kafka'],
    excludedKeywords: ['react', 'angular', 'vue', 'html', 'css', 'frontend']
  },
  {
    key: 'web-development',
    name: 'Web Development',
    templateCategories: ['Web Development'],
    contentCategories: ['web', 'frontend', 'backend'],
    titleKeywords: ['web developer', 'web engineer', 'web application developer'],
    descriptionKeywords: ['html', 'css', 'javascript', 'web application', 'browser compatibility'],
    primarySkills: ['html', 'css', 'javascript', 'web performance', 'rest api', 'responsive design'],
    excludedKeywords: ['deep learning', 'mlops', 'threat modeling']
  },
  {
    key: 'frontend',
    name: 'Frontend Development',
    templateCategories: ['Frontend Development', 'Web Development'],
    contentCategories: ['web', 'frontend'],
    titleKeywords: ['frontend', 'front end', 'ui engineer', 'web developer'],
    descriptionKeywords: ['react', 'angular', 'vue', 'javascript', 'typescript', 'css', 'html', 'state management', 'web performance'],
    primarySkills: ['html', 'css', 'javascript', 'typescript', 'react', 'angular', 'vue', 'accessibility', 'web performance', 'component design', 'state management'],
    excludedKeywords: ['kubernetes', 'terraform', 'pytorch', 'neural network', 'computer vision', 'etl pipeline', 'distributed training', 'model serving']
  },
  {
    key: 'api-engineering',
    name: 'API Engineering',
    templateCategories: ['API Engineering'],
    contentCategories: ['api', 'backend'],
    titleKeywords: ['api engineer', 'integration engineer', 'platform api'],
    descriptionKeywords: ['rest api', 'graphql', 'api gateway', 'rate limiting', 'oauth'],
    primarySkills: ['rest api', 'graphql', 'api versioning', 'api security', 'rate limiting', 'webhooks'],
    excludedKeywords: ['react ui', 'css', 'computer vision', 'neural network']
  },
  {
    key: 'backend',
    name: 'Backend Development',
    templateCategories: ['Backend Development', 'API Engineering'],
    contentCategories: ['backend', 'api'],
    titleKeywords: ['backend', 'back end', 'api engineer', 'server engineer'],
    descriptionKeywords: ['microservices', 'rest api', 'graphql', 'database', 'distributed systems', 'event-driven architecture', 'message queue'],
    primarySkills: ['node.js', 'java', 'python', 'go', 'sql', 'redis', 'rest api', 'graphql', 'caching', 'queue processing', 'database indexing'],
    excludedKeywords: ['react', 'angular', 'vue', 'css', 'html', 'computer vision', 'neural network', 'wireframing', 'figma design']
  },
  {
    key: 'cloud-engineering',
    name: 'Cloud Engineering',
    templateCategories: ['Cloud Engineering'],
    contentCategories: ['cloud', 'devops'],
    titleKeywords: ['cloud engineer', 'cloud platform engineer', 'cloud infrastructure'],
    descriptionKeywords: ['aws', 'azure', 'gcp', 'iac', 'scalability', 'load balancing'],
    primarySkills: ['aws', 'azure', 'gcp', 'terraform', 'infrastructure as code', 'cloud networking'],
    excludedKeywords: ['react', 'angular', 'vue', 'computer vision', 'nlp']
  },
  {
    key: 'devops',
    name: 'DevOps',
    templateCategories: ['DevOps'],
    contentCategories: ['devops', 'cloud'],
    titleKeywords: ['devops engineer', 'devops', 'platform engineer'],
    descriptionKeywords: ['kubernetes', 'docker', 'terraform', 'observability', 'ci/cd'],
    primarySkills: ['docker', 'kubernetes', 'terraform', 'ci/cd', 'helm', 'ansible', 'monitoring'],
    excludedKeywords: ['react', 'angular', 'vue', 'html', 'css', 'neural network', 'computer vision']
  },
  {
    key: 'sre',
    name: 'Site Reliability Engineering',
    templateCategories: ['Site Reliability Engineering'],
    contentCategories: ['sre', 'devops', 'cloud'],
    titleKeywords: ['site reliability engineer', 'sre', 'reliability engineer'],
    descriptionKeywords: ['slo', 'sla', 'incident response', 'on-call', 'error budget'],
    primarySkills: ['slo', 'sla', 'incident management', 'observability', 'monitoring', 'capacity planning'],
    excludedKeywords: ['react', 'angular', 'vue', 'html', 'css', 'computer vision']
  },
  {
    key: 'qa',
    name: 'Quality Assurance',
    templateCategories: ['Quality Assurance'],
    contentCategories: ['qa', 'web', 'backend'],
    titleKeywords: ['qa engineer', 'test engineer', 'quality assurance', 'automation tester'],
    descriptionKeywords: ['test automation', 'unit testing', 'integration testing', 'regression testing', 'selenium'],
    primarySkills: ['test planning', 'automation testing', 'selenium', 'cypress', 'postman', 'api testing'],
    excludedKeywords: ['computer vision', 'deep learning', 'terraform', 'kubernetes administration']
  },
  {
    key: 'security',
    name: 'Security Engineering',
    templateCategories: ['Security Engineering'],
    contentCategories: ['security'],
    titleKeywords: ['security engineer', 'application security', 'cloud security', 'security analyst'],
    descriptionKeywords: ['threat model', 'owasp', 'vulnerability', 'penetration testing', 'identity'],
    primarySkills: ['owasp', 'threat modeling', 'authentication', 'authorization', 'encryption', 'siem'],
    excludedKeywords: ['react', 'angular', 'vue', 'html', 'css', 'neural network']
  },
  {
    key: 'mobile',
    name: 'Mobile Development',
    templateCategories: ['Android Development', 'iOS Development', 'Mobile Development'],
    contentCategories: ['mobile'],
    titleKeywords: ['android', 'ios', 'mobile', 'flutter', 'react native'],
    descriptionKeywords: ['kotlin', 'swift', 'objective-c', 'mobile app', 'play store', 'app store'],
    primarySkills: ['android', 'ios', 'kotlin', 'swift', 'flutter', 'react native'],
    excludedKeywords: ['terraform', 'kubernetes', 'neural network', 'computer vision']
  },
  {
    key: 'android-development',
    name: 'Android Development',
    templateCategories: ['Android Development'],
    contentCategories: ['mobile'],
    titleKeywords: ['android developer', 'android engineer', 'android'],
    descriptionKeywords: ['kotlin', 'jetpack', 'android sdk', 'room database'],
    primarySkills: ['android', 'kotlin', 'android sdk', 'jetpack compose', 'mvvm'],
    excludedKeywords: ['swift', 'ios', 'react ui', 'terraform']
  },
  {
    key: 'ios-development',
    name: 'iOS Development',
    templateCategories: ['iOS Development'],
    contentCategories: ['mobile'],
    titleKeywords: ['ios developer', 'ios engineer', 'iphone developer'],
    descriptionKeywords: ['swift', 'swiftui', 'xcode', 'cocoatouch'],
    primarySkills: ['ios', 'swift', 'swiftui', 'xcode', 'combine'],
    excludedKeywords: ['kotlin', 'android', 'react ui', 'terraform']
  },
  {
    key: 'software-architecture',
    name: 'Software Architecture',
    templateCategories: ['Software Architecture'],
    contentCategories: ['architecture', 'backend', 'cloud'],
    titleKeywords: ['software architect', 'solution architect', 'systems architect'],
    descriptionKeywords: ['distributed architecture', 'scalability', 'trade-offs', 'resilience patterns'],
    primarySkills: ['system design', 'distributed systems', 'architecture patterns', 'scalability', 'resilience'],
    excludedKeywords: ['css', 'html', 'pixel perfect', 'basic dom manipulation']
  },
  {
    key: 'technical-leadership',
    name: 'Technical Leadership',
    templateCategories: ['Technical Leadership'],
    contentCategories: ['management', 'general'],
    titleKeywords: ['tech lead', 'technical lead', 'engineering lead'],
    descriptionKeywords: ['architecture decisions', 'mentoring', 'technical strategy', 'delivery ownership'],
    primarySkills: ['technical mentoring', 'architecture leadership', 'delivery planning', 'cross-team collaboration'],
    excludedKeywords: ['basic html css', 'entry level tutorial', 'junior-only coding drills']
  },
  {
    key: 'engineering-management',
    name: 'Engineering Management',
    templateCategories: ['Engineering Management'],
    contentCategories: ['management', 'general'],
    titleKeywords: ['engineering manager', 'development manager', 'software manager'],
    descriptionKeywords: ['people management', 'performance management', 'hiring', 'roadmapping'],
    primarySkills: ['team management', 'stakeholder management', 'planning', 'coaching', 'hiring strategy'],
    excludedKeywords: ['low-level framework syntax', 'frontend styling trivia', 'deep learning optimization']
  },
  {
    key: 'technical-program-management',
    name: 'Technical Program Management',
    templateCategories: ['Technical Program Management'],
    contentCategories: ['management', 'general'],
    titleKeywords: ['technical program manager', 'tpm', 'program manager technical'],
    descriptionKeywords: ['cross-functional execution', 'program risk', 'milestones', 'dependency management'],
    primarySkills: ['program planning', 'risk management', 'stakeholder communication', 'execution tracking'],
    excludedKeywords: ['css selectors', 'neural network tuning', 'android lifecycle internals']
  },
  {
    key: 'product-engineering',
    name: 'Product Engineering',
    templateCategories: ['Product Engineering'],
    contentCategories: ['general', 'web', 'backend'],
    titleKeywords: ['product engineer', 'product development engineer'],
    descriptionKeywords: ['customer impact', 'feature iteration', 'experimentation', 'product metrics'],
    primarySkills: ['product thinking', 'feature design', 'experimentation', 'analytics', 'cross-functional execution'],
    excludedKeywords: ['deep learning fine-tuning', 'kernel optimization', 'penetration exploit development']
  },
  {
    key: 'developer-experience',
    name: 'Developer Experience',
    templateCategories: ['Developer Experience'],
    contentCategories: ['api', 'backend', 'devops'],
    titleKeywords: ['developer experience', 'dx engineer', 'developer productivity engineer'],
    descriptionKeywords: ['tooling', 'build systems', 'developer workflows', 'internal platform'],
    primarySkills: ['ci/cd', 'build tooling', 'developer tooling', 'internal platforms', 'observability'],
    excludedKeywords: ['computer vision', 'ui animation', 'ios swiftui']
  },
  {
    key: 'blockchain-development',
    name: 'Blockchain Development',
    templateCategories: ['Blockchain Development'],
    contentCategories: ['blockchain', 'backend'],
    titleKeywords: ['blockchain developer', 'smart contract engineer', 'web3 engineer'],
    descriptionKeywords: ['smart contracts', 'solidity', 'consensus', 'on-chain', 'ethereum'],
    primarySkills: ['solidity', 'smart contracts', 'web3', 'ethereum', 'contract security'],
    excludedKeywords: ['react css animation', 'computer vision', 'android sdk']
  },
  {
    key: 'ar-vr-development',
    name: 'AR/VR Development',
    templateCategories: ['AR/VR Development'],
    contentCategories: ['ar/vr', 'mobile'],
    titleKeywords: ['ar developer', 'vr developer', 'xr engineer', 'mixed reality engineer'],
    descriptionKeywords: ['unity', 'unreal', 'rendering pipeline', 'spatial computing', '3d interaction'],
    primarySkills: ['unity', 'unreal engine', '3d graphics', 'spatial computing', 'interaction design'],
    excludedKeywords: ['terraform', 'kubernetes', 'sql indexing', 'llm fine-tuning']
  },
  {
    key: 'general-se',
    name: 'Software Engineering',
    templateCategories: [
      'Software Engineering',
      'Full Stack Development',
      'Backend Development',
      'Frontend Development'
    ],
    contentCategories: ['general', 'backend', 'web', 'frontend'],
    titleKeywords: ['software engineer', 'developer', 'engineer'],
    descriptionKeywords: ['programming', 'testing', 'system design', 'api', 'web application'],
    primarySkills: ['data structures', 'algorithms', 'testing', 'api design', 'version control'],
    excludedKeywords: []
  }
];

const SENIORITY_BANDS = [
  {
    level: 'intern',
    keywords: ['intern', 'internship', 'trainee'],
    quotas: { Easy: 18, Medium: 10, Hard: 2 }
  },
  {
    level: 'entry',
    keywords: ['entry level', 'entry-level', 'fresher', 'graduate', 'junior'],
    quotas: { Easy: 15, Medium: 11, Hard: 4 }
  },
  {
    level: 'mid',
    keywords: ['mid', 'mid-level', 'intermediate', '2+ years', '3+ years', '4+ years'],
    quotas: { Easy: 8, Medium: 14, Hard: 8 }
  },
  {
    level: 'senior',
    keywords: ['senior', 'staff', 'lead', 'principal', 'architect', '5+ years', '6+ years', '7+ years', '8+ years'],
    quotas: { Easy: 4, Medium: 10, Hard: 16 }
  }
];

const FIXED_DIFFICULTY_QUOTAS = {
  Easy: 10,
  Medium: 10,
  Hard: 10
};

const ROLE_SKILL_PATTERNS = {
  'software-engineering': [
    'algorithms', 'data structures', 'oop', 'testing', 'code review', 'version control', 'problem solving'
  ],
  ml: [
    'machine learning', 'deep learning', 'neural network', 'nlp', 'computer vision', 'tensorflow', 'pytorch',
    'scikit-learn', 'feature engineering', 'model evaluation', 'model deployment', 'model monitoring',
    'mlops', 'llm', 'transformers', 'embedding', 'vector database', 'prompt engineering', 'rag'
  ],
  'data-science': [
    'data science', 'statistics', 'hypothesis testing', 'regression', 'classification', 'python', 'pandas',
    'numpy', 'a/b testing', 'visualization', 'tableau', 'power bi', 'feature importance', 'causal inference'
  ],
  backend: [
    'rest api', 'graphql', 'microservices', 'distributed systems', 'sql', 'postgresql', 'mysql', 'mongodb',
    'redis', 'kafka', 'rabbitmq', 'node.js', 'spring boot', 'express', 'database indexing', 'caching'
  ],
  frontend: [
    'html', 'css', 'javascript', 'typescript', 'react', 'angular', 'vue', 'redux', 'state management',
    'accessibility', 'responsive design', 'web performance', 'component library', 'vite', 'webpack'
  ],
  'full-stack': [
    'react', 'node.js', 'rest api', 'sql', 'mongodb', 'authentication', 'end-to-end development', 'typescript'
  ],
  'web-development': [
    'html', 'css', 'javascript', 'web performance', 'browser compatibility', 'responsive design', 'rest api'
  ],
  'api-engineering': [
    'rest api', 'graphql', 'api gateway', 'api versioning', 'oauth', 'rate limiting', 'webhooks', 'openapi'
  ],
  'data-engineering': [
    'etl', 'elt', 'data pipeline', 'spark', 'airflow', 'dbt', 'warehouse', 'lakehouse', 'kafka', 'batch processing'
  ],
  'cloud-engineering': [
    'aws', 'azure', 'gcp', 'terraform', 'infrastructure as code', 'cloud networking', 'autoscaling', 'iam'
  ],
  devops: [
    'docker', 'kubernetes', 'terraform', 'ci/cd', 'observability', 'prometheus', 'grafana', 'incident response'
  ],
  sre: [
    'slo', 'sla', 'error budget', 'incident response', 'on-call', 'observability', 'capacity planning'
  ],
  qa: [
    'automation testing', 'regression testing', 'api testing', 'selenium', 'cypress', 'test plans', 'qa strategy'
  ],
  security: [
    'owasp', 'threat modeling', 'vulnerability assessment', 'penetration testing', 'authentication', 'authorization'
  ],
  mobile: [
    'android', 'ios', 'kotlin', 'swift', 'flutter', 'react native', 'mobile app', 'play store', 'app store'
  ],
  'android-development': [
    'android', 'kotlin', 'android sdk', 'jetpack compose', 'mvvm', 'room', 'retrofit'
  ],
  'ios-development': [
    'ios', 'swift', 'swiftui', 'xcode', 'combine', 'uikit', 'core data'
  ],
  'software-architecture': [
    'system design', 'distributed systems', 'architecture patterns', 'scalability', 'resilience', 'trade-offs'
  ],
  'technical-leadership': [
    'technical strategy', 'mentoring', 'architecture decisions', 'cross-team alignment', 'delivery leadership'
  ],
  'engineering-management': [
    'people management', 'hiring', 'performance management', 'roadmapping', 'stakeholder management'
  ],
  'technical-program-management': [
    'program planning', 'dependency management', 'risk management', 'cross-functional execution', 'milestones'
  ],
  'product-engineering': [
    'product thinking', 'experimentation', 'feature iteration', 'analytics', 'customer impact'
  ],
  'developer-experience': [
    'developer tooling', 'build systems', 'ci/cd', 'internal platform', 'developer workflows', 'productivity'
  ],
  'blockchain-development': [
    'smart contracts', 'solidity', 'web3', 'ethereum', 'on-chain', 'consensus', 'gas optimization'
  ],
  'ar-vr-development': [
    'unity', 'unreal engine', '3d graphics', 'xr', 'spatial computing', 'rendering', 'interaction design'
  ]
};

const ROLE_CROSS_DOMAIN_BLOCKLIST = {
  'software-engineering': [
    'llm fine tuning', 'smart contract gas optimization', 'swiftui layout constraints', 'kubernetes operator'
  ],
  ml: [
    'react', 'angular', 'vue', 'html', 'css', 'responsive design', 'ui component', 'dom', 'scss',
    'microservices', 'crud api', 'rest controller', 'spring mvc'
  ],
  'data-science': [
    'react', 'angular', 'vue', 'html', 'css', 'terraform', 'kubernetes', 'frontend routing', 'pixel perfect'
  ],
  backend: [
    'react', 'angular', 'vue', 'html', 'css', 'figma', 'wireframe', 'computer vision', 'neural network', 'llm fine tuning'
  ],
  frontend: [
    'kubernetes', 'terraform', 'incident response', 'distributed training', 'neural network', 'computer vision',
    'feature store', 'mlops', 'model drift'
  ],
  'full-stack': [
    'distributed training', 'slo error budget', 'threat hunting', 'smart contract audit'
  ],
  'web-development': [
    'llm inference optimization', 'incident commander', 'smart contract reentrancy', 'android activity lifecycle'
  ],
  'api-engineering': [
    'css animation', 'figma prototype', 'computer vision', 'android ui kit'
  ],
  'data-engineering': [
    'css', 'react hooks', 'dom', 'wireframe', 'swiftui'
  ],
  'cloud-engineering': [
    'react hooks', 'css grid', 'computer vision', 'a b testing ui', 'android mvvm'
  ],
  devops: [
    'react component lifecycle', 'css box model', 'computer vision', 'nlp transformer fine tuning'
  ],
  sre: [
    'react', 'angular', 'vue', 'html', 'css', 'neural network', 'computer vision', 'smart contract'
  ],
  qa: [
    'distributed model training', 'kubernetes operator internals', '3d rendering pipeline', 'swiftui'
  ],
  security: [
    'css', 'react hooks', 'figma', 'unity shader', 'llm prompt tuning'
  ],
  mobile: [
    'terraform', 'kubernetes', 'feature store', 'graphql federation architecture'
  ],
  'android-development': [
    'ios swiftui', 'terraform', 'kubernetes', 'llm fine tuning'
  ],
  'ios-development': [
    'android jetpack compose', 'terraform', 'kubernetes', 'llm fine tuning'
  ],
  'software-architecture': [
    'basic css styling', 'entry level dom manipulation', 'android xml layout trivia'
  ],
  'technical-leadership': [
    'css selector specificity', 'python for loops basics', 'android intent basics'
  ],
  'engineering-management': [
    'frontend pixel perfect css', 'llm transformer math derivation', 'smart contract opcode details'
  ],
  'technical-program-management': [
    'css animation curve tuning', 'pytorch tensor broadcasting', 'android low-level render thread'
  ],
  'product-engineering': [
    'kubernetes operator internals', 'llm positional encoding derivation', 'smart contract bytecode'
  ],
  'developer-experience': [
    'css keyframes trivia', 'computer vision bounding box iou proofs', 'ios auto layout edge cases'
  ],
  'blockchain-development': [
    'css grid', 'react suspense', 'computer vision', 'kubernetes hpa', 'swiftui'
  ],
  'ar-vr-development': [
    'terraform modules', 'kubernetes pod disruption budget', 'sql index tuning', 'oauth refresh token flow'
  ]
};

const TOKEN_STOPWORDS = new Set([
  'the', 'and', 'for', 'with', 'that', 'this', 'from', 'into', 'your', 'you', 'are', 'our', 'will', 'would',
  'what', 'when', 'where', 'which', 'how', 'use', 'using', 'build', 'design', 'implement', 'experience',
  'knowledge', 'ability', 'understanding', 'work', 'working', 'role', 'team', 'project', 'system'
]);

const DEFAULT_TEMPLATES = [
  {
    text: 'Explain {concept} and when you would apply it.',
    type: 'Conceptual',
    difficulty: 'Easy',
    placeholders: ['concept'],
    category: 'Software Engineering',
    skillMappings: ['Software Engineering']
  },
  {
    text: 'How would you implement {feature} in a production system?',
    type: 'Technical',
    difficulty: 'Medium',
    placeholders: ['feature'],
    category: 'Software Engineering',
    skillMappings: ['Software Engineering', 'System Design']
  },
  {
    text: 'Describe a scenario where {concept} failed and how you mitigated it.',
    type: 'Scenario',
    difficulty: 'Hard',
    placeholders: ['concept'],
    category: 'Software Engineering',
    skillMappings: ['Software Engineering', 'Troubleshooting']
  }
];

export const generateQuestionsForJob = async (jobId) => {
  try {
    const job = await Job.findById(jobId);
    if (!job) {
      throw new Error('Job not found');
    }

    const title = (job.title || '').trim();
    const description = (job.description || '').trim();
    const roleProfile = detectRoleProfile(title, description);
    const seniority = detectSeniority(title, description);

    if (!roleProfile) {
      throw new Error('Unable to confidently determine the job role. Please provide a clearer job title/description.');
    }

    const requiredSkills = extractRequiredSkills(title, description, roleProfile);

    let templates = await QuestionTemplate.find({ isActive: { $ne: false } });
    if (templates.length === 0) {
      templates = await seedDefaultTemplates();
    }

    const strictTemplates = filterTemplatesForRole({
      templates,
      roleProfile,
      requiredSkills,
      title,
      description
    });

    if (strictTemplates.length === 0) {
      throw new Error(`No role-specific templates found for ${roleProfile.name}.`);
    }

    const contentPool = await ContentPool.find({});
    const contentMap = new Map();
    for (const item of contentPool) {
      const values = (item.values || []).filter(v => v && v.isActive !== false);
      contentMap.set(item.placeholderType, values);
    }

    const existingQuestions = await Question.find({ jobId }).select('text difficulty');
    const existingCounts = {
      Easy: existingQuestions.filter(q => String(q.difficulty || '').toLowerCase() === 'easy').length,
      Medium: existingQuestions.filter(q => String(q.difficulty || '').toLowerCase() === 'medium').length,
      Hard: existingQuestions.filter(q => String(q.difficulty || '').toLowerCase() === 'hard').length
    };

    const quotas = {
      Easy: Math.max(0, FIXED_DIFFICULTY_QUOTAS.Easy - existingCounts.Easy),
      Medium: Math.max(0, FIXED_DIFFICULTY_QUOTAS.Medium - existingCounts.Medium),
      Hard: Math.max(0, FIXED_DIFFICULTY_QUOTAS.Hard - existingCounts.Hard)
    };

    if (quotas.Easy === 0 && quotas.Medium === 0 && quotas.Hard === 0) {
      return {
        success: true,
        message: 'Job already has a complete 30-question balanced pool (10 Easy, 10 Medium, 10 Hard).',
        questions: [],
        totalGenerated: 0,
        role: roleProfile.name,
        seniority: seniority.level,
        targetQuotas: FIXED_DIFFICULTY_QUOTAS,
        actualCounts: existingCounts
      };
    }

    const generatedQuestions = [];
    const usedTexts = new Set(existingQuestions.map(q => String(q.text || '').trim()).filter(Boolean));
    const templateUsage = new Map();

    for (const difficulty of ['Easy', 'Medium', 'Hard']) {
      const target = quotas[difficulty] || 0;
      if (target === 0) continue;

      const poolForDifficulty = strictTemplates.filter(t => t.difficulty === difficulty);
      const fallbackPool = poolForDifficulty.length > 0 ? poolForDifficulty : strictTemplates;
      const maxUsagePerTemplate = Math.max(8, Math.ceil((target * 3) / Math.max(1, fallbackPool.length)));
      let attempts = 0;
      const maxAttempts = target * 50;

      while (countByDifficulty(generatedQuestions, difficulty) < target && attempts < maxAttempts) {
        attempts += 1;
        const template = fallbackPool[Math.floor(Math.random() * fallbackPool.length)];
        if (!template) break;

        const usageKey = String(template._id || template.text);
        if ((templateUsage.get(usageKey) || 0) >= maxUsagePerTemplate) {
          continue;
        }

        const built = buildQuestionFromTemplate({
          template,
          targetDifficulty: difficulty,
          roleProfile,
          requiredSkills,
          title,
          description,
          contentMap
        });

        if (!built) {
          continue;
        }

        if (usedTexts.has(built.text)) {
          continue;
        }

        if (!isQuestionStrictlyRelevant({
          questionText: built.text,
          roleProfile,
          requiredSkills,
          title,
          description
        })) {
          continue;
        }

        usedTexts.add(built.text);
        templateUsage.set(usageKey, (templateUsage.get(usageKey) || 0) + 1);

        generatedQuestions.push({
          jobId,
          text: built.text,
          skill: built.skill,
          difficulty,
          type: template.type,
          templateId: template._id,
          status: 'Pending',
          isGenerated: true,
          metadata: {
            generatedAt: new Date(),
            lastModified: new Date(),
            jobSkills: requiredSkills,
            relevantTemplate: true,
            relevanceScore: built.relevanceScore,
            matchedSkills: built.matchedSkills,
            shouldShow: true,
            roleProfile: roleProfile.name,
            seniority: seniority.level
          }
        });
      }
    }

    // Backfill any missing questions with strict role-safe synthesized questions.
    for (const difficulty of ['Easy', 'Medium', 'Hard']) {
      const target = quotas[difficulty] || 0;
      if (countByDifficulty(generatedQuestions, difficulty) >= target) continue;

      backfillQuestionsForDifficulty({
        generatedQuestions,
        usedTexts,
        difficulty,
        target,
        jobId,
        roleProfile,
        requiredSkills,
        title,
        description
      });
    }

    // Emergency fallback: force-fill any remaining quota gaps with safe role-bound questions.
    for (const difficulty of ['Easy', 'Medium', 'Hard']) {
      const target = quotas[difficulty] || 0;
      if (countByDifficulty(generatedQuestions, difficulty) >= target) continue;

      emergencyBackfillQuestionsForDifficulty({
        generatedQuestions,
        usedTexts,
        difficulty,
        target,
        jobId,
        roleProfile,
        requiredSkills,
        title,
        description
      });
    }

    const generatedCounts = {
      Easy: countByDifficulty(generatedQuestions, 'Easy'),
      Medium: countByDifficulty(generatedQuestions, 'Medium'),
      Hard: countByDifficulty(generatedQuestions, 'Hard')
    };

    const missingCounts = {
      Easy: quotas.Easy - generatedCounts.Easy,
      Medium: quotas.Medium - generatedCounts.Medium,
      Hard: quotas.Hard - generatedCounts.Hard
    };

    const hasMissing = Object.values(missingCounts).some(v => v > 0);
    if (hasMissing) {
      throw new Error(
        `Unable to generate the required 30 balanced questions. Missing: Easy=${Math.max(0, missingCounts.Easy)}, Medium=${Math.max(0, missingCounts.Medium)}, Hard=${Math.max(0, missingCounts.Hard)}`
      );
    }

    if (generatedQuestions.length > 0) {
      await Question.insertMany(generatedQuestions);
    }

    const finalQuestions = await Question.find({ jobId }).select('difficulty');
    const finalCounts = {
      Easy: finalQuestions.filter(q => String(q.difficulty || '').toLowerCase() === 'easy').length,
      Medium: finalQuestions.filter(q => String(q.difficulty || '').toLowerCase() === 'medium').length,
      Hard: finalQuestions.filter(q => String(q.difficulty || '').toLowerCase() === 'hard').length
    };

    const finalHasMissing =
      finalCounts.Easy < FIXED_DIFFICULTY_QUOTAS.Easy ||
      finalCounts.Medium < FIXED_DIFFICULTY_QUOTAS.Medium ||
      finalCounts.Hard < FIXED_DIFFICULTY_QUOTAS.Hard;

    if (finalHasMissing) {
      throw new Error(
        `Job pool is still incomplete after generation. Current counts: Easy=${finalCounts.Easy}, Medium=${finalCounts.Medium}, Hard=${finalCounts.Hard}`
      );
    }

    return {
      success: true,
      message: `Question pool ready for ${roleProfile.name}: 30 total with fixed quotas (10 Easy, 10 Medium, 10 Hard).`,
      questions: generatedQuestions,
      totalGenerated: generatedQuestions.length,
      role: roleProfile.name,
      seniority: seniority.level,
      targetQuotas: FIXED_DIFFICULTY_QUOTAS,
      actualCounts: finalCounts
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

function countByDifficulty(questions, difficulty) {
  return questions.filter(q => q.difficulty === difficulty).length;
}

function normalizeText(text) {
  return (text || '').toLowerCase().replace(/[^a-z0-9+.#/\s-]/g, ' ').replace(/\s+/g, ' ').trim();
}

function tokenize(text) {
  return normalizeText(text)
    .split(' ')
    .map(token => token.trim())
    .filter(token => token.length > 1 && !TOKEN_STOPWORDS.has(token));
}

function detectRoleProfile(jobTitle, jobDescription) {
  const title = normalizeText(jobTitle);
  const description = normalizeText(jobDescription);

  let best = null;
  for (const profile of ROLE_PROFILES) {
    let score = 0;

    for (const keyword of profile.titleKeywords) {
      if (title.includes(keyword)) score += 6;
    }

    for (const keyword of profile.descriptionKeywords) {
      if (description.includes(keyword)) score += 3;
    }

    for (const skill of profile.primarySkills) {
      if (title.includes(skill) || description.includes(skill)) score += 2;
    }

    if (!best || score > best.score) {
      best = { profile, score };
    }
  }

  if (!best) return null;

  if (best.score < 4) {
    if (title.includes('engineer') || title.includes('developer')) {
      return ROLE_PROFILES.find(p => p.key === 'general-se') || null;
    }
    return null;
  }

  return best.profile;
}

function detectSeniority(jobTitle, jobDescription) {
  const text = normalizeText(`${jobTitle} ${jobDescription}`);

  for (const band of SENIORITY_BANDS) {
    if (band.keywords.some(keyword => text.includes(keyword))) {
      return band;
    }
  }

  // Parse explicit years of experience as backup.
  const yearsMatches = text.match(/(\d+)\+?\s*years?/g) || [];
  let maxYears = 0;
  for (const match of yearsMatches) {
    const parsed = parseInt(match, 10);
    if (!Number.isNaN(parsed)) {
      maxYears = Math.max(maxYears, parsed);
    }
  }

  if (maxYears >= 5) {
    return SENIORITY_BANDS.find(b => b.level === 'senior');
  }
  if (maxYears >= 2) {
    return SENIORITY_BANDS.find(b => b.level === 'mid');
  }

  return SENIORITY_BANDS.find(b => b.level === 'entry');
}

function extractRequiredSkills(jobTitle, jobDescription, roleProfile) {
  const text = normalizeText(`${jobTitle} ${jobDescription}`);

  const globalSkillPatterns = [
    'python', 'java', 'javascript', 'typescript', 'go', 'sql', 'nosql', 'mongodb', 'postgresql',
    'redis', 'docker', 'kubernetes', 'aws', 'azure', 'gcp', 'graphql', 'rest api', 'microservices',
    'tensorflow', 'pytorch', 'scikit-learn', 'machine learning', 'deep learning', 'model evaluation',
    'nlp', 'computer vision', 'mlops', 'feature engineering', 'data preprocessing', 'ci/cd', 'security'
  ];
  const roleSpecificPatterns = ROLE_SKILL_PATTERNS[roleProfile.key] || [];
  const roleExclusions = new Set((roleProfile.excludedKeywords || []).map(k => normalizeText(k)));
  const crossDomainExclusions = new Set((ROLE_CROSS_DOMAIN_BLOCKLIST[roleProfile.key] || []).map(k => normalizeText(k)));

  const skills = new Set();

  for (const skill of roleProfile.primarySkills) {
    if (text.includes(skill)) {
      skills.add(skill);
    }
  }

  for (const skill of globalSkillPatterns) {
    if (text.includes(skill)) {
      skills.add(skill);
    }
  }

  for (const skill of roleSpecificPatterns) {
    if (text.includes(skill)) {
      skills.add(skill);
    }
  }

  // Capture bullet-style "requirements" fragments as additional skill hints.
  const fragments = jobDescription
    .split(/[\n,;|]/)
    .map(fragment => normalizeText(fragment))
    .filter(Boolean);

  for (const fragment of fragments) {
    for (const token of tokenize(fragment)) {
      const tokenNorm = normalizeText(token);
      if (
        token.length >= 3 &&
        !roleExclusions.has(tokenNorm) &&
        !crossDomainExclusions.has(tokenNorm)
      ) {
        skills.add(token);
      }
    }
  }

  return Array.from(skills)
    .filter(skill => {
      const norm = normalizeText(skill);
      return !roleExclusions.has(norm) && !crossDomainExclusions.has(norm);
    })
    .slice(0, 40);
}

function filterTemplatesForRole({ templates, roleProfile, requiredSkills, title, description }) {
  const contextTokens = new Set(tokenize(`${title} ${description} ${requiredSkills.join(' ')}`));

  const inCategory = templates.filter(template => roleProfile.templateCategories.includes(template.category));

  const scored = inCategory
    .map(template => {
      const templateTokens = new Set(tokenize([
        template.text,
        template.category,
        template.skill,
        ...(template.skillMappings || [])
      ].join(' ')));

      let overlap = 0;
      for (const token of templateTokens) {
        if (contextTokens.has(token)) {
          overlap += 1;
        }
      }

      const semanticScore = templateTokens.size > 0 ? overlap / templateTokens.size : 0;
      return { template, semanticScore };
    })
    .filter(item => item.semanticScore >= 0.1)
    .sort((a, b) => b.semanticScore - a.semanticScore)
    .map(item => item.template);

  return scored.length > 0 ? scored : inCategory;
}

function buildQuestionFromTemplate({
  template,
  targetDifficulty,
  roleProfile,
  requiredSkills,
  title,
  description,
  contentMap
}) {
  let text = template.text;
  const placeholders = text.match(/\{(.*?)\}/g) || [];
  const matchedSkills = [];

  for (const raw of placeholders) {
    const placeholderType = raw.slice(1, -1);
    const value = pickPlaceholderValue({
      placeholderType,
      targetDifficulty,
      roleProfile,
      requiredSkills,
      title,
      description,
      contentMap
    });

    if (!value) {
      return null;
    }

    text = text.replace(raw, value);

    const normalizedValue = normalizeText(value);
    if (requiredSkills.some(skill => normalizedValue.includes(normalizeText(skill)))) {
      matchedSkills.push(value);
    }
  }

  const chosenSkill =
    pickBestSkillFromText(text, requiredSkills) ||
    template.skillMappings?.[0] ||
    template.skill ||
    roleProfile.name;

  const relevanceScore = computeRelevanceScore(text, requiredSkills, `${title} ${description}`);

  return {
    text,
    difficulty: targetDifficulty,
    skill: chosenSkill,
    matchedSkills: Array.from(new Set(matchedSkills.concat(chosenSkill))).slice(0, 10),
    relevanceScore
  };
}

function pickPlaceholderValue({
  placeholderType,
  targetDifficulty,
  roleProfile,
  requiredSkills,
  title,
  description,
  contentMap
}) {
  const contentItems = contentMap.get(placeholderType) || [];
  const jobContext = normalizeText(`${title} ${description}`);
  const allowed = new Set(roleProfile.contentCategories.map(c => normalizeText(c)));

  let candidates = contentItems.filter(item => {
    const category = normalizeText(item.category || 'general');
    const categoryAllowed = allowed.has(category);
    const isGeneral = category === 'general';
    const difficultyAllowed = item.difficulty === 'Any' || item.difficulty === targetDifficulty;

    // Keep strict domain relevance, but allow neutral/general content only for non-domain placeholders.
    const isNeutralPlaceholder = ['scenario', 'challenge', 'context', 'process', 'situation', 'team_type'].includes(placeholderType);
    return difficultyAllowed && (categoryAllowed || (isGeneral && isNeutralPlaceholder));
  });

  candidates = candidates
    .map(item => {
      const valueNorm = normalizeText(item.value);
      let score = 0;

      if (jobContext.includes(valueNorm)) score += 6;

      if (requiredSkills.some(skill => {
        const skillNorm = normalizeText(skill);
        return valueNorm.includes(skillNorm) || skillNorm.includes(valueNorm);
      })) {
        score += 8;
      }

      if (roleProfile.primarySkills.some(skill => {
        const skillNorm = normalizeText(skill);
        return valueNorm.includes(skillNorm) || skillNorm.includes(valueNorm);
      })) {
        score += 5;
      }

      return { value: item.value, score };
    })
    .sort((a, b) => b.score - a.score);

  if (candidates.length > 0) {
    const topBand = candidates.filter(c => c.score === candidates[0].score).slice(0, 5);
    return topBand[Math.floor(Math.random() * topBand.length)].value;
  }

  // Fallback: for skill/tool placeholders, use extracted required skills.
  if (['skill', 'technology', 'framework', 'algorithm', 'model_type', 'ml_model', 'tool'].includes(placeholderType)) {
    if (requiredSkills.length > 0) {
      return requiredSkills[Math.floor(Math.random() * requiredSkills.length)];
    }
  }

  return null;
}

function isQuestionStrictlyRelevant({ questionText, roleProfile, requiredSkills, title, description }) {
  const question = normalizeText(questionText);
  const context = normalizeText(`${title} ${description}`);
  const crossDomainBlockList = ROLE_CROSS_DOMAIN_BLOCKLIST[roleProfile.key] || [];

  const hasRoleSignal = roleProfile.primarySkills.some(skill => question.includes(normalizeText(skill)));
  const hasRequirementSignal = requiredSkills.some(skill => question.includes(normalizeText(skill)));
  const overlapsDescription = tokenize(question).some(token => context.includes(token));

  if (!hasRoleSignal && !hasRequirementSignal && !overlapsDescription) {
    return false;
  }

  for (const excluded of roleProfile.excludedKeywords) {
    if (question.includes(normalizeText(excluded))) {
      return false;
    }
  }

  for (const blocked of crossDomainBlockList) {
    if (question.includes(normalizeText(blocked))) {
      return false;
    }
  }

  return true;
}

function pickBestSkillFromText(questionText, requiredSkills) {
  const q = normalizeText(questionText);
  for (const skill of requiredSkills) {
    const s = normalizeText(skill);
    if (q.includes(s)) {
      return skill;
    }
  }
  return null;
}

function computeRelevanceScore(questionText, requiredSkills, contextText) {
  const questionTokens = new Set(tokenize(questionText));
  const contextTokens = new Set(tokenize(contextText));

  let overlapWithContext = 0;
  for (const token of questionTokens) {
    if (contextTokens.has(token)) overlapWithContext += 1;
  }

  let skillHits = 0;
  const q = normalizeText(questionText);
  for (const skill of requiredSkills) {
    if (q.includes(normalizeText(skill))) {
      skillHits += 1;
    }
  }

  const contextScore = questionTokens.size > 0 ? Math.round((overlapWithContext / questionTokens.size) * 60) : 0;
  const skillScore = requiredSkills.length > 0 ? Math.round((skillHits / requiredSkills.length) * 40) : 20;

  return Math.max(0, Math.min(100, contextScore + skillScore));
}

function backfillQuestionsForDifficulty({
  generatedQuestions,
  usedTexts,
  difficulty,
  target,
  jobId,
  roleProfile,
  requiredSkills,
  title,
  description
}) {
  const safeSkills = getSafeSkillCandidates(roleProfile, requiredSkills);

  const questionTypeByDifficulty = {
    Easy: 'Conceptual',
    Medium: 'Technical',
    Hard: 'Scenario'
  };

  let attempts = 0;
  const maxAttempts = 400;
  const normalizedRole = roleProfile.name;

  while (countByDifficulty(generatedQuestions, difficulty) < target && attempts < maxAttempts) {
    attempts += 1;

    const skill = safeSkills[(attempts - 1) % safeSkills.length] || normalizedRole;
    const text = buildRichFallbackQuestionText({
      difficulty,
      roleName: normalizedRole,
      skill,
      attempt: attempts
    });

    if (usedTexts.has(text)) {
      continue;
    }

    if (!isQuestionStrictlyRelevant({
      questionText: text,
      roleProfile,
      requiredSkills,
      title,
      description
    })) {
      continue;
    }

    usedTexts.add(text);
    generatedQuestions.push({
      jobId,
      text,
      skill,
      difficulty,
      type: questionTypeByDifficulty[difficulty] || 'Technical',
      templateId: null,
      status: 'Pending',
      isGenerated: true,
      metadata: {
        generatedAt: new Date(),
        lastModified: new Date(),
        jobSkills: requiredSkills,
        relevantTemplate: false,
        relevanceScore: computeRelevanceScore(text, requiredSkills, `${title} ${description}`),
        matchedSkills: [skill],
        shouldShow: true,
        roleProfile: roleProfile.name,
        fallbackGenerated: true
      }
    });
  }
}

function emergencyBackfillQuestionsForDifficulty({
  generatedQuestions,
  usedTexts,
  difficulty,
  target,
  jobId,
  roleProfile,
  requiredSkills,
  title,
  description
}) {
  const safeSkills = getSafeSkillCandidates(roleProfile, requiredSkills);
  const excluded = new Set((roleProfile.excludedKeywords || []).map(v => normalizeText(v)));
  const blocked = new Set((ROLE_CROSS_DOMAIN_BLOCKLIST[roleProfile.key] || []).map(v => normalizeText(v)));

  const questionTypeByDifficulty = {
    Easy: 'Conceptual',
    Medium: 'Technical',
    Hard: 'Scenario'
  };

  let attempts = 0;
  const maxAttempts = 1500;
  while (countByDifficulty(generatedQuestions, difficulty) < target && attempts < maxAttempts) {
    attempts += 1;

    const skill = safeSkills[(attempts - 1) % safeSkills.length] || roleProfile.name;
    const text = buildRichFallbackQuestionText({
      difficulty,
      roleName: roleProfile.name,
      skill,
      attempt: attempts + 1000
    });
    const normalized = normalizeText(text);

    if (usedTexts.has(text)) continue;
    if (Array.from(excluded).some(term => normalized.includes(term))) continue;
    if (Array.from(blocked).some(term => normalized.includes(term))) continue;

    usedTexts.add(text);
    generatedQuestions.push({
      jobId,
      text,
      skill,
      difficulty,
      type: questionTypeByDifficulty[difficulty] || 'Technical',
      templateId: null,
      status: 'Pending',
      isGenerated: true,
      metadata: {
        generatedAt: new Date(),
        lastModified: new Date(),
        jobSkills: requiredSkills,
        relevantTemplate: false,
        relevanceScore: computeRelevanceScore(text, requiredSkills, `${title} ${description}`),
        matchedSkills: [skill],
        shouldShow: true,
        roleProfile: roleProfile.name,
        emergencyFallbackGenerated: true
      }
    });
  }
}

function buildRichFallbackQuestionText({ difficulty, roleName, skill, attempt }) {
  const scopes = [
    'performance and latency',
    'scalability and reliability',
    'security and compliance',
    'maintainability and testing',
    'observability and debugging',
    'cost and operational efficiency'
  ];
  const contexts = [
    'a greenfield project',
    'a legacy migration',
    'a high-traffic production service',
    'a distributed multi-team environment',
    'an incident recovery scenario',
    'a strict deadline delivery environment'
  ];
  const tasks = {
    Easy: [
      'explain the core concepts',
      'describe the basic workflow',
      'identify common use cases',
      'outline key terminology'
    ],
    Medium: [
      'design an implementation approach',
      'compare trade-offs and choose a solution',
      'debug a practical issue and resolve it',
      'improve an existing implementation'
    ],
    Hard: [
      'design a resilient architecture and defend your decisions',
      'handle a complex failure scenario end-to-end',
      'optimize a constrained system under real-world trade-offs',
      'define long-term reliability and scaling strategy'
    ]
  };

  const taskList = tasks[difficulty] || tasks.Medium;
  const task = taskList[(attempt - 1) % taskList.length];
  const scope = scopes[Math.floor((attempt - 1) / taskList.length) % scopes.length];
  const context = contexts[Math.floor((attempt - 1) / (taskList.length * scopes.length)) % contexts.length];

  if (difficulty === 'Easy') {
    return `For a ${roleName} position, ${task} for ${skill}, focusing on ${scope} in ${context}.`;
  }
  if (difficulty === 'Hard') {
    return `For a senior ${roleName} interview, ${task} using ${skill}, with emphasis on ${scope} in ${context}.`;
  }
  return `As a ${roleName}, ${task} with ${skill}, considering ${scope} in ${context}.`;
}

function getSafeSkillCandidates(roleProfile, requiredSkills) {
  const blocked = new Set((ROLE_CROSS_DOMAIN_BLOCKLIST[roleProfile.key] || []).map(v => normalizeText(v)));
  const excluded = new Set((roleProfile.excludedKeywords || []).map(v => normalizeText(v)));

  const roleSkills = ROLE_SKILL_PATTERNS[roleProfile.key] || [];
  const candidates = [...requiredSkills, ...roleProfile.primarySkills, ...roleSkills]
    .map(v => String(v || '').trim())
    .filter(Boolean)
    .filter(v => {
      const n = normalizeText(v);
      return !blocked.has(n) && !excluded.has(n);
    });

  const unique = Array.from(new Set(candidates));
  if (unique.length > 0) return unique;

  return [roleProfile.name];
}

async function seedDefaultTemplates() {
  return QuestionTemplate.insertMany(DEFAULT_TEMPLATES);
}

export async function getJobQuestionDifficultyCounts(jobId) {
  const existing = await Question.find({ jobId }).select('difficulty');
  return {
    Easy: existing.filter(q => String(q.difficulty || '').toLowerCase() === 'easy').length,
    Medium: existing.filter(q => String(q.difficulty || '').toLowerCase() === 'medium').length,
    Hard: existing.filter(q => String(q.difficulty || '').toLowerCase() === 'hard').length
  };
}

function isCompleteBalancedPool(counts) {
  return (
    counts.Easy >= FIXED_DIFFICULTY_QUOTAS.Easy &&
    counts.Medium >= FIXED_DIFFICULTY_QUOTAS.Medium &&
    counts.Hard >= FIXED_DIFFICULTY_QUOTAS.Hard
  );
}

export async function ensureCompleteQuestionPoolForJob(jobId, maxAttempts = 3) {
  let lastResult = null;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    lastResult = await generateQuestionsForJob(jobId);
    const counts = await getJobQuestionDifficultyCounts(jobId);

    if (isCompleteBalancedPool(counts)) {
      return {
        success: true,
        message: `Question pool is complete after attempt ${attempt}.`,
        attemptsUsed: attempt,
        actualCounts: counts,
        targetQuotas: FIXED_DIFFICULTY_QUOTAS,
        lastResult
      };
    }
  }

  const finalCounts = await getJobQuestionDifficultyCounts(jobId);
  return {
    success: false,
    message: 'Unable to complete 30-question balanced pool after retries.',
    attemptsUsed: maxAttempts,
    actualCounts: finalCounts,
    targetQuotas: FIXED_DIFFICULTY_QUOTAS,
    lastResult
  };
}

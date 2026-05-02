import QuestionTemplate from '../models/QuestionTemplate.js';
import ContentPool from '../models/ContentPool.js';

// Frontend Developer Templates
const frontendDeveloperTemplates = [
  {
    text: "How would you implement responsive design for {device} using {css_framework}?",
    type: "Technical",
    difficulty: "Medium",
    placeholders: ["device", "css_framework"],
    category: "Frontend Development",
    skillMappings: ["Frontend", "UI/UX", "Responsive Design"]
  },
  {
    text: "Describe your approach to optimizing {performance_metric} in {framework} application.",
    type: "Technical", 
    difficulty: "Hard",
    placeholders: ["performance_metric", "framework"],
    category: "Frontend Development",
    skillMappings: ["Performance", "Frontend", "Optimization"]
  },
  {
    text: "How do you ensure cross-browser compatibility when working with {browser}?",
    type: "Technical",
    difficulty: "Medium",
    placeholders: ["browser"],
    category: "Frontend Development",
    skillMappings: ["Frontend", "Cross-browser", "Compatibility"]
  },
  {
    text: "What's your experience with {state_management} in large-scale {framework} applications?",
    type: "Behavioral",
    difficulty: "Medium",
    placeholders: ["state_management", "framework"],
    category: "Frontend Development",
    skillMappings: ["State Management", "Frontend", "React/Vue"]
  },
  {
    text: "How would you handle API integration between {frontend_framework} and {backend_service}?",
    type: "Scenario",
    difficulty: "Hard",
    placeholders: ["frontend_framework", "backend_service"],
    category: "Frontend Development",
    skillMappings: ["API Integration", "Frontend", "Full Stack"]
  },
  {
    text: "Describe your component architecture for a {feature} in {framework}.",
    type: "Technical",
    difficulty: "Hard",
    placeholders: ["feature", "framework"],
    category: "Frontend Development",
    skillMappings: ["Architecture", "Frontend", "Component Design"]
  },
  {
    text: "How do you implement accessibility features in {framework} applications?",
    type: "Technical",
    difficulty: "Medium",
    placeholders: ["framework"],
    category: "Frontend Development",
    skillMappings: ["Accessibility", "Frontend", "UI/UX"]
  },
  {
    text: "What's your approach to testing {framework} applications with {testing_tool}?",
    type: "Technical",
    difficulty: "Medium",
    placeholders: ["framework", "testing_tool"],
    category: "Frontend Development",
    skillMappings: ["Testing", "Frontend", "Quality Assurance"]
  },
  {
    text: "How would you migrate from {old_framework} to {new_framework} in an existing project?",
    type: "Scenario",
    difficulty: "Hard",
    placeholders: ["old_framework", "new_framework"],
    category: "Frontend Development",
    skillMappings: ["Migration", "Frontend", "Legacy Code"]
  }
];

// Backend Developer Templates
const backendDeveloperTemplates = [
  {
    text: "How would you design RESTful API for {domain} using {backend_language}?",
    type: "Technical",
    difficulty: "Medium",
    placeholders: ["domain", "backend_language"],
    category: "Backend Development",
    skillMappings: ["API Design", "Backend", "REST"]
  },
  {
    text: "Describe your approach to database optimization for {database_type} in {application_type}.",
    type: "Technical",
    difficulty: "Hard",
    placeholders: ["database_type", "application_type"],
    category: "Backend Development",
    skillMappings: ["Database", "Backend", "Optimization"]
  },
  {
    text: "How would you implement authentication and authorization using {auth_system}?",
    type: "Technical",
    difficulty: "Hard",
    placeholders: ["auth_system"],
    category: "Backend Development",
    skillMappings: ["Security", "Backend", "Authentication"]
  },
  {
    text: "What's your experience with {design_pattern} in {backend_language} applications?",
    type: "Behavioral",
    difficulty: "Medium",
    placeholders: ["design_pattern", "backend_language"],
    category: "Backend Development",
    skillMappings: ["Design Patterns", "Backend", "Architecture"]
  },
  {
    text: "How would you handle microservices communication using {protocol}?",
    type: "Technical",
    difficulty: "Hard",
    placeholders: ["protocol"],
    category: "Backend Development",
    skillMappings: ["Microservices", "Backend", "Architecture"]
  },
  {
    text: "Describe your approach to caching in {backend_language} using {cache_strategy}.",
    type: "Technical",
    difficulty: "Medium",
    placeholders: ["backend_language", "cache_strategy"],
    category: "Backend Development",
    skillMappings: ["Caching", "Backend", "Performance"]
  },
  {
    text: "How would you implement data validation in {backend_language}?",
    type: "Technical",
    difficulty: "Medium",
    placeholders: ["backend_language"],
    category: "Backend Development",
    skillMappings: ["Data Validation", "Backend", "Security"]
  },
  {
    text: "What's your approach to error handling and logging in {backend_language} applications?",
    type: "Technical",
    difficulty: "Medium",
    placeholders: ["backend_language"],
    category: "Backend Development",
    skillMappings: ["Error Handling", "Backend", "Monitoring"]
  }
];

// Full Stack Developer Templates
const fullStackDeveloperTemplates = [
  {
    text: "How would you design a full-stack application for {domain} using {frontend} and {backend}?",
    type: "Technical",
    difficulty: "Hard",
    placeholders: ["domain", "frontend", "backend"],
    category: "Full Stack Development",
    skillMappings: ["Full Stack", "Architecture", "System Design"]
  },
  {
    text: "Describe your experience with {deployment_platform} for {application_type} applications.",
    type: "Behavioral",
    difficulty: "Medium",
    placeholders: ["deployment_platform", "application_type"],
    category: "Full Stack Development",
    skillMappings: ["DevOps", "Full Stack", "Deployment"]
  },
  {
    text: "How would you implement real-time features using {websocket_library}?",
    type: "Technical",
    difficulty: "Hard",
    placeholders: ["websocket_library"],
    category: "Full Stack Development",
    skillMappings: ["Real-time", "Full Stack", "WebSockets"]
  }
];

// DevOps Engineer Templates
const devOpsTemplates = [
  {
    text: "How would you set up CI/CD pipeline for {application_type} using {ci_tool}?",
    type: "Technical",
    difficulty: "Medium",
    placeholders: ["application_type", "ci_tool"],
    category: "DevOps",
    skillMappings: ["CI/CD", "DevOps", "Automation"]
  },
  {
    text: "Describe your approach to containerization with {container_tool} for {service_type}.",
    type: "Technical",
    difficulty: "Hard",
    placeholders: ["container_tool", "service_type"],
    category: "DevOps",
    skillMappings: ["Containerization", "DevOps", "Docker"]
  },
  {
    text: "How would you monitor application performance using {monitoring_tool}?",
    type: "Technical",
    difficulty: "Medium",
    placeholders: ["monitoring_tool"],
    category: "DevOps",
    skillMappings: ["Monitoring", "DevOps", "Performance"]
  },
  {
    text: "What's your experience with infrastructure as code using {iac_tool}?",
    type: "Behavioral",
    difficulty: "Medium",
    placeholders: ["iac_tool"],
    category: "DevOps",
    skillMappings: ["Infrastructure as Code", "DevOps", "Terraform"]
  }
];

// Data Scientist Templates
const dataScientistTemplates = [
  {
    text: "How would you approach {ml_problem} using {algorithm}?",
    type: "Technical",
    difficulty: "Hard",
    placeholders: ["ml_problem", "algorithm"],
    category: "Data Science",
    skillMappings: ["Machine Learning", "Data Science", "Algorithms"]
  },
  {
    text: "Describe your experience with {data_visualization_tool} for {data_type}.",
    type: "Behavioral",
    difficulty: "Medium",
    placeholders: ["data_visualization_tool", "data_type"],
    category: "Data Science",
    skillMappings: ["Data Visualization", "Data Science", "Analytics"]
  },
  {
    text: "How would you handle data preprocessing for {data_source}?",
    type: "Technical",
    difficulty: "Medium",
    placeholders: ["data_source"],
    category: "Data Science",
    skillMappings: ["Data Preprocessing", "Data Science", "Cleaning"]
  }
];

// Content Pool for Role-Specific Templates
const roleSpecificContent = [
  // Frontend content
  { placeholderType: "device", values: [
    { value: "mobile devices", category: "Frontend" },
    { value: "tablet devices", category: "Frontend" },
    { value: "desktop browsers", category: "Frontend" },
    { value: "smart TVs", category: "Frontend" }
  ]},
  { placeholderType: "css_framework", values: [
    { value: "CSS Grid", category: "Frontend" },
    { value: "Flexbox", category: "Frontend" },
    { value: "Bootstrap", category: "Frontend" },
    { value: "Tailwind CSS", category: "Frontend" }
  ]},
  { placeholderType: "performance_metric", values: [
    { value: "load time", category: "Frontend" },
    { value: "render speed", category: "Frontend" },
    { value: "memory usage", category: "Frontend" },
    { value: "bundle size", category: "Frontend" }
  ]},
  { placeholderType: "framework", values: [
    { value: "React", category: "Frontend" },
    { value: "Vue.js", category: "Frontend" },
    { value: "Angular", category: "Frontend" },
    { value: "Next.js", category: "Frontend" }
  ]},
  { placeholderType: "state_management", values: [
    { value: "Redux", category: "Frontend" },
    { value: "MobX", category: "Frontend" },
    { value: "Context API", category: "Frontend" },
    { value: "Zustand", category: "Frontend" }
  ]},
  { placeholderType: "testing_tool", values: [
    { value: "Jest", category: "Frontend" },
    { value: "Cypress", category: "Frontend" },
    { value: "React Testing Library", category: "Frontend" },
    { value: "Playwright", category: "Frontend" }
  ]},
  
  // Backend content
  { placeholderType: "domain", values: [
    { value: "e-commerce platform", category: "Backend" },
    { value: "social media application", category: "Backend" },
    { value: "banking system", category: "Backend" },
    { value: "healthcare platform", category: "Backend" }
  ]},
  { placeholderType: "backend_language", values: [
    { value: "Node.js", category: "Backend" },
    { value: "Python", category: "Backend" },
    { value: "Java", category: "Backend" },
    { value: "Go", category: "Backend" }
  ]},
  { placeholderType: "database_type", values: [
    { value: "PostgreSQL", category: "Backend" },
    { value: "MongoDB", category: "Backend" },
    { value: "Redis", category: "Backend" },
    { value: "MySQL", category: "Backend" }
  ]},
  { placeholderType: "auth_system", values: [
    { value: "JWT tokens", category: "Backend" },
    { value: "OAuth 2.0", category: "Backend" },
    { value: "Session-based auth", category: "Backend" },
    { value: "SSO integration", category: "Backend" }
  ]},
  
  // DevOps content
  { placeholderType: "ci_tool", values: [
    { value: "Jenkins", category: "DevOps" },
    { value: "GitHub Actions", category: "DevOps" },
    { value: "GitLab CI", category: "DevOps" },
    { value: "Azure DevOps", category: "DevOps" }
  ]},
  { placeholderType: "container_tool", values: [
    { value: "Docker", category: "DevOps" },
    { value: "Kubernetes", category: "DevOps" },
    { value: "Podman", category: "DevOps" }
  ]},
  { placeholderType: "monitoring_tool", values: [
    { value: "Prometheus", category: "DevOps" },
    { value: "Grafana", category: "DevOps" },
    { value: "ELK Stack", category: "DevOps" },
    { value: "DataDog", category: "DevOps" }
  ]},
  
  // Data Science content
  { placeholderType: "ml_problem", values: [
    { value: "image classification", category: "Data Science" },
    { value: "sentiment analysis", category: "Data Science" },
    { value: "recommendation systems", category: "Data Science" },
    { value: "time series forecasting", category: "Data Science" }
  ]},
  { placeholderType: "algorithm", values: [
    { value: "Random Forest", category: "Data Science" },
    { value: "Neural Networks", category: "Data Science" },
    { value: "Gradient Boosting", category: "Data Science" },
    { value: "K-Means Clustering", category: "Data Science" }
  ]}
];

// Seed role-specific templates
export const seedRoleSpecificTemplates = async () => {
  try {
    console.log('Seeding role-specific templates...');
    
    // Clear existing templates
    await QuestionTemplate.deleteMany({});
    
    // Combine all templates
    const allTemplates = [
      ...frontendDeveloperTemplates,
      ...backendDeveloperTemplates,
      ...fullStackDeveloperTemplates,
      ...devOpsTemplates,
      ...dataScientistTemplates
    ];
    
    // Insert templates
    await QuestionTemplate.insertMany(allTemplates);
    
    // Clear existing content pool
    await ContentPool.deleteMany({});
    
    // Insert role-specific content
    await ContentPool.insertMany(roleSpecificContent);
    
    console.log(`Seeded ${allTemplates.length} role-specific templates and ${roleSpecificContent.length} content entries`);
    
    return {
      success: true,
      message: `Seeded ${allTemplates.length} templates for different engineering roles`
    };
    
  } catch (error) {
    console.error('Error seeding role-specific templates:', error);
    return {
      success: false,
      message: 'Error seeding templates',
      error: error.message
    };
  }
};

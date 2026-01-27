import mongoose from 'mongoose';
import QuestionTemplate from '../models/QuestionTemplate.js';
import ContentPool from '../models/ContentPool.js';
import dotenv from 'dotenv';

dotenv.config();

const COMPREHENSIVE_TEMPLATES = [
  // Conceptual Templates
  {
    text: "Explain the concept of {concept} and its use in {context}.",
    type: "Conceptual",
    difficulty: "Easy",
    placeholders: ["concept", "context"],
    category: "Software Engineering",
    skillMappings: ["OOP", "System Design", "Architecture"]
  },
  {
    text: "What is {concept} and why is it important in {technology} development?",
    type: "Conceptual", 
    difficulty: "Easy",
    placeholders: ["concept", "technology"],
    category: "Software Engineering",
    skillMappings: ["Fundamentals", "Theory"]
  },
  {
    text: "Describe the relationship between {concept1} and {concept2} in {context}.",
    type: "Conceptual",
    difficulty: "Medium", 
    placeholders: ["concept1", "concept2", "context"],
    category: "Software Engineering",
    skillMappings: ["System Design", "Architecture"]
  },
  {
    text: "How does {concept} compare to {alternative} in terms of {criteria}?",
    type: "Conceptual",
    difficulty: "Medium",
    placeholders: ["concept", "alternative", "criteria"],
    category: "Software Engineering", 
    skillMappings: ["Analysis", "Decision Making"]
  },

  // Scenario-based Templates
  {
    text: "What would you do if {scenario} occurs while working as a {role}?",
    type: "Scenario",
    difficulty: "Medium",
    placeholders: ["scenario", "role"],
    category: "Software Engineering",
    skillMappings: ["Problem Solving", "Communication"]
  },
  {
    text: "How would you handle {challenge} when working on a {project_type} project?",
    type: "Scenario",
    difficulty: "Medium",
    placeholders: ["challenge", "project_type"],
    category: "Software Engineering",
    skillMappings: ["Problem Solving", "Adaptability"]
  },
  {
    text: "Describe your approach to resolving {conflict} with {stakeholder} during {phase}.",
    type: "Scenario",
    difficulty: "Hard",
    placeholders: ["conflict", "stakeholder", "phase"],
    category: "Software Engineering",
    skillMappings: ["Communication", "Leadership"]
  },
  {
    text: "You're tasked with {task} under {constraint}. What's your strategy?",
    type: "Scenario", 
    difficulty: "Hard",
    placeholders: ["task", "constraint"],
    category: "Software Engineering",
    skillMappings: ["Planning", "Time Management"]
  },

  // Technical Templates
  {
    text: "How would you approach debugging {error_type} in {context} without writing code?",
    type: "Technical",
    difficulty: "Hard",
    placeholders: ["error_type", "context"],
    category: "Software Engineering",
    skillMappings: ["Debugging", "Problem Solving"]
  },
  {
    text: "Explain your strategy for optimizing {component} for {performance_metric} in {framework}.",
    type: "Technical",
    difficulty: "Hard",
    placeholders: ["component", "performance_metric", "framework"],
    category: "Software Engineering",
    skillMappings: ["Performance", "Architecture"]
  },
  {
    text: "Describe the steps you would take to implement {function_type} in {language}.",
    type: "Technical",
    difficulty: "Medium",
    placeholders: ["function_type", "language"],
    category: "Software Engineering",
    skillMappings: ["System Design", "Planning"]
  },
  {
    text: "What are the key considerations when designing {feature} for {context}?",
    type: "Technical",
    difficulty: "Medium",
    placeholders: ["feature", "context"],
    category: "Software Engineering",
    skillMappings: ["Architecture", "Design"]
  },

  // Behavioral Templates
  {
    text: "Tell me about a time when you {action} in {situation}. What was the outcome?",
    type: "Behavioral",
    difficulty: "Easy",
    placeholders: ["action", "situation"],
    category: "Software Engineering",
    skillMappings: ["Communication", "Experience"]
  },
  {
    text: "Describe a situation where you had to {skill}. How did you approach it?",
    type: "Behavioral",
    difficulty: "Medium",
    placeholders: ["skill"],
    category: "Software Engineering",
    skillMappings: ["Soft Skills", "Experience"]
  },
  {
    text: "How do you stay updated with {technology} trends in {domain}?",
    type: "Behavioral",
    difficulty: "Easy",
    placeholders: ["technology", "domain"],
    category: "Software Engineering",
    skillMappings: ["Learning", "Initiative"]
  },
  {
    text: "What's your approach to {process} when working with {team_type}?",
    type: "Behavioral",
    difficulty: "Medium",
    placeholders: ["process", "team_type"],
    category: "Software Engineering",
    skillMappings: ["Teamwork", "Process"]
  }
];

const CONTENT_POOL_DATA = [
  // Concepts
  {
    placeholderType: "concept",
    values: [
      { value: "inheritance", category: "OOP", difficulty: "Easy" },
      { value: "polymorphism", category: "OOP", difficulty: "Medium" },
      { value: "encapsulation", category: "OOP", difficulty: "Easy" },
      { value: "abstraction", category: "OOP", difficulty: "Medium" },
      { value: "closures", category: "JavaScript", difficulty: "Medium" },
      { value: "hoisting", category: "JavaScript", difficulty: "Easy" },
      { value: "promises", category: "JavaScript", difficulty: "Medium" },
      { value: "async/await", category: "JavaScript", difficulty: "Medium" },
      { value: "virtual DOM", category: "React", difficulty: "Medium" },
      { value: "components", category: "React", difficulty: "Easy" },
      { value: "hooks", category: "React", difficulty: "Medium" },
      { value: "state management", category: "State Management", difficulty: "Hard" },
      { value: "microservices", category: "Architecture", difficulty: "Hard" },
      { value: "API design", category: "Backend", difficulty: "Medium" },
      { value: "database indexing", category: "Database", difficulty: "Medium" },
      { value: "caching strategies", category: "Performance", difficulty: "Hard" }
    ]
  },

  // Contexts
  {
    placeholderType: "context",
    values: [
      { value: "large-scale software systems", category: "Architecture", difficulty: "Medium" },
      { value: "web application development", category: "Frontend", difficulty: "Easy" },
      { value: "enterprise applications", category: "Backend", difficulty: "Medium" },
      { value: "real-time systems", category: "Performance", difficulty: "Hard" },
      { value: "mobile app development", category: "Frontend", difficulty: "Medium" },
      { value: "cloud-native applications", category: "DevOps", difficulty: "Hard" }
    ]
  },

  // Technologies
  {
    placeholderType: "technology",
    values: [
      { value: "React", category: "Frontend", difficulty: "Medium" },
      { value: "Node.js", category: "Backend", difficulty: "Medium" },
      { value: "Python", category: "Backend", difficulty: "Easy" },
      { value: "JavaScript", category: "JavaScript", difficulty: "Easy" },
      { value: "TypeScript", category: "JavaScript", difficulty: "Medium" },
      { value: "MongoDB", category: "Database", difficulty: "Medium" },
      { value: "PostgreSQL", category: "Database", difficulty: "Medium" },
      { value: "Docker", category: "DevOps", difficulty: "Hard" },
      { value: "Kubernetes", category: "DevOps", difficulty: "Hard" },
      { value: "AWS", category: "General", difficulty: "Hard" }
    ]
  },

  // Scenarios
  {
    placeholderType: "scenario",
    values: [
      { value: "server crashes during deployment", category: "DevOps", difficulty: "Hard" },
      { value: "conflicting requirements from stakeholders", category: "Communication", difficulty: "Medium" },
      { value: "tight project deadline", category: "Time Management", difficulty: "Medium" },
      { value: "critical bug in production", category: "Problem Solving", difficulty: "Hard" },
      { value: "team member disagreement on approach", category: "Teamwork", difficulty: "Medium" },
      { value: "scope changes mid-project", category: "Adaptability", difficulty: "Medium" },
      { value: "performance degradation", category: "Performance", difficulty: "Hard" },
      { value: "security vulnerability discovered", category: "Security", difficulty: "Hard" }
    ]
  },

  // Roles
  {
    placeholderType: "role",
    values: [
      { value: "Software Engineer", category: "General", difficulty: "Any" },
      { value: "Senior Software Engineer", category: "General", difficulty: "Any" },
      { value: "Frontend Developer", category: "Frontend", difficulty: "Any" },
      { value: "Backend Developer", category: "Backend", difficulty: "Any" },
      { value: "Full Stack Developer", category: "Full Stack", difficulty: "Any" },
      { value: "DevOps Engineer", category: "DevOps", difficulty: "Any" },
      { value: "Tech Lead", category: "Leadership", difficulty: "Any" }
    ]
  },

  // Challenges
  {
    placeholderType: "challenge",
    values: [
      { value: "legacy code refactoring", category: "Backend", difficulty: "Hard" },
      { value: "performance optimization", category: "Performance", difficulty: "Hard" },
      { value: "integrating third-party APIs", category: "Backend", difficulty: "Medium" },
      { value: "implementing real-time features", category: "Frontend", difficulty: "Medium" },
      { value: "database migration", category: "Database", difficulty: "Hard" },
      { value: "scaling the application", category: "Architecture", difficulty: "Hard" }
    ]
  },

  // Project Types
  {
    placeholderType: "project_type",
    values: [
      { value: "e-commerce", category: "General", difficulty: "Medium" },
      { value: "social media", category: "General", difficulty: "Medium" },
      { value: "enterprise software", category: "Backend", difficulty: "Hard" },
      { value: "mobile application", category: "Frontend", difficulty: "Medium" },
      { value: "data analytics platform", category: "Backend", difficulty: "Hard" }
    ]
  },

  // Languages
  {
    placeholderType: "language",
    values: [
      { value: "JavaScript", category: "Frontend", difficulty: "Easy" },
      { value: "Python", category: "Backend", difficulty: "Easy" },
      { value: "Java", category: "Backend", difficulty: "Medium" },
      { value: "TypeScript", category: "Frontend", difficulty: "Medium" },
      { value: "C++", category: "Backend", difficulty: "Hard" },
      { value: "Go", category: "Backend", difficulty: "Medium" }
    ]
  },

  // Function Types
  {
    placeholderType: "function_type",
    values: [
      { value: "recursive", category: "Algorithms", difficulty: "Medium" },
      { value: "sorting", category: "Algorithms", difficulty: "Easy" },
      { value: "searching", category: "Algorithms", difficulty: "Easy" },
      { value: "data validation", category: "Backend", difficulty: "Medium" },
      { value: "authentication", category: "Security", difficulty: "Hard" }
    ]
  },

  // Actions
  {
    placeholderType: "action",
    values: [
      { value: "led a team project", category: "Leadership", difficulty: "Medium" },
      { value: "solved a complex technical problem", category: "Problem Solving", difficulty: "Hard" },
      { value: "improved system performance", category: "Performance", difficulty: "Medium" },
      { value: "mentored a junior developer", category: "Communication", difficulty: "Easy" },
      { value: "handled a production issue", category: "Problem Solving", difficulty: "Hard" }
    ]
  },

  // Missing placeholder types that were referenced in templates
  {
    placeholderType: "concept1",
    values: [
      { value: "inheritance", category: "OOP", difficulty: "Easy" },
      { value: "encapsulation", category: "OOP", difficulty: "Easy" },
      { value: "abstraction", category: "OOP", difficulty: "Medium" },
      { value: "polymorphism", category: "OOP", difficulty: "Medium" },
      { value: "caching", category: "Performance", difficulty: "Hard" },
      { value: "authentication", category: "Security", difficulty: "Medium" }
    ]
  },

  {
    placeholderType: "concept2",
    values: [
      { value: "composition", category: "OOP", difficulty: "Medium" },
      { value: "dependency injection", category: "Architecture", difficulty: "Hard" },
      { value: "microservices", category: "Architecture", difficulty: "Hard" },
      { value: "api design", category: "Backend", difficulty: "Medium" },
      { value: "database design", category: "Database", difficulty: "Medium" }
    ]
  },

  {
    placeholderType: "conflict",
    values: [
      { value: "conflicting requirements from stakeholders", category: "Communication", difficulty: "Medium" },
      { value: "team member disagreement on approach", category: "Teamwork", difficulty: "Medium" },
      { value: "scope changes mid-project", category: "Adaptability", difficulty: "Medium" },
      { value: "resource constraints", category: "Problem Solving", difficulty: "Hard" }
    ]
  },

  {
    placeholderType: "stakeholder",
    values: [
      { value: "product manager", category: "Communication", difficulty: "Easy" },
      { value: "client", category: "Communication", difficulty: "Medium" },
      { value: "team lead", category: "Leadership", difficulty: "Easy" },
      { value: "project sponsor", category: "Communication", difficulty: "Medium" }
    ]
  },

  {
    placeholderType: "phase",
    values: [
      { value: "planning", category: "General", difficulty: "Easy" },
      { value: "development", category: "General", difficulty: "Easy" },
      { value: "testing", category: "General", difficulty: "Medium" },
      { value: "deployment", category: "DevOps", difficulty: "Medium" },
      { value: "maintenance", category: "General", difficulty: "Easy" }
    ]
  },

  {
    placeholderType: "process",
    values: [
      { value: "code review", category: "General", difficulty: "Easy" },
      { value: "agile development", category: "General", difficulty: "Medium" },
      { value: "continuous integration", category: "DevOps", difficulty: "Medium" },
      { value: "performance optimization", category: "Performance", difficulty: "Hard" }
    ]
  },

  {
    placeholderType: "team_type",
    values: [
      { value: "cross-functional team", category: "Teamwork", difficulty: "Medium" },
      { value: "remote team", category: "Communication", difficulty: "Medium" },
      { value: "agile team", category: "Teamwork", difficulty: "Easy" },
      { value: "development team", category: "Teamwork", difficulty: "Easy" }
    ]
  },

  {
    placeholderType: "domain",
    values: [
      { value: "software development", category: "General", difficulty: "Easy" },
      { value: "frontend development", category: "Frontend", difficulty: "Easy" },
      { value: "backend development", category: "Backend", difficulty: "Easy" },
      { value: "full stack development", category: "Full Stack", difficulty: "Medium" }
    ]
  },

  {
    placeholderType: "requirement",
    values: [
      { value: "user authentication", category: "Security", difficulty: "Hard" },
      { value: "data validation", category: "Backend", difficulty: "Medium" },
      { value: "error handling", category: "Programming", difficulty: "Medium" },
      { value: "file upload", category: "Backend", difficulty: "Easy" }
    ]
  },

  {
    placeholderType: "error_type",
    values: [
      { value: "null pointer exception", category: "Programming", difficulty: "Medium" },
      { value: "memory leak", category: "Performance", difficulty: "Hard" },
      { value: "race condition", category: "Programming", difficulty: "Hard" },
      { value: "syntax error", category: "Programming", difficulty: "Easy" }
    ]
  },

  {
    placeholderType: "skill",
    values: [
      { value: "communication", category: "Communication", difficulty: "Easy" },
      { value: "problem solving", category: "Problem Solving", difficulty: "Medium" },
      { value: "leadership", category: "Leadership", difficulty: "Hard" },
      { value: "time management", category: "Time Management", difficulty: "Medium" },
      { value: "adaptability", category: "Adaptability", difficulty: "Medium" }
    ]
  },

  {
    placeholderType: "component",
    values: [
      { value: "React component", category: "React", difficulty: "Easy" },
      { value: "API endpoint", category: "Backend", difficulty: "Medium" },
      { value: "database query", category: "Database", difficulty: "Medium" },
      { value: "user interface", category: "Frontend", difficulty: "Easy" }
    ]
  },

  {
    placeholderType: "performance_metric",
    values: [
      { value: "render speed", category: "Performance", difficulty: "Medium" },
      { value: "load time", category: "Performance", difficulty: "Easy" },
      { value: "memory usage", category: "Performance", difficulty: "Hard" },
      { value: "CPU utilization", category: "Performance", difficulty: "Hard" }
    ]
  },

  {
    placeholderType: "framework",
    values: [
      { value: "React", category: "Frontend", difficulty: "Medium" },
      { value: "Vue.js", category: "Frontend", difficulty: "Medium" },
      { value: "Angular", category: "Frontend", difficulty: "Hard" },
      { value: "Express.js", category: "Backend", difficulty: "Easy" }
    ]
  },

  {
    placeholderType: "task",
    values: [
      { value: "implementing a new feature", category: "General", difficulty: "Medium" },
      { value: "fixing a critical bug", category: "Problem Solving", difficulty: "Hard" },
      { value: "optimizing database queries", category: "Performance", difficulty: "Hard" },
      { value: "conducting code review", category: "General", difficulty: "Easy" }
    ]
  },

  {
    placeholderType: "constraint",
    values: [
      { value: "tight deadline", category: "Time Management", difficulty: "Medium" },
      { value: "limited resources", category: "Problem Solving", difficulty: "Hard" },
      { value: "budget constraints", category: "General", difficulty: "Medium" },
      { value: "technical limitations", category: "General", difficulty: "Medium" }
    ]
  },

  {
    placeholderType: "feature",
    values: [
      { value: "user authentication", category: "Security", difficulty: "Medium" },
      { value: "data visualization", category: "Frontend", difficulty: "Medium" },
      { value: "real-time updates", category: "Backend", difficulty: "Hard" },
      { value: "file upload system", category: "Backend", difficulty: "Easy" }
    ]
  },

  {
    placeholderType: "alternative",
    values: [
      { value: "other approaches", category: "General", difficulty: "Easy" },
      { value: "traditional methods", category: "General", difficulty: "Medium" },
      { value: "modern solutions", category: "General", difficulty: "Medium" },
      { value: "different frameworks", category: "General", difficulty: "Hard" }
    ]
  },

  {
    placeholderType: "criteria",
    values: [
      { value: "performance", category: "Performance", difficulty: "Medium" },
      { value: "scalability", category: "Architecture", difficulty: "Hard" },
      { value: "maintainability", category: "General", difficulty: "Medium" },
      { value: "security", category: "Security", difficulty: "Hard" }
    ]
  },

  {
    placeholderType: "situation",
    values: [
      { value: "production environment", category: "DevOps", difficulty: "Medium" },
      { value: "team project", category: "Teamwork", difficulty: "Easy" },
      { value: "critical deadline", category: "Time Management", difficulty: "Hard" },
      { value: "client presentation", category: "Communication", difficulty: "Medium" }
    ]
  }
];

async function seedTemplates() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/skillselect');
    console.log('Connected to MongoDB');

    // Clear existing templates and content pools
    await QuestionTemplate.deleteMany({});
    await ContentPool.deleteMany({});
    console.log('Cleared existing templates and content pools');

    // Insert comprehensive templates
    const insertedTemplates = await QuestionTemplate.insertMany(COMPREHENSIVE_TEMPLATES);
    console.log(`Inserted ${insertedTemplates.length} question templates`);

    // Insert content pool data
    const insertedContentPools = await ContentPool.insertMany(CONTENT_POOL_DATA);
    console.log(`Inserted ${insertedContentPools.length} content pool entries`);

    console.log('Template seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding templates:', error);
    process.exit(1);
  }
}

seedTemplates();

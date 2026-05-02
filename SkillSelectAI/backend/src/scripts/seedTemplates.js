import mongoose from 'mongoose';
import QuestionTemplate from '../models/QuestionTemplate.js';
import ContentPool from '../models/ContentPool.js';
import dotenv from 'dotenv';
import { COMPREHENSIVE_TEMPLATES } from '../seeds/questionTemplates.js';

dotenv.config();

// Using 448 generated templates from questionTemplates.js
// They cover 14 categories with 32 templates each (10 Easy, 12 Medium, 10 Hard)

const CONTENT_POOL_DATA = [
  // Concepts
  {
    placeholderType: "concept",
    values: [
      // Traditional programming concepts
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
      { value: "caching strategies", category: "Performance", difficulty: "Hard" },
      // AI/ML concepts
      { value: "neural networks", category: "AI", difficulty: "Medium" },
      { value: "backpropagation", category: "AI", difficulty: "Hard" },
      { value: "gradient descent", category: "AI", difficulty: "Medium" },
      { value: "overfitting", category: "AI", difficulty: "Easy" },
      { value: "underfitting", category: "AI", difficulty: "Easy" },
      { value: "regularization", category: "AI", difficulty: "Medium" },
      { value: "transfer learning", category: "AI", difficulty: "Medium" },
      { value: "feature engineering", category: "AI", difficulty: "Medium" },
      { value: "bias-variance tradeoff", category: "AI", difficulty: "Hard" },
      { value: "cross-validation", category: "AI", difficulty: "Medium" },
      { value: "attention mechanisms", category: "AI", difficulty: "Hard" },
      { value: "embedding layers", category: "AI", difficulty: "Medium" },
      { value: "batch normalization", category: "AI", difficulty: "Hard" },
      { value: "dropout", category: "AI", difficulty: "Medium" },
      { value: "convolutional layers", category: "AI", difficulty: "Medium" },
      { value: "recurrent layers", category: "AI", difficulty: "Medium" }
    ]
  },

  // Contexts
  {
    placeholderType: "context",
    values: [
      { value: "large-scale software systems", category: "Architecture", difficulty: "Medium" },
      { value: "web application development", category: "Web", difficulty: "Easy" },
      { value: "enterprise applications", category: "Backend", difficulty: "Medium" },
      { value: "real-time systems", category: "Performance", difficulty: "Hard" },
      { value: "mobile app development", category: "Mobile", difficulty: "Medium" },
      { value: "cloud-native applications", category: "Cloud", difficulty: "Hard" },
      { value: "machine learning systems", category: "AI", difficulty: "Medium" },
      { value: "deep learning applications", category: "AI", difficulty: "Hard" },
      { value: "natural language processing", category: "AI", difficulty: "Medium" },
      { value: "computer vision systems", category: "AI", difficulty: "Medium" },
      { value: "recommendation systems", category: "AI", difficulty: "Medium" },
      { value: "predictive analytics", category: "AI", difficulty: "Medium" }
    ]
  },

  // Technologies
  {
    placeholderType: "technology",
    values: [
      // Web/Frontend
      { value: "React", category: "Web", difficulty: "Medium" },
      { value: "Vue.js", category: "Web", difficulty: "Medium" },
      { value: "Angular", category: "Web", difficulty: "Hard" },
      { value: "JavaScript", category: "Web", difficulty: "Easy" },
      { value: "TypeScript", category: "Web", difficulty: "Medium" },
      { value: "Next.js", category: "Web", difficulty: "Medium" },
      { value: "Svelte", category: "Web", difficulty: "Medium" },
      { value: "HTML5", category: "Web", difficulty: "Easy" },
      { value: "CSS3", category: "Web", difficulty: "Easy" },
      { value: "Tailwind CSS", category: "Web", difficulty: "Easy" },
      { value: "Redux", category: "Web", difficulty: "Medium" },
      { value: "GraphQL", category: "Web", difficulty: "Medium" },
      
      // Backend
      { value: "Node.js", category: "Backend", difficulty: "Medium" },
      { value: "Express.js", category: "Backend", difficulty: "Easy" },
      { value: "Python", category: "Backend", difficulty: "Easy" },
      { value: "Django", category: "Backend", difficulty: "Medium" },
      { value: "Flask", category: "Backend", difficulty: "Easy" },
      { value: "FastAPI", category: "Backend", difficulty: "Medium" },
      { value: "Java Spring Boot", category: "Backend", difficulty: "Hard" },
      { value: "Ruby on Rails", category: "Backend", difficulty: "Medium" },
      { value: "Go", category: "Backend", difficulty: "Medium" },
      { value: ".NET Core", category: "Backend", difficulty: "Hard" },
      { value: "Rust", category: "Backend", difficulty: "Hard" },
      
      // Mobile
      { value: "React Native", category: "Mobile", difficulty: "Medium" },
      { value: "Flutter", category: "Mobile", difficulty: "Medium" },
      { value: "Swift", category: "Mobile", difficulty: "Medium" },
      { value: "SwiftUI", category: "Mobile", difficulty: "Medium" },
      { value: "Kotlin", category: "Mobile", difficulty: "Medium" },
      { value: "Jetpack Compose", category: "Mobile", difficulty: "Medium" },
      { value: "Xamarin", category: "Mobile", difficulty: "Hard" },
      { value: "Ionic", category: "Mobile", difficulty: "Medium" },
      
      // Database
      { value: "PostgreSQL", category: "Backend", difficulty: "Medium" },
      { value: "MongoDB", category: "Backend", difficulty: "Medium" },
      { value: "MySQL", category: "Backend", difficulty: "Easy" },
      { value: "Redis", category: "Backend", difficulty: "Medium" },
      { value: "Cassandra", category: "Backend", difficulty: "Hard" },
      { value: "DynamoDB", category: "Cloud", difficulty: "Medium" },
      { value: "Elasticsearch", category: "Backend", difficulty: "Hard" },
      
      // DevOps/Cloud
      { value: "Docker", category: "DevOps", difficulty: "Medium" },
      { value: "Kubernetes", category: "DevOps", difficulty: "Hard" }, { value: "AWS", category: "Cloud", difficulty: "Hard" },
      { value: "Azure", category: "Cloud", difficulty: "Hard" },
      { value: "Google Cloud Platform", category: "Cloud", difficulty: "Hard" },
      { value: "Terraform", category: "DevOps", difficulty: "Hard" },
      { value: "Jenkins", category: "DevOps", difficulty: "Medium" },
      { value: "GitHub Actions", category: "DevOps", difficulty: "Easy" },
      { value: "CircleCI", category: "DevOps", difficulty: "Medium" },
      { value: "Ansible", category: "DevOps", difficulty: "Medium" },
      { value: "Prometheus", category: "DevOps", difficulty: "Hard" },
      { value: "Grafana", category: "DevOps", difficulty: "Medium" },
      
      // AI/ML
      { value: "TensorFlow", category: "AI", difficulty: "Medium" },
      { value: "PyTorch", category: "AI", difficulty: "Medium" },
      { value: "scikit-learn", category: "AI", difficulty: "Easy" },
      { value: "Keras", category: "AI", difficulty: "Easy" },
      { value: "Hugging Face", category: "AI", difficulty: "Medium" },
      { value: "LangChain", category: "AI", difficulty: "Medium" },
      { value: "OpenAI API", category: "AI", difficulty: "Medium" },
      { value: "MLflow", category: "AI", difficulty: "Medium" },
      { value: "Weights & Biases", category: "AI", difficulty: "Medium" },
      { value: "ONNX", category: "AI", difficulty: "Hard" },
      { value: "JAX", category: "AI", difficulty: "Hard" },
      { value: "spaCy", category: "AI", difficulty: "Medium" },
      { value: "NLTK", category: "AI", difficulty: "Easy" },
      { value: "OpenCV", category: "AI", difficulty: "Medium" },
      { value: "Apache Spark", category: "AI", difficulty: "Hard" },
      
      // Security
      { value: "OAuth 2.0", category: "Security", difficulty: "Medium" },
      { value: "JWT", category: "Security", difficulty: "Easy" },
      { value: "SSL/TLS", category: "Security", difficulty: "Medium" },
      { value: "Vault", category: "Security", difficulty: "Hard" },
      { value: "OWASP", category: "Security", difficulty: "Medium" },
      
      // Testing/QA
      { value: "Jest", category: "QA", difficulty: "Easy" },
      { value: "Selenium", category: "QA", difficulty: "Medium" },
      { value: "Cypress", category: "QA", difficulty: "Medium" },
      { value: "JUnit", category: "QA", difficulty: "Easy" },
      { value: "PyTest", category: "QA", difficulty: "Easy" },
      { value: "Postman", category: "QA", difficulty: "Easy" },
      
      // Blockchain
      { value: "Ethereum", category: "Blockchain", difficulty: "Hard" },
      { value: "Solidity", category: "Blockchain", difficulty: "Hard" },
      { value: "Hyperledger", category: "Blockchain", difficulty: "Hard" },
      { value: "Web3.js", category: "Blockchain", difficulty: "Medium" },
      
      // AR/VR
      { value: "Unity", category: "AR/VR", difficulty: "Medium" },
      { value: "Unreal Engine", category: "AR/VR", difficulty: "Hard" },
      { value: "ARKit", category: "AR/VR", difficulty: "Medium" },
      { value: "ARCore", category: "AR/VR", difficulty: "Medium" },
      { value: "WebXR", category: "AR/VR", difficulty: "Hard" }
    ]
  },

  // Scenarios
  {
    placeholderType: "scenario",
    values: [
      // General software scenarios
      { value: "server crashes during deployment", category: "DevOps", difficulty: "Hard" },
      { value: "conflicting requirements from stakeholders", category: "Communication", difficulty: "Medium" },
      { value: "tight project deadline", category: "Time Management", difficulty: "Medium" },
      { value: "critical bug in production", category: "Problem Solving", difficulty: "Hard" },
      { value: "team member disagreement on approach", category: "Teamwork", difficulty: "Medium" },
      { value: "scope changes mid-project", category: "Adaptability", difficulty: "Medium" },
      { value: "performance degradation", category: "Performance", difficulty: "Hard" },
      { value: "security vulnerability discovered", category: "Security", difficulty: "Hard" },
      
      // Mobile scenarios
      { value: "app crashes on specific device models", category: "Mobile", difficulty: "Hard" },
      { value: "high battery consumption issues", category: "Mobile", difficulty: "Medium" },
      { value: "app store rejection", category: "Mobile", difficulty: "Medium" },
      { value: "poor network connectivity handling", category: "Mobile", difficulty: "Medium" },
      
      // Frontend scenarios
      { value: "layout breaking on different screen sizes", category: "Web", difficulty: "Medium" },
      { value: "slow page load times", category: "Web", difficulty: "Hard" },
      { value: "memory leaks in SPA", category: "Web", difficulty: "Hard" },
      { value: "accessibility compliance issues", category: "Web", difficulty: "Medium" },
      
      // Backend scenarios
      { value: "database connection pool exhaustion", category: "Backend", difficulty: "Hard" },
      { value: "API rate limit exceeded", category: "Backend", difficulty: "Medium" },
      { value: "data inconsistency across microservices", category: "Backend", difficulty: "Hard" },
      { value: "slow database queries", category: "Backend", difficulty: "Medium" },
      
      // AI/ML scenarios
      { value: "model performs well in training but poorly in production", category: "AI", difficulty: "Hard" },
      { value: "dataset has significant class imbalance", category: "AI", difficulty: "Medium" },
      { value: "training loss plateaus during optimization", category: "AI", difficulty: "Medium" },
      { value: "model predictions show bias", category: "AI", difficulty: "Hard" },
      { value: "inference latency is too high", category: "AI", difficulty: "Hard" },
      { value: "training data contains mislabeled examples", category: "AI", difficulty: "Medium" },
      { value: "model size exceeds deployment constraints", category: "AI", difficulty: "Hard" },
      
      // DevOps/Cloud scenarios
      { value: "failed deployment rollback", category: "DevOps", difficulty: "Hard" },
      { value: "cloud costs spiraling out of control", category: "Cloud", difficulty: "Hard" },
      { value: "container orchestration failure", category: "DevOps", difficulty: "Hard" },
      { value: "monitoring alert fatigue", category: "DevOps", difficulty: "Medium" },
      
      // Security scenarios
      { value: "SQL injection vulnerability", category: "Security", difficulty: "Hard" },
      { value: "exposed API keys in repository", category: "Security", difficulty: "Medium" },
      { value: "DDoS attack", category: "Security", difficulty: "Hard" },
      { value: "data breach detected", category: "Security", difficulty: "Hard" },
      
      // QA scenarios
      { value: "flaky tests in CI pipeline", category: "QA", difficulty: "Medium" },
      { value: "test coverage below threshold", category: "QA", difficulty: "Easy" },
      { value: "production bug missed by testing", category: "QA", difficulty: "Hard" },
      
      // Management scenarios
      { value: "team burnout during crunch time", category: "Management", difficulty: "Hard" },
      { value: "technical debt accumulation", category: "Management", difficulty: "Medium" },
      { value: "cross-team dependency delays", category: "Management", difficulty: "Medium" }
    ]
  },

  // Roles
  {
    placeholderType: "role",
    values: [
      // General roles
      { value: "Software Engineer", category: "General", difficulty: "Any" },
      { value: "Senior Software Engineer", category: "General", difficulty: "Any" },
      { value: "Staff Engineer", category: "General", difficulty: "Any" },
      { value: "Principal Engineer", category: "General", difficulty: "Any" },
      
      // Frontend
      { value: "Frontend Developer", category: "Web", difficulty: "Any" },
      { value: "Senior Frontend Engineer", category: "Web", difficulty: "Any" },
      { value: "UI Engineer", category: "Web", difficulty: "Any" },
      
      // Backend
      { value: "Backend Developer", category: "Backend", difficulty: "Any" },
      { value: "Senior Backend Engineer", category: "Backend", difficulty: "Any" },
      { value: "API Developer", category: "Backend", difficulty: "Any" },
      
      // Full Stack
      { value: "Full Stack Developer", category: "General", difficulty: "Any" },
      { value: "Full Stack Engineer", category: "General", difficulty: "Any" },
      
      // Mobile
      { value: "Mobile Engineer", category: "Mobile", difficulty: "Any" },
      { value: "iOS Developer", category: "Mobile", difficulty: "Any" },
      { value: "Android Developer", category: "Mobile", difficulty: "Any" },
      
      // DevOps/Cloud/SRE
      { value: "DevOps Engineer", category: "DevOps", difficulty: "Any" },
      { value: "Cloud Engineer", category: "Cloud", difficulty: "Any" },
      { value: "Site Reliability Engineer", category: "DevOps", difficulty: "Any" },
      { value: "Platform Engineer", category: "DevOps", difficulty: "Any" },
      
      // Data
      { value: "Data Engineer", category: "Backend", difficulty: "Any" },
      { value: "Data Scientist", category: "AI", difficulty: "Any" },
      { value: "ML Engineer", category: "AI", difficulty: "Any" },
      { value: "AI Engineer", category: "AI", difficulty: "Any" },
      
      // Security/QA
      { value: "Security Engineer", category: "Security", difficulty: "Any" },
      { value: "QA Engineer", category: "QA", difficulty: "Any" },
      { value: "Test Automation Engineer", category: "QA", difficulty: "Any" },
      
      // Leadership
      { value: "Tech Lead", category: "Leadership", difficulty: "Any" },
      { value: "Engineering Manager", category: "Management", difficulty: "Any" },
      { value: "Technical Program Manager", category: "Management", difficulty: "Any" },
      { value: "Software Architect", category: "Architecture", difficulty: "Any" },
      
      // Specialized
      { value: "Blockchain Developer", category: "Blockchain", difficulty: "Any" },
      { value: "AR/VR Engineer", category: "AR/VR", difficulty: "Any" },
      { value: "Game Developer", category: "AR/VR", difficulty: "Any" }
    ]
  },

  // Challenges
  {
    placeholderType: "challenge",
    values: [
      // General challenges
      { value: "legacy code refactoring", category: "Backend", difficulty: "Hard" },
      { value: "performance optimization", category: "Performance", difficulty: "Hard" },
      { value: "integrating third-party APIs", category: "Backend", difficulty: "Medium" },
      { value: "implementing real-time features", category: "Web", difficulty: "Medium" },
      { value: "database migration", category: "Backend", difficulty: "Hard" },
      { value: "scaling the application", category: "Architecture", difficulty: "Hard" },
      
      // Mobile challenges
      { value: "cross-platform compatibility", category: "Mobile", difficulty: "Hard" },
      { value: "optimizing app size", category: "Mobile", difficulty: "Medium" },
      { value: "handling different screen densities", category: "Mobile", difficulty: "Medium" },
      { value: "managing app permissions", category: "Mobile", difficulty: "Easy" },
      
      // Frontend challenges
      { value: "cross-browser compatibility", category: "Web", difficulty: "Medium" },
      { value: "managing state in large apps", category: "Web", difficulty: "Hard" },
      { value: "optimizing bundle size", category: "Web", difficulty: "Medium" },
      { value: "implementing accessibility", category: "Web", difficulty: "Medium" },
      
      // Backend challenges
      { value: "handling high traffic loads", category: "Backend", difficulty: "Hard" },
      { value: "ensuring data consistency", category: "Backend", difficulty: "Hard" },
      { value: "managing database connections", category: "Backend", difficulty: "Medium" },
      { value: "API versioning strategy", category: "Backend", difficulty: "Medium" },
      
      // AI/ML challenges
      { value: "hyperparameter tuning at scale", category: "AI", difficulty: "Hard" },
      { value: "handling catastrophic forgetting", category: "AI", difficulty: "Hard" },
      { value: "debugging gradient vanishing issues", category: "AI", difficulty: "Hard" },
      { value: "reducing model inference latency", category: "AI", difficulty: "Medium" },
      { value: "collecting and labeling training data", category: "AI", difficulty: "Medium" },
      { value: "deploying models across different hardware", category: "AI", difficulty: "Hard" },
      { value: "monitoring model drift in production", category: "AI", difficulty: "Medium" },
      
      // DevOps/Cloud challenges
      { value: "achieving zero-downtime deployments", category: "DevOps", difficulty: "Hard" },
      { value: "managing infrastructure as code", category: "DevOps", difficulty: "Medium" },
      { value: "optimizing cloud costs", category: "Cloud", difficulty: "Hard" },
      { value: "implementing disaster recovery", category: "Cloud", difficulty: "Hard" },
      { value: "container security", category: "DevOps", difficulty: "Hard" },
      
      // Security challenges
      { value: "preventing SQL injection", category: "Security", difficulty: "Medium" },
      { value: "implementing zero-trust architecture", category: "Security", difficulty: "Hard" },
      { value: "managing secrets and credentials", category: "Security", difficulty: "Medium" },
      { value: "compliance with GDPR", category: "Security", difficulty: "Hard" },
      
      // QA challenges
      { value: "achieving high test coverage", category: "QA", difficulty: "Medium" },
      { value: "eliminating flaky tests", category: "QA", difficulty: "Medium" },
      { value: "testing asynchronous code", category: "QA", difficulty: "Hard" },
      { value: "performance regression testing", category: "QA", difficulty: "Hard" },
      
      // Management challenges
      { value: "balancing technical debt and features", category: "Management", difficulty: "Hard" },
      { value: "coordinating cross-functional teams", category: "Management", difficulty: "Medium" },
      { value: "estimating project timelines", category: "Management", difficulty: "Medium" }
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
      { value: "JavaScript", category: "Web", difficulty: "Easy" },
      { value: "Python", category: "Backend", difficulty: "Easy" },
      { value: "Java", category: "Backend", difficulty: "Medium" },
      { value: "TypeScript", category: "Web", difficulty: "Medium" },
      { value: "C++", category: "Backend", difficulty: "Hard" },
      { value: "Go", category: "Backend", difficulty: "Medium" },
      { value: "Python", category: "AI", difficulty: "Easy" },
      { value: "R", category: "AI", difficulty: "Medium" },
      { value: "Julia", category: "AI", difficulty: "Hard" }
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
      // General actions
      { value: "led a team project", category: "Leadership", difficulty: "Medium" },
      { value: "solved a complex technical problem", category: "Problem Solving", difficulty: "Hard" },
      { value: "improved system performance", category: "Performance", difficulty: "Medium" },
      { value: "mentored a junior developer", category: "Communication", difficulty: "Easy" },
      { value: "handled a production issue", category: "Problem Solving", difficulty: "Hard" },
      // AI/ML actions
      { value: "optimized model training pipelines", category: "AI", difficulty: "Medium" },
      { value: "deployed machine learning models to production", category: "AI", difficulty: "Hard" },
      { value: "conducted A/B testing for model variants", category: "AI", difficulty: "Medium" },
      { value: "debugged model performance issues", category: "AI", difficulty: "Hard" },
      { value: "fine-tuned large language models", category: "AI", difficulty: "Hard" },
      { value: "implemented model versioning and monitoring", category: "AI", difficulty: "Medium" }
    ]
  },

  // Missing placeholder types that were referenced in templates
  {
    placeholderType: "concept1",
    values: [
      // General concepts
      { value: "inheritance", category: "OOP", difficulty: "Easy" },
      { value: "encapsulation", category: "OOP", difficulty: "Easy" },
      { value: "abstraction", category: "OOP", difficulty: "Medium" },
      { value: "polymorphism", category: "OOP", difficulty: "Medium" },
      { value: "caching", category: "Performance", difficulty: "Hard" },
      { value: "authentication", category: "Security", difficulty: "Medium" },
      // AI/ML concepts
      { value: "supervised learning", category: "AI", difficulty: "Easy" },
      { value: "CNNs", category: "AI", difficulty: "Medium" },
      { value: "batch gradient descent", category: "AI", difficulty: "Medium" },
      { value: "precision", category: "AI", difficulty: "Easy" },
      { value: "L1 regularization", category: "AI", difficulty: "Medium" },
      { value: "RNNs", category: "AI", difficulty: "Medium" }
    ]
  },

  {
    placeholderType: "concept2",
    values: [
      // General concepts
      { value: "composition", category: "OOP", difficulty: "Medium" },
      { value: "dependency injection", category: "Architecture", difficulty: "Hard" },
      { value: "microservices", category: "Architecture", difficulty: "Hard" },
      { value: "api design", category: "Backend", difficulty: "Medium" },
      { value: "database design", category: "Database", difficulty: "Medium" },
      // AI/ML concepts
      { value: "unsupervised learning", category: "AI", difficulty: "Easy" },
      { value: "Transformers", category: "AI", difficulty: "Medium" },
      { value: "stochastic gradient descent", category: "AI", difficulty: "Medium" },
      { value: "recall", category: "AI", difficulty: "Easy" },
      { value: "L2 regularization", category: "AI", difficulty: "Medium" },
      { value: "LSTMs", category: "AI", difficulty: "Medium" }
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
      // Web frameworks
      { value: "React", category: "Web", difficulty: "Medium" },
      { value: "Vue.js", category: "Web", difficulty: "Medium" },
      { value: "Angular", category: "Web", difficulty: "Hard" },
      { value: "Express.js", category: "Backend", difficulty: "Easy" },
      // AI/ML frameworks
      { value: "TensorFlow", category: "AI", difficulty: "Medium" },
      { value: "PyTorch", category: "AI", difficulty: "Medium" },
      { value: "scikit-learn", category: "AI", difficulty: "Easy" },
      { value: "Hugging Face", category: "AI", difficulty: "Medium" },
      { value: "FastAPI", category: "AI", difficulty: "Medium" },
      { value: "Keras", category: "AI", difficulty: "Easy" }
    ]
  },

  {
    placeholderType: "task",
    values: [
      // General tasks
      { value: "implementing a new feature", category: "General", difficulty: "Medium" },
      { value: "fixing a critical bug", category: "Problem Solving", difficulty: "Hard" },
      { value: "optimizing database queries", category: "Performance", difficulty: "Hard" },
      { value: "conducting code review", category: "General", difficulty: "Easy" },
      // AI/ML tasks
      { value: "training a deep learning model", category: "AI", difficulty: "Medium" },
      { value: "evaluating model performance", category: "AI", difficulty: "Medium" },
      { value: "preprocessing large datasets", category: "AI", difficulty: "Medium" },
      { value: "deploying models to production", category: "AI", difficulty: "Hard" },
      { value: "implementing feature extraction", category: "AI", difficulty: "Medium" },
      { value: "optimizing model hyperparameters", category: "AI", difficulty: "Hard" }
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
      // Web/Frontend features
      { value: "user authentication", category: "Security", difficulty: "Medium" },
      { value: "responsive design", category: "Web", difficulty: "Easy" },
      { value: "real-time chat", category: "Web", difficulty: "Hard" },
      { value: "infinite scrolling", category: "Web", difficulty: "Medium" },
      { value: "drag-and-drop interface", category: "Web", difficulty: "Medium" },
      { value: "PWA offline support", category: "Web", difficulty: "Hard" },
      { value: "server-side rendering", category: "Web", difficulty: "Hard" },
      
      // Backend features
      { value: "RESTful API", category: "Backend", difficulty: "Medium" },
      { value: "GraphQL API", category: "Backend", difficulty: "Hard" },
      { value: "file upload system", category: "Backend", difficulty: "Easy" },
      { value: "real-time updates", category: "Backend", difficulty: "Hard" },
      { value: "caching layer", category: "Backend", difficulty: "Medium" },
      { value: "rate limiting", category: "Backend", difficulty: "Medium" },
      { value: "message queue", category: "Backend", difficulty: "Hard" },
      { value: "microservices architecture", category: "Backend", difficulty: "Hard" },
      
      // Mobile features
      { value: "push notifications", category: "Mobile", difficulty: "Medium" },
      { value: "offline data sync", category: "Mobile", difficulty: "Hard" },
      { value: "biometric authentication", category: "Mobile", difficulty: "Medium" },
      { value: "camera integration", category: "Mobile", difficulty: "Medium" },
      { value: "geolocation tracking", category: "Mobile", difficulty: "Medium" },
      { value: "in-app purchases", category: "Mobile", difficulty: "Hard" },
      
      // AI/ML features
      { value: "image classification model", category: "AI", difficulty: "Medium" },
      { value: "sentiment analysis system", category: "AI", difficulty: "Medium" },
      { value: "text generation pipeline", category: "AI", difficulty: "Hard" },
      { value: "object detection model", category: "AI", difficulty: "Hard" },
      { value: "recommendation engine", category: "AI", difficulty: "Medium" },
      { value: "anomaly detection system", category: "AI", difficulty: "Hard" },
      { value: "chatbot with NLP", category: "AI", difficulty: "Medium" },
      { value: "time series forecasting model", category: "AI", difficulty: "Medium" },
      { value: "face recognition system", category: "AI", difficulty: "Hard" },
      { value: "speech-to-text pipeline", category: "AI", difficulty: "Hard" },
      
      // DevOps/Cloud features
      { value: "CI/CD pipeline", category: "DevOps", difficulty: "Medium" },
      { value: "auto-scaling infrastructure", category: "Cloud", difficulty: "Hard" },
      { value: "monitoring and alerting", category: "DevOps", difficulty: "Medium" },
      { value: "disaster recovery plan", category: "Cloud", difficulty: "Hard" },
      { value: "blue-green deployment", category: "DevOps", difficulty: "Hard" },
      
      // Security features
      { value: "two-factor authentication", category: "Security", difficulty: "Medium" },
      { value: "encryption at rest", category: "Security", difficulty: "Hard" },
      { value: "API key management", category: "Security", difficulty: "Medium" },
      { value: "penetration testing", category: "Security", difficulty: "Hard" },
      
      // QA features
      { value: "automated test suite", category: "QA", difficulty: "Medium" },
      { value: "load testing framework", category: "QA", difficulty: "Hard" },
      { value: "visual regression testing", category: "QA", difficulty: "Medium" },
      
      // Blockchain features
      { value: "smart contract", category: "Blockchain", difficulty: "Hard" },
      { value: "NFT marketplace", category: "Blockchain", difficulty: "Hard" },
      { value: "decentralized storage", category: "Blockchain", difficulty: "Hard" },
      
      // AR/VR features
      { value: "3D object tracking", category: "AR/VR", difficulty: "Hard" },
      { value: "spatial audio", category: "AR/VR", difficulty: "Medium" },
      { value: "hand gesture recognition", category: "AR/VR", difficulty: "Hard" }
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

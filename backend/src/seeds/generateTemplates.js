// Script to generate comprehensive question templates
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const categories = [
  // AI & Data
  { name: "Machine Learning Engineering", skill: "ML", skillMappings: ["Machine Learning", "AI", "Deep Learning", "Neural Networks", "NLP", "Computer Vision"] },
  { name: "Data Science", skill: "Data Science", skillMappings: ["Data Science", "Statistics", "Analytics", "Machine Learning", "Python"] },
  { name: "Data Engineering", skill: "Data Engineering", skillMappings: ["Data Engineering", "ETL", "Pipelines", "Big Data", "Spark"] },
  // Web & Frontend
  { name: "Frontend Development", skill: "Frontend", skillMappings: ["Frontend", "React", "Vue", "Angular", "TypeScript"] },
  { name: "Web Development", skill: "Web", skillMappings: ["Web Development", "HTML", "CSS", "JavaScript", "Responsive Design"] },
  { name: "Full Stack Development", skill: "Full Stack", skillMappings: ["Full Stack", "Frontend", "Backend", "REST API", "Databases"] },
  // Backend & APIs
  { name: "Backend Development", skill: "Backend", skillMappings: ["Backend", "API", "Microservices", "Databases", "Node.js"] },
  { name: "API Engineering", skill: "API", skillMappings: ["API", "REST", "GraphQL", "gRPC", "API Gateway"] },
  // Mobile
  { name: "Mobile Development", skill: "Mobile", skillMappings: ["Mobile Development", "React Native", "Flutter", "Cross-Platform"] },
  { name: "Android Development", skill: "Android", skillMappings: ["Android", "Kotlin", "Java", "Jetpack Compose", "Android SDK"] },
  { name: "iOS Development", skill: "iOS", skillMappings: ["iOS", "Swift", "SwiftUI", "UIKit", "Xcode"] },
  // Infrastructure
  { name: "DevOps", skill: "DevOps", skillMappings: ["DevOps", "CI/CD", "Docker", "Kubernetes", "Terraform"] },
  { name: "Cloud Engineering", skill: "Cloud", skillMappings: ["Cloud", "AWS", "Azure", "GCP", "Serverless"] },
  { name: "Site Reliability Engineering", skill: "SRE", skillMappings: ["SRE", "Reliability", "Monitoring", "Observability"] },
  // Specialized
  { name: "Security Engineering", skill: "Security", skillMappings: ["Security", "AppSec", "Pentesting", "OWASP"] },
  { name: "Quality Assurance", skill: "QA", skillMappings: ["QA", "Testing", "Automation", "Selenium", "Cypress"] },
  { name: "Software Architecture", skill: "Architecture", skillMappings: ["Architecture", "Design Patterns", "Scalability", "Microservices"] },
  { name: "Blockchain Development", skill: "Blockchain", skillMappings: ["Blockchain", "Smart Contracts", "Solidity", "Web3", "DeFi"] },
  { name: "AR/VR Development", skill: "AR/VR", skillMappings: ["AR/VR", "Unity", "Unreal", "3D Graphics", "XR"] },
  // Leadership & Management
  { name: "Technical Leadership", skill: "Tech Lead", skillMappings: ["Technical Leadership", "Code Review", "Mentoring", "Architecture Decisions"] },
  { name: "Engineering Management", skill: "Eng Management", skillMappings: ["Engineering Management", "Team Building", "Agile", "OKRs"] },
  { name: "Technical Program Management", skill: "TPM", skillMappings: ["Program Management", "Cross-functional", "Roadmap", "Stakeholder Management"] },
  // Other Engineering
  { name: "Developer Experience", skill: "DX", skillMappings: ["Developer Experience", "Internal Tools", "SDKs", "Documentation"] },
  { name: "Product Engineering", skill: "Product", skillMappings: ["Product Engineering", "Feature Development", "A/B Testing", "User Stories"] },
  { name: "Software Engineering", skill: "General", skillMappings: ["Programming", "Development", "Algorithms", "Data Structures"] },
];

const easyTemplates = [
  "What is {concept} in {technology}?",
  "Explain {feature} basics",
  "Describe {concept} fundamentals",
  "What tools support {technology}?",
  "How does {concept} work?",
  "What are {feature} benefits?",
  "When should you use {technology}?",
  "Explain the purpose of {feature}",
  "What is the difference between {concept1} and {concept2}?",
  "Describe a real-world use case for {feature}",
];

const mediumTemplates = [
  "How would you implement {feature} using {technology}?",
  "What are best practices for {concept}?",
  "How would you optimize {feature}?",
  "Explain {concept} design patterns",
  "What approach works for {feature}?",
  "How do you handle {concept}?",
  "What strategy ensures {feature} quality?",
  "How would you build {feature}?",
  "Explain {concept} testing strategies",
"How do you debug {feature} issues?",
  "What tools streamline {concept}?",
  "How would you secure {feature}?",
];

const hardTemplates = [
  "Describe debugging a {scenario}",
  "How would you architect {feature} for scale?",
  "Design a solution for {scenario}",
  "How would you resolve {scenario}?",
  "Walk through solving {scenario}",
  "How would you migrate {feature}?",
  "Describe building {feature} from scratch",
  "How would you handle {scenario} in production?",
  "Design an end-to-end solution for {feature}",
  "How would you optimize {scenario}?",
];

// Generate templates
const templates = [];

categories.forEach(category => {
  // Easy (10 templates per category)
  easyTemplates.forEach(template => {
    templates.push({
      text: template,
      type: "Conceptual",
      difficulty: "Easy",
      category: category.name,
      skill: category.skill,
      skillMappings: category.skillMappings
    });
  });
  
  // Medium (12 templates per category)
  mediumTemplates.forEach(template => {
    templates.push({
      text: template,
      type: "Technical",
      difficulty: "Medium",
      category: category.name,
      skill: category.skill,
      skillMappings: category.skillMappings
    });
  });
  
  // Hard (10 templates per category)
  hardTemplates.forEach(template => {
    templates.push({
      text: template,
      type: "Scenario",
      difficulty: "Hard",
      category: category.name,
      skill: category.skill,
      skillMappings: category.skillMappings
    });
  });
});

// Write to file
const outputContent = `// AUTO-GENERATED: Comprehensive Question Templates
// Generated ${templates.length} templates across ${categories.length} categories
// Each category: 10 Easy + 12 Medium + 10 Hard = 32 templates

export const COMPREHENSIVE_TEMPLATES = ${JSON.stringify(templates, null, 2)};
`;

const outputPath = path.join(__dirname, 'questionTemplates.js');
fs.writeFileSync(outputPath, outputContent);

console.log(`✅ Generated ${templates.length} templates`);
console.log(`📁 Saved to: ${outputPath}`);
console.log(`\nBreakdown:`);
console.log(`  Easy: ${templates.filter(t => t.difficulty === 'Easy').length}`);
console.log(`  Medium: ${templates.filter(t => t.difficulty === 'Medium').length}`);
console.log(`  Hard: ${templates.filter(t => t.difficulty === 'Hard').length}`);

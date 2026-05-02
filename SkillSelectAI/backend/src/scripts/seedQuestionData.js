import mongoose from 'mongoose';
import dotenv from 'dotenv';
import QuestionTemplate from '../models/QuestionTemplate.js';
import ContentPool from '../models/ContentPool.js';
import { connectDB } from '../db.js';

dotenv.config();

const seedTemplates = [
  {
    text: 'Explain the concept of {concept} in {language} and provide an example.',
    type: 'Conceptual',
    difficulty: 'Easy',
    placeholders: ['concept', 'language'],
    category: 'Software Engineering',
  },
  {
    text: 'How would you implement {feature} in a {type} application?',
    type: 'Technical',
    difficulty: 'Medium',
    placeholders: ['feature', 'type'],
    category: 'Software Engineering',
  },
  {
    text: 'Describe a scenario where you would use {pattern} in a {language} application.',
    type: 'Scenario',
    difficulty: 'Medium',
    placeholders: ['pattern', 'language'],
    category: 'Software Engineering',
  },
  {
    text: 'What are the advantages and disadvantages of using {technology} in a {type} project?',
    type: 'Conceptual',
    difficulty: 'Hard',
    placeholders: ['technology', 'type'],
    category: 'Software Engineering',
  },
  {
    text: 'How would you optimize the performance of a {application} that is experiencing {issue}?',
    type: 'Scenario',
    difficulty: 'Hard',
    placeholders: ['application', 'issue'],
    category: 'Software Engineering',
  },
];

const seedContentPool = [
  {
    placeholderType: 'concept',
    values: [
      { value: 'closures', category: 'JavaScript', difficulty: 'Medium' },
      { value: 'promises', category: 'JavaScript', difficulty: 'Medium' },
      { value: 'hoisting', category: 'JavaScript', difficulty: 'Easy' },
      { value: 'prototypal inheritance', category: 'JavaScript', difficulty: 'Hard' },
      { value: 'virtual DOM', category: 'React', difficulty: 'Medium' },
      { value: 'hooks', category: 'React', difficulty: 'Medium' },
      { value: 'middleware', category: 'Node.js', difficulty: 'Medium' },
      { value: 'event loop', category: 'Node.js', difficulty: 'Hard' },
    ],
  },
  {
    placeholderType: 'language',
    values: [
      { value: 'JavaScript', category: 'General', difficulty: 'Any' },
      { value: 'TypeScript', category: 'General', difficulty: 'Any' },
      { value: 'Python', category: 'General', difficulty: 'Any' },
      { value: 'Java', category: 'General', difficulty: 'Any' },
    ],
  },
  {
    placeholderType: 'feature',
    values: [
      { value: 'user authentication', category: 'Backend', difficulty: 'Medium' },
      { value: 'real-time updates', category: 'Full Stack', difficulty: 'Hard' },
      { value: 'responsive design', category: 'Frontend', difficulty: 'Easy' },
      { value: 'API rate limiting', category: 'Backend', difficulty: 'Medium' },
      { value: 'state management', category: 'Frontend', difficulty: 'Medium' },
    ],
  },
  {
    placeholderType: 'pattern',
    values: [
      { value: 'MVC', category: 'Architecture', difficulty: 'Medium' },
      { value: 'Observer', category: 'Design Pattern', difficulty: 'Medium' },
      { value: 'Singleton', category: 'Design Pattern', difficulty: 'Easy' },
      { value: 'Factory', category: 'Design Pattern', difficulty: 'Medium' },
      { value: 'Redux', category: 'State Management', difficulty: 'Medium' },
    ],
  },
  {
    placeholderType: 'technology',
    values: [
      { value: 'GraphQL', category: 'Backend', difficulty: 'Medium' },
      { value: 'Docker', category: 'DevOps', difficulty: 'Hard' },
      { value: 'MongoDB', category: 'Database', difficulty: 'Medium' },
      { value: 'Redis', category: 'Database', difficulty: 'Medium' },
      { value: 'WebSockets', category: 'Networking', difficulty: 'Hard' },
    ],
  },
  {
    placeholderType: 'application',
    values: [
      { value: 'REST API', category: 'Backend', difficulty: 'Medium' },
      { value: 'single-page application', category: 'Frontend', difficulty: 'Medium' },
      { value: 'microservices architecture', category: 'Backend', difficulty: 'Hard' },
      { value: 'progressive web app', category: 'Frontend', difficulty: 'Hard' },
    ],
  },
  {
    placeholderType: 'issue',
    values: [
      { value: 'slow database queries', category: 'Performance', difficulty: 'Medium' },
      { value: 'high memory usage', category: 'Performance', difficulty: 'Hard' },
      { value: 'slow initial page load', category: 'Performance', difficulty: 'Medium' },
      { value: 'frequent re-renders', category: 'React', difficulty: 'Medium' },
    ],
  },
  {
    placeholderType: 'type',
    values: [
      { value: 'web', category: 'Application', difficulty: 'Any' },
      { value: 'mobile', category: 'Application', difficulty: 'Any' },
      { value: 'desktop', category: 'Application', difficulty: 'Any' },
      { value: 'enterprise', category: 'Application', difficulty: 'Any' },
    ],
  },
];

const seedDatabase = async () => {
  try {
    // Connect to the database
    await connectDB();
    console.log('Connected to database');

    // Clear existing data
    await Promise.all([
      QuestionTemplate.deleteMany({}),
      ContentPool.deleteMany({}),
    ]);
    console.log('Cleared existing data');

    // Insert templates
    const templates = await QuestionTemplate.insertMany(seedTemplates);
    console.log(`Inserted ${templates.length} question templates`);

    // Insert content pool data
    const contentPools = await ContentPool.insertMany(seedContentPool);
    console.log(`Inserted ${contentPools.length} content pool entries`);

    console.log('Database seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

// Run the seed function
seedDatabase();

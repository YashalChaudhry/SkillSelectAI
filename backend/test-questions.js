import mongoose from 'mongoose';
import Question from './src/models/Question.js';

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/skillselect')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Sample questions for testing
const sampleQuestions = [
  {
    jobId: '695fce45bf35963a233a690f',
    text: 'What is React and how does it work?',
    skill: 'React',
    difficulty: 'Easy',
    type: 'Technical',
    status: 'Pending'
  },
  {
    jobId: '695fce45bf35963a233a690f',
    text: 'Explain the difference between state and props in React.',
    skill: 'React',
    difficulty: 'Medium',
    type: 'Technical',
    status: 'Pending'
  },
  {
    jobId: '695fce45bf35963a233a690f',
    text: 'Describe a situation where you had to debug a complex React component.',
    skill: 'Problem Solving',
    difficulty: 'Hard',
    type: 'Scenario',
    status: 'Pending'
  },
  {
    jobId: '695fce45bf35963a233a690f',
    text: 'How do you handle state management in large React applications?',
    skill: 'React',
    difficulty: 'Medium',
    type: 'Conceptual',
    status: 'Approved'
  },
  {
    jobId: '695fce45bf35963a233a690f',
    text: 'What is your approach to writing clean and maintainable React code?',
    skill: 'Best Practices',
    difficulty: 'Medium',
    type: 'Behavioral',
    status: 'Rejected',
    rejectionReason: 'Too generic, need more specific technical details'
  }
];

// Insert sample questions
async function insertSampleQuestions() {
  try {
    await Question.deleteMany({}); // Clear existing questions
    const insertedQuestions = await Question.insertMany(sampleQuestions);
    console.log(`Successfully inserted ${insertedQuestions.length} sample questions`);
    process.exit(0);
  } catch (error) {
    console.error('Error inserting questions:', error);
    process.exit(1);
  }
}

insertSampleQuestions();

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Company = require('./models/Company');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const companies = [
  {
    name: 'Amazon',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg',
    rounds: ['Online Assessment', 'Technical Interview', 'Bar Raiser / Leadership Principles', 'Final Result'],
    skills: ['Data Structures', 'Algorithms', 'System Design', 'AWS', 'Leadership Principles'],
    questions: [
      'Tell me about a time you had to disagree with a manager.',
      'Design a scalable e-commerce checkout system.',
      'How would you implement a distributed caching mechanism?'
    ],
    difficulty: 'Hard',
    package: '32 - 45 LPA',
    eligibility: 'B.Tech/M.Tech/MCA (CGPA >= 7.0)',
    selectionRate: '1.2%',
    estimatedTime: '3-4 Weeks'
  },
  {
    name: 'Google',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg',
    rounds: ['Online Coding Assessment', 'DSA Interview', 'Problem Solving', 'Googliness / Behavioral', 'Final Result'],
    skills: ['Advanced Algorithms', 'Graph Theory', 'Dynamic Programming', 'System Design', 'Googliness'],
    questions: [
      'Design YouTube.',
      'Tell me about a time you failed and what you learned.',
      'How would you find the shortest path in a massive graph?'
    ],
    difficulty: 'Hard',
    package: '35 - 55 LPA',
    eligibility: 'B.Tech/M.Tech/Ph.D (No active backlogs)',
    selectionRate: '0.8%',
    estimatedTime: '4-6 Weeks'
  },
  {
    name: 'Microsoft',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/9/96/Microsoft_logo_%282012%29.svg',
    rounds: ['Online Assessment', 'Coding', 'Technical Interview', 'System Design (Role Based)', 'HR'],
    skills: ['C#', 'Azure', 'Object Oriented Design', 'Data Structures', 'Problem Solving'],
    questions: [
      'Design a file storage service like OneDrive.',
      'Write a function to detect a cycle in a linked list.',
      'Tell me about a project you are most proud of.'
    ],
    difficulty: 'Hard',
    package: '28 - 42 LPA',
    eligibility: 'B.Tech/M.Tech/MS (CGPA >= 8.0)',
    selectionRate: '1.5%',
    estimatedTime: '3 Weeks'
  },
  {
    name: 'Meta',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/7/7b/Meta_Platforms_Inc._logo.svg',
    rounds: ['Online Coding Assessment', 'Coding Interview 1', 'Coding Interview 2', 'System Design', 'Behavioral'],
    skills: ['React', 'Data Structures', 'System Design', 'Speed Coding', 'Culture Fit'],
    questions: [
      'Design Facebook Newsfeed.',
      'Merge K sorted lists.',
      'How do you handle conflict with a team member?'
    ],
    difficulty: 'Hard',
    package: '38 - 50 LPA',
    eligibility: 'B.Tech/M.Tech/MCA',
    selectionRate: '1.0%',
    estimatedTime: '3-4 Weeks'
  },
  {
    name: 'Adobe',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/d/da/Adobe_Corporate_Logo.svg',
    rounds: ['Online Assessment', 'Coding', 'Technical', 'HR'],
    skills: ['C++', 'Data Structures', 'Operating Systems', 'System Design', 'Algorithms'],
    questions: [
      'Implement an LRU Cache.',
      'How does memory allocation work in C++?',
      'Design a real-time collaborative document editor.'
    ],
    difficulty: 'Hard',
    package: '22 - 35 LPA',
    eligibility: 'B.Tech/M.Tech (CGPA >= 7.5)',
    selectionRate: '2.0%',
    estimatedTime: '2 Weeks'
  },
  {
    name: 'Oracle',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/5/50/Oracle_logo.svg',
    rounds: ['Coding + SQL Assessment', 'Technical', 'Managerial', 'HR'],
    skills: ['Database Internals', 'SQL Optimization', 'Java', 'Data Structures', 'OOPs'],
    questions: [
      'Explain B-Trees and B+ Trees indexing.',
      'Difference between TRUNCATE, DELETE, and DROP.',
      'Write a query to find the nth highest salary.'
    ],
    difficulty: 'Medium',
    package: '15 - 28 LPA',
    eligibility: 'B.Tech/M.Tech/MCA (CGPA >= 7.0)',
    selectionRate: '2.5%',
    estimatedTime: '2-3 Weeks'
  },
  {
    name: 'Salesforce',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/f/f9/Salesforce.com_logo.svg',
    rounds: ['Coding', 'Technical', 'Managerial', 'HR'],
    skills: ['APIs & Integration', 'Design Patterns', 'Cloud Computing', 'OOPs', 'Java/JavaScript'],
    questions: [
      'What are SOLID principles?',
      'Design a notification system.',
      'Explain MVC architecture.'
    ],
    difficulty: 'Medium',
    package: '18 - 32 LPA',
    eligibility: 'B.Tech/M.Tech/MCA (CGPA >= 7.5)',
    selectionRate: '2.2%',
    estimatedTime: '2 Weeks'
  },
  {
    name: 'Goldman Sachs',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/6/61/Goldman_Sachs.svg',
    rounds: ['Aptitude + Coding', 'Technical', 'HR'],
    skills: ['Probability & Stats', 'Quantitative Aptitude', 'Java', 'Concurrency', 'Algorithms'],
    questions: [
      'A coin is flipped until you get heads. What is the expected number of flips?',
      'How does garbage collection work in Java?',
      'Write a thread-safe Singleton class.'
    ],
    difficulty: 'Hard',
    package: '24 - 38 LPA',
    eligibility: 'B.Tech/M.Tech/M.Sc (CGPA >= 8.0)',
    selectionRate: '1.8%',
    estimatedTime: '3 Weeks'
  },
  {
    name: 'JPMorgan',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/9/92/Chase-JPMorgan-Logo.svg',
    rounds: ['Coding Assessment', 'Technical', 'Behavioral'],
    skills: ['Java/Python', 'SQL', 'Aptitude', 'Data Structures', 'Communication'],
    questions: [
      'Write a program to print the Fibonacci series using dynamic programming.',
      'Explain ACID properties in SQL.',
      'Tell me about a time you worked in a group to solve a problem.'
    ],
    difficulty: 'Medium',
    package: '12 - 20 LPA',
    eligibility: 'B.Tech/M.Tech/MCA/B.Sc (CGPA >= 7.0)',
    selectionRate: '3.5%',
    estimatedTime: '2 Weeks'
  },
  {
    name: 'TCS',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/b/b1/Tata_Consultancy_Services_Logo.svg',
    rounds: ['Aptitude', 'Verbal', 'Reasoning', 'Coding', 'Technical', 'Managerial', 'HR'],
    skills: ['Java', 'SQL', 'Aptitude', 'OOPs', 'Basic Data Structures'],
    questions: [
      'What are the 4 pillars of OOPs?',
      'Explain the difference between clustered and non-clustered index in SQL.',
      'Where do you see yourself in 5 years?'
    ],
    difficulty: 'Easy',
    package: '3.6 - 7.5 LPA',
    eligibility: 'All Graduates (CGPA >= 6.0, max 1 backlog)',
    selectionRate: '15.0%',
    estimatedTime: '1 Week'
  },
  {
    name: 'Infosys',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/9/95/Infosys_logo.svg',
    rounds: ['Aptitude', 'Coding', 'Technical', 'HR'],
    skills: ['Python', 'Java', 'SQL', 'DBMS', 'Software Engineering'],
    questions: [
      'What is normalization in DBMS?',
      'Write a program to reverse a string without using built-in functions.',
      'Why do you want to join Infosys?'
    ],
    difficulty: 'Easy',
    package: '3.6 - 8.0 LPA',
    eligibility: 'All Graduates (CGPA >= 6.0, no backlogs)',
    selectionRate: '12.0%',
    estimatedTime: '1 Week'
  },
  {
    name: 'Accenture',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/0/05/Accenture_logo.svg',
    rounds: ['Cognitive Assessment', 'Coding', 'Technical', 'HR'],
    skills: ['Cognitive Ability', 'Analytical Reasoning', 'Coding Basics', 'DBMS', 'OOPs'],
    questions: [
      'Explain SDLC phases.',
      'What is a primary key vs foreign key?',
      'Write code to check if a number is prime.'
    ],
    difficulty: 'Easy',
    package: '4.5 - 9.0 LPA',
    eligibility: 'B.Tech/M.Tech/MCA/M.Sc (CGPA >= 6.5)',
    selectionRate: '10.0%',
    estimatedTime: '1 Week'
  },
  {
    name: 'Capgemini',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/9/93/Capgemini_logo.svg',
    rounds: ['Game Based Aptitude', 'Coding', 'Technical', 'HR'],
    skills: ['Spatial Reasoning', 'Quick Maths', 'OOPs', 'SQL', 'Data Structures'],
    questions: [
      'Explain method overloading vs method overriding.',
      'What is a join in SQL? Explain types.',
      'Reverse words in a given string.'
    ],
    difficulty: 'Easy',
    package: '4.0 - 7.5 LPA',
    eligibility: 'All Science Graduates (CGPA >= 6.0)',
    selectionRate: '11.0%',
    estimatedTime: '1 Week'
  },
  {
    name: 'Wipro',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/9/90/Wipro_Logo_2017.svg',
    rounds: ['Aptitude', 'Coding', 'Technical', 'HR'],
    skills: ['Quantitative Aptitude', 'Coding Basics', 'Java/Python', 'DBMS', 'Communication'],
    questions: [
      'What is polymorphism?',
      'Write a query to find duplicates in a table.',
      'Explain the difference between stack and queue.'
    ],
    difficulty: 'Easy',
    package: '3.5 - 7.0 LPA',
    eligibility: 'All Graduates (CGPA >= 6.0)',
    selectionRate: '14.0%',
    estimatedTime: '1 Week'
  },
  {
    name: 'Cognizant',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/e/ea/Cognizant_logo_2022.svg',
    rounds: ['Aptitude', 'Coding', 'Technical', 'HR'],
    skills: ['Quantitative Aptitude', 'Logical Reasoning', 'OOPs', 'SQL', 'Web Tech'],
    questions: [
      'What is an abstract class vs interface?',
      'Explain standard database indexes.',
      'Explain the difference between GET and POST requests.'
    ],
    difficulty: 'Easy',
    package: '4.0 - 8.5 LPA',
    eligibility: 'B.Tech/M.Tech/MCA/M.Sc (CGPA >= 6.0)',
    selectionRate: '12.0%',
    estimatedTime: '1 Week'
  }
];

const seedCompanies = async () => {
  try {
    await Company.deleteMany({});
    console.log('Cleared existing companies');
    await Company.insertMany(companies);
    console.log('15 Companies with enhanced metadata seeded successfully!');
    process.exit();
  } catch (error) {
    console.error('Error seeding companies:', error);
    process.exit(1);
  }
};

seedCompanies();

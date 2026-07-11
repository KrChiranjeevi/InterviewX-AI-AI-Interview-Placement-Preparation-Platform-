const fs = require('fs');
const path = require('path');

const companiesList = [
  'Google', 'Amazon', 'Microsoft', 'Adobe', 'Facebook', 'Bloomberg', 
  'Uber', 'Apple', 'TCS', 'Infosys', 'Accenture', 'Wipro', 
  'Goldman Sachs', 'Flipkart', 'Atlassian', 'Netflix', 'Oracle', 'Salesforce', 'Capgemini'
];

const difficulties = ['Easy', 'Medium', 'Hard'];

const dsaTopics = [
  'Arrays', 'Strings', 'Linked List', 'Stack', 'Queue', 'HashMap', 'HashSet', 
  'Trees', 'BST', 'Heap', 'Trie', 'Graph', 'Greedy', 'Dynamic Programming', 
  'Backtracking', 'Sliding Window', 'Two Pointer', 'Bit Manipulation', 
  'Binary Search', 'Recursion', 'Sorting', 'Searching'
];

const categories = [
  { id: 'aptitude', name: 'Aptitude', topics: ['Puzzles', 'Math Puzzles', 'Logic Riddles', 'Analytical Reasoning'] },
  { id: 'quant', name: 'Quantitative Aptitude', topics: ['Time & Work', 'Speed & Distance', 'Probability', 'Permutations', 'Percentages', 'Profit & Loss', 'Ratios'] },
  { id: 'reasoning', name: 'Logical Reasoning', topics: ['Blood Relations', 'Seating Arrangement', 'Syllogism', 'Coding-Decoding', 'Series Completion', 'Clocks & Calendars'] },
  { id: 'verbal', name: 'Verbal Ability', topics: ['Synonyms & Antonyms', 'Sentence Correction', 'Reading Comprehension', 'Idioms & Phrases', 'Grammar Rules'] },
  { id: 'sql', name: 'SQL', topics: ['SELECT Queries', 'JOINs', 'Subqueries', 'Grouping & Aggregation', 'Window Functions', 'CTEs', 'Index Optimization'] },
  { id: 'dbms', name: 'DBMS', topics: ['Normalization', 'Transactions', 'Concurrency Control', 'Indexing', 'NoSQL Basics', 'ACID Properties'] },
  { id: 'os', name: 'Operating Systems', topics: ['Processes & Threads', 'Scheduling Algorithms', 'Memory Management', 'Deadlocks', 'Virtual Memory', 'File Systems'] },
  { id: 'cn', name: 'Computer Networks', topics: ['OSI Layer Model', 'TCP/IP Protocol', 'IP Addressing', 'Routing Algorithms', 'HTTP/HTTPS Protocols', 'DNS & Security'] },
  { id: 'oop', name: 'Object Oriented Programming', topics: ['Classes & Objects', 'Inheritance', 'Polymorphism', 'Encapsulation', 'Abstraction', 'SOLID Design Principles'] },
  { id: 'frontend', name: 'Frontend Development', topics: ['DOM Events', 'CSS Grid & Flexbox', 'Async Fetching', 'Webpack & Vite', 'Local Storage State', 'Web Accessibility'] },
  { id: 'backend', name: 'Backend Development', topics: ['REST API Routing', 'Middleware Pipes', 'Token Authentication', 'Rate Limiting', 'CORs Policies', 'Event Loops'] },
  { id: 'java', name: 'Java', topics: ['JVM Internals', 'Garbage Collectors', 'Multithreading', 'Collections Framework', 'Lambda Expressions', 'Stream APIs'] },
  { id: 'python', name: 'Python', topics: ['GIL Lock', 'Decorators', 'Generators & Iterators', 'List Comprehensions', 'Pandas & Data Science', 'Django Frameworks'] },
  { id: 'javascript', name: 'JavaScript', topics: ['Scope & Closures', 'Prototypal Chains', 'Promises & Async', 'Event Loops', 'Modules ES6', 'V8 Engines'] },
  { id: 'react', name: 'React', topics: ['Virtual DOM', 'React Hooks', 'Component Context', 'State Reducers', 'Reconciliation Algorithms', 'Next.js Routing'] },
  { id: 'node', name: 'Node.js', topics: ['Event Loop Stages', 'File Streams', 'Buffer Buffs', 'Cluster Scaling', 'Package Modules', 'Child Processes'] },
  { id: 'express', name: 'Express.js', topics: ['Routing Pipes', 'Custom Middleware', 'Error Handlers', 'Templating engines', 'Security Headers'] },
  { id: 'mongodb', name: 'MongoDB', topics: ['BSON Schema', 'Aggregations', 'Indexes', 'Sharding Clusters', 'Replication Sets', 'Mongoose Hooks'] },
  { id: 'system-design', name: 'System Design', topics: ['Load Balancers', 'Microservices Architecture', 'Database Sharding', 'Consistent Hashing', 'DNS & CDNs', 'Message Queues'] },
  { id: 'debugging', name: 'Debugging Challenges', topics: ['Syntax Errors', 'Null Pointer Dereference', 'Infinite Loops', 'Memory Leaks', 'State Updates', 'Off-by-One Errors'] }
];

const questions = [];

const getRandomElements = (arr, count) => {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

// 1. Generate DSA Questions (At least 100 questions covering all 22 topics)
let idCounter = 1;
dsaTopics.forEach(topic => {
  // Generate 5 questions per topic = 110 questions
  for (let i = 1; i <= 5; i++) {
    const diff = difficulties[Math.floor(Math.random() * difficulties.length)];
    const companies = getRandomElements(companiesList, getRandomInt(2, 5));
    questions.push({
      id: `dsa-gen-${idCounter++}`,
      category: 'dsa',
      title: `${topic} Challenge ${i}: Core Algorithm`,
      difficulty: diff,
      topic: topic,
      companies: companies,
      description: `Evaluate your skills in ${topic}. Write an optimized solution in your chosen language to solve this problem while meeting time and space limits.\n\nInput formats consist of standard arrays or object properties.`,
      examples: [
        {
          input: "dataset = [12, 34, 56, 78]",
          output: "target = 56",
          explanation: `A standard index check validation for ${topic}.`
        }
      ],
      constraints: ["Length of data is <= 10^5", "Values fit within 32-bit signed limits"],
      hints: [
        `Focus on the core properties of ${topic}.`,
        `Check edge case boundaries like empty inputs.`,
        `Identify if dynamic state changes help.`
      ],
      expectedComplexity: {
        time: diff === 'Easy' ? 'O(N)' : 'O(N log N)',
        space: 'O(1)'
      },
      starterCode: {
        javascript: 'function solution() {\n  // Write logic here\n}',
        python: 'def solution():\n    # Write logic here\n    pass',
        java: 'public class Solution {\n    public void solution() {\n        // Write logic here\n    }\n}',
        cpp: 'class Solution {\npublic:\n    void solution() {\n        // Write logic here\n    }\n};',
        sql: 'SELECT * FROM data;'
      }
    });
  }
});

// 2. Generate remaining categories (100 questions per category)
categories.forEach(cat => {
  let catCounter = 1;
  // We have a list of topics for this category. Let's loop and generate exactly 100 questions.
  for (let i = 1; i <= 100; i++) {
    const topic = cat.topics[i % cat.topics.length];
    const diff = difficulties[Math.floor(Math.random() * difficulties.length)];
    const companies = getRandomElements(companiesList, getRandomInt(2, 5));
    
    questions.push({
      id: `${cat.id}-gen-${catCounter++}`,
      category: cat.id,
      title: `${cat.name} Practice ${i}: ${topic} Essentials`,
      difficulty: diff,
      topic: topic,
      companies: companies,
      description: `Master ${topic} inside the ${cat.name} module. Solve this interview puzzle to check your placement preparation level.`,
      examples: [
        {
          input: "Sample setup constraints",
          output: "Verified simulation target output"
        }
      ],
      constraints: ["Strict constraints apply to verification logic."],
      hints: [
        `Think about common patterns in ${topic}.`,
        `Recall theoretical and logical frameworks.`
      ],
      expectedComplexity: {
        time: 'O(1)',
        space: 'O(1)'
      },
      starterCode: {
        javascript: '// JavaScript Starter Template\nconsole.log("Ready");',
        python: '# Python Template\nprint("Ready")',
        java: '// Java template\nSystem.out.println("Ready");',
        cpp: '// C++ Template\nstd::cout << "Ready";',
        sql: 'SELECT * FROM schema;'
      }
    });
  }
});

const fileContent = `export const extraQuestions = ${JSON.stringify(questions, null, 2)};\n`;

fs.writeFileSync(path.join(__dirname, 'src/data/extraQuestions.js'), fileContent);
console.log(`Generated ${questions.length} total questions into extraQuestions.js!`);

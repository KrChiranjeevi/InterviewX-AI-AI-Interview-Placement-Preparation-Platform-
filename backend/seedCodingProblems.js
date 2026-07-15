require('dotenv').config();
const mongoose = require('mongoose');
const CodingProblem = require('./models/CodingProblem');

const BASE_PROBLEMS = [
  // 0. Arrays
  {
    title: "Two Sum",
    category: "dsa",
    topics: ["Arrays", "Hash Table"],
    description: "Given an array of integers <code>nums</code> and an integer <code>target</code>, return indices of the two numbers such that they add up to <code>target</code>.",
    constraints: ["2 <= nums.length <= 10^4", "-10^9 <= nums[i] <= 10^9", "-10^9 <= target <= 10^9"],
    examples: [{ input: "nums = [2,7,11,15], target = 9", output: "[0,1]" }],
    testCases: [{ input: "[2,7,11,15]\n9", expectedOutput: "[0,1]" }],
    hints: ["Use a hash map to check target in O(1) time."],
    starterCode: { javascript: "function twoSum(nums, target) {\n    // Write code here\n}" }
  },
  // 1. Strings
  {
    title: "Valid Anagram",
    category: "dsa",
    topics: ["Strings", "Hash Table", "Sorting"],
    description: "Given two strings <code>s</code> and <code>t</code>, return <code>true</code> if <code>t</code> is an anagram of <code>s</code>, and <code>false</code> otherwise.",
    constraints: ["1 <= s.length, t.length <= 5 * 10^4"],
    examples: [{ input: "s = \"anagram\", t = \"nagaram\"", output: "true" }],
    testCases: [{ input: "\"anagram\"\n\"nagaram\"", expectedOutput: "true" }],
    hints: ["Compare character frequencies between strings."],
    starterCode: { javascript: "function isAnagram(s, t) {\n    // Write code here\n}" }
  },
  // 2. Hash Table
  {
    title: "Contains Duplicate",
    category: "dsa",
    topics: ["Arrays", "Hash Table"],
    description: "Given an integer array <code>nums</code>, return <code>true</code> if any value appears at least twice in the array, and return <code>false</code> if every element is distinct.",
    constraints: ["1 <= nums.length <= 10^5"],
    examples: [{ input: "nums = [1,2,3,1]", output: "true" }],
    testCases: [{ input: "[1,2,3,1]", expectedOutput: "true" }],
    hints: ["Use a HashSet to detect duplicate numbers."],
    starterCode: { javascript: "function containsDuplicate(nums) {\n    // Write code here\n}" }
  },
  // 3. Dynamic Programming
  {
    title: "Climbing Stairs",
    category: "dsa",
    topics: ["Dynamic Programming", "Math"],
    description: "You are climbing a staircase. It takes <code>n</code> steps to reach the top. Each time you can either climb 1 or 2 steps. In how many distinct ways can you climb to the top?",
    constraints: ["1 <= n <= 45"],
    examples: [{ input: "n = 3", output: "3" }],
    testCases: [{ input: "3", expectedOutput: "3" }],
    hints: ["Express relation as climb(n) = climb(n-1) + climb(n-2)."],
    starterCode: { javascript: "function climbStairs(n) {\n    // Write code here\n}" }
  },
  // 4. Tree
  {
    title: "Invert Binary Tree",
    category: "dsa",
    topics: ["Tree", "DFS"],
    description: "Given the <code>root</code> of a binary tree, invert the tree, and return its root.",
    constraints: ["The number of nodes in the tree is in the range [0, 100]."],
    examples: [{ input: "root = [4,2,7,1,3,6,9]", output: "[4,7,2,9,6,3,1]" }],
    testCases: [{ input: "[4,2,7,1,3,6,9]", expectedOutput: "[4,7,2,9,6,3,1]" }],
    hints: ["Swap left and right subtrees recursively."],
    starterCode: { javascript: "function invertTree(root) {\n    // Write code here\n}" }
  },
  // 5. Graphs
  {
    title: "Find Path in Graph",
    category: "dsa",
    topics: ["Graphs", "DFS", "BFS"],
    description: "Given a bi-directional graph, check if there exists a valid path between source and destination nodes.",
    constraints: ["1 <= vertices <= 10^4"],
    examples: [{ input: "n = 3, edges = [[0,1],[1,2]], source = 0, destination = 2", output: "true" }],
    testCases: [{ input: "3\n[[0,1],[1,2]]\n0\n2", expectedOutput: "true" }],
    hints: ["Apply BFS or DFS traversal from source node."],
    starterCode: { javascript: "function validPath(n, edges, source, destination) {\n    // Write code here\n}" }
  },
  // 6. SQL
  {
    title: "Big Countries SQL",
    category: "sql",
    topics: ["SQL"],
    description: "Write an SQL query to report the name, population, and area of the <b>big countries</b>.",
    constraints: ["World schema: name varchar, continent varchar, area int, population int"],
    examples: [{ input: "World Table", output: "Big countries data rows" }],
    testCases: [{ input: "SELECT name, population, area from World...", expectedOutput: "Big countries data" }],
    hints: ["Filter rows where area >= 3,000,000 OR population >= 25,000,000."],
    starterCode: { sql: "SELECT name, population, area\nFROM World\nWHERE area >= 3000000 OR population >= 25000000;" }
  },
  // 7. JavaScript
  {
    title: "Sleep Polyfill Closure",
    category: "javascript",
    topics: ["JavaScript"],
    description: "Write a JavaScript utility returning a promise resolving after designated milliseconds.",
    constraints: ["1 <= millis <= 5000"],
    examples: [{ input: "millis = 100", output: "Resolved after 100ms" }],
    testCases: [{ input: "100", expectedOutput: "Resolved" }],
    hints: ["Wrap a setTimeout call inside a new Promise definition."],
    starterCode: { javascript: "async function sleep(millis) {\n    return new Promise(resolve => setTimeout(resolve, millis));\n}" }
  }
];

const COMPANY_COUNTS = [
  { name: 'Google', count: 2300 },
  { name: 'Amazon', count: 1850 },
  { name: 'Microsoft', count: 1540 },
  { name: 'Meta', count: 1290 },
  { name: 'Apple', count: 980 },
  { name: 'Netflix', count: 720 },
  { name: 'Adobe', count: 540 },
  { name: 'Oracle', count: 480 },
  { name: 'Infosys', count: 410 },
  { name: 'TCS', count: 390 },
  { name: 'Accenture', count: 350 },
  { name: 'Flipkart', count: 280 },
  { name: 'PhonePe', count: 210 },
  { name: 'Meesho', count: 180 },
  { name: 'Uber', count: 320 },
  { name: 'Salesforce', count: 290 }
];

const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
};

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to Database');

    console.log('Clearing old Coding Problems...');
    await CodingProblem.deleteMany({});

    console.log('Generating exact company-specific problems in memory...');
    const problems = [];
    
    // We iterate through each requested company count
    for (let c of COMPANY_COUNTS) {
      console.log(`Generating ${c.count} questions for company: ${c.name}...`);
      
      for (let i = 1; i <= c.count; i++) {
        const base = BASE_PROBLEMS[i % BASE_PROBLEMS.length];
        
        // Variation difficulty: easy, medium, hard cycling
        const diff = ['Easy', 'Medium', 'Hard'][i % 3];
        
        // Roman numeral suffix
        const suffix = romanize(i);
        const title = `${base.title} - ${c.name} Series ${suffix}`;
        const slug = slugify(title);
        
        problems.push({
          title,
          slug,
          category: base.category,
          difficulty: diff,
          topics: base.topics, 
          companies: [c.name], // Set target company so it filters perfectly
          description: base.description,
          constraints: base.constraints,
          examples: base.examples,
          testCases: base.testCases,
          hints: base.hints,
          starterCode: base.starterCode,
          acceptanceRate: 35 + ((i * 13) % 45), // 35% to 80%
          totalSubmissions: 100 + ((i * 17) % 500),
          acceptedSubmissions: 40 + ((i * 11) % 200),
        });
      }
    }

    console.log(`Inserting all ${problems.length} problems into MongoDB (this may take a few seconds)...`);
    
    // Perform bulk inserts in batches of 1000 to avoid document payload limits
    const batchSize = 1000;
    for (let i = 0; i < problems.length; i += batchSize) {
      const batch = problems.slice(i, i + batchSize);
      await CodingProblem.insertMany(batch, { ordered: false });
      console.log(`Inserted batch ${i / batchSize + 1} of ${Math.ceil(problems.length / batchSize)}...`);
    }
    
    console.log('Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error during seeding:', error);
    process.exit(1);
  }
};

// Helper to convert index numbers to roman numerals
function romanize(num) {
  if (isNaN(num)) return NaN;
  const digits = String(+num).split("");
  const key = [
    "", "C", "CC", "CCC", "CD", "D", "DC", "DCC", "DCCC", "CM",
    "", "X", "XX", "XXX", "XL", "L", "LX", "LXX", "LXXX", "XC",
    "", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX"
  ];
  let roman = "";
  let i = 3;
  while (i--) roman = (key[+digits.pop() + i * 10] || "") + roman;
  return Array(+digits.join("") + 1).join("M") + roman;
}

seed();

const fs = require('fs');

const topics = [
  'Arrays', 'Strings', 'Linked List', 'Stack & Queue', 'Trees', 
  'Graphs', 'Dynamic Programming', 'Sorting', 'Binary Search', 
  'Greedy', 'Sliding Window', 'Two Pointer', 'Backtracking', 
  'Heap', 'Trie'
];

const companiesList = [
  'Google', 'Amazon', 'Microsoft', 'Adobe', 'Facebook', 'Bloomberg', 
  'Uber', 'Apple', 'TCS', 'Infosys', 'Accenture', 'Wipro', 
  'Goldman Sachs', 'Flipkart', 'Atlassian', 'Netflix', 'Oracle'
];

const difficulties = ['Easy', 'Medium', 'Hard'];

const questions = [];
let idCounter = 100; // Start IDs from dsa-100 to avoid conflicts with existing

const getRandomElements = (arr, count) => {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

topics.forEach(topic => {
  for (let i = 1; i <= 30; i++) {
    const diff = difficulties[Math.floor(Math.random() * difficulties.length)];
    const numCompanies = getRandomInt(2, 6);
    const companies = getRandomElements(companiesList, numCompanies);
    
    questions.push({
      id: `dsa-${idCounter++}`,
      category: 'dsa',
      title: `${topic} Challenge ${i}: Optimization Problem`,
      difficulty: diff,
      topic: topic,
      companies: companies,
      description: `This is a standard interview problem involving ${topic}. You are given an input dataset and need to process it to find the optimal solution.\n\nSolve the problem efficiently by minimizing time and space complexities.`,
      examples: [
        {
          input: "input = [1, 2, 3, 4, 5]",
          output: "[2, 4, 6, 8, 10]",
          explanation: `A typical output transformation for a ${topic} problem.`
        }
      ],
      constraints: [
        "1 <= input.length <= 10^5",
        "-10^9 <= input[i] <= 10^9"
      ],
      hints: [
        `Consider the fundamental properties of ${topic}.`,
        `Can you solve this in O(N) time?`,
        `Think about edge cases like empty inputs or extreme values.`
      ],
      expectedComplexity: {
        time: diff === 'Easy' ? 'O(N)' : diff === 'Medium' ? 'O(N log N)' : 'O(1)',
        space: diff === 'Easy' ? 'O(1)' : 'O(N)'
      },
      starterCode: {
        javascript: '// Write your solution in JavaScript\nfunction solution() {\n  // your code here\n}\n',
        python: '# Write your solution in Python\ndef solution():\n    # your code here\n    pass\n',
        java: '// Write your solution in Java\npublic class Solution {\n    public static void main(String[] args) {\n        // your code here\n    }\n}\n',
        cpp: '// Write your solution in C++\n#include <bits/stdc++.h>\nusing namespace std;\nint main() {\n    // your code here\n    return 0;\n}\n'
      }
    });
  }
});

const fileContent = `export const extraQuestions = ${JSON.stringify(questions, null, 2)};\n`;

fs.writeFileSync('src/data/extraQuestions.js', fileContent);
console.log('Successfully generated 450 extra questions to src/data/extraQuestions.js');

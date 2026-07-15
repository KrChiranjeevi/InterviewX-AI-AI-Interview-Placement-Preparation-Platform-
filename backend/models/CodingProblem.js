const mongoose = require('mongoose');

const codingProblemSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  category: {
    type: String, // 'dsa', 'sql', 'javascript'
    required: true,
    index: true,
  },
  difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard'],
    required: true,
  },
  topics: [{
    type: String,
    index: true,
  }],
  companies: [{
    type: String,
    index: true,
  }],
  description: {
    type: String,
    required: true,
  },
  constraints: [{
    type: String,
  }],
  examples: [{
    input: String,
    output: String,
    explanation: String,
  }],
  testCases: [{
    input: String,
    expectedOutput: String,
    isHidden: {
      type: Boolean,
      default: false,
    }
  }],
  hints: [{
    type: String,
  }],
  starterCode: {
    type: Map,
    of: String, // Key is language (e.g. 'python', 'javascript', 'cpp'), Value is the starter code
    default: {}
  },
  acceptanceRate: {
    type: Number,
    default: 0
  },
  totalSubmissions: {
    type: Number,
    default: 0
  },
  acceptedSubmissions: {
    type: Number,
    default: 0
  },
  solution: {
    type: String, // Optional optimal solution explanation
  }
}, { timestamps: true });

module.exports = mongoose.model('CodingProblem', codingProblemSchema);

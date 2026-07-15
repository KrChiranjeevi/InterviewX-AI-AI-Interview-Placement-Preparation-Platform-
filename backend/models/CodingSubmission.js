const mongoose = require('mongoose');

const codingSubmissionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  problemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CodingProblem',
    required: true,
    index: true,
  },
  language: {
    type: String,
    required: true,
  },
  code: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['Accepted', 'Wrong Answer', 'Compile Error', 'Runtime Error', 'Time Limit Exceeded', 'Memory Limit Exceeded', 'Pending'],
    required: true,
  },
  executionTime: {
    type: Number, // in milliseconds
  },
  memoryUsed: {
    type: Number, // in bytes or KB
  },
  passedTestCases: {
    type: Number,
    default: 0
  },
  totalTestCases: {
    type: Number,
    default: 0
  },
  errorMessage: {
    type: String,
  },
  output: {
    type: String, // STDOUT or combined STDOUT/STDERR for debugging
  }
}, { timestamps: true });

module.exports = mongoose.model('CodingSubmission', codingSubmissionSchema);

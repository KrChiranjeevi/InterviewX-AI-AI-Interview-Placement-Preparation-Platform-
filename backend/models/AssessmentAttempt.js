const mongoose = require('mongoose');

const assessmentAttemptSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
    index: true,
  },
  module: {
    type: String,
    required: true,
  },
  company: {
    type: String,
    required: true,
  },
  role: {
    type: String,
  },
  score: {
    type: Number,
    required: true,
  },
  accuracy: {
    type: Number,
    required: true,
  },
  timeTakenMinutes: {
    type: Number,
    required: true,
  },
  totalQuestions: {
    type: Number,
    required: true,
  },
  correctAnswers: {
    type: Number,
    required: true,
  },
  incorrectAnswers: {
    type: Number,
    required: true,
  },
  skippedQuestions: {
    type: Number,
    required: true,
  },
  responses: [{
    questionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AssessmentQuestion'
    },
    questionText: String,
    selectedOption: String,
    correctOption: String,
    isCorrect: Boolean,
    isSkipped: Boolean,
    timeSpent: Number,
    difficulty: String,
    subCategory: String,
    explanation: String,
    stepByStep: [String],
    references: [String]
  }],
  topicWisePerformance: [{
    topic: String,
    total: Number,
    correct: Number,
    accuracy: Number
  }],
  strengths: {
    type: [String],
    default: [],
  },
  weakAreas: {
    type: [String],
    default: [],
  },
  estimatedInterviewReadiness: {
    type: Number,
  },
  expectedCompanyFit: {
    type: [String],
    default: [],
  },
  aiFeedback: String
}, {
  timestamps: true,
});

const AssessmentAttempt = mongoose.model('AssessmentAttempt', assessmentAttemptSchema);
module.exports = AssessmentAttempt;

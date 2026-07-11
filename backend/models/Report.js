const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
    index: true,
  },
  interviewId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Interview',
    index: true,
  },
  overallScore: {
    type: Number,
    required: true,
  },
  technicalScore: {
    type: Number,
    required: true,
  },
  communicationScore: {
    type: Number,
    required: true,
  },
  confidenceScore: {
    type: Number,
    required: true,
  },
  problemSolvingScore: {
    type: Number,
    default: 0,
  },
  hiringDecision: {
    type: String,
    default: 'Not Selected',
  },
  questionsAsked: {
    type: Number,
    default: 0,
  },
  questionsAttempted: {
    type: Number,
    default: 0,
  },
  questionsSkipped: {
    type: Number,
    default: 0,
  },
  correctResponses: {
    type: Number,
    default: 0,
  },
  incorrectResponses: {
    type: Number,
    default: 0,
  },
  technicalReason: {
    type: String,
    default: '',
  },
  communicationReason: {
    type: String,
    default: '',
  },
  confidenceReason: {
    type: String,
    default: '',
  },
  overallReason: {
    type: String,
    default: '',
  },
  strengths: {
    type: [String],
    default: [],
  },
  weakness: {
    type: [String],
    default: [],
  },
  suggestions: {
    type: [String],
    default: [],
  },
  questions: [{
    question: String,
    userAnswer: String,
    aiFeedback: String,
    score: Number,
    metrics: {
      technicalKnowledge: Number,
      problemSolving: Number,
      communication: Number,
      confidence: Number,
      accuracy: Number,
      logicalThinking: Number
    }
  }]
}, {
  timestamps: true,
});

const Report = mongoose.model('Report', reportSchema);
module.exports = Report;

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
  companyReadiness: [{
    company: String,
    score: Number,
    explanation: String
  }],
  feedbackCards: [{
    category: String,
    score: Number,
    strengths: [String],
    weaknesses: [String],
    examples: [String],
    suggestions: [String],
    resources: [String]
  }],
  careerCoach: {
    nextWeekPlan: { type: String, default: '' },
    thirtyDayPlan: { type: String, default: '' },
    ninetyDayPlan: { type: String, default: '' },
    resumeSuggestions: { type: [String], default: [] },
    portfolioSuggestions: { type: [String], default: [] }
  },
  codeAnalysis: {
    timeComplexity: { type: String, default: '' },
    spaceComplexity: { type: String, default: '' },
    codeQuality: { type: String, default: '' },
    variableNaming: { type: String, default: '' },
    edgeCases: { type: String, default: '' },
    expectedSolution: { type: String, default: '' }
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
    },
    speechStats: {
      speakingSpeed: { type: Number, default: 0 },
      fillerWordsCount: { type: Number, default: 0 },
      eyeContactScore: { type: Number, default: 0 },
      voiceClarity: { type: Number, default: 0 },
      grammarScore: { type: Number, default: 0 }
    },
    bookmarked: { type: Boolean, default: false }
  }]
}, {
  timestamps: true,
});

const Report = mongoose.model('Report', reportSchema);
module.exports = Report;

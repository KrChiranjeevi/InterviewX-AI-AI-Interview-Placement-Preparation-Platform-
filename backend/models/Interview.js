const mongoose = require('mongoose');

const interviewSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
    index: true,
  },
  type: {
    type: String,
    required: true,
    enum: ['Technical Interview', 'HR Interview', 'Coding Interview', 'Resume Based Interview'],
  },
  role: {
    type: String,
    required: true,
  },
  company: {
    type: String,
    default: '',
  },
  difficulty: {
    type: String,
    required: true,
    enum: ['Beginner', 'Intermediate', 'Advanced'],
  },
  duration: {
    type: String,
    required: true,
  },
  resumeSkills: [{
    type: String
  }],
  resumeText: {
    type: String,
    default: '',
  },
  status: {
    type: String,
    required: true,
    default: 'started',
    enum: ['started', 'completed'],
    index: true,
  },
  questions: [{
    question: String,
    userAnswer: String,
    aiFeedback: String,
    score: Number,
    metrics: {
      technicalKnowledge: { type: Number, default: 0 },
      problemSolving: { type: Number, default: 0 },
      communication: { type: Number, default: 0 },
      confidence: { type: Number, default: 0 },
      accuracy: { type: Number, default: 0 },
      logicalThinking: { type: Number, default: 0 }
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  score: {
    type: Number,
    default: 0,
  },
  confidenceScore: {
    type: Number,
    default: 0,
  },
  feedback: {
    type: String,
    default: '',
  },
}, {
  timestamps: true,
});

const Interview = mongoose.model('Interview', interviewSchema);
module.exports = Interview;

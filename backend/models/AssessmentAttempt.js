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
    enum: ['aptitude', 'quant', 'reasoning', 'verbal'],
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
    isSkipped: Boolean
  }]
}, {
  timestamps: true,
});

const AssessmentAttempt = mongoose.model('AssessmentAttempt', assessmentAttemptSchema);
module.exports = AssessmentAttempt;

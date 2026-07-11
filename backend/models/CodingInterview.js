const mongoose = require('mongoose');

const codingInterviewSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  problem: {
    type: String,
    required: true,
  },
  language: {
    type: String,
    required: true,
  },
  code: {
    type: String,
    default: '',
  },
  aiFeedback: {
    type: String,
    default: '',
  },
  score: {
    type: Number,
    default: 0,
  },
  completedAt: {
    type: Date,
  }
}, {
  timestamps: true,
});

const CodingInterview = mongoose.model('CodingInterview', codingInterviewSchema);
module.exports = CodingInterview;

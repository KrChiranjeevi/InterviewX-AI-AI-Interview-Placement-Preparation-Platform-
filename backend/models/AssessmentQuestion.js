const mongoose = require('mongoose');

const assessmentQuestionSchema = new mongoose.Schema({
  module: {
    type: String,
    required: true,
    enum: ['aptitude', 'quant', 'reasoning', 'verbal'],
    index: true,
  },
  subCategory: {
    type: String,
    required: true,
  },
  question: {
    type: String,
    required: true,
  },
  options: {
    type: [String],
    required: true,
    validate: [arrayLimit, 'Options must be exactly 4'],
  },
  correctAnswer: {
    type: String,
    required: true,
  },
  difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard'],
    default: 'Medium',
  },
  companyTags: {
    type: [String],
    default: [],
  }
}, {
  timestamps: true,
});

function arrayLimit(val) {
  return val.length === 4;
}

const AssessmentQuestion = mongoose.model('AssessmentQuestion', assessmentQuestionSchema);
module.exports = AssessmentQuestion;

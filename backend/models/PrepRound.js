const mongoose = require('mongoose');

const prepRoundSchema = new mongoose.Schema({
  roleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PrepRole',
    required: true
  },
  roundIndex: {
    type: Number,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  duration: {
    type: String,
    default: '30 Mins'
  },
  difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard'],
    default: 'Medium'
  },
  passingScore: {
    type: String,
    default: '70%'
  },
  skillsRequired: {
    type: [String],
    default: []
  },
  instructions: {
    type: String,
    default: ''
  },
  assessmentType: {
    type: String, // 'coding', 'aptitude', 'technical', 'hr', etc.
    default: 'coding'
  }
}, {
  timestamps: true,
});

module.exports = mongoose.model('PrepRound', prepRoundSchema);

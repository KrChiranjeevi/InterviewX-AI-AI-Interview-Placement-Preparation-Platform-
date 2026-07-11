const mongoose = require('mongoose');

const companySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  logo: {
    type: String,
    default: ''
  },
  rounds: {
    type: [String],
    default: []
  },
  skills: {
    type: [String],
    default: []
  },
  questions: {
    type: [String],
    default: []
  },
  difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard'],
    default: 'Medium'
  },
  package: {
    type: String,
    default: ''
  },
  eligibility: {
    type: String,
    default: ''
  },
  selectionRate: {
    type: String,
    default: ''
  },
  estimatedTime: {
    type: String,
    default: ''
  }
}, {
  timestamps: true,
});

const Company = mongoose.model('Company', companySchema);
module.exports = Company;

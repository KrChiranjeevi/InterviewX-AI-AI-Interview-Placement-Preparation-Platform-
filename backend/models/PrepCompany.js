const mongoose = require('mongoose');

const prepCompanySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  logo: {
    type: String,
    default: ''
  },
  about: {
    type: String,
    default: ''
  },
  selectionRate: {
    type: String,
    default: ''
  },
  package: {
    type: String,
    default: ''
  },
  eligibility: {
    type: String,
    default: ''
  },
  estimatedTime: {
    type: String,
    default: ''
  },
  difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard'],
    default: 'Medium'
  }
}, {
  timestamps: true,
});

module.exports = mongoose.model('PrepCompany', prepCompanySchema);

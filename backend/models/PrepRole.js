const mongoose = require('mongoose');

const prepRoleSchema = new mongoose.Schema({
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PrepCompany',
    required: true
  },
  roleName: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  skillsRequired: {
    type: [String],
    default: []
  },
  offerPrediction: {
    type: String,
    default: ''
  },
  timeline: {
    type: String,
    default: ''
  },
  tags: {
    type: [String],
    default: []
  }
}, {
  timestamps: true,
});

module.exports = mongoose.model('PrepRole', prepRoleSchema);

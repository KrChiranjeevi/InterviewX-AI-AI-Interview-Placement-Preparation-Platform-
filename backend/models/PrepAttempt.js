const mongoose = require('mongoose');

const prepAttemptSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PrepCompany',
    required: true
  },
  roleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PrepRole',
    required: true
  },
  currentRoundIndex: {
    type: Number,
    default: 0
  },
  scores: {
    type: Map,
    of: Number,
    default: {}
  },
  roundDetails: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
    default: {}
  },
  finalReport: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  }
}, {
  timestamps: true,
});

// Ensure a user has only one active attempt per role, or just use this to find the latest
prepAttemptSchema.index({ userId: 1, roleId: 1 });

module.exports = mongoose.model('PrepAttempt', prepAttemptSchema);

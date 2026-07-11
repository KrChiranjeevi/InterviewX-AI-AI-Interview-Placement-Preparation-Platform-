const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  // password is optional for Google OAuth users
  password: {
    type: String,
    default: null,
  },
  // Google OAuth fields
  googleId: {
    type: String,
    default: null,
    sparse: true, // allows multiple null values in unique index
  },
  authProvider: {
    type: String,
    enum: ['local', 'google'],
    default: 'local',
  },
  profileImage: {
    type: String,
    default: ''
  },
  targetRole: {
    type: String,
    default: 'Software Engineer'
  },
  skills: {
    type: [String],
    default: []
  },
  interviewGoal: {
    type: String,
    default: 'Land a job in 3 months'
  },
  badges: {
    type: [String],
    default: []
  },
  notificationsEnabled: {
    type: Boolean,
    default: true
  },
  theme: {
    type: String,
    default: 'dark',
    enum: ['light', 'dark']
  },
}, {
  timestamps: true,
});

// Hash password before saving (only if password is set and modified)
userSchema.pre('save', async function() {
  if (!this.password || !this.isModified('password')) {
    return;
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Match password (returns false for Google-only accounts)
userSchema.methods.matchPassword = async function(enteredPassword) {
  if (!this.password) return false;
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);
module.exports = User;

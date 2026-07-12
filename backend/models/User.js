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
  username: {
    type: String,
    default: ''
  },
  phone: {
    type: String,
    default: ''
  },
  bio: {
    type: String,
    default: ''
  },
  college: {
    type: String,
    default: ''
  },
  degree: {
    type: String,
    default: ''
  },
  graduationYear: {
    type: String,
    default: ''
  },
  portfolioUrl: {
    type: String,
    default: ''
  },
  githubUrl: {
    type: String,
    default: ''
  },
  linkedinUrl: {
    type: String,
    default: ''
  },
  resumeUrl: {
    type: String,
    default: ''
  },
  targetCompany: {
    type: String,
    default: ''
  },
  settings: {
    appearance: {
      themeMode: { type: String, default: 'dark', enum: ['light', 'dark', 'system'] },
      accentColor: { type: String, default: '#6366f1' },
      fontSize: { type: String, default: 'medium', enum: ['small', 'medium', 'large'] },
      compactMode: { type: Boolean, default: false },
      sidebarCollapse: { type: Boolean, default: false },
      animationsEnabled: { type: Boolean, default: true },
      gsapEnabled: { type: Boolean, default: true }
    },
    aiPreferences: {
      provider: { type: String, default: 'Auto', enum: ['Auto', 'OpenAI', 'Gemini', 'Groq'] },
      model: { type: String, default: 'gemini-2.5-flash' },
      difficulty: { type: String, default: 'Medium', enum: ['Easy', 'Medium', 'Hard', 'Adaptive'] },
      responseLength: { type: String, default: 'Medium', enum: ['Short', 'Medium', 'Detailed'] },
      voiceResponse: { type: Boolean, default: false },
      mentorPersonality: { type: String, default: 'Friendly Mentor', enum: ['Strict Interviewer', 'Friendly Mentor', 'FAANG Interviewer', 'HR Recruiter'] }
    },
    interviewSettings: {
      duration: { type: Number, default: 30, enum: [15, 30, 45, 60] },
      enableCamera: { type: Boolean, default: false },
      enableMicrophone: { type: Boolean, default: true },
      enableVoiceRec: { type: Boolean, default: false },
      autoSaveAnswers: { type: Boolean, default: true },
      autoSubmit: { type: Boolean, default: false },
      showTimer: { type: Boolean, default: true },
      adaptiveQuestions: { type: Boolean, default: true },
      realCompanyMode: { type: Boolean, default: false }
    },
    codingSettings: {
      defaultLanguage: { type: String, default: 'JavaScript', enum: ['Java', 'Python', 'C++', 'JavaScript'] },
      editorTheme: { type: String, default: 'vs-dark' },
      fontSize: { type: Number, default: 14 },
      wordWrap: { type: Boolean, default: true },
      autoSaveCode: { type: Boolean, default: true },
      showLineNumbers: { type: Boolean, default: true },
      autoFormat: { type: Boolean, default: true },
      vimMode: { type: Boolean, default: false }
    },
    notifications: {
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: false },
      reminders: { type: Boolean, default: true },
      dailyReminder: { type: Boolean, default: true },
      weeklyReport: { type: Boolean, default: true },
      monthlyReport: { type: Boolean, default: false },
      placementAlerts: { type: Boolean, default: true }
    },
    privacySecurity: {
      twoFactorAuth: { type: Boolean, default: false }
    },
    advanced: {
      devMode: { type: Boolean, default: false },
      experimentalFeatures: { type: Boolean, default: false }
    }
  }
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

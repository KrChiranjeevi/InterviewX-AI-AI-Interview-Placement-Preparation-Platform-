const mongoose = require('mongoose');

const resumeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  fileUrl: {
    type: String,
    default: '',
  },
  targetRole: { type: String, default: '' },
  targetCompany: { type: String, default: 'General ATS' },
  personalInfo: { type: Object, default: {} },
  education: { type: Array, default: [] },
  experience: { type: Array, default: [] },
  projects: { type: Array, default: [] },
  internships: { type: Array, default: [] },
  skills: { type: Object, default: {} },
  certificates: { type: Array, default: [] },
  achievements: { type: Array, default: [] },
  training: { type: Array, default: [] },
  scoringBreakdown: { type: Object, default: {} },
  skillMatchLevel: { type: String, default: 'Average' },
  formattingAnalysis: { type: Object, default: {} },
  hiringReadiness: { type: Object, default: {} },
  practiceQuestions: { type: Array, default: [] },
  resumeSummary: { type: String, default: '' },
  skillsFound: { type: Array, default: [] },
  missingSkills: { type: Array, default: [] },
  score: { type: Number, default: 0 },
  aiSuggestions: { type: Array, default: [] },
  strengths: { type: Array, default: [] },
  weaknesses: { type: Array, default: [] },
  formattingIssues: { type: Array, default: [] },
  resumeStructure: { type: String, default: '' },
  projectQuality: { type: String, default: '' },
  experienceAnalysis: { type: String, default: '' },
  educationAnalysis: { type: String, default: '' },
  certificationsAnalysis: { type: String, default: '' },
  keywordDensity: { type: String, default: '' },
  recommendations: { type: Array, default: [] },
  matchedKeywords: { type: Array, default: [] },
  priorityKeywords: { type: Array, default: [] },
  recommendedSkills: { type: Array, default: [] },
  skillMatchPercentage: { type: Number, default: 0 },
  companyCompatibility: [{
    company: String,
    matchPercent: Number
  }],
  resumeText: {
    type: String,
    default: '',
  }
}, {
  timestamps: true,
});

const Resume = mongoose.model('Resume', resumeSchema);
module.exports = Resume;

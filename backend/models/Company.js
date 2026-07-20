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
    enum: ['Easy', 'Medium', 'Hard', 'Medium-Hard', 'Very Hard', 'Expert'],
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
  },
  companyType: {
    type: String,
    enum: ['Product', 'Service'],
    default: 'Product'
  },
  
  // ── EXTENDED CAMPUS PLACEMENT PIPELINE FIELDS ──
  color: {
    type: String,
    default: '#6366F1'
  },
  secondaryColor: {
    type: String,
    default: '#4F46E5'
  },
  tracks: [{
    id: String,
    name: String,
    package: String,
    difficulty: String,
    timeline: String,
    eligibility: String
  }],
  pipeline: [{
    id: String,
    title: String
  }],
  
  // ── VERIFIED COMPREHENSIVE RECRUITER INTEL LAYER ──
  info: {
    overview: { type: String, default: 'Information not publicly available.' },
    description: { type: String, default: 'Information not publicly available.' },
    headquarters: { type: String, default: 'Information not publicly available.' },
    industry: { type: String, default: 'Information not publicly available.' },
    founded: { type: String, default: 'Information not publicly available.' },
    employees: { type: String, default: 'Information not publicly available.' },
    careersUrl: { type: String, default: '' },
    hiringType: { type: String, default: 'Information not publicly available.' },
    availability: { type: String, default: 'Information not publicly available.' },
    eligibility: { type: String, default: 'Information not publicly available.' },
    degrees: { type: String, default: 'Information not publicly available.' },
    cgpa: { type: String, default: 'Information not publicly available.' },
    process: { type: String, default: 'Information not publicly available.' },
    rounds: { type: String, default: 'Information not publicly available.' },
    flow: { type: String, default: 'Information not publicly available.' },
    techTopics: { type: String, default: 'Information not publicly available.' },
    behavioralTopics: { type: String, default: 'Information not publicly available.' },
    skillsPreferred: { type: String, default: 'Information not publicly available.' },
    technologies: { type: String, default: 'Information not publicly available.' },
    projectsExpected: { type: String, default: 'Information not publicly available.' },
    prepTips: { type: String, default: 'Information not publicly available.' },
    timeline: { type: String, default: 'Information not publicly available.' },
    package: { type: String, default: 'Information not publicly available.' },
    notes: { type: String, default: 'Information not publicly available.' },
    faqs: [{
      q: String,
      a: String
    }]
  }
}, {
  timestamps: true,
});

const Company = mongoose.model('Company', companySchema);
module.exports = Company;

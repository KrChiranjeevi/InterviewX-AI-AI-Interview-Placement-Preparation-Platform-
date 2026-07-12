const mongoose = require('mongoose');

const roadmapSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User', index: true },
  
  // Search & Identification
  searchQuery: { type: String, required: true },
  type: { type: String, enum: ['Role', 'Technology', 'Company', 'Custom'], default: 'Custom' },
  isSaved: { type: Boolean, default: false },

  // Top-Level Overview
  overview: {
    careerOverview: String,
    whyLearn: String,
    salaryRange: String,
    futureScope: String,
    topHiringCompanies: [String],
    learningDuration: String,
    difficultyLevel: String,
    placementStrategy: String,
  },

  // Company-Specific Data (Optional)
  companyDetails: {
    eligibility: String,
    cgpaRequirement: String,
    hiringProcess: String,
    interviewRounds: [String],
    coreSubjects: [String],
    behavioralPrep: String,
    systemDesignRequired: Boolean,
    selectionRate: String,
  },

  // Analytics & Readiness (Personalized using user data)
  analytics: {
    overallReadiness: { type: Number, default: 0 },
    roleReadiness: { type: Number, default: 0 },
    companyReadiness: { type: Number, default: 0 },
    codingReadiness: { type: Number, default: 0 },
    interviewReadiness: { type: Number, default: 0 },
    resumeReadiness: { type: Number, default: 0 },
    communicationReadiness: { type: Number, default: 0 },
    learningStreak: { type: Number, default: 0 },
  },

  // AI Recommendations (Based on weaknesses and progress)
  recommendations: {
    nextTopic: String,
    miniProject: String,
    revisionTopics: [String],
    relatedTechnologies: [String],
    certificationSuggestions: [String],
  },

  // The Massive Detailed Learning Path
  modules: [
    {
      title: String,
      difficulty: String, // Beginner, Intermediate, Advanced
      estimatedTime: String,
      
      // Expandable Topics inside the module
      topics: [
        {
          title: String,
          explanation: String, // Detailed ChatGPT-like explanation of the topic
          isCompleted: { type: Boolean, default: false },
          
          practiceProblems: [
            {
              title: String,
              difficulty: String,
              link: String, // Leetcode/platform link if available
              isCompleted: { type: Boolean, default: false }
            }
          ],
          
          interviewQuestions: [
            {
              question: String,
              answerHint: String,
              companies: [String] // e.g. Amazon, Google
            }
          ],
          
          learningResources: [
            {
              title: String,
              type: { type: String, enum: ['Video', 'Documentation', 'Course', 'Article', 'Platform', 'Book', 'GitHub'] },
              link: String
            }
          ]
        }
      ],
      
      // Projects specific to this module level
      projects: [
        {
          title: String,
          description: String,
          techStack: [String],
          isCompleted: { type: Boolean, default: false }
        }
      ],

      moduleCompleted: { type: Boolean, default: false }
    }
  ],
  
  progress: { type: Number, default: 0 }
}, {
  timestamps: true,
});

const Roadmap = mongoose.model('Roadmap', roadmapSchema);
module.exports = Roadmap;

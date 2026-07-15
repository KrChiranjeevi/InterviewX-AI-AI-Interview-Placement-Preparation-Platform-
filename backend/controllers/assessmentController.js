const AssessmentQuestion = require('../models/AssessmentQuestion');
const AssessmentAttempt = require('../models/AssessmentAttempt');
const User = require('../models/User');
const { generateAndSaveQuestions } = require('../services/aiQuestionGenerator');

// @desc    Get questions for a specific assessment module
// @route   GET /api/assessments/:module
// @access  Private
const getQuestions = async (req, res) => {
  try {
    const { module } = req.params;
    let { limit = 20, difficulty } = req.query;
    limit = parseInt(limit, 10);

    const moduleName = module.toLowerCase();
    
    // 1. Fetch user's previous attempts to avoid repeating questions
    const previousAttempts = await AssessmentAttempt.find({ userId: req.user._id, module: moduleName });
    let seenQuestionIds = [];
    previousAttempts.forEach(attempt => {
      attempt.responses.forEach(r => seenQuestionIds.push(r.questionId));
    });

    let baseQuery = { module: moduleName };
    if (difficulty) baseQuery.difficulty = difficulty;

    // 2. Intelligent Aggregation Pipeline
    let questions = [];

    const fetchQuestionsWithExclusion = async (excludeIds) => {
      const matchQuery = { ...baseQuery, _id: { $nin: excludeIds } };
      
      if (difficulty) {
        // If a specific difficulty is requested, just sample
        return await AssessmentQuestion.aggregate([
          { $match: matchQuery },
          { $sample: { size: limit } },
          { $project: { correctAnswer: 0 } }
        ]);
      } else {
        // Balanced Paper Generation (30% Easy, 40% Medium, 30% Hard)
        const easyCount = Math.round(limit * 0.3);
        const hardCount = Math.round(limit * 0.3);
        const mediumCount = limit - easyCount - hardCount;

        const facetResults = await AssessmentQuestion.aggregate([
          { $match: matchQuery },
          {
            $facet: {
              easy: [ { $match: { difficulty: 'Easy' } }, { $sample: { size: easyCount } } ],
              medium: [ { $match: { difficulty: 'Medium' } }, { $sample: { size: mediumCount } } ],
              hard: [ { $match: { difficulty: 'Hard' } }, { $sample: { size: hardCount } } ]
            }
          }
        ]);

        const combined = [
          ...facetResults[0].easy,
          ...facetResults[0].medium,
          ...facetResults[0].hard
        ];

        // Shuffle the combined array so they aren't ordered by difficulty
        return combined.sort(() => Math.random() - 0.5).map(q => {
          delete q.correctAnswer;
          return q;
        });
      }
    };

    questions = await fetchQuestionsWithExclusion(seenQuestionIds);

    // 3. Fallback Mechanism: If we ran out of unseen questions, generate new ones via AI
    if (questions.length < limit) {
      console.log(`[Assessment] Not enough unseen questions for ${moduleName}. Triggering AI Generation...`);
      // Generate enough questions to fill the gap (or just a batch of 20)
      const generated = await generateAndSaveQuestions(moduleName, 20);
      if (generated && generated.length > 0) {
         // Re-fetch to include newly generated questions
         questions = await fetchQuestionsWithExclusion(seenQuestionIds);
      }
      
      // If STILL not enough (e.g. AI failed), fallback to repeating old questions
      if (questions.length < limit) {
        console.log(`[Assessment] AI generation failed or insufficient. Falling back to full pool for user ${req.user._id}`);
        questions = await fetchQuestionsWithExclusion([]);
      }
    }

    if (!questions || questions.length === 0) {
      return res.status(404).json({ message: `No questions found for module: ${module}` });
    }

    res.status(200).json(questions);
  } catch (error) {
    console.error('getQuestions Error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

const { generateAptitudeReport } = require('../services/aiService');

// @desc    Submit assessment attempt and calculate score
// @route   POST /api/assessments/submit
// @access  Private
const submitAssessment = async (req, res) => {
  try {
    const { module, company, role, timeTakenMinutes, responses } = req.body;

    if (!responses || !Array.isArray(responses)) {
      return res.status(400).json({ message: 'Invalid responses format' });
    }

    let correctAnswers = 0;
    let incorrectAnswers = 0;
    let skippedQuestions = 0;
    const totalQuestions = responses.length;

    const evaluatedResponses = [];

    // Evaluate each response
    for (const response of responses) {
      const { questionId, selectedOption, isSkipped, timeSpent } = response;
      
      const question = await AssessmentQuestion.findById(questionId);
      if (!question) continue;

      let isCorrect = false;
      const actualCorrectOption = question.correctAnswer;

      if (isSkipped) {
        skippedQuestions++;
      } else if (selectedOption === actualCorrectOption) {
        isCorrect = true;
        correctAnswers++;
      } else {
        incorrectAnswers++;
      }

      // Generate a synthetic explanation if none exists in DB
      const syntheticExplanation = `The correct answer is ${actualCorrectOption}. This problem evaluates your understanding of ${question.subCategory} concepts.`;

      evaluatedResponses.push({
        questionId: question._id,
        questionText: question.question,
        selectedOption: selectedOption || '',
        correctOption: actualCorrectOption,
        isCorrect,
        isSkipped: Boolean(isSkipped),
        timeSpent: timeSpent || 0,
        difficulty: question.difficulty,
        subCategory: question.subCategory,
        explanation: question.explanation || syntheticExplanation,
        stepByStep: question.stepByStep || [],
        references: question.references || []
      });
    }

    // Calculate score (out of 100)
    const score = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;
    
    // Calculate accuracy (correct / attempted)
    const attempted = correctAnswers + incorrectAnswers;
    const accuracy = attempted > 0 ? Math.round((correctAnswers / attempted) * 100) : 0;

    // Advanced Analytics: Topic-wise Performance
    const topicStats = {};
    evaluatedResponses.forEach(r => {
      const topic = r.subCategory || 'General';
      if (!topicStats[topic]) topicStats[topic] = { total: 0, correct: 0 };
      topicStats[topic].total++;
      if (r.isCorrect) topicStats[topic].correct++;
    });

    const topicWisePerformance = Object.keys(topicStats).map(topic => {
      const { total, correct } = topicStats[topic];
      return {
        topic,
        total,
        correct,
        accuracy: total > 0 ? Math.round((correct / total) * 100) : 0
      };
    });

    // Detect Strengths and Weak Areas
    const strengths = [];
    const weakAreas = [];
    topicWisePerformance.forEach(t => {
      if (t.total >= 1) { // Normally need more questions for statistical significance, but keeping it simple
        if (t.accuracy >= 75) strengths.push(t.topic);
        else if (t.accuracy <= 50) weakAreas.push(t.topic);
      }
    });

    const estimatedInterviewReadiness = Math.round(accuracy * 0.8 + score * 0.2); // Simple heuristic
    const expectedCompanyFit = estimatedInterviewReadiness > 80 ? ['Google', 'Amazon', 'Meta'] : 
                               estimatedInterviewReadiness > 60 ? ['TCS', 'Infosys', 'Wipro', 'Accenture'] : [];

    // Calculate XP
    const xpEarned = correctAnswers * 10 + (score >= 80 ? 50 : score >= 50 ? 20 : 0);

    // Calculate difficultyAnalysis
    const difficultyAnalysis = {
      easy: { total: 0, correct: 0, accuracy: 0 },
      medium: { total: 0, correct: 0, accuracy: 0 },
      hard: { total: 0, correct: 0, accuracy: 0 }
    };
    evaluatedResponses.forEach(r => {
      const diff = (r.difficulty || 'Easy').toLowerCase();
      if (difficultyAnalysis[diff]) {
        difficultyAnalysis[diff].total++;
        if (r.isCorrect) difficultyAnalysis[diff].correct++;
      }
    });
    ['easy', 'medium', 'hard'].forEach(key => {
      const d = difficultyAnalysis[key];
      d.accuracy = d.total > 0 ? Math.round((d.correct / d.total) * 100) : 0;
    });

    // Percentile logic
    const percentile = Math.max(10, Math.min(99, Math.round(score * 0.9 + Math.random() * 8 + 2)));

    // AI study recommendations
    const aiStudyRecommendations = [];
    if (weakAreas.length > 0) {
      weakAreas.forEach(topic => {
        aiStudyRecommendations.push(`Revise fundamental concepts of ${topic} and practice at least 5 medium-level MCQs.`);
      });
    } else {
      aiStudyRecommendations.push("Great job! Keep testing your skills on other modules to ensure comprehensive placement preparation.");
    }

    // Next recommended practice module selection
    const modules = [
      'sql', 'javascript', 'aptitude', 'quant', 'reasoning', 'verbal', 
      'dbms', 'os', 'cn', 'oop', 'frontend', 'backend', 
      'java', 'python', 'react', 'node', 'express', 'mongodb', 'system-design'
    ];
    const otherModules = modules.filter(m => m !== module.toLowerCase());
    const nextRecommendedPractice = otherModules[Math.floor(Math.random() * otherModules.length)] || 'Quantitative Aptitude';

    // Estimated interview performance
    let estimatedInterviewPerformance = 'Needs Improvement';
    if (score >= 90) estimatedInterviewPerformance = 'Outstanding';
    else if (score >= 75) estimatedInterviewPerformance = 'Strong';
    else if (score >= 50) estimatedInterviewPerformance = 'Average';

    // Update user XP & Level
    const user = await User.findById(req.user._id);
    if (user) {
      user.xp = (user.xp || 0) + xpEarned;
      user.level = Math.floor(user.xp / 1000) + 1;
      await user.save();
    }

    // Auto-Replace logic: Delete previous attempts for this user and this module
    await AssessmentAttempt.deleteMany({ userId: req.user._id, module: module.toLowerCase() });

    const attempt = await AssessmentAttempt.create({
      userId: req.user._id,
      module: module.toLowerCase(),
      submodule: 'General',
      company,
      role,
      score,
      accuracy,
      timeTakenMinutes,
      totalQuestions,
      correctAnswers,
      incorrectAnswers,
      skippedQuestions,
      responses: evaluatedResponses,
      topicWisePerformance,
      strengths,
      weakAreas,
      estimatedInterviewReadiness,
      expectedCompanyFit,
      percentile,
      xpEarned,
      difficultyAnalysis,
      aiStudyRecommendations,
      estimatedInterviewPerformance,
      nextRecommendedPractice
    });

    res.status(201).json({
      attemptId: attempt._id,
      score,
      accuracy,
      totalQuestions,
      correctAnswers,
      incorrectAnswers,
      skippedQuestions,
      timeTakenMinutes
    });

  } catch (error) {
    console.error('submitAssessment Error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get detailed report for an attempt
// @route   GET /api/assessments/attempt/:id
// @access  Private
const getAttemptReport = async (req, res) => {
  try {
    const attempt = await AssessmentAttempt.findById(req.params.id);
    if (!attempt) {
      return res.status(404).json({ message: 'Attempt not found' });
    }
    
    // Security check
    if (attempt.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to view this report' });
    }

    // Generate AI Feedback if not already present
    if (!attempt.aiFeedback) {
      const feedback = await generateAptitudeReport(attempt);
      attempt.aiFeedback = feedback;
      await attempt.save();
    }

    res.status(200).json(attempt);
  } catch (error) {
    console.error('getAttemptReport Error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get summary of latest attempts for all modules
// @route   GET /api/assessments/attempts/latest-summary
// @access  Private
const getLatestSummary = async (req, res) => {
  try {
    const attempts = await AssessmentAttempt.find({ userId: req.user._id });
    const summary = {};
    attempts.forEach(attempt => {
      const mod = attempt.module.toLowerCase();
      summary[mod] = {
        attemptId: attempt._id,
        score: attempt.score,
        accuracy: attempt.accuracy,
        createdAt: attempt.createdAt,
        status: attempt.score >= 70 ? 'Pass' : 'Fail'
      };
    });
    res.status(200).json(summary);
  } catch (error) {
    console.error('getLatestSummary Error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get latest attempt report for a specific module
// @route   GET /api/assessments/attempts/latest/:module
// @access  Private
const getLatestReportForModule = async (req, res) => {
  try {
    const { module } = req.params;
    const attempt = await AssessmentAttempt.findOne({ userId: req.user._id, module: module.toLowerCase() }).sort({ createdAt: -1 });
    if (!attempt) {
      return res.status(404).json({ message: 'No previous attempt found' });
    }
    
    // Security check
    if (attempt.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to view this report' });
    }

    // Generate AI Feedback if not already present
    if (!attempt.aiFeedback) {
      const feedback = await generateAptitudeReport(attempt);
      attempt.aiFeedback = feedback;
      await attempt.save();
    }

    res.status(200).json(attempt);
  } catch (error) {
    console.error('getLatestReportForModule Error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get counts of questions for all modules grouped by difficulty
// @route   GET /api/assessments/meta/question-counts
// @access  Private
const getQuestionCounts = async (req, res) => {
  try {
    const counts = await AssessmentQuestion.aggregate([
      {
        $group: {
          _id: { module: "$module", difficulty: "$difficulty" },
          count: { $sum: 1 }
        }
      }
    ]);
    
    const result = {};
    counts.forEach(item => {
      if (!item._id || !item._id.module) return;
      const mod = item._id.module.toLowerCase();
      let diff = item._id.difficulty || 'Medium';
      diff = diff.charAt(0).toUpperCase() + diff.slice(1).toLowerCase();
      if (diff === 'Med') diff = 'Medium'; // handle common abbrev
      
      if (!result[mod]) {
        result[mod] = { Easy: 0, Medium: 0, Hard: 0, total: 0 };
      }
      result[mod][diff] = (result[mod][diff] || 0) + item.count;
      result[mod].total += item.count;
    });

    res.status(200).json(result);
  } catch (error) {
    console.error('getQuestionCounts Error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = {
  getQuestions,
  submitAssessment,
  getAttemptReport,
  getLatestSummary,
  getLatestReportForModule,
  getQuestionCounts
};

const AssessmentQuestion = require('../models/AssessmentQuestion');
const AssessmentAttempt = require('../models/AssessmentAttempt');

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

    let baseQuery = {};
    
    // Exact mapping to prevent mixing
    if (moduleName === 'aptitude') {
      baseQuery.module = 'quant';
    } else if (moduleName === 'logic') {
      baseQuery.module = 'reasoning';
    } else {
      baseQuery.module = moduleName;
    }
    
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

    // 3. Fallback Mechanism: If we ran out of unseen questions (e.g. user practiced a lot)
    if (questions.length < limit) {
      console.log(`[Assessment] Not enough unseen questions. Falling back to full pool for user ${req.user._id}`);
      questions = await fetchQuestionsWithExclusion([]);
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
        explanation: question.explanation || syntheticExplanation
      });
    }

    // Calculate score (out of 100)
    const score = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;
    
    // Calculate accuracy (correct / attempted)
    const attempted = correctAnswers + incorrectAnswers;
    const accuracy = attempted > 0 ? Math.round((correctAnswers / attempted) * 100) : 0;

    const attempt = await AssessmentAttempt.create({
      userId: req.user._id,
      module,
      company,
      role,
      score,
      accuracy,
      timeTakenMinutes,
      totalQuestions,
      correctAnswers,
      incorrectAnswers,
      skippedQuestions,
      responses: evaluatedResponses
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

module.exports = {
  getQuestions,
  submitAssessment,
  getAttemptReport
};

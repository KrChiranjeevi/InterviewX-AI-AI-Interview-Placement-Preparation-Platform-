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

    const query = { module: module.toLowerCase() };
    if (difficulty) {
      query.difficulty = difficulty;
    }

    // Fetch random questions using aggregation
    const questions = await AssessmentQuestion.aggregate([
      { $match: query },
      { $sample: { size: limit } },
      { $project: { correctAnswer: 0 } } // Do not send correct answers to the frontend!
    ]);

    if (!questions || questions.length === 0) {
      return res.status(404).json({ message: `No questions found for module: ${module}` });
    }

    res.status(200).json(questions);
  } catch (error) {
    console.error('getQuestions Error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

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
      const { questionId, selectedOption, isSkipped } = response;
      
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

      evaluatedResponses.push({
        questionId: question._id,
        questionText: question.question,
        selectedOption: selectedOption || '',
        correctOption: actualCorrectOption,
        isCorrect,
        isSkipped: Boolean(isSkipped)
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

module.exports = {
  getQuestions,
  submitAssessment
};

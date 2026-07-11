const CodingInterview = require('../models/CodingInterview');
const { analyzeCode, getCodeHint } = require('../services/aiService');

// @desc    Get a coding problem (simulated for now, could be fetched from DB)
// @route   GET /api/coding/problem
// @access  Private
const getCodingProblem = async (req, res) => {
  try {
    // Return a random or fixed problem for the mock interview
    const problem = {
      id: "two-sum",
      title: "Two Sum",
      difficulty: "Easy",
      description: "Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`.\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.",
      examples: [
        { input: "nums = [2,7,11,15], target = 9", output: "[0,1]" },
        { input: "nums = [3,2,4], target = 6", output: "[1,2]" }
      ],
      constraints: [
        "2 <= nums.length <= 10^4",
        "-10^9 <= nums[i] <= 10^9",
        "-10^9 <= target <= 10^9",
        "Only one valid answer exists."
      ]
    };
    res.json(problem);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Run code and get syntax check / simulated output
// @route   POST /api/coding/run
// @access  Private
const runCode = async (req, res) => {
  const { problem, code, language } = req.body;

  try {
    const feedback = await analyzeCode(problem, code, language, false);
    res.json(feedback);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Submit code and get final evaluation
// @route   POST /api/coding/submit
// @access  Private
const submitCode = async (req, res) => {
  const { problem, code, language } = req.body;

  try {
    const feedback = await analyzeCode(problem, code, language, true);
    
    // Save the attempt to DB
    const attempt = await CodingInterview.create({
      userId: req.user._id,
      problem: problem,
      language: language,
      code: code,
      aiFeedback: feedback.feedback,
      score: feedback.score,
      completedAt: new Date()
    });

    res.json({ ...feedback, attemptId: attempt._id });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Get AI hint for a coding problem
// @route   POST /api/coding/hint
// @access  Private
const getAIHint = async (req, res) => {
  const { problem, description, hints, level } = req.body;
  try {
    const hint = await getCodeHint(problem, description, hints, level);
    res.json({ hint });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

module.exports = {
  getCodingProblem,
  runCode,
  submitCode,
  getAIHint
};

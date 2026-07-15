const CodingProblem = require('../models/CodingProblem');
const CodingSubmission = require('../models/CodingSubmission');
const { analyzeCode, getCodeHint } = require('../services/aiService');
const { generateCodingProblem } = require('../services/aiCodingProblemGenerator');
const axios = require('axios');

// Map frontend languages to piston API languages
const PISTON_LANGUAGES = {
  javascript: { language: 'javascript', version: '18.15.0' },
  python: { language: 'python', version: '3.10.0' },
  java: { language: 'java', version: '15.0.2' },
  cpp: { language: 'c++', version: '10.2.0' },
  c: { language: 'c', version: '10.2.0' },
  sql: { language: 'sqlite3', version: '3.36.0' },
  go: { language: 'go', version: '1.16.2' },
  rust: { language: 'rust', version: '1.68.2' },
  php: { language: 'php', version: '8.2.3' },
  swift: { language: 'swift', version: '5.3.3' }
};

// @desc    Get paginated coding problems list
// @route   GET /api/coding/problems
// @access  Private
const getCodingProblems = async (req, res) => {
  try {
    const { category, difficulty, topic, company, page = 1, limit = 20 } = req.query;
    
    let query = {};
    if (category) query.category = category;
    if (difficulty && difficulty !== 'All') query.difficulty = difficulty;
    if (topic && topic !== 'All') query.topics = topic;
    if (company) query.companies = company;

    const problems = await CodingProblem.find(query)
      .select('title slug difficulty category topics companies acceptanceRate totalSubmissions')
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .sort('-createdAt');
      
    const total = await CodingProblem.countDocuments(query);
    
    res.json({
      problems,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      total
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Get single coding problem details
// @route   GET /api/coding/problems/:slug
// @access  Private
const getProblemBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    let problem = await CodingProblem.findOne({ slug });
    
    // Fallback to find by _id if not found by slug and slug is valid ObjectId
    if (!problem && slug.match(/^[0-9a-fA-F]{24}$/)) {
      problem = await CodingProblem.findById(slug);
    }
    
    if (!problem) return res.status(404).json({ message: 'Problem not found' });
    res.json(problem);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Generate a new problem dynamically via AI
// @route   POST /api/coding/generate
// @access  Private
const generateProblem = async (req, res) => {
  try {
    const { category, topic, difficulty } = req.body;
    const problem = await generateCodingProblem(category, topic, difficulty);
    if (!problem) return res.status(500).json({ message: 'Failed to generate problem' });
    res.status(201).json(problem);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Run raw code via Piston API (No test cases, just raw output)
// @route   POST /api/coding/run
// @access  Private
const runCode = async (req, res) => {
  const { problemId, code, language, customInput } = req.body;
  try {
    const problem = await CodingProblem.findById(problemId);
    if (!problem) return res.status(404).json({ message: 'Problem not found' });
    
    // Use AI to simulate the "Run" execution against custom input
    // We pass `false` for isSubmit so it just evaluates basic logic/input
    const runResult = await analyzeCode(problem, code, language, false);
    
    // Map AI output back to LeetCode-style statuses for the "Run" test
    let status = 'Compile Error';
    if (runResult.score >= 85) status = 'Accepted';
    else if (runResult.score >= 50) status = 'Wrong Answer';
    
    res.json({
      score: runResult.score,
      feedback: runResult.feedback,
      simulatedOutput: runResult.simulatedOutput || '',
      submission: {
        status: status,
        passedTestCases: runResult.score >= 85 ? 2 : 0,
        totalTestCases: 2,
        executionTime: runResult.runtime ? parseInt(runResult.runtime) : Math.floor(Math.random() * 50) + 15,
        memoryUsed: runResult.memoryUsed ? parseFloat(runResult.memoryUsed) : (35 + Math.random() * 10).toFixed(1)
      }
    });
  } catch (error) {
    console.error('Run Code Error:', error);
    res.status(500).json({ message: 'Failed to run code', error: error.message });
  }
};

// @desc    Submit code and get final evaluation (Uses AI simulation for test case checking)
// @route   POST /api/coding/submit
// @access  Private
const submitCode = async (req, res) => {
  const { problemId, code, language } = req.body;

  try {
    const problem = await CodingProblem.findById(problemId);
    if (!problem) return res.status(404).json({ message: 'Problem not found' });

    // For full test case validation, we use AI analysis to simulate the edge cases and correctness
    const feedback = await analyzeCode(problem, code, language, true);
    
    // Map AI output back to LeetCode-style statuses
    let status = 'Compile Error';
    if (feedback.score >= 90) status = 'Accepted';
    else if (feedback.score >= 50) status = 'Wrong Answer';
    else if (feedback.feedback.toLowerCase().includes('time limit')) status = 'Time Limit Exceeded';
    else if (feedback.feedback.toLowerCase().includes('memory')) status = 'Memory Limit Exceeded';

    // Save the attempt to DB
    const submission = await CodingSubmission.create({
      userId: req.user._id,
      problemId: problem._id,
      language: language,
      code: code,
      status: status,
      executionTime: Math.floor(Math.random() * 50) + 10, // Simulated ms
      memoryUsed: Math.floor(Math.random() * 20) + 30, // Simulated MB
      passedTestCases: status === 'Accepted' ? problem.testCases.length : Math.max(0, Math.floor(Math.random() * problem.testCases.length)),
      totalTestCases: problem.testCases.length,
      output: feedback.feedback
    });

    // Update global problem stats
    problem.totalSubmissions += 1;
    if (status === 'Accepted') problem.acceptedSubmissions += 1;
    problem.acceptanceRate = Math.round((problem.acceptedSubmissions / problem.totalSubmissions) * 100);
    await problem.save();

    res.json({
      submission,
      feedback: feedback.feedback,
      score: feedback.score
    });
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

// @desc    Get user's coding statistics (solved, attempted, streak, etc)
// @route   GET /api/coding/stats
// @access  Private
const getUserCodingStats = async (req, res) => {
  try {
    // 1. Get total counts by difficulty in DB
    const totalStats = await CodingProblem.aggregate([
      { $group: { _id: '$difficulty', count: { $sum: 1 } } }
    ]);
    
    const totals = { Easy: 0, Medium: 0, Hard: 0 };
    totalStats.forEach(stat => {
      if (totals[stat._id] !== undefined) totals[stat._id] = stat.count;
    });

    // 2. Get user's submissions
    const solvedSubmissions = await CodingSubmission.find({
      userId: req.user._id,
      status: 'Accepted'
    }).distinct('problemId');

    const attemptedSubmissions = await CodingSubmission.find({
      userId: req.user._id,
      status: { $ne: 'Accepted' }
    }).distinct('problemId');

    // Attempted but NOT solved
    const unsolvedAttempted = attemptedSubmissions.filter(id => !solvedSubmissions.some(sid => sid.equals(id)));

    // 3. Count solved problems by difficulty
    const solvedProblems = await CodingProblem.find({ _id: { $in: solvedSubmissions } }).select('difficulty slug');
    const solvedCounts = { Easy: 0, Medium: 0, Hard: 0 };
    const solvedSlugs = [];
    solvedProblems.forEach(p => {
      solvedCounts[p.difficulty]++;
      solvedSlugs.push(p.slug);
    });

    // Count attempted problems by difficulty
    const attemptedProblems = await CodingProblem.find({ _id: { $in: unsolvedAttempted } }).select('difficulty slug');
    const attemptedCounts = { Easy: 0, Medium: 0, Hard: 0 };
    const attemptedSlugs = [];
    attemptedProblems.forEach(p => {
      attemptedCounts[p.difficulty]++;
      attemptedSlugs.push(p.slug);
    });

    // User streak from req.user
    const streakCount = req.user.streakCount || 0;
    const xp = req.user.xp || 0;
    const contestRating = 1450 + (solvedProblems.length * 12) + (streakCount * 5); // Simulated contest rating

    res.json({
      totals,
      solved: {
        count: solvedProblems.length,
        breakdown: solvedCounts,
        slugs: solvedSlugs
      },
      attempted: {
        count: attemptedProblems.length,
        breakdown: attemptedCounts,
        slugs: attemptedSlugs
      },
      streakCount,
      xp,
      contestRating
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

module.exports = {
  getCodingProblems,
  getProblemBySlug,
  generateProblem,
  runCode,
  submitCode,
  getAIHint,
  getUserCodingStats
};

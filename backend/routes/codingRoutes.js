const express = require('express');
const router = express.Router();
const { 
  getCodingProblems, 
  getProblemBySlug, 
  generateProblem, 
  runCode, 
  submitCode, 
  getAIHint,
  getUserCodingStats
} = require('../controllers/codingController');
const { protect } = require('../middleware/authMiddleware');

router.get('/stats', protect, getUserCodingStats);
router.get('/problems', protect, getCodingProblems);
router.get('/problems/:slug', protect, getProblemBySlug);
router.post('/generate', protect, generateProblem);
router.post('/run', protect, runCode);
router.post('/submit', protect, submitCode);
router.post('/hint', protect, getAIHint);

module.exports = router;

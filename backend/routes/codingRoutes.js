const express = require('express');
const router = express.Router();
const { getCodingProblem, runCode, submitCode, getAIHint } = require('../controllers/codingController');
const { protect } = require('../middleware/authMiddleware');

router.get('/problem', protect, getCodingProblem);
router.post('/run', protect, runCode);
router.post('/submit', protect, submitCode);
router.post('/hint', protect, getAIHint);

module.exports = router;

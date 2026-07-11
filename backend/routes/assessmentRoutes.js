const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { getQuestions, submitAssessment } = require('../controllers/assessmentController');

router.get('/:module', protect, getQuestions);
router.post('/submit', protect, submitAssessment);

module.exports = router;

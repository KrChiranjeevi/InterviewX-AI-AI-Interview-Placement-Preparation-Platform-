const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { getQuestions, submitAssessment, getAttemptReport } = require('../controllers/assessmentController');

router.get('/:module', protect, getQuestions);
router.post('/submit', protect, submitAssessment);
router.get('/attempt/:id', protect, getAttemptReport);

module.exports = router;

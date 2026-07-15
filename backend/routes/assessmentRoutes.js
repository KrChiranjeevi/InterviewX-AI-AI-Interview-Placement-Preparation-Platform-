const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { getQuestions, submitAssessment, getAttemptReport, getLatestSummary, getLatestReportForModule, getQuestionCounts } = require('../controllers/assessmentController');

router.get('/attempts/latest-summary', protect, getLatestSummary);
router.get('/attempts/latest/:module', protect, getLatestReportForModule);
router.get('/meta/question-counts', protect, getQuestionCounts);
router.get('/:module', protect, getQuestions);
router.post('/submit', protect, submitAssessment);
router.get('/attempt/:id', protect, getAttemptReport);

module.exports = router;

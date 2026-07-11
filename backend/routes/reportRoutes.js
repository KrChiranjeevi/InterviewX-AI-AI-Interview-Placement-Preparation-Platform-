const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { getReports, getReportByInterviewId } = require('../controllers/reportController');

router.get('/', protect, getReports);
router.get('/:interviewId', protect, getReportByInterviewId);

module.exports = router;

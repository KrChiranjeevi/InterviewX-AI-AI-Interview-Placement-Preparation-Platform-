const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { getReports, getReportByInterviewId, askReportMentor } = require('../controllers/reportController');

router.get('/', protect, getReports);
router.get('/:interviewId', protect, getReportByInterviewId);
router.post('/:reportId/mentor', protect, askReportMentor);

module.exports = router;

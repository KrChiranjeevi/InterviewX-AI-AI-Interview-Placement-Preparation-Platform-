const express = require('express');
const router = express.Router();
const companyPrepController = require('../controllers/companyPrepController');
const { protect } = require('../middleware/authMiddleware');

router.get('/companies', companyPrepController.getCompanies);
router.get('/companies/:companyName', companyPrepController.getCompanyDetails);
router.get('/roles/:roleId/pipeline', companyPrepController.getRolePipeline);

// Protected routes for attempts
router.post('/attempt', protect, companyPrepController.getOrCreateAttempt);
router.post('/attempt/:attemptId/submit', protect, companyPrepController.submitRound);
router.post('/attempt/:attemptId/reset', protect, companyPrepController.resetAttempt);

module.exports = router;

const express = require('express');
const router = express.Router();
const { getCompanies, getCompanyByName, startCompanyInterview } = require('../controllers/companyController');
const { protect } = require('../middleware/authMiddleware');

router.get('/all', protect, getCompanies);
router.get('/:name', protect, getCompanyByName);
router.post('/interview/start', protect, startCompanyInterview);

module.exports = router;

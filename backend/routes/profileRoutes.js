const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { getProfile, updateProfile } = require('../controllers/profileController');

router.route('/').get(protect, getProfile).put(protect, updateProfile);

module.exports = router;

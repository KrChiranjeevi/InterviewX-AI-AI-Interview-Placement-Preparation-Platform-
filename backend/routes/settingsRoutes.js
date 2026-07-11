const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { updateSettings, changePassword } = require('../controllers/settingsController');

router.route('/').put(protect, updateSettings);
router.route('/password').put(protect, changePassword);

module.exports = router;

const express = require('express');
const router = express.Router();
const { registerUser, authUser, googleAuth } = require('../controllers/authController');

router.post('/register', registerUser);
router.post('/login', authUser);
router.post('/google', googleAuth);   // Google OAuth endpoint

module.exports = router;

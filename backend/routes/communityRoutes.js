const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { getPosts, createPost, replyToPost, likePost, getLeaderboard } = require('../controllers/communityController');

router.route('/posts').get(protect, getPosts);
router.route('/post').post(protect, createPost);
router.route('/post/:id/reply').post(protect, replyToPost);
router.route('/post/:id/like').put(protect, likePost);
router.route('/leaderboard').get(protect, getLeaderboard);

module.exports = router;

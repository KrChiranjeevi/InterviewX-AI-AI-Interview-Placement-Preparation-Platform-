const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { getRoadmap, getSavedRoadmaps, createRoadmap, toggleTask, bookmarkRoadmap, compareRoadmaps, askMentor, getTopicDetail } = require('../controllers/roadmapController');

router.get('/', protect, getRoadmap);
router.get('/saved', protect, getSavedRoadmaps);
router.post('/generate', protect, createRoadmap);
router.put('/:id/task', protect, toggleTask);
router.put('/:id/bookmark', protect, bookmarkRoadmap);
router.post('/compare', protect, compareRoadmaps);
router.post('/ask-mentor', protect, askMentor);
router.post('/:id/topic-detail', protect, getTopicDetail);

module.exports = router;

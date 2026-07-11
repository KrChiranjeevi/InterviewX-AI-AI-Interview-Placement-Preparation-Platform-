const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { getRoadmap, createRoadmap, toggleTask } = require('../controllers/roadmapController');

router.get('/', protect, getRoadmap);
router.post('/generate', protect, createRoadmap);
router.put('/:id/task', protect, toggleTask);

module.exports = router;

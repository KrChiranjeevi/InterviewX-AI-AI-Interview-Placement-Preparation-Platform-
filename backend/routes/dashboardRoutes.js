const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');

const User = require('../models/User');
const Interview = require('../models/Interview');

const getDashboardStats = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const interviews = await Interview.find({ userId: req.user._id, status: 'completed' })
                                     .sort({ createdAt: -1 });
    
    const totalInterviews = interviews.length;
    let averageScore = 0;
    let confidenceLevel = 0;
    let chartData = [];
    let recentInterviews = [];

    if (totalInterviews > 0) {
      averageScore = Math.round(interviews.reduce((acc, curr) => acc + (curr.score || 0), 0) / totalInterviews);
      confidenceLevel = Math.round(interviews.reduce((acc, curr) => acc + (curr.confidenceScore || 0), 0) / totalInterviews);
      
      // Chart data: reverse to show chronological order (oldest to newest for the graph)
      chartData = [...interviews].reverse().map(inv => {
        const d = new Date(inv.createdAt);
        return {
          name: `${d.getMonth()+1}/${d.getDate()}`,
          score: inv.score || 0
        };
      });
      // Limit chart data to last 10 for readability
      if (chartData.length > 10) chartData = chartData.slice(chartData.length - 10);

      recentInterviews = interviews.slice(0, 5).map(inv => {
        const d = new Date(inv.createdAt);
        return {
          id: inv._id,
          name: `${inv.role} (${inv.type})`,
          date: `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`,
          score: inv.score || 0,
          status: inv.status
        };
      });
    }

    res.json({
      totalInterviews,
      averageScore,
      confidenceLevel,
      currentGoal: user.interviewGoal || 'Not Set',
      chartData,
      recentInterviews,
      xp: user.xp || 0,
      level: user.level || 1,
      streakCount: user.streakCount || 0
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

router.get('/stats', protect, getDashboardStats);

module.exports = router;

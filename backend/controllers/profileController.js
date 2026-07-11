const User = require('../models/User');
const Report = require('../models/Report');
const Interview = require('../models/Interview');

const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get stats
    const reports = await Report.find({ user: req.user._id });
    const interviews = await Interview.find({ user: req.user._id, status: 'completed' });
    
    let totalInterviews = interviews.length;
    let averageScore = 0;
    
    if (reports.length > 0) {
      const totalScore = reports.reduce((acc, report) => acc + report.overallScore, 0);
      averageScore = Math.round(totalScore / reports.length);
    }
    
    // Simplistic streak calculation: if they have any interviews completed in last 7 days, streak is active
    let currentStreak = 0; // Simplified for now
    
    res.json({
      user,
      stats: {
        totalInterviews,
        averageScore,
        currentStreak
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching profile' });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { name, targetRole, skills, interviewGoal, profileImage } = req.body;
    
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    user.name = name || user.name;
    user.targetRole = targetRole || user.targetRole;
    user.skills = skills || user.skills;
    user.interviewGoal = interviewGoal || user.interviewGoal;
    user.profileImage = profileImage || user.profileImage;
    
    await user.save();
    
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error updating profile' });
  }
};

module.exports = { getProfile, updateProfile };

const Roadmap = require('../models/Roadmap');
const Report = require('../models/Report');
const { generateRoadmap } = require('../services/aiService');

const getRoadmap = async (req, res) => {
  try {
    const roadmap = await Roadmap.findOne({ userId: req.user._id }).sort({ createdAt: -1 });
    if (!roadmap) {
      return res.status(404).json({ message: 'Roadmap not found' });
    }
    res.json(roadmap);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

const createRoadmap = async (req, res) => {
  try {
    const { targetRole } = req.body;
    
    // Fetch user's recent reports to identify weaknesses
    const reports = await Report.find({ userId: req.user._id }).sort({ createdAt: -1 }).limit(3);
    const reportData = reports.map(r => ({
      strengths: r.strengths,
      weakness: r.weakness,
      suggestions: r.suggestions,
      scores: {
        technical: r.technicalScore,
        communication: r.communicationScore
      }
    }));

    const aiRoadmap = await generateRoadmap(targetRole, reportData);
    
    const roadmap = await Roadmap.create({
      userId: req.user._id,
      targetRole,
      weeks: aiRoadmap.weeks || [],
      progress: 0,
    });
    
    res.status(201).json(roadmap);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

const toggleTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { weekIndex, taskIndex } = req.body;
    
    const roadmap = await Roadmap.findOne({ _id: id, userId: req.user._id });
    if (!roadmap) {
      return res.status(404).json({ message: 'Roadmap not found' });
    }
    
    // Toggle completion status
    const isCompleted = roadmap.weeks[weekIndex].tasks[taskIndex].completed;
    roadmap.weeks[weekIndex].tasks[taskIndex].completed = !isCompleted;
    
    // Check if entire week is completed
    const allTasksCompleted = roadmap.weeks[weekIndex].tasks.every(task => task.completed);
    roadmap.weeks[weekIndex].completed = allTasksCompleted;
    
    // Calculate total progress
    let totalTasks = 0;
    let completedTasks = 0;
    roadmap.weeks.forEach(week => {
      week.tasks.forEach(task => {
        totalTasks++;
        if (task.completed) completedTasks++;
      });
    });
    
    roadmap.progress = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);
    
    await roadmap.save();
    res.json(roadmap);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

module.exports = { getRoadmap, createRoadmap, toggleTask };

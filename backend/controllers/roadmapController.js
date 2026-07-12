const Roadmap = require('../models/Roadmap');
const Report = require('../models/Report');
const Resume = require('../models/Resume');
const { generateRoadmap, compareRoadmaps: aiCompareRoadmaps, generateTopicDetail } = require('../services/aiService');

const getRoadmap = async (req, res) => {
  try {
    // Get the active (latest un-saved or just latest) roadmap
    const roadmap = await Roadmap.findOne({ userId: req.user._id }).sort({ createdAt: -1 });
    if (!roadmap) {
      return res.status(404).json({ message: 'Roadmap not found' });
    }
    res.json(roadmap);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

const getSavedRoadmaps = async (req, res) => {
  try {
    const roadmaps = await Roadmap.find({ userId: req.user._id, isSaved: true }).sort({ createdAt: -1 });
    res.json(roadmaps);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

const createRoadmap = async (req, res) => {
  try {
    const { searchQuery } = req.body;
    if (!searchQuery) return res.status(400).json({ message: 'Search query is required' });
    
    // Fetch user context
    const reports = await Report.find({ userId: req.user._id }).sort({ createdAt: -1 }).limit(3);
    const resume = await Resume.findOne({ userId: req.user._id }).sort({ createdAt: -1 });
    
    const userContext = {
      reports: reports.map(r => ({ strengths: r.strengths, weakness: r.weakness, technicalScore: r.technicalScore })),
      resume: resume ? { score: resume.score, missingSkills: resume.missingSkills } : null,
    };

    const aiData = await generateRoadmap(searchQuery, userContext);
    
    const roadmap = await Roadmap.create({
      userId: req.user._id,
      searchQuery: searchQuery,
      type: aiData.type || 'Custom',
      overview: aiData.overview || {},
      companyDetails: aiData.companyDetails || {},
      analytics: aiData.analytics || {},
      recommendations: aiData.recommendations || {},
      modules: aiData.modules || [],
      progress: 0,
      isSaved: false
    });
    
    res.status(201).json(roadmap);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

const toggleTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { moduleIndex, topicIndex, taskIndex, taskType } = req.body;
    // taskType can be 'practiceProblems', 'projects', or 'topic'
    
    const roadmap = await Roadmap.findOne({ _id: id, userId: req.user._id });
    if (!roadmap) return res.status(404).json({ message: 'Roadmap not found' });
    
    const mod = roadmap.modules[moduleIndex];
    if (!mod) return res.status(400).json({ message: 'Module not found' });

    if (taskType === 'practiceProblems') {
      const task = mod.topics[topicIndex].practiceProblems[taskIndex];
      task.isCompleted = !task.isCompleted;
    } else if (taskType === 'projects') {
      const proj = mod.projects[taskIndex];
      proj.isCompleted = !proj.isCompleted;
    } else if (taskType === 'topic') {
      const topic = mod.topics[topicIndex];
      topic.isCompleted = !topic.isCompleted;
    }
    
    // Calculate total progress
    let totalItems = 0;
    let completedItems = 0;
    roadmap.modules.forEach(m => {
      m.topics?.forEach(topic => {
        totalItems++; if(topic.isCompleted) completedItems++;
        topic.practiceProblems?.forEach(p => { totalItems++; if(p.isCompleted) completedItems++; });
      });
      m.projects?.forEach(p => { totalItems++; if(p.isCompleted) completedItems++; });
    });
    
    roadmap.progress = totalItems === 0 ? 0 : Math.round((completedItems / totalItems) * 100);
    await roadmap.save();
    res.json(roadmap);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

const getTopicDetail = async (req, res) => {
  try {
    const { id } = req.params;
    const { moduleIndex, topicIndex } = req.body;

    const roadmap = await Roadmap.findOne({ _id: id, userId: req.user._id });
    if (!roadmap) return res.status(404).json({ message: 'Roadmap not found' });

    const mod = roadmap.modules[moduleIndex];
    if (!mod) return res.status(400).json({ message: 'Module not found' });

    const topic = mod.topics[topicIndex];
    if (!topic) return res.status(400).json({ message: 'Topic not found' });

    // If details are already loaded, just return the existing roadmap
    if (topic.explanation) {
      return res.json(roadmap);
    }

    // Call AI to generate topic details
    const details = await generateTopicDetail(topic.title, roadmap.searchQuery);

    // Save details to the topic in DB
    topic.explanation = details.explanation || 'No explanation available.';
    topic.practiceProblems = details.practiceProblems || [];
    topic.interviewQuestions = details.interviewQuestions || [];
    topic.learningResources = details.learningResources || [];

    await roadmap.save();
    res.json(roadmap);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

const bookmarkRoadmap = async (req, res) => {
  try {
    const roadmap = await Roadmap.findOne({ _id: req.params.id, userId: req.user._id });
    if (!roadmap) return res.status(404).json({ message: 'Roadmap not found' });
    
    roadmap.isSaved = !roadmap.isSaved;
    await roadmap.save();
    res.json(roadmap);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

const compareRoadmaps = async (req, res) => {
  try {
    const { topic1, topic2 } = req.body;
    if (!topic1 || !topic2) return res.status(400).json({ message: 'Both topics are required for comparison' });
    
    const comparisonData = await aiCompareRoadmaps(topic1, topic2);
    res.json(comparisonData);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

const askMentor = async (req, res) => {
  try {
    const { message, history } = req.body;
    const roadmap = await Roadmap.findOne({ userId: req.user._id }).sort({ createdAt: -1 });
    
    const { askMentor: callAiMentor } = require('../services/aiService');
    const reply = await callAiMentor(message, roadmap || { status: 'No roadmap generated yet' }, history);
    
    res.json({ reply });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

module.exports = { getRoadmap, getSavedRoadmaps, createRoadmap, toggleTask, bookmarkRoadmap, compareRoadmaps, askMentor, getTopicDetail };

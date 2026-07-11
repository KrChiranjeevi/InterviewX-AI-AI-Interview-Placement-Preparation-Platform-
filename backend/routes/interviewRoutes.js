const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const Interview = require('../models/Interview');
const { generateQuestion, analyzeAnswer, generateAIReport } = require('../services/aiService');

const createInterview = async (req, res) => {
  const { interviewType, role, difficulty, duration, resumeSkills, resumeText, company, companyContext } = req.body;

  try {
    const interview = await Interview.create({
      userId: req.user._id,
      type: interviewType,
      role,
      company: company || companyContext || '',
      difficulty,
      duration,
      resumeSkills: resumeSkills || [],
      resumeText: resumeText || '',
      status: 'started',
      questions: [],
    });

    res.status(201).json(interview);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

const getRecentInterviews = async (req, res) => {
  try {
    const interviews = await Interview.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(5);
    res.json(interviews);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

const getInterviewById = async (req, res) => {
  try {
    const interview = await Interview.findById(req.params.id);
    if (!interview || interview.userId.toString() !== req.user._id.toString()) {
      return res.status(404).json({ message: 'Interview not found' });
    }
    res.json(interview);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

const getNextQuestion = async (req, res) => {
  try {
    const interview = await Interview.findById(req.params.id);
    if (!interview) return res.status(404).json({ message: 'Interview not found' });

    const questionText = await generateQuestion(
      interview.role, 
      interview.type, 
      interview.difficulty, 
      interview.questions, 
      interview.resumeSkills, 
      interview.resumeText,
      interview.company
    );
    
    res.json({ question: questionText });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

const submitAnswer = async (req, res) => {
  try {
    const { question, answer } = req.body;
    const interview = await Interview.findById(req.params.id);
    if (!interview) return res.status(404).json({ message: 'Interview not found' });

    // Handle skipped or empty answer states explicitly
    if (answer === 'Skipped' || !answer || answer.trim() === '') {
      interview.questions.push({
        question,
        userAnswer: 'Skipped',
        aiFeedback: 'No response was provided.',
        score: 0,
        metrics: {
          technicalKnowledge: 0,
          problemSolving: 0,
          communication: 0,
          confidence: 0,
          accuracy: 0,
          logicalThinking: 0
        }
      });

      const totalScore = interview.questions.reduce((acc, curr) => acc + curr.score, 0);
      interview.score = Math.round((totalScore / interview.questions.length) * 10);
      await interview.save();

      const nextQuestionText = await generateQuestion(
        interview.role,
        interview.type,
        interview.difficulty,
        interview.questions,
        interview.resumeSkills,
        interview.resumeText,
        interview.company
      );

      return res.json({
        isClarification: false,
        feedback: 'No response was provided.',
        score: 0,
        overallScore: interview.score,
        nextQuestion: nextQuestionText
      });
    }

    // Step 1: Analyze user's answer
    const analysis = await analyzeAnswer(question, answer, interview.role, interview.difficulty);
    
    // If user asked a clarifying question, return clarification response directly
    if (analysis.isClarification) {
      return res.json({ 
        isClarification: true, 
        feedback: analysis.feedback 
      });
    }

    // Step 2: Push answer and live evaluation metrics to history
    interview.questions.push({
      question,
      userAnswer: answer,
      aiFeedback: analysis.feedback,
      score: analysis.score,
      metrics: {
        technicalKnowledge: analysis.metrics?.technicalKnowledge || 5,
        problemSolving: analysis.metrics?.problemSolving || 5,
        communication: analysis.metrics?.communication || 5,
        confidence: analysis.metrics?.confidence || 5,
        accuracy: analysis.metrics?.accuracy || 5,
        logicalThinking: analysis.metrics?.logicalThinking || 5
      }
    });

    // Step 3: Adaptive Difficulty logic based on score performance
    const lastScore = analysis.score || 5;
    let nextDifficulty = interview.difficulty;
    if (lastScore >= 8) {
      if (nextDifficulty === 'Beginner') nextDifficulty = 'Intermediate';
      else if (nextDifficulty === 'Intermediate') nextDifficulty = 'Advanced';
    } else if (lastScore <= 5) {
      if (nextDifficulty === 'Advanced') nextDifficulty = 'Intermediate';
      else if (nextDifficulty === 'Intermediate') nextDifficulty = 'Beginner';
    }
    interview.difficulty = nextDifficulty;

    // Step 4: Update overall cumulative score
    const totalScore = interview.questions.reduce((acc, curr) => acc + curr.score, 0);
    interview.score = Math.round((totalScore / interview.questions.length) * 10); // scale 10 to 100

    // Save state
    await interview.save();

    // Step 5: Speculatively generate next question with updated history
    const nextQuestionText = await generateQuestion(
      interview.role,
      interview.type,
      nextDifficulty,
      interview.questions,
      interview.resumeSkills,
      interview.resumeText,
      interview.company
    );
    
    res.json({ 
      isClarification: false, 
      feedback: analysis.feedback, 
      score: analysis.score, 
      overallScore: interview.score,
      nextQuestion: nextQuestionText
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

const finishInterview = async (req, res) => {
  try {
    const { confidenceScore } = req.body;
    const interview = await Interview.findById(req.params.id);
    if (!interview || interview.userId.toString() !== req.user._id.toString()) {
      return res.status(404).json({ message: 'Interview not found' });
    }

    interview.status = 'completed';
    if (confidenceScore !== undefined) {
      interview.confidenceScore = confidenceScore;
    }

    // Generate comprehensive final report from the full transcript
    const summaryFeedback = await generateAIReport(interview);
    interview.feedback = summaryFeedback;

    await interview.save();
    res.json(interview);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

router.post('/create', protect, createInterview);
router.get('/recent', protect, getRecentInterviews);
router.get('/:id', protect, getInterviewById);
router.post('/:id/question', protect, getNextQuestion);
router.post('/:id/answer', protect, submitAnswer);
router.put('/:id/finish', protect, finishInterview);

module.exports = router;

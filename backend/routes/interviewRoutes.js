const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const Interview = require('../models/Interview');
const Report = require('../models/Report');
const { generateQuestion, analyzeAnswer, generateAIReport, generateConversationalResponse, generateMockEvidenceReport } = require('../services/aiService');

const createInterview = async (req, res) => {
  const { interviewType, role, difficulty, duration, resumeSkills, resumeText, company, companyContext, domain, subLanguage, projectName, projectDescription } = req.body;

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
      domain: domain || '',
      subLanguage: subLanguage || '',
      projectName: projectName || '',
      projectDescription: projectDescription || '',
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
      interview.company,
      interview.domain,
      interview.subLanguage,
      interview.projectName,
      interview.projectDescription
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
        interview.company,
        interview.domain,
        interview.subLanguage,
        interview.projectName,
        interview.projectDescription
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
      },
      speechStats: {
        speakingSpeed: analysis.speechStats?.speakingSpeed || 120,
        fillerWordsCount: analysis.speechStats?.fillerWordsCount || 0,
        eyeContactScore: analysis.speechStats?.eyeContactScore || 85,
        voiceClarity: analysis.speechStats?.voiceClarity || 90,
        grammarScore: analysis.speechStats?.grammarScore || 90
      },
      bookmarked: req.body.bookmarked || false
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
      interview.company,
      interview.domain,
      interview.subLanguage,
      interview.projectName,
      interview.projectDescription
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

    // Award XP and update streak for user
    try {
      const User = require('../models/User');
      const user = await User.findById(req.user._id);
      if (user) {
        user.xp = (user.xp || 0) + 150; // award 150 XP
        const newLevel = Math.floor(user.xp / 500) + 1;
        if (newLevel > (user.level || 1)) {
          user.level = newLevel;
        }
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (user.lastActiveDate) {
          const lastActive = new Date(user.lastActiveDate);
          lastActive.setHours(0, 0, 0, 0);
          const diffDays = Math.round((today - lastActive) / (1000 * 60 * 60 * 24));
          if (diffDays === 1) {
            user.streakCount = (user.streakCount || 0) + 1;
          } else if (diffDays > 1) {
            user.streakCount = 1;
          }
        } else {
          user.streakCount = 1;
        }
        user.lastActiveDate = new Date();
        await user.save();
      }
    } catch (err) {
      console.error('Error awarding XP:', err);
    }

    res.json(interview);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

const bookmarkQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    const { questionIndex, bookmarked } = req.body;
    const interview = await Interview.findById(id);
    if (!interview || interview.userId.toString() !== req.user._id.toString()) {
      return res.status(404).json({ message: 'Interview not found' });
    }

    if (interview.questions[questionIndex]) {
      interview.questions[questionIndex].bookmarked = bookmarked;
      await interview.save();
      return res.json({ success: true, bookmarked: interview.questions[questionIndex].bookmarked });
    } else {
      return res.status(404).json({ message: 'Question not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

const getConversationalResponse = async (req, res) => {
  try {
    const interview = await Interview.findById(req.params.id);
    if (!interview) return res.status(404).json({ message: 'Interview not found' });

    const {
      userAnswer,
      questionAsked,
      conversationHistory,
      questionNumber,
      interviewStage
    } = req.body;

    // Get the last question's evaluation from interview.questions if available
    let lastEvaluation = null;
    if (interview.questions && interview.questions.length > 0) {
      const lastQ = interview.questions[interview.questions.length - 1];
      lastEvaluation = {
        score: lastQ.score,
        metrics: lastQ.metrics,
        speechStats: lastQ.speechStats
      };
    }

    // Initialize or load adaptive state
    let adaptiveState = interview.adaptiveState || {
      knowledgeScore: 50,
      confidenceScore: 50,
      communicationScore: 50,
      technicalScore: 50,
      domainScore: 50,
      overallScore: 50,
      difficultyLevel: interview.difficulty || 'Medium',
      knowledgeGraph: {},
      mistakes: [],
      notes: [],
      historyTopics: []
    };

    const result = await generateConversationalResponse({
      userAnswer,
      questionAsked,
      conversationHistory: conversationHistory || [],
      role: interview.role,
      type: interview.type,
      domain: interview.domain || '',
      subLanguage: interview.subLanguage || '',
      projectName: interview.projectName || '',
      projectDescription: interview.projectDescription || '',
      difficulty: interview.difficulty || 'Intermediate',
      questionNumber: questionNumber || 1,
      interviewStage: interviewStage || 'core',
      adaptiveState,
      lastEvaluation,
      duration: interview.duration
    });

    // Save updated adaptive state back to the interview document
    interview.adaptiveState = result.adaptiveState || adaptiveState;
    await interview.save();

    res.json(result);
  } catch (error) {
    console.error('getConversationalResponse error:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

const getMockReport = async (req, res) => {
  try {
    const interview = await Interview.findById(req.params.id);
    if (!interview) {
      return res.status(404).json({ message: 'Interview not found' });
    }

    if (interview.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to access this interview' });
    }

    // Check if report already exists in DB
    let reportDoc = await Report.findOne({ interviewId: interview._id, userId: req.user._id });
    if (reportDoc && reportDoc.mockReport) {
      const mockData = reportDoc.mockReport.toObject ? reportDoc.mockReport.toObject() : reportDoc.mockReport;
      return res.json({ ...mockData, _id: reportDoc._id });
    }

    // If not, generate new report using AI
    const reportData = await generateMockEvidenceReport(interview);

    // Save report document to DB so that it shows up in dashboard and is stored persistently
    const technical = reportData.scoringBreakdown?.find(c => c.category?.toLowerCase() === 'technical')?.score;
    const communication = reportData.scoringBreakdown?.find(c => c.category?.toLowerCase() === 'communication')?.score;
    const confidence = reportData.scoringBreakdown?.find(c => c.category?.toLowerCase() === 'confidence')?.score;
    const problemSolving = reportData.scoringBreakdown?.find(c => c.category?.toLowerCase() === 'problem solving')?.score;

    if (reportDoc) {
      reportDoc.overallScore = reportData.overallScore || 0;
      reportDoc.technicalScore = typeof technical === 'number' ? technical : 0;
      reportDoc.communicationScore = typeof communication === 'number' ? communication : 0;
      reportDoc.confidenceScore = typeof confidence === 'number' ? confidence : 0;
      reportDoc.problemSolvingScore = typeof problemSolving === 'number' ? problemSolving : 0;
      reportDoc.hiringDecision = reportData.finalDecision || 'Needs Improvement';
      reportDoc.mockReport = { ...reportData, adaptiveState: interview.adaptiveState };
      await reportDoc.save();
    } else {
      reportDoc = await Report.create({
        userId: req.user._id,
        interviewId: interview._id,
        overallScore: reportData.overallScore || 0,
        technicalScore: typeof technical === 'number' ? technical : 0,
        communicationScore: typeof communication === 'number' ? communication : 0,
        confidenceScore: typeof confidence === 'number' ? confidence : 0,
        problemSolvingScore: typeof problemSolving === 'number' ? problemSolving : 0,
        hiringDecision: reportData.finalDecision || 'Needs Improvement',
        mockReport: { ...reportData, adaptiveState: interview.adaptiveState }
      });
    }

    res.json({ ...reportData, _id: reportDoc._id, adaptiveState: interview.adaptiveState });
  } catch (error) {
    console.error('getMockReport error:', error);
    res.status(500).json({ message: 'Failed to generate mock report', error: error.message });
  }
};

router.post('/create', protect, createInterview);
router.get('/recent', protect, getRecentInterviews);
router.get('/:id', protect, getInterviewById);
router.post('/:id/question', protect, getNextQuestion);
router.post('/:id/answer', protect, submitAnswer);
router.post('/:id/conversational-response', protect, getConversationalResponse);
router.post('/:id/mock-report', protect, getMockReport);
router.put('/:id/finish', protect, finishInterview);
router.put('/:id/bookmark', protect, bookmarkQuestion);

module.exports = router;
